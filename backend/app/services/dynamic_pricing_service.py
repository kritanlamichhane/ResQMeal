import math
from app.schemas.ai import SmartPricingRequest, SmartPricingResponse

class DynamicPricingService:
    @staticmethod
    def calculate_pricing(req: SmartPricingRequest) -> SmartPricingResponse:
        """
        Algorithmic dynamic pricing engine using exponential time-decay and inventory velocity pressure.
        
        Principles:
        1. Baseline markdown: 35% discount for surplus food rescue.
        2. Urgency acceleration: As pickup deadline nears (<120m -> <60m -> <30m), urgency discount increases.
        3. Stock pressure: High remaining quantity relative to standard pickup window increases discount.
        4. Protection floor: Never discount below 20% of original price to preserve provider recovery.
        """
        orig_price = req.original_price
        minutes = req.pickup_minutes_remaining
        qty = req.quantity
        demand_factor = req.historical_demand_factor # 1.0 is normal, >1.0 high demand, <1.0 slow demand

        # 1. Base discount
        base_discount = 0.35

        # 2. Urgency decay factor
        # When minutes >= 180 (3h), decay discount is modest (0.0 - 0.05).
        # When minutes <= 45, decay jumps significantly.
        if minutes > 180:
            urgency_discount = 0.05
            tier = "RELAXED"
        elif minutes > 90:
            urgency_discount = 0.15
            tier = "MODERATE"
        elif minutes > 45:
            urgency_discount = 0.25
            tier = "URGENT"
        else:
            urgency_discount = 0.40
            tier = "CRITICAL"

        # 3. Quantity Pressure
        # If large quantity remaining in short window:
        qty_pressure = min(0.15, (qty / 30.0) * 0.10)

        # 4. Demand elasticity adjustment
        # If historical demand is high, we can reduce discount slightly
        demand_adjustment = (1.0 - demand_factor) * 0.10

        total_discount = base_discount + urgency_discount + qty_pressure + demand_adjustment
        # Clamp between 25% and 80% discount
        total_discount = max(0.25, min(0.80, total_discount))

        recommended_price = round(orig_price * (1.0 - total_discount), 2)
        # Ensure at least $0.50 / Rs 10 minimum
        recommended_price = max(1.0, recommended_price)

        final_discount_pct = round(((orig_price - recommended_price) / orig_price) * 100, 1)

        rationale = (
            f"Recommended {final_discount_pct}% discount for {qty} units with {minutes} mins until deadline. "
            f"Tier: {tier}. Includes base surplus markdown ({round(base_discount*100)}%), "
            f"urgency factor ({round(urgency_discount*100)}%), and inventory pressure."
        )

        return SmartPricingResponse(
            recommended_price=recommended_price,
            discount_percentage=final_discount_pct,
            urgency_tier=tier,
            decay_factor=round(urgency_discount + qty_pressure, 3),
            rationale=rationale,
            breakdown={
                "base_discount_pct": round(base_discount * 100, 1),
                "urgency_discount_pct": round(urgency_discount * 100, 1),
                "quantity_pressure_pct": round(qty_pressure * 100, 1),
                "demand_adjustment_pct": round(demand_adjustment * 100, 1),
                "original_price": orig_price,
                "projected_revenue": round(recommended_price * qty, 2)
            }
        )

dynamic_pricing_service = DynamicPricingService()
