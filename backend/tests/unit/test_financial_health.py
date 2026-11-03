import pytest
from decimal import Decimal
from datetime import datetime
from app.models.entities import Transaction, CreditCard
from app.services.financial_health.health_engine import FinancialHealthEngine

def test_financial_health_recurring_subscriptions_detection():
    card = CreditCard(
        id="c1",
        user_id="u1",
        card_name="Millennia",
        bank_name="HDFC",
        annual_fee=Decimal("1000.00"),
        is_active=True
    )
    card.benefits = []

    txns = [
        Transaction(
            id="t1",
            user_id="u1",
            card_id="c1",
            merchant_name="Netflix",
            category_id="entertainment",
            amount=Decimal("649.00"),
            transaction_date=datetime(2026, 9, 1),
            is_recurring=True,
            reward_earned_monetary=Decimal("6.49"),
            potential_optimal_reward=Decimal("6.49")
        ),
        Transaction(
            id="t2",
            user_id="u1",
            card_id="c1",
            merchant_name="Netflix",
            category_id="entertainment",
            amount=Decimal("649.00"),
            transaction_date=datetime(2026, 10, 1),
            is_recurring=True,
            reward_earned_monetary=Decimal("6.49"),
            potential_optimal_reward=Decimal("6.49")
        ),
        Transaction(
            id="t3",
            user_id="u1",
            card_id="c1",
            merchant_name="Local Cafe",
            category_id="dining",
            amount=Decimal("500.00"),
            transaction_date=datetime(2026, 10, 5),
            is_recurring=False,
            reward_earned_monetary=Decimal("5.00"),
            potential_optimal_reward=Decimal("25.00")
        )
    ]

    report = FinancialHealthEngine.analyze_health(transactions=txns, cards=[card])

    assert report.health_score > 0
    assert len(report.recurring_subscriptions) >= 1
    assert report.recurring_subscriptions[0].merchant_name == "Netflix"
    assert report.recurring_subscriptions[0].annual_cost == Decimal("7788.00")
    assert len(report.annual_fee_audit) == 1
    assert report.annual_fee_audit[0]["annual_fee"] == 1000.0
    assert report.forecast_30d_spending > Decimal("0.00")


def test_cibil_band_classification():
    from app.api.v1.analytics import get_cibil_band
    assert get_cibil_band(810) == "Excellent"
    assert get_cibil_band(760) == "Excellent"
    assert get_cibil_band(720) == "Good"
    assert get_cibil_band(680) == "Fair"
    assert get_cibil_band(580) == "Needs Attention"
    assert get_cibil_band(300) == "Needs Attention"


def test_credit_score_request_validation():
    from app.schemas.analytics import CreditScoreCreateRequest, CreditScoreUpdateRequest
    req = CreditScoreCreateRequest(score=750, notes="Verified score")
    assert req.score == 750
    assert req.notes == "Verified score"

    update_req = CreditScoreUpdateRequest(score=800, notes="Updated via bank statement")
    assert update_req.score == 800
    assert update_req.notes == "Updated via bank statement"

