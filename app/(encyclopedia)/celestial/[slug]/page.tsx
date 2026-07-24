import type { CSSProperties } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getCelestialBySlug } from '@/lib/services/celestial.service'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CelestialType, MissionStatus } from '@prisma/client'

// ─── Helpers ─────────────────────────────────────────────

const TYPE_META: Record<CelestialType, { label: string; accent: string }> = {
    PLANET: { label: 'Planet', accent: '#4a90d9' },
    DWARF_PLANET: { label: 'Dwarf Planet', accent: '#a0c4ff' },
    MOON: { label: 'Moon', accent: '#c8d8e8' },
    STAR: { label: 'Star', accent: '#f5a623' },
    GALAXY: { label: 'Galaxy', accent: '#9b59b6' },
    NEBULA: { label: 'Nebula', accent: '#e74c9f' },
    BLACK_HOLE: { label: 'Black Hole', accent: '#a855f7' },
    ASTEROID: { label: 'Asteroid', accent: '#8d9db6' },
    COMET: { label: 'Comet', accent: '#7fd8d8' },
    EXOPLANET: { label: 'Exoplanet', accent: '#27ae60' },
    OTHER: { label: 'Other', accent: '#6b7280' },
}

const MISSION_STATUS_META: Record<MissionStatus, { label: string; color: string }> = {
    PLANNED: { label: 'Planned', color: '#6b7280' },
    ACTIVE: { label: 'Active', color: '#22c55e' },
    COMPLETED: { label: 'Completed', color: '#4a90d9' },
    FAILED: { label: 'Failed', color: '#ef4444' },
    CANCELLED: { label: 'Cancelled', color: '#f97316' },
}

function formatMass(kg: number | null): string {
    if (!kg) return '—'
    if (kg >= 1e30) return `${(kg / 1.989e30).toFixed(3)} M☉`
    if (kg >= 1e27) return `${(kg / 1.898e27).toFixed(3)} MJ`
    if (kg >= 1e24) return `${(kg / 5.972e24).toFixed(3)} M⊕`
    return `${kg.toExponential(2)} kg`
}

function formatRadius(km: number | null): string {
    if (!km) return '—'
    if (km >= 100000) return `${(km / 1000).toFixed(0).toLocaleString()} × 10³ km`
    return `${km.toLocaleString()} km`
}

// ─── Stat Card ────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1.5">
                {label}
            </p>
            <p className="text-white font-medium text-sm tabular-nums">{value}</p>
        </div>
    )
}

// ─── Attribute value formatting ────────────────────────────

const ATTRIBUTE_UNITS: Record<string, (v: unknown) => string> = {
    orbitalPeriodDays: v => `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 1 })} days`,
    orbitalRadiusAU: v => `${Number(v).toFixed(3)} AU`,
    equilibriumTempK: v => `${Number(v).toFixed(0)} K`,
    distanceFromEarthParsecs: v => `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 1 })} pc (${(Number(v) * 3.2616).toFixed(1)} ly)`,
    radiusEarthRadii: v => `${Number(v).toFixed(2)} R⊕`,
    massEarthMasses: v => `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })} M⊕`,
    discoveryYear: v => String(v),
}

function formatAttributeValue(key: string, value: unknown): string {
    const formatter = ATTRIBUTE_UNITS[key]
    if (formatter) return formatter(value)
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    return String(value)
}

// ─── Attributes Panel ─────────────────────────────────────

function AttributesPanel({ attributes }: { attributes: Record<string, unknown> }) {
    const entries = Object.entries(attributes).filter(
        ([k, v]) => k !== 'source' && v !== null && v !== undefined && v !== ''
    )
    if (entries.length === 0) return null

    return (
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
            <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-5">
                Physical & Orbital Data
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {entries.map(([key, value]) => {
                    const label = key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, s => s.toUpperCase())
                        .trim()
                    return (
                        <div key={key} className="flex flex-col gap-0.5 border-b border-white/[0.05] pb-3">
                            <dt className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
                                {label}
                            </dt>
                            <dd className="text-white/80 text-sm">
                                {formatAttributeValue(key, value)}
                            </dd>
                        </div>
                    )
                })}
            </dl>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────

export default async function CelestialDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const obj = await getCelestialBySlug(slug)
    if (!obj) notFound()

    const meta = TYPE_META[obj.type]
    const attrs = (obj.attributes ?? {}) as Record<string, unknown>

    return (
        <div className="min-h-screen bg-black">
            <Navbar />

            {/* Hero */}
            <div className="relative h-[55vh] min-h-[400px] overflow-hidden">
                {obj.imageUrl ? (
                    <Image
                        src={obj.imageUrl}
                        alt={obj.name}
                        fill
                        priority
                        className="object-cover opacity-60"
                        sizes="100vw"
                    />
                ) : (
                    <div className="absolute inset-0 overflow-hidden bg-black">
                        {/* Star field */}
                        <div className="absolute inset-0" aria-hidden>
                            {Array.from({ length: 60 }, (_, i) => (
                                <span
                                    key={i}
                                    className="absolute rounded-full bg-white animate-twinkle"
                                    style={{
                                        top: `${(i * 53.7) % 100}%`,
                                        left: `${(i * 71.3) % 100}%`,
                                        width: i % 9 === 0 ? '2px' : '1px',
                                        height: i % 9 === 0 ? '2px' : '1px',
                                        opacity: 0.15 + (i % 8) * 0.05,
                                        '--dur': `${3 + (i % 5)}s`,
                                        animationDelay: `${i % 6}s`,
                                    } as CSSProperties}
                                />
                            ))}
                        </div>
                        {/* Glowing sphere */}
                        <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-float"
                            style={{
                                width: 220,
                                height: 220,
                                background: `radial-gradient(circle at 35% 30%, ${meta.accent}cc, ${meta.accent}33 55%, transparent 75%)`,
                                boxShadow: `0 0 90px 20px ${meta.accent}22`,
                            }}
                        />
                        <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
                            style={{ width: 260, height: 260, borderColor: `${meta.accent}25` }}
                        />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />

                {/* Breadcrumb */}
                <div className="absolute top-20 left-0 right-0 z-10">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="flex items-center gap-2 text-xs text-white/30 font-mono">
                            <Link href="/celestial" className="hover:text-white/60 transition-colors">
                                Encyclopedia
                            </Link>
                            <span>›</span>
                            <Link
                                href={`/celestial?type=${obj.type}`}
                                className="hover:text-white/60 transition-colors"
                            >
                                {meta.label}s
                            </Link>
                            <span>›</span>
                            <span className="text-white/50">{obj.name}</span>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 z-10 pb-10">
                    <div className="max-w-5xl mx-auto px-6">
                        <span
                            className="inline-block text-[10px] font-mono font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-4"
                            style={{
                                color: meta.accent,
                                borderColor: `${meta.accent}50`,
                                backgroundColor: `${meta.accent}18`,
                            }}
                        >
                            {meta.label}
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                            {obj.name}
                        </h1>
                        {obj.parent && (
                            <p className="text-white/40 text-sm mt-2 font-mono">
                                Natural satellite of{' '}
                                <Link
                                    href={`/celestial/${obj.parent.slug}`}
                                    className="text-white/60 hover:text-white transition-colors"
                                >
                                    {obj.parent.name}
                                </Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left — main content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Summary */}
                        {obj.summary && (
                            <div>
                                <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">
                                    Overview
                                </h2>
                                <p className="text-white/70 leading-relaxed text-[15px]">
                                    {obj.summary}
                                </p>
                            </div>
                        )}

                        {/* Core stats */}
                        <div>
                            <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">
                                Core Metrics
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <StatCard label="Mass" value={formatMass(obj.massKg)} />
                                <StatCard label="Radius" value={formatRadius(obj.radiusKm)} />
                                <StatCard label="Type" value={meta.label} />
                            </div>
                        </div>

                        {/* Attributes */}
                        {Object.keys(attrs).length > 0 && (
                            <AttributesPanel attributes={attrs} />
                        )}

                        {/* Missions */}
                        {obj.missions.length > 0 && (
                            <div>
                                <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">
                                    Missions
                                </h2>
                                <div className="space-y-2">
                                    {obj.missions.map((mission) => {
                                        const sm = MISSION_STATUS_META[mission.status]
                                        return (
                                            <Link
                                                key={mission.id}
                                                href={`/missions/${mission.slug}`}
                                                className="flex items-center justify-between px-5 py-4 bg-white/[0.02] border border-white/[0.07] rounded-xl hover:bg-white/[0.05] hover:border-white/[0.12] transition-all group"
                                            >
                                                <div>
                                                    <p className="text-white font-medium text-sm group-hover:text-blue-300 transition-colors">
                                                        {mission.name}
                                                    </p>
                                                    <p className="text-white/30 text-xs font-mono mt-0.5">
                                                        {mission.missionType.replace('_', ' ')}
                                                        {mission.launchDate && ` · ${new Date(mission.launchDate).getFullYear()}`}
                                                    </p>
                                                </div>
                                                <span
                                                    className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0"
                                                    style={{
                                                        color: sm.color,
                                                        borderColor: `${sm.color}40`,
                                                        backgroundColor: `${sm.color}15`,
                                                    }}
                                                >
                                                    {sm.label}
                                                </span>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Children (moons etc) */}
                        {obj.children.length > 0 && (
                            <div>
                                <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">
                                    Natural Satellites ({obj.children.length})
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {obj.children.map((child) => (
                                        <Link
                                            key={child.id}
                                            href={`/celestial/${child.slug}`}
                                            className="flex items-center gap-3 px-3 py-3 bg-white/[0.02] border border-white/[0.07] rounded-xl hover:bg-white/[0.05] hover:border-white/[0.12] transition-all group"
                                        >
                                            {child.imageUrl && (
                                                <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                                                    <Image src={child.imageUrl} alt={child.name} fill className="object-cover" sizes="32px" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-white/80 text-xs font-medium truncate group-hover:text-white transition-colors">
                                                    {child.name}
                                                </p>
                                                <p className="text-white/30 text-[10px] font-mono">
                                                    {TYPE_META[child.type].label}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right — sidebar */}
                    <div className="space-y-6">

                        {/* Quick facts */}
                        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5 sticky top-20">
                            <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">
                                Quick Facts
                            </h2>
                            <dl className="space-y-3">
                                <div>
                                    <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">Classification</dt>
                                    <dd className="text-white/70 text-sm">{meta.label}</dd>
                                </div>
                                {obj.massKg && (
                                    <div className="border-t border-white/[0.05] pt-3">
                                        <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">Mass</dt>
                                        <dd className="text-white/70 text-sm font-mono">{formatMass(obj.massKg)}</dd>
                                    </div>
                                )}
                                {obj.radiusKm && (
                                    <div className="border-t border-white/[0.05] pt-3">
                                        <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">Radius</dt>
                                        <dd className="text-white/70 text-sm font-mono">{formatRadius(obj.radiusKm)}</dd>
                                    </div>
                                )}
                                {obj.parent && (
                                    <div className="border-t border-white/[0.05] pt-3">
                                        <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">Orbits</dt>
                                        <dd>
                                            <Link
                                                href={`/celestial/${obj.parent.slug}`}
                                                className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                                            >
                                                {obj.parent.name}
                                            </Link>
                                        </dd>
                                    </div>
                                )}
                                {!obj.parent && typeof attrs.hostStar === 'string' && attrs.hostStar && (
                                    <div className="border-t border-white/[0.05] pt-3">
                                        <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">Host Star</dt>
                                        <dd className="text-white/70 text-sm">{attrs.hostStar}</dd>
                                    </div>
                                )}
                                {obj.children.length > 0 && (
                                    <div className="border-t border-white/[0.05] pt-3">
                                        <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">Satellites</dt>
                                        <dd className="text-white/70 text-sm">{obj.children.length} known</dd>
                                    </div>
                                )}
                                {obj.missions.length > 0 && (
                                    <div className="border-t border-white/[0.05] pt-3">
                                        <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">Missions</dt>
                                        <dd className="text-white/70 text-sm">{obj.missions.length} recorded</dd>
                                    </div>
                                )}
                            </dl>

                            {/* Back link */}
                            <div className="mt-6 pt-4 border-t border-white/[0.05]">
                                <Link
                                    href={`/celestial?type=${obj.type}`}
                                    className="text-[11px] text-white/30 hover:text-white/60 transition-colors font-mono flex items-center gap-1.5"
                                >
                                    ← Browse all {meta.label}s
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    )
}