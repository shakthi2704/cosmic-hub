import { cache } from '@/lib/cache'

export const TTL = {
    LIVE_LAUNCHES: 60 * 5,
    LIVE_WEATHER: 60 * 15,
    LIVE_EVENTS: 60 * 60,
    SEARCH: 60 * 10,
    STATIC_LIST: 60 * 60 * 24,
} as const

export async function withCache<T>(
    key: string,
    ttl: number,
    fetcher: () => Promise<T>
): Promise<T> {
    try {
        const cached = await cache.get<T>(key)
        if (cached !== null && cached !== undefined) {
            console.log(`[cache] HIT key=${key}`)
            return cached
        }
    } catch (err) {
        console.warn(`[cache] GET failed key=${key}`, err)
    }

    const fresh = await fetcher()

    try {
        await cache.set(key, fresh, { ex: ttl })
        console.log(`[cache] SET key=${key} ttl=${ttl}s`)
    } catch (err) {
        console.warn(`[cache] SET failed key=${key}`, err)
    }

    return fresh
}

export async function invalidateCache(key: string) {
    try {
        await cache.del(key)
    } catch (err) {
        console.warn(`[cache] DEL failed key=${key}`, err)
    }
}