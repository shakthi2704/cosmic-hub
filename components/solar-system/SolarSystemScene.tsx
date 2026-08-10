'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { PLANET_ORBITAL_ELEMENTS, getPlanetAngleRadians } from '@/lib/orbital-mechanics'

interface PlanetData {
    slug: string
    name: string
    radiusKm: number | null
}

// ─── Scale helpers ──────────────────────────────────────────
// Semi-realistic: real relative sizes/distances, but compressed
// with sqrt so all 8 planets fit comfortably in view.

const ORBIT_BASE = 3.1
const EARTH_RADIUS_KM = 6371

function orbitRadiusFor(semiMajorAxisAU: number): number {
    return ORBIT_BASE * Math.sqrt(semiMajorAxisAU)
}

function planetSizeFor(radiusKm: number | null): number {
    const r = radiusKm ?? EARTH_RADIUS_KM
    return Math.min(1.1, Math.max(0.14, 0.32 * Math.sqrt(r / EARTH_RADIUS_KM)))
}

// ─── Orbit ring ─────────────────────────────────────────────

function OrbitRing({ radius }: { radius: number }) {
    const points = useMemo(() => {
        const pts: [number, number, number][] = []
        for (let i = 0; i <= 128; i++) {
            const t = (i / 128) * Math.PI * 2
            pts.push([Math.cos(t) * radius, 0, Math.sin(t) * radius])
        }
        return pts
    }, [radius])
    return <Line points={points} color="#ffffff" transparent opacity={0.1} lineWidth={1} />
}

// ─── Planet ─────────────────────────────────────────────────

function Planet({
    data,
    angle,
    orbitRadius,
    interactive,
    showLabel,
}: {
    data: PlanetData
    angle: number
    orbitRadius: number
    interactive: boolean
    showLabel: boolean
}) {
    const router = useRouter()
    const meshRef = useRef<THREE.Mesh>(null)
    const [hovered, setHovered] = useState(false)

    const size = planetSizeFor(data.radiusKm)
    const color = PLANET_ORBITAL_ELEMENTS.find(e => e.slug === data.slug)?.displayColor ?? '#4a90d9'
    const x = Math.cos(angle) * orbitRadius
    const z = Math.sin(angle) * orbitRadius

    useFrame((_, delta) => {
        if (meshRef.current) meshRef.current.rotation.y += delta * 0.3
    })

    return (
        <group position={[x, 0, z]}>
            <mesh
                ref={meshRef}
                onClick={interactive ? () => router.push(`/celestial/${data.slug}`) : undefined}
                onPointerOver={interactive ? () => setHovered(true) : undefined}
                onPointerOut={interactive ? () => setHovered(false) : undefined}
                scale={hovered ? 1.15 : 1}
            >
                <sphereGeometry args={[size, 32, 32]} />
                <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
            </mesh>
            {(showLabel || hovered) && (
                <Html distanceFactor={10} style={{ pointerEvents: 'none' }}>
                    <div
                        className={`px-2 py-1 rounded-md whitespace-nowrap -translate-x-1/2 -translate-y-8 transition-colors ${hovered
                            ? 'bg-black/90 border border-white/30 text-white text-xs'
                            : 'bg-black/50 border border-white/10 text-white/70 text-[10px]'
                            }`}
                    >
                        {data.name}
                    </div>
                </Html>
            )}
        </group>
    )
}

// ─── Sun ────────────────────────────────────────────────────

function Sun() {
    const meshRef = useRef<THREE.Mesh>(null)
    useFrame((_, delta) => {
        if (meshRef.current) meshRef.current.rotation.y += delta * 0.05
    })
    return (
        <group>
            <mesh ref={meshRef}>
                <sphereGeometry args={[1.3, 32, 32]} />
                <meshBasicMaterial color="#f5a623" />
            </mesh>
            <pointLight position={[0, 0, 0]} intensity={4} distance={80} decay={1.2} color="#fff4e0" />
        </group>
    )
}

// ─── Scene ──────────────────────────────────────────────────

function Scene({ planets, interactive, autoRotate }: { planets: PlanetData[]; interactive: boolean; autoRotate: boolean }) {
    const now = useMemo(() => new Date(), [])
    const planetsBySlug = useMemo(() => new Map(planets.map(p => [p.slug, p])), [planets])

    return (
        <>
            <ambientLight intensity={0.15} />
            <Stars radius={80} depth={40} count={2000} factor={2.5} fade speed={0.4} />
            <Sun />
            {PLANET_ORBITAL_ELEMENTS.map((el) => {
                const planet = planetsBySlug.get(el.slug)
                if (!planet) return null
                const orbitRadius = orbitRadiusFor(el.semiMajorAxisAU)
                const angle = getPlanetAngleRadians(el, now)
                return (
                    <group key={el.slug}>
                        <OrbitRing radius={orbitRadius} />
                        <Planet data={planet} angle={angle} orbitRadius={orbitRadius} interactive={interactive} showLabel={interactive} />
                    </group>
                )
            })}
            <OrbitControls
                enablePan={false}
                enableZoom={interactive}
                autoRotate={autoRotate}
                autoRotateSpeed={0.4}
                minDistance={4}
                maxDistance={40}
            />
        </>
    )
}

// ─── Public component ───────────────────────────────────────

export default function SolarSystemScene({
    planets,
    variant = 'full',
}: {
    planets: PlanetData[]
    variant?: 'teaser' | 'full'
}) {
    const isTeaser = variant === 'teaser'
    return (
        <div className={isTeaser ? 'h-72 w-full' : 'h-[70vh] w-full'}>
            <Canvas camera={{ position: [0, 8, 14], fov: 50 }}>
                <Scene planets={planets} interactive={!isTeaser} autoRotate={isTeaser} />
            </Canvas>
        </div>
    )
}