---
name: frontend-testing
description: Write and maintain frontend tests for CLIQ using Node's native test runner with TypeScript — testing utility functions, financial calculators, auth lifecycle, localization completeness, and component logic — following the patterns established in frontend/__tests__/.
---

# Frontend Testing Skill

## Test Runner
Node native test runner (not Jest or Vitest):
```bash
cd frontend && npm test
# expands to: node --test --experimental-strip-types __tests__/*.test.ts
```

No compilation step — TypeScript is stripped at runtime. Tests run in Node context, not browser.

## Test File Conventions

```typescript
import { test, describe, it } from "node:test"
import assert from "node:assert/strict"

// All test files: frontend/__tests__/<name>.test.ts
// Import helpers with .ts extension (required for Node strip-types runner):
import { myFunction } from "../lib/myModule.ts"
```

Note: Import paths MUST include `.ts` extension in test files. This causes TS5097 errors in `tsc --noEmit` but `__tests__/` is excluded from `tsconfig.json` (intentional — see `docs/DECISIONS.md` ADR-010).

## Current Test Suites (baseline)

| File | Tests | What it covers |
| :--- | :--- | :--- |
| `auth_lifecycle.test.ts` | 6 | JWT storage, sync, 401 logout, Bearer injection |
| `card_stack_animation.test.ts` | 7 | Geometry, fan-out rotation math |
| `financial_inclusion.test.ts` | 6 | Compounding, minimum due, 50/30/20, utilization |
| `localization.test.ts` | 6 | Dictionary completeness, zero missing keys per language |
| `no_card_mode.test.ts` | 6 | Income normalization, cash flow, non-card payloads |
| `numeric_input.test.ts` | 8 | Leading-zero prevention, empty string init |
| `transaction_import.test.ts` | 3 | Status mapping, duplicate flags, commit payload |

Total: 42 tests. Must remain 42/42 passing.

## Writing a New Test

```typescript
// frontend/__tests__/my_feature.test.ts
import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { myCalculator } from "../lib/myCalculator.ts"

describe("myCalculator", () => {
  it("returns correct result for standard input", () => {
    const result = myCalculator({ principal: 10000, rate: 0.36, months: 12 })
    assert.strictEqual(result.totalInterest, 3600)
  })

  it("handles zero principal gracefully", () => {
    const result = myCalculator({ principal: 0, rate: 0.36, months: 12 })
    assert.strictEqual(result.totalInterest, 0)
  })

  it("throws on negative principal", () => {
    assert.throws(
      () => myCalculator({ principal: -100, rate: 0.36, months: 12 }),
      /principal must be positive/
    )
  })
})
```

## What to Test

**Test these in frontend:**
- Pure utility functions in `lib/` (calculations, formatters)
- Translation dictionary completeness (all keys present in all 3 languages)
- Financial calculation helpers (any math done client-side)
- Auth state management functions
- Form validation logic

**Do NOT test in frontend:**
- Backend API behavior (test in pytest)
- React component rendering (no DOM available in Node runner)
- Fetch/API calls (mock-heavy, better in integration tests)

## Localization Test Pattern

```typescript
import { translations } from "../lib/translations.ts"

it("has no missing keys between en and hi", () => {
  const enKeys = Object.keys(translations.en).sort()
  const hiKeys = Object.keys(translations.hi).sort()
  assert.deepStrictEqual(enKeys, hiKeys, "Hindi missing keys vs English")
})
```

## Running a Single Suite

```bash
cd frontend && node --test --experimental-strip-types __tests__/financial_inclusion.test.ts
```

## Before Adding a Test File

Check that the new test file name is added to the `npm test` glob if it doesn't match `*.test.ts` — the current command captures all `__tests__/*.test.ts` automatically.

## Checklist for New Feature
- [ ] New utility function → add test in `__tests__/`
- [ ] New translation keys → add to localization completeness test
- [ ] New financial calculation → add deterministic numeric assertion
- [ ] All 42 existing tests still pass after changes
