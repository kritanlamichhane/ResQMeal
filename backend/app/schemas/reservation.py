from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.reservation import ReservationStatus
from app.schemas.listing import FoodListingResponse

class ReservationCreate(BaseModel):
    listing_id: int
    quantity: int = Field(..., gt=0)

class ReservationResponse(BaseModel):
    id: int
    listing_id: int
    user_id: int
    quantity: int
    unit_price: float
    total_price: float
    status: ReservationStatus
    pickup_code: str
    expires_at: datetime
    cancellation_reason: Optional[str] = None
    created_at: datetime
    listing: Optional[FoodListingResponse] = None

    class Config:
        from_attributes = True

class PickupConfirmationRequest(BaseModel):
    pickup_code: str

class CancellationRequest(BaseModel):
    reason: Optional[str] = "User requested cancellation"
