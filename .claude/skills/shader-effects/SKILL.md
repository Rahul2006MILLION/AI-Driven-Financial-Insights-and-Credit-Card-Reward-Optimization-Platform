---
name: shader-effects
description: Write custom GLSL vertex and fragment shaders for Three.js/R3F scenes in CLIQ's frontend — gradient sphere shaders, particle field effects, glassmorphism depth shaders, and custom material effects.
---

# GLSL Shader Effects Skill

## When to Activate
- Custom visual material on 3D geometry (gradient, noise, fresnel glow)
- Particle systems with per-particle color/size variation
- Full-screen post-processing effects (chromatic aberration, film grain)
- Canvas-based shader backgrounds (WebGL2 gradient fields)

## GLSL Basics for Three.js

```glsl
// Vertex shader — runs once per vertex
attribute vec3 position;      // vertex position (built-in)
uniform mat4 modelViewMatrix; // model × view transformation
uniform mat4 projectionMatrix; // projection

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// Fragment shader — runs once per pixel fragment
precision mediump float;
uniform float time;
uniform vec3 color;

void main() {
  gl_FragColor = vec4(color, 1.0);
}
```

## Custom ShaderMaterial in Three.js

```tsx
import * as THREE from "three"

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float time;
  uniform vec3 colorA;  // #10B981 emerald
  uniform vec3 colorB;  // #14B8A6 turquoise
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    // Fresnel glow effect
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    float fresnel = pow(1.0 - dot(vNormal, viewDir), 3.0);

    // Animated gradient
    float t = sin(vUv.y * 3.14159 + time * 0.5) * 0.5 + 0.5;
    vec3 color = mix(colorA, colorB, t);

    gl_FragColor = vec4(color + fresnel * 0.4, 0.8);
  }
`

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    time: { value: 0 },
    colorA: { value: new THREE.Color("#10B981") },
    colorB: { value: new THREE.Color("#14B8A6") },
  },
  transparent: true,
  side: THREE.FrontSide,
})

// Update time in animation loop
material.uniforms.time.value = clock.getElapsedTime()
```

## R3F shaderMaterial with `extend`

```tsx
import { extend, useFrame } from "@react-three/fiber"
import { shaderMaterial } from "@react-three/drei"
import * as THREE from "three"

const GlowMaterial = shaderMaterial(
  { time: 0, color: new THREE.Color("#10B981") },
  // vertex shader
  `varying vec2 vUv;
   void main() {
     vUv = uv;
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   }`,
  // fragment shader
  `uniform float time;
   uniform vec3 color;
   varying vec2 vUv;
   void main() {
     float pulse = sin(time * 2.0 + vUv.y * 6.28) * 0.5 + 0.5;
     gl_FragColor = vec4(color * pulse, 0.8);
   }`
)

extend({ GlowMaterial })

// In JSX:
function GlowMesh() {
  const matRef = useRef<any>()
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.time = clock.getElapsedTime()
  })
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <glowMaterial ref={matRef} />
    </mesh>
  )
}
```

## CLIQ Shader Palette
- Emerald: `vec3(0.063, 0.725, 0.506)` = `#10B981`
- Turquoise: `vec3(0.078, 0.722, 0.647)` = `#14B8A6`
- Dark bg: `vec3(0.016, 0.027, 0.027)` = `#040707`

## Performance Rules
- Use `mediump float` precision in fragment shaders (sufficient for visual effects)
- Avoid `textureCube` fetches in tight loops
- Minimize branching (`if` statements) in shaders — prefer `mix()` with step/smoothstep
- Test shader FPS on mobile — complex shaders can drop to 30fps on budget devices

## Common GLSL Utility Functions
```glsl
// Smooth noise approximation
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Smooth interpolation (better than linear)
float smootherstep(float edge0, float edge1, float x) {
  x = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}
```
