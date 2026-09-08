import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class NotificationType(str, enum.Enum):
    RESERVATION_CONFIRMED = "RESERVATION_CONFIRMED"
    PICKUP_REMINDER = "PICKUP_REMINDER"
    RESERVATION_EXPIRED = "RESERVATION_EXPIRED"
    LISTING_ALMOST_EXPIRED = "LISTING_ALMOST_EXPIRED"
    NEW_NEARBY_FOOD = "NEW_NEARBY_FOOD"
    PROVIDER_INVENTORY_UPDATE = "PROVIDER_INVENTORY_UPDATE"
    SYSTEM_ALERT = "SYSTEM_ALERT"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(Enum(NotificationType), default=NotificationType.SYSTEM_ALERT, nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    metadata_json = Column(Text, nullable=True) # JSON string for additional context
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="notifications")
