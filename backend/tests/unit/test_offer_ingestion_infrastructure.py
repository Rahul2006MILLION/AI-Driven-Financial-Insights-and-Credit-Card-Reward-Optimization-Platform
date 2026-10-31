import pytest
import pytest_asyncio
import uuid
import json
import io
from decimal import Decimal
from datetime import datetime, timedelta
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select

from app.main import app, init_db
from app.core.database import AsyncSessionLocal
from app.models.entities import OfferSource, SourceFailureLog, AdminOfferDocument, CardOffer
from app.services.offers.source_registry import SourceRegistryService
from app.services.offers.normalization import OfferNormalizer, CanonicalOfferPayload
from app.services.offers.ingestion_engine import OfferIngestionEngine
from app.services.document_intelligence.circular_parser import CircularParserService
from app.services.offers.channels import (
    HtmlIngestionChannel,
    PdfCircularIngestionChannel,
    PartnerFeedIngestionChannel,
    AdminDocumentIngestionChannel,
    AdminManualIngestionChannel
)

def make_test_pdf_bytes(text_body: str) -> bytes:
    """Helper to create a valid, vector-encoded PDF byte string containing readable text."""
    stream = f"BT /F1 12 Tf 50 700 Td ({text_body}) Tj ET"
    return (
        f"%PDF-1.4\n"
        f"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        f"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
        f"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n"
        f"4 0 obj << /Length {len(stream)} >> stream\n{stream}\nendstream\nendobj\n"
        f"5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"
        f"xref\n0 6\n0000000000 65535 f \n"
        f"trailer << /Size 6 /Root 1 0 R >>\n"
        f"startxref\n100\n%%EOF\n"
    ).encode("latin-1")

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await init_db()

@pytest.mark.asyncio
async def test_source_registry_seeding_and_statuses():
    """Validates that all 8 sources exist with explicit non-fabricated integration states."""
    async with AsyncSessionLocal() as session:
        sources = await SourceRegistryService.list_sources(session)
        assert len(sources) >= 8

        keys = {s.source_key: s for s in sources}
        assert "hdfc_bank" in keys
        assert keys["hdfc_bank"].connector_status == "MANUAL_ONLY"
        assert keys["hdfc_bank"].source_health == "BLOCKED"

        assert "icici_bank" in keys
        assert keys["icici_bank"].connector_status == "PARTIALLY_IMPLEMENTED"

        assert "rupay_npci" in keys
        assert keys["rupay_npci"].connector_status == "ROBOTS_DISALLOWED"

        assert "blinkit" in keys
        assert keys["blinkit"].connector_status == "BLOCKED"

        assert "partner_feed" in keys
        assert keys["partner_feed"].connector_status == "IMPLEMENTED"
        assert keys["partner_feed"].source_health == "HEALTHY"

@pytest.mark.asyncio
async def test_html_ingestion_channel_and_waf_boundaries():
    """Validates permitted public HTML channel respects WAF and robots.txt."""
    channel = HtmlIngestionChannel()
    async with AsyncSessionLocal() as session:
        # 1. Blocked / Protected target
        res_blocked = await channel.ingest(
            db=session,
            raw_payload={"url": "https://blinkit.com/offers"}
        )
        assert res_blocked.success is False
        assert any("HTTP 403" in e or "protected" in e.lower() for e in res_blocked.errors)

        # 2. Robots.txt disallowed target
        res_robots = await channel.ingest(
            db=session,
            raw_payload={"url": "https://www.rupay.co.in/rupay-offers"}
        )
        assert res_robots.success is False
        assert any("robots.txt" in e.lower() for e in res_robots.errors)

@pytest.mark.asyncio
async def test_pdf_circular_ingestion_valid():
    """Validates PDF circular ingestion extracts terms and stages into PENDING_REVIEW."""
    uid = uuid.uuid4().hex[:6]
    pdf_text = f"HDFC Bank Festive Promo: Flat 10% instant discount up to Rs 1500 on Tata Cliq on min spend Rs 600 promo code CLIQ{uid}"
    pdf_bytes = make_test_pdf_bytes(pdf_text)

    channel = PdfCircularIngestionChannel()
    async with AsyncSessionLocal() as session:
        result = await channel.ingest(
            db=session,
            raw_payload={"bytes": pdf_bytes, "filename": f"hdfc_tatacliq_{uid}.pdf"}
        )
        assert result.success is True
        assert len(result.items) >= 1
        item = result.items[0]
        assert "Cliq" in item.merchant_name or item.merchant_name == "Tata Cliq"
        assert item.discount_value == Decimal("10.00")
        assert item.max_discount_amount == Decimal("1500.00")
        assert item.min_transaction_value == Decimal("600.00")
        assert item.promo_code == f"CLIQ{uid}".upper()
        assert item.ingestion_channel == "PDF_CIRCULAR"

        # Pass through Ingestion Engine
        engine_res = await OfferIngestionEngine.process_and_stage_payloads(
            db=session,
            payloads=result.items,
            channel_name="PDF_CIRCULAR"
        )
        assert engine_res.staged_count >= 1

@pytest.mark.asyncio
async def test_pdf_circular_invalid_uploads():
    """Validates that non-PDF and invalid byte streams are strictly rejected."""
    channel = PdfCircularIngestionChannel()
    async with AsyncSessionLocal() as session:
        # Non-PDF text string
        res_invalid = await channel.ingest(
            db=session,
            raw_payload={"bytes": b"THIS_IS_NOT_A_VALID_PDF_FILE", "filename": "fake.pdf"}
        )
        assert res_invalid.success is False
        assert any("Invalid PDF" in e or "magic bytes" in e for e in res_invalid.errors)

@pytest.mark.asyncio
async def test_admin_document_duplicate_prevention():
    """Validates idempotent document deduplication via SHA-256 fingerprinting."""
    doc_channel = AdminDocumentIngestionChannel()
    uid = uuid.uuid4().hex[:8]
    pdf_bytes = make_test_pdf_bytes(f"Axis Bank Ace Offer {uid}: 20% cashback on Swiggy with Axis Bank Cards min spend Rs 1000")

    async with AsyncSessionLocal() as session:
        # First upload
        res1 = await doc_channel.ingest(
            db=session,
            raw_payload={"bytes": pdf_bytes, "filename": "axis_swiggy_memo.pdf", "mime_type": "application/pdf"}
        )
        assert res1.success is True
        assert res1.telemetry.get("document_id") is not None

        # Duplicate upload of identical file bytes
        res2 = await doc_channel.ingest(
            db=session,
            raw_payload={"bytes": pdf_bytes, "filename": "axis_swiggy_copy.pdf", "mime_type": "application/pdf"}
        )
        assert res2.success is False
        assert any("Duplicate document detected" in e for e in res2.errors)

@pytest.mark.asyncio
async def test_partner_feed_ingestion_interface():
    """Validates authorized partner feed ingestion with schema verification."""
    feed_payload = {
        "offers": [
            {
                "merchant_name": "MakeMyTrip",
                "offer_title": "Flat 12% off on Domestic Flights with SBI Cards",
                "category_id": "travel",
                "discount_type": "PERCENTAGE",
                "discount_value": "12.00",
                "min_transaction_value": "4000.00",
                "max_discount_amount": "1200.00",
                "eligible_bank": "SBI Card",
                "promo_code": "MMTSBIPARTNER",
                "source_evidence": "Authorized API feed confirmation from PineLabs partner gateway.",
                "source_url": "https://api.partner.cliq.finance/v1/offers/101"
            }
        ]
    }

    channel = PartnerFeedIngestionChannel()
    async with AsyncSessionLocal() as session:
        result = await channel.ingest(
            db=session,
            raw_payload=feed_payload
        )
        assert result.success is True
        assert len(result.items) == 1
        item = result.items[0]
        assert item.merchant_name == "MakeMyTrip"
        assert item.discount_value == Decimal("12.00")
        assert item.ingestion_channel == "AUTHORIZED_API"

@pytest.mark.asyncio
async def test_admin_manual_offer_registration():
    """Validates manual offer registration enforces mandatory source URL and evidence snippet."""
    manual_channel = AdminManualIngestionChannel()
    async with AsyncSessionLocal() as session:
        # Missing source URL -> Rejected
        res_fail1 = await manual_channel.ingest(
            db=session,
            raw_payload={
                "merchant_name": "Zomato",
                "offer_title": "15% off on Zomato",
                "category_id": "food_delivery",
                "discount_type": "PERCENTAGE",
                "discount_value": 15.0,
                "source_evidence": "Verbatim evidence from official email."
            }
        )
        assert res_fail1.success is False
        assert any("source URL" in e for e in res_fail1.errors)

        # Missing source evidence -> Rejected
        res_fail2 = await manual_channel.ingest(
            db=session,
            raw_payload={
                "merchant_name": "Zomato",
                "offer_title": "15% off on Zomato",
                "category_id": "food_delivery",
                "discount_type": "PERCENTAGE",
                "discount_value": 15.0,
                "source_url": "https://zomato.com/terms"
            }
        )
        assert res_fail2.success is False
        assert any("source evidence" in e for e in res_fail2.errors)

        # Valid payload -> Accepted and normalized
        res_valid = await manual_channel.ingest(
            db=session,
            raw_payload={
                "merchant_name": "Zomato",
                "offer_title": "Flat ₹100 off on dining above ₹800 with Visa Signature",
                "category_id": "dining",
                "discount_type": "FLAT_AMOUNT",
                "discount_value": "100.00",
                "min_transaction_value": "800.00",
                "eligible_network": "VISA",
                "source_url": "https://visa.co.in/dining",
                "source_evidence": "Official Visa circular: Enjoy ₹100 off on dining payments exceeding ₹800 via Zomato Pay.",
                "valid_to": (datetime.utcnow() + timedelta(days=30)).isoformat()
            }
        )
        assert res_valid.success is True
        assert len(res_valid.items) == 1
        assert res_valid.items[0].ingestion_channel == "MANUAL_ENTRY"

@pytest.mark.asyncio
async def test_missing_fields_and_confidence_penalty():
    """Never invent missing terms; missing terms incur confidence score penalties."""
    raw = {
        "merchant_name": "Generic Merchant",
        "offer_title": "Promotional Discount",
        "discount_value": 0.0,
        "source_evidence": ""  # Missing evidence
    }
    canonical = OfferNormalizer.validate_and_normalize(raw)
    assert canonical.extraction_confidence < Decimal("0.80")
    assert any("Missing verbatim source evidence" in w for w in canonical.validation_warnings)

@pytest.mark.asyncio
async def test_incorrect_monetary_values():
    """Validates Decimal precision and rejection of negative values."""
    raw = {
        "merchant_name": "Croma",
        "offer_title": "Discount on Electronics",
        "discount_value": -50.0,  # Negative value
        "min_transaction_value": "₹ 1,500.50",
        "source_url": "https://croma.com",
        "source_evidence": "Official Croma T&C."
    }
    canonical = OfferNormalizer.validate_and_normalize(raw)
    assert canonical.discount_value == Decimal("0.00")
    assert canonical.min_transaction_value == Decimal("1500.50")
    assert any("negative" in w.lower() for w in canonical.validation_warnings)

@pytest.mark.asyncio
async def test_stale_source_data_freshness_tracking():
    """Validates freshness state calculations across verification recency and expiration."""
    now = datetime.utcnow()

    # 1. Fresh active offer
    class MockOffer:
        def __init__(self, status, valid_to, verified_at):
            self.verification_status = status
            self.valid_to = valid_to
            self.last_verified_timestamp = verified_at

    fresh_offer = MockOffer("VERIFIED", now + timedelta(days=30), now - timedelta(days=2))
    assert OfferNormalizer.compute_freshness_state(fresh_offer, now) == "FRESH"

    # 2. Expiring soon (< 7 days left)
    expiring_offer = MockOffer("VERIFIED", now + timedelta(days=5), now - timedelta(days=1))
    assert OfferNormalizer.compute_freshness_state(expiring_offer, now) == "EXPIRING_SOON"

    # 3. Stale (verified > 7 days ago)
    stale_offer = MockOffer("VERIFIED", now + timedelta(days=30), now - timedelta(days=10))
    assert OfferNormalizer.compute_freshness_state(stale_offer, now) == "STALE"

    # 4. Expired
    expired_offer = MockOffer("VERIFIED", now - timedelta(days=1), now - timedelta(days=1))
    assert OfferNormalizer.compute_freshness_state(expired_offer, now) == "EXPIRED"

    # 5. Quarantined
    quarantined = MockOffer("NEEDS_REVERIFICATION", now + timedelta(days=30), now)
    assert OfferNormalizer.compute_freshness_state(quarantined, now) == "QUARANTINED"

@pytest.mark.asyncio
async def test_unauthorized_admin_actions_on_all_new_endpoints():
    """Verifies that non-admin authenticated users receive HTTP 403 on all new ingestion endpoints."""
    unique = uuid.uuid4().hex[:8]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        reg = await client.post("/api/v1/auth/register", json={
            "email": f"unauth_ingest_{unique}@cliq.finance",
            "password": "Password123!",
            "full_name": "Unauth Ingest User",
            "preferred_language": "en"
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. GET /sources
        r1 = await client.get("/api/v1/admin/offers/sources", headers=headers)
        assert r1.status_code == 403

        # 2. POST /sources/dummy/probe
        r2 = await client.post("/api/v1/admin/offers/sources/dummy/probe", headers=headers)
        assert r2.status_code == 403

        # 3. GET /failures
        r3 = await client.get("/api/v1/admin/offers/failures", headers=headers)
        assert r3.status_code == 403

        # 4. POST /partner-feed
        r4 = await client.post("/api/v1/admin/offers/partner-feed", headers=headers, json={"partner_id": "test", "offers": []})
        assert r4.status_code == 403

        # 5. POST /manual
        r5 = await client.post("/api/v1/admin/offers/manual", headers=headers, json={
            "merchant_name": "Test",
            "offer_title": "Test Offer",
            "discount_value": 10.0,
            "source_url": "https://example.com",
            "source_evidence": "Evidence test.",
            "valid_to": (datetime.utcnow() + timedelta(days=10)).isoformat()
        })
        assert r5.status_code == 403

        # 6. GET /documents
        r6 = await client.get("/api/v1/admin/offers/documents", headers=headers)
        assert r6.status_code == 403

@pytest.mark.asyncio
async def test_source_failure_logging_and_retry_backoff():
    """Validates logging of failures, retry attempts, and exponential backoff tracking."""
    async with AsyncSessionLocal() as session:
        src = (await session.execute(select(OfferSource).limit(1))).scalars().first()
        assert src is not None

        # Log simulated failure
        log = await SourceRegistryService.log_failure(
            db=session,
            source_id=src.id,
            error_type="WAF_BLOCKED",
            error_message="Cloudflare Turnstile challenge returned 403 Forbidden",
            http_status=403,
            attempt_number=2,
            retry_after_seconds=1800,
            context={"waf": ["Cloudflare"], "attempt": 2}
        )
        assert log.id is not None
        assert log.error_type == "WAF_BLOCKED"
        assert log.retry_after_seconds == 1800

        # Retrieve recent failures
        recent = await SourceRegistryService.get_recent_failures(session, limit=10)
        assert any(f.id == log.id for f in recent)

@pytest.mark.asyncio
async def test_reverification_and_recommendation_safety_after_material_changes():
    """
    CRITICAL SAFETY GUARANTEE:
    When an offer undergoes material changes during ingestion (e.g., lower discount cap),
    it is immediately quarantined as NEEDS_REVERIFICATION and excluded from recommendations.
    """
    unique = uuid.uuid4().hex[:8]
    now = datetime.utcnow()
    async with AsyncSessionLocal() as session:
        # Create an initially VERIFIED offer
        offer = CardOffer(
            merchant_name="Zomato Gold",
            offer_title="Flat 20% off with ICICI Cards",
            category_id="dining",
            discount_type="PERCENTAGE",
            discount_value=Decimal("20.00"),
            min_transaction_value=Decimal("500.00"),
            max_discount_amount=Decimal("200.00"),
            eligible_bank="ICICI Bank",
            eligible_card_names_json="[]",
            valid_from=now - timedelta(days=2),
            valid_to=now + timedelta(days=30),
            payment_channel="ONLINE",
            promo_code=f"ZOMATO_{unique}",
            source_url="https://icici.bank.in/offers",
            source_name="ICICI Portal",
            source_evidence="Official 20% discount up to ₹200.",
            verification_status="VERIFIED",
            version=1,
            last_verified_timestamp=now
        )
        session.add(offer)
        await session.commit()
        await session.refresh(offer)

        # New ingestion payload: Merchant lowered cap from ₹200 to ₹100
        changed_payload = CanonicalOfferPayload(
            merchant_name="Zomato Gold",
            offer_title="Flat 20% off with ICICI Cards",
            category_id="dining",
            discount_type="PERCENTAGE",
            discount_value=Decimal("20.00"),
            min_transaction_value=Decimal("500.00"),
            max_discount_amount=Decimal("100.00"),  # Material change!
            eligible_bank="ICICI Bank",
            eligible_network=None,
            eligible_card_names=[],
            valid_from=now - timedelta(days=2),
            valid_to=now + timedelta(days=30),
            payment_channel="ONLINE",
            promo_code=f"ZOMATO_{unique}",
            activation_requirement=None,
            terms_and_conditions=None,
            source_url="https://icici.bank.in/offers",
            source_name="ICICI Portal",
            source_evidence="Revised T&C: Maximum discount reduced to ₹100.",
            extraction_confidence=Decimal("0.95"),
            ingestion_channel="HTML_EXTRACTION"
        )

        engine_res = await OfferIngestionEngine.process_and_stage_payloads(
            db=session,
            payloads=[changed_payload],
            channel_name="HTML_EXTRACTION"
        )
        assert engine_res.quarantined_count == 1

        # Check DB state: status must be NEEDS_REVERIFICATION
        await session.refresh(offer)
        assert offer.verification_status == "NEEDS_REVERIFICATION"
        assert offer.version == 2
        assert offer.previous_version_json is not None
        assert "200.00" in offer.previous_version_json

        # Recommendation engine check: Must NOT match quarantined offer
        from app.services.offers.offer_service import OfferService
        from app.models.entities import CreditCard

        dummy_card = CreditCard(
            user_id="test-user",
            card_name="ICICI Coral",
            bank_name="ICICI Bank",
            network="VISA",
            is_active=True
        )
        applicable = await OfferService.get_applicable_offers_for_card(
            db=session,
            card=dummy_card,
            amount=Decimal("1000.00"),
            category_id="dining",
            merchant_name="Zomato Gold"
        )
        # Quarantined offer must NOT be returned!
        assert len(applicable) == 0

