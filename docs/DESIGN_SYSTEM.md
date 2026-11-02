# CLIQ Design System

**Status:** Canonical — do not redesign the application without separate user authorization.

---

## Brand Identity

CLIQ is a premium fintech platform. Visual direction: cinematic depth, controlled glassmorphism, sophisticated typography, deep dark backgrounds, and intentional whitespace. Financial data must always be readable; decoration never compromises clarity.

---

## Current Implementation — Color Tokens

All colors are defined in `frontend/tailwind.config.ts` as `cliq.*` tokens.

### Core Palette

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `cliq.bg` | `#040707` | Page canvas |
| `cliq.bgSecondary` | `#08100E` | Section backgrounds |
| `cliq.surface` | `rgba(10,22,18,0.65)` | Glass card surfaces |
| `cliq.surfaceHover` | `rgba(16,32,26,0.80)` | Hovered glass surfaces |
| `cliq.border` | `rgba(255,255,255,0.08)` | Subtle borders |
| `cliq.borderGlow` | `#10B981` | Accent/focused borders |

### Accent Colors

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `cliq.cyan` / `cliq.emerald` | `#10B981` | Primary interactive accent |
| `cliq.mint` | `#34D399` | Secondary accent |
| `cliq.turquoise` | `#14B8A6` | Tertiary accent |

### Text Colors

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `cliq.textPrimary` | `#FFFFFF` | Headings, key data |
| `cliq.textSecondary` | `#94A3B8` | Body, secondary labels |
| `cliq.textMuted` | `#64748B` | Tertiary, disabled |

### Semantic Colors

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `cliq.danger` | `#EF4444` | Errors, deficits |
| `cliq.warning` | `#F59E0B` | Warnings, alerts |

---

## Future Brand Direction (Not Yet Implemented)

The following palette is the planned premium rebrand (requires separate user authorization before implementation):

| Name | Hex |
| :--- | :--- |
| Midnight Navy | `#07132F` |
| Deep Blue | `#14234B` |
| Metallic Gold | `#FFC400` |
| White | `#F8FAFC` |
| Muted Blue-Grey | `#A8B5CC` |

Do not apply these colors until the rebrand is explicitly authorized.

---

## Elevation and Shadows

Defined in `tailwind.config.ts`:

| Class | Usage |
| :--- | :--- |
| `shadow-neonCyan` | Cards and CTAs — subtle emerald glow |
| `shadow-cardGlass` | Dashboard cards |
| `shadow-liquidGlass` | Modal surfaces |
| `shadow-liquidGlassHover` | Hover state on interactive glass |

---

## Glass Surfaces

Glass cards follow this pattern:

```tsx
<div className="bg-cliq-surface backdrop-blur-xl border border-cliq-border rounded-2xl shadow-liquidGlass p-6">
  {/* content */}
</div>
```

- Always use `backdrop-blur-xl` for depth
- Border: `border-cliq-border` (low opacity white)
- Never stack multiple glass layers without a visible depth distinction

---

## Typography

- **Font family:** System UI stack (`font-sans`)
- **Headings:** `text-cliq-textPrimary font-semibold`
- **Body:** `text-cliq-textSecondary`
- **Muted labels:** `text-cliq-textMuted text-sm`
- **Financial values:** Always `font-mono` for numeric alignment
- **Currency (₹):** Paired with `text-cliq-emerald font-semibold` for positive, `text-cliq-danger` for negative

---

## Spacing

Standard 8px grid. Tailwind defaults apply. Key card padding: `p-6` (24px). Gaps: `gap-4` (16px) for inline, `gap-6` (24px) for cards.

---

## Radius

| Context | Class |
| :--- | :--- |
| Cards | `rounded-2xl` |
| Buttons | `rounded-xl` |
| Badges | `rounded-full` |
| Inputs | `rounded-lg` |

---

## Buttons

```tsx
// Primary
<button className="bg-cliq-cyan hover:bg-cliq-mint text-cliq-bg font-semibold px-6 py-3 rounded-xl transition-colors">

// Secondary (glass)
<button className="bg-cliq-surface hover:bg-cliq-surfaceHover text-cliq-textPrimary border border-cliq-border px-6 py-3 rounded-xl transition-colors">

// Danger
<button className="bg-cliq-danger/10 hover:bg-cliq-danger/20 text-cliq-danger border border-cliq-danger/30 px-6 py-3 rounded-xl transition-colors">
```

---

## Charts (Recharts)

- Background: transparent (inherits glass card)
- Grid: `stroke="rgba(255,255,255,0.05)"`
- Axis text: `fill="#94A3B8"`
- Primary line/bar: `#10B981`
- Secondary: `#34D399`
- Negative: `#EF4444`
- Tooltips: use `bg-cliq-surface border-cliq-border` styling

---

## Motion Guidelines

- **Library:** Framer Motion (installed)
- **Principle:** Motion serves meaning — entrance, transition, feedback. Never decorative-only.
- **Spring physics:** `type: "spring", stiffness: 300, damping: 30` for cards.
- **Duration:** Subtle transitions 150–300ms; entrance animations 400–600ms.
- **Stagger:** `staggerChildren: 0.05–0.08` for lists.
- **Reduced motion:** Always wrap non-essential animations with `useReducedMotion()` check.

```tsx
import { motion, useReducedMotion } from "framer-motion"
const shouldReduce = useReducedMotion()
const variants = shouldReduce ? {} : { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
```

---

## Empty States

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <IconName className="w-12 h-12 text-cliq-textMuted mb-4" />
  <p className="text-cliq-textSecondary font-medium">{t.emptyStateTitle}</p>
  <p className="text-cliq-textMuted text-sm mt-1">{t.emptyStateSubtitle}</p>
</div>
```

---

## Avoid

- Excessive glow effects (max one neon accent per card)
- Random gradient backgrounds
- Animations on form inputs or financial data
- Low contrast (WCAG AA minimum: 4.5:1 for body text)
- Decorative effects that delay financial data visibility
- Fixed pixel widths — use Tailwind responsive utilities
