from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.food_listing import ListingType, ListingStatus, FoodCategory

class FoodListingBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    category: FoodCategory = FoodCategory.MEALS
    quantity: int = Field(..., gt=0)
    unit: str = "portions"
    original_price: float = Field(..., ge=0.0)
    surplus_price: float = Field(..., ge=0.0)
    listing_type: ListingType = ListingType.SALE
    image_url: Optional[str] = None
    is_vegetarian: bool = True
    
    preparation_time: Optional[datetime] = None
    expiry_time: datetime
    pickup_start_time: datetime
    pickup_end_time: datetime
    
    latitude: float
    longitude: float

class FoodListingCreate(FoodListingBase):
    pass

class FoodListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[FoodCategory] = None
    quantity: Optional[int] = None
    remaining_quantity: Optional[int] = None
    original_price: Optional[float] = None
    surplus_price: Optional[float] = None
    listing_type: Optional[ListingType] = None
    image_url: Optional[str] = None
    is_vegetarian: Optional[bool] = None
    pickup_start_time: Optional[datetime] = None
    pickup_end_time: Optional[datetime] = None
    status: Optional[ListingStatus] = None

from pydantic import ConfigDict

class ProviderSummary(BaseModel):
    id: int
    business_name: str
    business_type: str
    address: str
    city: str
    latitude: float
    longitude: float

    model_config = ConfigDict(from_attributes=True)

class FoodListingResponse(FoodListingBase):
    id: int
    provider_id: int
    remaining_quantity: int
    status: ListingStatus
    created_at: datetime
    updated_at: datetime
    provider: Optional[ProviderSummary] = None
    distance_km: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

class PaginatedListingsResponse(BaseModel):
    items: List[FoodListingResponse]
    total: int
    page: int
    size: int
    pages: int
