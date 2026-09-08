from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import update, case
from app.models.reservation import Reservation, ReservationStatus
from app.models.food_listing import FoodListing, ListingStatus
from app.services.notification_service import NotificationService

class ExpirationService:
    @staticmethod
    def process_expired_reservations_and_listings(db: Session) -> dict:
        """
        Scans for expired reservations and active listings that have passed their pickup window.
        Returns a summary of processed entities.
        """
        now = datetime.utcnow()
        stats = {"expired_reservations": 0, "restored_units": 0, "expired_listings": 0}

        # 1. Expire uncollected reservations
        expired_reservations = (
            db.query(Reservation)
            .filter(
                Reservation.status.in_([ReservationStatus.PENDING, ReservationStatus.CONFIRMED, ReservationStatus.READY_FOR_PICKUP]),
                Reservation.expires_at <= now
            )
            .all()
        )

        for res in expired_reservations:
            res.status = ReservationStatus.EXPIRED
            stats["expired_reservations"] += 1
            stats["restored_units"] += res.quantity

            # Check if associated listing is still valid before restoring quantity
            listing = db.query(FoodListing).filter(FoodListing.id == res.listing_id).first()
            if listing:
                listing_end = listing.pickup_end_time.replace(tzinfo=None) if listing.pickup_end_time.tzinfo else listing.pickup_end_time
                if listing_end > now and listing.status in (ListingStatus.ACTIVE, ListingStatus.SOLD_OUT):
                    listing.remaining_quantity += res.quantity
                    listing.status = ListingStatus.ACTIVE
                
                NotificationService.notify_reservation_expired(db, res.user_id, listing.title)

        # 2. Expire listings whose pickup end time has elapsed
        active_listings = (
            db.query(FoodListing)
            .filter(
                FoodListing.status.in_([ListingStatus.ACTIVE, ListingStatus.SOLD_OUT]),
                FoodListing.pickup_end_time <= now
            )
            .all()
        )

        for l in active_listings:
            l.status = ListingStatus.EXPIRED
            stats["expired_listings"] += 1

        db.commit()
        return stats
