---
name: incremental-development
description: Build CLIQ features incrementally — design before code, smallest working implementation first, test after each increment, scope discipline — to maintain quality and prevent regressions in the existing working platform.
---

# Incremental Development Skill

## When to Activate
- Starting a new feature or phase
- A task spans multiple files or layers
- Tempted to refactor surrounding code while implementing something else
- A change touches many files simultaneously

## CLIQ Sequencing for New Endpoints

1. Add ORM field/table → Alembic migration + `init_db()` DDL guard
2. Add Pydantic schema
3. Write service function (pure logic, independently testable)
4. Add thin route handler (calls service, returns schema)
5. Run backend tests: `pytest tests/unit/ -q`
6. Add frontend API call + component
7. Add translations for all new UI text
8. Run frontend: `npm test && npm run build`

## Sequencing for New Calculations

1. Write the formula as a pure Python function using `Decimal`
2. Write unit tests with known-good inputs first
3. Make the tests pass
4. Integrate into the service
5. Verify: `assert isinstance(result, Decimal)` — never float

## Scope Discipline

**Do not add while implementing:**
- Error handling for scenarios that can't happen in practice
- Caching before performance is proven to be a problem
- Extra input validation beyond what the business logic requires
- Generic helpers for one-time operations
- Comments on self-evident code
- Type annotations or docstrings on code you didn't change

## What Never to Do Without Authorization

- Rewrite working services "for cleanliness"
- Upgrade dependencies
- Refactor ORM model structure
- Change existing API response shapes
- Remove or rename existing translation keys
- Delete tests or weaken assertions
- Start Phase 4 or any future phase
- Remove `scikit-learn`/`numpy` from requirements.txt
