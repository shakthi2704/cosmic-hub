import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getPersonBySlug } from '@/lib/services/people.service'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { PersonRole, MissionStatus } from '@prisma/client'
import { Calendar, Flag, Building2 } from 'lucide-react'

// ─── Meta ─────────────────────────────────────────────────

const ROLE_META: Record<PersonRole, { label: string; accent: string }> = {
    ASTRONAUT: { label: 'Astronaut', accent: '#4a90d9' },
    COSMONAUT: { label: 'Cosmonaut', accent: '#a855f7' },
    SCIENTIST: { label: 'Scientist', accent: '#f5a623' },
    ENGINEER: { label: 'Engineer', accent: '#27ae60' },
    DIRECTOR: { label: 'Director', accent: '#e74c9f' },
    OTHER: { label: 'Other', accent: '#6b7280' },
}

const STATUS_META: Record<MissionStatus, { label: string; color: string }> = {
    PLANNED: { label: 'Planned', color: '#6b7280' },
    ACTIVE: { label: 'Active', color: '#22c55e' },
    COMPLETED: { label: 'Completed', color: '#4a90d9' },
    FAILED: { label: 'Failed', color: '#ef4444' },
    CANCELLED: { label: 'Cancelled', color: '#f97316' },
}

// ─── Page ─────────────────────────────────────────────────

export default async function PersonDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const person = await getPersonBySlug(slug)
    if (!person) notFound()

    const rm = ROLE_META[person.role]

    return (
        <div className="min-h-screen bg-black">
            <Navbar />

            {/* Hero */}
            <div className="relative pt-14">
                {/* Background blur from portrait */}
                {person.imageUrl && (
                    <div className="absolute inset-0 h-80 overflow-hidden">
                        <Image
                            src={person.imageUrl}
                            alt={person.name}
                            fill
                            className="object-cover object-top opacity-20 blur-2xl scale-110"
                            sizes="100vw"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
                    </div>
                )}

                <div className="relative max-w-5xl mx-auto px-6 pt-10 pb-0">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-white/30 font-mono mb-8">
                        <Link href="/people" className="hover:text-white/60 transition-colors">
                            People
                        </Link>
                        <span>›</span>
                        <span className="text-white/50">{person.name}</span>
                    </div>

                    {/* Profile header */}
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                        {/* Portrait */}
                        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shrink-0 border border-white/[0.10] bg-white/[0.04]">
                            {person.imageUrl ? (
                                <Image
                                    src={person.imageUrl}
                                    alt={person.name}
                                    fill
                                    className="object-cover object-top"
                                    sizes="144px"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-12 h-12 text-white/10">
                                        <circle cx="12" cy="8" r="4" />
                                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Name + meta */}
                        <div className="flex-1 min-w-0">
                            <span
                                className="inline-block text-[10px] font-mono font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-3"
                                style={{
                                    color: rm.accent,
                                    borderColor: `${rm.accent}50`,
                                    backgroundColor: `${rm.accent}18`,
                                }}
                            >
                                {rm.label}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
                                {person.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                                {person.nationality && (
                                    <span className="flex items-center gap-1.5 text-xs text-white/40 font-mono">
                                        <Flag className="w-3 h-3" />
                                        {person.nationality}
                                    </span>
                                )}
                                {(person.birthYear || person.deathYear) && (
                                    <span className="flex items-center gap-1.5 text-xs text-white/40 font-mono">
                                        <Calendar className="w-3 h-3" />
                                        {person.birthYear ?? '?'}
                                        {person.deathYear ? ` – ${person.deathYear}` : ' – present'}
                                    </span>
                                )}
                                {person.agency && (
                                    <span className="flex items-center gap-1.5 text-xs text-white/40 font-mono">
                                        <Building2 className="w-3 h-3" />
                                        <Link
                                            href={`/agencies/${person.agency.slug}`}
                                            className="hover:text-white/70 transition-colors"
                                        >
                                            {person.agency.abbreviation ?? person.agency.name}
                                        </Link>
                                    </span>
                                )}
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

                        {/* Biography */}
                        {person.bio && (
                            <div>
                                <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">
                                    Biography
                                </h2>
                                <p className="text-white/70 leading-relaxed text-[15px]">
                                    {person.bio}
                                </p>
                            </div>
                        )}

                        {/* Missions */}
                        {person.missions.length > 0 && (
                            <div>
                                <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">
                                    Missions ({person.missions.length})
                                </h2>
                                <div className="space-y-2">
                                    {person.missions.map(({ mission }) => {
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
                    </div>

                    {/* Right — sidebar */}
                    <div>
                        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5 sticky top-20">
                            <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-5">
                                Profile
                            </h2>
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">Role</dt>
                                    <dd className="text-sm" style={{ color: rm.accent }}>{rm.label}</dd>
                                </div>

                                {person.nationality && (
                                    <div className="border-t border-white/[0.05] pt-4">
                                        <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">Nationality</dt>
                                        <dd className="text-white/70 text-sm">{person.nationality}</dd>
                                    </div>
                                )}

                                {person.birthYear && (
                                    <div className="border-t border-white/[0.05] pt-4">
                                        <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">Born</dt>
                                        <dd className="text-white/70 text-sm">{person.birthYear}</dd>
                                    </div>
                                )}

                                {person.deathYear && (
                                    <div className="border-t border-white/[0.05] pt-4">
                                        <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">Died</dt>
                                        <dd className="text-white/70 text-sm">{person.deathYear}</dd>
                                    </div>
                                )}

                                {person.agency && (
                                    <div className="border-t border-white/[0.05] pt-4">
                                        <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">Agency</dt>
                                        <dd className="text-sm">
                                            <Link
                                                href={`/agencies/${person.agency.slug}`}
                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                {person.agency.name}
                                            </Link>
                                        </dd>
                                    </div>
                                )}

                                {person.missions.length > 0 && (
                                    <div className="border-t border-white/[0.05] pt-4">
                                        <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">Missions</dt>
                                        <dd className="text-white/70 text-sm">{person.missions.length} recorded</dd>
                                    </div>
                                )}
                            </dl>

                            <div className="mt-6 pt-4 border-t border-white/[0.05]">
                                <Link
                                    href="/people"
                                    className="text-[11px] text-white/30 hover:text-white/60 transition-colors font-mono flex items-center gap-1.5"
                                >
                                    ← All people
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