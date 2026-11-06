'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowDown } from 'lucide-react'
import { useJourney, seg } from '@/components/journey/useJourney'
import ChapterPanels from '@/components/journey/ChapterPanels'
import { WORLDS, mixHex } from '@/components/journey/worlds'
import { JOURNEY_CONTENT } from '@/lib/journey-content'

// The heavy 3D code loads in the browser only, after the page is already readable.
const JourneyScene = dynamic(() => import('@/components/journey/JourneyScene'), { ssr: false })

const STEPS = WORLDS.length * 2 // overview + detail per chapter
/** Scroll distance per journey step, in screen heights (dvh). */
const SCROLL_PER_STEP = 80

const HERO = {
    kicker: 'CosmicHub · Space Encyclopedia',
    title: 'Your guide to the Universe',
    text: 'An interactive encyclopedia of planets, stars, galaxies and black holes. Scroll to begin the tour.',
    cta: { label: 'Explore the Universe', href: '/celestial' },
}

const ctaClass =
    'inline-flex items-center rounded-sm bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-black transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'

function hasWebGL() {
    try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
        gl?.getExtension('WEBGL_lose_context')?.loseContext()
        return !!gl
    } catch {
        return false
    }
}

/** Shown when the browser can't run WebGL: the same content, as plain cards. */
function TourFallback() {
    return (
        <section className="bg-black px-6 pb-16 pt-28 text-white">
            <div className="mx-auto max-w-7xl">
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/70">{HERO.kicker}</p>
                <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
                    {HERO.title}
                </h1>
                <p className="mt-4 max-w-xl text-white/80">
                    An interactive encyclopedia of planets, stars, galaxies and black holes.
                </p>
                <div className="mt-6">
                    <Link href={HERO.cta.href} className={ctaClass}>
                        {HERO.cta.label}
                    </Link>
                </div>
                <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {WORLDS.map((w) => (
                        <li key={w.slug} className="border-l border-white/30 pl-5">
                            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">{w.kicker}</p>
                            <h2 className="mt-1 text-2xl font-bold">{w.title}</h2>
                            <p className="mt-2 text-sm leading-relaxed text-white/80">{w.summary}</p>
                            <Link
                                href={w.primary.href}
                                className="mt-3 inline-block text-sm font-semibold underline underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                {w.primary.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

export default function HomeJourney() {
    const { containerRef, subscribe, goTo, activeChapter: activeStep } = useJourney(STEPS)
    const stRef = useRef(0)
    const stageRef = useRef<HTMLDivElement>(null)
    const wordRefs = useRef<(HTMLDivElement | null)[]>([])
    const heroRef = useRef<HTMLDivElement>(null)
    const hintRef = useRef<HTMLDivElement>(null)

    const [webgl, setWebgl] = useState<boolean | null>(null)
    const [inView, setInView] = useState(true)

    useEffect(() => {
        setWebgl(hasWebGL())
    }, [])

    // Pause the 3D canvas once the journey is scrolled out of view.
    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
            rootMargin: '200px 0px',
        })
        io.observe(el)
        return () => io.disconnect()
    }, [containerRef, webgl])

    useEffect(
        () =>
            subscribe((st) => {
                stRef.current = st // the 3D objects read this every frame

                // Blend the background between the colour worlds of neighbouring chapters.
                const stage = stageRef.current
                if (stage) {
                    const c = Math.max(0, Math.min(Math.floor(st / 2), WORLDS.length - 1))
                    const next = WORLDS[Math.min(c + 1, WORLDS.length - 1)]
                    const t = c < WORLDS.length - 1 ? seg(st - 2 * c, 1, 2) : 0
                    WORLDS[c].stops.forEach((from, i) =>
                        stage.style.setProperty(`--c${i}`, mixHex(from, next.stops[i], t))
                    )
                }

                // Each big word fades in as its world arrives and out as it slides aside.
                wordRefs.current.forEach((el, i) => {
                    if (!el) return
                    const b = st - 2 * i
                    el.style.opacity = String(seg(b, -0.6, 0) * (1 - seg(b, 0.1, 0.5)))
                })

                // Opening text and scroll hint fade as the tour begins.
                const hero = heroRef.current
                if (hero) {
                    const o = 1 - seg(st, 0.05, 0.45)
                    hero.style.opacity = String(o)
                    const vis = o > 0.02 ? 'visible' : 'hidden'
                    if (hero.style.visibility !== vis) hero.style.visibility = vis
                }
                if (hintRef.current) hintRef.current.style.opacity = String(1 - seg(st, 0, 0.25))
            }),
        [subscribe]
    )

    if (webgl === false) return <TourFallback />

    const activeChapter = Math.min(Math.floor(activeStep / 2), WORLDS.length - 1)
    const initialColours = Object.fromEntries(WORLDS[0].stops.map((s, i) => [`--c${i}`, s])) as CSSProperties

    return (
        <>
            <div
                ref={containerRef}
                data-nav-transparent
                style={{ height: `${STEPS * SCROLL_PER_STEP}dvh` }}
            >
                <div
                    ref={stageRef}
                    className="sticky top-0 h-dvh overflow-hidden text-white"
                    style={{
                        ...initialColours,
                        background:
                            'radial-gradient(58% 72% at 50% 47%, var(--c0) 0%, var(--c1) 32%, var(--c2) 62%, var(--c3) 100%), #3b1405',
                    }}
                >
                    {/* Skip the tour */}
                    <a
                        href="#after-journey"
                        className="absolute right-6 top-[4.5rem] z-20 rounded-sm px-2 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-white/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                        Skip the tour ↓
                    </a>

                    {/* Big words behind the objects */}
                    {WORLDS.map((w, i) => (
                        <div
                            key={w.slug}
                            ref={(el) => {
                                wordRefs.current[i] = el
                            }}
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 flex select-none items-center justify-center font-black leading-none tracking-tighter"
                            style={{
                                fontSize: w.wordSize ?? 'min(24vw, 44vh)',
                                opacity: i === 0 ? 1 : 0,
                                transform: w.wordOffset ? `translateY(${w.wordOffset})` : undefined,
                            }}
                        >
                            {w.word}
                        </div>
                    ))}

                    {/* The single WebGL canvas, shared by every chapter */}
                    {webgl && (
                        <div className="absolute inset-0" aria-hidden="true">
                            <JourneyScene stRef={stRef} active={inView} />
                        </div>
                    )}

                    {/* Educational text for each chapter's detail step */}
                    <ChapterPanels content={JOURNEY_CONTENT} subscribe={subscribe} />

                    {/* Opening text */}
                    <div
                        ref={heroRef}
                        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-6 pb-14 md:pb-16 [text-shadow:0_1px_14px_rgba(0,0,0,0.4)]"
                    >
                        {/* Soft shade behind the text, so it stays readable over the planet and big word */}
                        <div
                            aria-hidden="true"
                            className="absolute inset-x-0 -top-24 bottom-0 bg-gradient-to-t from-black/45 via-black/20 to-transparent"
                        />
                        <div className="relative mx-auto max-w-7xl">
                            <div className="pointer-events-auto max-w-lg">
                                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/85">
                                    {HERO.kicker}
                                </p>
                                <h1 className="mt-2 text-3xl font-extrabold leading-[1.05] tracking-tight md:text-4xl">
                                    {HERO.title}
                                </h1>
                                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/90">{HERO.text}</p>
                                <div className="mt-5">
                                    <Link href={HERO.cta.href} className={ctaClass}>
                                        {HERO.cta.label}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scroll hint */}
                    <div
                        ref={hintRef}
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white/80"
                    >
                        <span>Scroll to travel</span>
                        <ArrowDown className="h-3.5 w-3.5 animate-bounce motion-reduce:animate-none" />
                    </div>

                    {/* Chapter rail */}
                    <nav
                        aria-label="Tour chapters"
                        className="absolute left-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-4 md:flex"
                    >
                        {WORLDS.map((w, i) => (
                            <button
                                key={w.slug}
                                type="button"
                                onClick={() => goTo(i * 2)}
                                aria-label={`Go to ${w.name}`}
                                aria-current={i === activeChapter ? 'step' : undefined}
                                className={`h-2.5 w-2.5 rounded-full border border-white/80 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${i === activeChapter ? 'scale-125 bg-white' : 'bg-transparent'
                                    }`}
                            />
                        ))}
                    </nav>
                </div>
            </div>

            {/* Where "Skip the tour" lands */}
            <div id="after-journey" tabIndex={-1} />
        </>
    )
}