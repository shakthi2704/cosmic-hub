import { Fragment } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CelestialType } from '@prisma/client'
import { getCelestialObjects, getCelestialTypeCounts } from '@/lib/services/celestial.service'
import { categories } from '@/config/nav'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ViewToggle from '@/components/encyclopedia/ViewToggle'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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

function formatMass(kg: number | null): string {
    if (!kg) return '—'
    if (kg >= 1e30) return `${(kg / 1.989e30).toFixed(2)} M☉`
    if (kg >= 1e27) return `${(kg / 1.898e27).toFixed(2)} MJ`
    if (kg >= 1e24) return `${(kg / 5.972e24).toFixed(2)} M⊕`
    return `${kg.toExponential(2)} kg`
}

function formatRadius(km: number | null): string {
    if (!km) return '—'
    if (km >= 1e6) return `${(km / 1e6).toFixed(2)} × 10⁶ km`
    return `${km.toLocaleString()} km`
}

function ObjectCardGrid({ obj }: { obj: Awaited<ReturnType<typeof getCelestialObjects>>['items'][number] }) {
    const meta = TYPE_META[obj.type]
    return (
        <Link href={`/celestial/${obj.slug}`} className="group block space-card rounded-xl overflow-hidden">
            <div className="relative h-44 overflow-hidden bg-white/[0.03]">
                {obj.imageUrl ? (
                    <Image
                        src={obj.imageUrl}
                        alt={obj.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                        {Array.from({ length: 14 }, (_, i) => (
                            <span
                                key={i}
                                className="absolute rounded-full bg-white animate-twinkle"
                                style={{
                                    top: `${(i * 37.1) % 100}%`,
                                    left: `${(i * 61.7) % 100}%`,
                                    width: '1px',
                                    height: '1px',
                                    opacity: 0.15 + (i % 5) * 0.05,
                                    animationDelay: `${i % 5}s`,
                                }}
                            />
                        ))}
                        <div
                            className="w-16 h-16 rounded-full"
                            style={{
                                background: `radial-gradient(circle at 35% 30%, ${meta.accent}cc, ${meta.accent}33 55%, transparent 75%)`,
                                boxShadow: `0 0 30px 6px ${meta.accent}25`,
                            }}
                        />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <span
                    className="absolute top-3 left-3 text-[10px] font-mono font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border"
                    style={{ color: meta.accent, borderColor: `${meta.accent}40`, backgroundColor: `${meta.accent}15` }}
                >
                    {meta.label}
                </span>
            </div>
            <div className="p-4">
                <h3 className="text-white font-semibold text-[15px] mb-1 group-hover:text-blue-300 transition-colors">
                    {obj.name}
                </h3>
                {obj.summary && (
                    <p className="text-white/40 text-xs leading-relaxed line-clamp-2 mb-3">
                        {obj.summary}
                    </p>
                )}
                <div className="flex gap-4 border-t border-white/[0.06] pt-3 mt-auto">
                    <div>
                        <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Mass</p>
                        <p className="text-white/70 text-[11px] font-mono mt-0.5">{formatMass(obj.massKg)}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Radius</p>
                        <p className="text-white/70 text-[11px] font-mono mt-0.5">{formatRadius(obj.radiusKm)}</p>
                    </div>
                </div>
            </div>
        </Link>
    )
}

function ObjectCardList({ obj }: { obj: Awaited<ReturnType<typeof getCelestialObjects>>['items'][number] }) {
    const meta = TYPE_META[obj.type]
    return (
        <Link
            href={`/celestial/${obj.slug}`}
            className="group flex items-center gap-4 space-card rounded-xl px-5 py-4 hover:bg-white/[0.04] transition-colors"
        >
            <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-white/[0.04]">
                {obj.imageUrl ? (
                    <Image src={obj.imageUrl} alt={obj.name} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" sizes="56px" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div
                            className="w-7 h-7 rounded-full"
                            style={{
                                background: `radial-gradient(circle at 35% 30%, ${meta.accent}cc, ${meta.accent}33 55%, transparent 75%)`,
                            }}
                        />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-white font-semibold text-[14px] group-hover:text-blue-300 transition-colors truncate">
                        {obj.name}
                    </h3>
                    <span
                        className="text-[9px] font-mono font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded-full border shrink-0"
                        style={{ color: meta.accent, borderColor: `${meta.accent}40`, backgroundColor: `${meta.accent}15` }}
                    >
                        {meta.label}
                    </span>
                </div>
                {obj.summary && (
                    <p className="text-white/40 text-xs leading-relaxed line-clamp-1">{obj.summary}</p>
                )}
            </div>
            <div className="hidden md:flex gap-6 shrink-0 text-right">
                <div>
                    <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Mass</p>
                    <p className="text-white/60 text-xs font-mono mt-0.5">{formatMass(obj.massKg)}</p>
                </div>
                <div>
                    <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Radius</p>
                    <p className="text-white/60 text-xs font-mono mt-0.5">{formatRadius(obj.radiusKm)}</p>
                </div>
                <div className="text-white/20 group-hover:text-white/60 transition-colors self-center">›</div>
            </div>
        </Link>
    )
}

function FilterSidebar({
    activeType,
    typeCounts,
}: {
    activeType: string | null
    typeCounts: { type: CelestialType; count: number }[]
}) {
    const countMap = Object.fromEntries(typeCounts.map(t => [t.type, t.count])) as Partial<Record<CelestialType, number>>
    const total = typeCounts.reduce((a, b) => a + b.count, 0)

    const typeFilters = categories
        .filter((c) => c.type !== 'MISSION')
        .map((c) => ({
            label: c.label,
            type: c.type as CelestialType,
            accent: c.accent,
            count: countMap[c.type as CelestialType] ?? 0,
        }))

    return (
        <aside className="w-56 shrink-0">
            <div className="sticky top-20 space-y-6">
                <div>
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">Object Type</p>
                    <div className="space-y-0.5">
                        <Link
                            href="/celestial"
                            className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors ${!activeType
                                ? 'bg-white/[0.08] text-white'
                                : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                                }`}
                        >
                            <span>All Objects</span>
                            <span className="text-xs font-mono text-white/30">{total}</span>
                        </Link>
                        {typeFilters.map(({ label, type, accent, count }) => (
                            <Link
                                key={type}
                                href={`/celestial?type=${type}`}
                                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors ${activeType === type
                                    ? 'bg-white/[0.08] text-white'
                                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
                                    {label}
                                </span>
                                <span className="text-xs font-mono text-white/30">{count}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="border-t border-white/[0.06]" />

                <div>
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">Browse</p>
                    <div className="space-y-0.5">
                        {[
                            { label: 'Missions', href: '/missions' },
                            { label: 'People', href: '/people' },
                            { label: 'Agencies', href: '/agencies' },
                        ].map(({ label, href }) => (
                            <Link
                                key={href}
                                href={href}
                                className="flex items-center w-full px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-colors"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    )
}

function Pagination({
    page,
    totalPages,
    type,
}: {
    page: number
    totalPages: number
    type: string | null
}) {
    if (totalPages <= 1) return null
    const base = `/celestial${type ? `?type=${type}&` : '?'}`
    const prev = page > 1 ? `${base}page=${page - 1}` : null
    const next = page < totalPages ? `${base}page=${page + 1}` : null
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
        (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
    )

    return (
        <div className="flex items-center justify-center gap-2 mt-10">
            {prev ? (
                <Link href={prev} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                </Link>
            ) : (
                <span className="p-2 text-white/20 cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></span>
            )}

            {pages.map((p, i) => {
                const prevPage = pages[i - 1]
                return (
                    <Fragment key={p}>
                        {prevPage && p - prevPage > 1 && (
                            <span key={`ellipsis-${p}`} className="text-white/20 text-sm px-1">…</span>
                        )}
                        <Link
                            href={`${base}page=${p}`}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-mono transition-colors ${p === page
                                ? 'bg-white/10 text-white border border-white/20'
                                : 'text-white/40 hover:text-white hover:bg-white/[0.06]'
                                }`}
                        >
                            {p}
                        </Link>
                    </Fragment>
                )
            })}

            {next ? (
                <Link href={next} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors">
                    <ChevronRight className="w-4 h-4" />
                </Link>
            ) : (
                <span className="p-2 text-white/20 cursor-not-allowed"><ChevronRight className="w-4 h-4" /></span>
            )}
        </div>
    )
}

export default async function CelestialPage({
    searchParams,
}: {
    searchParams: Promise<{ type?: string; page?: string; view?: string }>
}) {
    const params = await searchParams
    const type = (params.type as CelestialType) || null
    const page = Math.max(1, parseInt(params.page ?? '1', 10))
    const view = params.view === 'list' ? 'list' : 'grid'

    const [{ items, total, totalPages }, typeCounts] = await Promise.all([
        getCelestialObjects({ type: type ?? undefined, page }),
        getCelestialTypeCounts(),
    ])

    const activeLabel = type ? TYPE_META[type]?.label : 'All Objects'

    return (
        <div className="min-h-screen bg-black">
            <Navbar />

            {/* Page header */}
            <div className="border-b border-white/[0.06] pt-20">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">
                        Encyclopedia / Celestial Objects
                    </p>
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-white">{activeLabel}</h1>
                            <p className="text-white/40 text-sm mt-1">
                                {total} {total === 1 ? 'object' : 'objects'} catalogued
                            </p>
                        </div>
                        <ViewToggle current={view} type={type} page={page} />
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
                <FilterSidebar activeType={type} typeCounts={typeCounts} />

                <div className="flex-1 min-w-0">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <p className="text-white/20 text-sm">No objects found</p>
                            <Link href="/celestial" className="mt-4 text-xs text-blue-400 hover:text-blue-300">
                                Clear filters
                            </Link>
                        </div>
                    ) : view === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map((obj) => (
                                <ObjectCardGrid key={obj.id} obj={obj} />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {items.map((obj) => (
                                <ObjectCardList key={obj.id} obj={obj} />
                            ))}
                        </div>
                    )}

                    <Pagination page={page} totalPages={totalPages} type={type} />
                </div>
            </div>

            <Footer />
        </div>
    )
}