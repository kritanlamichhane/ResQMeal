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
from app.models.notification import Notification, NotificationType

def seed_database():
    db = SessionLocal()
    now = datetime.utcnow()

    print("Seeding/Verifying ResQMeal database with demo accounts and full category food items...")

    # 1. Admin User
    admin = db.query(User).filter(User.email == "admin@resqmeal.com").first()
    if not admin:
        admin = User(
            email="admin@resqmeal.com",
            hashed_password=get_password_hash("Admin@1234"),
            full_name="Platform Admin",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)
        db.flush()

    # 2. Provider 1: Bakery & Cafe (Indiranagar)
    p1_user = db.query(User).filter(User.email == "provider@bakery.com").first()
    if not p1_user:
        p1_user = User(
            email="provider@bakery.com",
            hashed_password=get_password_hash("Provider@1234"),
            full_name="Chef Marco Rossi",
            role=UserRole.PROVIDER,
            is_active=True
        )
        db.add(p1_user)
        db.flush()

    p1 = db.query(Provider).filter(Provider.user_id == p1_user.id).first()
    if not p1:
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
        db.flush()

    # Provider 2: Restaurant & North Indian (Koramangala)
    p2_user = db.query(User).filter(User.email.in_(["provider@curry.com", "provider@restaurant.com"])).first()
    if not p2_user:
        p2_user = User(
            email="provider@curry.com",
            hashed_password=get_password_hash("Provider@1234"),
            full_name="Chef Vikram Sengupta",
            role=UserRole.PROVIDER,
            is_active=True
        )
        db.add(p2_user)
        db.flush()

    p2 = db.query(Provider).filter(Provider.user_id == p2_user.id).first()
    if not p2:
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
        db.flush()

    # Provider 3: Supermarket & Organic Farm (Central / Lavelle Road)
    p3_user = db.query(User).filter(User.email == "provider@freshfarm.com").first()
    if not p3_user:
        p3_user = User(
            email="provider@freshfarm.com",
            hashed_password=get_password_hash("Provider@1234"),
            full_name="Anita Roy",
            role=UserRole.PROVIDER,
            is_active=True
        )
        db.add(p3_user)
        db.flush()

    p3 = db.query(Provider).filter(Provider.user_id == p3_user.id).first()
    if not p3:
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
        db.flush()

    # 3. NGO User & Organization
    ngo_user = db.query(User).filter(User.email == "ngo@feedhope.org").first()
    if not ngo_user:
        ngo_user = User(
            email="ngo@feedhope.org",
            hashed_password=get_password_hash("Ngo@1234"),
            full_name="Meera Kapoor",
            role=UserRole.NGO,
            is_active=True
        )
        db.add(ngo_user)
        db.flush()

    ngo = db.query(NGO).filter(NGO.user_id == ngo_user.id).first()
    if not ngo:
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
        db.flush()

    # 4. Consumer Users
    c1 = db.query(User).filter(User.email == "consumer@resqmeal.com").first()
    if not c1:
        c1 = User(
            email="consumer@resqmeal.com",
            hashed_password=get_password_hash("Consumer@1234"),
            full_name="Aarav Sharma",
            role=UserRole.CONSUMER,
            is_active=True
        )
        db.add(c1)
        db.flush()

    c2 = db.query(User).filter(User.email == "priya@resqmeal.com").first()
    if not c2:
        c2 = User(
            email="priya@resqmeal.com",
            hashed_password=get_password_hash("Consumer@1234"),
            full_name="Priya Patel",
            role=UserRole.CONSUMER,
            is_active=True
        )
        db.add(c2)
        db.flush()

    db.commit()

    # 5. Comprehensive Food Catalog across ALL Categories
    demo_catalog = [
        # =========================================================================
        # CATEGORY: MEALS (Warm Meals - Veg & Non-Veg)
        # =========================================================================
        {
            "provider_id": p2.id,
            "title": "Hyderabadi Chicken Dum Biryani Feast",
            "description": "Slow-cooked royal aromatic basmati rice layered with tender spiced chicken cuts, boiled eggs, fried onions, and cooling cucumber raita.",
            "category": FoodCategory.MEALS,
            "quantity": 18,
            "remaining_quantity": 14,
            "unit": "portions",
            "original_price": 360.0,
            "surplus_price": 150.0,
            "listing_type": ListingType.SALE,
            "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600",
            "is_vegetarian": False,
            "latitude": p2.latitude,
            "longitude": p2.longitude,
        },
        {
            "provider_id": p2.id,
            "title": "Smoked Butter Chicken & Garlic Naan Feast",
            "description": "Clay-oven roasted tandoori chicken simmered in rich buttery tomato cream gravy, served with 2 freshly made butter garlic naans.",
            "category": FoodCategory.MEALS,
            "quantity": 15,
            "remaining_quantity": 10,
            "unit": "meal sets",
            "original_price": 340.0,
            "surplus_price": 145.0,
            "listing_type": ListingType.SALE,
            "image_url": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600",
            "is_vegetarian": False,
            "latitude": p2.latitude,
            "longitude": p2.longitude,
        },
        {
            "provider_id": p2.id,
            "title": "Coastal Prawn Curry & Steamed Ghee Rice",
            "description": "Succulent coastal prawns cooked in fragrant coconut and curry leaf gravy with tender steamed Malabar ghee rice.",
            "category": FoodCategory.MEALS,
            "quantity": 10,
            "remaining_quantity": 7,
            "unit": "portions",
            "original_price": 420.0,
            "surplus_price": 180.0,
            "listing_type": ListingType.SALE,
            "image_url": "https://images.unsplash.com/photo-1559847844-5315695dadae?w=600",
            "is_vegetarian": False,
            "latitude": p2.latitude,
            "longitude": p2.longitude,
        },
        {
            "provider_id": p1.id,
            "title": "Herb Roast Chicken & Potato Bowl",
            "description": "Tender rosemary-roasted chicken leg quarter served with garlic herb baby potatoes and glazed carrots.",
            "category": FoodCategory.MEALS,
            "quantity": 12,
            "remaining_quantity": 8,
            "unit": "bowls",
            "original_price": 320.0,
            "surplus_price": 130.0,
            "listing_type": ListingType.SALE,
            "image_url": "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600",
            "is_vegetarian": False,
            "latitude": p1.latitude,
            "longitude": p1.longitude,
        },
        {
            "provider_id": p2.id,
            "title": "Chef's Special Paneer Dum Biryani & Raita",
            "description": "Fragrant basmati rice cooked with fresh seasonal vegetables, succulent malai paneer cubes, and rich saffron aromatics.",
            "category": FoodCategory.MEALS,
            "quantity": 20,
            "remaining_quantity": 15,
            "unit": "portions",
            "original_price": 280.0,
            "surplus_price": 120.0,
            "listing_type": ListingType.SALE,
            "image_url": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600",
            "is_vegetarian": True,
            "latitude": p2.latitude,
            "longitude": p2.longitude,
        },
        {
            "provider_id": p2.id,
            "title": "Surplus Dal Makhani & Jeera Rice Thali",
            "description": "Slow-cooked dal makhani, cumin-spiced basmati rice, and fresh butter rotis packed in thermal food-grade containers.",
            "category": FoodCategory.MEALS,
            "quantity": 30,
            "remaining_quantity": 30,
            "unit": "meals",
            "original_price": 240.0,
            "surplus_price": 0.0,
            "listing_type": ListingType.DONATION,
            "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
            "is_vegetarian": True,
            "latitude": p2.latitude,
            "longitude": p2.longitude,
        },

        # =========================================================================
        # CATEGORY: BAKERY (Bakery & Bread - Pure Veg & Non-Veg)
        # =========================================================================
        {
            "provider_id": p1.id,
            "title": "Artisan French Croissants & Danish Box",
            "description": "Warm flaky butter croissants, pain au chocolat, and almond swirls baked fresh this morning.",
            "category": FoodCategory.BAKERY,
            "quantity": 14,
            "remaining_quantity": 10,
            "unit": "boxes (4 pcs)",
            "original_price": 360.0,
            "surplus_price": 150.0,
            "listing_type": ListingType.SALE,
            "image_url": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600",
            "is_vegetarian": True,
            "latitude": p1.latitude,
            "longitude": p1.longitude,
        },
        {
            "provider_id": p1.id,
            "title": "Sourdough Country Loaves (Family Pack)",
            "description": "Organic slow-fermented crusty sourdough bread with tender crumb.",
            "category": FoodCategory.BAKERY,
            "quantity": 10,
            "remaining_quantity": 8,
            "unit": "loaves",
            "original_price": 220.0,
            "surplus_price": 90.0,
            "listing_type": ListingType.SALE,
            "image_url": "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=600",
            "is_vegetarian": True,
            "latitude": p1.latitude,
            "longitude": p1.longitude,
        },
        {
            "provider_id": p1.id,
            "title": "Blueberry Cream Cheese Brioche Buns",
            "description": "Soft golden brioche buns filled with sweet blueberry compote and whipped cream cheese.",
            "category": FoodCategory.BAKERY,
            "quantity": 12,
            "remaining_quantity": 9,
            "unit": "packs (3 pcs)",
            "original_price": 270.0,
            "surplus_price": 110.0,
            "listing_type": ListingType.SALE,
            "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600",
            "is_vegetarian": True,
            "latitude": p1.latitude,
            "longitude": p1.longitude,
        },
        {
            "provider_id": p1.id,
            "title": "Chicken Tikka Brioche Pockets",
            "description": "Oven-baked golden brioche pastry pockets stuffed with spiced chicken tikka and mozzarella cheese.",
            "category": FoodCategory.BAKERY,
            "quantity": 10,
            "remaining_quantity": 6,
            "unit": "packs (2 pcs)",
            "original_price": 260.0,
            "surplus_price": 105.0,
            "listing_type": ListingType.SALE,
            "image_url": "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600",
            "is_vegetarian": False,
            "latitude": p1.latitude,
            "longitude": p1.longitude,
        },

        # =========================================================================
        # CATEGORY: PRODUCE (Fresh Farm Produce & Greens)
        # =========================================================================
        {
            "provider_id": p3.id,
            "title": "Organic Seasonal Fruit & Vegetable Basket",
            "description": "Ripe bananas, crisp apples, bell peppers, tomatoes, and organic spinach safe and ready for fresh cooking or juicing.",
            "category": FoodCategory.PRODUCE,
            "quantity": 16,
            "remaining_quantity": 12,
            "unit": "baskets (3 kg)",
            "original_price": 350.0,
            "surplus_price": 140.0,
            "listing_type": ListingType.SALE,
            "image_url": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600",
            "is_vegetarian": True,
            "latitude": p3.latitude,
            "longitude": p3.longitude,
        },
        {
            "provider_id": p3.id,
            "title": "Hydroponic Salad Greens & Herb Box",
            "description": "Crisp romaine lettuce, baby arugula, sweet basil, and cherry tomatoes harvested today from vertical farms.",
            "category": FoodCategory.PRODUCE,
            "quantity": 15,
            "remaining_quantity": 11,
            "unit": "boxes (800g)",
            "original_price": 280.0,
            "surplus_price": 110.0,
            "listing_type": ListingType.SALE,
            "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600",
            "is_vegetarian": True,
            "latitude": p3.latitude,
            "longitude": p3.longitude,
        },

        # =========================================================================
        # CATEGORY: GROCERY (Packaged Groceries & Pantry)
        # =========================================================================
        {
            "provider_id": p3.id,
            "title": "Artisanal Cheese & Farm Yogurt Bundle",
            "description": "Farm-fresh mozzarella balls, aged cheddar block, and organic unsweetened Greek yogurt tubs.",
            "category": FoodCategory.GROCERY,
            "quantity": 12,
            "remaining_quantity": 9,
            "unit": "bundles",
            "original_price": 420.0,
            "surplus_price": 175.0,
            "listing_type": ListingType.SALE,
            "image_url": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600",
            "is_vegetarian": True,
            "latitude": p3.latitude,
            "longitude": p3.longitude,
        },
        {
            "provider_id": p3.id,
            "title": "Organic Extra Virgin Olive Oil & Pasta Pack",
            "description": "Cold-pressed Italian olive oil (500ml) paired with artisanal bronze-die durum wheat penne pasta.",
            "category": FoodCategory.GROCERY,
            "quantity": 10,
            "remaining_quantity": 8,
            "unit": "pantry sets",
            "original_price": 550.0,
            "surplus_price": 240.0,
            "listing_type": ListingType.SALE,
            "image_url": "https://images.unsplash.com/photo-1551462147-37885acc36f1?w=600",
            "is_vegetarian": True,
            "latitude": p3.latitude,
            "longitude": p3.longitude,
        },
        {
            "provider_id": p3.id,
            "title": "Whole Grain Sourdough & Honey Granola",
            "description": "Nutty toasted oats with almonds, raw forest honey, and wholesome multigrain crackers.",
            "category": FoodCategory.GROCERY,
            "quantity": 14,
            "remaining_quantity": 10,
            "unit": "jars (600g)",
            "original_price": 310.0,
            "surplus_price": 125.0,
            "listing_type": ListingType.SALE,
            "image_url": "https://images.unsplash.com/photo-1517093157656-b9ec81c9c450?w=600",
            "is_vegetarian": True,
            "latitude": p3.latitude,
            "longitude": p3.longitude,
        },

        # =========================================================================
        # CATEGORY: SNACKS (Snacks & Quick Bites - Veg & Non-Veg)
        # =========================================================================
        {
            "provider_id": p2.id,
            "title": "Crispy Tandoori Chicken Wings & Kebab Sampler",
            "description": "Spicy charcoal-grilled chicken drumsticks, seekh kebabs, and crispy spiced bites served with cooling mint chutney.",
            "category": FoodCategory.SNACKS,
            "quantity": 12,
            "remaining_quantity": 8,
            "unit": "platters",
            "original_price": 290.0,
            "surplus_price": 120.0,
            "listing_type": ListingType.SALE,
            "image_url": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600",
            "is_vegetarian": False,
            "latitude": p2.latitude,
            "longitude": p2.longitude,
        },
        {
            "provider_id": p2.id,
            "title": "Amritsari Spiced Fish Tikka Bites",
            "description": "Crispy gram-flour battered river sole fish chunks seasoned with ajwain seeds, served with tart lemon wedges and mint dip.",
            "category": FoodCategory.SNACKS,
            "quantity": 10,
            "remaining_quantity": 7,
            "unit": "platters",
            "original_price": 340.0,
            "surplus_price": 140.0,
            "listing_type": ListingType.SALE,
            "image_url": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600",
            "is_vegetarian": False,
            "latitude": p2.latitude,
            "longitude": p2.longitude,
        },
        {
            "provider_id": p1.id,
            "title": "Gourmet Smoked Chicken & Egg Club Sandwich",
            "description": "Artisan toasted sourdough slices layered with tender shredded chicken, hard-boiled eggs, melted cheddar, and house mustard relish.",
            "category": FoodCategory.SNACKS,
            "quantity": 12,
            "remaining_quantity": 8,
            "unit": "sandwiches",
            "original_price": 240.0,
            "surplus_price": 95.0,
            "listing_type": ListingType.SALE,
            "image_url": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600",
            "is_vegetarian": False,
            "latitude": p1.latitude,
            "longitude": p1.longitude,
        },
        {
            "provider_id": p2.id,
            "title": "Crispy Paneer Tikka & Samosa Platter",
            "description": "Golden stuffed spiced potato samosas and chargrilled paneer skewers with tangy tamarind and mint chutney.",
            "category": FoodCategory.SNACKS,
            "quantity": 15,
            "remaining_quantity": 11,
            "unit": "platters",
            "original_price": 220.0,
            "surplus_price": 90.0,
            "listing_type": ListingType.SALE,
            "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600",
            "is_vegetarian": True,
            "latitude": p2.latitude,
            "longitude": p2.longitude,
        },

        # =========================================================================
        # CATEGORY: BEVERAGES (Beverages & Fresh Drinks)
        # =========================================================================
        {
            "provider_id": p3.id,
            "title": "Cold-Pressed Organic Juice Trio (Valencia Orange & Green Detox)",
            "description": "Raw unpasteurized cold-pressed juices: Valencia orange, green apple celery detox, and ginger beetroot immunity booster.",
            "category": FoodCategory.BEVERAGES,
            "quantity": 12,
            "remaining_quantity": 9,
            "unit": "packs (3 bottles)",
            "original_price": 320.0,
            "surplus_price": 130.0,
            "listing_type": ListingType.SALE,
            "image_url": "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600",
            "is_vegetarian": True,
            "latitude": p3.latitude,
            "longitude": p3.longitude,
        },
    ]

    for item in demo_catalog:
        existing = db.query(FoodListing).filter(FoodListing.title == item["title"]).first()
        if existing:
            # Refresh timestamps and status
            existing.status = ListingStatus.ACTIVE
            existing.remaining_quantity = max(existing.remaining_quantity, item["remaining_quantity"])
            existing.preparation_time = now - timedelta(hours=2)
            existing.expiry_time = now + timedelta(hours=10)
            existing.pickup_start_time = now
            existing.pickup_end_time = now + timedelta(hours=5)
            existing.is_vegetarian = item["is_vegetarian"]
            existing.category = item["category"]
            existing.surplus_price = item["surplus_price"]
            existing.original_price = item["original_price"]
        else:
            listing = FoodListing(
                provider_id=item["provider_id"],
                title=item["title"],
                description=item["description"],
                category=item["category"],
                quantity=item["quantity"],
                remaining_quantity=item["remaining_quantity"],
                unit=item["unit"],
                original_price=item["original_price"],
                surplus_price=item["surplus_price"],
                listing_type=item["listing_type"],
                image_url=item["image_url"],
                is_vegetarian=item["is_vegetarian"],
                preparation_time=now - timedelta(hours=2),
                expiry_time=now + timedelta(hours=10),
                pickup_start_time=now,
                pickup_end_time=now + timedelta(hours=5),
                latitude=item["latitude"],
                longitude=item["longitude"],
                status=ListingStatus.ACTIVE
            )
            db.add(listing)

    db.commit()

    # 6. Seed Welcome Notifications for users
    for user_obj in [c1, c2, p1_user, p2_user, p3_user]:
        if not user_obj:
            continue
        has_notif = db.query(Notification).filter(Notification.user_id == user_obj.id).first()
        if not has_notif:
            notif1 = Notification(
                user_id=user_obj.id,
                type=NotificationType.SYSTEM_ALERT,
                title="Welcome to ResQMeal! 🍲",
                message="Discover local restaurants and bakeries with surplus meals up to 70% off. Together, let's stop food waste!",
                is_read=False,
                created_at=now - timedelta(minutes=15)
            )
            notif2 = Notification(
                user_id=user_obj.id,
                type=NotificationType.PROVIDER_INVENTORY_UPDATE,
                title="New Surplus Deals Nearby",
                message="Freshly prepared Dum Biryanis, artisanal sourdough, and gourmet sandwiches were just listed nearby.",
                is_read=False,
                created_at=now - timedelta(minutes=5)
            )
            db.add_all([notif1, notif2])

    db.commit()

    # 7. Seed historical surplus data for ML model if missing
    if db.query(SurplusHistory).count() == 0:
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
    print("Database seeding completed successfully with all categories populated!")

if __name__ == "__main__":
    seed_database()
