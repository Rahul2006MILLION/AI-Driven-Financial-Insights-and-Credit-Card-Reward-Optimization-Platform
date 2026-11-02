---
name: accessibility
description: Ensure CLIQ frontend components meet WCAG 2.1 AA accessibility standards — keyboard navigation, screen reader labels, focus management, color contrast, reduced motion, form labeling, and financial data accessibility.
---

# Accessibility Skill

## Standards Target
WCAG 2.1 Level AA — minimum requirement for a financial platform handling sensitive data.

## Color Contrast

CLIQ dark theme must maintain 4.5:1 minimum for body text:
- `#FFFFFF` on `#040707` = 21:1 ✅
- `#94A3B8` (`cliq.textSecondary`) on `#040707` = ~7:1 ✅
- `#64748B` (`cliq.textMuted`) on `#040707` = ~4.5:1 — borderline, use only for non-critical text
- `#10B981` on `#040707` = ~7:1 ✅

Never use `cliq.textMuted` for financial values or error messages.

## Keyboard Navigation

```tsx
// Focus ring: always visible on keyboard focus, never on click
<button className="focus:outline-none focus-visible:ring-2 focus-visible:ring-cliq-emerald focus-visible:ring-offset-2 focus-visible:ring-offset-cliq-bg">
```

All interactive elements must be reachable with Tab. Test with keyboard only:
1. Tab through all interactive elements
2. Enter/Space activates buttons and links
3. Arrow keys navigate within compound widgets (tabs, dropdowns)
4. Escape closes modals and dropdowns

## Screen Reader Labels

```tsx
// Icon-only buttons require aria-label
<button aria-label="Delete transaction" onClick={handleDelete}>
  <Trash2 className="w-4 h-4" />
</button>

// Financial values — provide context
<span aria-label={`₹${amount.toLocaleString('en-IN')} cashback earned`}>
  ₹{amount.toLocaleString('en-IN')}
</span>

// Status badges
<span role="status" aria-live="polite" className="text-cliq-emerald">
  {t.healthStatusExcellent}
</span>
```

## Form Accessibility

```tsx
// Always pair label with input via htmlFor/id
<label htmlFor="amount" className="text-cliq-textSecondary text-sm">
  {t.transactionAmount}
</label>
<input
  id="amount"
  type="text"
  aria-describedby="amount-hint"
  aria-invalid={!!errors.amount}
  aria-errormessage="amount-error"
/>
{errors.amount && (
  <span id="amount-error" role="alert" className="text-cliq-danger text-xs">
    {errors.amount}
  </span>
)}
<span id="amount-hint" className="text-cliq-textMuted text-xs">
  {t.amountHint}
</span>
```

## Reduced Motion

```tsx
import { useReducedMotion } from "framer-motion"

function AnimatedCard({ children }) {
  const shouldReduce = useReducedMotion()

  if (shouldReduce) {
    return <div>{children}</div>  // no animation
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      {children}
    </motion.div>
  )
}
```

## Modal / Dialog Accessibility

```tsx
// Focus trap inside modal
import { useEffect, useRef } from "react"

function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus()
      // Close on Escape
      const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose()
      window.addEventListener("keydown", handler)
      return () => window.removeEventListener("keydown", handler)
    }
  }, [isOpen, onClose])

  return isOpen ? (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
      className="focus:outline-none"
    >
      {children}
    </div>
  ) : null
}
```

## Financial Data Table Accessibility

```tsx
<table role="table" aria-label={t.transactionHistory}>
  <caption className="sr-only">{t.transactionHistoryCaption}</caption>
  <thead>
    <tr>
      <th scope="col">{t.date}</th>
      <th scope="col">{t.merchant}</th>
      <th scope="col" className="text-right">{t.amount}</th>
    </tr>
  </thead>
```

## Live Regions for Dynamic Updates

```tsx
// Announce loading states and results to screen readers
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {loading ? t.loadingTransactions : t.transactionsLoaded.replace("{n}", String(count))}
</div>
```

## Multilingual Accessibility

CLIQ supports Hindi and Kannada — ensure `lang` attribute updates when language changes:

```tsx
// In i18n.tsx LanguageProvider
useEffect(() => {
  document.documentElement.lang = language === "en" ? "en" : language === "hi" ? "hi" : "kn"
}, [language])
```

## Checklist Before Submitting
- [ ] All icon-only buttons have `aria-label`
- [ ] All form inputs have visible `<label>` elements
- [ ] Error messages use `role="alert"` or `aria-errormessage`
- [ ] Color is not the only indicator of status (add icon or text)
- [ ] All animations respect `useReducedMotion()`
- [ ] Keyboard navigation works through all interactive elements
- [ ] Color contrast meets 4.5:1 for body text
