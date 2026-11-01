import pytest
from decimal import Decimal
from datetime import datetime
from app.services.statement_parser.csv_parser import CSVStatementParser, ParsedStatementRow
from app.services.statement_parser.deduplication import DeduplicationEngine
from app.models.entities import Transaction

def test_hdfc_bank_statement_parsing():
    csv_text = """HDFC Bank Credit Card Statement
Card Number: XXXX-XXXX-XXXX-4321
Date,Transaction Description,Amount,Cr/Dr
12/09/2026,SWIGGY BANGALORE,540.00,Dr
14/09/2026,AMAZON PAY INDIA,1299.00,Dr
15/09/2026,AUTOPAY PAYMENT RECEIVED,5000.00,Cr
18/09/2026,HPCL PETROL PUMP MUMBAI,2400.00,Dr
"""
    bank_fmt, rows = CSVStatementParser.parse_csv_content(csv_text)
    assert bank_fmt == "HDFC"
    assert len(rows) == 4

    # Row 0: Swiggy
    r0 = rows[0]
    assert r0.is_valid is True
    assert r0.is_credit is False
    assert r0.parsed_date == datetime(2026, 9, 12)
    assert r0.parsed_amount == Decimal("540.00")
    assert r0.canonical_merchant == "Swiggy"
    assert r0.category_id == "food_delivery"
    assert r0.requires_category_review is False

    # Row 1: Amazon
    r1 = rows[1]
    assert r1.is_valid is True
    assert r1.is_credit is False
    assert r1.parsed_date == datetime(2026, 9, 14)
    assert r1.parsed_amount == Decimal("1299.00")
    assert r1.canonical_merchant == "Amazon"
    assert r1.category_id == "shopping"

    # Row 2: Autopay Credit / Payment
    r2 = rows[2]
    assert r2.is_credit is True  # Should be flagged as credit/payment!

    # Row 3: HPCL Fuel
    r3 = rows[3]
    assert r3.is_valid is True
    assert r3.is_credit is False
    assert r3.canonical_merchant == "HPCL"
    assert r3.category_id == "fuel"

def test_icici_bank_statement_parsing():
    csv_text = """Date,Transaction Details,Ref No,Amount(INR),Cr/Dr
15-Aug-2026,ZOMATO ORDER GURGAON,REF10092831,450.50,DR
16-Aug-2026,NETFLIX ENTERTAINMENT,REF10092832,649.00,DR
17-Aug-2026,AIRTEL BROADBAND PAYMENT,REF10092833,1199.00,DR
20-Aug-2026,INTEREST REVERSAL,,50.00,CR
"""
    bank_fmt, rows = CSVStatementParser.parse_csv_content(csv_text)
    assert bank_fmt == "ICICI"
    assert len(rows) == 4

    assert rows[0].canonical_merchant == "Zomato"
    assert rows[0].category_id == "food_delivery"
    assert rows[0].reference_number == "REF10092831"
    assert rows[0].parsed_amount == Decimal("450.50")

    assert rows[1].canonical_merchant == "Netflix"
    assert rows[1].category_id == "entertainment"

    assert rows[2].canonical_merchant == "Airtel"
    assert rows[2].category_id == "utility"

    assert rows[3].is_credit is True

def test_sbi_card_statement_parsing():
    csv_text = """Date,Transaction Details,Ref Number,Amount,Debit/Credit
10-Oct-2026,BLINKIT COMMERCE IN,SBI992123,890.00,D
11-Oct-2026,MAKEMYTRIP INDIA,SBI992124,4200.00,D
12-Oct-2026,PAYMENT RECEIVED - UPI,SBI992125,5000.00,C
"""
    bank_fmt, rows = CSVStatementParser.parse_csv_content(csv_text)
    assert bank_fmt == "SBI"
    assert len(rows) == 3

    assert rows[0].canonical_merchant == "Blinkit"
    assert rows[0].category_id == "grocery"
    assert rows[0].reference_number == "SBI992123"

    assert rows[1].canonical_merchant == "MakeMyTrip"
    assert rows[1].category_id == "travel"

    assert rows[2].is_credit is True

def test_axis_bank_statement_parsing():
    csv_text = """Tran Date,Transaction Details,Reference Number,Amount,Debit/Credit
05-11-2026,DMART READY RETAIL,AX7711200,3200.00,DR
06-11-2026,APOLLO PHARMACY BANGALORE,AX7711201,840.00,DR
07-11-2026,NEFT BILL PAYMENT,AX7711202,4000.00,CR
"""
    bank_fmt, rows = CSVStatementParser.parse_csv_content(csv_text)
    assert bank_fmt == "AXIS"
    assert len(rows) == 3

    assert rows[0].canonical_merchant == "DMart"
    assert rows[0].category_id == "grocery"

    assert rows[1].canonical_merchant == "Apollo Pharmacy"
    assert rows[1].category_id == "health"

    assert rows[2].is_credit is True

def test_amex_statement_parsing():
    csv_text = """Date,Description,Amount,Reference Number
2026-10-01,STARBUCKS COFFEE IND,390.00,AMX88120
2026-10-02,MYNTRA DESIGNS BANGALORE,2890.00,AMX88121
2026-10-05,PAYMENT RECEIVED - THANK YOU,-3280.00,AMX88122
"""
    bank_fmt, rows = CSVStatementParser.parse_csv_content(csv_text)
    assert bank_fmt == "AMEX"
    assert len(rows) == 3

    assert rows[0].canonical_merchant == "Starbucks"
    assert rows[0].category_id == "dining"
    assert rows[0].parsed_amount == Decimal("390.00")

    assert rows[1].canonical_merchant == "Myntra"
    assert rows[1].category_id == "shopping"

    assert rows[2].is_credit is True

def test_generic_csv_statement_parsing():
    csv_text = """Date,Merchant,Amount,Category,Reference Number
2026-10-10,Local Boutique,1500.00,shopping,REF999
2026-10-11,Unknown Corner Store,200.00,,
"""
    bank_fmt, rows = CSVStatementParser.parse_csv_content(csv_text)
    assert len(rows) == 2

    # Explicit category given
    assert rows[0].category_id == "shopping"
    assert rows[0].requires_category_review is False

    # Unknown merchant with no category hint -> flags for review
    assert rows[1].category_id == "other"
    assert rows[1].requires_category_review is True

def test_invalid_and_corrupt_rows():
    csv_text = """Date,Description,Amount
invalid-date,Swiggy,500.00
14/10/2026,,500.00
15/10/2026,Amazon,NOT_AN_AMOUNT
"""
    bank_fmt, rows = CSVStatementParser.parse_csv_content(csv_text)
    assert len(rows) == 3
    assert rows[0].is_valid is False
    assert "Invalid date" in rows[0].error_message
    assert rows[1].is_valid is False
    assert "Missing transaction description" in rows[1].error_message
    assert rows[2].is_valid is False
    assert "Invalid or non-positive amount" in rows[2].error_message

def test_deduplication_engine_classification():
    user_id = "user-123"
    txn_date = datetime(2026, 10, 15)
    amount = Decimal("500.00")
    merchant = "Swiggy"

    existing_txn = Transaction(
        id="t-1",
        user_id=user_id,
        card_id="c-1",
        category_id="food_delivery",
        merchant_name=merchant,
        amount=amount,
        transaction_date=txn_date,
        reference_number="REF-EXISTING-1",
        deduplication_hash=DeduplicationEngine.compute_deduplication_hash(
            user_id=user_id,
            txn_date=txn_date,
            amount=amount,
            normalized_merchant=merchant,
            card_id="c-1"
        )
    )

    # 1. Exact Duplicate by Reference Number
    row_ref_dup = ParsedStatementRow(
        row_index=1,
        raw_date="15/10/2026",
        parsed_date=txn_date,
        raw_description="Swiggy Order",
        raw_amount="500.00",
        parsed_amount=amount,
        reference_number="REF-EXISTING-1",
        canonical_merchant=merchant
    )
    status, reason, _ = DeduplicationEngine.evaluate_row_duplicates(
        user_id=user_id,
        row=row_ref_dup,
        card_id="c-1",
        existing_txns=[existing_txn]
    )
    assert status == "EXACT_DUPLICATE"
    assert "REF-EXISTING-1" in reason

    # 2. Ambiguous Duplicate when Statement Lacks Stable Reference ID
    # Flagged for user review rather than automatically dropped
    row_ambig = ParsedStatementRow(
        row_index=2,
        raw_date="15/10/2026",
        parsed_date=txn_date,
        raw_description="Swiggy Order",
        raw_amount="500.00",
        parsed_amount=amount,
        reference_number=None,
        canonical_merchant=merchant
    )
    status2, reason2, _ = DeduplicationEngine.evaluate_row_duplicates(
        user_id=user_id,
        row=row_ambig,
        card_id="c-1",
        existing_txns=[existing_txn]
    )
    assert status2 == "AMBIGUOUS_DUPLICATE"
    assert "verify if this is a repeat purchase" in reason2

    # 3. Ambiguous Duplicate (Same merchant, amount, date, but different/unassigned card and no ref number)
    # The user might have used another card or repeated the purchase
    row_ambiguous = ParsedStatementRow(
        row_index=3,
        raw_date="15/10/2026",
        parsed_date=txn_date,
        raw_description="Swiggy Order",
        raw_amount="500.00",
        parsed_amount=amount,
        reference_number=None,
        canonical_merchant=merchant
    )
    status3, reason3, _ = DeduplicationEngine.evaluate_row_duplicates(
        user_id=user_id,
        row=row_ambiguous,
        card_id="c-2",  # different card
        existing_txns=[existing_txn]
    )
    assert status3 == "AMBIGUOUS_DUPLICATE"
    assert "verify if this is a repeat purchase" in reason3

    # 4. Brand New Transaction
    row_new = ParsedStatementRow(
        row_index=4,
        raw_date="16/10/2026",
        parsed_date=datetime(2026, 10, 16),
        raw_description="Amazon India",
        raw_amount="1200.00",
        parsed_amount=Decimal("1200.00"),
        reference_number="REF-NEW-99",
        canonical_merchant="Amazon"
    )
    status4, reason4, _ = DeduplicationEngine.evaluate_row_duplicates(
        user_id=user_id,
        row=row_new,
        card_id="c-1",
        existing_txns=[existing_txn]
    )
    assert status4 == "NEW"
    assert reason4 is None
