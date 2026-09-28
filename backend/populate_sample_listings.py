import sys
import os
from datetime import datetime, timedelta

from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.provider import Provider
from app.models.ngo import NGO
from app.models.food_listing import FoodListing, ListingStatus, ListingType, FoodCategory
from app.models.notification import Notification, NotificationType

def populate():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    now = datetime.utcnow()

    print("Checking and populating realistic providers & food items...")

    # Ensure provider 1: Artisan Crust & Pastry Bar
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

    # Ensure provider 2: Royal Spice Grand Kitchen
    p2_user = db.query(User).filter(User.email == "provider@restaurant.com").first()
    if not p2_user:
        p2_user = User(
            email="provider@restaurant.com",
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

    # Ensure provider 3: GreenHarvest Organic Grocers
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

    # Sample Listings including rich Veg and Non-Veg items
    sample_items = [
        # Non-Veg Items
        {
            "provider_id": p2.id,
            "title": "Hyderabadi Chicken Dum Biryani Feast",
            "description": "Slow-cooked royal aromatic basmati rice layered with tender spiced chicken cuts, boiled eggs, fried onions, and refreshing cucumber raita.",
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
            "description": "Clay-oven roasted tandoori chicken simmered in rich buttery tomato cream gravy, served with 2 fresh buttered garlic naans.",
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
            "provider_id": p1.id,
            "title": "Gourmet Smoked Chicken & Egg Club Sandwich",
            "description": "Artisan toasted sourdough slices layered with tender shredded chicken, hard-boiled eggs, melted cheddar, and house mustard relish.",
            "category": FoodCategory.SNACKS,
            "quantity": 10,
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
            "title": "Coastal Prawn Curry & Steamed Ghee Rice",
            "description": "Succulent coastal prawns cooked in fragrant coconut and curry leaf gravy with tender steamed ghee rice.",
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
        # Vegetarian Items
        {
            "provider_id": p1.id,
            "title": "Artisan French Croissants & Danish Box",
            "description": "Warm flaky butter croissants, pain au chocolat, and almond swirls baked fresh this morning.",
            "category": FoodCategory.BAKERY,
            "quantity": 12,
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
            "quantity": 8,
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
            "provider_id": p2.id,
            "title": "Chef's Special Paneer Dum Biryani & Raita Feast",
            "description": "Fragrant basmati rice cooked with fresh seasonal vegetables, succulent malai paneer, and rich saffron aromatics.",
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
            "provider_id": p3.id,
            "title": "Organic Seasonal Fruit & Vegetable Basket",
            "description": "Ripe bananas, crisp apples, bell peppers, and greens. Safe and ready for salads or juicing.",
            "category": FoodCategory.PRODUCE,
            "quantity": 15,
            "remaining_quantity": 12,
            "unit": "baskets (2.5 kg)",
            "original_price": 350.0,
            "surplus_price": 140.0,
            "listing_type": ListingType.SALE,
            "image_url": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600",
            "is_vegetarian": True,
            "latitude": p3.latitude,
            "longitude": p3.longitude,
        },
        {
            "provider_id": p2.id,
            "title": "Surplus Hot Dal Makhani & Jeera Rice Meal Box",
            "description": "Hot slow-cooked dal makhani, fragrant jeera rice, and fresh butter rotis packed in food-grade thermal containers.",
            "category": FoodCategory.MEALS,
            "quantity": 25,
            "remaining_quantity": 25,
            "unit": "meals",
            "original_price": 240.0,
            "surplus_price": 0.0,
            "listing_type": ListingType.DONATION,
            "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
            "is_vegetarian": True,
            "latitude": p2.latitude,
            "longitude": p2.longitude,
        }
    ]

    for item in sample_items:
        existing = db.query(FoodListing).filter(FoodListing.title == item["title"]).first()
        if not existing:
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
                preparation_time=now - timedelta(hours=3),
                expiry_time=now + timedelta(hours=10),
                pickup_start_time=now,
                pickup_end_time=now + timedelta(hours=5),
                latitude=item["latitude"],
                longitude=item["longitude"],
                status=ListingStatus.ACTIVE
            )
            db.add(listing)
            print(f"Added listing: {item['title']} (Veg: {item['is_vegetarian']})")

    db.commit()

    # Now add sample notifications for all users so the notification bell works immediately
    users = db.query(User).all()
    for u in users:
        has_notif = db.query(Notification).filter(Notification.user_id == u.id).first()
        if not has_notif:
            notif1 = Notification(
                user_id=u.id,
                type=NotificationType.SYSTEM_ALERT,
                title="Welcome to ResQMeal! 🍲",
                message="Discover local restaurants and bakeries with surplus meals up to 70% off. Together, let's stop food waste!",
                is_read=False,
                created_at=now - timedelta(minutes=15)
            )
            notif2 = Notification(
                user_id=u.id,
                type=NotificationType.PROVIDER_INVENTORY_UPDATE,
                title="New Surplus Deals Nearby",
                message="Royal Spice Grand Kitchen just listed freshly prepared Chicken Biryani and Butter Chicken meals.",
                is_read=False,
                created_at=now - timedelta(minutes=5)
            )
            db.add_all([notif1, notif2])
            print(f"Added welcome notifications for user {u.email}")

    db.commit()
    db.close()
    print("Database population completed successfully!")

if __name__ == "__main__":
    populate()
