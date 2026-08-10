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
}

export const PLANET_ORBITAL_ELEMENTS: OrbitalElements[] = [
    { slug: 'mercury', semiMajorAxisAU: 0.387, orbitalPeriodDays: 87.969, meanLongitudeAtEpochDeg: 252.25, displayColor: '#9c9591' },
    { slug: 'venus', semiMajorAxisAU: 0.723, orbitalPeriodDays: 224.701, meanLongitudeAtEpochDeg: 181.98, displayColor: '#e8c99b' },
    { slug: 'earth', semiMajorAxisAU: 1.0, orbitalPeriodDays: 365.256, meanLongitudeAtEpochDeg: 100.47, displayColor: '#4a90d9' },
    { slug: 'mars', semiMajorAxisAU: 1.524, orbitalPeriodDays: 686.98, meanLongitudeAtEpochDeg: 355.45, displayColor: '#c1440e' },
    { slug: 'jupiter', semiMajorAxisAU: 5.203, orbitalPeriodDays: 4332.589, meanLongitudeAtEpochDeg: 34.4, displayColor: '#d8b892' },
    { slug: 'saturn', semiMajorAxisAU: 9.537, orbitalPeriodDays: 10759.22, meanLongitudeAtEpochDeg: 49.94, displayColor: '#e3c98f' },
    { slug: 'uranus', semiMajorAxisAU: 19.191, orbitalPeriodDays: 30685.4, meanLongitudeAtEpochDeg: 313.23, displayColor: '#8fd3e3' },
    { slug: 'neptune', semiMajorAxisAU: 30.069, orbitalPeriodDays: 60189.0, meanLongitudeAtEpochDeg: 304.88, displayColor: '#4166f5' },
]

const J2000_EPOCH_MS = Date.UTC(2000, 0, 1, 12, 0, 0)
const MS_PER_DAY = 86_400_000

function normalizeDegrees(deg: number): number {
    const n = deg % 360
    return n < 0 ? n + 360 : n
}

/**
 * Returns the planet's current orbital angle in radians (0 = along
 * the +X axis, increasing counter-clockwise), based on the given
 * date (defaults to now).
 */
export function getPlanetAngleRadians(elements: OrbitalElements, date: Date = new Date()): number {
    const daysSinceEpoch = (date.getTime() - J2000_EPOCH_MS) / MS_PER_DAY
    const degreesPerDay = 360 / elements.orbitalPeriodDays
    const currentLongitudeDeg = normalizeDegrees(
        elements.meanLongitudeAtEpochDeg + degreesPerDay * daysSinceEpoch
    )
    return (currentLongitudeDeg * Math.PI) / 180
}

/** Convenience: current angle for a planet by slug, or null if unknown. */
export function getPlanetAngleBySlug(slug: string, date: Date = new Date()): number | null {
    const el = PLANET_ORBITAL_ELEMENTS.find(e => e.slug === slug)
    return el ? getPlanetAngleRadians(el, date) : null
}