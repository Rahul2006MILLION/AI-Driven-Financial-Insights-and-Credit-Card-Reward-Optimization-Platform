---
name: rive-animation
description: Integrate Rive interactive vector animations into CLIQ's React/Next.js frontend — AI orb states, card interaction animations, logo animation, and financial status indicators — using the official Rive React runtime.
---

# Rive Animation Skill

## When to Activate
- Building an AI assistant orb with idle/listening/thinking state machine
- Animating the CLIQ logo
- Card flip or activation animations driven by user interaction
- Financial status indicators with animated states (healthy/warning/critical)

## Official Documentation
https://rive.app/docs/runtimes/react

## Installation

```bash
npm install @rive-app/react-canvas
```

**Important:** Use `@rive-app/react-canvas` (not `@rive-app/react-webgl`) for standard UI animations. WebGL is only for 3D particle-heavy scenes.

## Basic Usage

```tsx
"use client"
import { useRive, useStateMachineInput } from "@rive-app/react-canvas"

export function AIOrb() {
  const { RiveComponent, rive } = useRive({
    src: "/animations/ai-orb.riv",  // placed in frontend/public/animations/
    stateMachines: "OrbStateMachine",
    autoplay: true,
  })

  return (
    <div className="w-24 h-24 relative">
      <RiveComponent />
    </div>
  )
}
```

## State Machine Inputs

```tsx
const { RiveComponent, rive } = useRive({
  src: "/animations/ai-orb.riv",
  stateMachines: "OrbStateMachine",
  autoplay: true,
})

// Boolean input (trigger on/off states)
const isListeningInput = useStateMachineInput(rive, "OrbStateMachine", "isListening")
const isThinkingInput = useStateMachineInput(rive, "OrbStateMachine", "isThinking")

// Trigger input (one-shot event)
const pulseInput = useStateMachineInput(rive, "OrbStateMachine", "pulse")

// Drive state from component state
useEffect(() => {
  if (!isListeningInput || !isThinkingInput) return
  isListeningInput.value = isRecording
  isThinkingInput.value = isProcessing
}, [isRecording, isProcessing, isListeningInput, isThinkingInput])
```

## Number Inputs (for progress/level animations)

```tsx
const healthScoreInput = useStateMachineInput(rive, "HealthMachine", "score")

useEffect(() => {
  if (healthScoreInput) healthScoreInput.value = healthScore  // 0–100
}, [healthScore, healthScoreInput])
```

## File Placement

Place `.riv` files in `frontend/public/animations/` and reference as `/animations/filename.riv`.

## Accessibility

Rive animations can distract or trigger vestibular disorders. Always:

```tsx
import { useReducedMotion } from "framer-motion"

const shouldReduce = useReducedMotion()

// If reduced motion: show a static fallback instead of Rive
if (shouldReduce) {
  return <StaticOrbIcon className="w-24 h-24 text-cliq-emerald" />
}

return <RiveComponent />
```

## Performance Notes
- Rive renders to Canvas2D — GPU-accelerated but separate from the React render tree
- One Rive instance per visible animation (don't mount many off-screen)
- Use `autoplay: false` for below-fold animations; trigger manually with `rive?.play()`
- Unmounting the component automatically cleans up the Rive runtime

## Common Mistakes
- Using `@rive-app/react-webgl` for simple 2D animations — unnecessary overhead
- Not providing `stateMachines` prop when using state machine inputs
- Targeting input names that don't match exactly as defined in Rive editor (case-sensitive)
- Forgetting `"use client"` — Rive requires browser Canvas API
