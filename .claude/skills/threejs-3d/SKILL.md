---
name: threejs-3d
description: Implement 3D scenes, lighting, materials, particle systems, and shader effects using Three.js in CLIQ's Next.js frontend — for landing page 3D environments, financial data visualization in 3D, and premium visual backgrounds.
---

# Three.js 3D Skill

## When to Activate
- Landing page 3D background or environment
- 3D particle system for visual depth
- 3D financial globe or data visualization
- Premium hero section with 3D geometry

## Official Documentation
https://threejs.org/docs/

## Installation

```bash
npm install three @types/three
```

For React integration, load react-three-fiber skill alongside this one.

## Direct Three.js (without R3F) — Canvas Setup

```tsx
"use client"
import { useEffect, useRef } from "react"
import * as THREE from "three"

export function BackgroundScene() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current!
    const width = mount.clientWidth
    const height = mount.clientHeight

    // Scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.z = 5

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    // Geometry
    const geometry = new THREE.IcosahedronGeometry(1, 1)
    const material = new THREE.MeshStandardMaterial({
      color: 0x10B981,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    const pointLight = new THREE.PointLight(0x10B981, 2, 10)
    pointLight.position.set(2, 3, 4)
    scene.add(ambientLight, pointLight)

    // Animation loop
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      mesh.rotation.x += 0.003
      mesh.rotation.y += 0.005
      renderer.render(scene, camera)
    }
    animate()

    // Resize handler
    const handleResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", handleResize)
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none" />
}
```

## Particle System

```tsx
// CLIQ-themed floating particles
const particleCount = 2000
const positions = new Float32Array(particleCount * 3)
for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 20
  positions[i * 3 + 1] = (Math.random() - 0.5) * 20
  positions[i * 3 + 2] = (Math.random() - 0.5) * 20
}

const geometry = new THREE.BufferGeometry()
geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

const material = new THREE.PointsMaterial({
  color: 0x10B981,
  size: 0.04,
  transparent: true,
  opacity: 0.6,
})

const particles = new THREE.Points(geometry, material)
scene.add(particles)
```

## CLIQ Color Palette for 3D
- Primary: `0x10B981` (emerald)
- Secondary: `0x34D399` (mint)
- Background: transparent (renders over `#040707` canvas)
- Emissive: `0x10B981` at low intensity for inner glow

## Performance Rules
- Cap `devicePixelRatio` at 2: `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`
- Dispose of geometry and material on unmount: `geometry.dispose(); material.dispose()`
- Use `BufferGeometry` — never legacy `Geometry`
- Limit draw calls: merge static meshes with `BufferGeometryUtils.mergeGeometries()`
- Avoid per-frame object creation — pre-allocate vectors

## Reduced Motion
```tsx
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
if (prefersReduced) {
  // Render static frame, cancel animation loop
  renderer.render(scene, camera)
  return
}
```
