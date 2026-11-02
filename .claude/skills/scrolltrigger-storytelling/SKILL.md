---
name: scrolltrigger-storytelling
description: Build scroll-linked animations, pinned sections, parallax effects, and horizontal scroll galleries using GSAP ScrollTrigger in CLIQ's Next.js frontend — for landing page storytelling, feature reveals, and immersive onboarding flows.
---

# ScrollTrigger Storytelling Skill

## When to Activate
- Landing page scroll narrative (value proposition reveals)
- Pinned feature explanation sections
- Parallax depth effects on dashboard backgrounds
- Horizontal scroll card galleries on mobile

## Official Documentation
https://gsap.com/docs/v3/Plugins/ScrollTrigger/

## Setup (with Lenis if smooth scroll is used)

```tsx
"use client"
import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// If Lenis is active — sync ScrollTrigger to Lenis
// See lenis-smooth-scroll skill for the integration
```

## Basic Scroll-Triggered Reveal

```tsx
useGSAP(() => {
  gsap.from(".feature-card", {
    opacity: 0,
    y: 48,
    stagger: 0.12,
    duration: 0.7,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".features-section",
      start: "top 75%",  // trigger when section top is 75% down viewport
      end: "bottom 25%",
      toggleActions: "play none none reverse"
    }
  })
}, { scope: containerRef })
```

## Pinned Section with Progress

```tsx
useGSAP(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".pin-section",
      pin: true,           // pin element while scrolling through
      start: "top top",
      end: "+=400%",       // scroll distance before unpinning
      scrub: 1             // smooth scrub (1 = 1 second lag)
    }
  })

  tl.to(".step-1", { opacity: 1, x: 0, duration: 1 })
    .to(".step-2", { opacity: 1, y: 0, duration: 1 }, "-=0.3")
    .to(".step-3", { opacity: 1, scale: 1, duration: 1 }, "-=0.3")
}, { scope: containerRef })
```

## Parallax Background

```tsx
useGSAP(() => {
  gsap.to(".parallax-bg", {
    yPercent: -30,
    ease: "none",
    scrollTrigger: {
      trigger: ".parallax-section",
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  })
}, { scope: containerRef })
```

## Next.js App Router Compatibility

ScrollTrigger requires `window` — ensure the component has `"use client"` and the animation runs inside `useGSAP` (not at module level).

For route changes, ScrollTrigger instances must be killed to prevent stale triggers:

```tsx
// useGSAP handles this automatically when scope is provided
// For manual management:
return () => {
  ScrollTrigger.getAll().forEach(st => st.kill())
}
```

## `start` / `end` Reference

```
"top top"       — element top hits viewport top
"top center"    — element top hits viewport center
"top 80%"       — element top hits 80% from top of viewport
"center center" — element center hits viewport center
"+=300"         — 300px of scroll past the start
```

## Reduced Motion

```tsx
useGSAP(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Show all content immediately without scroll animation
    gsap.set(".feature-card", { opacity: 1, y: 0 })
    return
  }
  // ... scroll-triggered animation
}, { scope: containerRef })
```

## Performance Notes
- Limit `scrub` animations to GPU-composited properties (`transform`, `opacity`)
- Use `lazy: false` on ScrollTrigger when element is in initial viewport
- Test on mobile: touch-scroll triggers work differently — test on actual device
- Kill all triggers in cleanup to prevent memory leaks across route navigations
