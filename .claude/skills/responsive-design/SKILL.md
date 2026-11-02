---
name: responsive-design
description: Apply CLIQ's desktop/mobile responsive strategy using Tailwind CSS breakpoints — sidebar vs bottom navigation, single vs multi-column layouts, touch targets, and mobile-specific interaction patterns — when building or reviewing any CLIQ frontend screen.
---

# Responsive Design Skill

## CLIQ Strategy
Full specification: `docs/DESKTOP_MOBILE_STRATEGY.md`

Two experiences: Desktop (≥1024px `lg:`) = sidebar + multi-column. Mobile (<1024px) = bottom nav + single column.

## Breakpoint Reference

| Prefix | Min Width | Context |
| :--- | :--- | :--- |
| (none) | 0px | Mobile portrait — default |
| `sm:` | 640px | Mobile landscape |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Desktop — sidebar appears |
| `xl:` | 1280px | Wide desktop |

## Navigation Switch

```tsx
// Navbar.tsx — bottom tabs, hidden on desktop
<nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-cliq-bgSecondary ...">

// Sidebar.tsx — hidden on mobile
<aside className="hidden lg:flex lg:flex-col w-64 ...">
```

## Layout Grid Pattern

```tsx
// Single column mobile, two column desktop
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

// Three column only on wide desktop
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

// Sidebar + content layout
<div className="flex flex-col lg:flex-row gap-6">
  <aside className="w-full lg:w-64 flex-shrink-0">
  <main className="flex-1 min-w-0">
```

## Touch Target Sizes

Mobile touch targets must be minimum 44×44px (WCAG 2.5.5):

```tsx
// Button: min h-11 (44px)
<button className="h-11 px-6 rounded-xl ...">

// Icon button: min w-11 h-11
<button className="w-11 h-11 flex items-center justify-center rounded-lg ...">
```

## Typography Scaling

```tsx
// Heading scales with viewport
<h1 className="text-2xl lg:text-4xl font-semibold text-cliq-textPrimary">

// Body stays readable on mobile
<p className="text-sm lg:text-base text-cliq-textSecondary">
```

## Card Padding

```tsx
<div className="p-4 lg:p-6 rounded-2xl bg-cliq-surface ...">
```

## Table vs List Adaptation

On mobile, data tables become scrollable card lists:

```tsx
{/* Desktop: full table */}
<div className="hidden lg:block overflow-x-auto">
  <table className="w-full">...</table>
</div>

{/* Mobile: card list */}
<div className="lg:hidden space-y-3">
  {transactions.map(t => <TransactionCard key={t.id} transaction={t} />)}
</div>
```

## Chart Sizing

Recharts charts need explicit `height` — use responsive container:

```tsx
import { ResponsiveContainer, LineChart } from "recharts"

<ResponsiveContainer width="100%" height={200}>  {/* reduced on mobile */}
  <LineChart data={data}>
```

For desktop: `height={320}`, for mobile: `height={200}` — achieved via:

```tsx
// Use CSS custom properties driven by Tailwind
<div className="h-[200px] lg:h-[320px]">
  <ResponsiveContainer width="100%" height="100%">
```

## Mobile-Specific Patterns

```tsx
// Swipeable card carousel (mobile only)
<div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 lg:grid lg:grid-cols-3 lg:overflow-x-visible">
  {cards.map(card => (
    <div key={card.id} className="snap-center flex-shrink-0 w-[85vw] lg:w-auto">
      <CreditCard card={card} />
    </div>
  ))}
</div>
```

## Avoid

- `position: fixed` without checking mobile viewport behavior
- Horizontal overflow without `overflow-x-auto` containment
- Font sizes below `text-sm` (14px) on mobile
- Interactive elements inside scroll containers without adequate hit areas
- Hover-only tooltips (not accessible on touch)
