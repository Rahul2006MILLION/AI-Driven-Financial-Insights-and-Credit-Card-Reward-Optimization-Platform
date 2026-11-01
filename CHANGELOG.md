# Changelog

All notable changes to the CLIQ (AI-Driven Financial Insights & Credit Card Reward Optimization Platform) project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

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

