import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app, init_db

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await init_db()

@pytest.mark.asyncio
async def test_full_application_e2e_journey():
    unique_id = uuid.uuid4().hex[:8]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Register User
        reg_resp = await client.post("/api/v1/auth/register", json={
            "email": f"priya_{unique_id}@cliq.finance",
            "password": "SecurePassword999!",
            "full_name": "Priya Sharma",
            "preferred_language": "en",
            "currency": "INR"
        })
        assert reg_resp.status_code == 200
        auth_data = reg_resp.json()
        token = auth_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Add HDFC Millennia Card
        card1_resp = await client.post("/api/v1/cards", headers=headers, json={
            "card_name": "HDFC Millennia",
            "bank_name": "HDFC Bank",
            "network": "VISA",
            "card_type": "CREDIT",
            "annual_fee": 1000.0,
            "rules": [
                {
                    "category_id": "dining",
                    "merchant_pattern": "Swiggy",
                    "reward_type": "CASHBACK",
                    "reward_rate_percentage": 5.0,
                    "monthly_cap_amount": 1000.0
                },
                {
                    "category_id": "shopping",
                    "merchant_pattern": "Amazon",
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
        assert card1_resp.status_code == 201
        card1_id = card1_resp.json()["id"]

        # 3. Add Axis Ace Card
        card2_resp = await client.post("/api/v1/cards", headers=headers, json={
            "card_name": "Axis Bank Ace",
            "bank_name": "Axis Bank",
            "network": "VISA",
            "card_type": "CREDIT",
            "annual_fee": 499.0,
            "rules": [
                {
                    "category_id": "all",
                    "reward_type": "CASHBACK",
                    "reward_rate_percentage": 2.0
                }
            ]
        })
        assert card2_resp.status_code == 201
        card2_id = card2_resp.json()["id"]

        # 4. Reward Optimization Recommendation for Swiggy spend (₹2,000)
        opt_resp = await client.post("/api/v1/optimization/recommend", headers=headers, json={
            "amount": 2000.0,
            "category_id": "dining",
            "merchant_name": "Swiggy"
        })
        assert opt_resp.status_code == 200
        opt_data = opt_resp.json()

        # Millennia (5% -> ₹100) must beat Axis Ace (2% -> ₹40)
        assert opt_data["recommended_card"]["card_id"] == card1_id
        assert opt_data["recommended_card"]["card_name"] == "HDFC Millennia"
        assert float(opt_data["recommended_card"]["expected_reward_monetary"]) == 100.0
        assert float(opt_data["recommended_card"]["effective_rate_percentage"]) == 5.0
        assert len(opt_data["alternatives"]) == 1
        assert opt_data["alternatives"][0]["card_name"] == "Axis Bank Ace"
        assert float(opt_data["alternatives"][0]["expected_reward_monetary"]) == 40.0

        # Check calculation breakdown transparency
        steps = opt_data["recommended_card"]["breakdown_steps"]
        assert len(steps) >= 2
        assert "Swiggy" in steps[0]["reason"]

        # 5. Multilingual Profile Update to Hindi ('hi')
        upd_prof = await client.put("/api/v1/profile", headers=headers, json={
            "preferred_language": "hi"
        })
        assert upd_prof.status_code == 200
        assert upd_prof.json()["preferred_language"] == "hi"

        # Re-run optimization and assert Hindi explanation
        opt_hi_resp = await client.post("/api/v1/optimization/recommend", headers=headers, json={
            "amount": 2000.0,
            "category_id": "dining",
            "merchant_name": "Swiggy"
        })
        assert "सर्वश्रेष्ठ विकल्प" in opt_hi_resp.json()["explanation"]

        # 6. Card Comparison between Millennia and Ace
        cmp_resp = await client.post("/api/v1/optimization/compare", headers=headers, json={
            "card_ids": [card1_id, card2_id]
        })
        assert cmp_resp.status_code == 200
        cmp_data = cmp_resp.json()
        assert len(cmp_data["cards"]) == 2
        assert len(cmp_data["category_matrix"]) == 6

        # 7. Record a Transaction
        txn_resp = await client.post("/api/v1/transactions", headers=headers, json={
            "merchant_name": "Swiggy Order",
            "amount": 1500.0,
            "category_id": "dining",
            "card_id": card1_id
        })
        assert txn_resp.status_code == 201
        txn_data = txn_resp.json()
        # 5% of 1500 = 75.00
        assert float(txn_data["reward_earned_monetary"]) == 75.0
        assert float(txn_data["potential_optimal_reward"]) == 75.0

        # 8. Spending Analytics
        spend_resp = await client.get("/api/v1/analytics/spending", headers=headers)
        assert spend_resp.status_code == 200
        assert float(spend_resp.json()["total_spending"]) == 1500.0

        # 9. Conversational Assistant Query in Hindi
        chat_resp = await client.post("/api/v1/assistant/chat", headers=headers, json={
            "query": "स्विगी पर कौन सा कार्ड इस्तेमाल करूँ?",
            "language": "hi"
        })
        assert chat_resp.status_code == 200
        assert "HDFC Millennia" in chat_resp.json()["response"]
