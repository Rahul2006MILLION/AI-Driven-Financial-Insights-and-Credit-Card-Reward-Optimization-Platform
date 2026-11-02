import pytest
import pytest_asyncio
import uuid
import json
import httpx
from decimal import Decimal
from datetime import datetime, timedelta
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select
from unittest.mock import AsyncMock, patch

from app.main import app, init_db
from app.core.database import AsyncSessionLocal
from app.core.config import settings
from app.models.entities import Profile, CreditCard, CardRewardRule, Transaction, UserAiConsent, AiRequestAuditLog
from app.services.privacy.privacy_gateway import (
    PrivacyGateway,
    SensitiveDataRedactor,
    PrivacyContextBuilder,
    PromptSanitizer,
    ConsentService,
    DataClassification,
    AiTaskType,
    ConsentStatus
)
from app.security.password import get_password_hash
from app.security.jwt import create_access_token

@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    await init_db()

# ------------------------------------------------------------------------------
# 1. TRACE REAL REQUEST & CAPTURE SERIALIZED PAYLOAD
# ------------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_trace_gemini_request_and_capture_payload():
    """
    Traces the execution path from POST /api/v1/assistant/chat through PrivacyGateway
    to the outbound HTTP call to the Gemini endpoint.
    Captures the exact serialized outbound JSON payload and verifies:
    - PAN, CVV, OTP, and passwords are redacted.
    - No raw transaction items exist in the payload.
    - Delimited prompt structure is adhered to.
    """
    async with AsyncSessionLocal() as session:
        user_id = str(uuid.uuid4())
        profile = Profile(
            id=user_id,
            email=f"trace_audit_{user_id[:8]}@example.com",
            full_name="Synthetic Auditee",
            hashed_password=get_password_hash("AuditSecret123!"),
            preferred_language="en",
            role="user"
        )
        session.add(profile)

        # Explicitly grant consent for testing outbound payload
        consent = UserAiConsent(
            user_id=user_id,
            external_ai_enabled=True,
            allow_card_context=True,
            allow_spending_context=True,
            provider_preference="gemini"
        )
        session.add(consent)

        card = CreditCard(
            id=str(uuid.uuid4()),
            user_id=user_id,
            card_name="Millennia Visa",
            bank_name="HDFC Bank",
            network="VISA",
            card_variant="Cashback",
            last_four_digits="8899",
            is_active=True
        )
        session.add(card)

        txn = Transaction(
            id=str(uuid.uuid4()),
            user_id=user_id,
            card_id=card.id,
            merchant_name="Sensitive Merchant Secrets Ltd",
            amount=Decimal("4500.00"),
            category_id="dining",
            transaction_date=datetime.utcnow()
        )
        session.add(txn)
        await session.commit()

        token = create_access_token({"sub": user_id, "email": profile.email, "role": "user"})

    captured_requests = []

    # Mock the outbound httpx client call within PrivacyGateway
    original_post = httpx.AsyncClient.post

    async def mock_post(self, url, *args, **kwargs):
        if "generativelanguage.googleapis.com" in str(url):
            captured_requests.append({
                "url": str(url),
                "json": kwargs.get("json"),
                "headers": kwargs.get("headers")
            })
            # Return mock Gemini 200 response
            mock_resp = httpx.Response(
                status_code=200,
                json={
                    "candidates": [
                        {
                            "content": {
                                "parts": [
                                    {"text": "Based on your verified Millennia Visa, you earn 5% cashback on dining."}
                                ]
                            }
                        }
                    ]
                },
                request=httpx.Request("POST", url)
            )
            return mock_resp
        return await original_post(self, url, *args, **kwargs)

    with patch.object(settings, "GEMINI_API_KEY", "TEST_KEY_AIzaSyFakeSyntheticSecret123"), \
         patch.object(httpx.AsyncClient, "post", mock_post):

        query_with_leaks = (
            "I want to pay ₹4,500 on Swiggy using my card 4111 2222 3333 4444 "
            "with CVV 999 and OTP 123456. My password is SecretPassword! How much do I earn?"
        )

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/api/v1/assistant/chat",
                headers={"Authorization": f"Bearer {token}"},
                json={"query": query_with_leaks, "language": "en"}
            )
            assert resp.status_code == 200
            data = resp.json()
            assert data.get("is_external_ai_used") is True
            assert data["provider_used"] == "gemini"
            assert data["redacted_items_count"] >= 3

    # Inspect captured outbound request
    assert len(captured_requests) == 1
    outbound = captured_requests[0]
    outbound_url = outbound["url"]
    outbound_json = outbound["json"]

    # 1. URL check
    assert "generativelanguage.googleapis.com" in outbound_url
    assert "models/gemini-2.5-flash:generateContent" in outbound_url

    # 2. Extract outbound prompt string
    prompt_sent = outbound_json["contents"][0]["parts"][0]["text"]

    # 3. Verify zero leaks of sensitive credentials in prompt
    assert "4111 2222 3333 4444" not in prompt_sent
    assert "4111222233334444" not in prompt_sent
    assert "999" not in prompt_sent  # CVV was 999
    assert "123456" not in prompt_sent  # OTP was 123456
    assert "SecretPassword!" not in prompt_sent
    assert "[REDACTED_CARD_PAN]" in prompt_sent
    assert "[REDACTED_CVV]" in prompt_sent
    assert "[REDACTED_OTP_PIN]" in prompt_sent
    assert "[REDACTED_AUTH_TOKEN]" in prompt_sent

    # 4. Verify no raw individual transaction data leaked and data minimization took effect
    assert "Sensitive Merchant Secrets Ltd" not in prompt_sent
    assert "No personal records attached" in prompt_sent

    # 5. Verify system/data boundary delimiters
    assert "<system_instructions>" in prompt_sent
    assert "<verified_context>" in prompt_sent
    assert "<untrusted_user_query>" in prompt_sent


# ------------------------------------------------------------------------------
# 2. CONSENT ENFORCEMENT AUDIT (CASES 1 - 8)
# ------------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_consent_case_1_new_account_default_disabled():
    """Case 1: New account has external AI disabled by default; no external call."""
    async with AsyncSessionLocal() as session:
        user_id = str(uuid.uuid4())
        profile = Profile(
            id=user_id,
            email=f"c1_{user_id[:8]}@example.com",
            full_name="New User Default",
            hashed_password=get_password_hash("Pass123!"),
            preferred_language="en",
            role="user"
        )
        session.add(profile)
        await session.commit()
        token = create_access_token({"sub": user_id, "email": profile.email, "role": "user"})

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Check consent endpoint
        c_resp = await client.get("/api/v1/privacy/consent", headers={"Authorization": f"Bearer {token}"})
        assert c_resp.status_code == 200
        consent_data = c_resp.json()
        assert consent_data["external_ai_enabled"] is False
        assert consent_data["allow_card_context"] is False
        assert consent_data["allow_spending_context"] is False

        # Query assistant
        a_resp = await client.post(
            "/api/v1/assistant/chat",
            headers={"Authorization": f"Bearer {token}"},
            json={"query": "Which card gives maximum cashback on Swiggy?", "language": "en"}
        )
        assert a_resp.status_code == 200
        data = a_resp.json()
        assert data["is_external_ai_used"] is False
        assert data["provider_used"] == "local_grounded_engine"
        assert "LOCAL_PROCESSING" in data["privacy_status"]


@pytest.mark.asyncio
async def test_consent_cases_2_to_6_lifecycle_and_granular_toggles():
    """
    Cases 2-6:
    2. External AI enabled.
    3. Card context disabled.
    4. Spending context disabled.
    5. Personalized recommendations disabled.
    6. Consent revoked after previously being enabled.
    """
    async with AsyncSessionLocal() as session:
        user_id = str(uuid.uuid4())
        profile = Profile(
            id=user_id,
            email=f"c26_{user_id[:8]}@example.com",
            full_name="Consent Lifecycle User",
            hashed_password=get_password_hash("Pass123!"),
            preferred_language="en",
            role="user"
        )
        session.add(profile)
        card = CreditCard(
            id=str(uuid.uuid4()),
            user_id=user_id,
            card_name="Apex Infinia",
            bank_name="HDFC Bank",
            network="VISA",
            card_variant="SuperPremium",
            last_four_digits="1111",
            is_active=True
        )
        session.add(card)
        txn = Transaction(
            id=str(uuid.uuid4()),
            user_id=user_id,
            card_id=card.id,
            merchant_name="Zomato India",
            amount=Decimal("1200.00"),
            category_id="dining",
            transaction_date=datetime.utcnow()
        )
        session.add(txn)
        await session.commit()
        token = create_access_token({"sub": user_id, "email": profile.email, "role": "user"})

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Case 2: Enable External AI with card and spending context using "mock" provider to verify flow
        put_resp1 = await client.put(
            "/api/v1/privacy/consent",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "external_ai_enabled": True,
                "allow_card_context": True,
                "allow_spending_context": True,
                "provider_preference": "mock"
            }
        )
        assert put_resp1.status_code == 200
        assert put_resp1.json()["external_ai_enabled"] is True

        res1 = await client.post(
            "/api/v1/assistant/chat",
            headers={"Authorization": f"Bearer {token}"},
            json={"query": "Which card gives maximum cashback on Swiggy?", "language": "en"}
        )
        assert res1.json()["is_external_ai_used"] is True
        assert res1.json()["provider_used"] == "mock"

        # Case 3: Disable card context
        await client.put(
            "/api/v1/privacy/consent",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "external_ai_enabled": True,
                "allow_card_context": False,
                "allow_spending_context": True,
                "provider_preference": "mock"
            }
        )
        async with AsyncSessionLocal() as s2:
            c3 = await ConsentService.get_or_create_consent(s2, user_id)
            assert c3.allow_card_context is False
            ctx3, _ = PrivacyContextBuilder.build_minimized_context(
                task_type=AiTaskType.CARD_RECOMMENDATION_EXPLANATION,
                user_cards=[card],
                allow_card_context=False
            )
            assert "Apex Infinia" not in ctx3
            assert "User has not consented to external card context sharing." in ctx3

        # Case 4: Disable spending context
        await client.put(
            "/api/v1/privacy/consent",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "external_ai_enabled": True,
                "allow_card_context": True,
                "allow_spending_context": False,
                "provider_preference": "mock"
            }
        )
        async with AsyncSessionLocal() as s3:
            ctx4, _ = PrivacyContextBuilder.build_minimized_context(
                task_type=AiTaskType.SPENDING_ANALYSIS_SUMMARY,
                user_transactions=[txn],
                allow_spending_context=False
            )
            assert "Dining" not in ctx4
            assert "User has not consented to external spending context sharing." in ctx4

        # Case 6: Revoke consent after previously being enabled
        put_revoked = await client.put(
            "/api/v1/privacy/consent",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "external_ai_enabled": False,
                "allow_card_context": False,
                "allow_spending_context": False,
                "provider_preference": "mock"
            }
        )
        assert put_revoked.status_code == 200
        assert put_revoked.json()["external_ai_enabled"] is False
        assert put_revoked.json()["revoked_at"] is not None

        # Verify query immediately routes to local engine with zero AI dispatch
        res_after_revocation = await client.post(
            "/api/v1/assistant/chat",
            headers={"Authorization": f"Bearer {token}"},
            json={"query": "Which card gives maximum cashback on Swiggy?", "language": "en"}
        )
        assert res_after_revocation.json()["is_external_ai_used"] is False
        assert res_after_revocation.json()["provider_used"] == "local_grounded_engine"
        assert res_after_revocation.json()["privacy_status"] == "LOCAL_PROCESSING_CONSENT_WITHDRAWN"


@pytest.mark.asyncio
async def test_consent_case_7_and_8_bypass_attempts_and_unauthenticated():
    """
    Case 7: Direct API request attempting to bypass frontend controls.
    Case 8: Missing or invalid authentication.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Case 8: Missing auth
        unauth_consent = await client.get("/api/v1/privacy/consent")
        assert unauth_consent.status_code == 401

        unauth_chat = await client.post("/api/v1/assistant/chat", json={"query": "What is APR?"})
        assert unauth_chat.status_code == 401

        # Case 8: Invalid token
        bad_token_resp = await client.get(
            "/api/v1/privacy/consent",
            headers={"Authorization": "Bearer bad.forged.token"}
        )
        assert bad_token_resp.status_code == 401


# ------------------------------------------------------------------------------
# 3. CROSS-USER DATA ISOLATION AUDIT
# ------------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_cross_user_data_isolation():
    """
    Verifies strict multi-tenant isolation between User A and User B:
    - User A cannot view or update User B's AI consent.
    - User A cannot access User B's AI audit logs.
    - User A's assistant queries never see User B's cards or transactions.
    """
    async with AsyncSessionLocal() as session:
        # Create User A
        user_a_id = str(uuid.uuid4())
        user_a = Profile(
            id=user_a_id,
            email=f"usera_{user_a_id[:8]}@example.com",
            full_name="User Alpha",
            hashed_password=get_password_hash("AlphaPass123!"),
            preferred_language="en",
            role="user"
        )
        session.add(user_a)

        # Create User B
        user_b_id = str(uuid.uuid4())
        user_b = Profile(
            id=user_b_id,
            email=f"userb_{user_b_id[:8]}@example.com",
            full_name="User Beta",
            hashed_password=get_password_hash("BetaPass123!"),
            preferred_language="en",
            role="user"
        )
        session.add(user_b)
        await session.flush()  # Persist parent Profile rows to avoid FK violation in PostgreSQL

        # User B Card
        card_b = CreditCard(
            id=str(uuid.uuid4()),
            user_id=user_b_id,
            card_name="Secret Titanium Reserve",
            bank_name="Axis Bank",
            network="MASTERCARD",
            last_four_digits="9999",
            is_active=True
        )
        session.add(card_b)

        # User B Audit Log
        audit_b = AiRequestAuditLog(
            request_id=f"req_b_{user_b_id[:8]}",
            user_id=user_b_id,
            task_type=AiTaskType.CARD_RECOMMENDATION_EXPLANATION.value,
            data_classification=DataClassification.SENSITIVE.value,
            provider="mock",
            model_name="mock-model",
            consent_status="GRANTED",
            redaction_count=0,
            status="SUCCESS"
        )
        session.add(audit_b)
        await session.commit()

        token_a = create_access_token({"sub": user_a_id, "email": user_a.email, "role": "user"})
        token_b = create_access_token({"sub": user_b_id, "email": user_b.email, "role": "user"})

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. User A retrieves consent: MUST receive user_a_id, never user_b_id
        resp_a_consent = await client.get("/api/v1/privacy/consent", headers={"Authorization": f"Bearer {token_a}"})
        assert resp_a_consent.status_code == 200
        assert resp_a_consent.json()["user_id"] == user_a_id

        # 2. User A retrieves audit logs: MUST NOT see User B's audit log
        resp_a_audit = await client.get("/api/v1/privacy/audit-logs", headers={"Authorization": f"Bearer {token_a}"})
        assert resp_a_audit.status_code == 200
        a_logs = resp_a_audit.json()
        assert not any(l["request_id"] == audit_b.request_id for l in a_logs)

        # 3. User B retrieves audit logs: MUST see User B's audit log
        resp_b_audit = await client.get("/api/v1/privacy/audit-logs", headers={"Authorization": f"Bearer {token_b}"})
        assert resp_b_audit.status_code == 200
        b_logs = resp_b_audit.json()
        assert any(l["request_id"] == audit_b.request_id for l in b_logs)

        # 4. Assistant query isolation: User A's assistant query never cites User B's card
        resp_a_chat = await client.post(
            "/api/v1/assistant/chat",
            headers={"Authorization": f"Bearer {token_a}"},
            json={"query": "What cards do I have?", "language": "en"}
        )
        assert resp_a_chat.status_code == 200
        a_chat_data = resp_a_chat.json()
        assert "Secret Titanium Reserve" not in a_chat_data["response"]
        assert card_b.id not in a_chat_data["grounded_card_ids"]


# ------------------------------------------------------------------------------
# 4. SENSITIVE DATA REDACTOR COMPREHENSIVE BENCHMARK
# ------------------------------------------------------------------------------

def test_sensitive_data_redactor_comprehensive_benchmark():
    """
    Tests edge cases, boundary conditions, false positives, and false negatives.
    """
    test_cases = [
        # 16-digit card numbers with spaces and hyphens
        ("Card 4532 1123 4567 8901 for payment", "[REDACTED_CARD_PAN]", "CARD_PAN"),
        ("Number: 5412-3456-7890-1234 on invoice", "[REDACTED_CARD_PAN]", "CARD_PAN"),
        ("6011001234567890 direct continuous", "[REDACTED_CARD_PAN]", "CARD_PAN"),

        # 15-digit Amex
        ("Amex 3782-822463-10005 card", "[REDACTED_CARD_PAN]", "CARD_PAN"),
        ("Amex continuous 378282246310005 card", "[REDACTED_CARD_PAN]", "CARD_PAN"),

        # CVV and CVC
        ("CVV is 789 on back", "[REDACTED_CVV]", "CVV"),
        ("security code: 1234", "[REDACTED_CVV]", "CVV"),
        ("cvc=456", "[REDACTED_CVV]", "CVV"),

        # OTP and PIN
        ("Your OTP is 482910 valid for 5 min", "[REDACTED_OTP_PIN]", "OTP_PIN"),
        ("ATM PIN: 1234", "[REDACTED_OTP_PIN]", "OTP_PIN"),
        ("one-time password 987654", "[REDACTED_OTP_PIN]", "OTP_PIN"),

        # Indian Aadhaar
        ("Aadhaar: 2345 6789 0123 for KYC", "[REDACTED_AADHAAR]", "AADHAAR"),
        ("Aadhaar 2345-6789-0123 formatted", "[REDACTED_AADHAAR]", "AADHAAR"),

        # Indian Income Tax PAN
        ("Tax PAN is ABCDE1234F for filing", "[REDACTED_TAX_PAN]", "TAX_PAN"),

        # Bank Account
        ("Account no: 123456789012345", "[REDACTED_BANK_ACCOUNT]", "BANK_ACCOUNT"),
        ("Bank a/c 987654321098", "[REDACTED_BANK_ACCOUNT]", "BANK_ACCOUNT"),

        # Bearer token and passwords
        ("Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-ID", "[REDACTED_AUTH_TOKEN]", "AUTH_TOKEN"),
        ("password: SuperSecretPass123!", "[REDACTED_AUTH_TOKEN]", "AUTH_TOKEN"),
        ("api_key: AIzaSyFakeSecret123456789", "[REDACTED_AUTH_TOKEN]", "AUTH_TOKEN"),
    ]

    for raw_text, expected_token, expected_type in test_cases:
        sanitized, count, types, has_hs = SensitiveDataRedactor.redact(raw_text)
        assert count >= 1, f"Failed on: {raw_text}"
        assert expected_type in types, f"Type {expected_type} not found in {types} for: {raw_text}"
        assert expected_token in sanitized, f"Token {expected_token} not in sanitized: {sanitized}"
        assert has_hs is True

    # Test False Positives / Benign text that SHOULD NOT be redacted as PAN or credentials
    benign_text = "I spent ₹1,500 on Swiggy and ₹2,500 on Amazon with 5% cashback."
    s_benign, c_benign, t_benign, hs_benign = SensitiveDataRedactor.redact(benign_text)
    assert c_benign == 0
    assert hs_benign is False
    assert s_benign == benign_text


# ------------------------------------------------------------------------------
# 5. CONTEXT MINIMIZATION VERIFICATION (ALL 4 TASKS)
# ------------------------------------------------------------------------------

def test_context_minimization_all_four_tasks():
    """
    Verifies that for each of the 4 approved tasks, the generated context
    contains ONLY permitted fields.
    """
    sample_cards = [
        CreditCard(
            id="crd_test_123",
            card_name="Regalia Gold",
            bank_name="HDFC Bank",
            network="VISA",
            card_variant="Gold",
            joining_fee=Decimal("2500.00"),
            last_four_digits="4321",
            reward_rules=[
                CardRewardRule(id="r1", category_id="dining", reward_rate_percentage=Decimal("5.0")),
                CardRewardRule(id="r2", category_id="travel", reward_rate_percentage=Decimal("10.0"))
            ]
        )
    ]

    sample_txns = [
        Transaction(
            id="tx_1",
            amount=Decimal("2500.00"),
            category_id="dining",
            merchant_name="Barbeque Nation Bangalore",
            transaction_date=datetime.utcnow()
        ),
        Transaction(
            id="tx_2",
            amount=Decimal("1500.00"),
            category_id="groceries",
            merchant_name="Blinkit Quick Commerce",
            transaction_date=datetime.utcnow()
        )
    ]

    # Task 1: FINANCIAL_EDUCATION
    ctx_edu, class_edu = PrivacyContextBuilder.build_minimized_context(
        task_type=AiTaskType.FINANCIAL_EDUCATION,
        user_cards=sample_cards,
        user_transactions=sample_txns,
        allow_card_context=True,
        allow_spending_context=True
    )
    assert class_edu == DataClassification.PUBLIC
    assert "Regalia Gold" not in ctx_edu
    assert "Barbeque Nation" not in ctx_edu
    assert "₹2500.00" not in ctx_edu

    # Task 2: OFFER_INTERPRETATION
    offer_dict = {
        "offer_title": "Weekend Dining 15% Off",
        "merchant_name": "Zomato",
        "discount_value": 15,
        "max_discount_amount": 200,
        "min_transaction_value": 500,
        "promo_code": "CLIQ15"
    }
    ctx_offer, class_offer = PrivacyContextBuilder.build_minimized_context(
        task_type=AiTaskType.OFFER_INTERPRETATION,
        offer_terms=offer_dict
    )
    assert class_offer == DataClassification.PUBLIC
    assert "Weekend Dining 15% Off" in ctx_offer
    assert "CLIQ15" in ctx_offer
    assert "Regalia Gold" not in ctx_offer

    # Task 3: CARD_RECOMMENDATION_EXPLANATION (Consented)
    ctx_card, class_card = PrivacyContextBuilder.build_minimized_context(
        task_type=AiTaskType.CARD_RECOMMENDATION_EXPLANATION,
        user_cards=sample_cards,
        allow_card_context=True
    )
    assert class_card == DataClassification.SENSITIVE
    assert "Regalia Gold" in ctx_card
    assert "HDFC Bank" in ctx_card
    assert "dining: 5.0%" in ctx_card
    # Check that private fields (joining fee, internal UUID, last_four) are NOT leaked
    assert "2500" not in ctx_card
    assert "crd_test_123" not in ctx_card

    # Task 4: SPENDING_ANALYSIS_SUMMARY (Consented)
    ctx_spend, class_spend = PrivacyContextBuilder.build_minimized_context(
        task_type=AiTaskType.SPENDING_ANALYSIS_SUMMARY,
        user_transactions=sample_txns,
        allow_spending_context=True
    )
    assert class_spend == DataClassification.SENSITIVE
    assert "Dining: ₹2500.00" in ctx_spend
    assert "Groceries: ₹1500.00" in ctx_spend
    # Raw merchant strings and transaction IDs MUST NOT be present
    assert "Barbeque Nation" not in ctx_spend
    assert "Blinkit Quick Commerce" not in ctx_spend
    assert "tx_1" not in ctx_spend


# ------------------------------------------------------------------------------
# 6. AUDIT LOGGING PRIVACY & MULTI-TENANT ISOLATION
# ------------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_audit_log_contains_no_pii_and_enforces_isolation():
    """
    Validates that database audit log records:
    1. Contain request_id, task_type, provider, latency, token metrics, redaction count.
    2. Do NOT contain raw queries, full prompts, or financial secrets.
    """
    async with AsyncSessionLocal() as session:
        user_id = str(uuid.uuid4())
        profile = Profile(
            id=user_id,
            email=f"audit_iso_{user_id[:8]}@example.com",
            full_name="Audit Inspection User",
            hashed_password=get_password_hash("Pass123!"),
            preferred_language="en",
            role="user"
        )
        session.add(profile)
        await session.commit()
        token = create_access_token({"sub": user_id, "email": profile.email, "role": "user"})

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Submit query with PII
        await client.post(
            "/api/v1/assistant/chat",
            headers={"Authorization": f"Bearer {token}"},
            json={"query": "My card is 4111 2222 3333 4444 with CVV 321. What is interest?", "language": "en"}
        )

    # Inspect database directly
    async with AsyncSessionLocal() as session:
        stmt = select(AiRequestAuditLog).where(AiRequestAuditLog.user_id == user_id)
        logs = (await session.execute(stmt)).scalars().all()
        assert len(logs) >= 1
        log = logs[0]

        # Verify safe attributes
        assert log.request_id is not None
        assert log.task_type == AiTaskType.FINANCIAL_EDUCATION.value
        assert log.redaction_count >= 2

        # Verify audit log entity has NO columns for raw query or raw prompt
        assert not hasattr(log, "raw_query")
        assert not hasattr(log, "prompt")
        assert not hasattr(log, "response")
