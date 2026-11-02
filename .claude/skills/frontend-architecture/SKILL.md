---
name: frontend-architecture
description: Understand and extend the CLIQ Next.js 14 App Router frontend — routing conventions, auth context, i18n provider, API integration patterns, component boundaries, and TypeScript patterns — when adding new screens, components, or API integrations.
---

# CLIQ Frontend Architecture Skill

## When to Activate
- Adding a new page or route to `frontend/app/`
- Creating or modifying shared components in `frontend/components/`
- Integrating a new backend API endpoint into the frontend
- Debugging auth, routing, or i18n issues

## Architecture Overview

**Framework:** Next.js 14 App Router — all pages are `"use client"` (static prerendering with client-side state)

**Provider hierarchy (from `app/layout.tsx`):**
```
LanguageProvider (i18n)
  └── AuthProvider (JWT session)
        └── Navbar (top/bottom nav)
              └── page content
```

## Adding a New Page

1. Create `frontend/app/<route>/page.tsx`
2. Add `"use client"` at top
3. Import `useAuth` and `useLanguage` hooks
4. Add route to `Sidebar.tsx` navigation items
5. Add all new text keys to `translations.ts`

```tsx
"use client"
import { useAuth } from "@/lib/auth"
import { useLanguage } from "@/lib/i18n"

export default function NewPage() {
  const { user, loading } = useAuth()
  const { t } = useLanguage()

  if (loading) return <LoadingSpinner />
  if (!user) return null  // AuthProvider handles redirect

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-cliq-textPrimary">{t.newPageTitle}</h1>
    </div>
  )
}
```

## API Integration Pattern

Always use `apiFetch` from `lib/api.ts` — it auto-attaches `Authorization: Bearer` and handles 401 logout.

```tsx
import { apiFetch } from "@/lib/api"

// GET request
const data = await apiFetch<MyResponseType>("/transactions?limit=10")

// POST request
const result = await apiFetch<CreateResponse>("/transactions", {
  method: "POST",
  body: JSON.stringify(payload)
})
```

Never call `fetch` directly — it won't attach auth headers.

## Auth Pattern

```tsx
const { user, token, loading, logout } = useAuth()

// User object shape:
// { id, email, full_name, financial_pathway, preferred_language, is_admin }
```

**Pathway-based rendering:**
```tsx
// Correct: use financial_pathway field
const isNoCreditCardUser = user?.financial_pathway === "NO_CREDIT_CARD"

// Wrong: use cards array length
const isNoCreditCardUser = cards.length === 0  // ❌ DEF-02 was exactly this bug
```

## i18n Pattern

```tsx
const { t, language, setLanguage } = useLanguage()
// language is "en" | "hi" | "kn"

// Usage
<p>{t.dashboardTitle}</p>

// Adding new keys: edit frontend/lib/translations.ts
// Add to ALL THREE languages simultaneously
```

## TypeScript Conventions

- Response types: define interfaces matching backend Pydantic schemas
- Financial amounts: `number` (backend returns JSON numbers), but display with `toLocaleString`
- IDs: `string` (UUIDs from backend)
- Dates: `string` (ISO 8601 from backend — parse with `new Date()` only when needed)

## File Naming
- Pages: `app/<route>/page.tsx`
- Shared components: `components/<ComponentName>.tsx` (PascalCase)
- Utilities: `lib/<name>.ts` (camelCase)

## Common Mistakes to Avoid
- Calling `fetch` instead of `apiFetch`
- Checking `cards.length` for pathway instead of `financial_pathway`
- Hardcoding English strings instead of using `t.*`
- Not adding `__tests__` coverage for new utility functions
- Using `router.push` for auth redirects — use the `AuthProvider` redirect logic
