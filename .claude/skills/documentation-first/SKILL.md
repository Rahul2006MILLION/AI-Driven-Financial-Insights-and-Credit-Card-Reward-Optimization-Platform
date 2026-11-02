---
name: documentation-first
description: Consult CLIQ's handover documentation and canonical docs before implementing — checking IMPLEMENTATION_STATUS, DECISIONS, API_REFERENCE, and architecture docs to avoid re-implementing existing services, contradicting architectural decisions, or duplicating work.
---

# Documentation-First Skill

## When to Activate
- Starting any new feature or endpoint
- Unsure whether something already exists
- About to make an architectural decision
- Adding a new database table or API route

## Consultation Order

Before writing any code, consult:

1. **`docs/IMPLEMENTATION_STATUS.md`** — Is this feature already implemented? Is there a known defect?
2. **`CLAUDE_HANDOVER/KNOWN_ISSUES_AND_PENDING_FIXES.md`** — Are there open defects in this area?
3. **`docs/DECISIONS.md`** — Does an ADR constrain this decision?
4. **`CLAUDE_HANDOVER/API_REFERENCE.md`** — Does an endpoint already exist for this?
5. **`CLAUDE_HANDOVER/DATABASE_AND_DATA_MODEL.md`** — Does a table/column already exist?
6. **Source code** — Ground truth when docs diverge.

## Key Truths to Remember

These are common "does this exist?" questions with answers:

| Question | Answer | Location |
| :--- | :--- | :--- |
| Is there an income tracking endpoint? | Yes, POST /api/v1/incomes | `api/v1/incomes.py` |
| Is there a health score endpoint? | Yes, GET /api/v1/analytics/health-score | `api/v1/analytics.py` |
| Is CSV import implemented? | Yes, POST /api/v1/transactions/import/* | `api/v1/transactions.py` |
| Does the Privacy Gateway exist? | Yes, fully implemented | `services/privacy/privacy_gateway.py` |
| Is CLIQ Learn implemented? | Yes, curriculum + 5 calculators | `services/education/` |
| Is Scam Shield implemented? | No — Phase 4, not started | `docs/IMPLEMENTATION_STATUS.md` |
| Are refresh tokens implemented? | No — Phase 5, not started | `docs/DECISIONS.md` ADR-004 |

## Anti-Patterns to Avoid

```python
# BAD: Creating a new income service when incomes.py already exists
# First check: grep -rn "income" backend/app/api/v1/ --include="*.py"

# BAD: Creating a new PII scrubber when privacy_gateway.py exists
# First check: ls backend/app/services/privacy/

# BAD: Adding a new JWT utility when security/jwt.py exists
# First check: ls backend/app/security/

# BAD: Creating a new financial calculator when education/calculators.py exists
# First check: grep -n "def.*calculator\|class.*Calculator" backend/app/services/education/
```

## Documentation Discrepancies

Some CLAUDE_HANDOVER docs are outdated (12 discrepancies corrected in Phase 3.3). When docs and source code conflict, **source code wins**. Key known corrections:

- AI model: code says `gemini-2.5-flash` (not 1.5-flash)
- JWT expiry: code says 7 days (not 60 min)
- Rate limit: code config says 600, .env.example says 120 (not 60)
- Health scoring: code has TWO algorithms (not one 4-pillar model)
- Gemini integration: direct httpx REST (no Google SDK)

Full discrepancy list: `CLAUDE_DOCUMENTATION_RECONCILIATION_AND_PHASE_3_2_VERIFICATION.md`

## Before Creating a New File

Ask these questions:
1. Does any file in `backend/app/api/v1/` already handle this domain?
2. Does any service in `backend/app/services/` already contain this logic?
3. Does any ORM model in `entities.py` already capture this data?
4. Is there a frontend component in `frontend/components/` that does this?
5. Is there a translation key in `translations.ts` for this text?

If yes → extend the existing file. Do not create a parallel service.
