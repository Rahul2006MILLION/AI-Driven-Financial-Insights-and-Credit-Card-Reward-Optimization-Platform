---
name: gsap-animation
description: Implement complex timeline animations, orchestrated multi-element sequences, and cinematic transitions using GSAP in CLIQ's Next.js frontend — when Framer Motion's declarative API is insufficient for the required animation complexity.
---

# GSAP Animation Skill

## When to Activate
- Complex multi-element orchestrated timelines (e.g., landing page hero entrance)
- Animations requiring precise sequencing and callbacks
- Performance-critical animations on large element counts
- Scroll-based animations that need GSAP ScrollTrigger (load alongside this skill)

## Official Documentation
https://gsap.com/docs/

## CLIQ Installation Status
GSAP is **NOT currently installed** in `frontend/package.json`. Before using:

```bash
npm install gsap @gsap/react
```

Then import only the plugins you need. Do not install the full GSAP Club bundle without authorization.

## React Integration (`@gsap/react`)

Always use `useGSAP` for cleanup — never `useEffect` directly with GSAP. `useGSAP` handles scope and cleanup automatically.

```tsx
"use client"
import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Scoped to containerRef — all tweens auto-cleaned up on unmount
    gsap.from(".hero-title", {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    })

    gsap.from(".hero-subtitle", {
      y: 24,
      opacity: 0,
      duration: 0.6,
      delay: 0.15,
      ease: "power2.out"
    })
  }, { scope: containerRef })

  return (
    <div ref={containerRef}>
      <h1 className="hero-title text-cliq-textPrimary ...">CLIQ</h1>
      <p className="hero-subtitle text-cliq-textSecondary ...">subtitle</p>
    </div>
  )
}
```

## Orchestrated Timeline

```tsx
useGSAP(() => {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

  tl.from(".card", { y: 32, opacity: 0, stagger: 0.08, duration: 0.5 })
    .from(".metric-value", { scale: 0.8, opacity: 0, duration: 0.4 }, "-=0.2")
    .from(".chart", { opacity: 0, duration: 0.6 }, "-=0.1")
}, { scope: containerRef })
```

## GSAP vs Framer Motion — Decision Guide

| Use Framer Motion | Use GSAP |
| :--- | :--- |
| Card entrance/exit | Landing page hero sequence |
| Button hover/press | Complex staggered reveal (10+ elements) |
| Page transitions | Scroll-driven animations |
| Gesture drag | Physics-based path animations |
| AnimatePresence show/hide | Cross-component coordinated timelines |

## Performance Rules
- Animate `transform` and `opacity` only — GPU-composited properties
- Use `gsap.set()` for initial state (no flash of unstyled content)
- Batch DOM reads before writing: `gsap.matchMedia()` for responsive timelines
- Kill timelines on unmount via `useGSAP` cleanup (automatic)

## Reduced Motion

```tsx
useGSAP(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  if (prefersReduced) return  // skip animation entirely

  gsap.from(".card", { opacity: 0, y: 20, stagger: 0.05, duration: 0.4 })
}, { scope: containerRef })
```

## Common Mistakes
- Using `useEffect` instead of `useGSAP` — causes memory leaks on unmount
- Targeting elements by class globally — always use scoped `containerRef`
- Animating `width`/`height`/`margin` — causes layout reflow, use `scale` instead
- Forgetting to register plugins: `gsap.registerPlugin(ScrollTrigger)` before first use
