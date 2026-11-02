import csv
import io
import re
from datetime import datetime
from decimal import Decimal, InvalidOperation
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field

from app.services.reward_optimization.merchant_normalizer import MerchantNormalizer, MerchantMatchResult

@dataclass
class ParsedStatementRow:
    row_index: int
    raw_date: str
    parsed_date: Optional[datetime]
    raw_description: str
    raw_amount: str
    parsed_amount: Optional[Decimal]
    currency: str = "INR"
    reference_number: Optional[str] = None
    raw_type: Optional[str] = None
    is_credit: bool = False
    is_valid: bool = True
    error_message: Optional[str] = None

    # Normalization & categorization outputs
    canonical_merchant: Optional[str] = None
    category_id: str = "other"
    category_confidence: Decimal = Decimal("0.30")
    requires_category_review: bool = True
    deduplication_hash: Optional[str] = None

class CSVStatementParser:
    """
    Production-grade CSV parser for Indian credit card statements.
    Supports HDFC, ICICI, SBI, Axis, Amex, and Standard/Generic formats.
    Handles variable headers, preamble metadata lines, multiple date formats,
    thousands separators, debit/credit identification, and payment exclusion.
    """

    SUPPORTED_DATE_FORMATS = [
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%d/%m/%y",
        "%d-%m-%y",
        "%Y-%m-%d",
        "%Y/%m/%d",
        "%d-%b-%Y",
        "%d-%b-%y",
        "%d %b %Y",
        "%d %b %y",
        "%d-%B-%Y",
        "%d %B %Y",
        "%m/%d/%Y",
        "%m-%d-%Y",
    ]

    PAYMENT_KEYWORDS = {
        "payment received", "autopay", "neft payment", "imps payment",
        "cheque payment", "net banking", "billdesk", "upi payment",
        "cashback credit", "refund", "reversal", "credit adjustment",
        "total amount due", "minimum amount due", "opening balance",
        "closing balance", "payment thank you", "credt payment"
    }

    VALID_CATEGORIES = {
        "dining", "food_delivery", "grocery", "shopping", "travel",
        "utility", "fuel", "entertainment", "health", "international", "other"
    }

    @classmethod
    def normalize_category(cls, cat: Optional[str]) -> str:
        """
        Maps any freeform, display, or CSV category string to one of the 11
        canonical IDs in `spending_categories`.
        """
        if not cat:
            return "other"
        
        clean = cat.lower().strip().replace("-", "_").replace(" ", "_")
        if clean in cls.VALID_CATEGORIES:
            return clean

        simplified = re.sub(r"[^\w\s]", " ", cat.lower()).strip()
        words = simplified.split()
        joined = " ".join(words)

        if any(k in joined for k in ["food delivery", "food_delivery", "delivery", "swiggy", "zomato", "ubereats"]):
            return "food_delivery"
        if any(k in joined for k in ["dining", "restaurant", "restaurants", "cafe", "food", "bakery", "bar", "pub", "coffee"]):
            return "dining"
        if any(k in joined for k in ["grocery", "groceries", "supermarket", "supermarkets", "mart", "provisions", "blinkit", "zepto", "instamart", "bigbasket"]):
            return "grocery"
        if any(k in joined for k in ["shopping", "retail", "clothing", "apparel", "electronics", "ecommerce", "e commerce", "amazon", "flipkart", "myntra"]):
            return "shopping"
        if any(k in joined for k in ["travel", "flight", "flights", "hotel", "hotels", "transport", "cab", "taxi", "uber", "ola", "train", "railway", "irctc", "holiday"]):
            return "travel"
        if any(k in joined for k in ["utility", "utilities", "bill", "bills", "electricity", "water", "broadband", "mobile", "recharge", "dth", "gas"]):
            return "utility"
        if any(k in joined for k in ["fuel", "petrol", "diesel", "gas station", "hpcl", "bpcl", "ioc", "iocl"]):
            return "fuel"
        if any(k in joined for k in ["entertainment", "movie", "movies", "cinema", "theater", "theatre", "netflix", "prime", "hotstar", "spotify", "bookmyshow"]):
            return "entertainment"
        if any(k in joined for k in ["health", "healthcare", "medical", "pharmacy", "pharmacies", "doctor", "hospital", "medicine", "apollo", "1mg"]):
            return "health"
        if any(k in joined for k in ["international", "forex", "cross border", "foreign", "overseas"]):
            return "international"

        return "other"

    @classmethod
    def clean_amount_string(cls, amount_str: str) -> Tuple[Optional[Decimal], bool]:
        """
        Cleans amount string, stripping symbols, whitespace, thousand separators.
        Returns (parsed_decimal, is_negative_or_credit).
        """
        if not amount_str or not amount_str.strip():
            return None, False

        val = amount_str.strip()
        is_credit = False

        # Check trailing or leading Dr/Cr
        val_upper = val.upper()
        if "CR" in val_upper:
            is_credit = True
            val = re.sub(r"CR", "", val, flags=re.IGNORECASE)
        elif "DR" in val_upper:
            val = re.sub(r"DR", "", val, flags=re.IGNORECASE)

        # Check parentheses for negative: (100.50)
        if val.startswith("(") and val.endswith(")"):
            is_credit = True
            val = val[1:-1]

        # Check minus sign
        if "-" in val:
            is_credit = True
            val = val.replace("-", "")

        # Strip currency symbols and commas
        val = re.sub(r"[₹$Rs\.,\s]", lambda m: "." if m.group(0) == "." else "", val)
        # If there are multiple dots, keep only the decimal point
        if val.count(".") > 1:
            parts = val.split(".")
            val = "".join(parts[:-1]) + "." + parts[-1]

        val = val.strip()
        if not val:
            return None, is_credit

        try:
            dec = Decimal(val).quantize(Decimal("0.01"))
            if dec <= Decimal("0.00"):
                return None, True
            return dec, is_credit
        except InvalidOperation:
            return None, is_credit

    @classmethod
    def parse_date_string(cls, date_str: str) -> Optional[datetime]:
        """
        Attempts to parse a date string using supported Indian & international formats.
        """
        if not date_str or not date_str.strip():
            return None

        clean_date = date_str.strip()
        # Clean extra time components if present e.g. "14/09/2026 12:30:45"
        if " " in clean_date and len(clean_date.split()) > 1:
            first_part = clean_date.split()[0]
            if any(sep in first_part for sep in ["/", "-"]):
                clean_date = first_part

        for fmt in cls.SUPPORTED_DATE_FORMATS:
            try:
                return datetime.strptime(clean_date, fmt)
            except ValueError:
                continue

        # Try ISO format
        try:
            return datetime.fromisoformat(clean_date)
        except Exception:
            pass

        return None

    @classmethod
    def detect_format_and_header(cls, lines: List[str]) -> Tuple[str, int, Dict[str, int]]:
        """
        Scans preamble lines (first 25 lines) to detect table header and bank layout.
        Returns (bank_format, header_line_index, column_mapping).
        """
        for idx, line in enumerate(lines[:25]):
            if not line.strip():
                continue

            # Try sniffing delimiter
            delimiter = ","
            if "\t" in line and line.count("\t") > line.count(","):
                delimiter = "\t"
            elif ";" in line and line.count(";") > line.count(","):
                delimiter = ";"

            reader = csv.reader(io.StringIO(line), delimiter=delimiter)
            try:
                headers = [h.strip().lower() for h in next(reader) if h.strip()]
            except Exception:
                continue

            if len(headers) < 2:
                continue

            col_map = cls._build_col_map(headers)
            has_date = col_map.get("date") is not None
            has_amt = col_map.get("amount") is not None or col_map.get("debit") is not None
            has_desc = col_map.get("description") is not None

            if has_date and (has_amt or has_desc):
                full_text = " ".join(lines[:max(10, idx + 1)]).lower()
                h_str = " ".join(headers)

                # 1. Preamble text signature
                if "hdfc" in full_text:
                    return "HDFC", idx, col_map
                elif "icici" in full_text:
                    return "ICICI", idx, col_map
                elif "sbi" in full_text:
                    return "SBI", idx, col_map
                elif "axis" in full_text:
                    return "AXIS", idx, col_map
                elif "american express" in full_text or "amex" in full_text:
                    return "AMEX", idx, col_map

                # 2. Distinct header signature
                if "merchant" in headers or "category" in headers:
                    return "GENERIC", idx, col_map
                elif "tran date" in h_str or "particulars" in h_str:
                    return "AXIS", idx, col_map
                elif "billing amount" in h_str or "sr.no" in h_str or "amount(inr)" in h_str or "amount (inr)" in h_str or "ref no" in h_str:
                    return "ICICI", idx, col_map
                elif "ref number" in h_str or ("debit/credit" in h_str and "ref" in h_str):
                    return "SBI", idx, col_map
                elif "reference number" in h_str and not any(k in h_str for k in ["cr/dr", "dr/cr", "debit/credit"]):
                    return "AMEX", idx, col_map
                elif any(k in h_str for k in ["cr/dr", "dr/cr", "transaction description"]):
                    return "HDFC", idx, col_map
                else:
                    return "GENERIC", idx, col_map

        # Fallback to line 0 with generic map
        return "GENERIC", 0, {"date": 0, "description": 1, "amount": 2}

    @classmethod
    def _build_col_map(cls, headers: List[str]) -> Dict[str, int]:
        mapping: Dict[str, int] = {}
        for idx, h in enumerate(headers):
            h_clean = h.strip().lower()
            if "date" in h_clean and "date" not in mapping:
                mapping["date"] = idx
            elif any(k in h_clean for k in ["description", "particulars", "details", "merchant", "narration"]) and "description" not in mapping:
                mapping["description"] = idx
            elif any(k in h_clean for k in ["amount", "billing amount", "debit amount"]) and "amount" not in mapping:
                mapping["amount"] = idx
            elif any(k in h_clean for k in ["cr/dr", "dr/cr", "debit/credit", "type", "txn type"]) and "type" not in mapping:
                mapping["type"] = idx
            elif any(k in h_clean for k in ["ref", "reference", "rrn", "sr.no", "urn"]) and "reference" not in mapping:
                mapping["reference"] = idx
            elif h_clean == "debit" and "debit" not in mapping:
                mapping["debit"] = idx
            elif h_clean == "credit" and "credit" not in mapping:
                mapping["credit"] = idx
            elif "category" in h_clean and "category" not in mapping:
                mapping["category"] = idx
        return mapping

    @classmethod
    def parse_csv_content(
        cls,
        content: str,
        forced_format: Optional[str] = None
    ) -> Tuple[str, List[ParsedStatementRow]]:
        """
        Parses statement CSV text into normalized ParsedStatementRows.
        """
        lines = [line for line in content.splitlines() if line.strip()]
        if not lines:
            return "UNKNOWN", []

        detected_bank, header_idx, col_map = cls.detect_format_and_header(lines)
        bank_format = forced_format if forced_format and forced_format != "AUTO" else detected_bank

        header_line = lines[header_idx]
        delimiter = ","
        if "\t" in header_line and header_line.count("\t") > header_line.count(","):
            delimiter = "\t"
        elif ";" in header_line and header_line.count(";") > header_line.count(","):
            delimiter = ";"

        reader = csv.reader(io.StringIO("\n".join(lines[header_idx + 1:])), delimiter=delimiter)

        parsed_rows: List[ParsedStatementRow] = []

        date_col = col_map.get("date", 0)
        desc_col = col_map.get("description", 1)
        amt_col = col_map.get("amount")
        debit_col = col_map.get("debit")
        credit_col = col_map.get("credit")
        type_col = col_map.get("type")
        ref_col = col_map.get("reference")
        cat_col = col_map.get("category")

        for row_idx, row in enumerate(reader, start=header_idx + 2):
            if not row or all(not cell.strip() for cell in row):
                continue

            # Extract fields safely
            raw_date = row[date_col].strip() if len(row) > date_col else ""
            raw_desc = row[desc_col].strip() if len(row) > desc_col else ""
            raw_ref = row[ref_col].strip() if ref_col is not None and len(row) > ref_col else None
            raw_type = row[type_col].strip() if type_col is not None and len(row) > type_col else None

            # Skip metadata rows e.g. "Total Spend", "Closing Balance"
            desc_lower = raw_desc.lower()
            if any(k in desc_lower for k in ["opening balance", "closing balance", "total due", "minimum due", "statement period"]):
                continue

            # Amount extraction
            raw_amt = ""
            is_credit_row = False

            if debit_col is not None and len(row) > debit_col and row[debit_col].strip():
                raw_amt = row[debit_col].strip()
            elif amt_col is not None and len(row) > amt_col and row[amt_col].strip():
                raw_amt = row[amt_col].strip()
            elif credit_col is not None and len(row) > credit_col and row[credit_col].strip():
                raw_amt = row[credit_col].strip()
                is_credit_row = True

            # Check payment keywords in description
            if any(kw in desc_lower for kw in cls.PAYMENT_KEYWORDS):
                is_credit_row = True

            # Check type indicator
            if raw_type:
                type_upper = raw_type.upper().strip()
                if type_upper in ["CR", "C", "CREDIT"]:
                    is_credit_row = True

            parsed_amt, amt_neg = cls.clean_amount_string(raw_amt)
            if amt_neg:
                is_credit_row = True

            parsed_date = cls.parse_date_string(raw_date)

            is_valid = True
            error_msg = None

            if not raw_desc:
                is_valid = False
                error_msg = "Missing transaction description"
            elif not parsed_date:
                is_valid = False
                error_msg = f"Invalid date format: '{raw_date}'"
            elif not parsed_amt:
                is_valid = False
                error_msg = f"Invalid or non-positive amount: '{raw_amt}'"

            # Merchant Normalization & Auto-Categorization
            canonical_merchant = None
            category_id = "other"
            category_confidence = Decimal("0.30")
            requires_review = True

            if is_valid and not is_credit_row:
                norm_res: MerchantMatchResult = MerchantNormalizer.resolve_merchant(raw_desc)
                canonical_merchant = norm_res.canonical_name if norm_res.canonical_name else raw_desc.title()

                if cat_col is not None and len(row) > cat_col and row[cat_col].strip():
                    # Category explicitly supplied in CSV - normalize to canonical database ID
                    category_id = cls.normalize_category(row[cat_col].strip())
                    category_confidence = Decimal("1.00")
                    requires_review = False
                elif norm_res.is_confident_match and norm_res.category_hint:
                    category_id = norm_res.category_hint
                    category_confidence = Decimal(str(round(norm_res.confidence, 2)))
                    requires_review = False
                elif norm_res.category_hint:
                    category_id = norm_res.category_hint
                    category_confidence = Decimal(str(round(norm_res.confidence, 2)))
                    requires_review = True
                else:
                    category_id = "other"
                    category_confidence = Decimal("0.30")
                    requires_review = True

            parsed_rows.append(ParsedStatementRow(
                row_index=row_idx,
                raw_date=raw_date,
                parsed_date=parsed_date,
                raw_description=raw_desc,
                raw_amount=raw_amt,
                parsed_amount=parsed_amt,
                currency="INR",
                reference_number=raw_ref if raw_ref and raw_ref.strip() else None,
                raw_type=raw_type,
                is_credit=is_credit_row,
                is_valid=is_valid,
                error_message=error_msg,
                canonical_merchant=canonical_merchant,
                category_id=category_id,
                category_confidence=category_confidence,
                requires_category_review=requires_review
            ))

        return bank_format, parsed_rows
