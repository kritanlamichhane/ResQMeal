from datetime import datetime, timedelta, date
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.provider import Provider
from app.models.ngo import NGO
from app.models.food_listing import FoodListing, ListingStatus, ListingType, FoodCategory
from app.models.surplus_history import SurplusHistory
from app.models.reservation import Reservation, ReservationStatus
from app.models.impact_log import ImpactLog

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).first():
        db.close()
        return

    print("Seeding ResQMeal database with realistic demonstration data...")

    # 1. Admin User
    admin = User(
        email="admin@resqmeal.com",
        hashed_password=get_password_hash("Admin@1234"),
        full_name="Platform Admin",
        role=UserRole.ADMIN,
        is_active=True
    )
    db.add(admin)

    # 2. Providers
    p1_user = User(
        email="provider@bakery.com",
        hashed_password=get_password_hash("Provider@1234"),
        full_name="Chef Marco Rossi",
        role=UserRole.PROVIDER,
        is_active=True
    )
    db.add(p1_user)
    db.flush()

    p1 = Provider(
        user_id=p1_user.id,
        business_name="Artisan Crust & Pastry Bar",
        business_type="Bakery & Cafe",
        description="Premium artisan sourdough, croissants, and fresh evening pastries baked twice daily.",
        fssai_license="FSSAI-1122334455",
        address="100 Feet Road, Indiranagar",
        city="Bangalore",
        latitude=12.9784,
        longitude=77.6408
    )
    db.add(p1)

    p2_user = User(
        email="provider@curry.com",
        hashed_password=get_password_hash("Provider@1234"),
        full_name="Chef Vikram Sengupta",
        role=UserRole.PROVIDER,
        is_active=True
    )
    db.add(p2_user)
    db.flush()

    p2 = Provider(
        user_id=p2_user.id,
        business_name="Royal Spice Grand Kitchen",
        business_type="Restaurant",
        description="Authentic North Indian thalis, aromatic biryanis, and chef specialty platters.",
        fssai_license="FSSAI-9988776655",
        address="80 Feet Road, Koramangala 4th Block",
        city="Bangalore",
        latitude=12.9352,
        longitude=77.6245
    )
    db.add(p2)

    p3_user = User(
        email="provider@freshfarm.com",
        hashed_password=get_password_hash("Provider@1234"),
        full_name="Anita Roy",
        role=UserRole.PROVIDER,
        is_active=True
    )
    db.add(p3_user)
    db.flush()

    p3 = Provider(
        user_id=p3_user.id,
        business_name="GreenHarvest Organic Grocers",
        business_type="Supermarket",
        description="Organic produce, artisanal dairy, and wholesome grocery surplus at community discounts.",
        fssai_license="FSSAI-4455667788",
        address="Lavelle Road, Central District",
        city="Bangalore",
        latitude=12.9719,
        longitude=77.5996
    )
    db.add(p3)

    # 3. NGO
    ngo_user = User(
        email="ngo@feedhope.org",
        hashed_password=get_password_hash("Ngo@1234"),
        full_name="Meera Kapoor",
        role=UserRole.NGO,
        is_active=True
    )
    db.add(ngo_user)
    db.flush()

    ngo = NGO(
        user_id=ngo_user.id,
        org_name="FeedHope Hunger Relief Mission",
        registration_number="NGO-KA-2021-8842",
        contact_person="Meera Kapoor",
        description="Distributing fresh, safe surplus food to local community shelters, night clinics, and underprivileged schools.",
        daily_meal_capacity=250,
        preferred_categories="MEALS,BAKERY,GROCERY",
        address="Wilson Garden, Bangalore",
        latitude=12.9463,
        longitude=77.5938
    )
    db.add(ngo)

    # 4. Consumer Users
    c1 = User(
        email="consumer@resqmeal.com",
        hashed_password=get_password_hash("Consumer@1234"),
        full_name="Aarav Sharma",
        role=UserRole.CONSUMER,
        is_active=True
    )
    c2 = User(
        email="priya@resqmeal.com",
        hashed_password=get_password_hash("Consumer@1234"),
        full_name="Priya Patel",
        role=UserRole.CONSUMER,
        is_active=True
    )
    db.add_all([c1, c2])
    db.commit()

    # 5. Food Listings
    now = datetime.utcnow()
    listings = [
        FoodListing(
            provider_id=p1.id,
            title="Artisan French Croissants & Danish Box",
            description="Warm flaky butter croissants, pain au chocolat, and almond swirls baked fresh this morning.",
            category=FoodCategory.BAKERY,
            quantity=12,
            remaining_quantity=10,
            unit="boxes (4 pcs)",
            original_price=360.0,
            surplus_price=150.0,
            listing_type=ListingType.SALE,
            image_url="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600",
            is_vegetarian=True,
            preparation_time=now - timedelta(hours=6),
            expiry_time=now + timedelta(hours=8),
            pickup_start_time=now,
            pickup_end_time=now + timedelta(hours=4),
            latitude=p1.latitude,
            longitude=p1.longitude,
            status=ListingStatus.ACTIVE
        ),
        FoodListing(
            provider_id=p1.id,
            title="Sourdough Country Loaves (Family Pack)",
            description="Organic slow-fermented crusty sourdough bread with tender crumb.",
            category=FoodCategory.BAKERY,
            quantity=8,
            remaining_quantity=8,
            unit="loaves",
            original_price=220.0,
            surplus_price=90.0,
            listing_type=ListingType.SALE,
            image_url="https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=600",
            is_vegetarian=True,
            preparation_time=now - timedelta(hours=8),
            expiry_time=now + timedelta(hours=14),
            pickup_start_time=now,
            pickup_end_time=now + timedelta(hours=5),
            latitude=p1.latitude,
            longitude=p1.longitude,
            status=ListingStatus.ACTIVE
        ),
        FoodListing(
            provider_id=p2.id,
            title="Chef's Special Dum Biryani & Raita Feast",
            description="Fragrant basmati rice cooked with fresh seasonal vegetables, paneer, and rich saffron aromatics.",
            category=FoodCategory.MEALS,
            quantity=20,
            remaining_quantity=15,
            unit="portions",
            original_price=280.0,
            surplus_price=120.0,
            listing_type=ListingType.SALE,
            image_url="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600",
            is_vegetarian=True,
            preparation_time=now - timedelta(hours=3),
            expiry_time=now + timedelta(hours=5),
            pickup_start_time=now,
            pickup_end_time=now + timedelta(hours=3),
            latitude=p2.latitude,
            longitude=p2.longitude,
            status=ListingStatus.ACTIVE
        ),
        FoodListing(
            provider_id=p2.id,
            title="Surplus Hot Meals for Community Rescue",
            description="Hot dal makhani, jeera rice, and fresh rotis packed in food-grade thermal containers for NGO collection.",
            category=FoodCategory.MEALS,
            quantity=35,
            remaining_quantity=35,
            unit="meals",
            original_price=250.0,
            surplus_price=0.0,
            listing_type=ListingType.DONATION,
            image_url="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
            is_vegetarian=True,
            preparation_time=now - timedelta(hours=2),
            expiry_time=now + timedelta(hours=4),
            pickup_start_time=now,
            pickup_end_time=now + timedelta(hours=3),
            latitude=p2.latitude,
            longitude=p2.longitude,
            status=ListingStatus.ACTIVE
        ),
        FoodListing(
            provider_id=p3.id,
            title="Organic Seasonal Fruit & Vegetable Basket",
            description="Ripe bananas, crisp apples, bell peppers, and greens. Safe and ready for salads or juicing.",
            category=FoodCategory.PRODUCE,
            quantity=15,
            remaining_quantity=12,
            unit="baskets (2.5 kg)",
            original_price=350.0,
            surplus_price=140.0,
            listing_type=ListingType.SALE,
            image_url="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600",
            is_vegetarian=True,
            preparation_time=now - timedelta(hours=10),
            expiry_time=now + timedelta(hours=18),
            pickup_start_time=now,
            pickup_end_time=now + timedelta(hours=6),
            latitude=p3.latitude,
            longitude=p3.longitude,
            status=ListingStatus.ACTIVE
        ),
        # Non-Veg Listings
        FoodListing(
            provider_id=p2.id,
            title="Hyderabadi Chicken Dum Biryani Feast",
            description="Slow-cooked royal aromatic basmati rice layered with tender spiced chicken cuts, boiled eggs, fried onions, and refreshing cucumber raita.",
            category=FoodCategory.MEALS,
            quantity=18,
            remaining_quantity=14,
            unit="portions",
            original_price=360.0,
            surplus_price=150.0,
            listing_type=ListingType.SALE,
            image_url="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600",
            is_vegetarian=False,
            preparation_time=now - timedelta(hours=3),
            expiry_time=now + timedelta(hours=5),
            pickup_start_time=now,
            pickup_end_time=now + timedelta(hours=4),
            latitude=p2.latitude,
            longitude=p2.longitude,
            status=ListingStatus.ACTIVE
        ),
        FoodListing(
            provider_id=p2.id,
            title="Smoked Butter Chicken & Garlic Naan Feast",
            description="Clay-oven roasted tandoori chicken simmered in rich buttery tomato cream gravy, served with 2 fresh buttered garlic naans.",
            category=FoodCategory.MEALS,
            quantity=15,
            remaining_quantity=10,
            unit="meal sets",
            original_price=340.0,
            surplus_price=145.0,
            listing_type=ListingType.SALE,
            image_url="https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600",
            is_vegetarian=False,
            preparation_time=now - timedelta(hours=4),
            expiry_time=now + timedelta(hours=6),
            pickup_start_time=now,
            pickup_end_time=now + timedelta(hours=4),
            latitude=p2.latitude,
            longitude=p2.longitude,
            status=ListingStatus.ACTIVE
        ),
        FoodListing(
            provider_id=p2.id,
            title="Crispy Tandoori Chicken Wings & Kebab Sampler",
            description="Spicy charcoal-grilled chicken drumsticks, seekh kebabs, and crispy spiced bites served with cooling mint chutney.",
            category=FoodCategory.SNACKS,
            quantity=12,
            remaining_quantity=8,
            unit="platters",
            original_price=290.0,
            surplus_price=120.0,
            listing_type=ListingType.SALE,
            image_url="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600",
            is_vegetarian=False,
            preparation_time=now - timedelta(hours=2),
            expiry_time=now + timedelta(hours=5),
            pickup_start_time=now,
            pickup_end_time=now + timedelta(hours=3),
            latitude=p2.latitude,
            longitude=p2.longitude,
            status=ListingStatus.ACTIVE
        ),
        FoodListing(
            provider_id=p1.id,
            title="Gourmet Smoked Chicken & Egg Club Sandwich",
            description="Artisan toasted sourdough slices layered with tender shredded chicken, hard-boiled eggs, melted cheddar, and house mustard relish.",
            category=FoodCategory.SNACKS,
            quantity=10,
            remaining_quantity=8,
            unit="sandwiches",
            original_price=240.0,
            surplus_price=95.0,
            listing_type=ListingType.SALE,
            image_url="https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600",
            is_vegetarian=False,
            preparation_time=now - timedelta(hours=5),
            expiry_time=now + timedelta(hours=9),
            pickup_start_time=now,
            pickup_end_time=now + timedelta(hours=4),
            latitude=p1.latitude,
            longitude=p1.longitude,
            status=ListingStatus.ACTIVE
        ),
    ]
    db.add_all(listings)
    db.commit()

    # 6. Seed a completed reservation and impact record to showcase analytics
    first_listing = listings[0]
    sample_res = Reservation(
        listing_id=first_listing.id,
        user_id=c1.id,
        quantity=2,
        unit_price=first_listing.surplus_price,
        total_price=first_listing.surplus_price * 2,
        status=ReservationStatus.COMPLETED,
        pickup_code="RSQ-DEMO1",
        expires_at=now + timedelta(hours=2)
    )
    db.add(sample_res)
    db.commit()

    impact = ImpactLog(
        reservation_id=sample_res.id,
        meals_rescued=2,
        weight_kg=0.9,
        co2_prevented_kg=2.25,
        money_saved_consumer=(first_listing.original_price - first_listing.surplus_price) * 2,
        money_recovered_provider=sample_res.total_price
    )
    db.add(impact)

    # 7. Seed historical surplus data for ML model
    print("Seeding provider historical surplus records for ML model...")
    histories = []
    base_date = date.today() - timedelta(days=60)
    for i in range(60):
        d = base_date + timedelta(days=i)
        histories.append(SurplusHistory(
            provider_id=p1.id,
            category="BAKERY",
            date=d,
            day_of_week=d.weekday(),
            month=d.month,
            quantity_produced=70 + (i % 20),
            quantity_sold=55 + (i % 15),
            quantity_wasted=15 + (i % 5),
            original_price=180.0,
            is_holiday=(d.weekday() in [5, 6]),
            weather_condition="Clear" if i % 4 != 0 else "Rain"
        ))
    db.add_all(histories)
    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
