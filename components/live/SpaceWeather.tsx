'use client'

import { useEffect, useState } from 'react'
import { Loader2, Zap, Flame, Sparkles } from 'lucide-react'
import type { SpaceWeather } from '@/lib/services/live.service'

type Status = 'loading' | 'error' | 'ready'

function kpColor(kp: number): string {
    if (kp < 4) return '#4ade80' // green — quiet
    if (kp < 5) return '#facc15' // yellow — unsettled
    if (kp < 6) return '#fb923c' // orange — G1
    if (kp < 7) return '#f87171' // red — G2
    return '#c084fc' // purple — G3+
}

function timeAgo(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diffMs / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    return `${hours}h ago`
}

function StatCard({
    icon: Icon,
    label,
    value,
    sublabel,
    accent,
}: {
    icon: React.ComponentType<{ className?: string }>
    label: string
    value: string
    sublabel: string
    accent?: string
}) {
    return (
        <div className="space-card rounded-xl p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-white/30" />
                <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{label}</p>
            </div>
            <p className="text-3xl font-semibold" style={{ color: accent ?? '#fff' }}>
                {value}
            </p>
            <p className="text-white/40 text-xs">{sublabel}</p>
        </div>
    )
}

function KpGauge({ kp }: { kp: number }) {
    const pct = Math.min(100, (kp / 9) * 100)
    return (
        <div className="space-card rounded-xl p-6">
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">
                Planetary Kp Index
            </p>
            <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden mb-2">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: kpColor(kp) }}
                />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-white/25">
                <span>0 — Quiet</span>
                <span>5 — Storm</span>
                <span>9 — Extreme</span>
            </div>
        </div>
    )
}

export default function SpaceWeatherPanel() {
    const [status, setStatus] = useState<Status>('loading')
    const [data, setData] = useState<SpaceWeather | null>(null)

    useEffect(() => {
        let cancelled = false
        fetch('/api/live/space-weather')
            .then((r) => {
                if (!r.ok) throw new Error('Failed to load space weather')
                return r.json()
            })
            .then((json: SpaceWeather) => {
                if (!cancelled) {
                    setData(json)
                    setStatus('ready')
                }
            })
            .catch(() => {
                if (!cancelled) setStatus('error')
            })
        return () => {
            cancelled = true
        }
    }, [])

    if (status === 'loading') {
        return (
            <div className="space-card rounded-xl h-64 flex flex-col items-center justify-center gap-3 animate-pulse">
                <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
                <p className="text-white/40 text-sm">Reading conditions from NOAA SWPC…</p>
            </div>
        )
    }

    if (status === 'error' || !data) {
        return (
            <div className="space-card rounded-xl p-8 text-center">
                <p className="text-white/50 text-sm">Could not load space weather data. Try refreshing.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    icon={Zap}
                    label="Geomagnetic Activity"
                    value={data.kpCategory}
                    sublabel={`Kp ${data.kpIndex.toFixed(1)} · updated ${timeAgo(data.kpTimestamp)}`}
                    accent={kpColor(data.kpIndex)}
                />
                <StatCard
                    icon={Flame}
                    label="Latest Solar Flare"
                    value={data.flareClass}
                    sublabel={`X-ray flux · updated ${timeAgo(data.flareTimestamp)}`}
                />
                <StatCard
                    icon={Sparkles}
                    label="Aurora Outlook"
                    value={data.auroraLikely ? 'Elevated' : 'Low'}
                    sublabel={
                        data.auroraLikely
                            ? 'Possible at mid-latitudes tonight'
                            : 'Likely confined to polar regions'
                    }
                    accent={data.auroraLikely ? '#c084fc' : undefined}
                />
            </div>

            <KpGauge kp={data.kpIndex} />

            <p className="text-white/25 text-xs font-mono">
                Data from NOAA Space Weather Prediction Center (SWPC)
            </p>
        </div>
    )
}