from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.reservation import Reservation, ReservationStatus
from app.models.food_listing import FoodListing
from app.models.user import User, UserRole
from app.models.provider import Provider
from app.schemas.reservation import (
    ReservationCreate, ReservationResponse,
    PickupConfirmationRequest, CancellationRequest
)
from app.api.deps import get_current_user, get_current_provider, require_roles, rate_limiter
from app.services.reservation_service import ReservationService
from app.api.v1.listings import _format_listing_response

router = APIRouter()

def _format_reservation_response(res: Reservation) -> ReservationResponse:
    listing_resp = _format_listing_response(res.listing) if res.listing else None
    return ReservationResponse(
        id=res.id,
        listing_id=res.listing_id,
        user_id=res.user_id,
        quantity=res.quantity,
        unit_price=res.unit_price,
        total_price=res.total_price,
        status=res.status,
        pickup_code=res.pickup_code,
        expires_at=res.expires_at,
        cancellation_reason=res.cancellation_reason,
        created_at=res.created_at,
        listing=listing_resp
    )

@router.post("", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(rate_limiter(limit=30, window_seconds=60))])
def create_reservation(
    data: ReservationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Atomic, concurrency-safe food reservation.
    Protects against race conditions and over-allocation.
    """
    reservation = ReservationService.create_reservation(
        db=db,
        user_id=current_user.id,
        listing_id=data.listing_id,
        quantity=data.quantity
    )
    return _format_reservation_response(reservation)

@router.get("/my", response_model=List[ReservationResponse])
def get_my_reservations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reservations = (
        db.query(Reservation)
        .filter(Reservation.user_id == current_user.id)
        .order_by(Reservation.created_at.desc())
        .all()
    )
    return [_format_reservation_response(r) for r in reservations]

@router.get("/{reservation_id}", response_model=ReservationResponse)
def get_reservation_detail(
    reservation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    res = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found.")
    
    # Allow reservation owner, provider of the listing, or admin
    is_owner = res.user_id == current_user.id
    is_provider = current_user.provider_profile and res.listing.provider_id == current_user.provider_profile.id
    if not (is_owner or is_provider or current_user.role == UserRole.ADMIN):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this reservation.")

    return _format_reservation_response(res)

@router.post("/{reservation_id}/cancel", response_model=ReservationResponse)
def cancel_reservation(
    reservation_id: int,
    data: CancellationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reservation = ReservationService.cancel_reservation(
        db=db,
        reservation_id=reservation_id,
        user_id=current_user.id,
        reason=data.reason or "User cancelled"
    )
    return _format_reservation_response(reservation)

@router.post("/confirm-pickup", response_model=ReservationResponse)
def confirm_pickup(
    data: PickupConfirmationRequest,
    provider: Provider = Depends(get_current_provider),
    db: Session = Depends(get_db)
):
    """
    Called by Provider at the physical counter to authenticate customer pickup code and finalize order.
    """
    reservation = ReservationService.confirm_pickup(
        db=db,
        pickup_code=data.pickup_code.strip().upper(),
        provider_id=provider.id
    )
    return _format_reservation_response(reservation)

@router.get("/provider/active", response_model=List[ReservationResponse])
def get_provider_active_reservations(
    provider: Provider = Depends(get_current_provider),
    db: Session = Depends(get_db)
):
    reservations = (
        db.query(Reservation)
        .join(FoodListing, Reservation.listing_id == FoodListing.id)
        .filter(FoodListing.provider_id == provider.id)
        .order_by(Reservation.created_at.desc())
        .all()
    )
    return [_format_reservation_response(r) for r in reservations]
