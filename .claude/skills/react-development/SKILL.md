---
name: react-development
description: Apply React 18 and Next.js 14 App Router best practices — hooks, Server vs Client components, state management, performance optimization, error boundaries, and TypeScript patterns — when building or reviewing CLIQ frontend code.
---

# React Development Skill

## Installed Versions
- React 18.3.1
- Next.js 14.2.4 (App Router, static prerendering)
- TypeScript 5.4.5

## Server vs Client Components

All CLIQ pages are `"use client"` (full client-side rendering with Next.js static prerendering). RSC data fetching is not used — data comes from FastAPI via `apiFetch`.

```tsx
"use client"
import { useState, useEffect } from "react"
```

## Standard Page Pattern

```tsx
"use client"
import { useAuth } from "@/lib/auth"
import { useLanguage } from "@/lib/i18n"
import { apiFetch } from "@/lib/api"

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const [data, setData] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    apiFetch<Transaction[]>("/transactions?limit=50")
      .then(setData)
      .finally(() => setLoading(false))
  }, [user])

  if (authLoading || loading) return <LoadingSpinner />

  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-2xl font-semibold text-cliq-textPrimary mb-6">{t.transactions}</h1>
      {/* ... */}
    </div>
  )
}
```

## Hooks Patterns

### Data fetching
```tsx
const [data, setData] = useState<T | null>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  apiFetch<T>("/endpoint")
    .then(setData)
    .catch(err => setError(err.message))
    .finally(() => setLoading(false))
}, [])
```

### Derived state — use `useMemo`, not state
```tsx
const totalRewards = useMemo(
  () => transactions.reduce((sum, t) => sum + (t.reward_earned ?? 0), 0),
  [transactions]
)
```

### Stable callbacks — use `useCallback`
```tsx
const handleDelete = useCallback(async (id: string) => {
  await apiFetch(`/transactions/${id}`, { method: "DELETE" })
  setTransactions(prev => prev.filter(t => t.id !== id))
}, [])
```

## TypeScript Patterns

```tsx
// Response types match backend Pydantic schemas
interface Transaction {
  id: string                          // UUID
  amount: number                      // Decimal → JSON number
  merchant_name: string
  payment_method: "CREDIT_CARD" | "UPI" | "CASH" | "DEBIT_CARD" | "BANK_TRANSFER" | "OTHER"
  reward_earned: number | null
  created_at: string                  // ISO 8601
}

// Component props — explicit
interface Props {
  transaction: Transaction
  onDelete: (id: string) => Promise<void>
}
```

## Performance

- `React.memo()` for pure display components that receive stable props
- `useCallback` on handlers passed to memoized children
- `useMemo` for aggregations over large arrays
- `useRef` for values that don't trigger renders (timers, DOM refs)
- Paginate large lists server-side — don't load 1000 records client-side

## Error Boundaries

```tsx
class ErrorBoundary extends React.Component<
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

## Next.js App Router APIs

```tsx
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
// NOT: import { useRouter } from "next/router"  ❌
```

## Common Mistakes

- Calling `fetch` instead of `apiFetch` (no auth header)
- Checking `cards.length === 0` for pathway instead of `financial_pathway === "NO_CREDIT_CARD"`
- Not adding translations for hardcoded English strings
- Storing derived values in state instead of `useMemo`
- Using `any` type instead of defining the interface

## Debugging

- React DevTools: component tree inspection and prop values
- Network tab: verify Bearer header in API requests
- Console: `apiFetch` logs 401 errors before logout
- TypeScript: `npx tsc --noEmit` for type errors (app source only)
