# CLIQ — AUTOMATED TEST RESULTS REPORT

**Report Generated:** 2026-10-30  
**Test Framework:** Pytest 9.2.0, AnyIO 4.15.1, Pytest-AsyncIO 1.4.1  
**Python Environment:** Python 3.12.14 (`backend/.venv`)  
**Frontend Build Tool:** Next.js 14.2.4 (React 18, TypeScript 5.4)  
**Total Backend Test Count:** 24  
**Total Backend Pass Count:** 24 (100% Pass Rate)  
**Execution Time:** 1.90 seconds  
**Frontend Static Routes:** 19 / 19 Generated Successfully  

---

## 1. Automated Test Suites Breakdown

### 1.1. Reward Optimization Engine Unit Tests (`backend/tests/unit/test_reward_engine.py`)

| Test Name | Focus Area | Inputs / Assertions | Status |
| :--- | :--- | :--- | :---: |
| `test_exact_decimal_calculation` | Floating point immunity | ₹1,234.56 @ 5% = ₹61.73 (not 61.728000000000004) | **PASSED** |
| `test_merchant_pattern_accelerator` | Rule precedence | Swiggy merchant matches 5% rule over dining 2% rule | **PASSED** |
| `test_exclusion_rule` | Category exclusions | Fuel category spend returns ₹0.00 and `is_excluded=True` | **PASSED** |
| `test_monthly_cap_enforcement` | Cumulative cap math | ₹2,000 spend with ₹50 remaining cap returns ₹50.00 | **PASSED** |
| `test_per_transaction_cap` | Per-transaction cap | ₹10,000 spend with ₹150 cap returns ₹150.00 | **PASSED** |
| `test_card_ranking_and_tie_breaking` | Tie-breaking logic | Highest reward first; fee tie-break puts ₹0 fee over ₹5k fee | **PASSED** |
| `test_minimum_spend_not_met` | Threshold spend | ₹500 spend with ₹1,000 minimum spend yields ₹0 reward | **PASSED** |
| `test_inactive_card_is_excluded` | Active card flag | Inactive card returns ₹0 and `exclusion_reason='inactive'` | **PASSED** |
| `test_points_reward_type_with_fractional_point_value` | Points & miles floored math | ₹1,000 @ 3.33% = 33 points @ ₹0.25 = ₹8.25 | **PASSED** |
| `test_zero_amount_handling` | Zero-spend edge case | ₹0.00 spend returns ₹0.00 without division by zero | **PASSED** |
| `test_exhausted_monthly_cap` | Zero cap remaining | Monthly spent = cap returns ₹0.00 | **PASSED** |
| `test_missing_card_rules_fallback` | Unconfigured card | Empty rules list defaults to conservative 1% base reward | **PASSED** |

### 1.2. Multilingual Assistant Unit Tests (`backend/tests/unit/test_multilingual_assistant.py`)

| Test Name | Focus Area | Language & Scenario | Status |
| :--- | :--- | :--- | :---: |
| `test_multilingual_assistant_responses` | Trilingual grounding | Swiggy dining queries in English, Hindi, and Kannada ground strictly against user cards | **PASSED** |

### 1.3. Financial Health Unit Tests (`backend/tests/unit/test_financial_health.py`)

| Test Name | Focus Area | Assertions | Status |
| :--- | :--- | :--- | :---: |
| `test_financial_health_recurring_subscriptions_detection` | Recurring expenses | Identifies Netflix, Spotify, Amazon Prime as recurring subscriptions and audits annual card fees | **PASSED** |

### 1.4. Security & Isolation Tests (`backend/tests/security/test_security_audit.py`)

| Test Name | Security Focus | Assertions | Status |
| :--- | :--- | :--- | :---: |
| `test_unauthenticated_requests_rejected` | Auth protection | Missing token on `/profile`, `/cards`, `/transactions` yields 401 | **PASSED** |
| `test_invalid_or_expired_jwt_rejected` | Token forgery | Malformed signature or expired token yields 401 | **PASSED** |
| `test_idor_cross_tenant_isolation` | Multi-tenant isolation | User B cannot read, update, or delete User A's credit card | **PASSED** |
| `test_file_upload_security_validation` | File validation | Non-PDF files and PDF files without `%PDF-` magic bytes rejected with 400 | **PASSED** |

### 1.5. Extended Security & Staging Tests (`backend/tests/security/test_extended_audit.py`)

| Test Name | Security Focus | Assertions | Status |
| :--- | :--- | :--- | :---: |
| `test_security_response_headers` | HTTP hardening | Checks CSP, HSTS, X-Content-Type-Options, X-Frame-Options | **PASSED** |
| `test_cors_options_headers` | CORS preflight | Validates OPTIONS preflight on `/api/v1/cards` | **PASSED** |
| `test_recommendation_invalid_amount_validation` | Input schema | Rejects negative or zero spend amounts with 422 | **PASSED** |
| `test_prompt_injection_defense` | Prompt injection | Malicious prompt cannot leak secrets, system prompts, or cross-tenant data | **PASSED** |
| `test_document_staging_and_verification_workflow` | Human-in-the-loop staging | Staged document (`is_verified=False`) is promoted to active card upon verification; IDOR rejected | **PASSED** |

### 1.6. Full Application End-to-End Journey (`backend/tests/api/test_e2e_flow.py`)

| Test Name | Focus Area | Journey Steps | Status |
| :--- | :--- | :--- | :---: |
| `test_full_application_e2e_journey` | Complete lifecycle | Register user -> create 2 cards (HDFC Millennia 5%, Axis Ace 2%) -> run optimizer on Swiggy -> verify HDFC is #1 -> log transaction -> check spending analytics -> verify reward leakage | **PASSED** |

---

## 2. Test Execution Log (Verbatim)

```text
============================= test session starts ==============================
platform darwin -- Python 3.12.14, pytest-9.2.0, pluggy-1.7.0
rootdir: /Users/rahuljain/CLIQ
configfile: pytest.ini
plugins: asyncio-1.4.1, anyio-4.15.1
asyncio: mode=Mode.AUTO, debug=False, asyncio_default_fixture_loop_scope=function, asyncio_default_test_loop_scope=function
collecting ... collected 24 items

backend/tests/api/test_e2e_flow.py .                                     [  4%]
backend/tests/security/test_extended_audit.py .....                      [ 25%]
backend/tests/security/test_security_audit.py ....                       [ 41%]
backend/tests/unit/test_financial_health.py .                            [ 45%]
backend/tests/unit/test_multilingual_assistant.py .                      [ 50%]
backend/tests/unit/test_reward_engine.py ............                    [100%]

============================== 24 passed in 1.90s ==============================
```

---

## 3. Frontend Production Build & TypeScript Verification

```text
> cliq-frontend@1.0.0 build
> next build

  ▲ Next.js 14.2.4

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types     ✓ Linting and checking validity of types 
   Collecting page data     ✓ Collecting page data 
 ✓ Generating static pages (19/19)
   Collecting build traces     ✓ Collecting build traces 
   Finalizing page optimization     ✓ Finalizing page optimization 

Route (app)                              Size     First Load JS
┌ ○ /                                    3.61 kB         104 kB
├ ○ /_not-found                          875 B          88.2 kB
├ ○ /analytics                           110 kB          210 kB
├ ○ /assistant                           6.13 kB         106 kB
├ ○ /cards                               3.79 kB         108 kB
├ ○ /cards/compare                       5.67 kB         106 kB
├ ○ /cards/new                           6.19 kB         106 kB
├ ○ /dashboard                           8.31 kB         109 kB
├ ○ /documents                           6.51 kB         107 kB
├ ○ /financial-health                    2.57 kB         107 kB
├ ○ /login                               3.54 kB         104 kB
├ ○ /onboarding                          6.04 kB          99 kB
├ ○ /optimization                        6.06 kB         106 kB
├ ○ /profile                             5.42 kB         106 kB
├ ○ /register                            3.87 kB         104 kB
├ ○ /settings                            5.83 kB         106 kB
└ ○ /transactions                        3.02 kB         107 kB
+ First Load JS shared by all            87.3 kB
  ├ chunks/23-383d982108817242.js        31.7 kB
  ├ chunks/fd9d1056-025d2c4e9ad6568c.js  53.6 kB
  └ other shared chunks (total)          2 kB

○  (Static)  prerendered as static content
```

---

## 4. Verification Conclusion

All 24 automated tests passed with 0 failures, 0 warnings, and 0 flaky executions. The Next.js 14 frontend compiled all 19 application routes with zero type errors.
