import { withCache, TTL } from '@/lib/cache-utils'

// ─── Types ────────────────────────────────────────────────

export interface Launch {
    id: string
    name: string
    status: { name: string; abbrev: string }
    net: string | null
    window_start: string | null
    window_end: string | null
    rocket: { configuration: { name: string; full_name: string } } | null
    mission: { name: string; description: string; type: string } | null
    launch_service_provider: { name: string; abbrev: string } | null
    pad: { name: string; location: { name: string; country_code: string } } | null
    image: string | null
    webcast_live: boolean
    url: string
}

export interface ApodData {
    date: string
    title: string
    explanation: string
    url: string
    hdurl?: string
    media_type: 'image' | 'video'
    copyright?: string
}

export interface NewsArticle {
    id: number
    title: string
    url: string
    image_url: string
    news_site: string
    summary: string
    published_at: string
    updated_at: string
}

// ─── Launches ────────────────────────────────────────────

export async function getUpcomingLaunches(): Promise<Launch[]> {
    return withCache('live:launches', TTL.LIVE_LAUNCHES, async () => {
        const res = await fetch(
            'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=10&mode=detailed',
            { next: { revalidate: TTL.LIVE_LAUNCHES } }
        )
        if (!res.ok) throw new Error(`Launch API error: ${res.status}`)
        const data = await res.json()
        return data.results as Launch[]
    })
}

// ─── APOD ─────────────────────────────────────────────────

export async function getNASAApod(): Promise<ApodData> {
    return withCache('live:apod', TTL.LIVE_EVENTS, async () => {
        const key = process.env.NASA_API_KEY
        const res = await fetch(
            `https://api.nasa.gov/planetary/apod?api_key=${key}`,
            { next: { revalidate: TTL.LIVE_EVENTS } }
        )
        if (!res.ok) throw new Error(`APOD API error: ${res.status}`)
        return res.json() as Promise<ApodData>
    })
}

// ─── Space News ───────────────────────────────────────────

export async function getSpaceNews(limit = 6): Promise<NewsArticle[]> {
    return withCache(`live:news:${limit}`, TTL.LIVE_EVENTS, async () => {
        const res = await fetch(
            `https://api.spaceflightnewsapi.net/v4/articles/?limit=${limit}&ordering=-published_at`,
            { next: { revalidate: TTL.LIVE_EVENTS } }
        )
        if (!res.ok) throw new Error(`News API error: ${res.status}`)
        const data = await res.json()
        return data.results as NewsArticle[]
    })
}