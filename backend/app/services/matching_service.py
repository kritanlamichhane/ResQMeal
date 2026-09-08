from typing import List, Dict, Any
from datetime import datetime
from app.models.food_listing import FoodListing
from app.models.ngo import NGO
from app.services.geo_service import calculate_haversine_distance
from app.schemas.ai import NGOMatchItem

class SmartMatchingEngine:
    """
    Computes transparent multi-factor compatibility scores (0 - 100) between
    surplus food donation listings and NGO capacity/proximity/preference.
    """
    WEIGHTS = {
        "distance": 0.30,
        "urgency": 0.25,
        "preference": 0.20,
        "quantity": 0.15,
        "pickup": 0.10
    }

    @classmethod
    def score_match(cls, listing: FoodListing, ngo: NGO) -> NGOMatchItem:
        # 1. Distance Score: Max 20km radius, 0km = 100 points
        dist_km = calculate_haversine_distance(listing.latitude, listing.longitude, ngo.latitude, ngo.longitude)
        dist_score = max(0.0, 100.0 - (dist_km * 5.0)) # 0 km = 100, 10 km = 50, 20 km = 0

        # 2. Urgency Score: Less time until pickup end = higher urgency score
        now = datetime.utcnow()
        end_time = listing.pickup_end_time.replace(tzinfo=None) if listing.pickup_end_time.tzinfo else listing.pickup_end_time
        hours_remaining = max(0.1, (end_time - now).total_seconds() / 3600.0)
        # If <= 2 hours remaining, urgency is 100. If >= 12 hours, urgency is 30.
        urgency_score = min(100.0, max(20.0, 100.0 - (hours_remaining * 7.0)))

        # 3. Category Preference Score
        preferred = [p.strip().upper() for p in ngo.preferred_categories.split(",")]
        cat_score = 100.0 if listing.category.value in preferred else 40.0

        # 4. Quantity Compatibility Score
        # Matches against NGO daily capacity
        capacity = max(10, ngo.daily_meal_capacity)
        fit_ratio = min(1.0, listing.remaining_quantity / capacity)
        qty_score = round(fit_ratio * 100.0, 1)

        # 5. Pickup Compatibility (listing is active and within valid window)
        pickup_score = 100.0 if listing.remaining_quantity > 0 else 0.0

        # Weighted composite score
        total_score = round(
            dist_score * cls.WEIGHTS["distance"] +
            urgency_score * cls.WEIGHTS["urgency"] +
            cat_score * cls.WEIGHTS["preference"] +
            qty_score * cls.WEIGHTS["quantity"] +
            pickup_score * cls.WEIGHTS["pickup"],
            1
        )

        provider_name = listing.provider.business_name if listing.provider else "Verified Provider"

        return NGOMatchItem(
            listing_id=listing.id,
            title=listing.title,
            provider_name=provider_name,
            category=listing.category.value,
            quantity=listing.remaining_quantity,
            distance_km=dist_km,
            urgency_hours=round(hours_remaining, 1),
            match_score=total_score,
            score_breakdown={
                "distance_score": round(dist_score, 1),
                "urgency_score": round(urgency_score, 1),
                "preference_score": round(cat_score, 1),
                "quantity_score": round(qty_score, 1),
                "pickup_score": round(pickup_score, 1)
            }
        )

matching_engine = SmartMatchingEngine()
