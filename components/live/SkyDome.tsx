'use client'

import type { PlanetVisibility } from '@/lib/services/sky.service'
import { PLANET_ORBITAL_ELEMENTS } from '@/lib/orbital-mechanics'

function planetColor(name: string): string {
    const match = PLANET_ORBITAL_ELEMENTS.find(
        (p) => p.slug === name.toLowerCase()
    )
    return match?.displayColor ?? '#ffffff'
}

// Converts altitude/azimuth to x/y on the dome.
// Zenith (90° altitude) sits at the center; horizon (0°) sits on the
// outer ring. Azimuth 0=N is drawn at the top, going clockwise.
function toDomeXY(altitude: number, azimuth: number, radius: number) {
    const r = radius * (1 - altitude / 90)
    const angleRad = ((azimuth - 90) * Math.PI) / 180 // rotate so N is up
    return {
        x: 150 + r * Math.cos(angleRad),
        y: 150 + r * Math.sin(angleRad),
    }
}

export default function SkyDome({ planets }: { planets: PlanetVisibility[] }) {
    const radius = 130
    const visible = planets.filter((p) => p.aboveHorizon)

    return (
        <div className="space-card rounded-xl p-6 flex flex-col items-center">
            <svg viewBox="0 0 300 300" className="w-full max-w-sm">
                {/* Altitude rings: horizon, 30°, 60°, zenith */}
                {[0, 30, 60, 90].map((alt) => (
                    <circle
                        key={alt}
                        cx="150"
                        cy="150"
                        r={radius * (1 - alt / 90)}
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="1"
                    />
                ))}

                {/* Compass cross lines */}
                <line x1="150" y1="20" x2="150" y2="280" stroke="rgba(255,255,255,0.06)" />
                <line x1="20" y1="150" x2="280" y2="150" stroke="rgba(255,255,255,0.06)" />

                {/* Compass labels */}
                <text x="150" y="14" textAnchor="middle" className="fill-white/30" fontSize="11" fontFamily="monospace">N</text>
                <text x="150" y="294" textAnchor="middle" className="fill-white/30" fontSize="11" fontFamily="monospace">S</text>
                <text x="8" y="154" textAnchor="middle" className="fill-white/30" fontSize="11" fontFamily="monospace">W</text>
                <text x="292" y="154" textAnchor="middle" className="fill-white/30" fontSize="11" fontFamily="monospace">E</text>

                {/* Zenith marker */}
                <circle cx="150" cy="150" r="2" fill="rgba(255,255,255,0.2)" />

                {/* Planets */}
                {visible.map((p) => {
                    const { x, y } = toDomeXY(p.altitude, p.azimuth, radius)
                    const color = planetColor(p.name)
                    return (
                        <g key={p.name}>
                            <circle cx={x} cy={y} r="6" fill={color} opacity="0.9" />
                            <circle cx={x} cy={y} r="10" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
                            <text
                                x={x}
                                y={y - 14}
                                textAnchor="middle"
                                fontSize="10"
                                fontFamily="monospace"
                                className="fill-white/70"
                            >
                                {p.name}
                            </text>
                        </g>
                    )
                })}
            </svg>

            {visible.length === 0 && (
                <p className="text-white/30 text-sm mt-4">
                    No planets currently above the horizon at this location.
                </p>
            )}

            <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mt-4">
                Center = straight overhead · Edge = horizon
            </p>
        </div>
    )
}