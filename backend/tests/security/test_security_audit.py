import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app, init_db
from app.security.jwt import create_access_token

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await init_db()

@pytest.mark.asyncio
async def test_unauthenticated_requests_rejected():
    """Protected endpoints reject requests without a valid Bearer token."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp_profile = await client.get("/api/v1/profile")
        assert resp_profile.status_code == 401
        assert "Authentication token is missing" in resp_profile.json()["detail"]

        resp_cards = await client.get("/api/v1/cards")
        assert resp_cards.status_code == 401

        resp_tx = await client.get("/api/v1/transactions")
        assert resp_tx.status_code == 401

@pytest.mark.asyncio
async def test_invalid_or_expired_jwt_rejected():
    """Malformed or invalid JWT signature is rejected with 401."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        bad_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsig"
        headers = {"Authorization": f"Bearer {bad_token}"}
        resp = await client.get("/api/v1/profile", headers=headers)
        assert resp.status_code == 401
        assert "Invalid or expired" in resp.json()["detail"]

@pytest.mark.asyncio
async def test_idor_cross_tenant_isolation():
    """User B cannot access or modify User A's credit card."""
    unique_a = uuid.uuid4().hex[:8]
    unique_b = uuid.uuid4().hex[:8]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register User A
        reg_a = await client.post("/api/v1/auth/register", json={
            "email": f"user_a_{unique_a}@cliq.finance",
            "password": "PasswordA123!",
            "full_name": "User Alpha",
            "preferred_language": "en",
            "currency": "INR"
        })
        assert reg_a.status_code == 200
        token_a = reg_a.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # User A creates a card
        card_a = await client.post("/api/v1/cards", headers=headers_a, json={
            "card_name": "Alpha Private Card",
            "bank_name": "HDFC Bank",
            "network": "VISA",
            "annual_fee": 500.0,
            "rules": []
        })
        assert card_a.status_code == 201
        card_a_id = card_a.json()["id"]

        # Register User B
        reg_b = await client.post("/api/v1/auth/register", json={
            "email": f"user_b_{unique_b}@cliq.finance",
            "password": "PasswordB123!",
            "full_name": "User Beta",
            "preferred_language": "en",
            "currency": "INR"
        })
        assert reg_b.status_code == 200
        token_b = reg_b.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # User B attempts to read User A's card by ID
        idor_read = await client.get(f"/api/v1/cards/{card_a_id}", headers=headers_b)
        assert idor_read.status_code == 404
        assert "unauthorized access" in idor_read.json()["detail"]

        # User B attempts to delete User A's card by ID
        idor_del = await client.delete(f"/api/v1/cards/{card_a_id}", headers=headers_b)
        assert idor_del.status_code == 404

        # User B's list should not include User A's card
        b_list = await client.get("/api/v1/cards", headers=headers_b)
        assert len(b_list.json()) == 0

@pytest.mark.asyncio
async def test_file_upload_security_validation():
    """Rejects non-PDF files and files without PDF magic bytes."""
    unique_u = uuid.uuid4().hex[:8]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        reg = await client.post("/api/v1/auth/register", json={
            "email": f"file_sec_{unique_u}@cliq.finance",
            "password": "Password123!",
            "preferred_language": "en",
            "currency": "INR"
        })
        assert reg.status_code == 200
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Non-pdf extension
        fake_txt = ("malicious.txt", b"plain text", "text/plain")
        resp1 = await client.post("/api/v1/documents/upload", headers=headers, files={"file": fake_txt})
        assert resp1.status_code == 400
        assert "Only PDF documents" in resp1.json()["detail"]

        # 2. PDF extension but corrupted magic bytes (spoofed file)
        corrupted_pdf = ("fake.pdf", b"NOT_A_REAL_PDF_HEADER", "application/pdf")
        resp2 = await client.post("/api/v1/documents/upload", headers=headers, files={"file": corrupted_pdf})
        assert resp2.status_code == 400
        assert "valid PDF headers" in resp2.json()["detail"]
