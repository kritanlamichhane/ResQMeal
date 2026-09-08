import time
import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.core.redis_cache import cache_service
from app.models.user import User, UserRole
from app.models.food_listing import FoodListing
from app.models.reservation import Reservation
from app.api.deps import require_roles
from app.services.expiration_service import ExpirationService

router = APIRouter()

@router.get("/users", dependencies=[Depends(require_roles([UserRole.ADMIN]))])
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at.desc()).limit(100).all()
    return [{
        "id": u.id,
        "email": u.email,
        "full_name": u.full_name,
        "role": u.role.value,
        "is_active": u.is_active,
        "created_at": u.created_at
    } for u in users]

@router.get("/system-health")
def system_health_check(db: Session = Depends(get_db)):
    """
    Observability endpoint: Checks database connectivity, cache layer, and process info.
    """
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    redis_live = cache_service.is_live_redis()

    return {
        "status": "UP" if db_status == "healthy" else "DEGRADED",
        "timestamp": time.time(),
        "database": {
            "status": db_status,
            "engine": db.bind.name if db.bind else "unknown"
        },
        "cache": {
            "type": "Redis (Live Cluster)" if redis_live else "Thread-Safe Memory Fallback (Zero-Docker mode)",
            "live_redis": redis_live
        },
        "process": {
            "pid": os.getpid()
        }
    }

@router.post("/run-expiration", dependencies=[Depends(require_roles([UserRole.ADMIN]))])
def trigger_reservation_expiration(db: Session = Depends(get_db)):
    """
    Manually triggers the background worker loop that releases expired reservation inventory.
    """
    stats = ExpirationService.process_expired_reservations_and_listings(db)
    return {
        "message": "Expiration worker completed successfully.",
        "stats": stats
    }
