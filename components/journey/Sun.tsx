'use client'

import { useEffect, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { chapterLayout } from './chapterLayout'

/** The glow plane extends this many Sun radii from the centre. */
const GLOW_S = 2.6

// ─── Surface shader ─────────────────────────────────────────
const SURFACE_VERT = /* glsl */ `
varying vec3 vObj;
varying vec3 vN;
void main() {
  vObj = normalize(position);
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const SURFACE_FRAG = /* glsl */ `
uniform float time;
varying vec3 vObj;
varying vec3 vN;

float hash(vec3 p) {
  p = 50.0 * fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i + vec3(0.0, 0.0, 0.0)), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z);
}

float fbm3(vec3 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 3; i++) { s += a * vnoise(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; }
  return s / 0.875;
}

float fbm4(vec3 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; }
  return s / 0.9375;
}

void main() {
  vec3 p = normalize(vObj) * 2.0;
  float t = time * 0.06;

  // Churning plasma: a slow warp, big convection cells, and fine granulation.
  float w = fbm3(p * 0.8 + vec3(0.0, t, 0.0));
  vec3 q = p + vec3(w, w * 0.7, -w) * 1.3;
  float cells = fbm4(q * 2.6 + vec3(0.0, t * 1.6, t));
  float gran = fbm3(q * 8.0 + vec3(t * 2.5, 0.0, t * 1.5));
  float h = smoothstep(0.3, 0.78, 0.6 * cells + 0.4 * gran);

  // A few darker patches, loosely like sunspots (illustrative, not real positions).
  float spots = smoothstep(0.66, 0.74, fbm3(q * 1.1 + vec3(3.0, 1.0, 2.0)));
  h *= 1.0 - 0.5 * spots;

  // Colour ramp: deep orange -> orange -> yellow -> near white.
  vec3 c0 = vec3(0.55, 0.10, 0.01);
  vec3 c1 = vec3(0.98, 0.38, 0.04);
  vec3 c2 = vec3(1.00, 0.72, 0.20);
  vec3 c3 = vec3(1.00, 0.93, 0.72);
  vec3 col = mix(c0, c1, smoothstep(0.0, 0.35, h));
  col = mix(col, c2, smoothstep(0.3, 0.7, h));
  col = mix(col, c3, smoothstep(0.65, 1.0, h));

  // Limb darkening: the edge of the disc looks dimmer and redder.
  float mu = clamp(vN.z, 0.0, 1.0);
  col *= 1.0 - 0.62 * (1.0 - mu);
  col = mix(col * vec3(1.0, 0.8, 0.6), col, smoothstep(0.0, 0.6, mu));

  gl_FragColor = vec4(col * 1.15, 1.0);
}
`

// ─── Glow shader ────────────────────────────────────────────
const GLOW_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const GLOW_FRAG = /* glsl */ `
uniform float time;
uniform float S;
varying vec2 vUv;
void main() {
  vec2 q = (vUv - 0.5) * 2.0;
  float r = length(q) * S;               // distance from centre, in Sun radii
  float d = max(r - 1.0, 0.0);
  float g = exp(-d * 3.2) * 0.85 + exp(-d * 1.1) * 0.22;

  // Faint, slowly shifting rays.
  float ang = atan(q.y, q.x);
  g *= 0.88 + 0.12 * sin(ang * 9.0 + time * 0.2) * sin(ang * 5.0 - time * 0.13);

  g *= 1.0 - smoothstep(S * 0.55, S, r);  // fade out before the plane's edge
  vec3 col = mix(vec3(1.0, 0.55, 0.12), vec3(1.0, 0.85, 0.55), exp(-d * 4.0));
  gl_FragColor = vec4(col, g);
}
`

// ─── Component ──────────────────────────────────────────────
interface SunProps {
    /** Journey value (in steps), updated every frame by useJourney's subscribe(). */
    stRef: MutableRefObject<number>
    /** Chapter number. Overview is at step 2*index, detail at 2*index + 1. */
    index: number
}

export default function Sun({ stRef, index }: SunProps) {
    const groupRef = useRef<THREE.Group>(null)
    const surfaceRef = useRef<THREE.ShaderMaterial>(null)
    const glowRef = useRef<THREE.ShaderMaterial>(null)
    const timeRef = useRef(0)
    const reducedRef = useRef(false)

    useEffect(() => {
        reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }, [])

    useFrame((state, delta) => {
        const group = groupRef.current
        const surface = surfaceRef.current
        const glow = glowRef.current
        if (!group || !surface || !glow) return

        const { width: W, height: H } = state.size
        const L = chapterLayout(stRef.current, index, W, H, { scale: 0.85 })
        group.visible = L.visible
        if (!L.visible) return

        // With reduced motion the surface stays still.
        if (!reducedRef.current) timeRef.current += Math.min(delta, 0.05)
        surface.uniforms.time.value = timeRef.current
        glow.uniforms.time.value = timeRef.current

        group.position.set(L.sceneX, L.sceneY, 0)
        group.scale.setScalar(Math.max(L.radius, 0.001))
    })

    return (
        <group ref={groupRef}>
            {/* Glow, behind the Sun */}
            <mesh position={[0, 0, -1.2]}>
                <planeGeometry args={[2 * GLOW_S, 2 * GLOW_S]} />
                <shaderMaterial
                    ref={glowRef}
                    uniforms={{ time: { value: 0 }, S: { value: GLOW_S } }}
                    vertexShader={GLOW_VERT}
                    fragmentShader={GLOW_FRAG}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Surface */}
            <mesh>
                <sphereGeometry args={[1, 96, 64]} />
                <shaderMaterial
                    ref={surfaceRef}
                    uniforms={{ time: { value: 0 } }}
                    vertexShader={SURFACE_VERT}
                    fragmentShader={SURFACE_FRAG}
                />
            </mesh>
        </group>
    )
}