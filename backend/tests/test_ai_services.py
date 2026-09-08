import pytest
from app.services.ml_surplus_service import ml_surplus_service
from app.services.dynamic_pricing_service import dynamic_pricing_service
from app.schemas.ai import SurplusPredictionRequest, SmartPricingRequest

def test_ml_surplus_prediction_metrics():
    # Verify model trained with genuine metrics
    metrics = ml_surplus_service.metrics
    assert metrics is not None
    assert metrics.mae > 0.0
    assert metrics.rmse > 0.0
    assert metrics.sample_count > 0

    # Test prediction
    req = SurplusPredictionRequest(
        category="BAKERY",
        day_of_week=5, # Saturday
        month=10,
        quantity_produced=80,
        original_price=150.0,
        is_holiday=False,
        weather_condition="Rain"
    )
    res = ml_surplus_service.predict(req)
    assert res.predicted_surplus_quantity > 0
    assert res.confidence_interval[0] <= res.predicted_surplus_quantity <= res.confidence_interval[1]
    assert res.waste_risk_level in ["LOW", "MEDIUM", "HIGH"]

def test_dynamic_pricing_decay():
    # Test urgent liquidation scenario (only 20 minutes remaining)
    req_urgent = SmartPricingRequest(
        original_price=200.0,
        quantity=15,
        pickup_minutes_remaining=20,
        day_of_week=3
    )
    res_urgent = dynamic_pricing_service.calculate_pricing(req_urgent)
    assert res_urgent.urgency_tier == "CRITICAL"
    assert res_urgent.discount_percentage >= 50.0 # High urgency markdown
    assert res_urgent.recommended_price < req_urgent.original_price

    # Test relaxed scenario (200 minutes remaining)
    req_relaxed = SmartPricingRequest(
        original_price=200.0,
        quantity=5,
        pickup_minutes_remaining=200,
        day_of_week=3
    )
    res_relaxed = dynamic_pricing_service.calculate_pricing(req_relaxed)
    assert res_relaxed.urgency_tier == "RELAXED"
    # Relaxed discount should be lower than critical discount
    assert res_relaxed.discount_percentage < res_urgent.discount_percentage
