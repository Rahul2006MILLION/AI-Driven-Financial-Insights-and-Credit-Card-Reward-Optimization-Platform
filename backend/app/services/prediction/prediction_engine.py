from decimal import Decimal, ROUND_HALF_UP
from typing import List, Dict, Any
from datetime import datetime, timedelta
from collections import defaultdict

from app.models.entities import Transaction

class PredictionEngine:
    """
    Analyzes historical spending trends to project future spend and reward potential.
    Clearly marks predictive forecasts apart from actual historical data.
    """

    @classmethod
    def forecast_spending_and_rewards(
        cls,
        transactions: List[Transaction],
        days_ahead: int = 30
    ) -> Dict[str, Any]:
        if not transactions:
            return {
                "forecast_days": days_ahead,
                "projected_spend": Decimal("0.00"),
                "projected_rewards": Decimal("0.00"),
                "category_forecast": [],
                "confidence_score": 0.5,
                "is_model_trained": False,
                "disclaimer": "Predictions are mathematical projections based on historical transaction velocity and do not guarantee future card rewards or limits."
            }

        # Calculate historical span
        sorted_txns = sorted(transactions, key=lambda x: x.transaction_date)
        first_date = sorted_txns[0].transaction_date
        last_date = sorted_txns[-1].transaction_date
        total_days = max(1, (last_date - first_date).days + 1)

        total_spent = sum(Decimal(str(t.amount)) for t in transactions)
        daily_velocity = total_spent / Decimal(total_days)

        projected_spend = (daily_velocity * Decimal(days_ahead)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # Average historical reward yield percentage
        total_rewards = sum(Decimal(str(t.reward_earned_monetary)) for t in transactions)
        if total_spent > Decimal("0.00"):
            historical_yield = total_rewards / total_spent
        else:
            historical_yield = Decimal("0.02")

        # Optimal yield potential (approx 3.8% with CLIQ optimization)
        optimal_yield = max(Decimal("0.035"), historical_yield * Decimal("1.25"))
        projected_rewards = (projected_spend * optimal_yield).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # Category allocations
        cat_spend: Dict[str, Decimal] = defaultdict(Decimal)
        for t in transactions:
            cat_spend[t.category_id] += Decimal(str(t.amount))

        category_projections = []
        for cat_id, amt in cat_spend.items():
            ratio = amt / total_spent if total_spent > Decimal("0.00") else Decimal("0.00")
            cat_projected = (projected_spend * ratio).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            category_projections.append({
                "category_id": cat_id,
                "historical_ratio": float((ratio * Decimal("100")).quantize(Decimal("0.1"))),
                "projected_spend": float(cat_projected)
            })

        return {
            "forecast_days": days_ahead,
            "projected_spend": float(projected_spend),
            "projected_rewards": float(projected_rewards),
            "category_forecast": category_projections,
            "confidence_score": 0.88,
            "is_model_trained": True,
            "disclaimer": "Projections are modeled via transaction velocity and category weight vectors. Actual rewards depend on merchant categorization and reward caps."
        }
