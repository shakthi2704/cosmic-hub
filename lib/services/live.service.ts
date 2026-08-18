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

// ─── ISS Position ───────────────────────────────────────────

export interface ISSPosition {
    latitude: number
    longitude: number
    altitude: number // km
    velocity: number // km/h
    visibility: 'daylight' | 'eclipsed'
    timestamp: number // unix seconds
}

export async function getISSPosition(): Promise<ISSPosition> {
    return withCache('live:iss', TTL.LIVE_ISS, async () => {
        const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544', {
            next: { revalidate: TTL.LIVE_ISS },
        })
        if (!res.ok) throw new Error(`ISS API error: ${res.status}`)
        const data = await res.json()
        return {
            latitude: data.latitude,
            longitude: data.longitude,
            altitude: data.altitude,
            velocity: data.velocity,
            visibility: data.visibility,
            timestamp: data.timestamp,
        } as ISSPosition
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


// ─── Near-Earth Objects ─────────────────────────────────────

export interface NearEarthObject {
    id: string
    name: string
    jplUrl: string
    diameterMinKm: number
    diameterMaxKm: number
    hazardous: boolean
    closeApproachDate: string // YYYY-MM-DD
    missDistanceKm: number
    missDistanceLunar: number // distance in multiples of the Moon's orbit
    velocityKmS: number
}

function toYMD(date: Date): string {
    return date.toISOString().slice(0, 10)
}

export async function getNearEarthObjects(): Promise<NearEarthObject[]> {
    return withCache('live:neo', TTL.LIVE_NEO, async () => {
        const key = process.env.NASA_API_KEY
        const start = new Date()
        const end = new Date()
        end.setDate(end.getDate() + 7)

        const res = await fetch(
            `https://api.nasa.gov/neo/rest/v1/feed?start_date=${toYMD(start)}&end_date=${toYMD(end)}&api_key=${key}`,
            { next: { revalidate: TTL.LIVE_NEO } }
        )
        if (!res.ok) throw new Error(`NeoWs API error: ${res.status}`)
        const data = await res.json()

        const objects: NearEarthObject[] = []
        for (const date of Object.keys(data.near_earth_objects)) {
            for (const neo of data.near_earth_objects[date]) {
                const approach = neo.close_approach_data[0]
                if (!approach) continue
                objects.push({
                    id: neo.id,
                    name: neo.name,
                    jplUrl: neo.nasa_jpl_url,
                    diameterMinKm: neo.estimated_diameter.kilometers.estimated_diameter_min,
                    diameterMaxKm: neo.estimated_diameter.kilometers.estimated_diameter_max,
                    hazardous: neo.is_potentially_hazardous_asteroid,
                    closeApproachDate: approach.close_approach_date,
                    missDistanceKm: parseFloat(approach.miss_distance.kilometers),
                    missDistanceLunar: parseFloat(approach.miss_distance.lunar),
                    velocityKmS: parseFloat(approach.relative_velocity.kilometers_per_second),
                })
            }
        }

        objects.sort((a, b) => a.closeApproachDate.localeCompare(b.closeApproachDate) || a.missDistanceKm - b.missDistanceKm)
        return objects
    })
}

// ─── Space Weather ──────────────────────────────────────────

export interface SpaceWeather {
    kpIndex: number
    kpCategory: string // Quiet, Unsettled, Active, or G1–G5 storm level
    kpTimestamp: string
    flareClass: string // e.g. "B8.9", "M1.2", "X2.1"
    flareTimestamp: string
    auroraLikely: boolean // rough heuristic: Kp >= 5 means aurora may be visible outside polar regions
}

function classifyXrayFlux(flux: number): string {
    if (flux < 1e-7) return `A${(flux / 1e-8).toFixed(1)}`
    if (flux < 1e-6) return `B${(flux / 1e-7).toFixed(1)}`
    if (flux < 1e-5) return `C${(flux / 1e-6).toFixed(1)}`
    if (flux < 1e-4) return `M${(flux / 1e-5).toFixed(1)}`
    return `X${(flux / 1e-4).toFixed(1)}`
}

function classifyKp(kp: number): string {
    if (kp < 4) return 'Quiet'
    if (kp < 5) return 'Unsettled'
    if (kp < 6) return 'G1 – Minor storm'
    if (kp < 7) return 'G2 – Moderate storm'
    if (kp < 8) return 'G3 – Strong storm'
    if (kp < 9) return 'G4 – Severe storm'
    return 'G5 – Extreme storm'
}

export async function getSpaceWeather(): Promise<SpaceWeather> {
    return withCache('live:space-weather', TTL.LIVE_WEATHER, async () => {
        const [kpRes, xrayRes] = await Promise.all([
            fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json', {
                next: { revalidate: TTL.LIVE_WEATHER },
            }),
            fetch('https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json', {
                next: { revalidate: TTL.LIVE_WEATHER },
            }),
        ])
        if (!kpRes.ok) throw new Error(`SWPC Kp API error: ${kpRes.status}`)
        if (!xrayRes.ok) throw new Error(`SWPC X-ray API error: ${xrayRes.status}`)

        const kpData: { time_tag: string; Kp: number }[] = await kpRes.json()
        const xrayData: { time_tag: string; flux: number; energy: string }[] = await xrayRes.json()

        const latestKp = kpData[kpData.length - 1]
        const longChannelReadings = xrayData.filter((r) => r.energy === '0.1-0.8nm')
        const latestFlare = longChannelReadings[longChannelReadings.length - 1]

        return {
            kpIndex: latestKp.Kp,
            kpCategory: classifyKp(latestKp.Kp),
            kpTimestamp: latestKp.time_tag,
            flareClass: classifyXrayFlux(latestFlare.flux),
            flareTimestamp: latestFlare.time_tag,
            auroraLikely: latestKp.Kp >= 5,
        }
    })
}

// ─── Space News ───────────────────────────────────────────

// ─── Space News ───────────────────────────────────────────

