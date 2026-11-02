---
name: react-three-fiber
description: Build Three.js 3D scenes as React component trees using React Three Fiber (R3F) and Drei helpers in CLIQ's Next.js frontend — enabling declarative 3D with React state, hooks, and component composition.
---

# React Three Fiber Skill

## When to Activate
- Building 3D scenes that need React state (interactive 3D elements)
- Using 3D alongside React context (auth, i18n, theme)
- Drei helpers: orbit controls, environment maps, floating text, portals

## Official Documentation
- R3F: https://r3f.docs.pmnd.rs/
- Drei: https://drei.docs.pmnd.rs/

## Installation

```bash
npm install three @react-three/fiber @react-three/drei @types/three
```

## Basic Scene (Next.js compatible)

```tsx
"use client"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, MeshWobbleMaterial } from "@react-three/drei"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

function RotatingOrb() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 2]} />
      <MeshWobbleMaterial
        color="#10B981"
        speed={1.5}
        factor={0.3}
        transparent
        opacity={0.8}
        wireframe
      />
    </mesh>
  )
}

export function Scene3D() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}  // cap at 2x pixel ratio
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[2, 3, 4]} color="#10B981" intensity={2} />
        <RotatingOrb />
      </Canvas>
    </div>
  )
}
```

## Drei Helpers

```tsx
import {
  OrbitControls,    // interactive camera rotation (desktop only)
  Float,            // floating/bobbing animation
  MeshDistortMaterial,  // animated distortion shader
  Environment,      // HDRI environment lighting
  Text3D,           // 3D text
  Stars,            // particle star field
} from "@react-three/drei"

// Floating particle field (CLIQ use case)
<Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade />

// Floating element (AI orb bob)
<Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
  <RotatingOrb />
</Float>
```

## State Interaction

```tsx
// Drive 3D state from React state
function ScoreVisualization({ score }: { score: number }) {
  const color = score > 70 ? "#10B981" : score > 40 ? "#F59E0B" : "#EF4444"

  return (
    <mesh>
      <sphereGeometry args={[score / 100, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </mesh>
  )
}
```

## Next.js SSR Safety

Three.js requires `window` — ensure `"use client"` on all R3F components.

```tsx
// For dynamic import to prevent SSR issues with heavy 3D scenes:
import dynamic from "next/dynamic"
const Scene3D = dynamic(() => import("@/components/Scene3D"), { ssr: false })
```

## Performance
- Set `frameloop="demand"` on Canvas if scene is mostly static
- Use `instancedMesh` for many identical objects (particles, etc.)
- `dpr={[1, 2]}` to cap pixel ratio
- Dispose geometries and materials when component unmounts (R3F handles this automatically for JSX primitives)

## Reduced Motion
```tsx
import { useReducedMotion } from "framer-motion"

function AnimatedMesh() {
  const shouldReduce = useReducedMotion()
  useFrame((_, delta) => {
    if (!shouldReduce && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5
    }
  })
}
```
