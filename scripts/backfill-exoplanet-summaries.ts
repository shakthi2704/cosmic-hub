import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { generateExoplanetSummary } from './lib/exoplanet-enrichment'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

interface ExoplanetAttributes {
    hostStar: string | null
    discoveryMethod: string | null
    discoveryYear: number | null
    discoveryFacility: string | null
    orbitalPeriodDays: number | null
    orbitalRadiusAU: number | null
    equilibriumTempK: number | null
    distanceFromEarthParsecs: number | null
    radiusEarthRadii: number | null
    massEarthMasses: number | null
}

const BATCH_SIZE = 50 // concurrent updates per wave, gentle on the pooled connection

async function main() {
    console.log('🪐 Loading existing exoplanets from database...')
    const rows = await db.celestialObject.findMany({
        where: { type: 'EXOPLANET' },
        select: { id: true, name: true, attributes: true },
    })
    console.log(`   Found ${rows.length} exoplanets to backfill`)

    let updated = 0
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE)
        await Promise.all(
            batch.map(row => {
                const attrs = (row.attributes ?? {}) as unknown as ExoplanetAttributes
                const summary = generateExoplanetSummary({
                    name: row.name,
                    hostStar: attrs.hostStar,
                    discoveryMethod: attrs.discoveryMethod,
                    discoveryYear: attrs.discoveryYear,
                    discoveryFacility: attrs.discoveryFacility,
                    orbitalPeriodDays: attrs.orbitalPeriodDays,
                    orbitalRadiusAU: attrs.orbitalRadiusAU,
                    equilibriumTempK: attrs.equilibriumTempK,
                    distanceParsecs: attrs.distanceFromEarthParsecs,
                    radiusEarthRadii: attrs.radiusEarthRadii,
                    massEarthMasses: attrs.massEarthMasses,
                })
                return db.celestialObject.update({
                    where: { id: row.id },
                    data: { summary },
                })
            })
        )
        updated += batch.length
        console.log(`   Updated ${updated}/${rows.length}`)
    }

    console.log(`🚀 Backfill complete — ${updated} summaries regenerated`)
}

main()
    .catch(e => {
        console.error('❌ Backfill failed:', e)
        process.exit(1)
    })
    .finally(() => db.$disconnect())