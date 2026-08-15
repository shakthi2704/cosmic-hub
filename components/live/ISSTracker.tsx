'use client'

import { useEffect, useState } from 'react'
import { Loader2, Gauge, MoveVertical, Sun, MoonStar } from 'lucide-react'
import type { ISSPosition } from '@/lib/services/live.service'
import ISSGlobe3D from '@/components/live/ISSGlobe3D'

const POLL_INTERVAL_MS = 5000

type Status = 'loading' | 'error' | 'ready'

function StatBlock({
    label,
    value,
    icon: Icon,
}: {
    label: string
    value: string
    icon: React.ComponentType<{ className?: string }>
}) {
    return (
        <div className="space-card rounded-xl p-5 flex items-center gap-3">
            <Icon className="w-4 h-4 text-white/30 shrink-0" />
            <div>
                <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">
                    {label}
                </p>
                <p className="text-white/80 text-sm font-mono">{value}</p>
            </div>
        </div>
    )
}

export default function ISSTracker() {
    const [status, setStatus] = useState<Status>('loading')
    const [position, setPosition] = useState<ISSPosition | null>(null)

    useEffect(() => {
        let cancelled = false

        async function fetchPosition() {
            try {
                const res = await fetch('/api/live/iss')
                if (!res.ok) throw new Error('Failed to load ISS position')
                const json: ISSPosition = await res.json()
                if (!cancelled) {
                    setPosition(json)
                    setStatus('ready')
                }
            } catch {
                if (!cancelled) setStatus('error')
            }
        }

        fetchPosition()
        const id = setInterval(fetchPosition, POLL_INTERVAL_MS)
        return () => {
            cancelled = true
            clearInterval(id)
        }
    }, [])

    if (status === 'loading') {
        return (
            <div className="space-card rounded-xl h-[420px] md:h-[520px] flex flex-col items-center justify-center gap-3 animate-pulse">
                <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
                <p className="text-white/40 text-sm">Tracking the ISS…</p>
            </div>
        )
    }

    if (status === 'error' || !position) {
        return (
            <div className="space-card rounded-xl p-8 text-center">
                <p className="text-white/50 text-sm">
                    Could not load ISS position. Try refreshing.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <p className="text-white/30 text-xs font-mono">
                {position.latitude.toFixed(2)}°, {position.longitude.toFixed(2)}° · updated{' '}
                {new Date(position.timestamp * 1000).toLocaleTimeString('en-GB', {
                    hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC', hour12: false,
                })}{' '}
                UTC
            </p>

            <ISSGlobe3D position={position} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBlock label="Altitude" value={`${position.altitude.toFixed(1)} km`} icon={MoveVertical} />
                <StatBlock label="Velocity" value={`${position.velocity.toFixed(0)} km/h`} icon={Gauge} />
                <StatBlock
                    label="Visibility"
                    value={position.visibility === 'daylight' ? 'Daylight' : 'Eclipsed'}
                    icon={position.visibility === 'daylight' ? Sun : MoonStar}
                />
                <StatBlock
                    label="Position"
                    value={`${position.latitude.toFixed(1)}°, ${position.longitude.toFixed(1)}°`}
                    icon={Gauge}
                />
            </div>
        </div>
    )
}