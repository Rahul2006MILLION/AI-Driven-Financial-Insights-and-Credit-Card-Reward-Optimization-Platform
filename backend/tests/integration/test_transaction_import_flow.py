import pytest
import pytest_asyncio
import uuid
from decimal import Decimal
from datetime import datetime
from httpx import AsyncClient, ASGITransport

from app.main import app, init_db

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await init_db()

@pytest.mark.asyncio
async def test_csv_import_preview_and_commit_flow():
    """
    Validates end-to-end statement import pipeline:
    1. Upload CSV to preview endpoint
    2. Check merchant normalization, automatic categorization, and reward calculations
    3. Commit previewed rows and verify persistence
    4. Verify analytics are updated with real transactions
    """
    uid = uuid.uuid4().hex[:8]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Register User
        reg = await client.post("/api/v1/auth/register", json={
            "email": f"import_{uid}@cliq.finance",
            "password": "Password123!",
            "full_name": "CSV Import User",
            "preferred_language": "en"
        })
        assert reg.status_code == 200
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Add HDFC Millennia Card (5% Swiggy/Amazon, 1% base)
        card_resp = await client.post("/api/v1/cards", headers=headers, json={
            "card_name": "HDFC Millennia",
            "bank_name": "HDFC Bank",
            "network": "VISA",
            "annual_fee": 1000.0,
            "rules": [
                {
                    "category_id": "dining",
                    "merchant_pattern": "Swiggy",
                    "reward_type": "CASHBACK",
                    "reward_rate_percentage": 5.0
                },
                {
                    "category_id": "shopping",
                    "merchant_pattern": "Amazon",
                    "reward_type": "CASHBACK",
                    "reward_rate_percentage": 5.0
                },
                {
                    "category_id": "all",
                    "reward_type": "CASHBACK",
                    "reward_rate_percentage": 1.0
                }
            ]
        })
        assert card_resp.status_code == 201
        card_id = card_resp.json()["id"]

        # 3. Upload CSV to /transactions/import/preview
        sample_csv = (
            "HDFC Bank Credit Card Statement\n"
            "Date,Transaction Description,Amount,Cr/Dr\n"
            "10/10/2026,SWIGGY BANGALORE IN,1000.00,Dr\n"
            "12/10/2026,AMAZON PAY RETAIL,2000.00,Dr\n"
            "15/10/2026,AUTOPAY PAYMENT RECEIVED,3000.00,Cr\n"
        )
        files = {
            "file": ("statement.csv", sample_csv.encode("utf-8"), "text/csv")
        }
        data = {
            "card_id": card_id,
            "bank_format": "AUTO"
        }

        preview_resp = await client.post(
            "/api/v1/transactions/import/preview",
            headers=headers,
            files=files,
            data=data
        )
        assert preview_resp.status_code == 200
        pdata = preview_resp.json()

        assert pdata["detected_format"] == "HDFC"
        assert pdata["total_rows_parsed"] == 3
        assert pdata["valid_rows_count"] == 2
        assert pdata["excluded_rows_count"] == 1  # Autopay payment row excluded

        rows = pdata["rows"]
        # Swiggy Row
        assert rows[0]["merchant_name"] == "Swiggy"
        assert rows[0]["category_id"] == "food_delivery"
        assert float(rows[0]["amount"]) == 1000.0
        assert float(rows[0]["predicted_reward"]) == 50.0  # 5% of 1000 = 50.00
        assert rows[0]["duplicate_status"] == "NEW"
        assert rows[0]["selected_for_import"] is True

        # Amazon Row
        assert rows[1]["merchant_name"] == "Amazon"
        assert rows[1]["category_id"] == "shopping"
        assert float(rows[1]["amount"]) == 2000.0
        assert float(rows[1]["predicted_reward"]) == 100.0  # 5% of 2000 = 100.00

        # Payment Row
        assert rows[2]["duplicate_status"] == "EXCLUDED"
        assert rows[2]["selected_for_import"] is False

        # 4. Commit valid rows to /transactions/import/commit
        commit_rows = [
            {
                "transaction_date": rows[0]["transaction_date"],
                "raw_description": rows[0]["raw_description"],
                "merchant_name": rows[0]["merchant_name"],
                "amount": rows[0]["amount"],
                "currency": "INR",
                "category_id": rows[0]["category_id"],
                "category_confidence": rows[0]["category_confidence"],
                "reference_number": rows[0]["reference_number"],
                "deduplication_hash": rows[0]["deduplication_hash"]
            },
            {
                "transaction_date": rows[1]["transaction_date"],
                "raw_description": rows[1]["raw_description"],
                "merchant_name": rows[1]["merchant_name"],
                "amount": rows[1]["amount"],
                "currency": "INR",
                "category_id": rows[1]["category_id"],
                "category_confidence": rows[1]["category_confidence"],
                "reference_number": rows[1]["reference_number"],
                "deduplication_hash": rows[1]["deduplication_hash"]
            }
        ]

        commit_resp = await client.post("/api/v1/transactions/import/commit", headers=headers, json={
            "card_id": card_id,
            "rows": commit_rows,
            "skip_duplicates": True
        })
        assert commit_resp.status_code == 201
        cdata = commit_resp.json()

        assert cdata["imported_count"] == 2
        assert cdata["skipped_duplicates_count"] == 0
        assert float(cdata["total_spend_imported"]) == 3000.0
        assert float(cdata["total_rewards_predicted"]) == 150.0

        # 5. Check spending analytics
        spend_resp = await client.get("/api/v1/analytics/spending", headers=headers)
        assert spend_resp.status_code == 200
        assert float(spend_resp.json()["total_spending"]) == 3000.0
        assert spend_resp.json()["total_transactions"] == 2

@pytest.mark.asyncio
async def test_duplicate_prevention_on_reimport():
    """
    Verifies that re-importing the same statement rows skips duplicates and does NOT inflate spending totals.
    """
    uid = uuid.uuid4().hex[:8]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register User
        reg = await client.post("/api/v1/auth/register", json={
            "email": f"dup_{uid}@cliq.finance",
            "password": "Password123!",
            "full_name": "Duplicate Test User",
            "preferred_language": "en"
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. First Import of ICICI Statement
        sample_csv = (
            "Date,Transaction Details,Ref No,Amount(INR),Cr/Dr\n"
            "15-Aug-2026,SWIGGY BANGALORE,TXN_REF_001,500.00,DR\n"
            "16-Aug-2026,UBER TRIP MUMBAI,TXN_REF_002,350.00,DR\n"
        )
        files = {"file": ("icici.csv", sample_csv.encode("utf-8"), "text/csv")}
        p_resp = await client.post("/api/v1/transactions/import/preview", headers=headers, files=files)
        assert p_resp.status_code == 200
        pdata = p_resp.json()
        assert pdata["detected_format"] == "ICICI"
        assert pdata["valid_rows_count"] == 2

        # Commit First Import
        rows_to_commit = [
            {
                "transaction_date": r["transaction_date"],
                "raw_description": r["raw_description"],
                "merchant_name": r["merchant_name"],
                "amount": r["amount"],
                "currency": "INR",
                "category_id": r["category_id"],
                "reference_number": r["reference_number"],
                "deduplication_hash": r["deduplication_hash"]
            }
            for r in pdata["rows"] if r["is_valid"]
        ]
        c_resp1 = await client.post("/api/v1/transactions/import/commit", headers=headers, json={
            "rows": rows_to_commit,
            "skip_duplicates": True
        })
        assert c_resp1.status_code == 201
        assert c_resp1.json()["imported_count"] == 2

        # Verify initial spending is 850.00
        spend1 = await client.get("/api/v1/analytics/spending", headers=headers)
        assert float(spend1.json()["total_spending"]) == 850.0

        # 2. Preview SECOND Import of the SAME file
        files2 = {"file": ("icici_copy.csv", sample_csv.encode("utf-8"), "text/csv")}
        p_resp2 = await client.post("/api/v1/transactions/import/preview", headers=headers, files=files2)
        assert p_resp2.status_code == 200
        pdata2 = p_resp2.json()

        # Both rows must be flagged as EXACT_DUPLICATE
        assert pdata2["duplicate_rows_count"] == 2
        assert pdata2["valid_rows_count"] == 0
        assert pdata2["rows"][0]["duplicate_status"] == "EXACT_DUPLICATE"
        assert pdata2["rows"][0]["selected_for_import"] is False
        assert "TXN_REF_001" in pdata2["rows"][0]["duplicate_reason"]

        # 3. Commit SECOND Import with skip_duplicates=True
        c_resp2 = await client.post("/api/v1/transactions/import/commit", headers=headers, json={
            "rows": rows_to_commit,
            "skip_duplicates": True
        })
        assert c_resp2.status_code == 201
        cdata2 = c_resp2.json()
        assert cdata2["imported_count"] == 0
        assert cdata2["skipped_duplicates_count"] == 2

        # 4. Total spending MUST NOT have changed
        spend2 = await client.get("/api/v1/analytics/spending", headers=headers)
        assert float(spend2.json()["total_spending"]) == 850.0
        assert spend2.json()["total_transactions"] == 2

@pytest.mark.asyncio
async def test_ambiguous_duplicate_detection_and_user_decision():
    """
    Ensures transactions with same merchant, date, amount without reference number
    are flagged as AMBIGUOUS_DUPLICATE rather than silently dropped.
    """
    uid = uuid.uuid4().hex[:8]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        reg = await client.post("/api/v1/auth/register", json={
            "email": f"ambig_{uid}@cliq.finance",
            "password": "Password123!",
            "full_name": "Ambiguous User",
            "preferred_language": "en"
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Manually record Swiggy spend on 2026-10-15 for ₹500
        manual_resp = await client.post("/api/v1/transactions", headers=headers, json={
            "merchant_name": "Swiggy",
            "amount": 500.0,
            "category_id": "dining",
            "transaction_date": "2026-10-15T13:00:00"
        })
        assert manual_resp.status_code == 201

        # 2. Upload statement with another Swiggy spend of ₹500 on 2026-10-15 (without ref number)
        csv_data = "Date,Description,Amount\n15/10/2026,Swiggy,500.00\n"
        files = {"file": ("statement.csv", csv_data.encode("utf-8"), "text/csv")}

        preview_resp = await client.post("/api/v1/transactions/import/preview", headers=headers, files=files)
        assert preview_resp.status_code == 200
        pdata = preview_resp.json()

        assert pdata["ambiguous_rows_count"] == 1
        row = pdata["rows"][0]
        assert row["duplicate_status"] == "AMBIGUOUS_DUPLICATE"
        assert "Please verify if this is a repeat purchase" in row["duplicate_reason"]

@pytest.mark.asyncio
async def test_user_isolation_on_imports():
    """
    Validates tenant isolation: User B's transactions or imports cannot see or conflict with User A.
    """
    uid_a = uuid.uuid4().hex[:8]
    uid_b = uuid.uuid4().hex[:8]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register User A
        reg_a = await client.post("/api/v1/auth/register", json={
            "email": f"usera_{uid_a}@cliq.finance",
            "password": "Password123!",
            "full_name": "User A"
        })
        token_a = reg_a.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # Register User B
        reg_b = await client.post("/api/v1/auth/register", json={
            "email": f"userb_{uid_b}@cliq.finance",
            "password": "Password123!",
            "full_name": "User B"
        })
        token_b = reg_b.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # User A imports with reference number REF_999
        csv_a = "Date,Details,Ref No,Amount,Cr/Dr\n01/10/2026,Swiggy,REF_999,600.00,DR\n"
        files_a = {"file": ("stmt.csv", csv_a.encode("utf-8"), "text/csv")}
        p_a = await client.post("/api/v1/transactions/import/preview", headers=headers_a, files=files_a)
        await client.post("/api/v1/transactions/import/commit", headers=headers_a, json={
            "rows": [{
                "transaction_date": p_a.json()["rows"][0]["transaction_date"],
                "raw_description": p_a.json()["rows"][0]["raw_description"],
                "merchant_name": p_a.json()["rows"][0]["merchant_name"],
                "amount": p_a.json()["rows"][0]["amount"],
                "category_id": p_a.json()["rows"][0]["category_id"],
                "reference_number": "REF_999"
            }]
        })

        # User B previews same CSV with REF_999 -> For User B, it MUST be NEW, not a duplicate!
        files_b = {"file": ("stmt.csv", csv_a.encode("utf-8"), "text/csv")}
        p_b = await client.post("/api/v1/transactions/import/preview", headers=headers_b, files=files_b)
        assert p_b.status_code == 200
        assert p_b.json()["rows"][0]["duplicate_status"] == "NEW"

@pytest.mark.asyncio
async def test_invalid_files_and_validation():
    """
    Tests rejected file types and empty files.
    """
    uid = uuid.uuid4().hex[:8]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        reg = await client.post("/api/v1/auth/register", json={
            "email": f"inv_{uid}@cliq.finance",
            "password": "Password123!",
            "full_name": "Invalid File User"
        })
        headers = {"Authorization": f"Bearer {reg.json()['access_token']}"}

        # 1. Non-CSV extension rejected
        files_pdf = {"file": ("statement.pdf", b"%PDF-1.4...", "application/pdf")}
        r1 = await client.post("/api/v1/transactions/import/preview", headers=headers, files=files_pdf)
        assert r1.status_code == 400
        assert "Only CSV files" in r1.json()["detail"]

        # 2. Empty file rejected
        files_empty = {"file": ("empty.csv", b"", "text/csv")}
        r2 = await client.post("/api/v1/transactions/import/preview", headers=headers, files=files_empty)
        assert r2.status_code == 400
        assert "empty" in r2.json()["detail"]

