---
name: incremental-development
description: Build CLIQ features incrementally — design before code, smallest working implementation first, test after each increment, avoid over-engineering — to maintain code quality and prevent regressions in the existing working platform.
---

# Incremental Development Skill

## When to Activate
- Starting a new feature or phase
- A task has multiple components that could be sequenced
- Feeling the urge to refactor surrounding code while implementing something else
- A proposed change touches many files simultaneously

## CLIQ Development Principles

### 1. Design before code
For any new endpoint or service:
1. Write the Pydantic schema first (request + response)
2. Design the database query
3. Sketch the service function signature
4. Get user approval if the design is non-obvious
5. Then implement

### 2. One layer at a time
For a new feature: model → schema → service → route → frontend
Do not mix frontend and backend changes in the same step unless they are trivial.

### 3. Minimum viable implementation
```python
# Phase 1: Get it working correctly
async def get_health_score(user_id: str, db: AsyncSession) -> HealthScore:
    transactions = await fetch_transactions(user_id, db)
    return calculate_basic_score(transactions)

# Phase 2 (later, separately): Optimize if needed
# Do not pre-optimize or add caching before it's needed
```

### 4. Test after each increment

After each discrete change:
```bash
# Backend change:
cd backend && PYTHONPATH=. .venv/bin/pytest tests/unit/ -q

# Frontend change:
cd frontend && npm test && npm run build
```

Do not accumulate multiple unverified changes before running tests.

### 5. Scope discipline

**Do not add while implementing:**
- Error handling for scenarios that can't happen
- Caching for data not yet proven slow
- Extra validation beyond what's required
- Generic helpers that are only used once
- Comments on self-evident code
- Type annotations on code you didn't change

**The right scope:** Fix or build exactly what was asked. No more.

## CLIQ-Specific Sequencing

### New API endpoint
1. Add ORM field/table (if needed) + Alembic migration + `init_db()` DDL guard
2. Add Pydantic schema
3. Write service function (pure logic, testable in isolation)
4. Add route handler (thin — calls service, returns schema)
5. Run backend tests
6. Add frontend API call + component
7. Add translations for new UI strings
8. Run frontend tests + build

### New financial calculation
1. Write the formula as a pure Python function using `Decimal`
2. Write unit tests with known-good inputs/outputs first
3. Make the tests pass
4. Integrate into the service
5. Never use floats — verify with `assert isinstance(result, Decimal)`

### New page
1. Verify route doesn't already exist: `ls frontend/app/`
2. Add page.tsx with `"use client"`, `useAuth`, `useLanguage`
3. Add translations for all text
4. Add to Sidebar navigation
5. Test: `npm run build` — new page should appear in route list

## What NEVER to Do Without Authorization
- Rewrite working services "for cleanliness"
- Upgrade dependencies
- Refactor the ORM model structure
- Change the API response shape of existing endpoints
- Modify the Privacy Gateway's allowlist
- Remove or rename existing translation keys
- Delete test files or weaken assertions
