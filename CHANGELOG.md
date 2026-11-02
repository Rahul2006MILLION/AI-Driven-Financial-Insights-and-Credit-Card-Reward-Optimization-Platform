# Changelog

All notable changes to the CLIQ (AI-Driven Financial Insights & Credit Card Reward Optimization Platform) project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.4.0] - 2026-11-02

### Added
- **No-Credit-Card Mode & Universal Financial Inclusion (Phase 3)**:
  - Dual-pathway onboarding architecture distinguishing Credit Card users from No-Credit-Card users via `financial_pathway` (`CREDIT_CARD` vs `NO_CREDIT_CARD`).
  - Income Management subsystem (`/api/v1/incomes`) supporting regular and irregular incomes, multi-cycle normalizations (`MONTHLY`, `BI_WEEKLY`, `WEEKLY`, `IRREGULAR`, `ONE_TIME`), and IDOR-isolated tenant controls.
  - Cash-Flow Resilience Analytics (`/api/v1/incomes/summary`) computing 90-day rolling monthly median income across calendar-month buckets.
  - CLIQ Budget Command Center (`/budget`): Real-time cash flow monitoring, 50/30/20 envelope budgeting, and non-card expense tracking.
  - CLIQ Learn Educational Suite (`/learn`): 9 financial literacy modules, interactive knowledge checks, and 5 deterministic calculators (Minimum Due Trap, APR Compounding, Utilization, 50/30/20, Break-Even).
- **Database & Migration Standardization**:
  - Versioned Alembic migration `c1f3a2b4e5d6_add_no_card_mode_incomes_and_pathway.py` introducing PostgreSQL `financialpathway` enum, `profiles.financial_pathway`, and `incomes` table with indexed `received_date`.
- **Phase 3.2 Financial Logic Remediation**:
  - **DEF-01:** Non-card transactions (`CASH`, `UPI`, `BANK_TRANSFER`, `DEBIT_CARD`, `OTHER`) strictly reject `card_id` with 400 Bad Request, set `reward_earned_monetary = 0.00`, and isolate card reward metrics.
  - **DEF-02:** Primary dashboard pathway detection reads authenticated user's `financial_pathway` rather than inferring from `cards.length === 0`.
  - **DEF-03:** 90-day rolling monthly median groups actual receipts by calendar month `(year, month)` before computing the median, preventing zero-month distortion.
  - **DEF-04:** Historical one-time incomes older than 90 days and future-dated entries are excluded from ongoing monthly cash flow.
  - **DEF-05:** Replaced synthetic 75/100 financial health scores on empty profiles with explicit `health_score = 0` and `data_sufficiency = "INSUFFICIENT_DATA"` with actionable onboarding tips.
  - **DEF-06:** Non-card payment methods supported in CSV statement previews and commits.
  - **DEF-07:** Alembic migration validated against running PostgreSQL database (`alembic check` clean).
  - **DEF-08:** Complete `incomes` localization namespace in `frontend/lib/translations.ts` across English, Hindi, and Kannada, plus loading skeleton in `/budget`.
  - **DEF-09:** PostgreSQL foreign key constraint gap resolved in security test suite (`test_ai_data_egress_audit.py`).

### Testing & Verification
- **Backend Tests:** 15 passed across `test_no_card_mode.py` and `test_financial_inclusion.py`; 8/8 passed in security test suite `test_ai_data_egress_audit.py`.
- **Frontend Tests:** 42 passed across 7 test suites (`npm test`).
- **Production Build:** Next.js compiled all 23 static routes with zero errors.

---

## [0.3.0] - 2026-11-01

### Added
- **Transaction Intelligence Phase 1 — CSV Statement Ingestion Pipeline**:
  - Multi-bank statement CSV upload and preview endpoint (`POST /api/v1/transactions/import/preview`) supporting preamble header scanning, multi-delimiter sniffing (`,`, `;`, `\t`), and encoding tolerance (UTF-8, UTF-8-BOM, Latin-1).
  - Atomic statement commit endpoint (`POST /api/v1/transactions/import/commit`) with batch tracking (`import_batch_id`), row-level deduplication, and transactional rollback protection.
- **Verified Indian Bank Statement Formats**:
  - **HDFC Bank**: Supports `Date,Transaction Description,Amount,Cr/Dr` and `Date,Transaction Details,Ref No,Amount,Dr / Cr` layouts; debits tracked as expenses, bill payments and autopay excluded.
  - **ICICI Bank**: Supports `Date,Transaction Details,Ref No,Amount(INR),Cr/Dr` and multi-column `Debit`/`Credit` statements with `DD-MMM-YYYY` and `DD/MM/YYYY` date parsing.
  - **SBI Card**: Supports `Date,Transaction Details,Ref Number,Amount,Debit/Credit` layouts with `D`/`C` indicators and uppercase month abbreviations.
  - **Axis Bank**: Supports `Tran Date,Transaction Details,Reference Number,Amount,Debit/Credit` formats with `DR`/`CR` flags.
  - **American Express (Amex)**: Supports `Date,Description,Amount,Reference Number` with positive debits, negative payment exclusions, and ISO/international dates.
  - **Generic / CLIQ Standard CSV**: Custom CSV layout supporting `Date,Merchant,Amount,Category,Reference Number` with optional category overrides.
- **Multi-Tier Duplicate Prevention**:
  - Primary check using external bank transaction reference numbers (RRN / Ref ID) to prevent double imports.
  - Ambiguous duplicate detection: When statements lack stable bank IDs, records sharing identical merchant, amount, and date are marked as `AMBIGUOUS_DUPLICATE` with contextual warnings, allowing users to verify repeat purchases instead of silently dropping valid transactions.
  - Secondary fallback using deterministic SHA-256 fingerprinting `hash(user_id:date:amount:merchant:card)`.
- **Merchant Normalization & Indian Commerce Registry Expansion**:
  - Integrated `MerchantNormalizer` into the ingestion and manual transaction creation pipelines.
  - Added fuel stations (`HPCL`, `BPCL`, `IOCL`, `Shell`), retail giants (`DMart`, `Starbucks`, `McDonald's`, `KFC`, `Tata Neu`), and utilities (`Airtel`, `Jio`, `Netflix`, `Spotify`) to the canonical alias registry.
  - Strips Indian city location noise tokens (`bangalore`, `mumbai`, `delhi`, `gurgaon`, etc.) from statement lines while preserving the unedited raw text in `raw_description` for auditability.
- **Automatic Categorization & Uncertainty Review**:
  - Deterministically maps normalized merchants to CLIQ's standard spending categories (`dining`, `shopping`, `fuel`, `grocery`, `travel`, `utility`, `entertainment`, `health`).
  - Low-confidence or unclassified merchants default to `"other"`, flagged with `requires_category_review = True`, prompting user review in the preview table.
- **Reward Optimization Engine Integration**:
  - Deterministically evaluates card rules and cashbacks via `RewardOptimizationEngine.evaluate_card_for_transaction` and calculates portfolio-wide optimal yield.
  - Associates transactions with verified user credit cards or flags them as unassigned without fabricating card links or bank-credited points.
- **Frontend Liquid Glass Import Experience**:
  - "Import Statement (CSV)" workflow on the Transactions page: File selection, dropzone (5MB limit), reconciliation preview table with status badges (`NEW`, `VERIFY PURCHASE`, `DUPLICATE FOUND`, `PAYMENT EXCLUDED`, `INVALID`), and import summary screen.
  - Full application-wide localization across English (`en`), Hindi (`hi`), and Kannada (`kn`) with 25+ new translation keys.
- **Database Schema Upgrades & Programmatic Migration**:
  - Added `raw_description`, `reference_number`, `deduplication_hash`, `import_batch_id`, and `category_confidence` to `Transaction` entity.
  - Programmatic SQLite migration in `init_db()` dynamically applies missing columns via `PRAGMA table_info(transactions)` without dropping data.

### Testing & Verification
- **Backend Test Suite (113 passing)**:
  - 8 new unit tests in `tests/unit/test_csv_statement_parser.py` verifying all 5 bank formats, corrupt rows, payment exclusion, and duplicate classification.
  - 5 new integration tests in `tests/integration/test_transaction_import_flow.py` validating preview, commit, duplicate re-import idempotency, ambiguous candidate decisioning, and tenant isolation.
- **Frontend Test Suite (22 passing)**:
  - Added `__tests__/transaction_import.test.ts` testing dictionary completeness across EN/HI/KN, status classification mapping, and commit payload formatting.
- **Production Build**:
  - Next.js 14 production build (`npm run build`) passing with all 21 static routes prerendered.

### Known Limitations
- PDF statement parsing (requiring password handling, OCR, and table extraction) is deferred to a subsequent milestone.
- Custom drag-and-drop column mapping UI for irregular CSV layouts will be implemented in Phase 2.

---

## [0.2.0] - 2026-11-01

### Added
- **Application-Wide Multilingual Localization**:
  - Comprehensive, natural language translation across English (`en`), Hindi (`hi`), and Kannada (`kn`).
  - Zero-fallback coverage across all 18 pages and 7 shared UI components.
  - Central typed dictionary architecture (`frontend/lib/translations.ts`) spanning 20 namespaces with 350+ UI labels, descriptions, and error states.
  - Reactive `LanguageProvider` with persistent hydration from `localStorage` (`cliq_preferred_language`).
- **Dynamic Content & Form Localization**:
  - Localized 3-step credit card onboarding wizard (`CardSelectionFlow.tsx`), variant selectors, and customization inputs.
  - Localized Purchase Intelligence workbench (`/optimization`) with payment channel selectors (Online / In-Store), recommendation hero cards, and step-by-step calculation tables.
  - Localized Financial Health auditor (`/financial-health`), recurring subscription trackers, and annual fee justification audit tables.
  - Localized Spending Analytics (`/analytics`), KPI metrics, monthly velocity charts, and spend allocation widgets.
  - Localized transaction history tables (`/transactions`), status badges, and record spend modal.
  - Localized admin offer review desk (`/admin/offers`), circular dropzones, and source registry health monitors.
- **AI Assistant & Privacy Gateway Language Support**:
  - Multilingual AI assistant greeting and contextual suggestion chips tailored per language (Devanagari for Hindi, Kannada script for Kannada).
  - Grounded local fallback engine delivering verified portfolio answers in the user's selected language when external AI is disabled.
  - Prompt sanitizer in `PrivacyGateway` enforcing strict script and language boundaries while keeping PII/PCI redactors active.
- **Backend Handshake**:
  - Added optional `language` parameter (`en`, `hi`, `kn`) to `RecommendRequest` schema (`backend/app/schemas/optimization.py`), seamlessly defaulting to the user's stored profile preference.
  - Recommendation engine formats localized explanation summaries directly in the target language.

### Changed
- Preserved proper nouns, financial brands, card variant names (*HDFC Bank, ICICI Bank, SBI Card, Regalia Gold, Millennia, Infinia*), merchant names (*Swiggy, Amazon, Zomato, Blinkit*), and monetary symbols (`₹`, `%`) across all languages without phonetic corruption.
- Decoupled type declarations and dictionaries into `translations.ts` for native TypeScript testing compatibility.

### Fixed
- Fixed language switching bug where changing the language only translated the dashboard navigation while the rest of the application remained in English.
- Resolved SWC build compilation issues in `financial-health`, `offers`, and `optimization` pages.
- Enforced `language: Optional[str] = None` default in backend `RecommendRequest` to prevent overriding saved user language profile preferences.

### Testing
- **Frontend Test Suite (19 passing)**:
  - Added `localization.test.ts` verifying 100% dictionary completeness, zero missing keys across English, Hindi, and Kannada, proper noun preservation, script integrity, and storage persistence.
  - Passing authentication lifecycle and card stack animation test suites.
- **Production Build**:
  - Clean Next.js 14 production build (`npm run build`) with 21/21 static routes prerendered.
- **Backend Test Suite (100 passing)**:
  - All 100 backend pytest integration and unit tests passing.

## [0.1.0] - 2026-11-01

### Added
- **Authentication Lifecycle & Session Management**:
  - Auto-login session token establishment upon user registration (`/api/v1/auth/register`).
  - Immediate global auth state synchronization upon user login (`/api/v1/auth/login`).
  - React `AuthProvider` with token persistence in `localStorage` and hydration across page refreshes.
  - Dynamic `Navbar` profile menu replacing login/register buttons with authenticated user identity and one-click logout.
  - IDOR ownership validation on protected card and transaction endpoints.
  - Graceful 401 handling for expired or invalid JWT tokens with automatic session cleanup and login redirection.
- **Purchase Intelligence & Reward Optimization Engine**:
  - Deterministic Python `Decimal` calculation engine (`RewardOptimizationEngine`) with exact financial arithmetic.
  - Strict eligibility filtering: network matching (Visa, Mastercard, RuPay, Amex), channel matching (Online, POS, Tap & Pay), and monthly reward cap tracking.
  - Merchant Normalizer engine mapping commercial aliases (e.g., "Swiggy", "Blinkit", "Uber") to canonical categories.
  - Optimization audit logging recording recommendations and savings.
- **Interactive Credit Card Stack Presentation**:
  - Overlapping diagonal card stack animation (`CardFanCollection.tsx`) with dynamic hover elevation, selection magnification, and keyboard navigation.
  - Responsive container boundaries preventing horizontal and vertical viewport clipping.
- **Privacy Gateway & AI Data Protection**:
  - Zero-Trust Privacy Gateway firewall (`PrivacyGateway`) intercepting external AI interactions.
  - Deterministic `SensitiveDataRedactor` scrubbing PANs (Luhn validated), CVVs, OTPs, PINs, Aadhaar, PAN (tax ID), and bank accounts.
  - User consent control (`UserAiConsent`) enforcing Privacy by Default (`external_ai_enabled = False`).
  - Context minimization builder passing only pre-aggregated, non-identifiable summaries.
  - XML delimiter isolation protecting against prompt injection attacks.
  - Metadata-only audit logging (`AiRequestAuditLog`) omitting raw prompts and generated responses.
  - Local grounded fallback using Python rule engine when external AI is disabled or unreachable.
- **Core Architecture & Design System**:
  - FastAPI modular backend with Pydantic v2 schemas and SQLAlchemy ORM models.
  - Next.js 14 frontend utilizing Tailwind CSS and the Liquid Glass aesthetic (emerald ambient lighting, dark backgrounds, glassmorphism).

### Changed
- Migrated default AI model configuration from deprecated `gemini-1.5-flash` to production-supported `gemini-2.5-flash`.
- Upgraded transaction and optimization schemas to enforce strict decimal validation.
- Refactored `CardFanCollection` from a horizontal spreading fan to a contained diagonal card stack.

### Fixed
- Fixed authentication session drop on page reload by establishing synchronized state hydration.
- Fixed missing logout state clearing in frontend client.
- Fixed container overflow where cards spread outside the screen on multi-card wallets.
- Fixed potential divide-by-zero and float precision errors in reward rate computations.

### Security
- Enforced strict IDOR checks on all `/api/v1/cards` and `/api/v1/transactions` routes, preventing cross-user data access.
- Redacted all sensitive PII and PCI cardholder data before any language model prompt assembly.
- Enforced privacy-by-default on all new user registrations (external AI disabled until explicit consent).
- Configured `.gitignore` to prevent tracking of `.env`, SQLite databases, certificates, and private credentials.

### Testing
- **Backend Tests (100 passing)**:
  - `test_authentication_lifecycle.py`: 8 comprehensive tests covering registration, login, token refresh, logout, IDOR protection, and invalid token rejection.
  - `test_purchase_intelligence.py` & `test_purchase_intelligence_flow.py`: Unit and integration suites for merchant normalization, cap limits, and optimization accuracy.
  - Existing privacy gateway, offer discovery, and security test suites.
- **Frontend Tests (13 passing)**:
  - `auth_lifecycle.test.ts`: 6 Jest/React Testing Library tests verifying login state updates, session restoration, logout cleanup, and 401 handling.
  - `card_stack_animation.test.ts`: 7 Jest tests verifying layout constraints, stacking indices, hover animations, and keyboard accessibility.

