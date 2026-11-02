# CLIQ — Claude Session Handoff Protocol

This document ensures continuity between Claude Code sessions. Follow this protocol at the start and end of every significant engineering session.

---

## Session Start Checklist

1. **Read CLAUDE.md** — project overview, commands, architecture, safety rules.
2. **Read `docs/IMPLEMENTATION_STATUS.md`** — what is done, what is broken, what is planned.
3. **Run `git status`** — record existing uncommitted state. Never discard it.
4. **Read `docs/DECISIONS.md`** — understand non-negotiable architectural decisions.
5. **Read the task-specific handover section** below for the current phase.
6. **Check `~/.claude/projects/-Users-rahuljain-CLIQ/memory/MEMORY.md`** — persistent session notes.

Do not assume implementation state from documentation alone — read the source code.

---

## Session End Checklist

1. **Run the full test suite:**
   ```bash
   cd backend && PYTHONPATH=. .venv/bin/pytest tests/unit/ tests/security/ -q
   cd frontend && npm test
   cd frontend && npm run build
   ```
2. **Record pass/fail counts** in the phase report.
3. **Run `git status`** — note all new/modified files.
4. **Update `docs/IMPLEMENTATION_STATUS.md`** with any newly completed features.
5. **Create `PHASE_X_Y_REPORT.md`** at repo root if a phase or major milestone completed.
6. **Update `~/.claude/projects/-Users-rahuljain-CLIQ/memory/MEMORY.md`** with key findings.
7. **Note any new defects** as DEF-XX in `IMPLEMENTATION_STATUS.md`.
8. **Never commit or push** unless explicitly requested.

---

## Current Engineering State (Phase 3.3 Baseline)

**Branch:** `main`
**Version:** v0.4.0
**Phases complete:** 0, 1, 2, 3, 3.1, 3.2, 3.3
**Next planned phase:** Phase 4 — Financial Scam Shield (awaiting user authorization)

**Test baseline:**
- 79/79 backend unit tests passing
- 40/40 security tests passing
- 9/9 API + integration tests passing
- 42/42 frontend tests passing
- 23/23 Next.js static pages building

**Uncommitted working tree:** Significant modifications staged from Phases 3.x — these are intentional. Do NOT discard with `git reset` or `git clean`.

---

## Phase 4 Entry Conditions (Before Starting)

Do not begin Phase 4 until the user explicitly authorizes it. When authorized:

1. Read `CLAUDE_HANDOVER/MASTER_ROADMAP.md` Phase 4 specification.
2. Read `CLAUDE_HANDOVER/PRODUCT_VISION_AND_REQUIREMENTS.md` Capability 3 (Scam Shield).
3. Design the `ScamShieldEngine` service location before writing code.
4. Propose the database schema changes and Alembic migration.
5. Get user approval on the design before implementation.

---

## Key Gotchas for Future Sessions

- `NEXT_PUBLIC_API_URL` must include `/api/v1` suffix — omitting it breaks all API calls.
- JWT expiry is 7 days (not 60 minutes as old docs said).
- Gemini model is `gemini-2.5-flash` (not 1.5-flash).
- Health scoring uses TWO algorithms selected by `(len(cards)==0) OR (pathway=="NO_CREDIT_CARD")`.
- `__tests__/` is excluded from tsconfig — this is intentional (Node native test runner).
- `scikit-learn` and `numpy` are in requirements.txt but unused — do not import them without authorization.
- Rate limit: 600 req/min (config.py default), 120 (`.env.example` local), 60 (old stale docs — ignore).
- Admin credentials (local dev only): `admin@cliq.ai` / `AdminPass@123` — seeded by `init_db()`.

---

## Documentation Map

| Need | Read This |
| :--- | :--- |
| Project overview | `CLAUDE.md` (this repo) |
| Deep architecture | `CLAUDE_HANDOVER/BACKEND_ARCHITECTURE.md` |
| API reference | `docs/API_DOCUMENTATION.md` |
| Database schema | `docs/DATABASE_DESIGN.md` |
| Security model | `CLAUDE_HANDOVER/SECURITY_AND_PRIVACY.md` |
| Financial algorithms | `CLAUDE_HANDOVER/AI_ML_AND_FINANCIAL_LOGIC.md` |
| Roadmap | `CLAUDE_HANDOVER/MASTER_ROADMAP.md` |
| Implementation matrix | `docs/IMPLEMENTATION_STATUS.md` |
| Architectural decisions | `docs/DECISIONS.md` |
| Design system | `docs/DESIGN_SYSTEM.md` |
| Desktop/mobile | `docs/DESKTOP_MOBILE_STRATEGY.md` |
| Discrepancy audit | `CLAUDE_DOCUMENTATION_RECONCILIATION_AND_PHASE_3_2_VERIFICATION.md` |
