---
name: cliq-design-system
description: Apply CLIQ's design system — color tokens, glass surfaces, typography, spacing, shadow utilities, motion guidelines, and brand rules — when building or reviewing frontend UI components, pages, or layouts for the CLIQ platform.
---

# CLIQ Design System Skill

## When to Activate
- Building or modifying any frontend component or page in `frontend/`
- Reviewing UI code for brand consistency
- Creating new cards, forms, tables, charts, or navigation elements
- Advising on color, typography, or layout choices

## Design System Source
Full specification: `docs/DESIGN_SYSTEM.md`
Color tokens: `frontend/tailwind.config.ts` — the `cliq.*` namespace

## Core Principles
1. **Financial data is primary.** Every decoration must yield to legibility of numbers.
2. **Dark canvas, controlled glow.** One emerald accent per card maximum.
3. **Glass surfaces require `backdrop-blur-xl`.** Always.
4. **Framer Motion for entrance and transitions.** Respect `prefers-reduced-motion`.
5. **All new text keys** must exist in `frontend/lib/translations.ts` for EN/HI/KN.

## Color Token Usage

```tsx
// Correct: use Tailwind cliq.* tokens
<div className="bg-cliq-bg text-cliq-textPrimary" />
<span className="text-cliq-emerald" />  // positive monetary values
<span className="text-cliq-danger" />   // deficits, errors

// Wrong: hardcode hex values in component files
<div style={{ backgroundColor: "#040707" }} />  // ❌
```

## Glass Card Pattern

```tsx
<div className="bg-cliq-surface backdrop-blur-xl border border-cliq-border rounded-2xl shadow-liquidGlass p-6">
  <h3 className="text-cliq-textPrimary font-semibold text-lg mb-2">{title}</h3>
  <p className="text-cliq-textSecondary text-sm">{description}</p>
</div>
```

## Financial Values

```tsx
// Monetary amount — always font-mono for alignment
<span className={`font-mono font-semibold ${amount >= 0 ? 'text-cliq-emerald' : 'text-cliq-danger'}`}>
  ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
</span>
```

## Button Variants

```tsx
// Primary action
<button className="bg-cliq-cyan hover:bg-cliq-mint text-cliq-bg font-semibold px-6 py-3 rounded-xl transition-colors duration-150">

// Secondary (glass)
<button className="bg-cliq-surface hover:bg-cliq-surfaceHover text-cliq-textPrimary border border-cliq-border px-6 py-3 rounded-xl transition-colors duration-150">
```

## Motion (Framer Motion)

```tsx
import { motion, useReducedMotion } from "framer-motion"

const shouldReduce = useReducedMotion()
const cardVariants = shouldReduce ? {} : {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
}

<motion.div variants={cardVariants} initial="hidden" animate="visible">
```

## Avoid
- More than one neon glow on a single card
- Backdrop blur on non-surface elements (inputs, tables)
- Animations on financial figures (distract from data accuracy)
- Purple (`#A78BFA`) or cyan (`#00F5FF`) — old palette, replaced by emerald system
- Hardcoded dark colors that clash with the `#040707` canvas

## Checklist Before Submitting UI Code
- [ ] All colors use `cliq.*` Tailwind tokens
- [ ] New text has EN/HI/KN translation keys
- [ ] Monetary values use `font-mono` + conditional `text-cliq-emerald`/`text-cliq-danger`
- [ ] Cards use `bg-cliq-surface backdrop-blur-xl border border-cliq-border rounded-2xl`
- [ ] Animations wrapped with `useReducedMotion()` check
- [ ] `npm run build` produces zero TypeScript errors
