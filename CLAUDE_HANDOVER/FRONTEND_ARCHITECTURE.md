# CLIQ — Frontend Architecture & UI Catalog

This document details the architecture, component hierarchy, page routing, localization engine, and interaction patterns of the Next.js frontend.

---

## 1. Technology Stack & Design System

- **Framework:** Next.js 14.2.4 (App Router)
- **Language:** TypeScript 5+ (Strict Type-checking)
- **Styling:** Tailwind CSS 3.4
- **Visualization:** Recharts 2.12 (Responsive financial graphs, donut charts, and spending radars)
- **Icons:** Lucide React (feather-style clean SVG iconography)
- **Design Aesthetic:** "Liquid Glass"
  - Translucent frosted backdrops (`backdrop-blur-md bg-slate-900/60`).
  - Subtle neon/glow accents (cyan, emerald, violet) indicating financial health states.
  - Border highlights (`border-slate-800/80` with hover state illumination).
  - High-contrast, dark-mode-first readability.
  - Mobile-first responsive grid system.

---

## 2. Complete 20-Page Route Inventory

Every route listed below is implemented, verified, and compiles successfully into static pages (`23/23` Next.js routes including internal paths):

| Route Path | File Location | Primary Purpose & Features | Pathway Behavior | Verified Status |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `frontend/app/page.tsx` | High-impact landing page, product value proposition, dual-pathway introduction, interactive demo teaser. | Universal | **Implemented & Verified** |
| `/login` | `frontend/app/login/page.tsx` | User authentication, email & password validation, session initialization, redirection to dashboard. | Universal | **Implemented & Verified** |
| `/register` | `frontend/app/register/page.tsx` | User signup with financial pathway selector (`CREDIT_CARD` vs `NO_CREDIT_CARD`), language preference, and currency choice. | Universal | **Implemented & Verified** |
| `/onboarding` | `frontend/app/onboarding/page.tsx` | Guided onboarding wizard. Routes cardholders to wallet setup and non-cardholders directly to cash flow & budget setup. | Adaptive | **Implemented & Verified** |
| `/dashboard` | `frontend/app/dashboard/page.tsx` | Central financial intelligence dashboard. Dynamically adapts its widgets, metrics, and banners based on user pathway. | Adaptive | **Implemented & Verified** |
| `/budget` | `frontend/app/budget/page.tsx` | Monthly budget manager, income vs expense tracking, 50/30/20 budget envelope calculator and visualizer. | Universal | **Implemented & Verified** |
| `/learn` | `frontend/app/learn/page.tsx` | CLIQ Learn Academy: 6 modular financial literacy courses, 5 interactive calculators, and quiz evaluations. | Universal | **Implemented & Verified** |
| `/transactions` | `frontend/app/transactions/page.tsx` | Transaction ledger, filterable spend history, manual transaction modal, CSV bank statement uploader. | Adaptive | **Implemented & Verified** |
| `/analytics` | `frontend/app/analytics/page.tsx` | Deep spending analytics, merchant category trends, rewards earned vs missed, month-over-month comparisons. | Adaptive | **Implemented & Verified** |
| `/financial-health` | `frontend/app/financial-health/page.tsx` | Multi-factor financial health score radar, sub-metric gauges, debt-to-income breakdown, actionable recommendations. | Adaptive | **Implemented & Verified** |
| `/cards` | `frontend/app/cards/page.tsx` | Credit card wallet, interactive card stack display, card benefits, annual fee waiver progress bars. | Credit Card Only | **Implemented & Verified** |
| `/cards/new` | `frontend/app/cards/new/page.tsx` | Add credit card form, bank selection, variant customization, fee and billing cycle inputs. | Credit Card Only | **Implemented & Verified** |
| `/cards/compare` | `frontend/app/cards/compare/page.tsx` | Side-by-side comparison of up to 4 credit cards across annual fees, spend waivers, base reward rates, and category perks. | Credit Card Only | **Implemented & Verified** |
| `/optimization` | `frontend/app/optimization/page.tsx` | Real-time purchase advisor: enter amount, merchant, and category to see the highest-yielding payment option. | Credit Card Only | **Implemented & Verified** |
| `/offers` | `frontend/app/offers/page.tsx` | Discovered bank offers catalog, category filters, promo codes, expiry countdowns, terms verification proof. | Universal | **Implemented & Verified** |
| `/admin/offers` | `frontend/app/admin/offers/page.tsx` | Chief Admin Offer Desk: review queue for scraped/partner offers, terms editing, PDF circular uploader, manual offer registration. | Admin Only | **Implemented & Verified** |
| `/documents` | `frontend/app/documents/page.tsx` | Document intelligence interface: upload credit card circulars or bank statements, view extraction status. | Universal | **Implemented & Verified** |
| `/assistant` | `frontend/app/assistant/page.tsx` | CLIQ AI Assistant chat interface: natural language advisory, multilingual support, privacy status indicator. | Universal | **Implemented & Verified** |
| `/settings` | `frontend/app/settings/page.tsx` | User settings, AI consent toggles (`external_ai_enabled`), data minimization rules, audit log viewer. | Universal | **Implemented & Verified** |
| `/profile` | `frontend/app/profile/page.tsx` | User profile details, pathway switching, language switcher, preferred currency settings. | Universal | **Implemented & Verified** |

---

## 3. Core Component Architecture

### 3.1 Adaptive Navigation (`Navbar.tsx` & `Sidebar.tsx`)
- **`Navbar.tsx`:**
  - Displays the CLIQ branding and active financial pathway pill (`Credit Card User` or `No-Credit-Card Mode`).
  - Incorporates the tri-lingual selector (`EN`, `HI`, `KN`) providing instantaneous UI language changes.
  - Houses the user profile dropdown and logout trigger.
- **`Sidebar.tsx`:**
  - Adapts menu items according to `userProfile.financial_pathway`:
    - For `NO_CREDIT_CARD`: Highlights Dashboard, Incomes/Budget, CLIQ Learn, Transactions, Analytics, and Financial Health. Hides or demotes Credit Cards and Reward Optimization.
    - For `CREDIT_CARD`: Shows full portfolio management, Cards Wallet, Card Compare, and Optimization Advisor.
    - For `ADMIN`: Adds the Admin Offer Desk link (`/admin/offers`).

---

## 4. Authentication Lifecycle & Session Synchronization

A critical architectural requirement verified in test suite `__tests__/auth_lifecycle.test.ts`:
1. **Token Storage:** Access tokens are stored in `localStorage` under `token`.
2. **Event Dispatching:** Any login, registration, or logout action dispatches a custom `auth-state-change` DOM event:
   ```typescript
   window.dispatchEvent(new Event("auth-state-change"));
   ```
3. **Cross-Tab & Refresh Resilience:** Layout components listen to `auth-state-change` and the browser `storage` event, ensuring immediate UI sync across tabs without requiring full page reloads.
4. **401 Interception:** When any API call receives HTTP 401 Unauthorized, the stored token is purged, `auth-state-change` is fired, and the user is redirected gracefully to `/login`.

---

## 5. Multilingual Localization Engine (`frontend/lib/translations.ts`)

- **Design:** In-memory dictionary containing full translations for English (`en`), Hindi (`hi`), and Kannada (`kn`).
- **Zero Missing Keys:** Enforced by automated test suite (`__tests__/localization.test.ts`). Every string key in English has an exact equivalent in Hindi and Kannada.
- **Script Integrity:** Native scripts are maintained (Devanagari for Hindi, Kannada script for Kannada).
- **Proper Nouns:** Brand names (HDFC, SBI, ICICI, Swiggy, Zomato, RuPay, Visa, Mastercard) remain identifiable and un-mangled.
- **Storage:** Persisted in `localStorage.getItem("preferred_language") || "en"`.

---

## 6. Numeric Input Design System

Standard HTML numeric inputs frequently suffer from leading-zero bugs (e.g. typing `6` into an input initialized to `0` renders `06`). CLIQ implements a specialized numeric input pattern verified in `__tests__/numeric_input_fix.test.ts`:
- **Empty State:** Inputs initialize as empty strings `""`, never forcing a synthetic `0`.
- **Typing Single Digits:** Typing `6` sets value directly to `"6"`.
- **Decimal Entry:** Typing `12.` preserves the trailing decimal point for continued typing (`12.5`).
- **Clearing:** Backspacing the entire input sets state back to `""` without snapping back to `0`.
- **Form Submission:** Converts non-empty strings to floats or decimals; empty strings convert to `0` or `null` as appropriate.

