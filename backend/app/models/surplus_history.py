from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class SurplusHistory(Base):
    __tablename__ = "surplus_history"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False)
    date = Column(Date, nullable=False, index=True)
    day_of_week = Column(Integer, nullable=False) # 0 = Monday, 6 = Sunday
    month = Column(Integer, nullable=False)
    quantity_produced = Column(Integer, nullable=False)
    quantity_sold = Column(Integer, nullable=False)
    quantity_wasted = Column(Integer, nullable=False)
    original_price = Column(Float, nullable=False)
    is_holiday = Column(Boolean, default=False, nullable=False)
    weather_condition = Column(String(50), default="Clear") # Clear, Rain, Cloudy, Storm
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    provider = relationship("Provider", back_populates="surplus_history")
