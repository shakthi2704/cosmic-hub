import Link from 'next/link'
import { Button } from '@/components/ui/button'

const STARS = Array.from({ length: 120 }, (_, i) => ({
    id: i,
    top: `${(i * 137.508) % 100}%`,
    left: `${(i * 97.346) % 100}%`,
    dur: `${2 + (i % 5)}s`,
    delay: `${(i % 6)}s`,
    size: i % 7 === 0 ? '2px' : '1px',
    opacity: 0.2 + (i % 10) * 0.06,
}))

export default function Hero() {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden space-bg pt-14">

            {/* Background image */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=1800&q=85')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 40%',
                }}
            />

            {/* Overlays */}
            <div className="absolute inset-0 z-[1] bg-[#04040a]/70" />
            <div className="absolute inset-0 z-[2] bg-gradient-to-b from-[#04040a]/40 via-transparent to-[#04040a]" />

            {/* Star field */}
            <div className="absolute inset-0 z-[3] pointer-events-none" aria-hidden>
                {STARS.map(s => (
                    <span
                        key={s.id}
                        className="absolute rounded-full bg-white animate-twinkle"
                        style={{
                            top: s.top,
                            left: s.left,
                            width: s.size,
                            height: s.size,
                            '--dur': s.dur,
                            animationDelay: s.delay,
                            opacity: s.opacity,
                        } as React.CSSProperties}
                    />
                ))}
            </div>

            {/* Floating planets */}
            <div
                className="absolute top-[18%] right-[8%] w-[68px] h-[68px] z-[4] animate-float pointer-events-none"
                style={{ animationDelay: '0s' }}
                aria-hidden
            >
                <div className="planet-gold w-full h-full rounded-full" />
                <div className="planet-ring" />
            </div>

            <div
                className="absolute top-[24%] left-[7%] w-[48px] h-[48px] z-[4] animate-float pointer-events-none"
                style={{ animationDelay: '2.5s' }}
                aria-hidden
            >
                <div className="planet-blue w-full h-full rounded-full" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full text-center px-6 max-w-5xl mx-auto pb-16">

                {/* Live badge */}
                <div className="animate-fade-up mb-7 inline-block">
                    <Link href="/launches">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono bg-white/[0.06] border border-white/[0.10] text-gray-300 hover:bg-white/[0.10] transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-dot" />
                            Latest: James Webb Telescope Discoveries
                        </span>
                    </Link>
                </div>

                {/* Headline */}
                <h1 className="animate-fade-up delay-1 font-hero  font-bold leading-[1.05] tracking-tight mb-6">
                    <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white">
                        Explore the wonders
                    </span>
                    <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl bg-gradient-to-r from-blue-300 via-blue-200 to-white bg-clip-text text-transparent">
                        of the universe
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="animate-fade-up delay-2 text-base md:text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
                    Journey through a database of 8,500+ celestial objects. From distant
                    nebulae to real-time orbital data — the cosmos is at your fingertips.
                </p>

                {/* CTAs */}
                <div className="animate-fade-up delay-3 flex flex-col sm:flex-row gap-3 justify-center mb-14">
                    <Link href="/celestial">
                        <Button
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-500 text-white border-0 px-8 h-11 text-sm font-medium"
                        >
                            Start Exploring
                        </Button>
                    </Link>
                    <Link href="/missions">
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-white/15 bg-white/[0.05] text-white hover:bg-white/[0.10] hover:border-white/25 px-8 h-11 text-sm font-medium backdrop-blur-sm"
                        >
                            View Discoveries
                        </Button>
                    </Link>
                </div>

                {/* Stats row */}
                <div className="animate-fade-up delay-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-center">
                    {[
                        { value: '8,500+', label: 'Celestial Objects' },
                        { value: '500+', label: 'Space Missions' },
                        { value: 'Live', label: 'Launch Tracking' },
                        { value: '4K+', label: 'NASA Images' },
                    ].map((stat, i) => (
                        <div key={stat.label} className="flex items-center gap-10">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xl font-bold text-white tracking-tight">{stat.value}</span>
                                <span className="text-[10px] text-gray-600 uppercase tracking-widest">{stat.label}</span>
                            </div>
                            {i < 3 && (
                                <div className="hidden sm:block w-px h-6 bg-white/[0.08]" />
                            )}
                        </div>
                    ))}
                </div>

            </div>

            {/* Bottom fade */}
            <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#04040a] to-transparent z-[5] pointer-events-none" />
        </section>
    )
}