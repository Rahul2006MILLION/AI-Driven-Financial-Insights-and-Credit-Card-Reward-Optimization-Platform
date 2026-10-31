import pytest
import pytest_asyncio
import uuid
from decimal import Decimal
from datetime import datetime, timedelta
from httpx import AsyncClient, ASGITransport
from app.main import app, init_db

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await init_db()

@pytest.mark.asyncio
async def test_card_wallet_search_and_filter():
    """Validates card search by query, bank, and network."""
    unique = uuid.uuid4().hex[:8]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register user
        reg = await client.post("/api/v1/auth/register", json={
            "email": f"wallet_{unique}@cliq.finance",
            "password": "Password123!",
            "full_name": "Wallet Tester",
            "preferred_language": "en"
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Add 3 distinct cards
        await client.post("/api/v1/cards", headers=headers, json={
            "card_name": "HDFC Millennia",
            "bank_name": "HDFC Bank",
            "network": "VISA",
            "card_variant": "Contactless",
            "annual_fee": 1000.0,
            "rules": []
        })
        await client.post("/api/v1/cards", headers=headers, json={
            "card_name": "SBI Cashback Card",
            "bank_name": "SBI Card",
            "network": "MASTERCARD",
            "card_variant": "Signature",
            "annual_fee": 999.0,
            "rules": []
        })
        await client.post("/api/v1/cards", headers=headers, json={
            "card_name": "HDFC Regalia Gold",
            "bank_name": "HDFC Bank",
            "network": "VISA",
            "card_variant": "Gold",
            "annual_fee": 2500.0,
            "rules": []
        })

        # 1. Search by bank
        resp_bank = await client.get("/api/v1/cards?bank=HDFC", headers=headers)
        assert resp_bank.status_code == 200
        assert len(resp_bank.json()) == 2

        # 2. Search by network
        resp_net = await client.get("/api/v1/cards?network=MASTERCARD", headers=headers)
        assert resp_net.status_code == 200
        assert len(resp_net.json()) == 1
        assert resp_net.json()[0]["card_name"] == "SBI Cashback Card"

        # 3. Free text query
        resp_q = await client.get("/api/v1/cards?query=Regalia", headers=headers)
        assert resp_q.status_code == 200
        assert len(resp_q.json()) == 1
        assert resp_q.json()[0]["card_name"] == "HDFC Regalia Gold"

@pytest.mark.asyncio
async def test_card_wallet_update_with_benefits_and_variant():
    """Validates editing card details, variant, fees, and benefits."""
    unique = uuid.uuid4().hex[:8]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        reg = await client.post("/api/v1/auth/register", json={
            "email": f"edit_{unique}@cliq.finance",
            "password": "Password123!",
            "full_name": "Editor",
            "preferred_language": "en"
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create card
        create_resp = await client.post("/api/v1/cards", headers=headers, json={
            "card_name": "Basic Card",
            "bank_name": "Axis Bank",
            "network": "VISA",
            "annual_fee": 500.0,
            "rules": [],
            "benefits": []
        })
        card_id = create_resp.json()["id"]

        # Update card with upgraded variant, fee waiver conditions, and structured benefits
        upd_resp = await client.put(f"/api/v1/cards/{card_id}", headers=headers, json={
            "card_name": "Axis Magnus Upgraded",
            "card_variant": "Burgundy Metal",
            "annual_fee": 12500.0,
            "renewal_waiver_spend": 2500000.0,
            "fee_waiver_condition_details": "Spend ₹25,00,000 in previous calendar year to waive annual fee.",
            "terms_source_url": "https://www.axisbank.com/magnus-terms",
            "benefits": [
                {
                    "benefit_type": "LOUNGE_ACCESS",
                    "title": "Unlimited International Airport Lounge Access",
                    "description": "Unlimited Priority Pass visits for primary cardholder and guests.",
                    "applicable_category": "travel",
                    "reward_basis": "COMPLIMENTARY",
                    "annual_value_estimate": 15000.0
                },
                {
                    "benefit_type": "PERMANENT",
                    "title": "5X Reward Points on Travel Edge Portal",
                    "description": "Earn 30 EDGE points per ₹200 spent on Axis Travel EDGE.",
                    "applicable_category": "travel",
                    "reward_percentage_or_points": 6.0,
                    "reward_basis": "FIXED_POINTS_PER_100",
                    "annual_value_estimate": 25000.0
                }
            ]
        })
        assert upd_resp.status_code == 200
        data = upd_resp.json()
        assert data["card_name"] == "Axis Magnus Upgraded"
        assert data["card_variant"] == "Burgundy Metal"
        assert float(data["annual_fee"]) == 12500.0
        assert float(data["renewal_waiver_spend"]) == 2500000.0
        assert "Spend ₹25,00,000" in data["fee_waiver_condition_details"]
        assert len(data["benefits"]) == 2
        assert data["benefits"][0]["benefit_type"] == "LOUNGE_ACCESS"
        assert data["benefits"][1]["benefit_type"] == "PERMANENT"

@pytest.mark.asyncio
async def test_card_wallet_duplicate_prevention_and_metadata_persistence():
    """Validates duplicate card registration prevention, cardholder name, and nickname persistence."""
    unique = uuid.uuid4().hex[:8]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        reg = await client.post("/api/v1/auth/register", json={
            "email": f"meta_{unique}@cliq.finance",
            "password": "Password123!",
            "full_name": "Priya Sharma",
            "preferred_language": "en"
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Register card with cardholder_name, nickname, last_four_digits
        card1_resp = await client.post("/api/v1/cards", headers=headers, json={
            "card_name": "HDFC Regalia Gold",
            "bank_name": "HDFC Bank",
            "network": "VISA",
            "card_variant": "Gold Metal",
            "cardholder_name": "PRIYA SHARMA",
            "nickname": "Primary Travel Card",
            "last_four_digits": "8821",
            "annual_fee": 2500.0,
            "terms_source_url": "https://www.hdfcbank.com/regalia-gold",
            "rules": []
        })
        assert card1_resp.status_code == 201
        card1_data = card1_resp.json()
        assert card1_data["cardholder_name"] == "PRIYA SHARMA"
        assert card1_data["nickname"] == "Primary Travel Card"
        assert card1_data["last_four_digits"] == "8821"

        # 2. Attempt duplicate card with same bank, name, and last 4 digits -> Should fail with 409 Conflict
        dup_resp = await client.post("/api/v1/cards", headers=headers, json={
            "card_name": "HDFC Regalia Gold",
            "bank_name": "HDFC Bank",
            "network": "VISA",
            "cardholder_name": "PRIYA SHARMA",
            "last_four_digits": "8821",
            "annual_fee": 2500.0,
            "terms_source_url": "https://www.hdfcbank.com/regalia-gold",
            "rules": []
        })
        assert dup_resp.status_code == 409
        assert "already have an active" in dup_resp.json()["detail"]

        # 3. Query search by nickname
        search_nick = await client.get("/api/v1/cards?query=Primary+Travel", headers=headers)
        assert search_nick.status_code == 200
        assert len(search_nick.json()) == 1
        assert search_nick.json()[0]["id"] == card1_data["id"]

        # 4. Inactive card deactivation and soft delete
        del_resp = await client.delete(f"/api/v1/cards/{card1_data['id']}", headers=headers)
        assert del_resp.status_code == 204

        # Verify it no longer appears in active list
        active_list = await client.get("/api/v1/cards", headers=headers)
        assert active_list.status_code == 200
        assert len(active_list.json()) == 0

@pytest.mark.asyncio
async def test_offers_discovery_filtering():
    """Validates offers discovery filtering by category, query, and user card match."""
    unique = uuid.uuid4().hex[:8]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        reg = await client.post("/api/v1/auth/register", json={
            "email": f"offers_{unique}@cliq.finance",
            "password": "Password123!",
            "full_name": "Offer Explorer",
            "preferred_language": "en"
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # User only adds an SBI card
        await client.post("/api/v1/cards", headers=headers, json={
            "card_name": "SBI SimplyClick",
            "bank_name": "SBI Card",
            "network": "VISA",
            "annual_fee": 499.0,
            "rules": []
        })

        # 1. Fetch all offers
        all_offers = await client.get("/api/v1/offers", headers=headers)
        assert all_offers.status_code == 200
        offers_list = all_offers.json()
        assert len(offers_list) >= 5

        # Check verification status label is present on all offers
        assert all(o["verification_status"] in ["VERIFIED", "SAMPLE", "MANUALLY_ENTERED"] for o in offers_list)

        # 2. Filter by category = travel
        travel_offers = await client.get("/api/v1/offers?category=travel", headers=headers)
        assert travel_offers.status_code == 200
        for o in travel_offers.json():
            assert o["category_id"] == "travel"

        # 3. Filter by only_user_cards=true
        user_matched_offers = await client.get("/api/v1/offers?only_user_cards=true", headers=headers)
        assert user_matched_offers.status_code == 200
        for o in user_matched_offers.json():
            assert o["is_applicable_to_user"] is True
            # Must match either SBI or VISA
            assert o["eligible_bank"] == "SBI Card" or o["eligible_network"] == "VISA"

@pytest.mark.asyncio
async def test_smart_card_utilization_channel_filtering():
    """In-store offline purchase matches offline retail offer and ignores online promo codes."""
    unique = uuid.uuid4().hex[:8]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        reg = await client.post("/api/v1/auth/register", json={
            "email": f"chan_{unique}@cliq.finance",
            "password": "Password123!",
            "full_name": "Channel Tester",
            "preferred_language": "en"
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Add Axis Ace card
        await client.post("/api/v1/cards", headers=headers, json={
            "card_name": "Axis Ace Card",
            "bank_name": "Axis Bank",
            "network": "VISA",
            "annual_fee": 499.0,
            "rules": [
                {
                    "category_id": "shopping",
                    "reward_type": "CASHBACK",
                    "reward_rate_percentage": 2.0
                }
            ]
        })

        # Offline in-store purchase at Croma for ₹20,000 (qualifies for Croma in-store ₹1,000 offer)
        opt_offline = await client.post("/api/v1/optimization/recommend", headers=headers, json={
            "amount": 20000.0,
            "category_id": "shopping",
            "merchant_name": "Croma Retail",
            "payment_channel": "OFFLINE"
        })
        assert opt_offline.status_code == 200
        rec_off = opt_offline.json()["recommended_card"]
        # ₹1,000 instant discount at Croma + 2% cashback on remaining ₹19,000 (₹380) = ₹1,380
        assert float(rec_off["instant_discount_monetary"]) == 1000.0
        assert float(rec_off["post_reward_monetary"]) == 380.0
        assert float(rec_off["net_financial_benefit"]) == 1380.0
        assert rec_off["applicable_offers"][0]["merchant_name"] == "Croma"

        # Online purchase at Croma for same amount does NOT match OFFLINE offer
        opt_online = await client.post("/api/v1/optimization/recommend", headers=headers, json={
            "amount": 20000.0,
            "category_id": "shopping",
            "merchant_name": "Croma Online",
            "payment_channel": "ONLINE"
        })
        assert opt_online.status_code == 200
        rec_on = opt_online.json()["recommended_card"]
        # No offline discount applied; standard 2% cashback on ₹20,000 = ₹400
        assert float(rec_on["instant_discount_monetary"]) == 0.0
        assert float(rec_on["post_reward_monetary"]) == 400.0
        assert float(rec_on["net_financial_benefit"]) == 400.0

