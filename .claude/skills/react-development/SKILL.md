---
name: react-development
description: Apply React 18 and Next.js 14 App Router best practices — hooks, Server vs Client components, state management, performance optimization, error boundaries, and Suspense — when building or reviewing CLIQ frontend code.
---

# React Development Skill

## Installed Versions
- React 18.3.1
- Next.js 14.2.4 (App Router)
- TypeScript 5.4.5

## Server vs Client Components

All CLIQ pages are `"use client"` (full client-side rendering with Next.js static prerendering). The App Router is used for file-based routing, not for RSC data fetching.

```tsx
// Every page and interactive component:
"use client"
import { useState, useEffect } from "react"
```

Layout files (`app/layout.tsx`) are also client components for the provider chain.

## Hooks Patterns

### Data fetching with loading state
```tsx
const [data, setData] = useState<TransactionResponse[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  apiFetch<TransactionResponse[]>("/transactions")
    .then(setData)
    .catch(err => setError(err.message))
    .finally(() => setLoading(false))
}, [])
```

### Derived state — prefer `useMemo` over storing computed values
```tsx
const totalRewards = useMemo(
  () => transactions.reduce((sum, t) => sum + (t.reward_earned || 0), 0),
  [transactions]
)
```

### Callback memoization
```tsx
const handleDelete = useCallback(async (id: string) => {
  await apiFetch(`/transactions/${id}`, { method: "DELETE" })
  setTransactions(prev => prev.filter(t => t.id !== id))
}, [])  // empty deps — apiFetch is stable
```

## Component Architecture

```
Page (route)          — data fetching, state orchestration
  └── SectionCard     — layout, section title
        └── DataTable — display, sorting, pagination
              └── Row — individual record
```

- Pages own state; leaf components are pure/display
- Props down, callbacks up — no global state library needed at current scale
- Shared logic → custom hook in `lib/` (not a component)

## Custom Hooks Pattern

```tsx
// lib/useTransactions.ts
export function useTransactions(limit = 20) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<Transaction[]>(`/transactions?limit=${limit}`)
      .then(setTransactions)
      .finally(() => setLoading(false))
  }, [limit])

  return { transactions, loading, refresh: () => { /* re-fetch */ } }
}
```

## Error Handling

```tsx
// Error boundary for page sections (class component required)
class SectionErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
```

## TypeScript Patterns

```tsx
// API response types — match backend Pydantic schemas
interface Transaction {
  id: string
  amount: number        // Decimal comes as JSON number
  merchant_name: string
  category_id: string
  payment_method: "CREDIT_CARD" | "UPI" | "CASH" | "DEBIT_CARD" | "BANK_TRANSFER" | "OTHER"
  reward_earned: number | null
  created_at: string    // ISO 8601
}

// Component props — explicit, not inferred
interface TransactionRowProps {
  transaction: Transaction
  onDelete: (id: string) => void
}
```

## Performance

- `React.memo()` for pure list items that re-render frequently
- `useCallback` for handlers passed to memoized children
- `useMemo` for expensive derivations (never for simple objects/arrays)
- Avoid `useState` for values that don't affect rendering — use `useRef`
- Large lists: implement pagination (backend-driven) rather than frontend filtering

## Next.js App Router Specifics

- `usePathname()` and `useRouter()` from `next/navigation` (not `next/router`)
- `Link` from `next/link` for navigation
- `Image` from `next/image` for optimized images
- `metadata` export only valid in Server Components — not applicable in CLIQ's client-only pages

## Testing Hook
New hooks should have test coverage in `frontend/__tests__/` using the Node native test runner pattern established in the existing test files.
