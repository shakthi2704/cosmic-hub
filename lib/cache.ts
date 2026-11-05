import { Redis } from '@upstash/redis'

const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN

/**
 * Optional Redis cache (Upstash).
 * If the env vars are missing, `cache` is null and the site simply runs
 * without a Redis layer instead of crashing.
 */
export const cache: Redis | null = url && token ? new Redis({ url, token }) : null