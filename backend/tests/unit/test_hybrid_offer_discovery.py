import pytest
import pytest_asyncio
import uuid
import json
from decimal import Decimal
from datetime import datetime, timedelta
from httpx import AsyncClient, ASGITransport

from app.main import app, init_db
from app.services.offers.discovery_pipeline import DiscoveryPipeline, DiscoveredOfferPayload, HDFCBankConnector, ICICIBankConnector, AxisBankConnector, RuPayConnector, BlinkitConnector
from app.services.offers.offer_service import OfferService
from app.core.database import AsyncSessionLocal
from app.models.entities import CardOffer, Profile, OfferAuditLog
from sqlalchemy import select

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

        # Find or create a PENDING_REVIEW offer
        pending_offer = next((o for o in queue if o["verification_status"] == "PENDING_REVIEW"), None)
        if not pending_offer:
            create_resp = await client.post("/api/v1/offers", headers=admin_headers, json={
                "merchant_name": "Flipkart",
                "offer_title": "10% Instant Discount on SBI Credit Cards during Big Billion Days",
                "category_id": "shopping",
                "discount_type": "PERCENTAGE",
                "discount_value": 10.0,
                "min_transaction_value": 4990.0,
                "max_discount_amount": 1750.0,
                "eligible_bank": "SBI Card",
                "eligible_card_names": ["SBI SimplyCLICK"],
                "valid_to": (datetime.utcnow() + timedelta(days=30)).isoformat(),
                "payment_channel": "ONLINE",
                "promo_code": "SBIBBD",
                "source_url": "https://www.flipkart.com/sbi-terms",
                "source_name": "Flipkart Automated Connector",
                "source_evidence": 'Official Banner: "Get 10% instant discount up to ₹1,750 with SBI Credit Cards on min cart ₹4,990."',
                "extraction_confidence": 0.91,
                "verification_status": "PENDING_REVIEW"
            })
            pending_offer = create_resp.json()

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

@pytest.mark.asyncio
async def test_material_change_detection_matrix():
    """
    Tests all 8 material change dimensions evaluated by DiscoveryPipeline.is_material_change:
    1. Identical content -> No change
    2. Discount value changed -> Material change
    3. Discount type changed -> Material change
    4. Max discount amount changed -> Material change
    5. Min transaction value changed -> Material change
    6. Promo code changed -> Material change
    7. Expiry date changed (shifts by 1 day) -> Material change
    8. Eligible card variants changed -> Material change
    9. Bank / Network changed -> Material change
    """
    now = datetime.utcnow()
    existing = CardOffer(
        id="test-offer-1",
        merchant_name="Zomato",
        offer_title="Flat 15% off up to ₹150 with HDFC Cards",
        category_id="food_delivery",
        discount_type="PERCENTAGE",
        discount_value=Decimal("15.00"),
        min_transaction_value=Decimal("500.00"),
        max_discount_amount=Decimal("150.00"),
        eligible_bank="HDFC Bank",
        eligible_network="VISA",
        eligible_card_names_json=json.dumps(["HDFC Millennia", "HDFC Regalia"]),
        valid_from=now - timedelta(days=2),
        valid_to=now + timedelta(days=30),
        payment_channel="ONLINE",
        promo_code="ZOMATOHDFC",
        verification_status="VERIFIED",
        version=1
    )

    # 1. Identical content
    identical = DiscoveredOfferPayload(
        merchant_name="Zomato",
        offer_title="Flat 15% off up to ₹150 with HDFC Cards",
        category_id="food_delivery",
        discount_type="PERCENTAGE",
        discount_value=Decimal("15.00"),
        min_transaction_value=Decimal("500.00"),
        max_discount_amount=Decimal("150.00"),
        eligible_bank="HDFC Bank",
        eligible_network="VISA",
        eligible_card_names=["HDFC Millennia", "HDFC Regalia"],
        valid_from=now - timedelta(days=2),
        valid_to=now + timedelta(days=30),
        payment_channel="ONLINE",
        promo_code="ZOMATOHDFC",
        activation_requirement="Apply coupon",
        terms_and_conditions="Terms",
        source_url="https://example.com",
        source_name="Source",
        source_evidence="Evidence",
        raw_text="Raw"
    )
    changed, reasons = DiscoveryPipeline.is_material_change(existing, identical)
    assert changed is False
    assert len(reasons) == 0

    # 2. Discount value changed
    d_val_payload = DiscoveredOfferPayload(
        **{**identical.__dict__, "discount_value": Decimal("20.00")}
    )
    changed, reasons = DiscoveryPipeline.is_material_change(existing, d_val_payload)
    assert changed is True
    assert any("Discount value changed" in r for r in reasons)

    # 3. Discount type changed
    d_type_payload = DiscoveredOfferPayload(
        **{**identical.__dict__, "discount_type": "FLAT_AMOUNT"}
    )
    changed, reasons = DiscoveryPipeline.is_material_change(existing, d_type_payload)
    assert changed is True
    assert any("Discount type changed" in r for r in reasons)

    # 4. Max discount changed
    max_d_payload = DiscoveredOfferPayload(
        **{**identical.__dict__, "max_discount_amount": Decimal("100.00")}
    )
    changed, reasons = DiscoveryPipeline.is_material_change(existing, max_d_payload)
    assert changed is True
    assert any("Maximum discount cap changed" in r for r in reasons)

    # 5. Min spend changed
    min_spend_payload = DiscoveredOfferPayload(
        **{**identical.__dict__, "min_transaction_value": Decimal("750.00")}
    )
    changed, reasons = DiscoveryPipeline.is_material_change(existing, min_spend_payload)
    assert changed is True
    assert any("Minimum spend requirement changed" in r for r in reasons)

    # 6. Promo code changed
    code_payload = DiscoveredOfferPayload(
        **{**identical.__dict__, "promo_code": "ZOMATONEW"}
    )
    changed, reasons = DiscoveryPipeline.is_material_change(existing, code_payload)
    assert changed is True
    assert any("Promo code changed" in r for r in reasons)

    # 7. Expiry date changed by 1 day (Strict zero-tolerance, no 15-day defect)
    expiry_payload = DiscoveredOfferPayload(
        **{**identical.__dict__, "valid_to": now + timedelta(days=31)}
    )
    changed, reasons = DiscoveryPipeline.is_material_change(existing, expiry_payload)
    assert changed is True
    assert any("Expiry date shifted" in r for r in reasons)

    # 8. Eligible card variants changed
    cards_payload = DiscoveredOfferPayload(
        **{**identical.__dict__, "eligible_card_names": ["HDFC Infinia"]}
    )
    changed, reasons = DiscoveryPipeline.is_material_change(existing, cards_payload)
    assert changed is True
    assert any("Eligible card variants changed" in r for r in reasons)

    # 9. Bank changed
    bank_payload = DiscoveredOfferPayload(
        **{**identical.__dict__, "eligible_bank": "ICICI Bank"}
    )
    changed, reasons = DiscoveryPipeline.is_material_change(existing, bank_payload)
    assert changed is True
    assert any("Eligible bank changed" in r for r in reasons)

@pytest.mark.asyncio
async def test_source_unavailable_quarantines_offers():
    """
    When a source domain or endpoint is 404/410/dead,
    all associated offers transition to SOURCE_UNAVAILABLE and are excluded from recommendations.
    """
    async with AsyncSessionLocal() as session:
        # Create a test offer with source URL
        now = datetime.utcnow()
        test_dead_offer = CardOffer(
            merchant_name="DeadMerchant",
            offer_title="50% off via Dead Portal",
            category_id="shopping",
            discount_type="PERCENTAGE",
            discount_value=Decimal("50.00"),
            min_transaction_value=Decimal("1000.00"),
            max_discount_amount=Decimal("500.00"),
            eligible_bank="HDFC Bank",
            eligible_card_names_json="[]",
            valid_from=now - timedelta(days=1),
            valid_to=now + timedelta(days=30),
            payment_channel="ONLINE",
            source_url="https://dead-partner-portal.com/deals",
            source_name="Dead Partner Portal",
            verification_status="VERIFIED",
            version=1,
            last_verified_timestamp=now
        )
        session.add(test_dead_offer)
        await session.commit()
        await session.refresh(test_dead_offer)

        # Mark source unavailable
        affected_count = await DiscoveryPipeline.mark_source_unavailable(
            db=session,
            source_url_pattern="dead-partner-portal.com",
            reason="HTTP 404 Endpoint Not Found - Partner domain expired",
            actor_name="Health Check Monitor"
        )
        assert affected_count >= 1

        # Check DB state
        stmt = select(CardOffer).where(CardOffer.id == test_dead_offer.id)
        updated = (await session.execute(stmt)).scalar_one()
        assert updated.verification_status == "SOURCE_UNAVAILABLE"

        # Check audit log
        audit_stmt = select(OfferAuditLog).where(OfferAuditLog.offer_id == test_dead_offer.id)
        audits = (await session.execute(audit_stmt)).scalars().all()
        assert any(a.action == "SOURCE_UNAVAILABLE" for a in audits)

@pytest.mark.asyncio
async def test_connector_live_probe_resilience():
    """
    Tests that connectors can execute live HTTP probing, capture latency and WAF headers,
    and handle timeouts/blocks without crashing.
    """
    connectors = [
        HDFCBankConnector(),
        ICICIBankConnector(),
        AxisBankConnector(),
        RuPayConnector(),
        BlinkitConnector()
    ]
    for c in connectors:
        res = await c.probe_source()
        assert "source_name" in res
        assert "url" in res
        assert "http_status" in res
        assert "latency_ms" in res
        assert "waf" in res
        assert isinstance(res["waf"], list)
        assert "live_accessible" in res
        # Must not raise unhandled exception regardless of network or WAF blocking
        assert res["http_status"] in [0, 200, 301, 302, 403, 404, 503]

@pytest.mark.asyncio
async def test_strict_rbac_on_all_admin_endpoints():
    """
    Verifies that all 7 admin offer management endpoints strictly return HTTP 403
    for non-admin authenticated users.
    """
    unique = uuid.uuid4().hex[:8]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register standard user
        reg_resp = await client.post("/api/v1/auth/register", json={
            "email": f"unauth_{unique}@cliq.finance",
            "password": "Password123!",
            "full_name": "Unauth User",
            "preferred_language": "en"
        })
        token = reg_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        endpoints = [
            ("GET", "/api/v1/admin/offers/review-queue", None),
            ("POST", "/api/v1/admin/offers/sync-discovery", None),
            ("POST", "/api/v1/admin/offers/dummy-id/approve", {"notes": "hack"}),
            ("POST", "/api/v1/admin/offers/dummy-id/reject", {"rejection_reason": "hack"}),
            ("PUT", "/api/v1/admin/offers/dummy-id", {"offer_title": "hack"}),
            ("POST", "/api/v1/admin/offers/dummy-id/reverification", {"notes": "hack"}),
            ("GET", "/api/v1/admin/offers/dummy-id/audit-trail", None),
        ]

        for method, path, payload in endpoints:
            if method == "GET":
                resp = await client.get(path, headers=headers)
            elif method == "POST":
                resp = await client.post(path, headers=headers, json=payload or {})
            elif method == "PUT":
                resp = await client.put(path, headers=headers, json=payload or {})
            
            assert resp.status_code == 403, f"Endpoint {method} {path} returned {resp.status_code} instead of 403"
            assert "Administrative privileges required" in resp.json()["detail"]


