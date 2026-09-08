import json
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationType

class NotificationService:
    @staticmethod
    def create_notification(
        db: Session,
        user_id: int,
        notification_type: NotificationType,
        title: str,
        message: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Notification:
        meta_str = json.dumps(metadata) if metadata else None
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            metadata_json=meta_str,
            is_read=False
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        # Extensible: In production, trigger email/SMS dispatch worker here
        return notification

    @staticmethod
    def notify_reservation_confirmed(db: Session, user_id: int, listing_title: str, pickup_code: str):
        title = "Reservation Confirmed! 🎉"
        message = f"Your reservation for '{listing_title}' is confirmed. Show pickup code {pickup_code} at collection."
        return NotificationService.create_notification(
            db, user_id, NotificationType.RESERVATION_CONFIRMED, title, message,
            {"pickup_code": pickup_code, "listing_title": listing_title}
        )

    @staticmethod
    def notify_provider_new_reservation(db: Session, provider_user_id: int, listing_title: str, quantity: int):
        title = "New Food Reservation 📦"
        message = f"{quantity} portions of '{listing_title}' have just been reserved."
        return NotificationService.create_notification(
            db, provider_user_id, NotificationType.PROVIDER_INVENTORY_UPDATE, title, message,
            {"listing_title": listing_title, "quantity": quantity}
        )

    @staticmethod
    def notify_reservation_cancelled(db: Session, user_id: int, listing_title: str):
        title = "Reservation Cancelled"
        message = f"Your reservation for '{listing_title}' has been cancelled and inventory released."
        return NotificationService.create_notification(
            db, user_id, NotificationType.SYSTEM_ALERT, title, message
        )

    @staticmethod
    def notify_reservation_expired(db: Session, user_id: int, listing_title: str):
        title = "Reservation Expired ⏰"
        message = f"Your reservation for '{listing_title}' was not collected in time and has expired."
        return NotificationService.create_notification(
            db, user_id, NotificationType.RESERVATION_EXPIRED, title, message
        )
