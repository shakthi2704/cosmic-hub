import Link from 'next/link'
import SolarSystemScene from '@/components/solar-system/SolarSystemScene'
import { getPlanetsForOrbitScene } from '@/lib/services/celestial.service'

export default async function SolarSystemTeaser() {
    const planets = await getPlanetsForOrbitScene()

    return (
        <section className="space-bg py-24 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-black relative group">
                    <SolarSystemScene planets={planets} variant="teaser" />

                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent">
                        <p className="text-[11px] font-mono text-blue-400 tracking-[0.2em] uppercase mb-2">
                            Interactive
                        </p>
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-4 text-center px-4">
                            Explore the Solar System in 3D
                        </h2>
                        <Link
                            href="/solar-system"
                            className="pointer-events-auto inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
                        >
                            Open full view
                            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}