from typing import List, Dict, Optional, Any
from decimal import Decimal
from datetime import datetime
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

class PaymentMethodSpend(BaseModel):
    payment_method: str
    total_amount: Decimal
    percentage_of_total: Decimal
    transaction_count: int

class SpendingAnalyticsResponse(BaseModel):
    total_spending: Decimal
    total_transactions: int
    category_breakdown: List[CategorySpend]
    monthly_trend: List[MonthlySpend]
    top_merchants: List[Dict[str, Any]] = []
    payment_method_breakdown: List[PaymentMethodSpend] = []

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
    spending_trend_pct: Optional[Decimal] = Decimal("0.0")
    educational_alerts: List[str] = []
    budget_status_summary: Optional[Dict[str, Any]] = None
    calculation_breakdown: Optional[Dict[str, Any]] = None
    data_sufficiency: Optional[str] = "COMPLETE"
    omitted_indicators: List[str] = []

class CreditScoreCreateRequest(BaseModel):
    score: int
    source: Optional[str] = "User-Provided (Manual Entry)"
    notes: Optional[str] = None
    recorded_at: Optional[datetime] = None

class CreditScoreUpdateRequest(BaseModel):
    score: int
    notes: Optional[str] = None
    recorded_at: Optional[datetime] = None

class CreditScoreResponse(BaseModel):
    id: str
    score: int
    score_band: str
    source: str
    recorded_at: datetime
    notes: Optional[str] = None

class CreditHealthSummaryResponse(BaseModel):
    current_score: Optional[int] = None
    score_band: Optional[str] = None
    source: Optional[str] = None
    last_updated: Optional[str] = None
    score_history: List[CreditScoreResponse] = []
    credit_utilization_pct: Optional[Decimal] = None
    total_credit_limit: Decimal = Decimal("0.00")
    total_outstanding_balance: Decimal = Decimal("0.00")
    cards_count: int = 0
    financial_pathway: str = "CREDIT_CARD"

class AdvancedFinancialAnalyticsResponse(BaseModel):
    overview_kpis: Dict[str, Any]
    time_series: Dict[str, List[Dict[str, Any]]]
    category_distribution: List[Dict[str, Any]]
    monthly_insights: Dict[str, Any]
    credit_health: CreditHealthSummaryResponse

