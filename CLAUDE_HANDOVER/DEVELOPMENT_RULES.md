# CLIQ — Engineering Rules & Operational Constraints for Claude

To maintain architectural integrity, prevent code regressions, and preserve production-grade software quality, Claude (and any collaborating engineer) must strictly adhere to these non-negotiable rules.

---

## 1. Safety & Git Operations (CRITICAL)

1. **Zero Destructive Git Commands:**
   - NEVER execute `git reset`, `git clean`, `git checkout .`, `git restore .`, or `git stash` without explicit, unambiguous user authorization.
   - All uncommitted files in the working tree are intentional and represent active engineering progress.
2. **Zero Unauthorized Commits or Pushes:**
   - NEVER run `git commit` or `git push` unless specifically requested by the user.
3. **No Credential Exposure:**
   - NEVER copy actual `.env` secrets, database passwords, JWT secret keys, or Google Gemini API keys into commit messages, chat responses, or documentation.

---

## 2. Codebase Discovery & Modification Rules

4. **Inspect Before Implementing:**
   - Always read the relevant existing files before writing or proposing code changes.
   - Never assume an entity, service, or endpoint does or does not exist. Ground every decision in real code.
5. **No Needless Rewrites:**
   - Extend existing services, models, and routers. Never discard or rewrite working services simply because you would have structured them differently.
6. **Preserve Existing Capabilities:**
   - When building Phase 4 or subsequent phases, ensure all existing capabilities (Credit Card Wallet, Reward Optimization, Incomes, CLIQ Learn, CSV Parser) remain fully functional.
   - Run existing regression tests (`npm test` in `frontend` and `pytest tests/unit/` in `backend`) after applying code changes.

---

## 3. Financial Correctness & Arithmetic Invariants

7. **Mandatory `Decimal` for Financial Arithmetic:**
   - NEVER use binary floating-point numbers (`float`) for monetary calculations, reward points, fees, or interest.
   - Always import and use Python's `Decimal` with explicit rounding.
8. **No Hallucinated Financial Calculations:**
   - Do NOT allow external LLMs to calculate interest rates, reward earnings, or budget allocations. All financial math must reside in deterministic Python functions.
9. **No-Credit-Card Isolation (DEF-01 Invariant):**
   - Transactions with non-card payment methods (`CASH`, `UPI`, `DEBIT_CARD`, `BANK_TRANSFER`, `OTHER`) MUST NEVER receive credit card reward point attribution, reward earnings, or optimal card IDs.

---

## 4. Architecture & Security Invariants

10. **Strict Tenant Isolation:**
    - Every database query accessing user data must filter by `user_id == current_user.id`.
    - Cross-tenant lookups must raise HTTP 404 (or HTTP 403 where appropriate).
11. **Privacy Gateway Enforcement:**
    - Any new capability that sends text context to an external LLM MUST route through `PrivacyGateway` to scrub Indian PII (Aadhaar, PAN, Card Numbers, Phone Numbers, Email, UPI IDs) and verify task allowlisting.
12. **Versioned Alembic Migrations:**
    - When modifying database entities for PostgreSQL production, ALWAYS author a clean, reversible version script inside `backend/alembic/versions/`.
    - **Exception — SQLite Local Development:** `backend/app/main.py:init_db()` additionally performs `ALTER TABLE ADD COLUMN IF NOT EXISTS` DDL at startup specifically for SQLite ergonomics, allowing local dev without manual Alembic steps. This runtime DDL is SQLite-only and never runs against PostgreSQL. This is an intentional dual-migration strategy, not a policy violation. When adding new columns, update both the Alembic migration script (for production) AND the `init_db()` inline DDL guards (for local SQLite dev).
13. **Vestigial Dependencies — `scikit-learn` and `numpy`:**
    - `backend/requirements.txt` includes `scikit-learn>=1.5.0` and `numpy>=1.26.0`. These libraries are **not currently imported** anywhere in the codebase — all financial prediction uses pure Python `Decimal` arithmetic. They are reserved for a future ML enhancement phase. Do not add imports of these libraries without an explicit engineering decision and user authorization.

---

## 5. Frontend & UI Invariants

13. **Tri-lingual Parity:**
    - Any new UI text, modal label, button, error message, or heading MUST include complete translations across all 3 supported languages in `frontend/lib/translations.ts`:
      - `en`: English
      - `hi`: Hindi (Devanagari script)
      - `kn`: Kannada (Kannada script)
14. **Numeric Input Integrity:**
    - Adhere to CLIQ's numeric input pattern: inputs initialize as empty strings `""`, avoid leading zero traps (e.g. typing `6` must never become `06`), and preserve trailing decimal points during active input.
15. **Adaptive Navigation:**
    - Ensure all new views correctly check `userProfile?.financial_pathway` to adapt navigation and CTAs appropriately.

---

## 6. Development Workflow & Verification Invariants

16. **Work One Approved Phase at a Time:**
    - Do not jump ahead on the roadmap or implement features from future milestones without user instruction.
17. **Explainability & Decision Provenance:**
    - Every recommendation, score, or alert must provide the user with clear mathematical evidence and reasoning.
18. **Verify Before Declaring Completion:**
    - Never claim an implementation or bugfix is complete without executing automated tests and providing actual terminal output evidence.

