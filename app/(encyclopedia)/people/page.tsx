import Link from 'next/link'
import Image from 'next/image'
import { getPeople } from '@/lib/services/people.service'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { PersonRole } from '@prisma/client'

// ─── Meta ─────────────────────────────────────────────────

const ROLE_META: Record<PersonRole, { label: string; accent: string }> = {
    ASTRONAUT: { label: 'Astronaut', accent: '#4a90d9' },
    COSMONAUT: { label: 'Cosmonaut', accent: '#a855f7' },
    SCIENTIST: { label: 'Scientist', accent: '#f5a623' },
    ENGINEER: { label: 'Engineer', accent: '#27ae60' },
    DIRECTOR: { label: 'Director', accent: '#e74c9f' },
    OTHER: { label: 'Other', accent: '#6b7280' },
}

const ROLE_FILTERS: { label: string; value: PersonRole | 'ALL' }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Astronauts', value: 'ASTRONAUT' },
    { label: 'Cosmonauts', value: 'COSMONAUT' },
    { label: 'Scientists', value: 'SCIENTIST' },
    { label: 'Engineers', value: 'ENGINEER' },
    { label: 'Directors', value: 'DIRECTOR' },
]

// ─── Person Card ──────────────────────────────────────────

type Person = Awaited<ReturnType<typeof getPeople>>['items'][number]

function PersonCard({ person }: { person: Person }) {
    const rm = ROLE_META[person.role]

    return (
        <Link href={`/people/${person.slug}`} className="group block space-card rounded-2xl overflow-hidden">

            {/* Image */}
            <div className="relative h-56 overflow-hidden bg-white/[0.03]">
                {person.imageUrl ? (
                    <Image
                        src={person.imageUrl}
                        alt={person.name}
                        fill
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-105 opacity-75 group-hover:opacity-90"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-16 h-16 text-white/10">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                {/* Role badge */}
                <div className="absolute top-3 left-3">
                    <span
                        className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-sm"
                        style={{
                            color: rm.accent,
                            borderColor: `${rm.accent}50`,
                            backgroundColor: `${rm.accent}18`,
                        }}
                    >
                        {rm.label}
                    </span>
                </div>

                {/* Years */}
                <div className="absolute bottom-3 right-3">
                    <span className="text-[11px] font-mono text-white/40">
                        {person.birthYear}
                        {person.deathYear ? ` – ${person.deathYear}` : ''}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="text-white font-semibold text-[15px] leading-snug mb-1 group-hover:text-blue-300 transition-colors">
                    {person.name}
                </h3>
                <p className="text-white/35 text-xs font-mono mb-3">
                    {person.nationality ?? '—'}
                    {person.agency && ` · ${person.agency.abbreviation ?? person.agency.name}`}
                </p>

                {person.bio && (
                    <p className="text-white/40 text-xs leading-relaxed line-clamp-2">
                        {person.bio}
                    </p>
                )}

                {/* Mission count */}
                {person.missions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-white/25 uppercase tracking-wider">
                            Missions
                        </span>
                        <span className="text-[11px] font-mono text-white/50">
                            {person.missions.length}
                        </span>
                    </div>
                )}
            </div>
        </Link>
    )
}

// ─── Page ─────────────────────────────────────────────────

export default async function PeoplePage({
    searchParams,
}: {
    searchParams: Promise<{ role?: string; page?: string }>
}) {
    const params = await searchParams
    const role = (params.role as PersonRole) || null
    const page = Math.max(1, parseInt(params.page ?? '1', 10))

    const { items, total, totalPages } = await getPeople({
        role: role ?? undefined,
        page,
    })

    return (
        <div className="min-h-screen bg-black">
            <Navbar />

            {/* Header */}
            <div className="border-b border-white/[0.06] pt-20">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">
                        Encyclopedia / People
                    </p>
                    <h1 className="text-2xl font-semibold text-white mb-1">People of Space</h1>
                    <p className="text-white/40 text-sm">
                        {total} {total === 1 ? 'person' : 'people'} catalogued
                    </p>

                    {/* Filter tabs */}
                    <div className="flex items-center gap-1.5 mt-6 flex-wrap">
                        {ROLE_FILTERS.map(({ label, value }) => {
                            const active = value === 'ALL' ? !role : role === value
                            return (
                                <Link
                                    key={value}
                                    href={value === 'ALL' ? '/people' : `/people?role=${value}`}
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
                        <p className="text-white/20 text-sm">No people found</p>
                        <Link href="/people" className="mt-4 text-xs text-blue-400 hover:text-blue-300">
                            Clear filters
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {items.map((person) => (
                            <PersonCard key={person.id} person={person} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                        {page > 1 && (
                            <Link
                                href={`/people?${role ? `role=${role}&` : ''}page=${page - 1}`}
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
                                href={`/people?${role ? `role=${role}&` : ''}page=${page + 1}`}
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