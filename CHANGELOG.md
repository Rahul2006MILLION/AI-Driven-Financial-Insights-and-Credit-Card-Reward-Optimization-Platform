# Changelog

All notable changes to the CLIQ (AI-Driven Financial Insights & Credit Card Reward Optimization Platform) project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

