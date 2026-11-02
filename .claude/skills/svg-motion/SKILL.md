---
name: svg-motion
description: Animate SVG elements using Framer Motion and CSS for lightweight vector animations in CLIQ — logo animations, icon transitions, financial progress arcs, and inline SVG data visualizations.
---

# SVG Motion Skill

## When to Activate
- Animating the CLIQ logo
- Animated progress arcs or rings for health scores
- Icon transitions (checkmark draw-on, error shake)
- Lightweight decorative SVG without 3D overhead
- Financial gauge or speedometer visualizations

## Framer Motion SVG Animation

```tsx
import { motion } from "framer-motion"

// Animated path draw-on (logo or checkmark)
<motion.path
  d="M10 50 L50 90 L90 10"  // checkmark path
  stroke="#10B981"
  strokeWidth={4}
  fill="none"
  strokeLinecap="round"
  initial={{ pathLength: 0, opacity: 0 }}
  animate={{ pathLength: 1, opacity: 1 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
/>
```

## Financial Health Score Arc

```tsx
function HealthScoreArc({ score }: { score: number }) {
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const strokeDash = (score / 100) * circumference

  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      {/* Background track */}
      <circle
        cx="80" cy="80" r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="12"
      />
      {/* Animated progress arc */}
      <motion.circle
        cx="80" cy="80" r={radius}
        fill="none"
        stroke="#10B981"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - strokeDash }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{ transform: "rotate(-90deg)", transformOrigin: "80px 80px" }}
      />
      {/* Score label */}
      <text x="80" y="88" textAnchor="middle" fill="white" fontSize="28" fontWeight="600">
        {score}
      </text>
    </svg>
  )
}
```

## Logo Entrance Animation

```tsx
// Sequential letter reveal for CLIQ logo text
const letters = ["C", "L", "I", "Q"]
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}
const letterVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400 } }
}

<motion.g variants={containerVariants} initial="hidden" animate="visible">
  {letters.map((letter, i) => (
    <motion.text key={i} x={i * 24} y={32} variants={letterVariants}>
      {letter}
    </motion.text>
  ))}
</motion.g>
```

## CSS SVG Animation (lightweight alternative)

```css
/* Spinning loader ring */
@keyframes spin-arc {
  from { stroke-dashoffset: 251; }
  to { stroke-dashoffset: 0; }
}

.loading-ring {
  stroke-dasharray: 251;
  animation: spin-arc 1.5s ease-in-out infinite;
}
```

## Icon State Transition

```tsx
// Success/error icon swap
<AnimatePresence mode="wait">
  {isSuccess ? (
    <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
      <CheckCircle className="w-6 h-6 text-cliq-emerald" />
    </motion.div>
  ) : (
    <motion.div key="error" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
      <XCircle className="w-6 h-6 text-cliq-danger" />
    </motion.div>
  )}
</AnimatePresence>
```

## When to Use SVG vs Canvas vs CSS
| Use SVG | Use Canvas/WebGL | Use CSS |
| :--- | :--- | :--- |
| Logos, icons, paths | 1000+ particles | Simple fades, slides |
| Financial arcs/gauges | 3D scenes | Button hover states |
| Data chart overlays | Video/image effects | Loading spinners |
| < 100 animated elements | Complex shaders | Skeleton screens |

## Accessibility
- Add `role="img"` and `aria-label` to decorative SVG
- Use `<title>` inside SVG for screen reader descriptions
- Reduce motion: wrap `motion.*` SVG components with `useReducedMotion()` check
