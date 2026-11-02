---
name: lenis-smooth-scroll
description: Implement smooth scroll with Lenis and synchronize it with GSAP ScrollTrigger in CLIQ's Next.js frontend — only when smooth scrolling is explicitly required for a landing page or immersive scroll narrative, not for standard application screens.
---

# Lenis Smooth Scroll Skill

## When to Activate
- Landing page (`app/page.tsx`) with scroll-based storytelling
- Immersive onboarding flow with scroll narrative
- Feature showcase sections that benefit from eased scroll physics

## When NOT to Activate
- Dashboard, transactions, or any data-heavy screen (smooth scroll harms usability on form-heavy pages)
- Mobile-only contexts (native scroll inertia is already smooth on iOS/Android)

## Official Documentation
https://lenis.darkroom.engineering/

## Installation

```bash
npm install lenis
```

## Next.js App Router Setup

Create a dedicated Lenis provider that wraps only the pages that need smooth scroll:

```tsx
// components/SmoothScrollProvider.tsx
"use client"
import { useEffect, useRef } from "react"
import Lenis from "lenis"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenisRef.current = lenis

    // Sync GSAP ScrollTrigger with Lenis scroll position
    lenis.on("scroll", ScrollTrigger.update)

    // Drive Lenis from GSAP ticker for smooth sync
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return <>{children}</>
}
```

**Use sparingly** — only wrap landing page, not the root layout:

```tsx
// app/page.tsx (landing page only)
import SmoothScrollProvider from "@/components/SmoothScrollProvider"

export default function LandingPage() {
  return (
    <SmoothScrollProvider>
      <HeroSection />
      <FeaturesSection />
      {/* ... */}
    </SmoothScrollProvider>
  )
}
```

## Lenis Configuration Reference

```tsx
new Lenis({
  duration: 1.2,       // scroll animation duration (seconds)
  smoothWheel: true,   // smooth mouse wheel
  smoothTouch: false,  // disable on touch — native is better
  wheelMultiplier: 1,  // scroll speed multiplier
  touchMultiplier: 2,  // touch scroll multiplier
})
```

## Anchor Scrolling with Lenis

```tsx
// Programmatic scroll to element
lenis.scrollTo("#section-id", { offset: -80, duration: 1.5 })

// Or via ref
lenis.scrollTo(elementRef.current, { offset: -80 })
```

## Reduced Motion

```tsx
useEffect(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  if (prefersReduced) return  // skip Lenis entirely — native scroll remains

  // ... Lenis initialization
}, [])
```

## Common Mistakes
- Wrapping the root layout with Lenis — this breaks scroll on auth forms, data tables, and the dashboard
- Forgetting `lenis.destroy()` in cleanup — causes scroll state pollution on route change
- Not syncing with GSAP ticker — causes ScrollTrigger desync artifacts
- Using Lenis on mobile touch — native inertia feels better; `smoothTouch: false` is the correct default
