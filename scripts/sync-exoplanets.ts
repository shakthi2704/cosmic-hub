import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

// ─── NASA Exoplanet Archive (TAP service, no auth required) ──
// pscomppars = Planetary Systems Composite Parameters — one row
// per confirmed planet, using the archive's best-estimate values.

const TAP_URL = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync'

const ADQL = `
    SELECT pl_name, hostname, discoverymethod, disc_year, disc_facility,
           pl_orbper, pl_rade, pl_bmasse, pl_orbsmax, pl_eqt, sy_dist
    FROM pscomppars
`.replace(/\s+/g, ' ').trim()

const EARTH_RADIUS_KM = 6371
const EARTH_MASS_KG = 5.972e24

interface ExoplanetRow {
    pl_name: string
    hostname: string | null
    discoverymethod: string | null
    disc_year: number | null
    disc_facility: string | null
    pl_orbper: number | null   // orbital period, days
    pl_rade: number | null     // radius, Earth radii
    pl_bmasse: number | null   // mass, Earth masses
    pl_orbsmax: number | null  // semi-major axis, AU
    pl_eqt: number | null      // equilibrium temp, K
    sy_dist: number | null     // distance from Earth, parsecs
}

function slugify(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

function summarize(row: ExoplanetRow): string {
    const parts: string[] = []
    parts.push(
        row.hostname
            ? `${row.pl_name} is a confirmed exoplanet orbiting the star ${row.hostname}.`
            : `${row.pl_name} is a confirmed exoplanet.`
    )
    if (row.discoverymethod) {
        parts.push(
            `Discovered via ${row.discoverymethod.toLowerCase()}${row.disc_year ? ` in ${row.disc_year}` : ''}${row.disc_facility ? ` by ${row.disc_facility}` : ''}.`
        )
    }
    if (row.pl_rade) {
        parts.push(`It has a radius of about ${row.pl_rade.toFixed(2)} Earth radii.`)
    }
    return parts.join(' ')
}

async function fetchExoplanets(): Promise<ExoplanetRow[]> {
    const url = `${TAP_URL}?query=${encodeURIComponent(ADQL)}&format=json`
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error(`NASA Exoplanet Archive error: ${res.status} ${res.statusText}`)
    }
    return res.json() as Promise<ExoplanetRow[]>
}

async function main() {
    console.log('🪐 Fetching confirmed exoplanets from NASA Exoplanet Archive...')
    const rows = await fetchExoplanets()
    console.log(`   Retrieved ${rows.length} rows`)

    const seenSlugs = new Set<string>()
    const records = rows
        .filter(r => r.pl_name)
        .map(row => {
            const baseSlug = slugify(row.pl_name)
            let slug = baseSlug
            let n = 2
            while (seenSlugs.has(slug)) {
                slug = `${baseSlug}-${n++}`
            }
            seenSlugs.add(slug)

            return {
                slug,
                name: row.pl_name,
                type: 'EXOPLANET' as const,
                summary: summarize(row),
                massKg: row.pl_bmasse ? row.pl_bmasse * EARTH_MASS_KG : null,
                radiusKm: row.pl_rade ? row.pl_rade * EARTH_RADIUS_KM : null,
                attributes: {
                    hostStar: row.hostname,
                    discoveryMethod: row.discoverymethod,
                    discoveryYear: row.disc_year,
                    discoveryFacility: row.disc_facility,
                    orbitalPeriodDays: row.pl_orbper,
                    orbitalRadiusAU: row.pl_orbsmax,
                    equilibriumTempK: row.pl_eqt,
                    distanceFromEarthParsecs: row.sy_dist,
                    radiusEarthRadii: row.pl_rade,
                    massEarthMasses: row.pl_bmasse,
                },
            }
        })

    console.log(`💾 Inserting ${records.length} exoplanets (skipping duplicates)...`)

    const BATCH_SIZE = 500
    let inserted = 0
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)
        const result = await db.celestialObject.createMany({
            data: batch,
            skipDuplicates: true,
        })
        inserted += result.count
        console.log(`   Batch ${Math.floor(i / BATCH_SIZE) + 1}: +${result.count}`)
    }

    console.log(`🚀 Exoplanet sync complete — ${inserted} new objects added`)
}

main()
    .catch(e => {
        console.error('❌ Exoplanet sync failed:', e)
        process.exit(1)
    })
    .finally(() => db.$disconnect())