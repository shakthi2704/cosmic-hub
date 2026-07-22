import Link from 'next/link'
import Image from 'next/image'
import { getAgencies } from '@/lib/services/agency.service'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { AgencyType } from '@prisma/client'
import { Globe, Rocket, Users } from 'lucide-react'

// ─── Meta ─────────────────────────────────────────────────

const TYPE_META: Record<AgencyType, { label: string; accent: string }> = {
    GOVERNMENT: { label: 'Government', accent: '#4a90d9' },
    PRIVATE: { label: 'Private', accent: '#22c55e' },
    INTERNATIONAL: { label: 'International', accent: '#a855f7' },
    RESEARCH: { label: 'Research', accent: '#f5a623' },
}

const TYPE_FILTERS: { label: string; value: AgencyType | 'ALL' }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Government', value: 'GOVERNMENT' },
    { label: 'Private', value: 'PRIVATE' },
    { label: 'International', value: 'INTERNATIONAL' },
    { label: 'Research', value: 'RESEARCH' },
]

const AGENCY_IMAGES: Record<string, string> = {
    'nasa': 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=600&q=80',
    'esa': 'https://images.unsplash.com/photo-1516849677043-ef67c9557e16?w=600&q=80',
    'spacex': 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=600&q=80',
    'roscosmos': 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=80',
    'isro': 'https://images.unsplash.com/photo-1614732484003-ef9881555dc3?w=600&q=80',
}

const FALLBACK = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80'

// ─── Agency Card ──────────────────────────────────────────

type Agency = Awaited<ReturnType<typeof getAgencies>>['items'][number]

function AgencyCard({ agency }: { agency: Agency }) {
    const tm = TYPE_META[agency.type]
    const image = AGENCY_IMAGES[agency.slug] ?? FALLBACK

    return (
        <Link href={`/agencies/${agency.slug}`} className="group block space-card rounded-2xl overflow-hidden">

            {/* Image */}
            <div className="relative h-40 overflow-hidden bg-white/[0.03]">
                <Image
                    src={image}
                    alt={agency.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-60 group-hover:opacity-80"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {/* Type badge */}
                <div className="absolute top-3 left-3">
                    <span
                        className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-sm"
                        style={{
                            color: tm.accent,
                            borderColor: `${tm.accent}50`,
                            backgroundColor: `${tm.accent}18`,
                        }}
                    >
                        {tm.label}
                    </span>
                </div>

                {/* Abbreviation */}
                {agency.abbreviation && (
                    <div className="absolute bottom-3 left-4">
                        <span className="text-2xl font-bold text-white/80 font-mono tracking-tight">
                            {agency.abbreviation}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="text-white font-semibold text-[14px] leading-snug mb-1 group-hover:text-blue-300 transition-colors line-clamp-2">
                    {agency.name}
                </h3>
                <div className="flex items-center gap-1.5 mb-3">
                    {agency.countryCode && (
                        <span className="text-[11px] font-mono text-white/35">
                            {agency.countryCode}
                        </span>
                    )}
                    {agency.foundedYear && (
                        <>
                            <span className="text-white/15 text-xs">·</span>
                            <span className="text-[11px] font-mono text-white/35">
                                Est. {agency.foundedYear}
                            </span>
                        </>
                    )}
                </div>

                {agency.description && (
                    <p className="text-white/40 text-xs leading-relaxed line-clamp-2 mb-3">
                        {agency.description}
                    </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 pt-3 border-t border-white/[0.06]">
                    <span className="flex items-center gap-1.5 text-[11px] font-mono text-white/30">
                        <Rocket className="w-3 h-3" />
                        {agency._count.missions} missions
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-mono text-white/30">
                        <Users className="w-3 h-3" />
                        {agency._count.people} people
                    </span>
                </div>
            </div>
        </Link>
    )
}

// ─── Page ─────────────────────────────────────────────────

export default async function AgenciesPage({
    searchParams,
}: {
    searchParams: Promise<{ type?: string; page?: string }>
}) {
    const params = await searchParams
    const type = (params.type as AgencyType) || null
    const page = Math.max(1, parseInt(params.page ?? '1', 10))

    const { items, total, totalPages } = await getAgencies({
        type: type ?? undefined,
        page,
    })

    return (
        <div className="min-h-screen bg-black">
            <Navbar />

            {/* Header */}
            <div className="border-b border-white/[0.06] pt-20">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">
                        Encyclopedia / Agencies
                    </p>
                    <h1 className="text-2xl font-semibold text-white mb-1">Space Agencies</h1>
                    <p className="text-white/40 text-sm">
                        {total} {total === 1 ? 'agency' : 'agencies'} catalogued
                    </p>

                    {/* Filter tabs */}
                    <div className="flex items-center gap-1.5 mt-6 flex-wrap">
                        {TYPE_FILTERS.map(({ label, value }) => {
                            const active = value === 'ALL' ? !type : type === value
                            return (
                                <Link
                                    key={value}
                                    href={value === 'ALL' ? '/agencies' : `/agencies?type=${value}`}
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
                        <Globe className="w-10 h-10 text-white/10 mb-4" />
                        <p className="text-white/20 text-sm">No agencies found</p>
                        <Link href="/agencies" className="mt-4 text-xs text-blue-400 hover:text-blue-300">
                            Clear filters
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {items.map((agency) => (
                            <AgencyCard key={agency.id} agency={agency} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                        {page > 1 && (
                            <Link
                                href={`/agencies?${type ? `type=${type}&` : ''}page=${page - 1}`}
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
                                href={`/agencies?${type ? `type=${type}&` : ''}page=${page + 1}`}
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