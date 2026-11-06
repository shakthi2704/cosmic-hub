import { JOURNEY_CONTENT, type JourneyContent } from '@/lib/journey-content'

export interface WorldLook {
    word: string
    /** Overrides the big word's font size (long words need smaller text). */
    wordSize?: string
    /** Four colours of the background gradient, centre to edge. */
    stops: [string, string, string, string]
    wordOffset?: string
}

const LOOKS: Record<string, WorldLook> = {
    mars: {
        word: 'MARS',
        wordSize: 'min(22vw, 38vh)',
        wordOffset: '-6vh',
        stops: ['#d0591f', '#a23f12', '#6b2409', '#3b1405'],
    },
    earth: { word: 'EARTH', stops: ['#2f6fb5', '#1c4a85', '#0f2a55', '#06142e'] },
    saturn: { word: 'SATURN', stops: ['#b8975a', '#7d6232', '#4a3a1c', '#1f180b'] },
    sun: { word: 'SUN', stops: ['#f08a24', '#d06a14', '#8f400c', '#4a2008'] },
    'black-hole': {
        word: 'BLACK HOLE',
        wordSize: 'min(14vw, 26vh)',
        stops: ['#6b4d14', '#352509', '#120c04', '#030201'],
    },
    galaxy: { word: 'GALAXY', stops: ['#103c46', '#08222b', '#041217', '#010507'] },
}

export type World = JourneyContent & WorldLook

/** Content (facts, links) joined with look (colours, word), in journey order. */
export const WORLDS: World[] = JOURNEY_CONTENT.map((c) => ({ ...c, ...LOOKS[c.slug] }))

function hexToRgb(hex: string) {
    const n = parseInt(hex.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Blend two #rrggbb colours. t = 0 gives a, t = 1 gives b. */
export function mixHex(a: string, b: string, t: number) {
    const A = hexToRgb(a)
    const B = hexToRgb(b)
    return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`
}