# CLIQ — Known Issues, Defect History & Pending Remediations

This document provides a complete audit of defects DEF-01 through DEF-09, their verified resolutions, and known architectural considerations.

---

## 1. Defect Audit & Resolution Matrix

Every defect identified in the Phase 3.1 audit was resolved and hardened during Phase 3.2:

| Defect ID | Severity | Module & Location | Root Cause | Remediation Applied | Verified Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **DEF-01** | High | `backend/app/api/v1/transactions.py`<br>(line ~670) | Transactions with payment methods `CASH`, `UPI`, etc. received credit card reward points if user had active cards. | Strict validation: non-card methods reject `card_id` with HTTP 400 and force `reward_earned_monetary = 0.00`. | **RESOLVED & VERIFIED** |
| **DEF-02** | Medium | `frontend/app/dashboard/page.tsx`<br>(line ~168) | Dashboard checked `cards.length === 0` to toggle No-Credit-Card mode rather than `profile.financial_pathway`. | Refactored to inspect `userProfile?.financial_pathway === "NO_CREDIT_CARD"` explicitly. | **RESOLVED & VERIFIED** |
| **DEF-03** | High | `backend/app/api/v1/incomes.py`<br>(line ~175) | Rolling median averaged raw income records rather than aggregating into 3 distinct calendar monthly sums. | Replaced with discrete 30-day monthly bucketing: $M_1, M_2, M_3$ and took `median([M1, M2, M3])`. | **RESOLVED & VERIFIED** |
| **DEF-04** | High | `backend/app/api/v1/incomes.py`<br>(line ~128) | Historical one-time incomes (e.g. bonus received 6 months ago) projected perpetual monthly income. | Restricted one-time income amortization to incomes received within the last 90 days; older events expire. | **RESOLVED & VERIFIED** |
| **DEF-05** | Medium | `backend/app/services/financial_health/health_engine.py`<br>(line ~140) | Empty user profiles with zero data received a synthetic 75/100 score. | Hardened to emit score `0` with `status: INSUFFICIENT_DATA` when transactions and incomes are absent. | **RESOLVED & VERIFIED** |
| **DEF-06** | Medium | `backend/app/api/v1/transactions.py`<br>(line ~356, ~519) | CSV statement parser defaulted unknown payment channels to `CREDIT_CARD`. | Inferred payment method from transaction description (UPI tags, NEFT, ATM, etc.) with default fallback to `UPI`. | **RESOLVED & VERIFIED** |
| **DEF-07** | High | `backend/alembic/versions/` | Database tables were initialized via runtime DDL (`Base.metadata.create_all`) without tracked migrations. | Created 3 versioned Alembic migration scripts (`1bcc80487546`, `70d32b55c78e`, `c1f3a2b4e5d6`). | **RESOLVED & VERIFIED** |
| **DEF-08** | Low | `frontend/lib/translations.ts` | Income management modal lacked Hindi and Kannada translations for form fields. | Added complete `incomes` translation section across English, Hindi (Devanagari), and Kannada. | **RESOLVED & VERIFIED** |
| **DEF-09** | Medium | `backend/tests/security/test_ai_data_egress_audit.py` | `test_cross_user_data_isolation` failed in PostgreSQL because User B was referenced before flush. | Added `await session.flush()` immediately after creating parent `Profile` records. | **RESOLVED & VERIFIED** |

---

## 2. Regression Test Coverage

The resolutions for DEF-01 through DEF-09 are verified by dedicated regression tests:

1. **`backend/tests/unit/test_no_card_mode.py`:**
   - `test_non_card_transaction_with_user_cards_present_rejects_card_attribution` (DEF-01)
   - `test_rolling_90d_monthly_median_and_one_time_expiry` (DEF-03, DEF-04)
   - `test_financial_health_empty_profile_provisional_zero_score` (DEF-05)
2. **`frontend/__tests__/no_card_mode.test.ts`:**
   - Verifies income normalization, 90-day rolling median calculation, and non-card transaction payload formatting.
3. **`frontend/__tests__/localization.test.ts`:**
   - Verifies 100% dictionary completeness across all 20 sections in English, Hindi, and Kannada (DEF-08).

---

## 3. Known Architectural Considerations & Technical Debts

When continuing development into Phase 4 and beyond, Claude should keep the following considerations in mind:

1. **Network-Dependent Integration Tests:**
   - `backend/tests/integration/test_supabase_postgres_integration.py` and `backend/tests/security/test_gemini_smoke_test.py` require active internet access and credentials.
   - For fast local test cycles, run unit tests: `PYTHONPATH=. .venv/bin/pytest tests/unit/`.
2. **Client-Side Document OCR:**
   - The document upload pipeline accepts PDFs and extracts plain text if unencrypted; scanned image receipts or camera snapshots currently require OCR expansion (scheduled for Phase 5).
3. **In-Memory Rate Limiting:**
   - Rate limiting is currently in-memory per FastAPI worker process. For multi-worker container clusters, a Redis backing store should be introduced.

