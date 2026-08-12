'use client'

import { useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Html } from '@react-three/drei'
import * as THREE from 'three'
import type { PlanetVisibility } from '@/lib/services/sky.service'
import { PLANET_ORBITAL_ELEMENTS } from '@/lib/orbital-mechanics'

const DOME_RADIUS = 40

function planetColor(name: string): string {
    const match = PLANET_ORBITAL_ELEMENTS.find(
        (p) => p.slug === name.toLowerCase()
    )
    return match?.displayColor ?? '#ffffff'
}

function altAzToXYZ(altitude: number, azimuth: number, radius: number): [number, number, number] {
    const altRad = (altitude * Math.PI) / 180
    const azRad = (azimuth * Math.PI) / 180
    const y = radius * Math.sin(altRad)
    const horizontalR = radius * Math.cos(altRad)
    const x = horizontalR * Math.sin(azRad)
    const z = horizontalR * Math.cos(azRad)
    return [x, y, z]
}

function Horizon() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
            <circleGeometry args={[DOME_RADIUS, 64]} />
            <meshBasicMaterial color="#0a0a12" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
    )
}

function CompassMarkers() {
    const marks = [
        { label: 'N', az: 0 },
        { label: 'E', az: 90 },
        { label: 'S', az: 180 },
        { label: 'W', az: 270 },
    ]
    return (
        <>
            {marks.map((m) => {
                const [x, y, z] = altAzToXYZ(2, m.az, DOME_RADIUS - 1)
                return (
                    <Html key={m.label} position={[x, y, z]} center distanceFactor={30}>
                        <div className="text-white/40 text-xs font-mono">{m.label}</div>
                    </Html>
                )
            })}
        </>
    )
}

function SkyPlanet({ planet }: { planet: PlanetVisibility }) {
    const [hovered, setHovered] = useState(false)
    const meshRef = useRef<THREE.Mesh>(null)
    const color = planetColor(planet.name)
    const position = useMemo(
        () => altAzToXYZ(planet.altitude, planet.azimuth, DOME_RADIUS),
        [planet.altitude, planet.azimuth]
    )

    const size = planet.magnitude !== null
        ? Math.min(0.9, Math.max(0.3, 0.9 - planet.magnitude * 0.15))
        : 0.5

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                scale={hovered ? 1.3 : 1}
            >
                <sphereGeometry args={[size, 24, 24]} />
                <meshBasicMaterial color={color} />
            </mesh>
            <mesh scale={2.2}>
                <sphereGeometry args={[size, 16, 16]} />
                <meshBasicMaterial color={color} transparent opacity={0.15} />
            </mesh>
            <Html distanceFactor={30} style={{ pointerEvents: 'none' }}>
                <div
                    className={`px-2 py-1 rounded-md whitespace-nowrap -translate-x-1/2 -translate-y-8 transition-colors ${hovered
                            ? 'bg-black/90 border border-white/30 text-white text-xs'
                            : 'bg-black/50 border border-white/10 text-white/70 text-[10px]'
                        }`}
                >
                    {planet.name}
                    {hovered && (
                        <span className="block text-white/40 text-[10px] mt-0.5">
                            alt {planet.altitude.toFixed(0)}° · az {planet.azimuth.toFixed(0)}°
                        </span>
                    )}
                </div>
            </Html>
        </group>
    )
}

function Scene({ planets }: { planets: PlanetVisibility[] }) {
    const visible = planets.filter((p) => p.aboveHorizon)

    return (
        <>
            <Stars radius={80} depth={40} count={4000} factor={3} saturation={0} fade speed={0.5} />
            <ambientLight intensity={0.3} />
            <Horizon />
            <CompassMarkers />
            {visible.map((p) => (
                <SkyPlanet key={p.name} planet={p} />
            ))}
            <OrbitControls
                enablePan={false}
                enableZoom={true}
                minDistance={5}
                maxDistance={30}
                target={[0, 5, 0]}
            />
        </>
    )
}

export default function SkyDome3D({
    planets,
    sunAltitude,
}: {
    planets: PlanetVisibility[]
    sunAltitude: number
}) {
    const visibleCount = planets.filter((p) => p.aboveHorizon).length

    const skyGradient = useMemo(() => {
        if (sunAltitude > 0) return 'linear-gradient(to bottom, #1a2438 0%, #0a0a12 100%)'
        if (sunAltitude > -6) return 'linear-gradient(to bottom, #2b1f3d 0%, #0a0612 60%, #000000 100%)'
        if (sunAltitude > -18) return 'linear-gradient(to bottom, #12101f 0%, #050508 60%, #000000 100%)'
        return 'linear-gradient(to bottom, #050508 0%, #000000 100%)'
    }, [sunAltitude])

    return (
        <div className="space-card rounded-xl overflow-hidden">
            <div
                className="h-[420px] md:h-[520px] relative"
                style={{ background: skyGradient }}
            >
                <Canvas camera={{ position: [0, 3, 15], fov: 60 }}>
                    <Scene planets={planets} />
                </Canvas>
                <div className="absolute bottom-3 left-4 text-[10px] font-mono text-white/25 uppercase tracking-widest pointer-events-none">
                    Drag to look around · scroll to zoom
                </div>
            </div>
            {visibleCount === 0 && (
                <p className="text-white/30 text-sm text-center py-4 border-t border-white/[0.06]">
                    No planets currently above the horizon at this location.
                </p>
            )}
        </div>
    )
}