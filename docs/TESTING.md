# CLIQ Testing Strategy & Test Suites

The CLIQ testing harness covers unit, integration, deterministic calculation, security, and build validation.

---

## 1. Test Suite Organization

```text
backend/tests/
├── unit/
│   ├── test_reward_engine.py      # Precision Decimal math, exclusions, caps, tiering
│   ├── test_explainability.py     # Breakdown generation
│   ├── test_financial_health.py   # Subscription and breakeven algorithms
│   └── test_document_parser.py    # PDF parsing & regex extraction
├── security/
│   ├── test_idor_protection.py    # Cross-tenant data isolation
│   ├── test_auth_validation.py    # Missing, expired, malformed JWTs
│   ├── test_file_upload_sec.py    # File size & extension validation
│   └── test_rate_limiting.py      # IP rate limiter enforcement
└── api/
    ├── test_cards_api.py          # Card CRUD & ownership
    ├── test_transactions_api.py   # Transaction CRUD & category matching
    └── test_optimization_api.py   # Recommendation endpoint
```

---

## 2. Deterministic Calculation Test Cases

1. **Exact Decimal Precision:** Confirms that fractional calculations do not suffer floating-point inaccuracies (e.g. ₹0.30000000000000004).
2. **Cap Enforcement:** Ensures transactions exceeding monthly caps stop accruing rewards once threshold is met.
3. **Exclusion Validation:** Asserts that fuel and wallet categories return 0% reward when excluded.
4. **Tie-Breaking:** Validates that equal yields prioritize higher percentage, lower annual fee, and card seniority.

---

## 3. Security Test Cases

1. **IDOR Rejection:** User A attempts to read or mutate User B's credit card (`GET /cards/{user_b_card_id}`). Backend asserts HTTP 404 or 403.
2. **Unauthenticated Access:** Calls to protected routes without a valid Bearer token return HTTP 401 Unauthorized.
3. **Payload Sanitization:** Checks that unexpected extra fields are stripped or rejected.
