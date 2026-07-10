import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getMissionBySlug } from '@/lib/services/mission.service'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { MissionStatus, MissionType } from '@prisma/client'
import { Rocket, Telescope, Navigation, Users, Satellite, Radio, Calendar, Building2, Target } from 'lucide-react'

// ─── Meta ─────────────────────────────────────────────────

const STATUS_META: Record<MissionStatus, { label: string; color: string }> = {
    PLANNED: { label: 'Planned', color: '#6b7280' },
    ACTIVE: { label: 'Active', color: '#22c55e' },
    COMPLETED: { label: 'Completed', color: '#4a90d9' },
    FAILED: { label: 'Failed', color: '#ef4444' },
    CANCELLED: { label: 'Cancelled', color: '#f97316' },
}

const TYPE_META: Record<MissionType, { label: string; icon: React.ReactNode }> = {
    FLYBY: { label: 'Flyby', icon: <Navigation className="w-4 h-4" /> },
    ORBITER: { label: 'Orbiter', icon: <Satellite className="w-4 h-4" /> },
    LANDER: { label: 'Lander', icon: <Rocket className="w-4 h-4" /> },
    ROVER: { label: 'Rover', icon: <Rocket className="w-4 h-4" /> },
    CREWED: { label: 'Crewed', icon: <Users className="w-4 h-4" /> },
    TELESCOPE: { label: 'Telescope', icon: <Telescope className="w-4 h-4" /> },
    PROBE: { label: 'Probe', icon: <Radio className="w-4 h-4" /> },
    OTHER: { label: 'Other', icon: <Satellite className="w-4 h-4" /> },
}

const MISSION_IMAGES: Record<string, string> = {
    'apollo-11': 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1400&q=85',
    'voyager-1': 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1400&q=85',
    'curiosity': 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1400&q=85',
    'james-webb-space-telescope': 'https://images.unsplash.com/photo-1614732484003-ef9881555dc3?w=1400&q=85',
    'hubble-space-telescope': 'https://images.unsplash.com/photo-1516849677043-ef67c9557e16?w=1400&q=85',
    'perseverance': 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1400&q=85',
    'cassini-huygens': 'https://images.unsplash.com/photo-1639921884918-8d28ab2e39a4?w=1400&q=85',
    'new-horizons': 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1400&q=85',
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&q=85'

function formatDate(date: Date | null): string {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
    })
}

function duration(start: Date | null, end: Date | null): string {
    if (!start) return '—'
    const endDate = end ? new Date(end) : new Date()
    const days = Math.floor((endDate.getTime() - new Date(start).getTime()) / 86400000)
    if (days < 30) return `${days} days`
    if (days < 365) return `${Math.floor(days / 30)} months`
    const years = Math.floor(days / 365)
    const months = Math.floor((days % 365) / 30)
    return months > 0 ? `${years}y ${months}m` : `${years} years`
}

// ─── Page ─────────────────────────────────────────────────

export default async function MissionDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const mission = await getMissionBySlug(slug)
    if (!mission) notFound()

    const sm = STATUS_META[mission.status]
    const tm = TYPE_META[mission.missionType]
    const image = MISSION_IMAGES[mission.slug] ?? FALLBACK_IMAGE

    return (
        <div className="min-h-screen bg-black">
            <Navbar />

            {/* Hero */}
            <div className="relative h-[52vh] min-h-[380px] overflow-hidden">
                <Image
                    src={image}
                    alt={mission.name}
                    fill
                    priority
                    className="object-cover opacity-50"
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />

                {/* Breadcrumb */}
                <div className="absolute top-20 inset-x-0 z-10">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="flex items-center gap-2 text-xs text-white/30 font-mono">
                            <Link href="/missions" className="hover:text-white/60 transition-colors">
                                Missions
                            </Link>
                            <span>›</span>
                            <span className="text-white/50">{mission.name}</span>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div className="absolute bottom-0 inset-x-0 z-10 pb-10">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span
                                className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border"
                                style={{
                                    color: sm.color,
                                    borderColor: `${sm.color}50`,
                                    backgroundColor: `${sm.color}18`,
                                }}
                            >
                                {mission.status === 'ACTIVE' && (
                                    <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ backgroundColor: sm.color }} />
                                )}
                                {sm.label}
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-mono text-white/40 bg-white/[0.06] border border-white/[0.08] px-2.5 py-1 rounded-full">
                                {tm.icon}
                                {tm.label}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                            {mission.name}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left — main content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Description */}
                        {mission.description && (
                            <div>
                                <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">
                                    Overview
                                </h2>
                                <p className="text-white/70 leading-relaxed text-[15px]">
                                    {mission.description}
                                </p>
                                {mission.wikiUrl && (
                                    <a
                                        href={mission.wikiUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 mt-4 text-xs text-blue-400 hover:text-blue-300 transition-colors font-mono"
                                    >
                                        Read more on Wikipedia →
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Timeline */}
                        <div>
                            <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">
                                Timeline
                            </h2>
                            <div className="space-y-0 relative">
                                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.07]" />
                                {[
                                    { label: 'Launch Date', value: formatDate(mission.launchDate), active: true },
                                    ...(mission.endDate ? [{ label: 'End Date', value: formatDate(mission.endDate), active: false }] : []),
                                    { label: 'Duration', value: duration(mission.launchDate, mission.endDate), active: false },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-start gap-4 pb-5">
                                        <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 mt-0.5 z-10 ${item.active ? 'border-blue-500 bg-blue-500/30' : 'border-white/20 bg-black'}`} />
                                        <div>
                                            <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider">{item.label}</p>
                                            <p className="text-white/80 text-sm mt-0.5">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Crew */}
                        {mission.crew.length > 0 && (
                            <div>
                                <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">
                                    Crew ({mission.crew.length})
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {mission.crew.map(({ person, roleOnMission }) => (
                                        <Link
                                            key={person.slug}
                                            href={`/people/${person.slug}`}
                                            className="group flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/[0.07] rounded-xl hover:bg-white/[0.05] hover:border-white/[0.12] transition-all"
                                        >
                                            <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-white/[0.06]">
                                                {person.imageUrl && (
                                                    <Image src={person.imageUrl} alt={person.name} fill className="object-cover" sizes="40px" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-white/80 text-sm font-medium truncate group-hover:text-white transition-colors">
                                                    {person.name}
                                                </p>
                                                {roleOnMission && (
                                                    <p className="text-white/30 text-[11px] font-mono truncate">{roleOnMission}</p>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Target object */}
                        {mission.target && (
                            <div>
                                <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">
                                    Target Object
                                </h2>
                                <Link
                                    href={`/celestial/${mission.target.slug}`}
                                    className="group flex items-center gap-4 px-5 py-4 bg-white/[0.02] border border-white/[0.07] rounded-xl hover:bg-white/[0.05] hover:border-white/[0.12] transition-all"
                                >
                                    {mission.target.imageUrl && (
                                        <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
                                            <Image src={mission.target.imageUrl} alt={mission.target.name} fill className="object-cover" sizes="56px" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-white font-medium group-hover:text-blue-300 transition-colors">
                                            {mission.target.name}
                                        </p>
                                        <p className="text-white/30 text-xs font-mono mt-0.5">
                                            {mission.target.type.replace(/_/g, ' ')}
                                        </p>
                                        {mission.target.summary && (
                                            <p className="text-white/40 text-xs mt-1 line-clamp-1">
                                                {mission.target.summary}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Right — sidebar */}
                    <div className="space-y-5">
                        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5 sticky top-20">
                            <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-5">
                                Mission Facts
                            </h2>
                            <dl className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" />
                                    <div>
                                        <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">Launch</dt>
                                        <dd className="text-white/70 text-sm">{formatDate(mission.launchDate)}</dd>
                                    </div>
                                </div>

                                {mission.endDate && (
                                    <div className="flex items-start gap-3 border-t border-white/[0.05] pt-4">
                                        <Calendar className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" />
                                        <div>
                                            <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">End Date</dt>
                                            <dd className="text-white/70 text-sm">{formatDate(mission.endDate)}</dd>
                                        </div>
                                    </div>
                                )}

                                {mission.agency && (
                                    <div className="flex items-start gap-3 border-t border-white/[0.05] pt-4">
                                        <Building2 className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" />
                                        <div>
                                            <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">Agency</dt>
                                            <dd className="text-white/70 text-sm">{mission.agency.name}</dd>
                                        </div>
                                    </div>
                                )}

                                {mission.target && (
                                    <div className="flex items-start gap-3 border-t border-white/[0.05] pt-4">
                                        <Target className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" />
                                        <div>
                                            <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">Target</dt>
                                            <dd className="text-white/70 text-sm">{mission.target.name}</dd>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3 border-t border-white/[0.05] pt-4">
                                    {tm.icon}
                                    <div>
                                        <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">Mission Type</dt>
                                        <dd className="text-white/70 text-sm">{tm.label}</dd>
                                    </div>
                                </div>

                                {mission.crew.length > 0 && (
                                    <div className="border-t border-white/[0.05] pt-4">
                                        <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">Crew Size</dt>
                                        <dd className="text-white/70 text-sm">{mission.crew.length} members</dd>
                                    </div>
                                )}
                            </dl>

                            <div className="mt-6 pt-4 border-t border-white/[0.05]">
                                <Link
                                    href="/missions"
                                    className="text-[11px] text-white/30 hover:text-white/60 transition-colors font-mono flex items-center gap-1.5"
                                >
                                    ← All missions
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