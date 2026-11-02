---
name: codebase-navigation
description: Efficiently locate any piece of CLIQ code — API endpoints, ORM models, service functions, frontend components, and test coverage — using targeted Grep and Glob searches rather than reading whole files.
---

# Codebase Navigation Skill

## CLIQ Codebase Map

### Backend — where things live
```
Backend model definitions:     backend/app/models/entities.py (single file, all models)
Backend API routes:            backend/app/api/v1/<domain>.py
Backend service logic:         backend/app/services/<domain>/
Backend schemas (Pydantic):    backend/app/schemas/<domain>.py
Backend config:                backend/app/core/config.py
JWT/auth utilities:            backend/app/security/
Database session:              backend/app/core/database.py
App entry point + seeding:     backend/app/main.py
```

### Frontend — where things live
```
Pages:                         frontend/app/<route>/page.tsx
Shared components:             frontend/components/<Name>.tsx
API client + helpers:          frontend/lib/api.ts
Auth context:                  frontend/lib/auth.tsx
i18n context:                  frontend/lib/i18n.tsx
All translation strings:       frontend/lib/translations.ts
Tailwind config + colors:      frontend/tailwind.config.ts
TypeScript config:             frontend/tsconfig.json
Test files:                    frontend/__tests__/*.test.ts
```

## Finding Things Fast

### Find which file handles a route
```bash
grep -rn "router.get\|router.post\|@router" backend/app/api/v1/ --include="*.py" | grep "transactions"
```

### Find an ORM model definition
```bash
grep -n "^class.*Base\|^class.*Model" backend/app/models/entities.py
```

### Find where a frontend page makes an API call
```bash
grep -n "apiFetch" frontend/app/transactions/page.tsx
```

### Find all usages of a translation key
```bash
grep -rn "t\.transactionAmount" frontend/ --include="*.tsx"
```

### Find which service a route depends on
```bash
grep -n "^from\|^import" backend/app/api/v1/transactions.py | grep -v "^#"
```

### Find test coverage for a function
```bash
grep -rn "test_.*reward\|def.*reward" backend/tests/ --include="*.py"
```

## Key Files to Know Cold

| File | What's important |
| :--- | :--- |
| `backend/app/core/config.py` | All defaults (rate limit 600, JWT 7 days, model gemini-2.5-flash) |
| `backend/app/main.py` | `init_db()` seeding logic, router mounts, middleware order |
| `backend/app/models/entities.py` | All 21 ORM tables — single file |
| `backend/app/services/privacy/privacy_gateway.py` | 9 PII rules, consent check, Gemini httpx call |
| `backend/app/services/financial_health/health_engine.py` | Dual algorithm, OR condition line ~122 |
| `frontend/lib/api.ts` | `apiFetch` — auto-auth, API_BASE_URL with `/api/v1` |
| `frontend/lib/translations.ts` | All UI strings — add new strings here |
| `frontend/tailwind.config.ts` | All `cliq.*` color tokens and shadow utilities |

## Common Patterns to Search For

### DEF-01 guard (non-card payment isolation)
```bash
grep -n "non_card_methods\|reward_earned.*0\|NO_CREDIT_CARD" backend/app/api/v1/transactions.py | head -20
```

### Health engine pathway switch
```bash
grep -n "is_no_card_mode\|financial_pathway" backend/app/services/financial_health/health_engine.py | head -10
```

### Tenant isolation queries
```bash
grep -n "user_id.*current_user\|current_user.id" backend/app/api/v1/transactions.py | head -10
```

### Gemini call site
```bash
grep -n "generativelanguage\|generateContent" backend/app/services/privacy/privacy_gateway.py
```

## Alembic Migration Reference
```bash
cd backend && PYTHONPATH=. alembic history    # list all migrations
cd backend && PYTHONPATH=. alembic current    # current DB revision
cd backend && PYTHONPATH=. alembic upgrade head  # apply pending migrations
```

## Test Reference
```bash
# Which tests cover a feature
grep -rn "def test_.*csv\|def test_.*import" backend/tests/ --include="*.py"

# Run tests matching a keyword
cd backend && PYTHONPATH=. .venv/bin/pytest tests/ -k "csv" -v
```
