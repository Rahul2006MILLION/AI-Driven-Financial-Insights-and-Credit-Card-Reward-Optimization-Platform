# CLIQ Architectural Decisions

Decisions recorded here are authoritative. Future engineering must respect these choices or get explicit user authorization to change them.

---

## ADR-001: Deterministic Financial Math Only — No LLM Calculations

**Decision:** All monetary arithmetic, reward calculations, interest calculations, and financial scores use Python `Decimal` exclusively. Gemini is never used for numerical output.

**Rationale:** Generative models hallucinate numbers. Financial accuracy is non-negotiable in a fintech product. Users depend on these numbers for real spending decisions.

**Implementation:** `RewardOptimizationEngine` in `services/reward_optimization/engine.py` is the canonical calculation authority.

---

## ADR-002: Direct HTTPX REST for Gemini — No Google SDK

**Decision:** Gemini is called via raw `httpx.AsyncClient` POST to `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`. No `google-generativeai` or `google-genai` package is installed.

**Rationale:** Avoids heavyweight SDK dependency, avoids SDK version lock-in, gives full control over request/response shape, and keeps the dependency footprint small.

**Model:** `gemini-2.5-flash` (configured via `AI_MODEL_NAME` in `config.py`).

---

## ADR-003: Dual Migration Strategy (Alembic + Inline DDL)

**Decision:** PostgreSQL production uses Alembic version scripts exclusively. SQLite local development uses `init_db()` inline `ALTER TABLE ADD COLUMN IF NOT EXISTS` guards.

**Rationale:** Alembic for production gives a clean, reversible migration history. Inline DDL for SQLite removes the friction of running migration commands in local dev.

**Rule:** When adding columns, update BOTH the Alembic script (production) AND `init_db()` DDL guards (local dev).

---

## ADR-004: JWT Expiry 7 Days — No Refresh Tokens (Yet)

**Decision:** `ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7` (7 days). No refresh token mechanism.

**Rationale:** Early-phase product decision to reduce re-login friction during development and user testing. Acknowledged security trade-off.

**Future:** Refresh tokens are planned for a dedicated auth-hardening phase (Phase 5).

---

## ADR-005: Rate Limit 600 req/min Default

**Decision:** `config.py` default is 600 req/min. `.env.example` sets 120 for local dev. Documentation should state both values explicitly.

**Rationale:** Development ergonomics. Tests run without hitting limits. Production deployments should override via environment variable to a tighter policy (recommended: 60–120 for production).

---

## ADR-006: In-Memory Rate Limiting — No Redis

**Decision:** `RateLimitMiddleware` uses an in-memory per-IP counter. No Redis or distributed state.

**Limitation:** Rate limit state is NOT shared across multiple backend instances. For single-instance deployments this is fine. For horizontally scaled production, this must be replaced with a Redis-backed implementation.

---

## ADR-007: `scikit-learn` and `numpy` in requirements.txt — Not Yet Used

**Decision:** Both libraries are listed in `requirements.txt` but no code imports them. The `PredictionEngine` uses pure Python `Decimal` arithmetic.

**Rationale:** Reserved for a future ML enhancement phase without requiring a requirements change at that time.

**Note:** These add ~180MB to the deployment image. Remove or keep based on Phase 10+ timeline.

---

## ADR-008: No UPI ID PII Redaction

**Decision:** The Privacy Gateway does NOT implement UPI ID regex redaction despite it being listed in earlier documentation.

**Rationale:** The pattern `[a-zA-Z0-9_.-]+@[a-zA-Z0-9]+` overlaps too broadly with email addresses and legitimate financial context identifiers, causing over-redaction that degrades AI response quality.

**Future:** A more precise UPI ID pattern (e.g., anchored to known UPI PSP suffixes like `@upi`, `@okaxis`, `@paytm`) is planned but not yet implemented.

---

## ADR-009: Financial Pathway Detection Uses OR Condition

**Decision:** `is_no_card_mode = (len(cards) == 0) or (financial_pathway == "NO_CREDIT_CARD")` in `health_engine.py`.

**Rationale:** A `CREDIT_CARD` pathway user with an empty wallet should receive the No-Card Mode health scoring (Algorithm A) as a graceful fallback, not a zero or error score. Algorithm A is more useful with sparse data.

---

## ADR-010: `__tests__/` Excluded from tsconfig Type Checking

**Decision:** `frontend/tsconfig.json` excludes `__tests__/`. TypeScript compiler does not type-check test files.

**Rationale:** Test files use Node's `--experimental-strip-types` runner which bypasses TypeScript compilation entirely. Test imports use `.ts` extensions which are valid for the Node runner but cause TS5097 errors under `moduleResolution: "bundler"`. The Next.js production build has zero type errors; test compilation is handled separately.
