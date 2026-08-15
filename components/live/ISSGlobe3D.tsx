'use client'

import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Stars, Html } from '@react-three/drei'
import * as THREE from 'three'
import type { ISSPosition } from '@/lib/services/live.service'


const EARTH_RADIUS = 4
const ISS_ORBIT_RADIUS = EARTH_RADIUS + 0.9 // altitude ~400km scaled up for visibility
const EARTH_TEXTURE_URL =
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg'

function latLngToXYZ(lat: number, lng: number, radius: number): [number, number, number] {
    const latRad = (lat * Math.PI) / 180
    const lngRad = (lng * Math.PI) / 180
    const x = radius * Math.cos(latRad) * Math.cos(lngRad)
    const y = radius * Math.sin(latRad)
    const z = -radius * Math.cos(latRad) * Math.sin(lngRad)
    return [x, y, z]
}

function Earth() {
    const meshRef = useRef<THREE.Mesh>(null)
    const texture = useLoader(THREE.TextureLoader, EARTH_TEXTURE_URL)

    useFrame((_, delta) => {
        if (meshRef.current) meshRef.current.rotation.y += delta * 0.02
    })

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
            <meshStandardMaterial map={texture} roughness={0.8} metalness={0.05} />
        </mesh>
    )
}

function EarthFallback() {
    // Shown briefly while the texture loads
    return (
        <mesh>
            <sphereGeometry args={[EARTH_RADIUS, 48, 48]} />
            <meshStandardMaterial color="#1a3a5c" roughness={0.9} metalness={0.1} />
        </mesh>
    )
}

function ISSIcon({ color }: { color: string }) {
    // Minimal ISS silhouette: central module + two solar panel arrays
    return (
        <svg viewBox="0 0 64 32" width="34" height="17" style={{ overflow: 'visible' }}>
            {/* left solar array */}
            <rect x="2" y="8" width="16" height="16" fill="none" stroke={color} strokeWidth="1.5" />
            <line x1="2" y1="12" x2="18" y2="12" stroke={color} strokeWidth="1" />
            <line x1="2" y1="16" x2="18" y2="16" stroke={color} strokeWidth="1" />
            <line x1="2" y1="20" x2="18" y2="20" stroke={color} strokeWidth="1" />
            {/* right solar array */}
            <rect x="46" y="8" width="16" height="16" fill="none" stroke={color} strokeWidth="1.5" />
            <line x1="46" y1="12" x2="62" y2="12" stroke={color} strokeWidth="1" />
            <line x1="46" y1="16" x2="62" y2="16" stroke={color} strokeWidth="1" />
            <line x1="46" y1="20" x2="62" y2="20" stroke={color} strokeWidth="1" />
            {/* central truss + module */}
            <line x1="18" y1="16" x2="46" y2="16" stroke={color} strokeWidth="2" />
            <rect x="26" y="12" width="12" height="8" rx="1.5" fill={color} />
        </svg>
    )
}

function ISSMarker({ position, visibility }: { position: ISSPosition; visibility: string }) {
    const [x, y, z] = useMemo(
        () => latLngToXYZ(position.latitude, position.longitude, ISS_ORBIT_RADIUS),
        [position.latitude, position.longitude]
    )
    const color = visibility === 'daylight' ? '#e5bf83' : '#4a90d9'

    return (
        <group position={[x, y, z]}>
            <Html distanceFactor={12} center style={{ pointerEvents: 'none' }}>
                <div className="flex flex-col items-center" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
                    <ISSIcon color={color} />
                    <div className="mt-1 px-2 py-0.5 rounded-md whitespace-nowrap bg-black/70 border border-white/10 text-white/70 text-[10px]">
                        ISS
                    </div>
                </div>
            </Html>
        </group>
    )
}

// function Scene({ position }: { position: ISSPosition }) {
//     return (
//         <>
//             <Stars radius={80} depth={40} count={3000} factor={3} saturation={0} fade speed={0.3} />
//             <ambientLight intensity={0.6} />
//             <directionalLight position={[10, 5, 5]} intensity={1.2} />
//             <Suspense fallback={<EarthFallback />}>
//                 <Earth />
//             </Suspense>
//             <ISSMarker position={position} visibility={position.visibility} />
//             <OrbitControls
//                 enablePan={false}
//                 enableZoom={true}
//                 minDistance={6}
//                 maxDistance={20}
//                 autoRotate={false}
//             />
//         </>
//     )
// }

// function Scene({ position }: { position: ISSPosition }) {
//     const orbitRef = useRef<THREE.Group>(null)

//     useFrame((_, delta) => {
//         if (orbitRef.current) {
//             orbitRef.current.rotation.y += delta * 0.15
//         }
//     })

//     return (
//         <>
//             <Stars
//                 radius={80}
//                 depth={40}
//                 count={3000}
//                 factor={3}
//                 saturation={0}
//                 fade
//                 speed={0.3}
//             />

//             <ambientLight intensity={0.6} />
//             <directionalLight position={[10, 5, 5]} intensity={1.2} />

//             <group ref={orbitRef}>
//                 <Suspense fallback={<EarthFallback />}>
//                     <Earth />
//                 </Suspense>

//                 <ISSMarker
//                     position={position}
//                     visibility={position.visibility}
//                 />
//             </group>

//             <OrbitControls
//                 enablePan={false}
//                 enableZoom={true}
//                 minDistance={6}
//                 maxDistance={20}
//                 autoRotate={false}
//             />
//         </>
//     )
// }
function Scene({ position }: { position: ISSPosition }) {
    const orbitRef = useRef<THREE.Group>(null)

    useFrame((_, delta) => {
        if (orbitRef.current) {
            orbitRef.current.rotation.y += delta * 0.15
        }
    })

    return (
        <>
            <Stars
                radius={80}
                depth={40}
                count={3000}
                factor={3}
                saturation={0}
                fade
                speed={0.3}
            />

            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 5, 5]} intensity={1.2} />

            <Suspense fallback={<EarthFallback />}>
                <Earth />
            </Suspense>

            {/* Only the ISS rotates around Earth */}
            <group ref={orbitRef}>
                <ISSMarker
                    position={position}
                    visibility={position.visibility}
                />
            </group>

            <OrbitControls
                enablePan={false}
                enableZoom={true}
                minDistance={4.5}
                maxDistance={20}
                autoRotate={false}
            />
        </>
    )
}
export default function ISSGlobe3D({ position }: { position: ISSPosition }) {
    return (
        <div className="space-card rounded-xl overflow-hidden">
            <div className="h-[420px] md:h-[520px] relative bg-black">
                <Canvas camera={{ position: [0, 2, 9], fov: 55 }}>
                    <Scene position={position} />
                </Canvas>
                <div className="absolute bottom-3 left-4 text-[10px] font-mono text-white/25 uppercase tracking-widest pointer-events-none">
                    Drag to look around · scroll to zoom
                </div>
            </div>
        </div>
    )
}