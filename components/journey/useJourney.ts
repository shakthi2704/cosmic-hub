'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type JourneyListener = (st: number) => void

// ─── Small math helpers (same idea as the Mars prompt) ──────
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
/** 0 before `a`, 1 after `b`, linear in between. */
export const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))
export const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2)
export const easeOut = (k: number) => 1 - Math.pow(1 - k, 3)

/** Higher = snappier follow. Ignored when the visitor prefers reduced motion. */
const SMOOTHING = 6

/**
 * Turns page scroll into a single journey value `st`, from 0 to (chapterCount - 1).
 *
 * Usage: put `containerRef` on a tall element (e.g. chapterCount * 100dvh) that
 * contains a `position: sticky; top: 0; height: 100dvh` stage. As the visitor
 * scrolls through the container, `st` moves from 0 to chapterCount - 1.
 */
export function useJourney(chapterCount: number) {
    const maxSt = Math.max(chapterCount - 1, 1)

    const containerRef = useRef<HTMLDivElement>(null)
    const listeners = useRef(new Set<JourneyListener>())
    const target = useRef(0)
    const current = useRef(0)
    const frame = useRef<number | null>(null)
    const lastTime = useRef(0)
    const reducedMotion = useRef(false)
    const activeRef = useRef(0)
    const [activeChapter, setActiveChapter] = useState(0)

    const emit = useCallback(() => {
        const st = current.current
        listeners.current.forEach((cb) => cb(st))
        const idx = Math.round(st)
        if (idx !== activeRef.current) {
            activeRef.current = idx
            setActiveChapter(idx) // React only re-renders when the chapter changes
        }
    }, [])

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
        reducedMotion.current = mq.matches
        const onMotionChange = (e: MediaQueryListEvent) => {
            reducedMotion.current = e.matches
        }
        mq.addEventListener('change', onMotionChange)

        const readScroll = () => {
            const el = containerRef.current
            if (!el) return
            const rect = el.getBoundingClientRect()
            const scrollable = rect.height - window.innerHeight
            target.current = scrollable > 0 ? clamp01(-rect.top / scrollable) * maxSt : 0
        }

        const tick = (now: number) => {
            const dt = Math.max(0, Math.min((now - lastTime.current) / 1000, 0.05))
            lastTime.current = now
            const diff = target.current - current.current
            if (reducedMotion.current || Math.abs(diff) < 0.0005) {
                current.current = target.current
            } else {
                current.current += diff * (1 - Math.exp(-dt * SMOOTHING))
            }
            // Safety net: never let the value leave its valid range.
            current.current = Math.min(maxSt, Math.max(0, current.current))
            emit()
            // Stop the loop once we've arrived (saves battery).
            frame.current = current.current === target.current ? null : requestAnimationFrame(tick)
        }

        const start = () => {
            if (frame.current === null) {
                lastTime.current = performance.now()
                frame.current = requestAnimationFrame(tick)
            }
        }

        const onScroll = () => {
            readScroll()
            start()
        }

        // Start in the right place (e.g. after a refresh mid-page), no animation.
        readScroll()
        current.current = target.current
        emit()

        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll)

        return () => {
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
            mq.removeEventListener('change', onMotionChange)
            if (frame.current !== null) cancelAnimationFrame(frame.current)
            frame.current = null
        }
    }, [maxSt, emit])

    /** Subscribe to every `st` update. Returns an unsubscribe function. */
    const subscribe = useCallback((cb: JourneyListener) => {
        listeners.current.add(cb)
        cb(current.current)
        return () => {
            listeners.current.delete(cb)
        }
    }, [])

    /** Smooth-scroll to a chapter (instant for reduced motion). */
    const goTo = useCallback(
        (index: number) => {
            const el = containerRef.current
            if (!el) return
            const rect = el.getBoundingClientRect()
            const scrollable = rect.height - window.innerHeight
            const top = rect.top + window.scrollY + clamp01(index / maxSt) * scrollable
            window.scrollTo({ top, behavior: reducedMotion.current ? 'auto' : 'smooth' })
        },
        [maxSt]
    )

    return { containerRef, subscribe, goTo, activeChapter }
}