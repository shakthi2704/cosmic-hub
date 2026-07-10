import Link from 'next/link'
import Image from 'next/image'
import { getMissions } from '@/lib/services/mission.service'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { MissionStatus, MissionType } from '@prisma/client'
import { Rocket, Telescope, Navigation, Users, Satellite, Radio } from 'lucide-react'

// ─── Meta ─────────────────────────────────────────────────

const STATUS_META: Record<MissionStatus, { label: string; color: string }> = {
    PLANNED: { label: 'Planned', color: '#6b7280' },
    ACTIVE: { label: 'Active', color: '#22c55e' },
    COMPLETED: { label: 'Completed', color: '#4a90d9' },
    FAILED: { label: 'Failed', color: '#ef4444' },
    CANCELLED: { label: 'Cancelled', color: '#f97316' },
}

const TYPE_META: Record<MissionType, { label: string; icon: React.ReactNode }> = {
    FLYBY: { label: 'Flyby', icon: <Navigation className="w-3 h-3" /> },
    ORBITER: { label: 'Orbiter', icon: <Satellite className="w-3 h-3" /> },
    LANDER: { label: 'Lander', icon: <Rocket className="w-3 h-3" /> },
    ROVER: { label: 'Rover', icon: <Rocket className="w-3 h-3" /> },
    CREWED: { label: 'Crewed', icon: <Users className="w-3 h-3" /> },
    TELESCOPE: { label: 'Telescope', icon: <Telescope className="w-3 h-3" /> },
    PROBE: { label: 'Probe', icon: <Radio className="w-3 h-3" /> },
    OTHER: { label: 'Other', icon: <Satellite className="w-3 h-3" /> },
}

// Mission images mapped by slug
const MISSION_IMAGES: Record<string, string> = {
    'apollo-11': 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=600&q=80',
    'voyager-1': 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=80',
    'curiosity': 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&q=80',
    'james-webb-space-telescope': 'https://images.unsplash.com/photo-1614732484003-ef9881555dc3?w=600&q=80',
    'hubble-space-telescope': 'https://images.unsplash.com/photo-1516849677043-ef67c9557e16?w=600&q=80',
    'perseverance': 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=600&q=80',
    'cassini-huygens': 'https://images.unsplash.com/photo-1639921884918-8d28ab2e39a4?w=600&q=80',
    'new-horizons': 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&q=80',
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80'

const STATUS_FILTERS: { label: string; value: MissionStatus | 'ALL' }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Planned', value: 'PLANNED' },
    { label: 'Failed', value: 'FAILED' },
]

// ─── Mission Card ─────────────────────────────────────────

type Mission = Awaited<ReturnType<typeof getMissions>>['items'][number]

function MissionCard({ mission }: { mission: Mission }) {
    const sm = STATUS_META[mission.status]
    const tm = TYPE_META[mission.missionType]
    const image = MISSION_IMAGES[mission.slug] ?? FALLBACK_IMAGE

    return (
        <Link href={`/missions/${mission.slug}`} className="group block space-card rounded-2xl overflow-hidden">

            {/* Image */}
            <div className="relative h-44 overflow-hidden bg-white/[0.03]">
                <Image
                    src={image}
                    alt={mission.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-75 group-hover:opacity-90"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {/* Status badge */}
                <div className="absolute top-3 left-3">
                    <span
                        className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-sm"
                        style={{
                            color: sm.color,
                            borderColor: `${sm.color}50`,
                            backgroundColor: `${sm.color}18`,
                        }}
                    >
                        {mission.status === 'ACTIVE' && (
                            <span className="w-1 h-1 rounded-full animate-pulse-dot" style={{ backgroundColor: sm.color }} />
                        )}
                        {sm.label}
                    </span>
                </div>

                {/* Type badge */}
                <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1 text-[10px] font-mono text-white/50 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md border border-white/[0.08]">
                        {tm.icon}
                        {tm.label}
                    </span>
                </div>

                {/* Launch year pinned to bottom */}
                {mission.launchDate && (
                    <div className="absolute bottom-3 right-3">
                        <span className="text-[11px] font-mono text-white/40">
                            {new Date(mission.launchDate).getFullYear()}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="text-white font-semibold text-[14px] leading-snug mb-1 group-hover:text-blue-300 transition-colors line-clamp-2">
                    {mission.name}
                </h3>
                <p className="text-white/35 text-xs font-mono">
                    {mission.missionType.replace(/_/g, ' ')}
                    {mission.launchDate && ` · Launched ${new Date(mission.launchDate).getFullYear()}`}
                    {mission.endDate && ` · Ended ${new Date(mission.endDate).getFullYear()}`}
                </p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
                    {mission.agency ? (
                        <span className="text-[11px] font-mono text-white/35">
                            {mission.agency.abbreviation ?? mission.agency.name}
                        </span>
                    ) : <span />}

                    {mission.target && (
                        <span className="text-[11px] font-mono text-white/35 flex items-center gap-1">
                            <span className="text-white/20">→</span>
                            {mission.target.name}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    )
}

// ─── Page ─────────────────────────────────────────────────

export default async function MissionsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; page?: string }>
}) {
    const params = await searchParams
    const status = (params.status as MissionStatus) || null
    const page = Math.max(1, parseInt(params.page ?? '1', 10))

    const { items, total, totalPages } = await getMissions({
        status: status ?? undefined,
        page,
    })

    return (
        <div className="min-h-screen bg-black">
            <Navbar />

            {/* Header */}
            <div className="border-b border-white/[0.06] pt-20">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">
                        Encyclopedia / Missions
                    </p>
                    <h1 className="text-2xl font-semibold text-white mb-1">Space Missions</h1>
                    <p className="text-white/40 text-sm">
                        {total} {total === 1 ? 'mission' : 'missions'} catalogued
                    </p>

                    {/* Filter tabs */}
                    <div className="flex items-center gap-1.5 mt-6 flex-wrap">
                        {STATUS_FILTERS.map(({ label, value }) => {
                            const active = value === 'ALL' ? !status : status === value
                            return (
                                <Link
                                    key={value}
                                    href={value === 'ALL' ? '/missions' : `/missions?status=${value}`}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${active
                                        ? 'bg-white/10 text-white border border-white/20'
                                        : 'text-white/40 hover:text-white/70 hover:bg-white/[0.05]'
                                        }`}
                                >
                                    {label}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-6 py-10">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <p className="text-white/20 text-sm">No missions found</p>
                        <Link href="/missions" className="mt-4 text-xs text-blue-400 hover:text-blue-300">
                            Clear filters
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {items.map((mission) => (
                            <MissionCard key={mission.id} mission={mission} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                        {page > 1 && (
                            <Link
                                href={`/missions?${status ? `status=${status}&` : ''}page=${page - 1}`}
                                className="px-4 py-2 rounded-lg text-xs text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors font-mono"
                            >
                                ← Prev
                            </Link>
                        )}
                        <span className="text-xs text-white/30 font-mono px-3">
                            {page} / {totalPages}
                        </span>
                        {page < totalPages && (
                            <Link
                                href={`/missions?${status ? `status=${status}&` : ''}page=${page + 1}`}
                                className="px-4 py-2 rounded-lg text-xs text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors font-mono"
                            >
                                Next →
                            </Link>
                        )}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}