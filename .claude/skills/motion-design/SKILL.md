---
name: motion-design
description: Implement UI animations and micro-interactions using Framer Motion in the CLIQ React/Next.js frontend — entrance animations, transitions, spring physics, stagger effects, and gesture-based interactions — while maintaining financial data readability and accessibility.
---

# Motion Design Skill (Framer Motion)

## When to Activate
- Adding entrance animations to cards, lists, or dashboard elements
- Implementing page transitions in Next.js App Router
- Building gesture-based interactions (drag, swipe)
- Adding micro-interactions to buttons, toggles, or form feedback

## Official Documentation
https://motion.dev/

## Installed Version
`framer-motion: ^11.2.10` — check `frontend/package.json`

## CLIQ Motion Principles

1. **Motion serves meaning.** Entrance = data arrived. Transition = context changed. Feedback = action registered.
2. **Financial figures never animate** (no count-up on monetary values — users need instant accuracy).
3. **Respect `prefers-reduced-motion`** — wrap non-essential animations.
4. **Spring physics** for organic feel; avoid `ease-in-out` for card entrances.

## Standard Card Entrance

```tsx
import { motion, useReducedMotion } from "framer-motion"

const shouldReduce = useReducedMotion()

const cardVariants = shouldReduce ? {} : {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  }
}

<motion.div
  variants={cardVariants}
  initial="hidden"
  animate="visible"
  className="bg-cliq-surface backdrop-blur-xl ..."
>
```

## Stagger List Animation

```tsx
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } }
}

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 400, damping: 35 } }
}

<motion.ul variants={containerVariants} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.li key={item.id} variants={itemVariants}>
      {/* content */}
    </motion.li>
  ))}
</motion.ul>
```

## Hover / Press Micro-interaction

```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
  className="bg-cliq-cyan text-cliq-bg ..."
>
```

## Page Transitions (App Router)

Wrap page content (not layout) in AnimatePresence:

```tsx
// In each page.tsx
<motion.div
  key="page-key"
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.25 }}
>
  {/* page content */}
</motion.div>
```

## Swipeable Card (Mobile)

```tsx
<motion.div
  drag="x"
  dragConstraints={{ left: -200, right: 0 }}
  onDragEnd={(_, info) => {
    if (info.offset.x < -100) onSwipeLeft()
  }}
>
```

## AnimatePresence for Conditional Content

```tsx
import { AnimatePresence } from "framer-motion"

<AnimatePresence mode="wait">
  {isVisible && (
    <motion.div
      key="content"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      {content}
    </motion.div>
  )}
</AnimatePresence>
```

## Timing Reference

| Use Case | Duration | Type |
| :--- | :--- | :--- |
| Button feedback | 100–150ms | spring |
| Card entrance | 300–500ms | spring |
| Page transition | 200–300ms | tween ease-out |
| List stagger | 60ms per item | spring |
| Tooltip | 150ms | tween |

## Performance Checklist
- [ ] Animate only `opacity`, `transform` (translate/scale/rotate) — never `width`, `height`, `top`, `left`
- [ ] Use `layoutId` for shared element transitions across routes
- [ ] Don't animate more than 10 items simultaneously without virtualization
- [ ] Test on low-end device simulation in Chrome DevTools
- [ ] Verify `useReducedMotion()` disables non-essential motion
