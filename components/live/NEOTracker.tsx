'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, AlertTriangle, Gauge, Ruler, MoveHorizontal } from 'lucide-react'
import type { NearEarthObject } from '@/lib/services/live.service'

type Status = 'loading' | 'error' | 'ready'

function formatDateLabel(ymd: string): string {
    const date = new Date(`${ymd}T00:00:00Z`)
    return date.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC',
    })
}
// ─── Procedural asteroid illustration ────────────────────────
// No real imagery exists for the vast majority of tracked NEOs —
// only a handful of famous ones (Bennu, Ryugu...) have actual photos.
// This generates a deterministic irregular-rock silhouette from the
// asteroid's own ID, so each one looks consistent across visits
// without claiming to be a real photograph.

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

function AsteroidIcon({ seed, hazardous }: { seed: string; hazardous: boolean }) {
    const rand = seededRandom(hashString(seed))
    const points = 10
    const cx = 40
    const cy = 40
    const baseR = 26

    const path = useMemo(() => {
        const pts: string[] = []
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2
            const r = baseR * (0.75 + rand() * 0.35)
            const x = cx + Math.cos(angle) * r
            const y = cy + Math.sin(angle) * r
            pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
        }
        return `M ${pts.join(' L ')} Z`
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seed])

    const craters = useMemo(() => {
        const count = 3 + Math.floor(rand() * 3)
        return Array.from({ length: count }, () => ({
            x: cx + (rand() - 0.5) * baseR * 0.9,
            y: cy + (rand() - 0.5) * baseR * 0.9,
            r: 2 + rand() * 3.5,
        }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seed])

    const fillColor = hazardous ? '#8a5a4a' : '#6b6b70'
    const craterColor = hazardous ? '#5c3a30' : '#4a4a4e'

    return (
        <svg viewBox="0 0 80 80" className="w-16 h-16 shrink-0">
            <path d={path} fill={fillColor} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            {craters.map((c, i) => (
                <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={craterColor} opacity={0.6} />
            ))}
        </svg>
    )
}
function NEOCard({ neo }: { neo: NearEarthObject }) {
    return (
        <div
            className={`space-card rounded-xl p-5 flex flex-col gap-3 border ${neo.hazardous ? 'border-red-500/25' : 'border-white/[0.06]'
                }`}
        >
            <div className="flex items-start gap-3">
                <AsteroidIcon seed={neo.id} hazardous={neo.hazardous} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-white font-medium text-sm leading-snug">
                            {neo.name.replace(/[()]/g, '')}
                        </h3>
                    </div>
                    {neo.hazardous && (
                        <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                            <AlertTriangle className="w-3 h-3" />
                            HAZARDOUS
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Ruler className="w-3 h-3" /> Diameter
                    </p>
                    <p className="text-white/70 font-mono text-xs">
                        {neo.diameterMinKm < 1
                            ? `${Math.round(neo.diameterMinKm * 1000)}–${Math.round(neo.diameterMaxKm * 1000)} m`
                            : `${neo.diameterMinKm.toFixed(1)}–${neo.diameterMaxKm.toFixed(1)} km`}
                    </p>
                </div>
                <div>
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <MoveHorizontal className="w-3 h-3" /> Miss distance
                    </p>
                    <p className="text-white/70 font-mono text-xs">
                        {neo.missDistanceLunar.toFixed(1)} LD
                    </p>
                </div>
                <div>
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Gauge className="w-3 h-3" /> Velocity
                    </p>
                    <p className="text-white/70 font-mono text-xs">
                        {Math.round(neo.velocityKmS)} km/s
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function NEOTracker() {
    const [status, setStatus] = useState<Status>('loading')
    const [objects, setObjects] = useState<NearEarthObject[]>([])
    const [activeDate, setActiveDate] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        async function load() {
            try {
                const res = await fetch('/api/live/neo')
                if (!res.ok) throw new Error('Failed to load NEO data')
                const json: NearEarthObject[] = await res.json()
                if (!cancelled) {
                    setObjects(json)
                    setActiveDate(json[0]?.closeApproachDate ?? null)
                    setStatus('ready')
                }
            } catch {
                if (!cancelled) setStatus('error')
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    const dates = useMemo(() => {
        const seen = new Set<string>()
        const ordered: string[] = []
        for (const o of objects) {
            if (!seen.has(o.closeApproachDate)) {
                seen.add(o.closeApproachDate)
                ordered.push(o.closeApproachDate)
            }
        }
        return ordered
    }, [objects])

    const activeObjects = useMemo(
        () => objects.filter((o) => o.closeApproachDate === activeDate),
        [objects, activeDate]
    )

    const hazardousCount = useMemo(() => objects.filter((o) => o.hazardous).length, [objects])

    if (status === 'loading') {
        return (
            <div className="space-card rounded-xl h-96 flex flex-col items-center justify-center gap-3 animate-pulse">
                <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
                <p className="text-white/40 text-sm">Scanning for near-Earth objects…</p>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="space-card rounded-xl p-8 text-center">
                <p className="text-white/50 text-sm">
                    Could not load near-Earth object data. Try refreshing.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-white/40 text-sm">
                    {objects.length} objects tracked over the next 7 days
                    {hazardousCount > 0 && (
                        <span className="text-red-400"> · {hazardousCount} potentially hazardous</span>
                    )}
                </p>
            </div>

            {/* Day tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {dates.map((date) => (
                    <button
                        key={date}
                        onClick={() => setActiveDate(date)}
                        className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-mono border transition-colors ${activeDate === date
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'bg-white/[0.02] border-white/[0.08] text-white/40 hover:text-white/70'
                            }`}
                    >
                        {formatDateLabel(date)}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeObjects.map((neo) => (
                    <NEOCard key={neo.id} neo={neo} />
                ))}
            </div>
        </div>
    )
}