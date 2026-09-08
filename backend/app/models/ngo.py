from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class NGO(Base):
    __tablename__ = "ngos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    org_name = Column(String(255), nullable=False, index=True)
    registration_number = Column(String(100), nullable=True)
    contact_person = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    daily_meal_capacity = Column(Integer, default=100, nullable=False)
    preferred_categories = Column(String(255), default="MEALS,BAKERY,GROCERY")
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="ngo_profile")
