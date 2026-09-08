from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class ImpactLog(Base):
    __tablename__ = "impact_logs"

    id = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id", ondelete="CASCADE"), unique=True, nullable=False)
    meals_rescued = Column(Integer, nullable=False)
    weight_kg = Column(Float, nullable=False) # e.g. 0.45 kg per meal
    co2_prevented_kg = Column(Float, nullable=False) # approx 2.5 kg CO2e per kg food waste
    money_saved_consumer = Column(Float, nullable=False)
    money_recovered_provider = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    reservation = relationship("Reservation", back_populates="impact_log")
