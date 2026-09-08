from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    business_name = Column(String(255), nullable=False, index=True)
    business_type = Column(String(100), default="Restaurant") # Restaurant, Bakery, Supermarket, Cafeteria
    description = Column(Text, nullable=True)
    fssai_license = Column(String(100), nullable=True)
    address = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="provider_profile")
    listings = relationship("FoodListing", back_populates="provider", cascade="all, delete-orphan")
    surplus_history = relationship("SurplusHistory", back_populates="provider", cascade="all, delete-orphan")
