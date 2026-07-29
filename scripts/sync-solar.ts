import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

// ─── Solar System OpenData (api.le-systeme-solaire.net) ────
// Requires a free API key as of 2026 — get one at:
// https://api.le-systeme-solaire.net/generatekey.html
// Set SOLAR_SYSTEM_API_KEY in .env.local before running.

const API_URL = 'https://api.le-systeme-solaire.net/rest/bodies/'

interface SolarBody {
    id: string
    name: string
    englishName: string
    isPlanet: boolean
    bodyType?: string // e.g. "Moon", "Asteroid", "Comet", "Planet", "Dwarf Planet", "Star"
    moons: unknown
    semimajorAxis: number | null
    perihelion: number | null
    aphelion: number | null
    eccentricity: number | null
    inclination: number | null
    mass: { massValue: number; massExponent: number } | null
    meanRadius: number | null
    density: number | null
    gravity: number | null
    escape: number | null
    sideralOrbit: number | null // orbital period, days
    sideralRotation: number | null // rotation period, hours
    aroundPlanet: { planet: string; rel: string } | null
    discoveredBy: string | null
    discoveryDate: string | null
    avgTemp: number | null
}

// Maps this API's French body ids to our existing planet slugs
// (already seeded via scripts/sync-planets.ts), so moons can be
// linked to their parent planet via parentId.
const PLANET_ID_TO_SLUG: Record<string, string> = {
    mercure: 'mercury',
    venus: 'venus',
    terre: 'earth',
    mars: 'mars',
    jupiter: 'jupiter',
    saturne: 'saturn',
    uranus: 'uranus',
    neptune: 'neptune',
}

function slugify(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

function mapBodyType(body: SolarBody): 'MOON' | 'ASTEROID' | 'COMET' | null {
    const bt = body.bodyType?.toLowerCase()
    if (bt) {
        if (bt.includes('moon')) return 'MOON'
        if (bt.includes('asteroid')) return 'ASTEROID'
        if (bt.includes('comet')) return 'COMET'
        if (bt.includes('planet') || bt.includes('star')) return null // already seeded elsewhere
    }
    // Fallback when bodyType is missing: a non-planet body orbiting
    // a planet is almost certainly a moon.
    if (!body.isPlanet && body.aroundPlanet) return 'MOON'
    return null
}

function summarize(body: SolarBody, category: string, parentName: string | null): string {
    const parts: string[] = []
    const name = body.englishName || body.name

    if (category === 'MOON' && parentName) {
        parts.push(`${name} is a moon of ${parentName}.`)
    } else if (category === 'ASTEROID') {
        parts.push(`${name} is a minor planet classified as an asteroid.`)
    } else if (category === 'COMET') {
        parts.push(`${name} is a comet in our solar system.`)
    } else {
        parts.push(`${name} is a body in our solar system.`)
    }

    if (body.discoveredBy) {
        parts.push(
            `It was discovered by ${body.discoveredBy}${body.discoveryDate ? ` in ${body.discoveryDate}` : ''}.`
        )
    }
    if (body.meanRadius) {
        parts.push(`It has a mean radius of about ${body.meanRadius.toLocaleString()} km.`)
    }
    if (body.sideralOrbit) {
        parts.push(`It completes an orbit roughly every ${body.sideralOrbit.toFixed(1)} days.`)
    }

    return parts.join(' ')
}

async function fetchAllBodies(): Promise<SolarBody[]> {
    const apiKey = process.env.SOLAR_SYSTEM_API_KEY
    if (!apiKey) {
        throw new Error('Missing SOLAR_SYSTEM_API_KEY in .env.local — get one at https://api.le-systeme-solaire.net/generatekey.html')
    }

    const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!res.ok) {
        throw new Error(`Solar System API error: ${res.status} ${res.statusText}`)
    }
    const json = await res.json() as { bodies: SolarBody[] }
    return json.bodies
}

async function main() {
    console.log('🌙 Fetching solar system bodies...')
    const allBodies = await fetchAllBodies()
    console.log(`   Retrieved ${allBodies.length} total bodies`)

    // Pre-fetch parent planet ids (already seeded) so we can link moons.
    const planetSlugs = Object.values(PLANET_ID_TO_SLUG)
    const planets = await db.celestialObject.findMany({
        where: { slug: { in: planetSlugs } },
        select: { id: true, slug: true, name: true },
    })
    const planetBySlug = new Map(planets.map(p => [p.slug, p]))
    console.log(`   Found ${planets.length}/${planetSlugs.length} parent planets already in DB`)

    const seenSlugs = new Set<string>()
    const records: Array<Record<string, unknown>> = []
    let skipped = 0

    for (const body of allBodies) {
        const category = mapBodyType(body)
        if (!category) {
            skipped++
            continue
        }

        const name = body.englishName || body.name
        if (!name) {
            skipped++
            continue
        }

        const baseSlug = slugify(name)
        let slug = baseSlug
        let n = 2
        while (seenSlugs.has(slug)) slug = `${baseSlug}-${n++}`
        seenSlugs.add(slug)

        let parentId: string | null = null
        let parentName: string | null = null
        if (category === 'MOON' && body.aroundPlanet) {
            const parentSlug = PLANET_ID_TO_SLUG[body.aroundPlanet.planet]
            const parent = parentSlug ? planetBySlug.get(parentSlug) : undefined
            if (parent) {
                parentId = parent.id
                parentName = parent.name
            }
        }

        const massKg = body.mass ? body.mass.massValue * Math.pow(10, body.mass.massExponent) : null

        records.push({
            slug,
            name,
            type: category,
            summary: summarize(body, category, parentName),
            massKg,
            radiusKm: body.meanRadius,
            parentId,
            attributes: {
                bodyType: body.bodyType ?? null,
                aroundPlanet: parentName,
                orbitalPeriodDays: body.sideralOrbit,
                rotationPeriodHours: body.sideralRotation,
                semimajorAxisKm: body.semimajorAxis,
                eccentricity: body.eccentricity,
                inclinationDegrees: body.inclination,
                density: body.density,
                gravity: body.gravity,
                escapeVelocity: body.escape,
                avgTempK: body.avgTemp,
                discoveredBy: body.discoveredBy || null,
                discoveryDate: body.discoveryDate || null,
            },
        })
    }

    console.log(`   Mapped ${records.length} moons/asteroids/comets (skipped ${skipped} planets/stars/unrecognized)`)
    console.log(`💾 Inserting ${records.length} records (skipping duplicates)...`)

    const BATCH_SIZE = 200
    let inserted = 0
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)
        const result = await db.celestialObject.createMany({
            data: batch as never,
            skipDuplicates: true,
        })
        inserted += result.count
        console.log(`   Batch ${Math.floor(i / BATCH_SIZE) + 1}: +${result.count}`)
    }

    console.log(`🚀 Solar system sync complete — ${inserted} new objects added`)
}

main()
    .catch(e => {
        console.error('❌ Solar system sync failed:', e)
        process.exit(1)
    })
    .finally(() => db.$disconnect())