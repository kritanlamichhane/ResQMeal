import secrets
import string
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import update, case, select
from app.models.food_listing import FoodListing, ListingStatus
from app.models.reservation import Reservation, ReservationStatus
from app.models.provider import Provider
from app.models.impact_log import ImpactLog
from app.services.notification_service import NotificationService
from app.core.redis_cache import cache_service
from app.core.config import settings

def generate_pickup_code() -> str:
    """Generates an unambiguous readable pickup voucher code e.g. RSQ-8H3K2."""
    alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ" # Exclude confusing 0, 1, O, I
    token = "".join(secrets.choice(alphabet) for _ in range(5))
    return f"RSQ-{token}"

class ReservationService:
    @staticmethod
    def create_reservation(
        db: Session,
        user_id: int,
        listing_id: int,
        quantity: int
    ) -> Reservation:
        if quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity must be greater than zero."
            )

        # 1. Acquire short-lived non-blocking mutex lock via in-memory cache layer
        lock_name = f"reserve_listing_{listing_id}"
        acquired = cache_service.acquire_lock(lock_name, timeout_seconds=3)
        # Note: If lock isn't acquired immediately, atomic DB condition below remains the primary source of truth.

        try:
            # 2. Concurrency-Safe Atomic SQL Conditional Update
            # Guaranteed by database engine ACID transaction: only decrements IF remaining_quantity >= requested quantity
            stmt = (
                update(FoodListing)
                .where(FoodListing.id == listing_id)
                .where(FoodListing.remaining_quantity >= quantity)
                .where(FoodListing.status == ListingStatus.ACTIVE)
                .values(
                    remaining_quantity=FoodListing.remaining_quantity - quantity,
                    status=case(
                        (FoodListing.remaining_quantity - quantity == 0, ListingStatus.SOLD_OUT),
                        else_=ListingStatus.ACTIVE
                    )
                )
            )
            result = db.execute(stmt)

            if result.rowcount == 0:
                # Determine precise cause for 409 conflict
                listing = db.query(FoodListing).filter(FoodListing.id == listing_id).first()
                if not listing:
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
                if listing.status != ListingStatus.ACTIVE:
                    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Listing is no longer active ({listing.status}).")
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Insufficient inventory remaining. Only {listing.remaining_quantity} item(s) available."
                )

            # Fetch updated listing for pricing and provider details
            listing = db.query(FoodListing).filter(FoodListing.id == listing_id).first()
            unit_price = listing.surplus_price
            total_price = round(unit_price * quantity, 2)
            
            # Compute expiration: 30 minutes from now or pickup end time, whichever is earlier
            now = datetime.utcnow()
            default_expires = now + timedelta(minutes=settings.DEFAULT_RESERVATION_EXPIRY_MINUTES)
            expires_at = min(default_expires, listing.pickup_end_time.replace(tzinfo=None) if listing.pickup_end_time.tzinfo else listing.pickup_end_time)

            pickup_code = generate_pickup_code()

            reservation = Reservation(
                listing_id=listing_id,
                user_id=user_id,
                quantity=quantity,
                unit_price=unit_price,
                total_price=total_price,
                status=ReservationStatus.CONFIRMED,
                pickup_code=pickup_code,
                expires_at=expires_at
            )
            db.add(reservation)
            db.commit()
            db.refresh(reservation)

            # 3. Trigger In-App Notifications
            NotificationService.notify_reservation_confirmed(db, user_id, listing.title, pickup_code)
            
            # Get provider's user_id for notification
            provider = db.query(Provider).filter(Provider.id == listing.provider_id).first()
            if provider:
                NotificationService.notify_provider_new_reservation(db, provider.user_id, listing.title, quantity)

            return reservation

        finally:
            if acquired:
                cache_service.release_lock(lock_name)

    @staticmethod
    def cancel_reservation(db: Session, reservation_id: int, user_id: int, reason: str = "User cancelled") -> Reservation:
        reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
        if not reservation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found.")
        
        if reservation.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to cancel this reservation.")

        if reservation.status not in (ReservationStatus.PENDING, ReservationStatus.CONFIRMED, ReservationStatus.READY_FOR_PICKUP):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot cancel reservation in '{reservation.status}' state.")

        # Update reservation status
        reservation.status = ReservationStatus.CANCELLED
        reservation.cancellation_reason = reason
        
        # Atomically restore inventory to listing
        listing_stmt = (
            update(FoodListing)
            .where(FoodListing.id == reservation.listing_id)
            .values(
                remaining_quantity=FoodListing.remaining_quantity + reservation.quantity,
                status=case(
                    (FoodListing.status == ListingStatus.SOLD_OUT, ListingStatus.ACTIVE),
                    else_=FoodListing.status
                )
            )
        )
        db.execute(listing_stmt)
        db.commit()
        db.refresh(reservation)

        listing = db.query(FoodListing).filter(FoodListing.id == reservation.listing_id).first()
        listing_title = listing.title if listing else "Food Listing"
        NotificationService.notify_reservation_cancelled(db, user_id, listing_title)

        return reservation

    @staticmethod
    def confirm_pickup(db: Session, pickup_code: str, provider_id: int) -> Reservation:
        """
        Provider verifies customer's pickup code at counter and completes the pickup.
        """
        reservation = (
            db.query(Reservation)
            .join(FoodListing, Reservation.listing_id == FoodListing.id)
            .filter(Reservation.pickup_code == pickup_code)
            .filter(FoodListing.provider_id == provider_id)
            .first()
        )
        if not reservation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid pickup code for this provider."
            )

        if reservation.status == ReservationStatus.COMPLETED:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reservation has already been picked up.")

        if reservation.status in (ReservationStatus.CANCELLED, ReservationStatus.EXPIRED):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Reservation is {reservation.status} and cannot be picked up.")

        reservation.status = ReservationStatus.COMPLETED
        
        # Create Impact Log for platform analytics
        listing = reservation.listing
        meals = reservation.quantity
        weight_kg = round(meals * 0.45, 2)
        co2_kg = round(weight_kg * 2.5, 2)
        money_saved = round((listing.original_price - reservation.unit_price) * meals, 2)
        money_recovered = round(reservation.total_price, 2)

        impact = ImpactLog(
            reservation_id=reservation.id,
            meals_rescued=meals,
            weight_kg=weight_kg,
            co2_prevented_kg=co2_kg,
            money_saved_consumer=max(0.0, money_saved),
            money_recovered_provider=money_recovered
        )
        db.add(impact)
        db.commit()
        db.refresh(reservation)

        return reservation
