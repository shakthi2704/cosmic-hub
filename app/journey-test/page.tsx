'use client'

import { Suspense, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useJourney, seg } from '@/components/journey/useJourney'
import Planet, { MARS, EARTH, SATURN, type PlanetConfig } from '@/components/journey/Planet'
import Sun from '@/components/journey/Sun'
import BlackHole from '@/components/journey/BlackHole'
import Galaxy from '@/components/journey/Galaxy'
import ChapterPanels from '@/components/journey/ChapterPanels'
import TextureBoundary from '@/components/solar-system/TextureBoundary'
import { JOURNEY_CONTENT } from '@/lib/journey-content'

interface Visual {
    word: string
    /** Four colours of the background gradient, centre to edge. */
    stops: [string, string, string, string]
    /** Textured planets use a config; the Sun is built procedurally. */
    config?: PlanetConfig
    kind?: 'sun' | 'blackhole' | 'galaxy'
    /** Overrides the big word's font size (long words need smaller text). */
    wordSize?: string
}

// Presentation only. Keyed by the same slug as the content.
const VISUALS: Record<string, Visual> = {
    mars: { word: 'MARS', stops: ['#d0591f', '#a23f12', '#6b2409', '#3b1405'], config: MARS },
    earth: { word: 'EARTH', stops: ['#2f6fb5', '#1c4a85', '#0f2a55', '#06142e'], config: EARTH },
    saturn: { word: 'SATURN', stops: ['#b8975a', '#7d6232', '#4a3a1c', '#1f180b'], config: SATURN },
    sun: { word: 'SUN', stops: ['#f08a24', '#d06a14', '#ca6929', '#4a2008'], kind: 'sun' },
    'black-hole': {
        word: 'BLACK HOLE',
        wordSize: 'min(14vw, 26vh)',
        stops: ['#6b4d14', '#352509', '#120c04', '#030201'],
        kind: 'blackhole',
    },
    galaxy: { word: 'GALAXY', stops: ['#103c46', '#08222b', '#041217', '#010507'], kind: 'galaxy' },
}

const WORLDS = JOURNEY_CONTENT.map((c) => ({ ...c, ...VISUALS[c.slug] }))
const STEPS = WORLDS.length * 2 // overview + detail per chapter
const STEP_LABELS = WORLDS.flatMap((w) => [`${w.name} overview`, `${w.name} detail`])

function hexToRgb(hex: string) {
    const n = parseInt(hex.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function mixHex(a: string, b: string, t: number) {
    const A = hexToRgb(a)
    const B = hexToRgb(b)
    return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`
}

export default function JourneyTestPage() {
    const { containerRef, subscribe, goTo, activeChapter: activeStep } = useJourney(STEPS)
    const stRef = useRef(0)
    const stageRef = useRef<HTMLDivElement>(null)
    const readoutRef = useRef<HTMLSpanElement>(null)
    const wordRefs = useRef<(HTMLDivElement | null)[]>([])

    useEffect(
        () =>
            subscribe((st) => {
                stRef.current = st // the 3D planets read this every frame

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

                // Each big word fades in as its planet arrives and out as it slides aside.
                wordRefs.current.forEach((el, i) => {
                    if (!el) return
                    const b = st - 2 * i
                    el.style.opacity = String(seg(b, -0.6, 0) * (1 - seg(b, 0.1, 0.5)))
                })

                if (readoutRef.current) readoutRef.current.textContent = st.toFixed(3)
            }),
        [subscribe]
    )

    return (
        <div className="bg-black text-white">
            <section className="h-[40dvh] flex items-center justify-center text-white/50 text-sm">
                Scroll down.
            </section>

            <div ref={containerRef} style={{ height: `${STEPS * 100}dvh` }}>
                <div
                    ref={stageRef}
                    className="sticky top-0 h-dvh overflow-hidden"
                    style={{
                        background:
                            'radial-gradient(58% 72% at 50% 47%, var(--c0) 0%, var(--c1) 32%, var(--c2) 62%, var(--c3) 100%), #3b1405',
                    }}
                >
                    {/* Big words behind the planets */}
                    {WORLDS.map((w, i) => (
                        <div
                            key={w.slug}
                            ref={(el) => {
                                wordRefs.current[i] = el
                            }}
                            aria-hidden="true"
                            className="absolute inset-0 flex items-center justify-center font-black leading-none tracking-tighter select-none pointer-events-none"
                            style={{ fontSize: w.wordSize ?? 'min(24vw, 44vh)', opacity: i === 0 ? 1 : 0 }}
                        >
                            {w.word}
                        </div>
                    ))}

                    {/* The single WebGL canvas, shared by every chapter */}
                    <div className="absolute inset-0">
                        <Canvas
                            orthographic
                            camera={{ position: [0, 0, 10000], near: 1, far: 30000, zoom: 1 }}
                            dpr={[1, 2]}
                            gl={{ alpha: true, antialias: true }}
                        >
                            {WORLDS.map((w, i) => (
                                <TextureBoundary key={w.slug} fallback={null}>
                                    <Suspense fallback={null}>
                                        {w.kind === 'sun' ? (
                                            <Sun stRef={stRef} index={i} />
                                        ) : w.kind === 'blackhole' ? (
                                            <BlackHole stRef={stRef} index={i} />
                                        ) : w.kind === 'galaxy' ? (
                                            <Galaxy stRef={stRef} index={i} />
                                        ) : w.config ? (
                                            <Planet stRef={stRef} index={i} config={w.config} />
                                        ) : null}
                                    </Suspense>
                                </TextureBoundary>
                            ))}
                        </Canvas>
                    </div>

                    {/* Educational text for each chapter's detail step */}
                    <ChapterPanels content={JOURNEY_CONTENT} subscribe={subscribe} />

                    {/* Debug readout and step dots */}
                    <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none">
                        <p className="font-mono text-xs text-white/70">
                            {STEP_LABELS[activeStep]} · st = <span ref={readoutRef}>0.000</span>
                        </p>
                        <div className="flex gap-3 pointer-events-auto">
                            {STEP_LABELS.map((label, i) => (
                                <button
                                    key={label}
                                    onClick={() => goTo(i)}
                                    aria-label={`Go to ${label}`}
                                    className={`w-3 h-3 rounded-full border border-white/70 ${i === activeStep ? 'bg-white' : 'bg-transparent'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <section className="h-[40dvh] flex items-center justify-center text-white/50 text-sm">
                Page continues.
            </section>
        </div>
    )
}