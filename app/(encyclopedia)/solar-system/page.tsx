import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import SolarSystemScene from '@/components/solar-system/SolarSystemScene'
import { getPlanetsForOrbitScene } from '@/lib/services/celestial.service'
import { PLANET_ORBITAL_ELEMENTS } from '@/lib/orbital-mechanics'

export const dynamic = 'force-dynamic' // positions depend on today's date

export const metadata = {
    title: 'Solar System | CosmicHub',
    description: "An interactive 3D view of the solar system, with planets positioned at their real orbital location for today's date.",
}

function formatPeriod(days: number): string {
    if (days < 1) return `${(days * 24).toFixed(1)} hours`
    if (days < 365) return `${days.toFixed(0)} days`
    return `${(days / 365.25).toFixed(1)} years`
}

export default async function SolarSystemPage() {
    const planets = await getPlanetsForOrbitScene()
    const planetBySlug = new Map(planets.map(p => [p.slug, p]))

    return (
        <div className="min-h-screen space-bg">
            <Navbar />

            <div className="pt-28 pb-10 px-6">
                <div className="max-w-7xl mx-auto">
                    <p className="text-[11px] font-mono text-blue-400 tracking-[0.2em] uppercase mb-2">
                        Interactive
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
                        The Solar System, Right Now
                    </h1>
                    <p className="text-gray-500 text-sm max-w-2xl">
                        Each planet is positioned at its approximate real orbital location for today&apos;s date.
                        Drag to rotate, scroll to zoom, and click any planet to open its full profile.
                        Sizes and distances are scaled for visibility, not true to scale.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-black">
                    <SolarSystemScene planets={planets} variant="full" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16">
                <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-6">
                    Planets in Order From the Sun
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {PLANET_ORBITAL_ELEMENTS.map((el) => {
                        const planet = planetBySlug.get(el.slug)
                        if (!planet) return null
                        return (
                            <Link
                                key={el.slug}
                                href={`/celestial/${el.slug}`}
                                className="group bg-white/[0.02] border border-white/[0.07] rounded-xl p-4 hover:border-white/20 transition-colors"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: el.displayColor }}
                                    />
                                    <span className="text-white text-sm font-medium group-hover:text-blue-400 transition-colors">
                                        {planet.name}
                                    </span>
                                </div>
                                <dl className="space-y-1.5">
                                    <div className="flex justify-between">
                                        <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider">Distance</dt>
                                        <dd className="text-white/60 text-xs">{el.semiMajorAxisAU} AU</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-[10px] font-mono text-white/25 uppercase tracking-wider">Orbit</dt>
                                        <dd className="text-white/60 text-xs">{formatPeriod(el.orbitalPeriodDays)}</dd>
                                    </div>
                                </dl>
                            </Link>
                        )
                    })}
                </div>
            </div>

            <Footer />
        </div>
    )
}