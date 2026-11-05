import { easeOut, seg } from './useJourney'

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export interface ChapterLayoutOptions {
    /** Size multiplier (e.g. smaller for objects with wide rings). Default 1. */
    scale?: number
}

export interface ChapterLayout {
    /** Journey position relative to this chapter's overview beat:
     *  -1 entering from the right, 0 overview (centred), 1 detail (slid left), 2 gone off the left. */
    b: number
    /** False when the chapter is fully off-screen, so it can skip all work. */
    visible: boolean
    portrait: boolean
    /** 0..1 while arriving, sliding aside, and leaving. */
    enter: number
    toDetail: number
    exit: number
    /** Centre in CSS pixels, origin top-left. */
    x: number
    y: number
    /** Same centre in the orthographic scene's coordinates (origin at the screen centre, y up). */
    sceneX: number
    sceneY: number
    /** Radius in CSS pixels. Not clamped: callers apply their own minimum. */
    radius: number
}

/**
 * Where chapter `index` sits on screen at journey value `st`.
 * Each chapter has two beats: overview at st = 2*index, detail at st = 2*index + 1.
 */
export function chapterLayout(
    st: number,
    index: number,
    W: number,
    H: number,
    opts: ChapterLayoutOptions = {}
): ChapterLayout {
    const b = st - 2 * index
    const visible = b > -1.001 && b < 2.001

    const portrait = H > W * 1.05
    const R0 = (portrait ? W * 0.36 : Math.min(H * 0.3, W * 0.19)) * (opts.scale ?? 1)

    const enter = easeOut(seg(b, -1, 0))
    const toDetail = seg(b, 0, 1)
    const exit = seg(b, 1, 2)

    const px = portrait ? 0.5 * W : lerp(0.5 * W, 0.36 * W, toDetail)
    const py = portrait ? lerp(0.4 * H, 0.33 * H, toDetail) : 0.5 * H
    const radius = R0 * (1 + toDetail * 0.04) * lerp(0.7, 1, enter) * (1 - exit * 0.35)
    const x = px + (1 - enter) * 0.95 * W - exit * 0.9 * W

    return {
        b,
        visible,
        portrait,
        enter,
        toDetail,
        exit,
        x,
        y: py,
        sceneX: x - W / 2,
        sceneY: H / 2 - py,
        radius,
    }
}