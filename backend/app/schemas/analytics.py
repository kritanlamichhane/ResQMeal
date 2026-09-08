from pydantic import BaseModel
from typing import List, Dict, Any

class PlatformMetricsResponse(BaseModel):
    total_meals_rescued: int
    total_food_weight_kg: float
    total_co2_prevented_kg: float
    total_money_saved_consumers: float
    total_revenue_recovered_providers: float
    total_active_listings: int
    total_providers: int
    total_ngos: int
    total_consumers: int
    pickup_completion_rate_pct: float

class ProviderAnalyticsResponse(BaseModel):
    provider_id: int
    business_name: str
    total_listings: int
    total_sold_portions: int
    total_donated_portions: int
    total_wasted_portions: int
    revenue_recovered: float
    co2_saved_kg: float
    completion_rate_pct: float
    category_breakdown: Dict[str, int]
