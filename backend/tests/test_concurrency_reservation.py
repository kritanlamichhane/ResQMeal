"""
Automated Concurrency Stress Test for ResQMeal Reservation Engine
=================================================================
Proves the core requirement:
Given a listing with limited inventory (e.g. quantity = 10),
when 50 concurrent requests simultaneously attempt to reserve units,
the system MUST:
  1. Never allow total reserved units > available inventory
  2. Guarantee final remaining_quantity == 0 (never negative)
  3. Reject over-subscription requests with 409 Conflict
"""

import pytest
import concurrent.futures
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.core.database import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.models.provider import Provider
from app.models.food_listing import FoodListing, ListingStatus, ListingType, FoodCategory
from app.models.reservation import Reservation
from app.services.reservation_service import ReservationService

@pytest.fixture(scope="module")
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Create dummy provider
    user = User(
        email="concurrency_provider@test.com",
        hashed_password="hashed_dummy_pw",
        full_name="Test Provider",
        role=UserRole.PROVIDER
    )
    db.add(user)
    db.flush()

    provider = Provider(
        user_id=user.id,
        business_name="Concurrency Bakery",
        address="Test Road",
        city="Test City",
        latitude=12.97,
        longitude=77.59
    )
    db.add(provider)
    db.flush()

    # Create 50 distinct test consumers
    test_consumers = []
    for i in range(50):
        c = User(
            email=f"consumer_concurrency_{i}@test.com",
            hashed_password="hashed_pw",
            full_name=f"Consumer {i}",
            role=UserRole.CONSUMER
        )
        db.add(c)
        test_consumers.append(c)
    
    db.commit()
    yield provider.id, [c.id for c in test_consumers]
    db.close()

def test_concurrent_reservations_cannot_overbook(setup_test_db):
    provider_id, consumer_ids = setup_test_db
    db = SessionLocal()

    # Setup a listing with exactly 10 units available
    now = datetime.utcnow()
    listing = FoodListing(
        provider_id=provider_id,
        title="High Concurrency Stress Item",
        category=FoodCategory.BAKERY,
        quantity=10,
        remaining_quantity=10,
        unit="portions",
        original_price=100.0,
        surplus_price=40.0,
        listing_type=ListingType.SALE,
        expiry_time=now + timedelta(hours=4),
        pickup_start_time=now,
        pickup_end_time=now + timedelta(hours=2),
        latitude=12.97,
        longitude=77.59,
        status=ListingStatus.ACTIVE
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    listing_id = listing.id
    db.close()

    success_count = 0
    failure_count = 0
    results = []

    def attempt_reservation(consumer_id: int):
        thread_db = SessionLocal()
        try:
            # Each consumer attempts to reserve 1 unit
            res = ReservationService.create_reservation(
                db=thread_db,
                user_id=consumer_id,
                listing_id=listing_id,
                quantity=1
            )
            return ("SUCCESS", res.id)
        except HTTPException as e:
            return ("FAILED", e.status_code)
        except Exception as ex:
            return ("ERROR", str(ex))
        finally:
            thread_db.close()

    # Launch 50 simultaneous threads against 10 units
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(attempt_reservation, cid) for cid in consumer_ids]
        for f in concurrent.futures.as_completed(futures):
            status_code, detail = f.result()
            if status_code == "SUCCESS":
                success_count += 1
            else:
                failure_count += 1
            results.append((status_code, detail))

    # Verify post-condition invariants
    verify_db = SessionLocal()
    final_listing = verify_db.query(FoodListing).filter(FoodListing.id == listing_id).first()
    
    total_successful_reservations = (
        verify_db.query(Reservation)
        .filter(Reservation.listing_id == listing_id)
        .count()
    )

    print(f"\n--- Concurrency Test Results ---")
    print(f"Total simultaneous requests: {len(consumer_ids)}")
    print(f"Initial available inventory: 10")
    print(f"Successful reservations: {success_count}")
    print(f"Rejected requests (409 Conflict): {failure_count}")
    print(f"Final remaining inventory in DB: {final_listing.remaining_quantity}")
    print(f"Final listing status: {final_listing.status.value}")

    # Core Assertions:
    assert success_count == 10, f"Expected exactly 10 successes, got {success_count}"
    assert failure_count == 40, f"Expected 40 rejections, got {failure_count}"
    assert total_successful_reservations == 10, f"Total reserved records in DB must be 10"
    assert final_listing.remaining_quantity == 0, f"Remaining inventory must be exactly 0, got {final_listing.remaining_quantity}"
    assert final_listing.status == ListingStatus.SOLD_OUT, "Listing status must transition to SOLD_OUT"
    assert final_listing.remaining_quantity >= 0, "Inventory must NEVER become negative!"

    verify_db.close()

if __name__ == "__main__":
    pytest.main(["-v", __file__])
