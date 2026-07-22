import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getAgencyBySlug } from '@/lib/services/agency.service'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { AgencyType, MissionStatus, MissionType, PersonRole } from '@prisma/client'
import { Globe, Rocket, Users, Calendar, Building2 } from 'lucide-react'

// ─── Meta ─────────────────────────────────────────────────

const TYPE_META: Record<AgencyType, { label: string; accent: string }> = {
    GOVERNMENT: { label: 'Government', accent: '#4a90d9' },
    PRIVATE: { label: 'Private', accent: '#22c55e' },
    INTERNATIONAL: { label: 'International', accent: '#a855f7' },
    RESEARCH: { label: 'Research', accent: '#f5a623' },
}

const STATUS_META: Record<MissionStatus, { label: string; color: string }> = {
    PLANNED: { label: 'Planned', color: '#6b7280' },
    ACTIVE: { label: 'Active', color: '#22c55e' },
    COMPLETED: { label: 'Completed', color: '#4a90d9' },
    FAILED: { label: 'Failed', color: '#ef4444' },
    CANCELLED: { label: 'Cancelled', color: '#f97316' },
}

const ROLE_META: Record<PersonRole, { label: string }> = {
    ASTRONAUT: { label: 'Astronaut' },
    COSMONAUT: { label: 'Cosmonaut' },
    SCIENTIST: { label: 'Scientist' },
    ENGINEER: { label: 'Engineer' },
    DIRECTOR: { label: 'Director' },
    OTHER: { label: 'Other' },
}

const AGENCY_IMAGES: Record<string, string> = {
    'nasa': 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=1400&q=85',
    'esa': 'https://images.unsplash.com/photo-1516849677043-ef67c9557e16?w=1400&q=85',
    'spacex': 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1400&q=85',
    'roscosmos': 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1400&q=85',
    'isro': 'https://images.unsplash.com/photo-1614732484003-ef9881555dc3?w=1400&q=85',
}

const FALLBACK = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&q=85'

// ─── Page ─────────────────────────────────────────────────

export default async function AgencyDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const agency = await getAgencyBySlug(slug)
    if (!agency) notFound()

    const tm = TYPE_META[agency.type]
    const image = AGENCY_IMAGES[agency.slug] ?? FALLBACK

    return (
        <div className="min-h-screen bg-black">
            <Navbar />

            {/* Hero */}
            <div className="relative h-[45vh] min-h-[320px] overflow-hidden">
                <Image
                    src={image}
                    alt={agency.name}
                    fill
                    priority
                    className="object-cover opacity-40"
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />

                {/* Breadcrumb */}
                <div className="absolute top-20 inset-x-0 z-10">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="flex items-center gap-2 text-xs text-white/30 font-mono">
                            <Link href="/agencies" className="hover:text-white/60 transition-colors">
                                Agencies
                            </Link>
                            <span>›</span>
                            <span className="text-white/50">{agency.abbreviation ?? agency.name}</span>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div className="absolute bottom-0 inset-x-0 z-10 pb-10">
                    <div className="max-w-5xl mx-auto px-6">
                        <span
                            className="inline-block text-[10px] font-mono font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-4"
                            style={{
                                color: tm.accent,
                                borderColor: `${tm.accent}50`,
                                backgroundColor: `${tm.accent}18`,
                            }}
                        >
                            {tm.label}
                        </span>
                        <div className="flex items-end gap-4">
                            <div>
                                {agency.abbreviation && (
                                    <p className="text-5xl md:text-6xl font-black text-white/10 font-mono tracking-tighter leading-none mb-1">
                                        {agency.abbreviation}
                                    </p>
                                )}
                                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                    {agency.name}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left — main content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Description */}
                        {agency.description && (
                            <div>
                                <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">
                                    About
                                </h2>
                                <p className="text-white/70 leading-relaxed text-[15px]">
                                    {agency.description}
                                </p>
                                {agency.websiteUrl && (
                                    <a
                                        href={agency.websiteUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 mt-4 text-xs text-blue-400 hover:text-blue-300 transition-colors font-mono"
                                    >
                                        <Globe className="w-3.5 h-3.5" />
                                        Visit official website →
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Missions */}
                        {agency.missions.length > 0 && (
                            <div>
                                <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">
                                    Missions ({agency.missions.length})
                                </h2>
                                <div className="space-y-2">
                                    {agency.missions.map((mission) => {
                                        const sm = STATUS_META[mission.status]
                                        return (
                                            <Link
                                                key={mission.id}
                                                href={`/missions/${mission.slug}`}
                                                className="group flex items-center justify-between px-5 py-4 bg-white/[0.02] border border-white/[0.07] rounded-xl hover:bg-white/[0.05] hover:border-white/[0.12] transition-all"
                                            >
                                                <div>
                                                    <p className="text-white font-medium text-sm group-hover:text-blue-300 transition-colors">
                                                        {mission.name}
                                                    </p>
                                                    <p className="text-white/30 text-xs font-mono mt-0.5">
                                                        {mission.missionType.replace(/_/g, ' ')}
                                                        {mission.launchDate && ` · ${new Date(mission.launchDate).getFullYear()}`}
                                                    </p>
                                                </div>
                                                <span
                                                    className="shrink-0 text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                                                    style={{
                                                        color: sm.color,
                                                        borderColor: `${sm.color}40`,
                                                        backgroundColor: `${sm.color}12`,
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

                        {/* People */}
                        {agency.people.length > 0 && (
                            <div>
                                <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">
                                    People ({agency.people.length})
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {agency.people.map((person) => (
                                        <Link
                                            key={person.id}
                                            href={`/people/${person.slug}`}
                                            className="group flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/[0.07] rounded-xl hover:bg-white/[0.05] hover:border-white/[0.12] transition-all"
                                        >
                                            <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 bg-white/[0.06]">
                                                {person.imageUrl && (
                                                    <Image
                                                        src={person.imageUrl}
                                                        alt={person.name}
                                                        fill
                                                        className="object-cover object-top"
                                                        sizes="36px"
                                                    />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-white/80 text-sm font-medium truncate group-hover:text-white transition-colors">
                                                    {person.name}
                                                </p>
                                                <p className="text-white/30 text-[11px] font-mono">
                                                    {ROLE_META[person.role].label}
                                                    {person.nationality && ` · ${person.nationality}`}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right — sidebar */}
                    <div>
                        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5 sticky top-20">
                            <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-5">
                                Agency Facts
                            </h2>
                            <dl className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Building2 className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" />
                                    <div>
                                        <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">Type</dt>
                                        <dd className="text-sm" style={{ color: tm.accent }}>{tm.label}</dd>
                                    </div>
                                </div>

                                {agency.countryCode && (
                                    <div className="flex items-start gap-3 border-t border-white/[0.05] pt-4">
                                        <Globe className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" />
                                        <div>
                                            <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">Country</dt>
                                            <dd className="text-white/70 text-sm">{agency.countryCode}</dd>
                                        </div>
                                    </div>
                                )}

                                {agency.foundedYear && (
                                    <div className="flex items-start gap-3 border-t border-white/[0.05] pt-4">
                                        <Calendar className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" />
                                        <div>
                                            <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">Founded</dt>
                                            <dd className="text-white/70 text-sm">{agency.foundedYear}</dd>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3 border-t border-white/[0.05] pt-4">
                                    <Rocket className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" />
                                    <div>
                                        <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">Missions</dt>
                                        <dd className="text-white/70 text-sm">{agency._count.missions} recorded</dd>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 border-t border-white/[0.05] pt-4">
                                    <Users className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" />
                                    <div>
                                        <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">People</dt>
                                        <dd className="text-white/70 text-sm">{agency._count.people} profiles</dd>
                                    </div>
                                </div>

                                {agency.websiteUrl && (
                                    <div className="border-t border-white/[0.05] pt-4">
                                        <a
                                            href={agency.websiteUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors font-mono"
                                        >
                                            <Globe className="w-3.5 h-3.5" />
                                            Official Website
                                        </a>
                                    </div>
                                )}
                            </dl>

                            <div className="mt-6 pt-4 border-t border-white/[0.05]">
                                <Link
                                    href="/agencies"
                                    className="text-[11px] text-white/30 hover:text-white/60 transition-colors font-mono flex items-center gap-1.5"
                                >
                                    ← All agencies
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