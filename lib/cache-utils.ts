import { cache } from '@/lib/cache'

export const TTL = {
    LIVE_LAUNCHES: 60 * 5,
    LIVE_WEATHER: 60 * 15,
    LIVE_EVENTS: 60 * 60,
    LIVE_ISS: 10,
    LIVE_NEO: 60 * 30,
    SEARCH: 60 * 10,
    STATIC_LIST: 60 * 60 * 24,
} as const

// ─── Redis safety net ───────────────────────────────────────
// A slow or dead Redis must never slow down or break a page.
// 1. Each Redis call gets a short timeout.
// 2. After one failure, Redis is skipped for a cooldown period.

const REDIS_TIMEOUT_MS = 1500
const REDIS_COOLDOWN_MS = 60_000

let redisDownUntil = 0

function redisAvailable(): boolean {
    return cache !== null && Date.now() >= redisDownUntil
}

function markRedisDown(op: string, key: string, err: unknown) {
    redisDownUntil = Date.now() + REDIS_COOLDOWN_MS
    const reason = err instanceof Error ? err.message : String(err)
    console.warn(
        `[cache] Redis unavailable (${op} key=${key}): ${reason}. Skipping Redis for ${REDIS_COOLDOWN_MS / 1000}s.`
    )
}

function withTimeout<T>(promise: Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Redis timeout')), REDIS_TIMEOUT_MS)
        promise.then(
            (value) => {
                clearTimeout(timer)
                resolve(value)
            },
            (error) => {
                clearTimeout(timer)
                reject(error)
            }
        )
    })
}

// ─── Public helpers ─────────────────────────────────────────

export async function withCache<T>(
    key: string,
    ttl: number,
    fetcher: () => Promise<T>
): Promise<T> {
    if (cache && redisAvailable()) {
        try {
            const cached = await withTimeout(cache.get<T>(key))
            if (cached !== null && cached !== undefined) return cached
        } catch (err) {
            markRedisDown('GET', key, err)
        }
    }

    const fresh = await fetcher()

    if (cache && redisAvailable()) {
        try {
            await withTimeout(cache.set(key, fresh, { ex: ttl }))
        } catch (err) {
            markRedisDown('SET', key, err)
        }
    }

    return fresh
}

export async function invalidateCache(key: string) {
    if (!cache || !redisAvailable()) return
    try {
        await withTimeout(cache.del(key))
    } catch (err) {
        markRedisDown('DEL', key, err)
    }
}