# CLIQ Desktop & Mobile Strategy

**Principle:** Two purpose-designed experiences sharing all APIs, business logic, authentication, financial calculations, and security. The mobile experience is not a scaled-down desktop — it is purpose-built for touch, thumb reach, and glanceable financial awareness.

---

## Shared Foundation

Both experiences share without duplication:
- FastAPI backend (single codebase)
- All 61 API endpoints
- SQLAlchemy models and PostgreSQL database
- JWT authentication and session management
- Privacy Gateway and AI consent
- RewardOptimizationEngine, FinancialHealthEngine, and all deterministic calculators
- Trilingual i18n translation dictionary

---

## Desktop Experience (≥1024px — `lg:` breakpoint)

**Design direction:** Financial Intelligence Command Centre.

### Layout
- Persistent left sidebar (`components/Sidebar.tsx`) — always visible, never hidden behind a hamburger
- Content area takes full remaining width
- Multi-column grid layouts (2–3 columns on analytics, comparison views)
- Full data tables with sortable columns

### Key Screens
| Screen | Desktop Behaviour |
| :--- | :--- |
| Dashboard | 3-column: health gauge + recent transactions + quick actions |
| Analytics | 2-column: chart left, breakdown right |
| Transactions | Full table with inline filters, pagination |
| Cards | Side-by-side card stack with detail panel |
| AI Assistant | Wide chat with context sidebar |
| Financial Health | Radar chart + full metric breakdown |

### Interactions
- Keyboard navigation with visible focus rings
- Hover states on all interactive elements
- Tooltips for financial terminology
- Keyboard shortcut hints on primary actions

---

## Mobile Experience (<1024px — default, `md:` override)

**Design direction:** Premium Personal Finance Companion.

### Layout
- Bottom navigation bar (`components/Navbar.tsx`) — thumb-zone primary navigation (5 tabs max)
- No persistent sidebar — sheet/drawer pattern for secondary navigation
- Full-width single column layouts
- Cards use swipe gestures (Framer Motion `drag="x"`)

### Key Screens
| Screen | Mobile Behaviour |
| :--- | :--- |
| Dashboard | Scrollable single column, card carousel swipeable |
| Transactions | Infinite-scroll list with pull-to-refresh |
| AI Assistant | Full-screen immersive chat |
| Financial Health | Compact gauge + stacked pillars |
| Cards | Horizontal swipeable card stack |

### Interactions
- Touch target minimum: 44×44px (WCAG 2.5.5)
- Swipe to dismiss, swipe to reveal actions
- Bottom sheet modals instead of dropdowns
- No hover states (touch-only)
- Simplified analytics (summary numbers rather than full charts)

---

## Implementation in Next.js

### Responsive Classes
All responsive behaviour uses Tailwind CSS breakpoints — no runtime JS detection:

```tsx
// Example: sidebar hidden on mobile, visible on desktop
<aside className="hidden lg:flex lg:flex-col lg:w-64 ...">

// Example: single column mobile, two column desktop
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
```

### Component-Level Adaptation
Components receive `className` props for layout context. No separate `MobileComponent` / `DesktopComponent` split — one component, responsive styles.

### Navigation Switch
```tsx
// In layout.tsx
<Navbar />           {/* Bottom bar — hides on lg: */}
<Sidebar />          {/* Left panel — hides below lg: */}
```

### Breakpoints

| Tailwind | px | Context |
| :--- | :--- | :--- |
| (default) | 0+ | Mobile portrait |
| `sm:` | 640+ | Mobile landscape |
| `md:` | 768+ | Tablet |
| `lg:` | 1024+ | Desktop — sidebar visible |
| `xl:` | 1280+ | Wide desktop — multi-column |

---

## Do Not
- Create a separate `/mobile` route tree
- Duplicate any backend logic for mobile
- Use `navigator.userAgent` for device detection
- Build React Native or Capacitor wrappers (out of scope)
- Reduce font size below 14px on mobile
