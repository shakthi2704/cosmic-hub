'use client'

import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { chapterLayout } from './chapterLayout'
import { easeOut, seg } from './useJourney'
import TextureBoundary from '../solar-system/TextureBoundary'

// ─── Planet configuration ───────────────────────────────────
type RGB = [number, number, number]

export interface PlanetRingConfig {
    textureUrl: string
    /** Inner and outer edge, in planet radii. */
    inner: number
    outer: number
    /** How far the north pole leans toward the viewer at rest (radians). Also opens the ring. */
    openness: number
    /** Axial tilt, in radians. Rolls the planet and ring together. */
    roll: number
}

export interface PlanetConfig {
    textureUrl: string
    /** Colour grading applied to the texture. */
    tint: RGB
    /** Colour of the sunlight. */
    light: RGB
    /** Colour of the unlit (night) side. */
    ambient: RGB
    /** Strength of the fake surface relief (0 = none). */
    relief: number
    /** Colour of the atmosphere glow and rim. */
    atmosphere: RGB
    /** Size multiplier (e.g. smaller for planets with wide rings). Default 1. */
    scale?: number
    /** Where on the flat map the planet starts facing (0..1 from left). */
    startU?: number
    /** Optional ring system. */
    ring?: PlanetRingConfig
    /** Optional region that lights up on the detail beat (map u, v from top-left). */
    highlight?: { u: number; v: number; radius: number; color: RGB }
}

export const MARS: PlanetConfig = {
    textureUrl: '/textures/2k_mars.jpg',
    tint: [1.08, 0.95, 0.88],
    light: [1.5, 1.32, 1.18],
    ambient: [0.2, 0.09, 0.06],
    relief: 1.9,
    atmosphere: [1.0, 0.64, 0.36],
    startU: 0.4,
    // Approximate centre of Tharsis on a standard map; tune by eye if off-target.
    highlight: { u: 0.2, v: 0.44, radius: 0.5, color: [0.62, 0.012, 0.07] },
}

export const EARTH: PlanetConfig = {
    textureUrl: '/textures/2k_earth_daymap.jpg',
    tint: [1.0, 1.0, 1.0],
    light: [1.45, 1.4, 1.32],
    ambient: [0.05, 0.06, 0.09],
    relief: 0, // oceans would look wrong with brightness-based relief
    atmosphere: [0.35, 0.6, 1.0],
    startU: 0.5,
}

export const SATURN: PlanetConfig = {
    textureUrl: '/textures/2k_saturn.jpg',
    tint: [1.0, 0.97, 0.9],
    light: [1.5, 1.4, 1.22],
    ambient: [0.06, 0.05, 0.04],
    relief: 0,
    atmosphere: [0.95, 0.8, 0.5],
    scale: 0.72,
    startU: 0.5,
    ring: {
        textureUrl: '/textures/2k_saturn_ring_alpha.png',
        // Approximate extent of the main rings (C ring inner edge to A ring outer edge),
        // in planet radii. Visual approximation, not a measurement.
        inner: 1.24,
        outer: 2.27,
        openness: 0.45, // about 26 degrees
        roll: 0.466, // Saturn's axial tilt, 26.73 degrees
    },
}

// ─── Helpers ────────────────────────────────────────────────
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
/** Frame-rate independent easing factor. */
const ease = (rate: number, dt: number) => 1 - Math.exp(-dt * rate)

/** Direction on the sphere for a position on the flat map (u, v from top-left, 0..1). */
function mapDirection(u: number, v: number) {
    const ph = 2 * Math.PI * u
    const th = Math.PI * v
    return new THREE.Vector3(-Math.cos(ph) * Math.sin(th), Math.cos(th), Math.sin(ph) * Math.sin(th))
}
const faceYaw = (d: THREE.Vector3) => Math.atan2(-d.x, d.z)
const faceLat = (d: THREE.Vector3) => Math.asin(d.y)

// ─── Shaders ────────────────────────────────────────────────
const PLANET_VERT = /* glsl */ `
varying vec2 vUv;
varying vec3 vObj;
varying vec3 vN;
void main() {
  vUv = uv;
  vObj = normalize(position);
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const PLANET_FRAG = /* glsl */ `
uniform sampler2D map;
uniform vec2 texel;
uniform vec3 sun;
uniform vec3 tint;
uniform vec3 light;
uniform vec3 ambient;
uniform vec3 rim;
uniform float relief;
uniform vec3 hiDir;
uniform vec3 hiColor;
uniform float hi;
uniform float hiR;
varying vec2 vUv;
varying vec3 vObj;
varying vec3 vN;

float luma(vec2 u) { return dot(texture2D(map, u).rgb, vec3(0.3, 0.6, 0.1)); }

void main() {
  // Map colours are sRGB: convert to linear for lighting.
  vec3 col = pow(texture2D(map, vUv).rgb, vec3(2.2)) * tint;

  // Fake relief from the map's own brightness (not true elevation data).
  vec3 n = normalize(vN);
  vec3 t = normalize(cross(vec3(0.0, 1.0, 0.0), n) + vec3(1e-5));
  vec3 b = cross(n, t);
  float dx = luma(vUv + vec2(texel.x * 2.0, 0.0)) - luma(vUv - vec2(texel.x * 2.0, 0.0));
  float dy = luma(vUv + vec2(0.0, texel.y * 2.0)) - luma(vUv - vec2(0.0, texel.y * 2.0));
  n = normalize(n - (t * dx + b * dy) * relief);

  float diff = max(dot(n, sun), 0.0);
  vec3 lit = col * (light * pow(diff, 0.85) + ambient);

  // Highlighted region with a rough edge, like a territory on a map.
  float d = acos(clamp(dot(normalize(vObj), hiDir), -1.0, 1.0)) + (luma(vUv) - 0.45) * 0.22;
  float m = smoothstep(hiR, hiR - 0.03, d);
  float edge = smoothstep(0.03, 0.0, abs(d - hiR + 0.01));
  vec3 region = hiColor * (0.25 + diff * 1.05) * (0.5 + luma(vUv) * 1.1);
  lit = mix(lit, mix(lit, region, 0.9), m * hi) + vec3(1.0, 0.42, 0.4) * edge * hi * 0.22;

  // Thin glow at the planet's rim.
  float fres = pow(1.0 - max(vN.z, 0.0), 3.2);
  lit += rim * fres * (0.05 + diff * 0.5);

  lit = lit / (lit * 0.3 + 1.0) * 1.3;
  gl_FragColor = vec4(pow(lit, vec3(1.0 / 2.2)), 1.0);
}
`

const ATMO_VERT = /* glsl */ `
varying vec3 vN;
void main() {
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const ATMO_FRAG = /* glsl */ `
uniform vec3 sun;
uniform vec3 tint;
varying vec3 vN;
void main() {
  float z = clamp(-vN.z, 0.0, 1.0);
  float a = smoothstep(0.0, 0.55, z);
  float s = 0.55 + 0.6 * max(dot(-vN * vec3(1.0, 1.0, 0.0), normalize(sun * vec3(1.0, 1.0, 0.0))), 0.0);
  a = pow(a, 2.6) * s * 0.7;
  gl_FragColor = vec4(tint, a);
}
`

// ─── Ring ───────────────────────────────────────────────────
/**
 * A flat ring in the planet's equatorial plane. Lives inside the tilt group,
 * so it leans and rolls together with the planet's axis.
 */
function PlanetRing({ ring }: { ring: PlanetRingConfig }) {
    const gl = useThree((s) => s.gl)
    const source = useLoader(THREE.TextureLoader, ring.textureUrl)

    const texture = useMemo(() => {
        const t = source.clone()
        t.anisotropy = gl.capabilities.getMaxAnisotropy()
        t.needsUpdate = true
        return t
    }, [source, gl])
    useEffect(() => () => texture.dispose(), [texture])

    // RingGeometry maps the image flat across the disc by default. The ring texture is a
    // 1D strip (inner edge to outer edge), so each vertex's U becomes its distance from the centre.
    const geometry = useMemo(() => {
        const geo = new THREE.RingGeometry(ring.inner, ring.outer, 160)
        const pos = geo.attributes.position
        const uv = geo.attributes.uv
        const v = new THREE.Vector3()
        for (let i = 0; i < pos.count; i++) {
            v.fromBufferAttribute(pos, i)
            uv.setXY(i, (v.length() - ring.inner) / (ring.outer - ring.inner), 0.5)
        }
        return geo
    }, [ring.inner, ring.outer])
    useEffect(() => () => geometry.dispose(), [geometry])

    return (
        <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
            <meshBasicMaterial
                map={texture}
                transparent
                opacity={0.95}
                side={THREE.DoubleSide}
                depthWrite={false}
            />
        </mesh>
    )
}

// ─── Component ──────────────────────────────────────────────
interface PlanetProps {
    /** Journey value (in steps), updated every frame by useJourney's subscribe(). */
    stRef: MutableRefObject<number>
    /** Chapter number. Overview is at step 2*index, detail at 2*index + 1. */
    index: number
    config: PlanetConfig
}

export default function Planet({ stRef, index, config }: PlanetProps) {
    const gl = useThree((s) => s.gl)
    const source = useLoader(THREE.TextureLoader, config.textureUrl)

    // Our own copy, so we can set the colour space without touching the shared cache.
    const texture = useMemo(() => {
        const t = source.clone()
        t.colorSpace = THREE.NoColorSpace
        t.anisotropy = gl.capabilities.getMaxAnisotropy()
        t.needsUpdate = true
        return t
    }, [source, gl])
    useEffect(() => () => texture.dispose(), [texture])

    const hl = config.highlight
    const hiDir = useMemo(
        () => (hl ? mapDirection(hl.u, hl.v) : new THREE.Vector3(0, 0, 1)),
        [hl]
    )

    const sun = useMemo(() => new THREE.Vector3(0.62, 0.5, 0.6).normalize(), [])

    const uniforms = useMemo(() => {
        const img = texture.image as { width: number; height: number }
        return {
            map: { value: texture },
            texel: { value: new THREE.Vector2(1 / img.width, 1 / img.height) },
            sun: { value: sun },
            tint: { value: new THREE.Vector3(...config.tint) },
            light: { value: new THREE.Vector3(...config.light) },
            ambient: { value: new THREE.Vector3(...config.ambient) },
            rim: { value: new THREE.Vector3(...config.atmosphere) },
            relief: { value: config.relief },
            hiDir: { value: hiDir },
            hiColor: { value: new THREE.Vector3(...(hl?.color ?? [0, 0, 0])) },
            hi: { value: 0 },
            hiR: { value: hl?.radius ?? 0 },
        }
    }, [texture, config, hl, hiDir, sun])

    const atmoUniforms = useMemo(
        () => ({
            sun: { value: sun },
            tint: { value: new THREE.Vector3(...config.atmosphere) },
        }),
        [sun, config]
    )

    // Planets with rings rest with their pole leaning toward the viewer (so the ring opens up).
    const restPitch = config.ring?.openness ?? 0.16
    const roll = config.ring?.roll ?? 0

    const planetRef = useRef<THREE.Group>(null)
    const tiltRef = useRef<THREE.Group>(null)
    const spinRef = useRef<THREE.Mesh>(null)
    const matRef = useRef<THREE.ShaderMaterial>(null)

    const motion = useRef({
        age: 0,
        yaw: faceYaw(mapDirection(config.startU ?? 0.4, 0.5)),
        pitch: restPitch,
        px: 0,
        py: 0,
        reduced: false,
    })

    useEffect(() => {
        motion.current.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        // Roll is applied last (outermost), so it tilts the whole planet-and-ring system.
        if (tiltRef.current) tiltRef.current.rotation.order = 'ZXY'
    }, [])

    useFrame((state, delta) => {
        const planet = planetRef.current
        const tilt = tiltRef.current
        const spin = spinRef.current
        const mat = matRef.current
        if (!planet || !tilt || !spin || !mat) return

        const m = motion.current
        const dt = Math.min(delta, 0.05)
        const { width: W, height: H } = state.size

        // Position of the journey relative to this planet's overview beat:
        //  b = -1: entering from the right   b = 0: overview (centred)
        //  b = 1: detail (slid left)         b = 2: gone off the left
        // const b = stRef.current - 2 * index
        // const visible = b > -1.001 && b < 2.001
        // planet.visible = visible
        // if (!visible) return

        // m.age += dt

        // const portrait = H > W * 1.05
        // const R0 = (portrait ? W * 0.36 : Math.min(H * 0.3, W * 0.19)) * (config.scale ?? 1)

        // const enter = easeOut(seg(b, -1, 0))
        // const toDetail = seg(b, 0, 1)
        // const exit = seg(b, 1, 2)
        // // Only the very first planet grows from a speck on page load.
        // const intro = index === 0 && !m.reduced ? easeOut(seg(m.age, 0, 1.5)) : 1

        // // Screen position in CSS pixels, origin top-left.
        // const px = portrait ? 0.5 * W : lerp(0.5 * W, 0.36 * W, toDetail)
        // const py = portrait ? lerp(0.4 * H, 0.33 * H, toDetail) : 0.5 * H
        // const radius =
        //     R0 * lerp(0.03, 1, intro) * (1 + toDetail * 0.04) * lerp(0.7, 1, enter) * (1 - exit * 0.35)
        // const cx = px + (1 - enter) * 0.95 * W - exit * 0.9 * W

        // planet.position.set(cx - W / 2, H / 2 - py, 0)
        // planet.scale.setScalar(Math.max(radius, 0.001))

        // Spin while resting or arriving; on the detail beat, turn to face the highlighted region.

        const L = chapterLayout(stRef.current, index, W, H, { scale: config.scale })
        planet.visible = L.visible
        if (!L.visible) return

        m.age += dt
        const { b, toDetail } = L

        // Only the very first planet grows from a speck on page load.
        const intro = index === 0 && !m.reduced ? easeOut(seg(m.age, 0, 1.5)) : 1

        planet.position.set(L.sceneX, L.sceneY, 0)
        planet.scale.setScalar(Math.max(L.radius * lerp(0.03, 1, intro), 0.001))
        if (!hl || b <= 0.02) {
            if (!m.reduced) m.yaw += dt * (0.08 + (1 - intro) * 2.4)
            m.pitch += (restPitch - m.pitch) * ease(1.2, dt)
        } else {
            let d = faceYaw(hiDir) - m.yaw
            d = ((((d + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI // shortest arc
            m.yaw += d * ease(3.6, dt)
            m.pitch += (faceLat(hiDir) - m.pitch) * ease(3.6, dt)
        }

        // Pointer gently tilts the planet (and its ring, which lives in the same group).
        m.px += (state.pointer.x - m.px) * ease(3, dt)
        m.py += (state.pointer.y - m.py) * ease(3, dt)
        tilt.rotation.x = m.pitch - m.py * 0.06
        tilt.rotation.y = m.px * 0.06
        tilt.rotation.z = roll
        spin.rotation.y = m.yaw

        mat.uniforms.hi.value = hl ? seg(toDetail, 0.3, 1) : 0
    })

    return (
        <group ref={planetRef}>
            <group ref={tiltRef}>
                <mesh ref={spinRef}>
                    <sphereGeometry args={[1, 128, 96]} />
                    <shaderMaterial
                        ref={matRef}
                        uniforms={uniforms}
                        vertexShader={PLANET_VERT}
                        fragmentShader={PLANET_FRAG}
                    />
                </mesh>
                {config.ring && (
                    <TextureBoundary fallback={null}>
                        <Suspense fallback={null}>
                            <PlanetRing ring={config.ring} />
                        </Suspense>
                    </TextureBoundary>
                )}
            </group>
            <mesh>
                <sphereGeometry args={[1.14, 64, 48]} />
                <shaderMaterial
                    uniforms={atmoUniforms}
                    vertexShader={ATMO_VERT}
                    fragmentShader={ATMO_FRAG}
                    side={THREE.BackSide}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    )
}