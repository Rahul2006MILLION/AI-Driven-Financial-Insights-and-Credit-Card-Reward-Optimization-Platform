"""
Supabase PostgreSQL Production Integration & Tenant Isolation Test Suite.
Verifies registration, card management, transactions, concurrent execution,
and multi-user security isolation on Supabase PostgreSQL.
"""
import asyncio
import uuid
from decimal import Decimal
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app, init_db

@pytest.mark.asyncio
async def test_supabase_e2e_user_journey_and_tenant_isolation():
    """
    Validates:
    1. User A & User B registration and JWT authentication.
    2. Adding cards with decimal fee precision & querying cards.
    3. Recording transactions and calculating rewards against stored rules.
    4. Concurrent transaction insertion with asyncio.gather.
    5. Tenant Isolation: User B cannot access User A's cards or transactions.
    """
    unique_a = uuid.uuid4().hex[:8]
    unique_b = uuid.uuid4().hex[:8]

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Register User A
        reg_a = await client.post("/api/v1/auth/register", json={
            "email": f"tenant_a_{unique_a}@cliq.finance",
            "password": "SecurePassword123!",
            "full_name": "Tenant Alpha",
            "preferred_language": "en",
            "currency": "INR"
        })
        assert reg_a.status_code == 200, f"User A registration failed: {reg_a.text}"
        token_a = reg_a.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # 2. Register User B
        reg_b = await client.post("/api/v1/auth/register", json={
            "email": f"tenant_b_{unique_b}@cliq.finance",
            "password": "SecurePassword456!",
            "full_name": "Tenant Beta",
            "preferred_language": "en",
            "currency": "INR"
        })
        assert reg_b.status_code == 200, f"User B registration failed: {reg_b.text}"
        token_b = reg_b.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # Verify Profiles
        prof_a = await client.get("/api/v1/profile", headers=headers_a)
        prof_b = await client.get("/api/v1/profile", headers=headers_b)
        assert prof_a.status_code == 200
        assert prof_b.status_code == 200
        assert prof_a.json()["email"] == f"tenant_a_{unique_a}@cliq.finance"
        assert prof_b.json()["email"] == f"tenant_b_{unique_b}@cliq.finance"

        # 3. User A Adds a Credit Card (HDFC Millennia with 5% dining cashback)
        card_a_resp = await client.post("/api/v1/cards", headers=headers_a, json={
            "card_name": "HDFC Millennia Card",
            "bank_name": "HDFC Bank",
            "network": "VISA",
            "card_type": "CREDIT",
            "card_variant": "Contactless",
            "annual_fee": 1000.00,
            "rules": [
                {
                    "category_id": "dining",
                    "merchant_pattern": "Swiggy",
                    "reward_type": "CASHBACK",
                    "reward_rate_percentage": 5.00,
                    "monthly_cap_amount": 1000.00
                },
                {
                    "category_id": "all",
                    "reward_type": "CASHBACK",
                    "reward_rate_percentage": 1.00
                }
            ]
        })
        assert card_a_resp.status_code == 201, f"Card creation failed: {card_a_resp.text}"
        card_a_id = card_a_resp.json()["id"]

        # 4. Query User A's cards
        cards_a = await client.get("/api/v1/cards", headers=headers_a)
        assert cards_a.status_code == 200
        assert len(cards_a.json()) == 1
        assert cards_a.json()[0]["id"] == card_a_id
        assert Decimal(str(cards_a.json()[0]["annual_fee"])) == Decimal("1000.00")

        # 5. User B Queries Cards (Must be empty - Strict Tenant Isolation)
        cards_b = await client.get("/api/v1/cards", headers=headers_b)
        assert cards_b.status_code == 200
        assert len(cards_b.json()) == 0, "Security Violation: User B can see User A's cards!"

        # User B attempts to access User A's card directly by ID
        direct_card_leak = await client.get(f"/api/v1/cards/{card_a_id}", headers=headers_b)
        assert direct_card_leak.status_code in (404, 403), "Security Violation: User B directly retrieved User A's card!"

        # 6. Reward Calculation on Stored Card
        opt_resp = await client.post("/api/v1/optimization/recommend", headers=headers_a, json={
            "amount": 2000.00,
            "category_id": "dining",
            "merchant_name": "Swiggy"
        })
        assert opt_resp.status_code == 200
        opt_data = opt_resp.json()
        assert opt_data["recommended_card"]["card_id"] == card_a_id
        # Expected reward calculation: 5% of 2000 = 100 cashback (+ any instant discount)
        assert float(opt_data["recommended_card"]["post_reward_monetary"]) > 0

        # 7. Concurrent Transaction Inserts for User A
        async def insert_txn(merchant: str, amount: float):
            return await client.post("/api/v1/transactions", headers=headers_a, json={
                "merchant_name": merchant,
                "amount": amount,
                "category_id": "dining",
                "card_id": card_a_id
            })

        tx_tasks = [
            insert_txn(f"Swiggy Delivery #{i}", 500.00 + (i * 50))
            for i in range(5)
        ]
        tx_responses = await asyncio.gather(*tx_tasks)
        for resp in tx_responses:
            assert resp.status_code == 201, f"Concurrent insert failed: {resp.text}"

        # 8. Verify Transactions Listing & Ownership Isolation
        txns_a = await client.get("/api/v1/transactions", headers=headers_a)
        assert txns_a.status_code == 200
        assert len(txns_a.json()) == 5

        # User B Queries Transactions (Must be completely empty)
        txns_b = await client.get("/api/v1/transactions", headers=headers_b)
        assert txns_b.status_code == 200
        assert len(txns_b.json()) == 0, "Security Violation: User B can see User A's transactions!"

        # User B cannot delete or modify User A's transaction
        target_tx_id = txns_a.json()[0]["id"]
        del_attempt = await client.delete(f"/api/v1/transactions/{target_tx_id}", headers=headers_b)
        assert del_attempt.status_code in (404, 403), "Security Violation: User B deleted User A's transaction!"

        # 9. Verify Spending Analytics isolation
        analytics_a = await client.get("/api/v1/analytics/spending", headers=headers_a)
        assert analytics_a.status_code == 200
        assert analytics_a.json()["total_transactions"] == 5

        analytics_b = await client.get("/api/v1/analytics/spending", headers=headers_b)
        assert analytics_b.status_code == 200
        assert analytics_b.json()["total_transactions"] == 0

