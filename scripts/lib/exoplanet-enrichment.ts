// ─── Shared exoplanet enrichment logic ─────────────────────
// Used by scripts/sync-exoplanets.ts (new inserts) and
// scripts/backfill-exoplanet-summaries.ts (existing rows).
// Everything here is derived directly from measured/estimated
// archive values — no external calls, no AI generation.

export interface ExoplanetFacts {
    name: string
    hostStar: string | null
    discoveryMethod: string | null
    discoveryYear: number | null
    discoveryFacility: string | null
    orbitalPeriodDays: number | null
    orbitalRadiusAU: number | null
    equilibriumTempK: number | null
    distanceParsecs: number | null
    radiusEarthRadii: number | null
    massEarthMasses: number | null
}

// Standard size bands used in exoplanet science (roughly the
// bins NASA/Kepler team use in public communications).
export function classifySize(radiusEarthRadii: number | null): string | null {
    if (radiusEarthRadii == null) return null
    if (radiusEarthRadii < 0.5) return 'a sub-Earth-sized world'
    if (radiusEarthRadii < 1.25) return 'an Earth-sized world'
    if (radiusEarthRadii < 2.0) return 'a super-Earth'
    if (radiusEarthRadii < 6.0) return 'a sub-Neptune'
    if (radiusEarthRadii < 15.0) return 'a Neptune-sized giant'
    return 'a Jupiter-class gas giant'
}

// Very rough "could liquid water exist" temperature band.
// Explicitly caveated — this ignores atmosphere, pressure, and
// tidal locking, all of which matter enormously in reality.
export function habitabilityNote(equilibriumTempK: number | null): string | null {
    if (equilibriumTempK == null) return null
    if (equilibriumTempK >= 200 && equilibriumTempK <= 320) {
        return 'Its estimated equilibrium temperature falls within a range where liquid water could theoretically exist on a rocky surface, though this is a rough estimate that ignores atmosphere and pressure.'
    }
    if (equilibriumTempK < 200) {
        return `At an estimated ${equilibriumTempK.toFixed(0)} K, it is likely far too cold for liquid water on its surface.`
    }
    return `At an estimated ${equilibriumTempK.toFixed(0)} K, it is likely far too hot for liquid water on its surface.`
}

export function parsecsToLightYears(pc: number | null): number | null {
    if (pc == null) return null
    return pc * 3.26156
}

export function generateExoplanetSummary(f: ExoplanetFacts): string {
    const sentences: string[] = []

    // Opening — identity + host star
    const sizeClass = classifySize(f.radiusEarthRadii)
    if (f.hostStar) {
        sentences.push(
            sizeClass
                ? `${f.name} is ${sizeClass} orbiting the star ${f.hostStar}.`
                : `${f.name} is a confirmed exoplanet orbiting the star ${f.hostStar}.`
        )
    } else {
        sentences.push(
            sizeClass
                ? `${f.name} is ${sizeClass}, confirmed by the NASA Exoplanet Archive.`
                : `${f.name} is a confirmed exoplanet listed in the NASA Exoplanet Archive.`
        )
    }

    // Discovery
    if (f.discoveryMethod) {
        const method = f.discoveryMethod.toLowerCase()
        const year = f.discoveryYear ? ` in ${f.discoveryYear}` : ''
        const facility = f.discoveryFacility ? ` using data from ${f.discoveryFacility}` : ''
        sentences.push(`It was discovered${year} via the ${method} method${facility}.`)
    }

    // Orbit + distance
    const orbitParts: string[] = []
    if (f.orbitalPeriodDays) {
        orbitParts.push(
            f.orbitalPeriodDays < 1
                ? `an orbit lasting just ${(f.orbitalPeriodDays * 24).toFixed(1)} hours`
                : `an orbit of roughly ${f.orbitalPeriodDays.toFixed(1)} days`
        )
    }
    if (f.orbitalRadiusAU) {
        orbitParts.push(`a distance of about ${f.orbitalRadiusAU.toFixed(3)} AU from its star`)
    }
    if (orbitParts.length > 0) {
        sentences.push(`It has ${orbitParts.join(' at ')}.`)
    }

    const ly = parsecsToLightYears(f.distanceParsecs)
    if (ly) {
        sentences.push(`The system lies approximately ${ly.toFixed(1)} light-years from Earth.`)
    }

    // Habitability caveat, only when meaningful
    const habitability = habitabilityNote(f.equilibriumTempK)
    if (habitability) sentences.push(habitability)

    return sentences.join(' ')
}