# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Product Vision

**CLIQ** — *Money Made Simple. In Your Language.*

Privacy-first personal financial intelligence platform for the Indian market. Dual-pathway design: `CREDIT_CARD` users get reward optimization; `NO_CREDIT_CARD` users get cash flow tracking, budgeting, and financial education. Trilingual (English, Hindi, Kannada). All financial math is deterministic — Gemini is used only for plain-language explanation, never for calculations.

---

## Technology Stack (Verified)

| Layer | Technology | Version |
| :--- | :--- | :--- |
| Backend framework | FastAPI | 0.115+ |
| Backend language | Python | 3.12 |
| ORM | SQLAlchemy (AsyncSession) | 2.0 |
| DB (local dev) | SQLite + aiosqlite | — |
| DB (production) | PostgreSQL + asyncpg | 15+ |
| Migrations | Alembic | — |
| AI | Google Gemini 2.5 Flash (direct HTTPX REST, no SDK) | — |
| Frontend framework | Next.js App Router | 14.2.4 |
| Frontend language | TypeScript | 5.4.5 |
| UI library | React | 18.3.1 |
| Styling | Tailwind CSS | 3.4.4 |
| Animations | Framer Motion | 11.2.10 |
| Charts | Recharts | 2.12.7 |
| Icons | Lucide React | 0.395.0 |

---

## Commands

### Backend

```bash
cd backend
python3 -m venv .venv          # first time only
source .venv/bin/activate
pip install -r requirements.txt # first time only
PYTHONPATH=. uvicorn app.main:app --reload --port 8000
```

Swagger UI: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install        # first time only
npm run dev        # http://localhost:3000
npm run build      # production build — must produce 23/23 static pages
```

### Tests

```bash
# Backend — all unit tests
cd backend && PYTHONPATH=. .venv/bin/pytest tests/unit/ -v

# Backend — single test file
cd backend && PYTHONPATH=. .venv/bin/pytest tests/unit/test_reward_engine.py -v

# Backend — security tests
cd backend && PYTHONPATH=. .venv/bin/pytest tests/security/ -v

# Backend — API + integration (excludes live Supabase)
cd backend && PYTHONPATH=. .venv/bin/pytest tests/api/ tests/integration/test_purchase_intelligence_flow.py tests/integration/test_transaction_import_flow.py -v

# Frontend — all 42 tests (7 suites)
cd frontend && npm test

# TypeScript check (app source only — __tests__/ is excluded)
cd frontend && npx tsc --noEmit
```

### Environment Setup

Copy `.env.example` to `.env` at the project root. Backend reads via pydantic-settings. Frontend reads `NEXT_PUBLIC_API_URL` from `frontend/.env.local`.

**Critical variables:**

```ini
DATABASE_URL=sqlite+aiosqlite:///./cliq.db      # local dev default
# DATABASE_URL=postgresql+asyncpg://...          # Supabase / production
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=your_development_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=10080               # 7 days (default)
RATE_LIMIT_PER_MINUTE=120                       # local override; config.py default is 600
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1  # /api/v1 suffix is REQUIRED
```

---

## Backend Architecture (`backend/app/`)

```
app/
  main.py              # FastAPI app, lifespan, router mounts, init_db() seeding
  core/
    config.py          # Pydantic Settings — source of truth for all defaults
    database.py        # Async engine, AsyncSessionLocal, Base
  models/
    entities.py        # ALL ORM models in one file
  api/v1/              # Thin route handlers — delegate to services
  schemas/             # Pydantic v2 request/response models
  services/
    privacy/           # privacy_gateway.py — PII scrubbing + AI consent gate
    reward_optimization/
      engine.py        # RewardOptimizationEngine — pure Decimal math
      merchant_normalizer.py
      eligibility.py
    financial_health/  # health_engine.py — dual-algorithm health scoring
    language_intelligence/ # assistant.py — Gemini 2.5 Flash via httpx REST
    statement_parser/  # CSV import + SHA-256 deduplication
    education/         # curriculum.py + calculators.py
    offers/            # Offer ingestion pipeline, source registry, channels
    document_intelligence/ # PDF parsing (pymupdf)
    prediction/        # prediction_engine.py — pure Decimal time series (no sklearn)
  security/
    jwt.py             # HS256 JWT creation/verification
    password.py        # bcrypt hashing
    middleware.py      # SecurityHeadersMiddleware (6 headers), RateLimitMiddleware
    dependencies.py    # get_current_user dependency
```

**Database strategy — dual migration approach:**
- **Production (PostgreSQL):** Alembic version scripts in `backend/alembic/versions/` (3 scripts: initial → financial_inclusion → no_card_mode). Run `alembic upgrade head`.
- **Local dev (SQLite):** `main.py:init_db()` runs `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE ADD COLUMN IF NOT EXISTS` guards at startup. No Alembic step required for local dev.
- When adding new columns: update BOTH the Alembic migration AND the `init_db()` DDL guards.

**Startup seeding:** `init_db()` seeds admin (`admin@cliq.ai` / `AdminPass@123`), 11 categories, card offers, and source registry on every startup (idempotent — uses INSERT OR IGNORE / seed-if-empty guards).

**All financial math uses `Decimal` — never `float`.**

---

## Frontend Architecture (`frontend/`)

```
app/                   # Next.js 14 App Router — 20 screens (all static)
  layout.tsx           # Root: LanguageProvider > AuthProvider > Navbar
  dashboard/page.tsx   # Adapts based on financial_pathway
  assistant/page.tsx   # AI chat with Gemini
  learn/page.tsx       # Financial education modules
  budget/page.tsx      # Income & budget tracking
  ... (16 more screens)
lib/
  api.ts               # API_BASE_URL, apiFetch() — auto-injects Bearer header
  auth.tsx             # AuthProvider, useAuth hook
  i18n.tsx             # LanguageProvider, useLanguage() → t
  translations.ts      # ALL UI strings for en/hi/kn — add strings here
  cardCatalogue.ts     # Static Indian bank card catalog
components/
  Navbar.tsx / Sidebar.tsx
  DigitalCreditCard.tsx
  NumericInput.tsx     # Leading-zero prevention pattern
  DemoBootstrap.tsx
__tests__/             # Node native test runner (not Jest/Vitest)
  *.test.ts            # 7 suites, 42 tests total
```

**Auth:** JWT in `localStorage` with `cliq_` key prefix. `apiFetch` auto-attaches `Authorization: Bearer`.

**i18n:** ALL new UI text must have `en`/`hi`/`kn` keys in `translations.ts`. Access via `const { t } = useLanguage()`.

**Numeric inputs:** Use `NumericInput` component — initializes as `""`, prevents `06` leading zeros, preserves trailing decimals.

**Pathway rendering:** Check `userProfile?.financial_pathway === "NO_CREDIT_CARD"` (not `cards.length`).

---

## Design System (Current Implementation)

**Color tokens (Tailwind `cliq.*`):**

| Token | Value | Usage |
| :--- | :--- | :--- |
| `cliq.bg` | `#040707` | Page canvas |
| `cliq.bgSecondary` | `#08100E` | Section backgrounds |
| `cliq.surface` | `rgba(10,22,18,0.65)` | Glass cards |
| `cliq.cyan` / `cliq.emerald` | `#10B981` | Primary accent |
| `cliq.mint` | `#34D399` | Secondary accent |
| `cliq.turquoise` | `#14B8A6` | Tertiary accent |
| `cliq.textPrimary` | `#FFFFFF` | Headings |
| `cliq.textSecondary` | `#94A3B8` | Body text |
| `cliq.danger` | `#EF4444` | Errors |
| `cliq.warning` | `#F59E0B` | Warnings |

**Box shadows:** `shadow-neonCyan`, `shadow-cardGlass`, `shadow-liquidGlass` (defined in `tailwind.config.ts`).

**Animations:** Framer Motion spring physics. `variants` + `initial`/`animate`/`exit` pattern. Respect `prefers-reduced-motion`.

Full design system specification: `docs/DESIGN_SYSTEM.md`

---

## Desktop / Mobile Strategy

CLIQ delivers two purpose-designed experiences sharing all APIs, business logic, and auth.

**Desktop (≥1024px):** Persistent sidebar (`Sidebar.tsx`), multi-column analytics, full data tables.

**Mobile (<1024px):** `Navbar.tsx` bottom bar, swipeable card carousel, compact health dashboard, full-screen AI assistant.

**Responsive implementation:** Tailwind breakpoints (`md:`, `lg:`). No separate mobile backend — same FastAPI routes. Details in `docs/DESKTOP_MOBILE_STRATEGY.md`.

---

## Financial Calculation Standards

- **All monetary arithmetic uses `Decimal`** — import from Python's `decimal` module.
- `RewardOptimizationEngine` is the canonical reward calculation authority.
- Gemini is NEVER used for numerical output — only plain-language explanations.
- Financial health uses two separate algorithms by pathway (see `docs/AI_INTEGRATION.md`).
- 90-day rolling median (not mean) for irregular income normalization.

---

## Privacy Gateway

`backend/app/services/privacy/privacy_gateway.py` — mandatory gatekeeper for ALL Gemini calls.

1. Task type validated against `APPROVED_AI_TASKS` allowlist.
2. `SensitiveDataRedactor` runs 9 pre-compiled regex rules (card numbers, CVV, OTP/PIN, Aadhaar, PAN, bank account, email, phone, auth tokens).
3. User `external_ai_enabled` consent checked from `UserAiConsent` table.
4. Every call logged to `AiRequestAuditLog` (immutable).

**Never call Gemini directly from a route handler.** Always route through Privacy Gateway.

---

## Security Rules

- JWT expiry: **7 days** (10080 minutes). No refresh token yet — planned future hardening.
- Rate limit: **600 req/min** (config.py default). Local `.env.example` sets **120 req/min**.
- 6 security headers injected by `SecurityHeadersMiddleware` including `Referrer-Policy`.
- Tenant isolation: every query filters `WHERE user_id = current_user.id`. Cross-tenant → HTTP 404.
- Passwords: bcrypt via passlib. Raw passwords never logged or returned.
- No card numbers, CVVs, or full account numbers stored — only last 4 digits and card nicknames.

---

## Git Safety Rules

- **NEVER** run `git reset`, `git clean`, `git checkout .`, `git restore .`, or `git stash` without explicit user authorization.
- **NEVER** commit or push without explicit user request.
- All uncommitted changes in the working tree are intentional — preserve them.
- Do not start Phase 4 or any subsequent phase without explicit user authorization.
- Main branch: `main`. Target PR branch: `first`.

---

## Documentation References

| Document | Location | Purpose |
| :--- | :--- | :--- |
| Handover package | `CLAUDE_HANDOVER/` | Deep engineering context (19 files) |
| Reconciliation report | `CLAUDE_DOCUMENTATION_RECONCILIATION_AND_PHASE_3_2_VERIFICATION.md` | 12 discrepancy audit + test results |
| Phase 3.3 report | `PHASE_3_3_FINAL_STABILIZATION_REPORT.md` | Stabilization completion record |
| API reference | `docs/API_REFERENCE.md` | 61 endpoints across 11 domains |
| Implementation status | `docs/IMPLEMENTATION_STATUS.md` | Phase completion matrix |
| Design system | `docs/DESIGN_SYSTEM.md` | Color tokens, components, motion |
| Architecture | `docs/ARCHITECTURE.md` | System diagrams and service map |
| Security | `docs/SECURITY.md` | Threat model, PII rules, auth |
| Roadmap | `CLAUDE_HANDOVER/MASTER_ROADMAP.md` | 14-phase roadmap |

---

## Testing Workflow

After any change:

1. `cd backend && PYTHONPATH=. .venv/bin/pytest tests/unit/ tests/security/ -q` — must show 0 failures.
2. `cd frontend && npm test` — must show 42/42 passing.
3. `cd frontend && npm run build` — must produce 23/23 static pages.
4. For backend API changes: also run `pytest tests/api/ -q`.

Known test state (Phase 3.3 baseline): 169/170 passing. The one unit test failure (`test_hybrid_offer_discovery.py`) was fixed in Phase 3.3.

---

## Session Handoff Procedure

Before ending a session where significant work was done:

1. Run the full test suite and record pass/fail counts.
2. Run `git status` and note all modified/untracked files.
3. Update `CLAUDE_HANDOVER/IMPLEMENTATION_STATUS.md` with any new completions.
4. If a new phase or major feature was completed, create `PHASE_X_Y_REPORT.md` at repo root.
5. Update the memory file at `~/.claude/projects/-Users-rahuljain-CLIQ/memory/MEMORY.md`.
6. Note any open defects with DEF-XX identifiers.
7. Record the last completed and next planned phase in `CLAUDE_HANDOVER/MASTER_ROADMAP.md`.
