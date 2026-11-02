# CLIQ Feature Completeness & Product Gap Audit

**Date:** 2026-11-02
**Auditor:** Claude Code (Sonnet 4.6)
**Scope:** All 20 product feature areas — frontend pages, backend APIs, service logic, database models, tests, mobile experience, security, edge cases, and UX gaps.
**Method:** Full source inspection across `backend/app/`, `frontend/app/`, `frontend/components/`, `frontend/lib/`, test suites, and existing documentation.

---

## Classification Legend

| Status | Meaning |
|:---|:---|
| **FULLY IMPLEMENTED** | Production-ready, end-to-end, tested, no significant gaps |
| **IMPLEMENTED BUT INCOMPLETE** | Core flow works; secondary features, edge cases, or polish missing |
| **PARTIALLY IMPLEMENTED** | Core partially works; significant functionality missing |
| **UI ONLY** | Frontend exists; backend doesn't support it or calls are stubs |
| **BACKEND ONLY** | Logic and API exist; no frontend screen |
| **PLANNED BUT NOT IMPLEMENTED** | Documented in roadmap; no code beyond educational content |
| **BROKEN OR UNVERIFIED** | Code exists but known failures or unverifiable behavior |

---

## Executive Summary

| # | Feature | Status | Priority |
|:--|:---|:---|:---|
| 1 | Authentication & User Management | IMPLEMENTED BUT INCOMPLETE | High |
| 2 | Credit Card Management | FULLY IMPLEMENTED | — |
| 3 | Transaction Management & Import | IMPLEMENTED BUT INCOMPLETE | Medium |
| 4 | Financial Health Scoring | IMPLEMENTED BUT INCOMPLETE | High |
| 5 | Reward Optimization | FULLY IMPLEMENTED | — |
| 6 | AI Financial Assistant | IMPLEMENTED BUT INCOMPLETE | Medium |
| 7 | Budget Management | IMPLEMENTED BUT INCOMPLETE | High |
| 8 | Financial Education (CLIQ Learn) | FULLY IMPLEMENTED | — |
| 9 | Offer Discovery & Management | IMPLEMENTED BUT INCOMPLETE | Medium |
| 10 | Document Intelligence | IMPLEMENTED BUT INCOMPLETE | Low |
| 11 | Income Tracking | FULLY IMPLEMENTED | — |
| 12 | Analytics & Reporting | IMPLEMENTED BUT INCOMPLETE | Medium |
| 13 | Privacy & Data Governance | IMPLEMENTED BUT INCOMPLETE | High |
| 14 | Financial Scam Shield | PLANNED BUT NOT IMPLEMENTED | Phase 4 |
| 15 | Emergency Financial Resilience | PLANNED BUT NOT IMPLEMENTED | Phase 5 |
| 16 | Financial Benefits Navigator | PLANNED BUT NOT IMPLEMENTED | Phase 6 |
| 17 | Credit & Financial Literacy | PARTIALLY IMPLEMENTED | Medium |
| 18 | Onboarding Flow | IMPLEMENTED BUT INCOMPLETE | High |
| 19 | Settings & Profile | IMPLEMENTED BUT INCOMPLETE | High |
| 20 | Mobile & Responsive Experience | PARTIALLY IMPLEMENTED | Future Phase (deferred) |

**Fully Implemented:** 4 of 20 (Credit Cards, Reward Optimization, CLIQ Learn, Income Tracking)
**Implemented but Incomplete:** 10 of 20
**Partially Implemented:** 2 of 20
**Planned But Not Implemented:** 3 of 20
**Not Started:** 1 of 20

---

## Feature-by-Feature Audit

---

### 1. Authentication & User Management

**Status: IMPLEMENTED BUT INCOMPLETE**

**Implemented:**
- `POST /auth/register` — full registration with bcrypt password hashing, JWT issuance, UserPreference creation
- `POST /auth/login` — credential verification, JWT (7-day expiry), audit log entry
- `GET /auth/me` — current user with full profile including financial_pathway
- `PUT /auth/profile` — name, language, currency, financial_pathway update
- `PUT /auth/path` — financial path tag (NEW_TO_FINANCE, REBUILDING, etc.)
- JWT stored in `localStorage` under `cliq_session`, auto-attached by `apiFetch()`
- Login and Register pages: fully functional with validation
- Navbar profile dropdown with logout

**Missing / Incomplete:**
1. **No password reset flow.** No `POST /auth/forgot-password` or `POST /auth/reset-password` endpoint exists. Users who forget their password cannot recover their account without admin intervention.
2. **No email verification.** Registration sets `is_active=True` immediately. Email OTP/verification is not implemented.
3. **Delete account is client-side only.** `settings/page.tsx:36` calls `clearSession()` and redirects to `/register` — no `DELETE /auth/account` API call. Server data is never deleted.
4. **No refresh tokens.** ADR-004 defers this. Tokens expire after 7 days with no renewal mechanism. Users get silently logged out.
5. **No rate limiting on auth endpoints specifically.** General rate limiter (600 req/min) applies but no per-IP brute-force protection on `/auth/login`.

**Test Coverage:** `__tests__/auth_lifecycle.test.ts` covers register → login → me → logout flow. No tests for edge cases (duplicate email, expired token, invalid password format).

---

### 2. Credit Card Management

**Status: FULLY IMPLEMENTED**

**Implemented:**
- Full CRUD: `GET /cards`, `POST /cards`, `PUT /cards/{id}`, `DELETE /cards/{id}` (soft deactivation)
- `CardFanCollection`, `CardDetailsPanel`, `CardSelectionFlow` components — rich card UI
- Fan view and grid view toggle
- Card search/filter by bank, network
- Edit card inline (name, fee, waiver spend, last4, term URL)
- `DigitalCreditCard` visual component with shimmer and network branding
- `cards/new` page with full reward rule configuration
- `cards/compare` page using `/optimization/compare` endpoint
- `cardCatalogue.ts` static catalog of Indian bank issuers (bank logos, networks)
- Tenant isolation: all queries filtered by `user_id`

**Minor Gaps:**
- No bulk card import / CSV upload for multiple cards simultaneously
- No integration with bank account for automatic card sync
- Delete is soft-deactivation (preserves transaction history) — this is intentional and correct

---

### 3. Transaction Management & Import

**Status: IMPLEMENTED BUT INCOMPLETE**

**Implemented:**
- `GET /transactions` — paginated list (default limit 50, frontend requests 100)
- `POST /transactions` — manual entry with reward calculation on creation
- `DELETE /transactions/{id}` — with tenant isolation check
- CSV import: `POST /transactions/import/preview` (parse + dedup preview) + `POST /transactions/import/commit`
- Statement parser supports AUTO, HDFC, ICICI, SBI, Axis, Kotak, Paytm format detection
- DeduplicationEngine with SHA-256 hashing on (date, amount, merchant, reference)
- Reward feedback: `PUT /transactions/{id}/feedback` with metadata stored in notes field via `<!--FEEDBACK:...-->` HTML comment pattern
- Payment method tracking (CREDIT_CARD, UPI, CASH, DEBIT_CARD, BANK_TRANSFER, OTHER)
- Recurring flag + `is_recurring` detection
- Frontend shows import workflow (SELECT → PREVIEW → SUMMARY stages)

**Missing / Incomplete:**
1. **No edit transaction.** Once created, a transaction cannot be updated (only deleted). No `PUT /transactions/{id}` endpoint.
2. **No search or filter on transactions list.** The frontend shows all 100 transactions in a flat list with no date range filter, category filter, or merchant search.
3. **Category IDs not resolved to names.** `category_id.replace("_", " ").title()` is used in `analytics.py:67` instead of looking up the `SpendingCategory` table. Display names depend on the ID string format.
4. **Transaction list limit hardcoded at 100.** Frontend fetches `?limit=100` — no pagination UI. Users with >100 transactions see only the most recent 100.
5. **`alert()` for error feedback.** Multiple `alert()` calls in `transactions/page.tsx` (lines 84, 105, 117, 212) — these are browser alerts instead of inline error states.
6. **Reward feedback pattern is fragile.** Storing feedback metadata in an HTML comment inside the `notes` text field is a workaround — it could be corrupted by user edits.

**Test Coverage:** `__tests__/transaction_import.test.ts` covers CSV import flow. No tests for manual CRUD edge cases.

---

### 4. Financial Health Scoring

**Status: IMPLEMENTED BUT INCOMPLETE**

**Implemented:**
- Dual-algorithm health engine (`health_engine.py`):
  - **Algorithm A (No-Card):** 3 pillars — Savings & Cash-Flow (max 45), Budget Adherence (max 35), Subscription Hygiene (max 20)
  - **Algorithm B (Credit Card):** Efficiency (max 50) + Leakage ratio (max 30) + Portfolio active (fixed 20), floor 25
- Data sufficiency handling: INSUFFICIENT_DATA / PROVISIONAL / COMPLETE states with score=0 for empty profiles
- Subscription detection via keyword matching + frequency analysis
- Annual fee justification audit per card
- 30-day vs 60-day spend trend comparison
- `educational_alerts` and `actionable_recommendations` arrays
- Budget status summary with utilization %
- Income integration from `Income` table with frequency normalization
- All Decimal math — no floats in calculations
- Frontend renders all response fields correctly

**Missing / Incomplete:**
1. **Static score display.** Health score is shown in a plain circle div with no arc, gauge, or animation — no visual encoding of whether 72/100 is good or bad relative to a scale.
2. **No health score history.** The endpoint returns only the current point-in-time snapshot. There is no time series of how health has changed week over week.
3. **Subscription frequency is always "Monthly".** `recurring_list` hardcodes `frequency="Monthly"` for all detected subscriptions regardless of actual billing cadence (line 76, `health_engine.py`).
4. **Forecast rewards in No-Card mode always returns 0.** In No-Card mode `forecast_rewards = Decimal("0.00")` is correct but the frontend unconditionally renders the "Projected Rewards" tile with ₹0.00 — visually confusing for cash-flow users.
5. **Hardcoded English string in UI.** `financial-health/page.tsx:129` contains `"Modeled on historical spending patterns and optimal category allocation."` — not in translations.ts.
6. **Wrong translation key.** `health/page.tsx:243` uses `t.optimizer.breakdown` for the fee audit table column "Status" — semantic mismatch.

**Test Coverage:** `backend/tests/unit/test_no_card_mode.py` covers No-Card algorithm. No tests for Credit Card Algorithm B edge cases (leakage floor, all-zero transactions).

---

### 5. Reward Optimization

**Status: FULLY IMPLEMENTED**

**Implemented:**
- `POST /optimization/recommend` — deterministic Decimal optimization across user's card portfolio with offer integration, monthly cap tracking, language-aware explanation
- `POST /optimization/simulate` — what-if scenarios across configurable amount brackets (up to 25 data points)
- `POST /optimization/compare` — head-to-head card comparison with simulated spend
- `RewardOptimizationEngine` — full rule evaluation pipeline (base rate → category multiplier → merchant-specific rules → monthly caps → promo offers)
- `MerchantNormalizer` — canonical merchant name mapping
- `OfferService.get_applicable_offers_for_card` — offer eligibility check integrated into recommend
- `RewardAnalysis` audit record persisted on every recommendation
- Frontend `optimization/page.tsx` — full form with result display, offer integration, breakdown steps
- `cards/compare/page.tsx` — multi-card selection and comparison matrix
- Multi-language explanations in recommendation breakdown steps

**Minor Gaps:**
- The `simulate` endpoint has no dedicated frontend page. The simulation capability is powerful but only accessible via the API (no UI to run scenario simulations).
- Reward calculation uses `reward_basis_mode="NET_CHARGED_AMOUNT"` default — no frontend toggle to switch to GROSS mode.

---

### 6. AI Financial Assistant

**Status: IMPLEMENTED BUT INCOMPLETE**

**Implemented:**
- Gemini 2.5 Flash via direct HTTPX REST (no Google SDK), routed through Privacy Gateway
- Privacy Gateway: 9-rule PII redaction, task-type allowlist, consent enforcement, immutable audit log
- 4 task types: `GENERAL_QUERY`, `FINANCIAL_EDUCATION`, `SPENDING_ANALYSIS_SUMMARY`, `CARD_RECOMMENDATION_EXPLANATION`
- Grounded fallback engine (local, no external API) when db session unavailable
- Language switching (en/hi/kn) — language sent with each query
- Consent management via `UserAiConsent` table, toggle in assistant UI
- Privacy status displayed per message (LOCAL_PROCESSING_PROTECTED, EXTERNAL_AI_USED, etc.)
- `redacted_items_count` per response
- `grounded_card_ids` and `citations` in response schema

**Missing / Incomplete:**
1. **No conversation history persistence.** Messages live in `useState` — refreshing the page clears the entire chat history. No storage of prior conversations in DB.
2. **Confidence hardcoded to 0.95.** `assistant.py:65` sets `confidence=0.95` unconditionally — not meaningful.
3. **Citations not rendered.** The `citations` array in the response schema is populated (card names) but the assistant frontend does not render them as clickable references or footnotes.
4. **Language switching does not re-translate history.** Changing language updates the welcome message (if it's the only message) but existing chat messages remain in the original language.
5. **No suggested prompts UI.** The chat interface shows a blank input with no examples of what to ask, creating a cold start problem for new users.
6. **No streaming.** Responses arrive as complete JSON — no streaming display for longer Gemini responses.

---

### 7. Budget Management

**Status: IMPLEMENTED BUT INCOMPLETE**

**Implemented:**
- Income tracking with 5 frequency types (MONTHLY, BI_WEEKLY, WEEKLY, IRREGULAR, ONE_TIME)
- Budget: `PUT /education/budget` — total_budget + category_budgets stored as JSON in `UserBudget.category_budgets_json`
- Budget retrieval: `GET /education/budget`
- Quick expense recording from Budget page (posts to `/transactions`)
- 4 metric cards: monthly inflow, outflow, net cash flow, savings rate
- Budget utilization progress bar with threshold color changes (green/amber/rose)
- Payment method breakdown widget
- Per-income-stream delete
- Rolling 90-day median income from income summary API

**Missing / Incomplete:**
1. **Category budget splits are hardcoded.** `budget/page.tsx:163–167` saves `grocery: 35%, dining: 15%, utility: 20%, shopping: 15%, other: 15%` fixed percentages — user cannot customize per-category allocation. There is no category-by-category budget UI despite the data model (`category_budgets_json`) supporting it.
2. **Native `<input type="number">` instead of `NumericInput`.** The "New limit" budget edit input at `budget/page.tsx:349` uses a raw `<input type="number">` which doesn't apply the leading-zero prevention fix from `NumericInput`. Inconsistency with the rest of the platform.
3. **No monthly history view.** Budget page shows only the current 30-day snapshot. Users cannot see whether they were over/under budget in previous months.
4. **Savings rate is calculated client-side** from inflow (income API) vs. outflow (spending API) independently fetched. Server-side equivalent in health_engine.py is the authoritative calculation — these can drift if APIs are called at slightly different times.
5. **No budget vs. actual breakdown per category.** The category_budgets exist but the Budget page only shows total spend vs. total budget — no category-by-category comparison of budgeted vs. actual.
6. **No income edit.** Income streams can only be created or deleted — no `PUT /incomes/{id}` endpoint to correct a source name or amount.

---

### 8. Financial Education (CLIQ Learn)

**Status: FULLY IMPLEMENTED**

**Implemented:**
- 5 curriculum categories (credit_fundamentals, interest_debt, personal_finance, credit_awareness, financial_safety)
- Full lesson content in en/hi/kn with `content_markdown`, `key_takeaways`, quiz questions with explanations
- 5 calculators: Credit Card Interest, Minimum Payment Trap, 50/30/20 Budget Planner, Credit Utilization, Card Annual Fee Break-Even
- `UserLearningProgress` tracking per lesson (completed, quiz score, timestamps)
- Progress dashboard with completion %, time-to-complete badges
- Category completion tracking
- Lesson search within the page
- Financial path tag (`UserPreference.financial_path`) updated via onboarding and education
- Optional auth — calculators work without login, progress tracking requires auth
- `__tests__/financial_inclusion.test.ts` covers curriculum service behavior

**Minor Gaps:**
- No certificate or achievement badge on completing all lessons in a category
- Quiz answers are not re-displayed on re-visit (only the score is stored, not which option the user chose)
- The page file is 79KB — consider splitting into subcomponents for maintainability

---

### 9. Offer Discovery & Management

**Status: IMPLEMENTED BUT INCOMPLETE**

**Implemented:**
- Public offer listing `GET /offers` with filters: `category`, `only_user_cards`, `expiring_soon`, `query`
- Offer categories: food_delivery, shopping, travel, grocery, entertainment
- Promo code copy-to-clipboard
- Expiry date display
- Admin Offer Review Desk: `app/admin/offers/page.tsx` — full approval/rejection workflow, source health monitoring, manual offer creation, source failure logs, document ingestion queue
- Backend admin routes: `POST /offers/admin/discover`, `PUT /offers/{id}/verify`, `DELETE /offers/{id}`, `POST /offers/admin/source-health` etc. — all protected by `require_admin`
- Frontend admin access gated by `isAdmin` check before render
- Offer integration into reward recommendation engine (offer boosts factored into reward calculation)

**Missing / Incomplete:**
1. **Offer categories hardcoded in frontend.** `offers/page.tsx:25–32` defines `CATEGORIES` array as hardcoded static values — not loaded from the API. Adding a new offer category requires a frontend code change.
2. **No visual expiry countdown.** Offers show `expiry_date` text but there is no color-coded "expiring in X days" indicator or urgency signal for time-sensitive offers.
3. **Admin desk accessible via Sidebar to all users.** The Sidebar renders the "Offer Review Desk" link for every authenticated user. While the page correctly checks `isAdmin` before showing content, the nav link itself is visible to non-admin users (it should be hidden).
4. **No offer personalization score.** Offers are listed but not ranked by relevance to the user's specific card portfolio or spending patterns beyond the `only_user_cards` filter.
5. **No offer click tracking.** When a user copies a promo code or clicks through, there is no analytics event recorded.

---

### 10. Document Intelligence

**Status: IMPLEMENTED BUT INCOMPLETE**

**Implemented:**
- `POST /documents/upload` — PDF ingestion via `DocumentIntelligenceService`
- `GET /documents` — list uploaded documents with extraction status
- `POST /documents/{id}/verify` — extracts card fields from uploaded doc and creates a `ExtractedCardData` record
- Frontend upload, document list, editing extracted fields before card creation
- Editable staged fields: card_name, bank_name, network, annual_fee, reward_rules
- Verification → card creation flow

**Missing / Incomplete:**
1. **No reward rule extraction from PDFs.** The `staged_rules` editing UI exists in `documents/page.tsx` but the initial extraction populates reward rules only from structured text — complex rate tables and conditional rules in PDFs are not reliably parsed.
2. **Verification step is manual-heavy.** Users must verify each extracted field individually. For users uploading multiple card documents, this is repetitive.
3. **No document re-processing.** Once a document is uploaded and verified, there is no way to re-run extraction without deleting and re-uploading.
4. **Limited file format support.** Only PDFs are mentioned — no support for image scans (JPG/PNG of card mailers).

---

### 11. Income Tracking

**Status: FULLY IMPLEMENTED**

**Implemented:**
- `GET /incomes` — list all income streams with full metadata
- `POST /incomes` — create with source_name, amount, frequency, is_irregular, notes, received_date, expected_date
- `DELETE /incomes/{id}` — with tenant isolation
- `GET /incomes/summary` — computed total_monthly_income (frequency-normalized), regular vs. irregular split, rolling 90-day median, income_sources_count
- Income used by health engine for savings rate calculation
- Income used by budget page for cash flow metrics
- Correct frequency normalization: MONTHLY as-is, BI_WEEKLY ×26/12, WEEKLY ×52/12, IRREGULAR/ONE_TIME ÷3
- Tenant isolation enforced

**Minor Gaps:**
- No `PUT /incomes/{id}` to edit an existing income entry (only create and delete)
- No income history/audit trail (editing would be useful for salary changes)

---

### 12. Analytics & Reporting

**Status: IMPLEMENTED BUT INCOMPLETE**

**Implemented:**
- `GET /analytics/spending` — total spending, category breakdown (with %), monthly trend, top 5 merchants, payment method breakdown
- `GET /analytics/rewards` — total rewards earned, optimal possible, leakage, efficiency rate, rewards by card
- `GET /analytics/financial-health` — delegates to FinancialHealthEngine
- `GET /analytics/categories` — spending category structure
- Frontend Analytics page: category pie chart (Recharts), monthly bar chart (Recharts), top merchants grid, 3 KPI tiles
- Budget page shows payment method breakdown widget

**Missing / Incomplete:**
1. **No date range filtering.** All analytics endpoints return all-time data. Users cannot see analytics for "last 3 months" or a custom date range.
2. **Rewards by card not displayed in UI.** The API returns `rewards_by_card` array but the Analytics page does not render it — only total reward KPIs are shown.
3. **Payment method breakdown not on Analytics page.** It's shown on the Budget page but absent from the dedicated Analytics page where it belongs logically.
4. **No data export.** No CSV/JSON export from Analytics page. The "Export Data" in Settings is a browser `alert()` stub.
5. **Chart labels not translated.** Recharts `Tooltip` formatter strings and `Bar name=` props contain hardcoded English: `"Spend"`, `"Rewards"`, `"Amount"`.
6. **No comparison period.** No "vs. previous period" indicator on KPI tiles.
7. **Top merchants section mislabeled.** The card header reads `{t.analytics.categoryAllocation}` (line 208) but the content shows top merchants — wrong translation key used.

---

### 13. Privacy & Data Governance

**Status: IMPLEMENTED BUT INCOMPLETE**

**Implemented:**
- Privacy Gateway (`privacy_gateway.py`): 9 PII regex rules, task-type allowlist, consent enforcement, immutable `AiRequestAuditLog`
- `GET /privacy/consent` — retrieve user's AI consent settings
- `PUT /privacy/consent` — update granular consent flags
- `GET /privacy/audit-logs` — full audit trail of AI requests with PII redaction proof
- `GET /privacy/data-minimization-rules` — explainability of what's protected
- AI request audit shown in Assistant page (consent toggle)
- Per-message privacy status badge (LOCAL_PROCESSING_PROTECTED vs. EXTERNAL_AI_USED)
- Security headers middleware: CSP, X-Content-Type-Options, X-Frame-Options, HSTS, X-XSS-Protection, Referrer-Policy
- Settings page shows static security status badges

**Missing / Incomplete:**
1. **"Export Data" is a browser `alert()` stub.** `settings/page.tsx:32`: `alert("Exporting verified portfolio records to encrypted JSON archive...")` — no actual data export endpoint exists.
2. **"Delete Account" does not delete server data.** `settings/page.tsx:36–40`: confirms, calls `clearSession()`, redirects to `/register` — no `DELETE /auth/account` API call. Violates right-to-erasure principle.
3. **Security status badges in Settings are hardcoded.** "ACTIVE", "COMPLIANT", "HS256 VERIFIED", "ENFORCED" labels are static strings in the frontend — not dynamically queried from any backend health endpoint. They show active even if the backend is misconfigured.
4. **No dedicated Privacy Center page.** Privacy consent management is embedded within the AI Assistant page. Users who don't use the AI assistant have no discoverability of their privacy settings. There is no standalone `/privacy` route.
5. **Audit log not surfaced to end users.** `GET /privacy/audit-logs` exists but is not exposed in the frontend (only admin can view via API).

---

### 14. Financial Scam Shield

**Status: PLANNED BUT NOT IMPLEMENTED**

**What exists:**
- Educational curriculum category `financial_safety` in CLIQ Learn covers UPI PIN scams, phishing, fake customer care, RBI zero-liability rules (en/hi/kn content)
- Health engine `actionable_recommendations` can mention fraud awareness in text

**What is missing (as a standalone feature):**
- No scam detection engine or rule set
- No real-time transaction flagging for suspicious patterns
- No dedicated `/scam-shield` API or frontend screen
- No merchant blacklist or fraud probability scoring
- No integration with RBI/NPCI fraud databases

**Note:** This is correctly listed as Phase 4 in `docs/IMPLEMENTATION_STATUS.md`. The educational content in CLIQ Learn is a meaningful first step but is not the Phase 4 feature.

---

### 15. Emergency Financial Resilience

**Status: PLANNED BUT NOT IMPLEMENTED**

**What exists:**
- Health engine generates one text recommendation: `"Emergency Reserve Goal: Build a 3-month liquid buffer of approx. ₹X in a high-yield savings account."` when income data is present (No-Card mode only)

**What is missing:**
- No emergency fund goal-setting or tracking feature
- No dedicated emergency fund account concept
- No frontend screen or UI for emergency planning
- No integration with income/savings data for runway calculation
- Not in the current phase roadmap (Phase 5 or beyond)

---

### 16. Financial Benefits Navigator

**Status: PLANNED BUT NOT IMPLEMENTED**

**What exists:**
- Nothing found in any source file. The feature name does not appear in frontend, backend, schemas, or services.

**What this likely means:**
- This is a concept feature, possibly intended as a guided recommendation engine for financial products (loans, insurance, investments) beyond credit cards
- No design, no API, no database support
- Requires full specification before implementation

---

### 17. Credit & Financial Literacy

**Status: PARTIALLY IMPLEMENTED**

**What is implemented (via CLIQ Learn):**
- 5 curriculum categories covering credit fundamentals, interest/debt, personal finance, credit score awareness, financial safety
- Full lesson + quiz content in 3 languages
- 5 interactive calculators
- Progress tracking

**What is missing as a standalone "literacy" feature:**
1. **No CIBIL/credit score tracking.** The platform educates about credit scores but does not integrate with any credit bureau (CIBIL, Experian, Equifax). Users cannot see their actual credit score.
2. **No credit score simulator.** No "if I do X, my CIBIL score might improve by Y" predictive tool.
3. **No credit utilization live tracking.** The credit utilization calculator is manual input — it doesn't auto-calculate from the user's own card limits and balances.
4. **No financial literacy score.** There is no overall "literacy index" beyond lesson completion percentage.

---

### 18. Onboarding Flow

**Status: IMPLEMENTED BUT INCOMPLETE**

**Implemented:**
- 4-step onboarding: Step 1 (Language) → Step 2 (Pathway) → Step 3 (Income & Budget) → Step 4 (Completion)
- Language selection with live preview
- Financial pathway selection: CREDIT_CARD vs. NO_CREDIT_CARD
- Financial path tag: NEW_TO_FINANCE, REBUILDING, ESTABLISHED, REWARDS_OPTIMIZER
- Income amount + frequency entry during onboarding
- Budget limit entry during onboarding
- `DemoBootstrap` component for populating demo data
- Saves pathway to profile, income to `/incomes`, budget to `/education/budget`

**Missing / Incomplete:**
1. **Uses raw `fetch()` instead of `apiFetch()`.** `onboarding/page.tsx:40–56` and `71–100` use `fetch()` with manual `Authorization: Bearer` header construction instead of the standard `apiFetch()` helper. This is the only page in the app that bypasses `apiFetch()` — a maintenance risk.
2. **No card-add step for CREDIT_CARD pathway.** When a user selects `CREDIT_CARD` pathway during onboarding, they are not prompted to add their first card. They land on dashboard with an empty card portfolio and no guidance to `/cards/new`.
3. **No back navigation between steps.** The onboarding flow has no "Previous" button — stepping back requires starting over.
4. **No completion gate.** Users can navigate directly to `/dashboard` at any time without completing onboarding. There is no redirect logic that checks whether onboarding was finished.
5. **Step 3 income form uses `<input type="number">`** directly rather than `NumericInput` — inconsistent with the rest of the app.

---

### 19. Settings & Profile

**Status: IMPLEMENTED BUT INCOMPLETE**

**Profile (IMPLEMENTED):**
- `GET /profile` (via `GET /auth/me`) — full user profile
- `PUT /profile` (via `PUT /auth/profile`) — name, language, currency
- Language change persists to DB and updates UI immediately via `useLanguage()`
- Profile dropdown in Navbar reflects full_name or email prefix

**Settings (PARTIALLY IMPLEMENTED — UI ONLY for critical features):**

1. **Optimization preferences are UI-ONLY.** `settings/page.tsx:25–29` defines `prioritizeCashback` and `includeFeeNet` state. `handleSavePreferences` only calls `setSavedSettings(true)` — **no API call is made**. These preferences are lost on page reload. The `UserPreference` model and `education/path` endpoints exist but are not used here.

2. **"Export Data" is a browser alert stub.** Line 32: `alert("Exporting verified portfolio records to encrypted JSON archive...")`. No export API exists anywhere in the backend.

3. **"Delete Account" does not call the backend.** Line 36–40: `confirm() → clearSession() → router.push("/register")`. Server-side profile, transactions, cards, and income records are never deleted.

4. **Security status badges are hardcoded static text.** The cards in the security section display "ACTIVE", "COMPLIANT", "HS256 VERIFIED", "ENFORCED" regardless of actual backend state — not connected to any health check endpoint.

5. **Rate limit display is incorrect.** Settings page displays `"CSP, HSTS, 120 req/min"` (hardcoded string at line 107) — the actual config default is 600 req/min.

---

### 20. Mobile & Responsive Experience

**Status: PARTIALLY IMPLEMENTED — DEFERRED TO FUTURE PHASE**

> **Scope decision (2026-11-02):** Mobile development is postponed. The current development cycle focuses exclusively on the desktop web application. Existing mobile code and responsive classes are preserved and must not be removed. All mobile-specific work — bottom navigation, touch-first interactions, mobile dashboards, responsive analytics — is tracked in the **Future Phase — Mobile Experience** section of the roadmap below.

**What is responsive (desktop breakpoints work correctly):**
- Most pages use `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-N` — correct breakpoint pattern
- Table overflows use `overflow-x-auto` wrappers
- `p-5 sm:p-7 lg:p-9` padding scaling
- Cards use `w-full` responsive widths

**Critical Mobile Gaps:**

1. **Sidebar is desktop-only.** `Sidebar.tsx:49`: `hidden lg:flex` — the full 15-item navigation disappears on screens < 1024px. There is no bottom navigation bar or slide-in drawer to replace it on mobile.

2. **Mobile Navbar menu is incomplete.** The Navbar hamburger/profile menu (visible on `< md`) shows only Dashboard, Cards, Offers, Optimizer, Assistant, Learn, and Profile. The following screens are inaccessible without knowing the direct URL on mobile: **Budget, Analytics, Financial Health, Transactions, Documents, Settings, Cards Compare, Cards New, Cards Admin**.

3. **Charts not mobile-optimized.** Recharts on Analytics page use `ResponsiveContainer` which works but the charts have small tick labels (`fontSize={11}`) and no mobile-specific tooltip sizing. On small screens, charts are dense and hard to read.

4. **Admin Offer Desk is desktop-only.** The admin page (`app/admin/offers/page.tsx`) is a complex multi-panel layout with no mobile adaptation. Unusable on phone.

5. **Card fan collection may clip on mobile.** `CardFanCollection` uses absolute positioning for the fan — behavior on mobile screen widths (<375px) is not validated.

6. **No PWA or app shell.** No `manifest.json`, no service worker, no install prompt. CLIQ is not installable as a mobile web app.

7. **Touch targets may be too small.** Many action buttons use `text-xs` (12px) sizing and `py-1.5` padding — potentially below WCAG 2.5.5 minimum 44×44px touch target.

---

## Cross-Cutting Gaps

### UX Consistency Issues
- **`alert()` and `confirm()` used extensively** (10+ instances across transaction, card, settings pages) instead of inline error states or toast notifications
- **`<input type="number">` used in some forms** (budget/page.tsx budget limit input, onboarding income/budget inputs) while `NumericInput` was built specifically to prevent leading-zero bugs — these bypass the fix
- **English strings not in translations.ts** (at least 5 found): "Modeled on historical spending patterns...", "30-Day Spending Trend:", rate limit badge in Settings, some `placeholder` attributes

### Security Concerns
- **Admin Sidebar link visible to all users** — cosmetic issue (page correctly guards content) but violates least-privilege UI principle
- **Delete Account has no server-side effect** — data retention without user consent violates privacy principles
- **Settings page shows correct-sounding but unverified security claims** — could mislead users about actual security posture

### Technical Debt
- **Feedback metadata stored as HTML comments in `notes` field** — fragile pattern; should be a separate `TransactionFeedback` relation
- **Category budget stored as JSON in a text column** — works but makes querying or aggregating by category impossible at the SQL level
- **`any` type used in multiple page components** — explicit interfaces defined in some files (budget/page.tsx, learn/page.tsx) but `health: any`, `spending: any` etc. used elsewhere

---

## Prioritized Implementation Roadmap

### Phase 4A — Critical UX & Security Fixes (prerequisite before growth)

These are blocking issues that affect trust, security, or core workflows for existing users.

| Priority | Item | Effort | Impact |
|:---|:---|:---|:---|
| P0 | Implement `DELETE /auth/account` endpoint and wire up Settings delete button | Small | Critical (legal/privacy) |
| P0 | Replace Settings "Export Data" alert() with actual JSON export endpoint | Small | High (user data rights) |
| P1 | Persist Settings optimization preferences via UserPreference API | Small | High (core feature broken) |
| P1 | Replace all `alert()` / `confirm()` with inline error states or toast notifications | Medium | High (UX quality) |
| P1 | Implement password reset flow (`POST /auth/forgot-password` + `POST /auth/reset-password`) | Medium | High (critical auth gap) |
| P2 | Add card-add step to CREDIT_CARD onboarding pathway | Small | Medium (activation) |
| P2 | Replace raw `fetch()` in onboarding with `apiFetch()` | Small | Medium (code quality) |
| P2 | Use `NumericInput` component consistently in budget and onboarding forms | Small | Low (consistency) |
| P2 | Fix incorrect translation keys (top merchants label, fee audit column label) | XSmall | Low |
| P2 | Add missing English strings to translations.ts | XSmall | Low |
| P2 | Hide Admin Sidebar link from non-admin users | XSmall | Low |

### Phase 4B — Feature Completions (fill gaps in implemented features)

| Priority | Item | Effort | Impact |
|:---|:---|:---|:---|
| P1 | Add transaction edit (`PUT /transactions/{id}`) and edit UI | Medium | High |
| P1 | Add transaction list search + date range filter | Medium | High |
| P1 | Add health score history (time series) — API + chart on health page | Medium | High |
| P1 | Add per-category budget UI — allow users to customize split instead of fixed percentages | Medium | High |
| P1 | Add income stream edit (`PUT /incomes/{id}`) | Small | Medium |
| P2 | Add date range filter to analytics endpoints and frontend | Medium | Medium |
| P2 | Add rewards-by-card display to analytics page | Small | Medium |
| P2 | Move payment method breakdown to analytics page | Small | Low |
| P2 | Add "expiring in X days" countdown badge to offers | Small | Medium |
| P2 | Persist chat history across sessions (new `ConversationHistory` table) | Medium | Medium |
| P2 | Add suggested prompts to AI assistant cold start | Small | Medium |
| P2 | Add visual health score gauge (arc or radial progress) | Small | Medium |
| P2 | Add simulation frontend page (`/optimization/simulate`) | Medium | Medium |
| P3 | Transaction pagination (cursor-based, replace limit=100) | Medium | Medium |
| P3 | Move feedback metadata out of notes field into a proper FK relation | Medium | Low |
| P3 | Add chart export / analytics data download | Medium | Medium |

### Phase 5 — New Features

| Priority | Item | Effort | Impact |
|:---|:---|:---|:---|
| P1 | Emergency Financial Resilience — goal-based emergency fund planner | Large | High |
| P2 | Credit Score Awareness — CIBIL utilization live-tracking from card data | Medium | High |
| P2 | Email verification on registration | Medium | Medium |
| P2 | JWT refresh token mechanism (ADR-004) | Medium | Medium |

### Phase 6 — New Products

| Priority | Item | Effort | Impact |
|:---|:---|:---|:---|
| P1 | Financial Scam Shield — real-time transaction flagging, UPI fraud detection | X-Large | High |
| P2 | Financial Benefits Navigator — product recommendation engine | X-Large | Medium |
| P3 | Credit bureau integration (CIBIL score display) | Large | High |

### Future Phase — Mobile Experience (deferred, no schedule)

> Mobile development is explicitly out of scope for Phases 4–6. The items below are captured for future planning. No mobile-specific code changes should be made until this phase is authorized. Existing responsive CSS classes and the current Navbar mobile menu must be preserved as-is.

| Item | Notes |
|:---|:---|
| Mobile bottom navigation bar (replaces desktop Sidebar on < lg) | Full 15-screen coverage |
| Complete mobile nav — Budget, Analytics, Health, Transactions, Documents, Settings | Currently unreachable on mobile without direct URL |
| Touch-first interactions and gesture support | Swipe navigation, pull-to-refresh |
| Mobile-optimized financial analytics charts | Recharts viewport adaptation, larger touch targets |
| Mobile dashboard layout | Single-column, progressive disclosure |
| WCAG 2.5.5 touch target compliance (44×44px minimum) | All action buttons |
| Mobile-optimized Admin Offer Desk | Responsive multi-panel layout |
| PWA: manifest.json, service worker, install prompt | Installable web app |
| Card fan collection mobile validation | Clipping fix for < 375px viewports |
| Mobile accessibility audit and testing | Screen reader, voice control |

---

## Test Coverage Assessment

| Area | Coverage | Notes |
|:---|:---|:---|
| Reward engine | Good | `test_reward_engine.py` — comprehensive |
| No-card health algorithm | Good | `test_no_card_mode.py` |
| Financial inclusion | Good | `test_financial_inclusion.py` |
| CSV import | Good | `transaction_import.test.ts` |
| Auth lifecycle | Good | `auth_lifecycle.test.ts` |
| Privacy/AI egress | Good | `test_ai_data_egress_audit.py` |
| Analytics endpoints | None | No unit or API tests for analytics |
| Budget/income APIs | Partial | Covered via financial inclusion tests |
| Education calculators | None | No isolated calculator tests |
| Settings persistence | None | Settings preferences bug would not be caught |
| Mobile layout | None | No visual regression or viewport tests |
| Error states | None | `alert()` error paths are untested |

---

*Document generated by source inspection of CLIQ commit `3d00b11` (branch: main). All findings are grounded in actual source code — no speculative gaps included.*
