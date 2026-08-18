'use client'

import { useMemo } from 'react'

// ─── Data-driven exoplanet illustration ──────────────────────
// Real exoplanets can't be photographed in any meaningful detail —
// they're detected as a tiny dip in starlight, not imaged directly.
// Rather than a generic decorative blob, this generates a visual
// that reflects the planet's *actual* measured data: color from
// real equilibrium temperature, size/rings from real radius,
// rocky vs. gas-giant texture from real size classification.
// Deterministic per planet, so the same exoplanet always looks
// the same across visits.

function seededRandom(seed: number) {
    let s = seed
    return () => {
        s = (s * 1103515245 + 12345) & 0x7fffffff
        return s / 0x7fffffff
    }
}

function hashString(str: string): number {
    let h = 0
    for (let i = 0; i < str.length; i++) {
        h = (h << 5) - h + str.charCodeAt(i)
        h |= 0
    }
    return Math.abs(h)
}

function temperatureColor(eqtK: number | null | undefined): { base: string; shadow: string } {
    if (eqtK == null) return { base: '#6b7280', shadow: '#3f4451' }
    if (eqtK < 200) return { base: '#7dd3fc', shadow: '#0c4a6e' } // icy
    if (eqtK < 320) return { base: '#4ade80', shadow: '#166534' } // temperate
    if (eqtK < 500) return { base: '#fb923c', shadow: '#7c2d12' } // warm
    if (eqtK < 1000) return { base: '#f87171', shadow: '#7f1d1d' } // hot
    return { base: '#dc2626', shadow: '#450a0a' } // scorching
}

function sizeClass(radiusEarthRadii: number | null | undefined): 'rocky' | 'subneptune' | 'giant' {
    if (radiusEarthRadii == null) return 'rocky'
    if (radiusEarthRadii >= 6) return 'giant'
    if (radiusEarthRadii >= 2) return 'subneptune'
    return 'rocky'
}

export default function ExoplanetVisual({
    slug,
    radiusEarthRadii,
    equilibriumTempK,
    size = 96,
}: {
    slug: string
    radiusEarthRadii: number | null | undefined
    equilibriumTempK: number | null | undefined
    size?: number
}) {
    const rand = useMemo(() => seededRandom(hashString(slug)), [slug])
    const { base, shadow } = temperatureColor(equilibriumTempK)
    const cls = sizeClass(radiusEarthRadii)

    // Visual radius: clamped so tiny/huge real radii still render legibly,
    // while still giving a relative size impression across the range.
    const r = radiusEarthRadii == null
        ? 34
        : Math.min(42, Math.max(22, 22 + Math.log2(Math.max(0.3, radiusEarthRadii)) * 8))

    const craters = useMemo(() => {
        if (cls !== 'rocky') return []
        const count = 3 + Math.floor(rand() * 3)
        return Array.from({ length: count }, () => ({
            x: 50 + (rand() - 0.5) * r * 1.2,
            y: 50 + (rand() - 0.5) * r * 1.2,
            cr: 1.5 + rand() * 2.5,
        }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug, cls, r])

    const bands = useMemo(() => {
        if (cls === 'rocky') return []
        const count = 3 + Math.floor(rand() * 2)
        return Array.from({ length: count }, (_, i) => ({
            y: 50 - r + ((i + 1) / (count + 1)) * r * 2,
            opacity: 0.12 + rand() * 0.18,
        }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug, cls, r])

    return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
            <defs>
                <radialGradient id={`glow-${slug}`} cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor={base} stopOpacity="1" />
                    <stop offset="100%" stopColor={shadow} stopOpacity="1" />
                </radialGradient>
                <clipPath id={`clip-${slug}`}>
                    <circle cx="50" cy="50" r={r} />
                </clipPath>
            </defs>

            {/* soft ambient glow */}
            <circle cx="50" cy="50" r={r * 1.35} fill={base} opacity={0.12} />

            {/* planet body */}
            <circle cx="50" cy="50" r={r} fill={`url(#glow-${slug})`} />

            {/* gas-giant bands */}
            {bands.length > 0 && (
                <g clipPath={`url(#clip-${slug})`}>
                    {bands.map((b, i) => (
                        <rect key={i} x={50 - r} y={b.y} width={r * 2} height={r * 0.18} fill="#000" opacity={b.opacity} />
                    ))}
                </g>
            )}

            {/* rocky craters */}
            {craters.map((c, i) => (
                <circle key={i} cx={c.x} cy={c.y} r={c.cr} fill="#000" opacity={0.22} />
            ))}

            {/* ring for giants */}
            {cls === 'giant' && (
                <ellipse
                    cx="50"
                    cy="50"
                    rx={r * 1.7}
                    ry={r * 0.32}
                    fill="none"
                    stroke={base}
                    strokeWidth={1.4}
                    opacity={0.35}
                    transform={`rotate(-18 50 50)`}
                />
            )}
        </svg>
    )
}