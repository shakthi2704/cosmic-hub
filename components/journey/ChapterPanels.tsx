'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { seg, type JourneyListener } from './useJourney'
import type { JourneyContent } from '@/lib/journey-content'

interface ChapterPanelsProps {
    content: JourneyContent[]
    subscribe: (cb: JourneyListener) => () => void
}

export default function ChapterPanels({ content, subscribe }: ChapterPanelsProps) {
    const refs = useRef<(HTMLElement | null)[]>([])

    useEffect(
        () =>
            subscribe((st) => {
                refs.current.forEach((el, i) => {
                    if (!el) return
                    // Detail beat of chapter i is at st = 2*i + 1.
                    const b = st - 2 * i
                    const enter = seg(b, 0.6, 1)
                    const exit = seg(b, 1.05, 1.45)
                    const o = enter * (1 - exit)

                    el.style.opacity = String(o)
                    el.style.transform = `translateX(${(1 - enter) * 24 - exit * 24}px)`
                    const vis = o > 0.02 ? 'visible' : 'hidden'
                    if (el.style.visibility !== vis) el.style.visibility = vis
                    el.style.pointerEvents = o > 0.6 ? 'auto' : 'none'
                })
            }),
        [subscribe, content]
    )

    return (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-end pr-[6%] max-md:items-end max-md:justify-center max-md:px-4 max-md:pb-20 max-md:pr-4">
            <div className="grid w-[min(380px,100%)]">
                {content.map((c, i) => (
                    <section
                        key={c.slug}
                        ref={(el) => {
                            refs.current[i] = el
                        }}
                        aria-label={`${c.name} details`}
                        className="col-start-1 row-start-1 border-l border-white/40 pl-6 max-md:pl-4"
                        style={{ opacity: 0, visibility: 'hidden' }}
                    >
                        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/70">{c.kicker}</p>
                        <h2 className="mt-2 text-4xl font-extrabold leading-none tracking-tight max-md:text-3xl">
                            {c.title}
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-white/85">{c.summary}</p>

                        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
                            {c.facts.map((f) => (
                                <div key={f.label}>
                                    <dt className="font-mono text-[10px] uppercase tracking-widest text-white/60">
                                        {f.label}
                                    </dt>
                                    <dd className="text-sm font-semibold">{f.value}</dd>
                                </div>
                            ))}
                        </dl>

                        {c.note && <p className="mt-4 text-xs italic text-white/65">{c.note}</p>}

                        <p className="mt-4 text-[11px] text-white/65">
                            Source:{' '}
                            <a
                                href={c.source.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline underline-offset-2 hover:text-white"
                            >
                                {c.source.label}
                            </a>
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <Link
                                href={c.primary.href}
                                className="rounded-sm bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                {c.primary.label}
                            </Link>
                            <Link
                                href={c.secondary.href}
                                className="rounded-sm border border-white/60 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                {c.secondary.label}
                            </Link>
                        </div>
                    </section>
                ))}
            </div>
        </div>
    )
}