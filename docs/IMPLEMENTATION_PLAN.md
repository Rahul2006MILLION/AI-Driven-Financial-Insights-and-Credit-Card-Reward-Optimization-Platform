# CLIQ Implementation Plan & Tracking

**Product:** CLIQ — Money Made Simple. In Your Language.  
**Tagline:** Smarter decisions, Brighter futures. For everyone.  
**Status:** In Progress — Phase 1 complete, moving into Phase 2 & 3.

---

## Phases Overview

| Phase | Description | Status |
|---|---|---|
| **Phase 1: Inspection & Planning** | Workspace analysis, directory structure, docs setup, architecture blueprint | **DONE** |
| **Phase 2: Foundation & Core Setup** | Python backend with FastAPI, SQLite/PostgreSQL async ORM, Pydantic v2 schemas, Auth & Security middleware, Next.js 14+ frontend with Neon Mountain cinematic theme | **IN PROGRESS** |
| **Phase 3: Core Functionality & Deterministic Engine** | Credit Card management, Card rules & benefits, Transaction CRUD, Python Decimal Reward Optimization Engine, Comparison & Explanations | **PENDING** |
| **Phase 4: AI Intelligence & Multilingual Engine** | Document Intelligence (PDF parsing & structured rule extraction with human-in-the-loop review), Language Intelligence (English, Hindi, Kannada), AI Financial Assistant | **PENDING** |
| **Phase 5: Financial Health & Prediction Engine** | Spending analytics, monthly trends, recurring charges, fees detection, reward efficiency scoring, linear/heuristic future spend forecasting | **PENDING** |
| **Phase 6: Frontend Integration (15 Screens)** | Building and connecting all 15 screens to backend APIs with full responsiveness, interactive charts, toast notifications, and dark neon aesthetics | **PENDING** |
| **Phase 7: Testing & Security Audit** | Unit, integration, security (IDOR, auth bypass, rate limit, input sanitization), and deterministic calculation tests | **PENDING** |
| **Phase 8: Final Build Verification & Delivery** | Frontend and backend build checks, docs sync, zero secrets check, delivery report | **PENDING** |

---

## Detailed Task Breakdown

### Phase 1: Planning & Specs
- [x] Create project layout (`backend/`, `frontend/`, `supabase/`, `docs/`)
- [x] Create `.gitignore`, `.env.example`, `docker-compose.yml`
- [x] Author comprehensive documentation suite in `docs/`

### Phase 2: Foundation
- [ ] Backend setup: `pyproject.toml` / `requirements.txt` with FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, PyMuPDF, python-jose, passlib
- [ ] Database configuration: Async SQLAlchemy engine supporting SQLite (local dev/test) and PostgreSQL/Supabase (cloud prod)
- [ ] Database models: profiles, credit_cards, card_reward_rules, card_benefits, transactions, spending_categories, uploaded_documents, extracted_card_data, reward_analysis, user_preferences, audit_logs
- [ ] Security & Auth module: JWT Bearer auth, password hashing, role checks, ownership verification (IDOR protection), security headers middleware, rate limiting
- [ ] Frontend setup: Next.js App Router, Tailwind CSS, Lucide icons, Recharts, Framer Motion, Neon Mountain theme tokens

### Phase 3: Core Functionality
- [ ] Card Repository & Services (CRUD + user ownership)
- [ ] Transaction Repository & Services (CRUD + category classification)
- [ ] Deterministic Reward Optimization Engine:
  - Exact Decimal calculations
  - Base reward rate + category-specific multipliers
  - Merchant rules & spending categories
  - Exclusions (e.g. fuel, wallet reloads, rent, government bills, EMI)
  - Reward caps (monthly/annual limits)
  - Minimum spend thresholds
  - Fee deduction if net reward calculation requested
  - Comparative card rankings
  - Transparent mathematical breakdown
- [ ] Explainable Insights generator (deterministic step-by-step audit trail)

### Phase 4: AI & Document Intelligence
- [ ] Document parser: PDF text extraction (PyMuPDF) with OCR fallback
- [ ] Structured extraction service: extracts card name, issuer, network, base cashback, category bonus rates, reward caps, exclusions, fees
- [ ] Staging model (`extracted_card_data`) with `pending_verification` state for human-in-the-loop review before activating
- [ ] Multilingual Financial Intelligence service:
  - Supports English (`en`), Hindi (`hi`), Kannada (`kn`)
  - Grounded financial query processing (uses actual card data & user portfolio)
  - LLM provider abstraction (Gemini, OpenAI, Anthropic, or Fallback Engine)
  - Strict anti-hallucination & prompt injection guards

### Phase 5: Analytics & Health
- [ ] Spending analytics API (category distribution, monthly velocity, top merchants)
- [ ] Reward analytics API (points earned vs missed opportunities)
- [ ] Financial Health Engine (recurring subscription detection, unnecessary fee alerts, optimization recommendations)
- [ ] Spending Prediction Engine (spending trajectory and reward projections)

### Phase 6: Frontend 15 Screens
- [ ] Screen 1: Landing Page (Cinematic Neon Mountain Journey theme)
- [ ] Screen 2: Sign-up & Login
- [ ] Screen 3: User Onboarding (Preferences, currency, initial card setup)
- [ ] Screen 4: Main Dashboard (Overview cards, recent transactions, quick optimizer)
- [ ] Screen 5: My Credit Cards (Portfolio gallery, active benefits, caps tracking)
- [ ] Screen 6: Add Credit Card (Manual rule entry + presets)
- [ ] Screen 7: Credit Card Comparison (Head-to-head comparison matrix)
- [ ] Screen 8: Reward Optimization (Real-time best card recommender with math breakdown)
- [ ] Screen 9: Transaction Analysis (Single transaction deep-dive & potential earnings)
- [ ] Screen 10: Spending Analytics (Visual charts, monthly breakdowns)
- [ ] Screen 11: Financial Health Insights (Subscription audit, reward leakage detector)
- [ ] Screen 12: AI Financial Assistant (Multilingual chat with context injection)
- [ ] Screen 13: Document Upload & Processing (Drag-and-drop PDF upload + verification review)
- [ ] Screen 14: User Profile (Preferences, language selection: en, hi, kn)
- [ ] Screen 15: Settings & Security (Audit log view, session details, data export/deletion)

### Phase 7: Testing & Verification
- [ ] Unit tests for Reward Engine (Decimal precision, cap enforcement, exclusion rules)
- [ ] API integration tests (Cards, Transactions, Optimizer, Documents)
- [ ] Security tests (IDOR verification, unauthenticated access rejection, rate limit)
- [ ] Frontend build verification (`npm run build`)
- [ ] Backend test execution (`pytest`)

### Phase 8: Final Report & Delivery
- [ ] Review all acceptance criteria
- [ ] Generate comprehensive final delivery report
