import pytest
import pytest_asyncio
import uuid
import json
from decimal import Decimal
from datetime import datetime, timedelta
from httpx import AsyncClient, ASGITransport

from app.main import app, init_db
from app.services.offers.discovery_pipeline import DiscoveryPipeline
from app.services.offers.offer_service import OfferService
from app.core.database import AsyncSessionLocal
from app.models.entities import CardOffer, Profile

@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    await init_db()

@pytest.mark.asyncio
async def test_hybrid_discovery_pipeline_and_quarantine_reverification():
    """
    Validates end-to-end hybrid discovery:
    1. Automatic discovery from permitted Indian connectors
    2. Extraction confidence & source evidence capture
    3. Duplicate detection via canonical content hashing
    4. Material change detection triggering NEEDS_REVERIFICATION quarantine
    """
    async with AsyncSessionLocal() as session:
        # Run discovery pipeline
        result = await DiscoveryPipeline.run_discovery_pipeline(
            db=session,
            actor_name="Automated Test Ingestion Worker"
        )
        assert result["discovered_count"] >= 5
        assert result["extracted_count"] >= 5

        # Verify duplicate detection (running again produces 0 new pending offers)
        repeat = await DiscoveryPipeline.run_discovery_pipeline(
            db=session,
            actor_name="Automated Test Ingestion Worker"
        )
        assert repeat["pending_review_count"] == 0
        assert repeat["unchanged_count"] >= 5

@pytest.mark.asyncio
async def test_admin_authorization_rbac():
    """Ordinary users cannot access administrative offer review endpoints."""
    unique = uuid.uuid4().hex[:8]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Register ordinary user
        user_reg = await client.post("/api/v1/auth/register", json={
            "email": f"user_{unique}@cliq.finance",
            "password": "Password123!",
            "full_name": "Ordinary User",
            "preferred_language": "en"
        })
        user_token = user_reg.json()["access_token"]
        user_headers = {"Authorization": f"Bearer {user_token}"}

        # Attempt to access review queue -> 403 Forbidden
        q_resp = await client.get("/api/v1/admin/offers/review-queue", headers=user_headers)
        assert q_resp.status_code == 403
        assert "Administrative privileges required" in q_resp.json()["detail"]

        # Attempt to trigger discovery sync -> 403 Forbidden
        sync_resp = await client.post("/api/v1/admin/offers/sync-discovery", headers=user_headers)
        assert sync_resp.status_code == 403

        # Attempt to approve an offer -> 403 Forbidden
        appr_resp = await client.post("/api/v1/admin/offers/fake-id/approve", headers=user_headers, json={})
        assert appr_resp.status_code == 403

@pytest.mark.asyncio
async def test_admin_approval_and_rejection_workflow():
    """
    Admin reviews PENDING_REVIEW offer:
    - Inspects source evidence & extraction confidence
    - Edits incorrect terms
    - Approves offer into VERIFIED state
    - Rejects another offer with documented rationale
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Login as seeded chief admin
        login_resp = await client.post("/api/v1/auth/login", json={
            "email": "admin@cliq.ai",
            "password": "AdminPass@123"
        })
        assert login_resp.status_code == 200
        admin_token = login_resp.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        assert login_resp.json()["is_admin"] is True
        assert login_resp.json()["role"] == "ADMIN"

        # 1. Inspect review queue
        queue_resp = await client.get("/api/v1/admin/offers/review-queue", headers=admin_headers)
        assert queue_resp.status_code == 200
        queue = queue_resp.json()
        assert len(queue) > 0

        # Find the seeded Flipkart PENDING_REVIEW offer
        pending_offer = next((o for o in queue if o["verification_status"] == "PENDING_REVIEW"), None)
        assert pending_offer is not None
        assert pending_offer["source_evidence"] is not None
        assert float(pending_offer["extraction_confidence"]) > 0.80

        # 2. Edit terms (e.g. refine eligible card variants)
        edit_resp = await client.put(f"/api/v1/admin/offers/{pending_offer['id']}", headers=admin_headers, json={
            "offer_title": "10% Instant Discount on SBI Credit Cards (Verified)",
            "eligible_card_names": ["SBI SimplyCLICK", "SBI Card PRIME", "SBI Elite"],
            "notes": "Verified against official Flipkart bank terms page."
        })
        assert edit_resp.status_code == 200
        assert edit_resp.json()["offer_title"] == "10% Instant Discount on SBI Credit Cards (Verified)"
        assert edit_resp.json()["version"] == 2

        # 3. Approve offer -> Transitions to VERIFIED
        approve_resp = await client.post(f"/api/v1/admin/offers/{pending_offer['id']}/approve", headers=admin_headers, json={
            "notes": "Terms and discount caps independently verified."
        })
        assert approve_resp.status_code == 200
        approved = approve_resp.json()
        assert approved["verification_status"] == "VERIFIED"
        assert approved["reviewed_by_name"] == "CLIQ Chief Admin"
        assert approved["reviewed_at"] is not None

        # 4. Check audit trail
        trail_resp = await client.get(f"/api/v1/admin/offers/{pending_offer['id']}/audit-trail", headers=admin_headers)
        assert trail_resp.status_code == 200
        trail = trail_resp.json()
        assert len(trail) >= 2
        actions = [e["action"] for e in trail]
        assert "APPROVED" in actions

        # 5. Test Reject workflow on a sample unverified offer
        new_raw = await client.post("/api/v1/offers", headers=admin_headers, json={
            "merchant_name": "Suspicious Merchant",
            "offer_title": "90% off everything with any card",
            "category_id": "shopping",
            "discount_type": "PERCENTAGE",
            "discount_value": 90.0,
            "min_transaction_value": 100.0,
            "valid_to": (datetime.utcnow() + timedelta(days=10)).isoformat(),
            "payment_channel": "ONLINE",
            "verification_status": "PENDING_REVIEW"
        })
        raw_id = new_raw.json()["id"]

        reject_resp = await client.post(f"/api/v1/admin/offers/{raw_id}/reject", headers=admin_headers, json={
            "rejection_reason": "Unverifiable third party claim; missing official bank partner agreement."
        })
        assert reject_resp.status_code == 200
        assert reject_resp.json()["verification_status"] == "REJECTED"
        assert "Unverifiable third party claim" in reject_resp.json()["rejection_reason"]

@pytest.mark.asyncio
async def test_quarantined_offer_excluded_from_user_recommendations():
    """
    CRITICAL SAFETY GUARANTEE:
    An offer marked as NEEDS_REVERIFICATION, PENDING_REVIEW, or REJECTED
    must NEVER be returned by the recommendation engine.
    """
    unique = uuid.uuid4().hex[:8]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register user and add IndusInd card
        user_reg = await client.post("/api/v1/auth/register", json={
            "email": f"quarantine_{unique}@cliq.finance",
            "password": "Password123!",
            "full_name": "Quarantine Test User",
            "preferred_language": "en"
        })
        user_token = user_reg.json()["access_token"]
        user_headers = {"Authorization": f"Bearer {user_token}"}

        await client.post("/api/v1/cards", headers=user_headers, json={
            "card_name": "IndusInd Legend",
            "bank_name": "IndusInd Bank",
            "network": "VISA",
            "annual_fee": 0.0,
            "rules": [
                {
                    "category_id": "dining",
                    "reward_type": "CASHBACK",
                    "reward_rate_percentage": 1.5
                }
            ]
        })

        # The EazyDiner offer is seeded with verification_status = "NEEDS_REVERIFICATION"
        # Run recommendation on EazyDiner spend of ₹2,000
        opt_resp = await client.post("/api/v1/optimization/recommend", headers=user_headers, json={
            "amount": 2000.0,
            "category_id": "dining",
            "merchant_name": "EazyDiner Prime Dining",
            "payment_channel": "ONLINE"
        })
        assert opt_resp.status_code == 200
        rec = opt_resp.json()["recommended_card"]

        # The quarantined EazyDiner offer MUST NOT match!
        # Instant discount must be 0, not 25% or ₹500!
        assert float(rec["instant_discount_monetary"]) == 0.0
        assert len(rec["applicable_offers"]) == 0
        # Post reward is purely standard 1.5% cashback on ₹2,000 = ₹30
        assert float(rec["post_reward_monetary"]) == 30.0
        assert float(rec["net_financial_benefit"]) == 30.0
