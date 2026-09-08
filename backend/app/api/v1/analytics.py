from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.impact_log import ImpactLog
from app.models.food_listing import FoodListing, ListingStatus
from app.models.reservation import Reservation, ReservationStatus
from app.models.user import User, UserRole
from app.models.provider import Provider
from app.models.ngo import NGO
from app.schemas.analytics import PlatformMetricsResponse, ProviderAnalyticsResponse
from app.api.deps import get_current_provider

router = APIRouter()

@router.get("/platform", response_model=PlatformMetricsResponse)
def get_platform_metrics(db: Session = Depends(get_db)):
    """
    Computes global real-time environmental and economic rescue impact metrics across ResQMeal.
    """
    impacts = db.query(ImpactLog).all()

    meals = sum(i.meals_rescued for i in impacts)
    weight_kg = round(sum(i.weight_kg for i in impacts), 1)
    co2_kg = round(sum(i.co2_prevented_kg for i in impacts), 1)
    money_saved = round(sum(i.money_saved_consumer for i in impacts), 2)
    revenue_recovered = round(sum(i.money_recovered_provider for i in impacts), 2)

    total_listings = db.query(FoodListing).filter(FoodListing.status == ListingStatus.ACTIVE).count()
    total_providers = db.query(Provider).count()
    total_ngos = db.query(NGO).count()
    total_consumers = db.query(User).filter(User.role == UserRole.CONSUMER).count()

    # Completion rate
    total_reservations = db.query(Reservation).count()
    completed_reservations = db.query(Reservation).filter(Reservation.status == ReservationStatus.COMPLETED).count()
    rate = round((completed_reservations / total_reservations * 100.0), 1) if total_reservations > 0 else 100.0

    return PlatformMetricsResponse(
        total_meals_rescued=meals,
        total_food_weight_kg=weight_kg,
        total_co2_prevented_kg=co2_kg,
        total_money_saved_consumers=money_saved,
        total_revenue_recovered_providers=revenue_recovered,
        total_active_listings=total_listings,
        total_providers=total_providers,
        total_ngos=total_ngos,
        total_consumers=total_consumers,
        pickup_completion_rate_pct=rate
    )

@router.get("/provider", response_model=ProviderAnalyticsResponse)
def get_provider_analytics(
    provider: Provider = Depends(get_current_provider),
    db: Session = Depends(get_db)
):
    """
    Computes detailed business performance, revenue recovery, and sustainability metrics for a food provider.
    """
    listings = db.query(FoodListing).filter(FoodListing.provider_id == provider.id).all()
    listing_ids = [l.id for l in listings]

    category_counts = defaultdict(int)
    for l in listings:
        category_counts[l.category.value] += 1

    reservations = db.query(Reservation).filter(Reservation.listing_id.in_(listing_ids)).all() if listing_ids else []
    
    completed_res = [r for r in reservations if r.status == ReservationStatus.COMPLETED]
    sold_portions = sum(r.quantity for r in completed_res)
    revenue = sum(r.total_price for r in completed_res)

    impacts = (
        db.query(ImpactLog)
        .join(Reservation, ImpactLog.reservation_id == Reservation.id)
        .filter(Reservation.listing_id.in_(listing_ids))
        .all()
    ) if listing_ids else []

    co2_kg = round(sum(i.co2_prevented_kg for i in impacts), 1)
    
    total_res = len(reservations)
    completion_rate = round((len(completed_res) / total_res * 100.0), 1) if total_res > 0 else 100.0

    return ProviderAnalyticsResponse(
        provider_id=provider.id,
        business_name=provider.business_name,
        total_listings=len(listings),
        total_sold_portions=sold_portions,
        total_donated_portions=0, # extensible
        total_wasted_portions=0,
        revenue_recovered=round(revenue, 2),
        co2_saved_kg=co2_kg,
        completion_rate_pct=completion_rate,
        category_breakdown=dict(category_counts)
    )
