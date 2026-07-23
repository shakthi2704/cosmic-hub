"use client"
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const STARS = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    top: `${(i * 137.508) % 100}%`,
    left: `${(i * 97.346) % 100}%`,
    dur: `${2 + (i % 5)}s`,
    delay: `${i % 6}s`,
    size: i % 7 === 0 ? '2px' : '1px',
    opacity: 0.2 + (i % 10) * 0.06,
}))

export default function NotFound() {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden space-bg px-6">
            {/* Star field */}
            <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden>
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

            {/* Drifting planet */}
            <div
                className="absolute top-[16%] right-[10%] w-[70px] h-[70px] z-[1] animate-float pointer-events-none hidden sm:block"
                aria-hidden
            >
                <div className="planet-blue w-full h-full rounded-full" />
            </div>

            {/* Content */}
            <div className="relative z-[2] flex flex-col items-center text-center animate-fade-up">
                <span className="font-mono text-xs uppercase tracking-widest text-white/40">
                    Error 404
                </span>
                <h1 className="mt-4 font-hero text-7xl sm:text-8xl font-extrabold text-white">
                    Lost in Space
                </h1>
                <p className="mt-4 max-w-md text-white/50 text-sm sm:text-base">
                    This corner of the universe doesn&apos;t exist. The object,
                    mission, or page you&apos;re looking for may have drifted
                    out of orbit.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Button asChild size="lg">
                        <Link href="/">Return to Base</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/celestial">Browse Celestial Objects</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}