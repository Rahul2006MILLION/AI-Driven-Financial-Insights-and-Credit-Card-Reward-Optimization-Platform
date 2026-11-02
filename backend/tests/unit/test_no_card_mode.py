import pytest
import pytest_asyncio
import uuid
from decimal import Decimal
from datetime import datetime, date, timedelta
from httpx import AsyncClient, ASGITransport

from app.main import app, init_db
from app.core.database import AsyncSessionLocal
from app.models.entities import Profile, Income, Transaction, UserBudget
from app.services.financial_health.health_engine import FinancialHealthEngine

@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    await init_db()

@pytest.mark.asyncio
async def test_no_credit_card_user_registration_and_login():
    """Validates registration and login with financial_pathway='NO_CREDIT_CARD'."""
    unique = uuid.uuid4().hex[:8]
    email = f"nocard_{unique}@cliq.ai"
    password = "SecurePassword123!"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register as NO_CREDIT_CARD user
        reg_resp = await client.post(
            "/api/v1/auth/register",
            json={
                "email": email,
                "password": password,
                "full_name": f"NoCard User {unique}",
                "financial_pathway": "NO_CREDIT_CARD"
            }
        )
        assert reg_resp.status_code == 200, reg_resp.text
        reg_data = reg_resp.json()
        assert reg_data["financial_pathway"] == "NO_CREDIT_CARD"
        token = reg_data["access_token"]

        # Check me / profile endpoint
        me_resp = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert me_resp.status_code == 200
        assert me_resp.json()["financial_pathway"] == "NO_CREDIT_CARD"

@pytest.mark.asyncio
async def test_income_crud_and_tenant_isolation_idor():
    """Validates Income CRUD, summary calculation, and strict IDOR tenant isolation."""
    u1 = uuid.uuid4().hex[:8]
    u2 = uuid.uuid4().hex[:8]
    email1, email2 = f"u1_{u1}@cliq.ai", f"u2_{u2}@cliq.ai"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register User 1
        r1 = await client.post("/api/v1/auth/register", json={
            "email": email1, "password": "Password123!", "full_name": "User One", "financial_pathway": "NO_CREDIT_CARD"
        })
        token1 = r1.json()["access_token"]

        # Register User 2
        r2 = await client.post("/api/v1/auth/register", json={
            "email": email2, "password": "Password123!", "full_name": "User Two", "financial_pathway": "NO_CREDIT_CARD"
        })
        token2 = r2.json()["access_token"]

        # User 1 creates regular salary income
        inc_salary = await client.post(
            "/api/v1/incomes",
            headers={"Authorization": f"Bearer {token1}"},
            json={
                "source_name": "Full-time Job",
                "amount": 75000.00,
                "frequency": "MONTHLY",
                "is_irregular": False,
                "received_date": str(date.today() - timedelta(days=5))
            }
        )
        assert inc_salary.status_code == 201
        salary_id = inc_salary.json()["id"]

        # User 1 creates irregular freelance income
        inc_freelance = await client.post(
            "/api/v1/incomes",
            headers={"Authorization": f"Bearer {token1}"},
            json={
                "source_name": "Freelance Design",
                "amount": 25000.00,
                "frequency": "ONE_TIME",
                "is_irregular": True,
                "received_date": str(date.today() - timedelta(days=15))
            }
        )
        assert inc_freelance.status_code == 201
        freelance_id = inc_freelance.json()["id"]

        # User 1 lists incomes
        list_resp = await client.get(
            "/api/v1/incomes",
            headers={"Authorization": f"Bearer {token1}"}
        )
        assert list_resp.status_code == 200
        items = list_resp.json()
        assert len(items) == 2

        # User 1 fetches income summary
        sum_resp = await client.get(
            "/api/v1/incomes/summary",
            headers={"Authorization": f"Bearer {token1}"}
        )
        assert sum_resp.status_code == 200
        sum_data = sum_resp.json()
        assert float(sum_data["regular_income"]) == 75000.00
        assert sum_data["income_sources_count"] == 2
        assert float(sum_data["total_monthly_income"]) >= 75000.00

        # User 1 updates freelance income
        put_resp = await client.put(
            f"/api/v1/incomes/{freelance_id}",
            headers={"Authorization": f"Bearer {token1}"},
            json={
                "amount": 30000.00,
                "notes": "Updated freelance contract"
            }
        )
        assert put_resp.status_code == 200
        assert float(put_resp.json()["amount"]) == 30000.00

        # IDOR ATTACK: User 2 attempts to GET User 1's income
        idor_get = await client.get(
            f"/api/v1/incomes/{salary_id}",
            headers={"Authorization": f"Bearer {token2}"}
        )
        assert idor_get.status_code == 404, "User 2 should not see User 1's income"

        # IDOR ATTACK: User 2 attempts to UPDATE User 1's income
        idor_put = await client.put(
            f"/api/v1/incomes/{salary_id}",
            headers={"Authorization": f"Bearer {token2}"},
            json={"amount": 1.00}
        )
        assert idor_put.status_code == 404, "User 2 should not be able to modify User 1's income"

        # IDOR ATTACK: User 2 attempts to DELETE User 1's income
        idor_del = await client.delete(
            f"/api/v1/incomes/{salary_id}",
            headers={"Authorization": f"Bearer {token2}"}
        )
        assert idor_del.status_code == 404, "User 2 should not be able to delete User 1's income"

        # User 1 deletes freelance income
        del_resp = await client.delete(
            f"/api/v1/incomes/{freelance_id}",
            headers={"Authorization": f"Bearer {token1}"}
        )
        assert del_resp.status_code in (200, 204)

        # Verify deletion
        list_after = await client.get(
            "/api/v1/incomes",
            headers={"Authorization": f"Bearer {token1}"}
        )
        assert len(list_after.json()) == 1

@pytest.mark.asyncio
async def test_non_card_transaction_recording_and_spending_analytics():
    """Validates non-card transactions (UPI, CASH) and payment method breakdown in analytics."""
    unique = uuid.uuid4().hex[:8]
    email = f"upi_user_{unique}@cliq.ai"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register user
        reg = await client.post("/api/v1/auth/register", json={
            "email": email, "password": "Password123!", "full_name": "UPI User", "financial_pathway": "NO_CREDIT_CARD"
        })
        token = reg.json()["access_token"]

        # Record UPI transaction
        t_upi = await client.post(
            "/api/v1/transactions",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "merchant_name": "Local Kirana",
                "amount": 850.00,
                "category_id": "grocery",
                "payment_method": "UPI",
                "card_id": None
            }
        )
        assert t_upi.status_code == 201
        assert t_upi.json()["payment_method"] == "UPI"
        assert t_upi.json()["card_id"] is None

        # Record CASH transaction
        t_cash = await client.post(
            "/api/v1/transactions",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "merchant_name": "Street Food Stall",
                "amount": 150.00,
                "category_id": "dining",
                "payment_method": "CASH",
                "card_id": None
            }
        )
        assert t_cash.status_code == 201
        assert t_cash.json()["payment_method"] == "CASH"

        # Check spending analytics
        analytics_resp = await client.get(
            "/api/v1/analytics/spending",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert analytics_resp.status_code == 200
        an_data = analytics_resp.json()
        assert float(an_data["total_spending"]) == 1000.00
        assert an_data["total_transactions"] == 2

        # Verify payment method breakdown
        pm_breakdown = an_data.get("payment_method_breakdown", [])
        assert len(pm_breakdown) >= 2
        methods = {p["payment_method"]: float(p["total_amount"]) for p in pm_breakdown}
        assert methods["UPI"] == 850.00
        assert methods["CASH"] == 150.00

@pytest.mark.asyncio
async def test_financial_health_engine_no_card_mode():
    """Validates FinancialHealthEngine resilience calculation for zero-card users."""
    now = datetime.now()

    # Create dummy non-card transactions
    t1 = Transaction(
        id=str(uuid.uuid4()),
        user_id="dummy_user",
        merchant_name="Supermarket",
        category_id="grocery",
        amount=Decimal("5000.00"),
        reward_earned_monetary=Decimal("0.00"),
        potential_optimal_reward=Decimal("0.00"),
        payment_method="UPI",
        transaction_date=now - timedelta(days=2)
    )
    t2 = Transaction(
        id=str(uuid.uuid4()),
        user_id="dummy_user",
        merchant_name="Coffee Day",
        category_id="dining",
        amount=Decimal("1200.00"),
        reward_earned_monetary=Decimal("0.00"),
        potential_optimal_reward=Decimal("0.00"),
        payment_method="CASH",
        transaction_date=now - timedelta(days=4)
    )

    # Incomes: 60,000 monthly salary
    inc = Income(
        id=str(uuid.uuid4()),
        user_id="dummy_user",
        source_name="Company Salary",
        amount=Decimal("60000.00"),
        frequency="MONTHLY",
        is_irregular=False,
        received_date=date.today() - timedelta(days=1)
    )

    # Budget
    budget = UserBudget(
        id=str(uuid.uuid4()),
        user_id="dummy_user",
        monthly_income=Decimal("60000.00"),
        total_budget=Decimal("30000.00"),
        category_budgets_json='{"grocery": 10000, "dining": 5000}'
    )

    report = FinancialHealthEngine.analyze_health(
        transactions=[t1, t2],
        cards=[],
        budget=budget,
        incomes=[inc],
        financial_pathway="NO_CREDIT_CARD"
    )

    # Assertions
    assert report.health_score > 0
    assert len(report.omitted_indicators) > 0
    assert "Credit Card Reward Optimization Efficiency" in report.omitted_indicators
    assert "Card Annual Fee vs Reward Breakeven" in report.omitted_indicators
    assert "Credit Limit Utilization Ratio" in report.omitted_indicators
    assert report.calculation_breakdown is not None
    assert "pillars" in report.calculation_breakdown
    assert "savings_and_cash_flow" in report.calculation_breakdown["pillars"]
    assert "budget_adherence" in report.calculation_breakdown["pillars"]
    assert "subscription_hygiene" in report.calculation_breakdown["pillars"]
    assert report.data_sufficiency == "COMPLETE"

@pytest.mark.asyncio
async def test_non_card_transaction_with_user_cards_present_rejects_card_attribution():
    """Validates DEF-01: Non-card transactions never bind to card_id or earn rewards even if user owns credit cards."""
    unique = uuid.uuid4().hex[:8]
    email = f"cardholder_{unique}@cliq.ai"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register user as CREDIT_CARD pathway
        reg = await client.post("/api/v1/auth/register", json={
            "email": email, "password": "Password123!", "full_name": "Card Owner", "financial_pathway": "CREDIT_CARD"
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # User adds a credit card
        add_card = await client.post(
            "/api/v1/cards",
            headers=headers,
            json={
                "card_name": "Premium Rewards Card",
                "bank_name": "HDFC",
                "network": "VISA",
                "last_four_digits": "4321",
                "billing_cycle_day": 15
            }
        )
        assert add_card.status_code == 201
        card_id = add_card.json()["id"]

        # Record a CASH transaction (without card_id)
        cash_tx = await client.post(
            "/api/v1/transactions",
            headers=headers,
            json={
                "merchant_name": "Local Grocery",
                "amount": 2500.00,
                "category_id": "grocery",
                "payment_method": "CASH",
                "card_id": None
            }
        )
        assert cash_tx.status_code == 201
        tx_data = cash_tx.json()
        assert tx_data["card_id"] is None
        assert float(tx_data["reward_earned_monetary"]) == 0.00
        assert float(tx_data["potential_optimal_reward"]) == 0.00

        # Attempt to record CASH transaction WITH a card_id -> must be rejected with 400
        invalid_tx = await client.post(
            "/api/v1/transactions",
            headers=headers,
            json={
                "merchant_name": "Local Grocery",
                "amount": 2500.00,
                "category_id": "grocery",
                "payment_method": "CASH",
                "card_id": card_id
            }
        )
        assert invalid_tx.status_code == 400
        assert "Non-card expenses must not be bound to a credit card" in invalid_tx.json()["detail"]

@pytest.mark.asyncio
async def test_rolling_90d_monthly_median_and_one_time_expiry():
    """Validates DEF-03 & DEF-04: True monthly aggregation before median, and excluding one-time income older than 90 days."""
    unique = uuid.uuid4().hex[:8]
    email = f"income_test_{unique}@cliq.ai"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        reg = await client.post("/api/v1/auth/register", json={
            "email": email, "password": "Password123!", "full_name": "Income Tester", "financial_pathway": "NO_CREDIT_CARD"
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        today = date.today()

        # Add one-time income received 100 days ago (older than 90 days)
        old_income = await client.post(
            "/api/v1/incomes",
            headers=headers,
            json={
                "source_name": "Old Bonus",
                "amount": 90000.00,
                "frequency": "ONE_TIME",
                "is_irregular": True,
                "received_date": str(today - timedelta(days=100))
            }
        )
        assert old_income.status_code == 201

        # Summary should exclude old one-time income
        sum1 = await client.get("/api/v1/incomes/summary", headers=headers)
        assert sum1.status_code == 200
        assert float(sum1.json()["total_monthly_income"]) == 0.00
        assert sum1.json()["has_income_data"] is False

        # Add recent one-time income received 10 days ago (within 90 days)
        recent_income = await client.post(
            "/api/v1/incomes",
            headers=headers,
            json={
                "source_name": "Recent Freelance Gig",
                "amount": 30000.00,
                "frequency": "ONE_TIME",
                "is_irregular": True,
                "received_date": str(today - timedelta(days=10))
            }
        )
        assert recent_income.status_code == 201

        sum2 = await client.get("/api/v1/incomes/summary", headers=headers)
        assert sum2.status_code == 200
        # 30,000 / 3 months = 10,000 / month
        assert float(sum2.json()["total_monthly_income"]) == 10000.00
        assert sum2.json()["has_income_data"] is True

def test_financial_health_empty_profile_provisional_zero_score():
    """Validates DEF-05: Empty profile evaluates to 0 health score with INSUFFICIENT_DATA status."""
    report = FinancialHealthEngine.analyze_health(
        transactions=[],
        cards=[],
        budget=None,
        incomes=[],
        financial_pathway="NO_CREDIT_CARD"
    )

    assert report.health_score == 0
    assert report.data_sufficiency == "INSUFFICIENT_DATA"
    assert any("Data Baseline Notice" in alert for alert in report.educational_alerts)
    assert any("Income Setup" in rec for rec in report.actionable_recommendations)

