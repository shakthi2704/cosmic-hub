'use client'

import { useEffect, useState } from 'react'
import { MapPin, ArrowUp, ArrowDown, Loader2 } from 'lucide-react'
import type { SkySnapshot, PlanetVisibility } from '@/lib/services/sky.service'
import { PLANET_ORBITAL_ELEMENTS } from '@/lib/orbital-mechanics'
import SkyDome3D from '@/components/live/SkyDome3D'

type Status = 'idle' | 'locating' | 'loading' | 'error' | 'ready'

function compassDirection(azimuth: number): string {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    return dirs[Math.round(azimuth / 45) % 8]
}

function formatTime(iso: string | null): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
        hour12: false,
    }) + ' UTC'
}

function planetColor(name: string): string {
    const match = PLANET_ORBITAL_ELEMENTS.find(
        (p) => p.slug === name.toLowerCase()
    )
    return match?.displayColor ?? '#ffffff'
}

function PlanetCard({ planet }: { planet: PlanetVisibility }) {
    return (
        <div className="space-card rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">{planet.name}</h3>
                <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full border ${planet.aboveHorizon
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-white/[0.04] border-white/[0.08] text-white/30'
                        }`}
                >
                    {planet.aboveHorizon ? 'Visible now' : 'Below horizon'}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">
                        Altitude
                    </p>
                    <p className="text-white/70">{planet.altitude.toFixed(1)}°</p>
                </div>
                <div>
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">
                        Direction
                    </p>
                    <p className="text-white/70">
                        {compassDirection(planet.azimuth)} ({planet.azimuth.toFixed(0)}°)
                    </p>
                </div>
                <div className="flex items-center gap-1.5">
                    <ArrowUp className="w-3 h-3 text-white/30" />
                    <span className="text-white/50 text-xs">{formatTime(planet.riseTime)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <ArrowDown className="w-3 h-3 text-white/30" />
                    <span className="text-white/50 text-xs">{formatTime(planet.setTime)}</span>
                </div>
            </div>

            {planet.magnitude !== null && (
                <p className="text-[10px] font-mono text-white/25">
                    mag {planet.magnitude.toFixed(2)}
                </p>
            )}
        </div>
    )
}

function SkyLegend({ planets }: { planets: PlanetVisibility[] }) {
    const [now, setNow] = useState(new Date())
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(id)
    }, [])

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap gap-3">
                {planets.map((p) => (
                    <div key={p.name} className="flex items-center gap-1.5">
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{
                                backgroundColor: p.aboveHorizon
                                    ? planetColor(p.name)
                                    : 'rgba(255,255,255,0.15)',
                            }}
                        />
                        <span className={`text-[11px] font-mono ${p.aboveHorizon ? 'text-white/60' : 'text-white/25'}`}>
                            {p.name}
                        </span>
                    </div>
                ))}
            </div>
            <p className="text-[10px] font-mono text-white/30">
                {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC', hour12: false })} UTC
            </p>
        </div>
    )
}

export default function SkyVisibility() {
    const [status, setStatus] = useState<Status>('idle')
    const [data, setData] = useState<SkySnapshot | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [manualLat, setManualLat] = useState('')
    const [manualLng, setManualLng] = useState('')

    async function fetchSky(lat: number, lng: number) {
        setStatus('loading')
        try {
            const res = await fetch(`/api/sky/visible?lat=${lat}&lng=${lng}`)
            if (!res.ok) throw new Error('Failed to load sky data')
            const json: SkySnapshot = await res.json()
            setData(json)
            setStatus('ready')
        } catch {
            setError('Could not compute sky visibility. Try again.')
            setStatus('error')
        }
    }

    function useGeolocation() {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.')
            setStatus('error')
            return
        }
        setStatus('locating')
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchSky(pos.coords.latitude, pos.coords.longitude),
            () => {
                setError('Location access denied. Enter coordinates manually below.')
                setStatus('error')
            },
            { timeout: 10000 }
        )
    }

    function submitManual(e: React.FormEvent) {
        e.preventDefault()
        const lat = Number(manualLat)
        const lng = Number(manualLng)
        if (Number.isNaN(lat) || Number.isNaN(lng)) return
        fetchSky(lat, lng)
    }

    useEffect(() => {
        useGeolocation()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (status === 'idle' || status === 'locating' || status === 'loading') {
        return (
            <div className="space-card rounded-xl h-[420px] md:h-[520px] flex flex-col items-center justify-center gap-3 animate-pulse">
                <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
                <p className="text-white/40 text-sm">
                    {status === 'locating' ? 'Finding your location…' : 'Calculating sky positions…'}
                </p>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="space-card rounded-xl p-8 text-center">
                <MapPin className="w-6 h-6 text-white/30 mx-auto mb-3" />
                <p className="text-white/50 text-sm mb-6">{error}</p>
                <form onSubmit={submitManual} className="flex flex-wrap items-center justify-center gap-2">
                    <input
                        type="text"
                        placeholder="Latitude"
                        value={manualLat}
                        onChange={(e) => setManualLat(e.target.value)}
                        className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white w-32 focus:outline-none focus:border-white/20"
                    />
                    <input
                        type="text"
                        placeholder="Longitude"
                        value={manualLng}
                        onChange={(e) => setManualLng(e.target.value)}
                        className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white w-32 focus:outline-none focus:border-white/20"
                    />
                    <button
                        type="submit"
                        className="bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.08] rounded-lg px-4 py-2 text-sm text-white transition-colors"
                    >
                        Check sky
                    </button>
                </form>
            </div>
        )
    }

    if (!data) return null

    const visible = data.planets.filter((p) => p.aboveHorizon)
    const hidden = data.planets.filter((p) => !p.aboveHorizon)

    return (
        <div className="space-y-8">
            <p className="text-white/30 text-xs font-mono">
                {data.latitude.toFixed(2)}°, {data.longitude.toFixed(2)}° · updated{' '}
                {new Date(data.generatedAt).toLocaleTimeString('en-GB', {
                    hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false,
                })}{' '}
                UTC
            </p>

            <SkyLegend planets={data.planets} />
            <SkyDome3D planets={data.planets} sunAltitude={data.sunAltitude} />

            {visible.length > 0 && (
                <div>
                    <h2 className="text-sm font-mono text-white/40 uppercase tracking-widest mb-4">
                        Visible now ({visible.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {visible.map((p) => (
                            <PlanetCard key={p.name} planet={p} />
                        ))}
                    </div>
                </div>
            )}

            {hidden.length > 0 && (
                <div>
                    <h2 className="text-sm font-mono text-white/40 uppercase tracking-widest mb-4">
                        Below the horizon ({hidden.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {hidden.map((p) => (
                            <PlanetCard key={p.name} planet={p} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}