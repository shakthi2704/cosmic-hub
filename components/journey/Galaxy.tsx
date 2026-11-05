'use client'

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { chapterLayout } from './chapterLayout'

const STAR_COUNT_DESKTOP = 45000
const STAR_COUNT_MOBILE = 18000

// ─── Building the stars ─────────────────────────────────────
/** Seeded random numbers, so the galaxy looks the same on every load. */
function mulberry32(seed: number) {
    let a = seed
    return () => {
        a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

function buildGalaxy(count: number) {
    const rand = mulberry32(20260801)
    const gauss = () => {
        const u = Math.max(rand(), 1e-6)
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand())
    }

    const position = new Float32Array(count * 3)
    const radius = new Float32Array(count)
    const size = new Float32Array(count)
    const color = new Float32Array(count * 3)

    // Warm, old stars in the middle; whiter-blue young stars outward.
    const warm = new THREE.Color(1.0, 0.84, 0.58)
    const mid = new THREE.Color(1.0, 0.95, 0.86)
    const cool = new THREE.Color(0.78, 0.88, 1.0)
    const c = new THREE.Color()

    for (let i = 0; i < count; i++) {
        const kind = rand()
        let x: number
        let y: number
        let z: number

        if (kind < 0.12) {
            // Central bulge: a rounded clump of old stars.
            const r = Math.abs(gauss()) * 0.11
            const th = rand() * Math.PI * 2
            const ph = Math.acos(2 * rand() - 1)
            x = r * Math.sin(ph) * Math.cos(th)
            y = r * Math.cos(ph) * 0.7
            z = r * Math.sin(ph) * Math.sin(th)
        } else if (kind < 0.2) {
            // Short central bar.
            const along = gauss() * 0.16
            const across = gauss() * 0.04
            const barAngle = 0.9
            x = along * Math.cos(barAngle) - across * Math.sin(barAngle)
            z = along * Math.sin(barAngle) + across * Math.cos(barAngle)
            y = gauss() * 0.025
        } else {
            // Disk: mostly along two spiral arms, with some stars in between.
            const r = Math.min(-Math.log(1 - rand() * 0.96) * 0.3 + 0.05, 1.0)
            let a: number
            if (rand() < 0.82) {
                const arm = rand() < 0.5 ? 0 : 1
                a = arm * Math.PI + 3.2 * Math.log(1 + 7 * r) + gauss() * (0.12 + 0.16 * r)
            } else {
                a = rand() * Math.PI * 2
            }
            x = r * Math.cos(a)
            z = r * Math.sin(a)
            y = gauss() * 0.015 * (1.2 - r * 0.6)
        }

        const r = Math.sqrt(x * x + z * z)
        position.set([x, y, z], i * 3)
        radius[i] = r
        size[i] = 1.0 + Math.pow(rand(), 3) * 2.6

        const t = Math.min(r / 0.9, 1)
        if (t < 0.25) c.lerpColors(warm, mid, t / 0.25)
        else c.lerpColors(mid, cool, (t - 0.25) / 0.75)
        const bright = 0.75 + 0.25 * rand()
        color.set([c.r * bright, c.g * bright, c.b * bright], i * 3)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3))
    geometry.setAttribute('aRadius', new THREE.BufferAttribute(radius, 1))
    geometry.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    geometry.setAttribute('aColor', new THREE.BufferAttribute(color, 3))
    return geometry
}

// ─── Shaders ────────────────────────────────────────────────
const STAR_VERT = /* glsl */ `
attribute float aRadius;
attribute float aSize;
attribute vec3 aColor;
uniform float time;
uniform float uPx;
varying vec3 vColor;
void main() {
  // Slow, slightly differential rotation (illustrative, far faster than the real thing).
  float omega = 0.05 + 0.02 * (1.0 - min(aRadius, 1.0));
  float da = time * omega;
  float c = cos(da);
  float s = sin(da);
  vec3 p = vec3(position.x * c - position.z * s, position.y, position.x * s + position.z * c);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = aSize * uPx;
  vColor = aColor;
}
`

const STAR_FRAG = /* glsl */ `
varying vec3 vColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = 1.0 - smoothstep(0.0, 0.5, d);
  a *= a;
  gl_FragColor = vec4(vColor, a * 0.85);
}
`

const GLOW_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const GLOW_FRAG = /* glsl */ `
varying vec2 vUv;
void main() {
  vec2 q = (vUv - 0.5) * 2.0;
  float r = length(q);
  float g = exp(-pow(r / 0.22, 1.4)) * 0.55 + exp(-r * 4.0) * 0.14;
  g *= 1.0 - smoothstep(0.7, 1.0, r);
  gl_FragColor = vec4(vec3(1.0, 0.82, 0.55), g);
}
`

// ─── Component ──────────────────────────────────────────────
interface GalaxyProps {
    /** Journey value (in steps), updated every frame by useJourney's subscribe(). */
    stRef: MutableRefObject<number>
    /** Chapter number. Overview is at step 2*index, detail at 2*index + 1. */
    index: number
}

export default function Galaxy({ stRef, index }: GalaxyProps) {
    const count = useMemo(
        () =>
            typeof window !== 'undefined' && window.innerWidth < 760
                ? STAR_COUNT_MOBILE
                : STAR_COUNT_DESKTOP,
        []
    )
    const geometry = useMemo(() => buildGalaxy(count), [count])
    useEffect(() => () => geometry.dispose(), [geometry])

    const groupRef = useRef<THREE.Group>(null)
    const tiltRef = useRef<THREE.Group>(null)
    const matRef = useRef<THREE.ShaderMaterial>(null)
    const motion = useRef({ time: 0, px: 0, py: 0, reduced: false })

    useEffect(() => {
        motion.current.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        // Roll is applied last (outermost): it turns the picture, not the disk's spin.
        if (tiltRef.current) tiltRef.current.rotation.order = 'ZXY'
    }, [])

    useFrame((state, delta) => {
        const group = groupRef.current
        const tilt = tiltRef.current
        const mat = matRef.current
        if (!group || !tilt || !mat) return

        const m = motion.current
        const dt = Math.min(delta, 0.05)
        const { width: W, height: H } = state.size
        const L = chapterLayout(stRef.current, index, W, H, { scale: 1.15 })
        group.visible = L.visible
        if (!L.visible) return

        // With reduced motion the galaxy stands still and ignores the pointer.
        if (!m.reduced) {
            m.time += dt
            m.px += (state.pointer.x - m.px) * (1 - Math.exp(-dt * 3))
            m.py += (state.pointer.y - m.py) * (1 - Math.exp(-dt * 3))
        }
        mat.uniforms.time.value = m.time
        mat.uniforms.uPx.value = state.gl.getPixelRatio() * Math.min(Math.max(L.radius / 170, 0.8), 2.4)

        tilt.rotation.x = 0.8 + m.py * 0.12 // how far the disk leans toward us
        tilt.rotation.z = 0.35 + m.px * 0.15

        group.position.set(L.sceneX, L.sceneY, 0)
        group.scale.setScalar(Math.max(L.radius, 0.001))
    })

    return (
        <group ref={groupRef}>
            {/* Soft glow of the core, behind the stars */}
            <mesh position={[0, 0, -1.3]}>
                <planeGeometry args={[2.2, 2.2]} />
                <shaderMaterial
                    vertexShader={GLOW_VERT}
                    fragmentShader={GLOW_FRAG}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <group ref={tiltRef}>
                <points geometry={geometry} frustumCulled={false}>
                    <shaderMaterial
                        ref={matRef}
                        uniforms={{ time: { value: 0 }, uPx: { value: 1.5 } }}
                        vertexShader={STAR_VERT}
                        fragmentShader={STAR_FRAG}
                        transparent
                        depthWrite={false}
                        blending={THREE.NormalBlending}
                    />
                </points>
            </group>
        </group>
    )
}