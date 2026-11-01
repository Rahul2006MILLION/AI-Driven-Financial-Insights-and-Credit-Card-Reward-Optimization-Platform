import pytest
import pytest_asyncio
import uuid
from datetime import datetime, timedelta
from jose import jwt
from httpx import AsyncClient, ASGITransport
from app.main import app, init_db
from app.core.config import settings
from app.security.jwt import create_access_token, ALGORITHM

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await init_db()

@pytest.mark.asyncio
async def test_signup_automatic_login_token_generation():
    """
    Requirement 1: After successful signup, establish an authenticated session
    if the backend supports automatic login. Verify token and user identity are returned.
    """
    unique = uuid.uuid4().hex[:8]
    email = f"signup_test_{unique}@cliq.finance"
    payload = {
        "email": email,
        "password": "StrongPassword123!",
        "full_name": "Rohan Deshmukh",
        "preferred_language": "en",
        "currency": "INR",
    }

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post("/api/v1/auth/register", json=payload)
        assert resp.status_code == 200, f"Registration failed: {resp.text}"
        data = resp.json()

        # Automatic login contract: returns valid access_token and user identity
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["email"] == email.lower()
        assert data["full_name"] == "Rohan Deshmukh"
        assert "user_id" in data
        assert len(data["user_id"]) > 0

        # Verify duplicate signup prevention
        dup_resp = await client.post("/api/v1/auth/register", json=payload)
        assert dup_resp.status_code == 400
        assert "already exists" in dup_resp.json()["detail"]

@pytest.mark.asyncio
async def test_login_success_and_identity_match():
    """
    Requirement 2 & 5: After successful login, ensure backend and client resolve same identity.
    """
    unique = uuid.uuid4().hex[:8]
    email = f"login_test_{unique}@cliq.finance"
    password = "MySecurePassword456!"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register user
        reg_resp = await client.post("/api/v1/auth/register", json={
            "email": email,
            "password": password,
            "full_name": "Priya Nair",
            "preferred_language": "hi",
            "currency": "INR",
        })
        assert reg_resp.status_code == 200
        registered_user_id = reg_resp.json()["user_id"]

        # Valid login
        login_resp = await client.post("/api/v1/auth/login", json={
            "email": email,
            "password": password,
        })
        assert login_resp.status_code == 200
        login_data = login_resp.json()
        assert login_data["user_id"] == registered_user_id
        assert login_data["email"] == email.lower()
        assert login_data["full_name"] == "Priya Nair"
        assert login_data["preferred_language"] == "hi"

        # Invalid password
        bad_pw_resp = await client.post("/api/v1/auth/login", json={
            "email": email,
            "password": "WrongPassword!",
        })
        assert bad_pw_resp.status_code == 401
        assert "Invalid email or password" in bad_pw_resp.json()["detail"]

        # Nonexistent user
        no_user_resp = await client.post("/api/v1/auth/login", json={
            "email": "nonexistent_user_999@cliq.finance",
            "password": password,
        })
        assert no_user_resp.status_code == 401

@pytest.mark.asyncio
async def test_auth_me_session_verification():
    """
    Requirement 4 & 5: Ensure /auth/me and /profile resolve user identity correctly.
    """
    unique = uuid.uuid4().hex[:8]
    email = f"me_test_{unique}@cliq.finance"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        reg = await client.post("/api/v1/auth/register", json={
            "email": email,
            "password": "Password789!",
            "full_name": "Vikram Patel",
            "preferred_language": "kn",
            "currency": "INR",
        })
        token = reg.json()["access_token"]
        user_id = reg.json()["user_id"]
        headers = {"Authorization": f"Bearer {token}"}

        # Verify /auth/me
        me_resp = await client.get("/api/v1/auth/me", headers=headers)
        assert me_resp.status_code == 200
        me_data = me_resp.json()
        assert me_data["id"] == user_id
        assert me_data["email"] == email.lower()
        assert me_data["full_name"] == "Vikram Patel"
        assert me_data["preferred_language"] == "kn"

        # Verify /profile
        profile_resp = await client.get("/api/v1/profile", headers=headers)
        assert profile_resp.status_code == 200
        assert profile_resp.json()["id"] == user_id

@pytest.mark.asyncio
async def test_expired_and_invalid_token_handling():
    """
    Requirement 8: Handle expired and invalid tokens correctly with 401 Unauthorized.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Expired token
        past_time = datetime.utcnow() - timedelta(hours=2)
        expired_token = jwt.encode(
            {"sub": "fake-user-id", "exp": past_time, "iat": past_time - timedelta(minutes=5), "iss": "cliq-auth"},
            settings.APP_SECRET_KEY,
            algorithm=ALGORITHM,
        )
        exp_resp = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
        assert exp_resp.status_code == 401
        assert "Invalid or expired" in exp_resp.json()["detail"]

        # 2. Tampered token signature
        tampered_token = jwt.encode(
            {"sub": "fake-user-id", "exp": datetime.utcnow() + timedelta(hours=1)},
            "completely_wrong_secret_key_12345678",
            algorithm=ALGORITHM,
        )
        tamp_resp = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {tampered_token}"})
        assert tamp_resp.status_code == 401

        # 3. Malformed non-JWT string
        malformed_resp = await client.get("/api/v1/auth/me", headers={"Authorization": "Bearer not-a-valid-token"})
        assert malformed_resp.status_code == 401

        # 4. Token with missing subject identifier (no sub)
        no_sub_token = jwt.encode(
            {"email": "nobody@cliq.finance", "exp": datetime.utcnow() + timedelta(hours=1)},
            settings.APP_SECRET_KEY,
            algorithm=ALGORITHM,
        )
        no_sub_resp = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {no_sub_token}"})
        assert no_sub_resp.status_code == 401

@pytest.mark.asyncio
async def test_protected_endpoints_require_auth():
    """
    Requirement 6: Verify all financial, card, transaction, and analytics endpoints require auth.
    """
    endpoints = [
        ("GET", "/api/v1/auth/me"),
        ("GET", "/api/v1/profile"),
        ("GET", "/api/v1/cards"),
        ("POST", "/api/v1/cards"),
        ("GET", "/api/v1/transactions"),
        ("POST", "/api/v1/transactions"),
        ("GET", "/api/v1/analytics/spending"),
        ("GET", "/api/v1/analytics/rewards"),
        ("GET", "/api/v1/analytics/financial-health"),
        ("GET", "/api/v1/privacy/consent"),
    ]

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        for method, endpoint in endpoints:
            if method == "GET":
                resp = await client.get(endpoint)
            else:
                resp = await client.post(endpoint, json={})
            assert resp.status_code == 401, f"{method} {endpoint} expected 401 but got {resp.status_code}"
            assert "Authentication token is missing" in resp.json()["detail"]

@pytest.mark.asyncio
async def test_cross_user_card_and_transaction_ownership_enforcement():
    """
    Requirement 6: Enforce strict ownership checks on cards, transactions, and financial data.
    User B cannot read, modify, delete, or link User A's financial assets.
    """
    unique_a = uuid.uuid4().hex[:8]
    unique_b = uuid.uuid4().hex[:8]

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create User A
        reg_a = await client.post("/api/v1/auth/register", json={
            "email": f"tenant_a_{unique_a}@cliq.finance",
            "password": "PasswordA123!",
            "full_name": "Tenant Alpha",
            "preferred_language": "en",
            "currency": "INR",
        })
        assert reg_a.status_code == 200
        headers_a = {"Authorization": f"Bearer {reg_a.json()['access_token']}"}

        # User A registers a credit card
        card_a = await client.post("/api/v1/cards", headers=headers_a, json={
            "card_name": "HDFC Infinia Metal",
            "bank_name": "HDFC Bank",
            "network": "VISA",
            "card_variant": "Infinia",
            "annual_fee": 12500.0,
            "rules": [
                {
                    "category_id": "dining",
                    "reward_type": "REWARD_POINTS",
                    "reward_rate_percentage": 3.3,
                    "point_monetary_value": 1.0,
                }
            ],
        })
        assert card_a.status_code == 201
        card_a_id = card_a.json()["id"]

        # User A records a transaction
        txn_a = await client.post("/api/v1/transactions", headers=headers_a, json={
            "card_id": card_a_id,
            "category_id": "dining",
            "merchant_name": "ITC Gardenia",
            "amount": 5000.0,
            "currency": "INR",
        })
        assert txn_a.status_code == 201
        txn_a_id = txn_a.json()["id"]

        # Create User B
        reg_b = await client.post("/api/v1/auth/register", json={
            "email": f"tenant_b_{unique_b}@cliq.finance",
            "password": "PasswordB123!",
            "full_name": "Tenant Beta",
            "preferred_language": "en",
            "currency": "INR",
        })
        assert reg_b.status_code == 200
        headers_b = {"Authorization": f"Bearer {reg_b.json()['access_token']}"}

        # 1. User B cannot read User A's card
        read_card = await client.get(f"/api/v1/cards/{card_a_id}", headers=headers_b)
        assert read_card.status_code == 404
        assert "unauthorized access" in read_card.json()["detail"]

        # 2. User B cannot update User A's card
        update_card = await client.put(f"/api/v1/cards/{card_a_id}", headers=headers_b, json={"card_name": "Hacked Card"})
        assert update_card.status_code == 404

        # 3. User B cannot delete User A's card
        del_card = await client.delete(f"/api/v1/cards/{card_a_id}", headers=headers_b)
        assert del_card.status_code == 404

        # 4. User B cannot read User A's transaction
        read_txn = await client.get(f"/api/v1/transactions/{txn_a_id}", headers=headers_b)
        assert read_txn.status_code == 404
        assert "unauthorized access" in read_txn.json()["detail"]

        # 5. User B cannot update User A's transaction feedback
        feed_txn = await client.put(f"/api/v1/transactions/{txn_a_id}/feedback", headers=headers_b, json={
            "actual_reward_earned": 200.0,
            "reward_status": "CONFIRMED",
        })
        assert feed_txn.status_code == 404

        # 6. User B cannot delete User A's transaction
        del_txn = await client.delete(f"/api/v1/transactions/{txn_a_id}", headers=headers_b)
        assert del_txn.status_code == 404

        # 7. User B cannot create a transaction referencing User A's card
        forged_txn = await client.post("/api/v1/transactions", headers=headers_b, json={
            "card_id": card_a_id,  # foreign card belonging to User A
            "category_id": "dining",
            "merchant_name": "Swiggy",
            "amount": 1000.0,
            "currency": "INR",
        })
        assert forged_txn.status_code == 404
        assert "unauthorized access" in forged_txn.json()["detail"]

        # 8. User B listing cards returns empty list
        b_cards = await client.get("/api/v1/cards", headers=headers_b)
        assert b_cards.status_code == 200
        assert len(b_cards.json()) == 0

        # 9. User B listing transactions returns empty list
        b_txns = await client.get("/api/v1/transactions", headers=headers_b)
        assert b_txns.status_code == 200
        assert len(b_txns.json()) == 0
