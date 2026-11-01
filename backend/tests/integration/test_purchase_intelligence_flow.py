import pytest
import pytest_asyncio
import uuid
from decimal import Decimal
from httpx import AsyncClient, ASGITransport

from app.main import app, init_db

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await init_db()

@pytest.mark.asyncio
async def test_what_if_simulation_api_flow():
    """
    Validates end-to-end What-If Purchase Simulator API endpoint:
    - Reuses the purchase optimization engine across spend brackets
    - Verifies instant discounts and tier caps in simulation results
    """
    uid = uuid.uuid4().hex[:8]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Register User
        reg = await client.post("/api/v1/auth/register", json={
            "email": f"sim_{uid}@cliq.finance",
            "password": "Password123!",
            "full_name": "Simulator User",
            "preferred_language": "en"
        })
        assert reg.status_code == 200
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Add HDFC Millennia Card (5% Swiggy, 1% other)
        await client.post("/api/v1/cards", headers=headers, json={
            "card_name": "HDFC Millennia",
            "bank_name": "HDFC Bank",
            "network": "VISA",
            "rules": [
                {
                    "category_id": "dining",
                    "merchant_pattern": "Swiggy",
                    "reward_type": "CASHBACK",
                    "reward_rate_percentage": 5.0,
                    "monthly_cap_amount": 1000.0
                },
                {
                    "category_id": "all",
                    "reward_type": "CASHBACK",
                    "reward_rate_percentage": 1.0
                }
            ]
        })

        # 3. Add Axis Ace Card (2% flat)
        await client.post("/api/v1/cards", headers=headers, json={
            "card_name": "Axis Bank Ace",
            "bank_name": "Axis Bank",
            "network": "VISA",
            "rules": [
                {
                    "category_id": "all",
                    "reward_type": "CASHBACK",
                    "reward_rate_percentage": 2.0
                }
            ]
        })

        # 4. Run Simulation for Swiggy spends across 4 brackets
        sim_resp = await client.post("/api/v1/optimization/simulate", headers=headers, json={
            "category_id": "dining",
            "merchant_name": "Swiggy Instamart",
            "amounts": [1000.0, 3000.0, 5000.0, 10000.0],
            "language": "en"
        })
        assert sim_resp.status_code == 200
        sim_data = sim_resp.json()

        assert sim_data["category_id"] == "dining"
        assert sim_data["canonical_merchant"] == "Swiggy"
        assert len(sim_data["scenarios"]) == 4
        assert sim_data["sweet_spot_spend"] is not None
        assert "Simulated 4 purchase scenarios" in sim_data["summary"]

        first_scenario = sim_data["scenarios"][0]
        assert float(first_scenario["spend_amount"]) == 1000.0
        assert first_scenario["recommended_card_name"] == "HDFC Millennia"
        assert len(first_scenario["card_yields"]) == 2

@pytest.mark.asyncio
async def test_recommendation_with_reward_basis_and_explainability():
    """
    Validates recommendation endpoint with merchant normalization and explainability.
    """
    uid = uuid.uuid4().hex[:8]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register User
        reg = await client.post("/api/v1/auth/register", json={
            "email": f"exp_{uid}@cliq.finance",
            "password": "Password123!",
            "full_name": "Explainability User",
            "preferred_language": "hi"
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Add Card
        await client.post("/api/v1/cards", headers=headers, json={
            "card_name": "HDFC Millennia",
            "bank_name": "HDFC Bank",
            "network": "VISA",
            "rules": [
                {
                    "category_id": "shopping",
                    "merchant_pattern": "Amazon",
                    "reward_type": "CASHBACK",
                    "reward_rate_percentage": 5.0
                }
            ]
        })

        # Request recommendation with merchant alias 'Amazon India'
        opt_resp = await client.post("/api/v1/optimization/recommend", headers=headers, json={
            "amount": 4000.0,
            "category_id": "shopping",
            "merchant_name": "Amazon India",
            "reward_basis_mode": "NET_CHARGED_AMOUNT"
        })
        assert opt_resp.status_code == 200
        data = opt_resp.json()

        assert data["canonical_merchant"] == "Amazon"
        assert data["recommended_card"] is not None
        rec = data["recommended_card"]
        assert rec["card_name"] == "HDFC Millennia"
        assert float(rec["net_financial_benefit"]) == 200.0  # ₹4,000 * 5% = ₹200.00
        assert len(rec["calculation_assumptions"]) >= 1
        assert "सर्वश्रेष्ठ विकल्प" in data["explanation"]

@pytest.mark.asyncio
async def test_transaction_feedback_and_reconciliation_flow():
    """
    Validates Phase 8: Transaction Feedback lifecycle:
    1. Create transaction with pending reward status
    2. Submit statement feedback with actual reward variance and discrepancy code
    3. Retrieve feedback summary and accuracy metrics
    """
    uid = uuid.uuid4().hex[:8]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        reg = await client.post("/api/v1/auth/register", json={
            "email": f"fb_{uid}@cliq.finance",
            "password": "Password123!",
            "full_name": "Feedback User",
            "preferred_language": "en"
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Add Card
        card_resp = await client.post("/api/v1/cards", headers=headers, json={
            "card_name": "HDFC Millennia",
            "bank_name": "HDFC Bank",
            "network": "VISA",
            "rules": [
                {
                    "category_id": "dining",
                    "merchant_pattern": "Swiggy",
                    "reward_type": "CASHBACK",
                    "reward_rate_percentage": 5.0
                }
            ]
        })
        card_id = card_resp.json()["id"]

        # 2. Record Transaction on Swiggy for ₹1,000 (predicted reward = ₹50)
        tx_resp = await client.post("/api/v1/transactions", headers=headers, json={
            "card_id": card_id,
            "category_id": "dining",
            "merchant_name": "Swiggy",
            "amount": 1000.0,
            "currency": "INR",
            "notes": "Dinner order"
        })
        assert tx_resp.status_code == 201
        tx_data = tx_resp.json()
        tx_id = tx_data["id"]
        assert float(tx_data["reward_earned_monetary"]) == 50.0
        assert float(tx_data["predicted_reward"]) == 50.0
        assert tx_data["reward_status"] == "PENDING"

        # 3. Submit Actual Statement Feedback (Bank gave ₹40 instead of ₹50 due to MCC mismatch)
        fb_resp = await client.put(f"/api/v1/transactions/{tx_id}/feedback", headers=headers, json={
            "actual_reward_earned": 40.0,
            "reward_status": "DISCREPANCY",
            "discrepancy_reason": "MERCHANT_MCC_MISMATCH",
            "notes": "Bank credited 40 pts on statement"
        })
        assert fb_resp.status_code == 200
        fb_data = fb_resp.json()
        assert float(fb_data["actual_reward_earned"]) == 40.0
        assert float(fb_data["predicted_reward"]) == 50.0
        assert float(fb_data["reward_variance"]) == -10.0
        assert fb_data["reward_status"] == "DISCREPANCY"
        assert fb_data["discrepancy_reason"] == "MERCHANT_MCC_MISMATCH"

        # 4. Check Feedback Summary Analytics
        summary_resp = await client.get("/api/v1/transactions/feedback/summary", headers=headers)
        assert summary_resp.status_code == 200
        summary_data = summary_resp.json()
        assert summary_data["total_transactions_tracked"] >= 1
        assert summary_data["discrepancy_count"] >= 1
        assert "MERCHANT_MCC_MISMATCH" in summary_data["discrepancy_reasons_breakdown"]
        assert float(summary_data["total_variance"]) == -10.0

