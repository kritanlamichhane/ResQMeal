from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class SurplusPredictionRequest(BaseModel):
    category: str = "MEALS"
    day_of_week: int = Field(..., ge=0, le=6) # 0 = Monday, 6 = Sunday
    month: int = Field(..., ge=1, le=12)
    quantity_produced: int = Field(..., gt=0)
    original_price: float = Field(..., ge=0.0)
    is_holiday: bool = False
    weather_condition: str = "Clear"

class ModelEvaluationMetrics(BaseModel):
    mae: float
    rmse: float
    r2: float
    sample_count: int

class SurplusPredictionResponse(BaseModel):
    predicted_surplus_quantity: int
    confidence_interval: List[int] # e.g. [18, 24]
    waste_risk_level: str # LOW, MEDIUM, HIGH
    explanation: str
    metrics: ModelEvaluationMetrics

class SmartPricingRequest(BaseModel):
    original_price: float = Field(..., gt=0.0)
    quantity: int = Field(..., gt=0)
    pickup_minutes_remaining: int = Field(..., gt=0)
    day_of_week: int = Field(0, ge=0, le=6)
    category: str = "MEALS"
    historical_demand_factor: float = Field(1.0, ge=0.5, le=2.0)

class SmartPricingResponse(BaseModel):
    recommended_price: float
    discount_percentage: float
    urgency_tier: str # RELAXED, MODERATE, CRITICAL
    decay_factor: float
    rationale: str
    breakdown: Dict[str, Any]

class FoodImageExtractionRequest(BaseModel):
    image_url: Optional[str] = None
    image_base64: Optional[str] = None
    hint_text: Optional[str] = None

class FoodImageExtractionResponse(BaseModel):
    detected_name: str
    category: str
    is_vegetarian: bool
    estimated_quantity: int
    confidence_score: float
    suggested_description: str
    requires_user_confirmation: bool = True

class NGOMatchItem(BaseModel):
    listing_id: int
    title: str
    provider_name: str
    category: str
    quantity: int
    distance_km: float
    urgency_hours: float
    match_score: float # 0 to 100
    score_breakdown: Dict[str, float]
