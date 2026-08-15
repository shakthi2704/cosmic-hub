'use client'

import { Suspense, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Stars, Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import {
    PLANET_ORBITAL_ELEMENTS,
    getPlanetAngleRadians,
    getOrbitProgress,
    formatOrbitDuration,
    SATURN_RING_TEXTURE_URL,
    SUN_TEXTURE_URL,
} from '@/lib/orbital-mechanics'

interface PlanetData {
    slug: string
    name: string
    radiusKm: number | null
}

// ─── Scale helpers ──────────────────────────────────────────

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

// ─── Planet surface (textured, with fallback while loading) ─

function PlanetSurface({ size, textureUrl }: { size: number; textureUrl: string }) {
    const texture = useLoader(THREE.TextureLoader, textureUrl)
    return (
        <mesh>
            <sphereGeometry args={[size, 32, 32]} />
            <meshStandardMaterial map={texture} roughness={0.75} metalness={0.05} />
        </mesh>
    )
}

function PlanetSurfaceFallback({ size, color }: { size: number; color: string }) {
    return (
        <mesh>
            <sphereGeometry args={[size, 24, 24]} />
            <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
        </mesh>
    )
}

// ─── Saturn's ring (procedural canvas texture — no external file) ───

function useSaturnRingTexture() {
    return useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 512
        canvas.height = 64
        const ctx = canvas.getContext('2d')
        if (!ctx) return null

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
        // Banded ring colors approximating Saturn's real ring structure,
        // with alpha gaps standing in for the Cassini/Encke divisions.
        gradient.addColorStop(0.0, 'rgba(210,190,150,0)')
        gradient.addColorStop(0.08, 'rgba(200,180,140,0.55)')
        gradient.addColorStop(0.2, 'rgba(220,200,160,0.75)')
        gradient.addColorStop(0.32, 'rgba(190,170,130,0.35)')
        gradient.addColorStop(0.4, 'rgba(225,205,165,0.8)')
        gradient.addColorStop(0.55, 'rgba(210,190,150,0.7)')
        gradient.addColorStop(0.68, 'rgba(180,160,120,0.3)')
        gradient.addColorStop(0.78, 'rgba(215,195,155,0.6)')
        gradient.addColorStop(0.92, 'rgba(200,180,140,0.35)')
        gradient.addColorStop(1.0, 'rgba(190,170,130,0)')

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const texture = new THREE.CanvasTexture(canvas)
        texture.needsUpdate = true
        return texture
    }, [])
}

function SaturnRing({ size }: { size: number }) {
    const texture = useLoader(THREE.TextureLoader, SATURN_RING_TEXTURE_URL)
    return (
        <mesh rotation={[Math.PI / 2.2, 0, 0]}>
            <ringGeometry args={[size * 1.3, size * 2.2, 64]} />
            <meshBasicMaterial
                map={texture}
                transparent
                opacity={0.9}
                side={THREE.DoubleSide}
                depthWrite={false}
            />
        </mesh>
    )
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
    const groupRef = useRef<THREE.Group>(null)
    const [hovered, setHovered] = useState(false)

    const elements = PLANET_ORBITAL_ELEMENTS.find(e => e.slug === data.slug)
    const size = planetSizeFor(data.radiusKm)
    const color = elements?.displayColor ?? '#4a90d9'
    const textureUrl = elements?.textureUrl
    const x = Math.cos(angle) * orbitRadius
    const z = Math.sin(angle) * orbitRadius

    const orbitInfo = elements ? getOrbitProgress(elements) : null

    useFrame((_, delta) => {
        if (groupRef.current) groupRef.current.rotation.y += delta * 0.3
    })

    return (
        <group position={[x, 0, z]}>
            <group
                ref={groupRef}
                onClick={interactive ? () => router.push(`/celestial/${data.slug}`) : undefined}
                onPointerOver={interactive ? () => setHovered(true) : undefined}
                onPointerOut={interactive ? () => setHovered(false) : undefined}
                scale={hovered ? 1.15 : 1}
            >
                <Suspense fallback={<PlanetSurfaceFallback size={size} color={color} />}>
                    {textureUrl ? (
                        <PlanetSurface size={size} textureUrl={textureUrl} />
                    ) : (
                        <PlanetSurfaceFallback size={size} color={color} />
                    )}
                </Suspense>
                {data.slug === 'saturn' && (
                    <Suspense fallback={null}>
                        <SaturnRing size={size} />
                    </Suspense>
                )}
            </group>
            {(showLabel || hovered) && (
                <Html distanceFactor={10} style={{ pointerEvents: 'none' }}>
                    <div
                        className={`px-2 py-1 rounded-md whitespace-nowrap -translate-x-1/2 -translate-y-8 transition-colors ${hovered
                            ? 'bg-black/90 border border-white/30 text-white text-xs'
                            : 'bg-black/50 border border-white/10 text-white/70 text-[10px]'
                            }`}
                    >
                        <div>{data.name}</div>
                        {hovered && orbitInfo && (
                            <div className="mt-0.5 text-white/50 text-[10px] font-mono">
                                {formatOrbitDuration(orbitInfo.daysRemaining)} left in orbit
                            </div>
                        )}
                    </div>
                </Html>
            )}
        </group>
    )
}

// ─── Sun ────────────────────────────────────────────────────

function SunSurface() {
    const texture = useLoader(THREE.TextureLoader, SUN_TEXTURE_URL)
    return (
        <mesh>
            <sphereGeometry args={[1.3, 32, 32]} />
            <meshBasicMaterial map={texture} />
        </mesh>
    )
}

function SunSurfaceFallback() {
    return (
        <mesh>
            <sphereGeometry args={[1.3, 32, 32]} />
            <meshBasicMaterial color="#f5a623" />
        </mesh>
    )
}

function Sun() {
    const groupRef = useRef<THREE.Group>(null)
    useFrame((_, delta) => {
        if (groupRef.current) groupRef.current.rotation.y += delta * 0.05
    })
    return (
        <group ref={groupRef}>
            <Suspense fallback={<SunSurfaceFallback />}>
                <SunSurface />
            </Suspense>
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
            <ambientLight intensity={0.25} />
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