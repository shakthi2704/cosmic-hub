import * as Astronomy from 'astronomy-engine'
import { withCache, TTL } from '@/lib/cache-utils'

// ─── Types ────────────────────────────────────────────────

export interface PlanetVisibility {
    name: string
    altitude: number
    azimuth: number
    aboveHorizon: boolean
    magnitude: number | null
    riseTime: string | null
    setTime: string | null
}

export interface SkySnapshot {
    generatedAt: string
    latitude: number
    longitude: number
    sunAltitude: number
    planets: PlanetVisibility[]
}

// ─── Config ───────────────────────────────────────────────

const PLANETS: { name: string; body: Astronomy.Body }[] = [
    { name: 'Mercury', body: Astronomy.Body.Mercury },
    { name: 'Venus', body: Astronomy.Body.Venus },
    { name: 'Mars', body: Astronomy.Body.Mars },
    { name: 'Jupiter', body: Astronomy.Body.Jupiter },
    { name: 'Saturn', body: Astronomy.Body.Saturn },
    { name: 'Uranus', body: Astronomy.Body.Uranus },
    { name: 'Neptune', body: Astronomy.Body.Neptune },
]

// ─── Sky Visibility ───────────────────────────────────────

export async function getVisiblePlanets(
    latitude: number,
    longitude: number
): Promise<SkySnapshot> {
    const latKey = latitude.toFixed(1)
    const lngKey = longitude.toFixed(1)
    const bucket = Math.floor(Date.now() / (1000 * 60 * 10))
    const cacheKey = `live:sky:${latKey}:${lngKey}:${bucket}`

    return withCache(cacheKey, TTL.LIVE_WEATHER, async () => {
        const time = Astronomy.MakeTime(new Date())
        const observer = new Astronomy.Observer(latitude, longitude, 0)

        const planets: PlanetVisibility[] = PLANETS.map(({ name, body }) => {
            const equator = Astronomy.Equator(body, time, observer, true, true)
            const horizon = Astronomy.Horizon(
                time,
                observer,
                equator.ra,
                equator.dec,
                'normal'
            )

            let magnitude: number | null = null
            try {
                magnitude = Astronomy.Illumination(body, time).mag
            } catch {
                // some bodies don't support illumination calc; skip
            }

            const rise = Astronomy.SearchRiseSet(body, observer, +1, time, 1)
            const set = Astronomy.SearchRiseSet(body, observer, -1, time, 1)

            return {
                name,
                altitude: Math.round(horizon.altitude * 10) / 10,
                azimuth: Math.round(horizon.azimuth * 10) / 10,
                aboveHorizon: horizon.altitude > 0,
                magnitude: magnitude !== null ? Math.round(magnitude * 100) / 100 : null,
                riseTime: rise ? rise.date.toISOString() : null,
                setTime: set ? set.date.toISOString() : null,
            }
        })

        const sunEquator = Astronomy.Equator(Astronomy.Body.Sun, time, observer, true, true)
        const sunHorizon = Astronomy.Horizon(time, observer, sunEquator.ra, sunEquator.dec, 'normal')

        return {
            generatedAt: new Date().toISOString(),
            latitude,
            longitude,
            sunAltitude: Math.round(sunHorizon.altitude * 10) / 10,
            planets,
        }
    })
}