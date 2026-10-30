from typing import List, Dict, Optional, Any
from decimal import Decimal
from pydantic import BaseModel

class CategorySpend(BaseModel):
    category_id: str
    category_name: str
    total_amount: Decimal
    percentage_of_total: Decimal
    transaction_count: int

class MonthlySpend(BaseModel):
    month: str  # "YYYY-MM"
    total_amount: Decimal
    rewards_earned: Decimal
    transaction_count: int

class SpendingAnalyticsResponse(BaseModel):
    total_spending: Decimal
    total_transactions: int
    category_breakdown: List[CategorySpend]
    monthly_trend: List[MonthlySpend]
    top_merchants: List[Dict[str, Any]] = []

class RewardAnalyticsResponse(BaseModel):
    total_rewards_earned: Decimal
    total_optimal_possible: Decimal
    reward_leakage_amount: Decimal
    optimization_efficiency_rate: Decimal  # e.g. 78.5%
    rewards_by_card: List[Dict[str, Any]]

class RecurringSubscription(BaseModel):
    merchant_name: str
    category_id: str
    average_amount: Decimal
    frequency: str  # "Monthly"
    last_billed: str
    recommended_card_id: Optional[str] = None
    annual_cost: Decimal

class FinancialHealthResponse(BaseModel):
    health_score: int  # 0 to 100
    optimization_efficiency_rate: Decimal
    recurring_subscriptions: List[RecurringSubscription]
    annual_fee_audit: List[Dict[str, Any]]
    actionable_recommendations: List[str]
    forecast_30d_spending: Decimal
    forecast_30d_potential_rewards: Decimal
