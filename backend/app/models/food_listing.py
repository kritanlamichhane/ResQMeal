import enum
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Enum, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class ListingType(str, enum.Enum):
    SALE = "SALE"
    DONATION = "DONATION"

class ListingStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    SOLD_OUT = "SOLD_OUT"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"

class FoodCategory(str, enum.Enum):
    MEALS = "MEALS"
    BAKERY = "BAKERY"
    GROCERY = "GROCERY"
    PRODUCE = "PRODUCE"
    SNACKS = "SNACKS"
    DAIRY = "DAIRY"
    BEVERAGES = "BEVERAGES"

class FoodListing(Base):
    __tablename__ = "food_listings"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(Enum(FoodCategory), default=FoodCategory.MEALS, nullable=False, index=True)
    
    quantity = Column(Integer, nullable=False)
    remaining_quantity = Column(Integer, nullable=False, index=True)
    unit = Column(String(50), default="portions", nullable=False)
    
    original_price = Column(Float, nullable=False)
    surplus_price = Column(Float, nullable=False) # 0.0 for DONATION
    listing_type = Column(Enum(ListingType), default=ListingType.SALE, nullable=False, index=True)
    
    image_url = Column(String(500), nullable=True)
    is_vegetarian = Column(Boolean, default=True, nullable=False)
    
    # Food safety timestamps
    preparation_time = Column(DateTime(timezone=True), nullable=True)
    expiry_time = Column(DateTime(timezone=True), nullable=False, index=True)
    pickup_start_time = Column(DateTime(timezone=True), nullable=False)
    pickup_end_time = Column(DateTime(timezone=True), nullable=False, index=True)
    
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    
    status = Column(Enum(ListingStatus), default=ListingStatus.ACTIVE, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    provider = relationship("Provider", back_populates="listings")
    reservations = relationship("Reservation", back_populates="listing", cascade="all, delete-orphan")
