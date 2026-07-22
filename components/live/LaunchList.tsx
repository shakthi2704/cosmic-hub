'use client'

import { useEffect, useState } from 'react'
import type { Launch } from '@/lib/services/live.service'
import { Rocket, MapPin, Calendar, Radio } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

function useCountdown(net: string | null) {
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        if (!net) return
        const tick = () => {
            const diff = new Date(net).getTime() - Date.now()
            if (diff <= 0) return setTimeLeft('Launching now')
            const d = Math.floor(diff / 86400000)
            const h = Math.floor((diff % 86400000) / 3600000)
            const m = Math.floor((diff % 3600000) / 60000)
            const s = Math.floor((diff % 60000) / 1000)
            setTimeLeft(
                d > 0
                    ? `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
                    : `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
            )
        }
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [net])

    return timeLeft
}

function LaunchStatusColor(abbrev: string): string {
    switch (abbrev) {
        case 'Go': return '#22c55e'
        case 'TBD': return '#6b7280'
        case 'TBC': return '#f5a623'
        case 'Hold': return '#ef4444'
        case 'Success': return '#4a90d9'
        case 'Failure': return '#ef4444'
        default: return '#6b7280'
    }
}

// ─── Featured Launch Card (first item) ───────────────────

function FeaturedLaunchCard({ launch }: { launch: Launch }) {
    const countdown = useCountdown(launch.net)
    const statusColor = LaunchStatusColor(launch.status.abbrev)

    return (
        <div className="relative rounded-2xl border border-white/[0.10] bg-white/[0.02] overflow-hidden mb-6">
            {/* Top accent bar */}
            <div className="h-0.5 w-full" style={{ backgroundColor: statusColor, opacity: 0.7 }} />

            <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                        {/* Label */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                                Next Launch
                            </span>
                            <span
                                className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                                style={{
                                    color: statusColor,
                                    borderColor: `${statusColor}40`,
                                    backgroundColor: `${statusColor}12`,
                                }}
                            >
                                {launch.status.name}
                            </span>
                            {launch.webcast_live && (
                                <Badge variant="outline" className="text-[10px] font-mono border-red-500/30 text-red-400 bg-red-500/10 gap-1">
                                    <Radio className="w-2.5 h-2.5" />
                                    Webcast Live
                                </Badge>
                            )}
                        </div>

                        {/* Mission name */}
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2 leading-tight">
                            {launch.name}
                        </h2>

                        {/* Mission description */}
                        {launch.mission?.description && (
                            <p className="text-white/50 text-sm leading-relaxed mb-5 max-w-2xl line-clamp-3">
                                {launch.mission.description}
                            </p>
                        )}

                        {/* Meta */}
                        <div className="flex flex-wrap gap-4">
                            {launch.rocket && (
                                <span className="flex items-center gap-1.5 text-xs text-white/40 font-mono">
                                    <Rocket className="w-3.5 h-3.5" />
                                    {launch.rocket.configuration.full_name}
                                </span>
                            )}
                            {launch.pad && (
                                <span className="flex items-center gap-1.5 text-xs text-white/40 font-mono">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {launch.pad.location.name}
                                </span>
                            )}
                            {launch.net && (
                                <span className="flex items-center gap-1.5 text-xs text-white/40 font-mono">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(launch.net).toLocaleDateString('en-GB', {
                                        day: 'numeric', month: 'short', year: 'numeric',
                                    })}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Countdown */}
                    <div className="shrink-0 text-center md:text-right">
                        <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-2">
                            T−
                        </p>
                        <p className="text-3xl md:text-4xl font-mono font-bold text-blue-400 tabular-nums tracking-tight">
                            {countdown || '—'}
                        </p>
                        {launch.launch_service_provider && (
                            <p className="text-[11px] font-mono text-white/25 mt-3">
                                {launch.launch_service_provider.name}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Regular Launch Row ───────────────────────────────────

function LaunchRow({ launch, index }: { launch: Launch; index: number }) {
    const countdown = useCountdown(launch.net)
    const statusColor = LaunchStatusColor(launch.status.abbrev)

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 group">
            {/* Left */}
            <div className="flex items-start gap-4 min-w-0 flex-1">
                {/* Index */}
                <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[11px] font-mono text-white/30">{index}</span>
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-white/90 font-medium text-sm truncate">
                            {launch.name}
                        </h3>
                        <span
                            className="text-[9px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border shrink-0"
                            style={{
                                color: statusColor,
                                borderColor: `${statusColor}40`,
                                backgroundColor: `${statusColor}10`,
                            }}
                        >
                            {launch.status.abbrev}
                        </span>
                        {launch.webcast_live && (
                            <span className="text-[9px] font-mono text-red-400 border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                                LIVE
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        {launch.rocket && (
                            <span className="text-[11px] text-white/30 font-mono">
                                {launch.rocket.configuration.name}
                            </span>
                        )}
                        {launch.pad && (
                            <span className="text-[11px] text-white/25 font-mono">
                                {launch.pad.location.country_code}
                            </span>
                        )}
                        {launch.launch_service_provider && (
                            <span className="text-[11px] text-white/25 font-mono">
                                {launch.launch_service_provider.abbrev}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Right — date + countdown */}
            <div className="flex items-center gap-6 shrink-0 sm:text-right ml-11 sm:ml-0">
                {launch.net && (
                    <div>
                        <p className="text-[10px] font-mono text-white/20 uppercase tracking-wider mb-0.5">Date</p>
                        <p className="text-xs text-white/50 font-mono">
                            {new Date(launch.net).toLocaleDateString('en-GB', {
                                day: 'numeric', month: 'short',
                            })}
                        </p>
                    </div>
                )}
                <div className="min-w-[120px]">
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-wider mb-0.5">T−</p>
                    <p className="text-xs font-mono text-blue-400 tabular-nums">
                        {countdown || '—'}
                    </p>
                </div>
            </div>
        </div>
    )
}

// ─── Main List ────────────────────────────────────────────

export default function LaunchList({ launches }: { launches: Launch[] }) {
    if (launches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <Rocket className="w-10 h-10 text-white/10 mb-4" />
                <p className="text-white/20 text-sm">No upcoming launches available</p>
                <p className="text-white/10 text-xs font-mono mt-1">Data is cached and refreshes every 5 minutes</p>
            </div>
        )
    }

    const [featured, ...rest] = launches

    return (
        <div>
            {/* Featured */}
            <FeaturedLaunchCard launch={featured} />

            {/* Rest */}
            {rest.length > 0 && (
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.01] overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/[0.06]">
                        <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                            Upcoming — {rest.length} more scheduled
                        </p>
                    </div>
                    <div className="px-6 divide-y divide-white/[0.05]">
                        {rest.map((launch, i) => (
                            <LaunchRow key={launch.id} launch={launch} index={i + 2} />
                        ))}
                    </div>
                </div>
            )}

            {/* Source attribution */}
            <div className="mt-6 text-center">
                <p className="text-[11px] font-mono text-white/15">
                    Data from{' '}
                    <a
                        href="https://thespacedevs.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white/30 transition-colors"
                    >
                        The Space Devs Launch Library
                    </a>
                    {' '}· Refreshed every 5 minutes
                </p>
            </div>
        </div>
    )
}