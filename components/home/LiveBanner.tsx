'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Launch = { name: string; net: string; provider: string }

export default function LiveBanner() {
    const [launch, setLaunch] = useState<Launch | null>(null)
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        fetch('/api/live/launches')
            .then(r => r.json())
            .then((d: Launch[]) => d[0] && setLaunch(d[0]))
            .catch(() => null)
    }, [])

    useEffect(() => {
        if (!launch?.net) return
        const tick = () => {
            const diff = new Date(launch.net).getTime() - Date.now()
            if (diff <= 0) return setTimeLeft('Launching now')
            const d = Math.floor(diff / 86400000)
            const h = Math.floor((diff % 86400000) / 3600000)
            const m = Math.floor((diff % 3600000) / 60000)
            const s = Math.floor((diff % 60000) / 1000)
            setTimeLeft(`${d}d ${h}h ${m}m ${s}s`)
        }
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [launch])

    if (!launch) return null

    return (
        <Link href="/launches">
            <div className="border-b border-white/[0.06] bg-[#04040a] hover:bg-white/[0.02] transition-colors">
                <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <span className="shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest bg-red-500/15 border border-red-500/25 text-red-400">
                            <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse-dot" />
                            LIVE
                        </span>
                        <span className="text-xs text-gray-400 truncate">
                            Next launch:{' '}
                            <span className="text-white font-medium">{launch.name}</span>
                        </span>
                        <span className="hidden sm:inline text-gray-600 text-xs">·</span>
                        <span className="hidden sm:inline text-xs text-gray-500 truncate">
                            {launch.provider}
                        </span>
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-600 font-mono">T−</span>
                        <span className="text-xs font-mono font-medium text-blue-400 tabular-nums">
                            {timeLeft}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}