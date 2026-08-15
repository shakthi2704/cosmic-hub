// ─── Simplified orbital mechanics ──────────────────────────
// Calculates each planet's approximate real position in its orbit
// for a given date, using standard low-precision mean-longitude
// elements referenced to the J2000.0 epoch (Jan 1, 2000, 12:00 TT).
//
// This assumes circular orbits (ignores eccentricity, inclination,
// and perihelion precession) — good enough to visually reflect
// "where each planet roughly is today," not lab-grade ephemeris.
// Real orbital eccentricities are all fairly low except Mercury's,
// so the visual error is small for a decorative/educational scene.

export interface OrbitalElements {
    slug: string
    semiMajorAxisAU: number
    orbitalPeriodDays: number
    /** Mean longitude at J2000.0 epoch, in degrees. */
    meanLongitudeAtEpochDeg: number
    /** Approximate real-world visual color, for rendering. */
    displayColor: string
    /** Real texture map URL. */
    textureUrl: string
}

const TEX = (filename: string) =>
    `https://raw.githubusercontent.com/dogahwisdom/solar-system/master/texture/${filename}`

export const PLANET_ORBITAL_ELEMENTS: OrbitalElements[] = [
    { slug: 'mercury', semiMajorAxisAU: 0.387, orbitalPeriodDays: 87.969, meanLongitudeAtEpochDeg: 252.25, displayColor: '#9c9591', textureUrl: TEX('2k_mercury.jpg') },
    { slug: 'venus', semiMajorAxisAU: 0.723, orbitalPeriodDays: 224.701, meanLongitudeAtEpochDeg: 181.98, displayColor: '#e8c99b', textureUrl: TEX('2k_venus_atmosphere.jpg') },
    { slug: 'earth', semiMajorAxisAU: 1.0, orbitalPeriodDays: 365.256, meanLongitudeAtEpochDeg: 100.47, displayColor: '#4a90d9', textureUrl: TEX('2k_earth_daymap.jpg') },
    { slug: 'mars', semiMajorAxisAU: 1.524, orbitalPeriodDays: 686.98, meanLongitudeAtEpochDeg: 355.45, displayColor: '#c1440e', textureUrl: TEX('2k_mars.jpg') },
    { slug: 'jupiter', semiMajorAxisAU: 5.203, orbitalPeriodDays: 4332.589, meanLongitudeAtEpochDeg: 34.4, displayColor: '#d8b892', textureUrl: TEX('2k_jupiter.jpg') },
    { slug: 'saturn', semiMajorAxisAU: 9.537, orbitalPeriodDays: 10759.22, meanLongitudeAtEpochDeg: 49.94, displayColor: '#e3c98f', textureUrl: TEX('2k_saturn.jpg') },
    { slug: 'uranus', semiMajorAxisAU: 19.191, orbitalPeriodDays: 30685.4, meanLongitudeAtEpochDeg: 313.23, displayColor: '#8fd3e3', textureUrl: TEX('2k_uranus.jpg') },
    { slug: 'neptune', semiMajorAxisAU: 30.069, orbitalPeriodDays: 60189.0, meanLongitudeAtEpochDeg: 304.88, displayColor: '#4166f5', textureUrl: TEX('2k_neptune.jpg') },
]

/** Saturn's ring texture (alpha-mapped strip). */
export const SATURN_RING_TEXTURE_URL = TEX('2k_saturn_ring_alpha.png')

/** Sun texture, used by the solar system scene's Sun component. */
export const SUN_TEXTURE_URL = TEX('2k_sun.jpg')

const J2000_EPOCH_MS = Date.UTC(2000, 0, 1, 12, 0, 0)
const MS_PER_DAY = 86_400_000

function normalizeDegrees(deg: number): number {
    const n = deg % 360
    return n < 0 ? n + 360 : n
}

export function getPlanetAngleRadians(elements: OrbitalElements, date: Date = new Date()): number {
    const daysSinceEpoch = (date.getTime() - J2000_EPOCH_MS) / MS_PER_DAY
    const degreesPerDay = 360 / elements.orbitalPeriodDays
    const currentLongitudeDeg = normalizeDegrees(
        elements.meanLongitudeAtEpochDeg + degreesPerDay * daysSinceEpoch
    )
    return (currentLongitudeDeg * Math.PI) / 180
}

export function getPlanetAngleBySlug(slug: string, date: Date = new Date()): number | null {
    const el = PLANET_ORBITAL_ELEMENTS.find(e => e.slug === slug)
    return el ? getPlanetAngleRadians(el, date) : null
}


export interface OrbitProgress {
    /** Days elapsed since this planet's current lap started (0 → orbitalPeriodDays). */
    daysIntoOrbit: number
    /** Days remaining until the planet completes its current lap around the Sun. */
    daysRemaining: number
    /** 0 → 1, how far through the current orbit the planet is. */
    progressFraction: number
}

/**
 * Where a planet is within its current orbit, and how long until it
 * completes a full lap (360°) from its current position.
 * "Lap" here means "back to this same orbital angle," not perihelion —
 * consistent with the same circular-orbit approximation used elsewhere.
 */
export function getOrbitProgress(elements: OrbitalElements, date: Date = new Date()): OrbitProgress {
    const angleRad = getPlanetAngleRadians(elements, date)
    let angleDeg = (angleRad * 180) / Math.PI
    angleDeg = ((angleDeg % 360) + 360) % 360 // defensive clamp to [0, 360)
    const daysIntoOrbit = (angleDeg / 360) * elements.orbitalPeriodDays
    const daysRemaining = elements.orbitalPeriodDays - daysIntoOrbit
    return {
        daysIntoOrbit,
        daysRemaining,
        progressFraction: angleDeg / 360,
    }
}
/** Formats a day count as "X days" or "X.X years" depending on magnitude. */
export function formatOrbitDuration(days: number): string {
    if (days < 1) return '<1 day'
    if (days < 365) return `${Math.round(days)} day${Math.round(days) === 1 ? '' : 's'}`
    return `${(days / 365.25).toFixed(1)} years`
}