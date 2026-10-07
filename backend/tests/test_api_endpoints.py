"""
Integration Tests for Core API Endpoints
=========================================
Tests Authentication, Dietary Filtered Listings, and In-App Notifications.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
from app.core.database import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.models.provider import Provider
from app.models.food_listing import FoodListing, ListingStatus, ListingType, FoodCategory
from app.models.notification import Notification, NotificationType
from datetime import datetime, timedelta

client = TestClient(app)

@pytest.fixture(scope="module")
def api_test_data():
    import time
    ts = int(time.time() * 1000)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    now = datetime.utcnow()

    # Create test provider & listings
    provider_user = User(
        email=f"api_test_provider_{ts}@test.com",
        hashed_password="dummy_password_hash",
        full_name="API Test Chef",
        role=UserRole.PROVIDER
    )
    db.add(provider_user)
    db.flush()

    provider = Provider(
        user_id=provider_user.id,
        business_name="API Kitchen",
        address="Koramangala",
        city="Bangalore",
        latitude=12.9352,
        longitude=77.6245
    )
    db.add(provider)
    db.flush()

    # 1 Veg and 1 Non-Veg listing
    veg_item = FoodListing(
        provider_id=provider.id,
        title="API Veg Thali",
        category=FoodCategory.MEALS,
        quantity=5,
        remaining_quantity=5,
        unit="meals",
        original_price=150.0,
        surplus_price=60.0,
        listing_type=ListingType.SALE,
        is_vegetarian=True,
        expiry_time=now + timedelta(hours=4),
        pickup_start_time=now,
        pickup_end_time=now + timedelta(hours=2),
        latitude=12.9352,
        longitude=77.6245,
        status=ListingStatus.ACTIVE
    )
    non_veg_item = FoodListing(
        provider_id=provider.id,
        title="API Chicken Dum Biryani",
        category=FoodCategory.MEALS,
        quantity=5,
        remaining_quantity=5,
        unit="portions",
        original_price=220.0,
        surplus_price=90.0,
        listing_type=ListingType.SALE,
        is_vegetarian=False,
        expiry_time=now + timedelta(hours=4),
        pickup_start_time=now,
        pickup_end_time=now + timedelta(hours=2),
        latitude=12.9352,
        longitude=77.6245,
        status=ListingStatus.ACTIVE
    )
    db.add_all([veg_item, non_veg_item])

    # Consumer user for notifications
    consumer_user = User(
        email=f"api_test_consumer_{ts}@test.com",
        hashed_password="dummy_password_hash",
        full_name="API Consumer",
        role=UserRole.CONSUMER
    )
    db.add(consumer_user)
    db.flush()

    notif = Notification(
        user_id=consumer_user.id,
        type=NotificationType.SYSTEM_ALERT,
        title="Test Notification",
        message="This is a test notification message",
        is_read=False
    )
    db.add(notif)
    db.commit()

    consumer_token = create_access_token(consumer_user.id, role=consumer_user.role.value)
    yield consumer_token, notif.id
    db.close()

def test_health_check_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_listings_dietary_filtering(api_test_data):
    # Test veg filtering
    res_veg = client.get("/api/v1/listings?is_vegetarian=true")
    assert res_veg.status_code == 200
    items_veg = res_veg.json()["items"]
    assert all(item["is_vegetarian"] is True for item in items_veg)

    # Test non-veg filtering
    res_non_veg = client.get("/api/v1/listings?is_vegetarian=false")
    assert res_non_veg.status_code == 200
    items_non_veg = res_non_veg.json()["items"]
    assert all(item["is_vegetarian"] is False for item in items_non_veg)

def test_notifications_flow(api_test_data):
    consumer_token, notif_id = api_test_data
    headers = {"Authorization": f"Bearer {consumer_token}"}

    # 1. Fetch notifications
    res = client.get("/api/v1/notifications", headers=headers)
    assert res.status_code == 200
    notifications = res.json()
    assert len(notifications) >= 1
    assert any(n["id"] == notif_id for n in notifications)

    # 2. Mark single notification as read
    patch_res = client.patch(f"/api/v1/notifications/{notif_id}/read", headers=headers)
    assert patch_res.status_code == 200

    # 3. Mark all as read
    read_all_res = client.post("/api/v1/notifications/read-all", headers=headers)
    assert read_all_res.status_code == 200

    # 4. Check unread count is 0
    unread_res = client.get("/api/v1/notifications/unread-count", headers=headers)
    assert unread_res.status_code == 200
    assert unread_res.json()["unread_count"] == 0
