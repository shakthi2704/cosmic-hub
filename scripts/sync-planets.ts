import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

const planets = [
    {
        slug: 'mercury',
        name: 'Mercury',
        type: 'PLANET' as const,
        summary: 'Mercury is the smallest planet in the Solar System and the closest to the Sun. It has no atmosphere to retain heat, causing extreme temperature swings from 430°C during the day to -180°C at night.',
        massKg: 3.285e23,
        radiusKm: 2439.7,
        imageUrl: 'https://images.unsplash.com/photo-1614732484003-ef9881555dc3?w=800&q=80',
        attributes: {
            distanceFromSun: '57.9 million km (0.39 AU)',
            orbitalPeriod: '88 Earth days',
            rotationPeriod: '58.6 Earth days',
            surfaceTempMin: '-180°C',
            surfaceTempMax: '430°C',
            moons: 0,
            gravity: '3.7 m/s²',
            escapeVelocity: '4.25 km/s',
            composition: 'Iron core, silicate mantle',
            type: 'Terrestrial planet',
        },
    },
    {
        slug: 'venus',
        name: 'Venus',
        type: 'PLANET' as const,
        summary: 'Venus is the second planet from the Sun and the hottest in the Solar System despite not being closest to it. Its thick atmosphere traps heat in a runaway greenhouse effect, raising surface temperatures to 465°C.',
        massKg: 4.867e24,
        radiusKm: 6051.8,
        imageUrl: 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=800&q=80',
        attributes: {
            distanceFromSun: '108.2 million km (0.72 AU)',
            orbitalPeriod: '224.7 Earth days',
            rotationPeriod: '243 Earth days (retrograde)',
            surfaceTemp: '465°C',
            atmosphericPressure: '92 bar (92× Earth)',
            moons: 0,
            gravity: '8.87 m/s²',
            escapeVelocity: '10.36 km/s',
            atmosphere: 'CO₂ 96.5%, Nitrogen 3.5%',
            type: 'Terrestrial planet',
        },
    },
    {
        slug: 'earth',
        name: 'Earth',
        type: 'PLANET' as const,
        summary: 'Earth is the third planet from the Sun and the only known astronomical object to harbor life. It has one natural satellite, the Moon. About 71% of Earth\'s surface is covered by water.',
        massKg: 5.972e24,
        radiusKm: 6371,
        imageUrl: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&q=80',
        attributes: {
            distanceFromSun: '149.6 million km (1 AU)',
            orbitalPeriod: '365.25 days',
            rotationPeriod: '23h 56m',
            surfaceTempAvg: '15°C',
            moons: 1,
            gravity: '9.81 m/s²',
            escapeVelocity: '11.19 km/s',
            atmosphere: 'Nitrogen 78%, Oxygen 21%',
            waterCoverage: '71%',
            type: 'Terrestrial planet',
        },
    },
    {
        slug: 'mars',
        name: 'Mars',
        type: 'PLANET' as const,
        summary: 'Mars is the fourth planet from the Sun and the second-smallest in the Solar System. It is home to Olympus Mons, the tallest volcano in the Solar System, and Valles Marineris, one of the largest canyons.',
        massKg: 6.39e23,
        radiusKm: 3389.5,
        imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&q=80',
        attributes: {
            distanceFromSun: '227.9 million km (1.52 AU)',
            orbitalPeriod: '687 Earth days',
            rotationPeriod: '24h 37m',
            surfaceTempAvg: '-63°C',
            moons: 2,
            moonNames: 'Phobos, Deimos',
            gravity: '3.72 m/s²',
            escapeVelocity: '5.03 km/s',
            atmosphere: 'CO₂ 95%, Nitrogen 2.6%',
            olympusMons: '21.9 km high (tallest volcano in Solar System)',
            type: 'Terrestrial planet',
        },
    },
    {
        slug: 'jupiter',
        name: 'Jupiter',
        type: 'PLANET' as const,
        summary: 'Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass more than twice that of all other planets combined. The Great Red Spot is a storm that has persisted for at least 400 years.',
        massKg: 1.898e27,
        radiusKm: 69911,
        imageUrl: 'https://images.unsplash.com/photo-1639921884918-8d28ab2e39a4?w=800&q=80',
        attributes: {
            distanceFromSun: '778.5 million km (5.2 AU)',
            orbitalPeriod: '11.86 Earth years',
            rotationPeriod: '9h 56m (fastest in Solar System)',
            cloudTopTemp: '-108°C',
            moons: 95,
            largestMoons: 'Io, Europa, Ganymede, Callisto (Galilean moons)',
            gravity: '24.79 m/s²',
            escapeVelocity: '59.5 km/s',
            greatRedSpot: 'Storm larger than Earth, 400+ years old',
            composition: 'Hydrogen 90%, Helium 10%',
            type: 'Gas giant',
        },
    },
    {
        slug: 'saturn',
        name: 'Saturn',
        type: 'PLANET' as const,
        summary: 'Saturn is the sixth planet from the Sun and the second-largest. It is famous for its spectacular ring system, composed of ice and rock. Saturn is the least dense planet — it would float in water.',
        massKg: 5.683e26,
        radiusKm: 58232,
        imageUrl: 'https://images.unsplash.com/photo-1614314107768-6018061b5b72?w=800&q=80',
        attributes: {
            distanceFromSun: '1.43 billion km (9.58 AU)',
            orbitalPeriod: '29.46 Earth years',
            rotationPeriod: '10h 42m',
            cloudTopTemp: '-138°C',
            moons: 146,
            largestMoon: 'Titan (larger than Mercury)',
            gravity: '10.44 m/s²',
            escapeVelocity: '35.5 km/s',
            rings: 'Extend 282,000 km, mostly water ice',
            density: '0.687 g/cm³ (less than water)',
            type: 'Gas giant',
        },
    },
    {
        slug: 'uranus',
        name: 'Uranus',
        type: 'PLANET' as const,
        summary: 'Uranus is the seventh planet from the Sun. It rotates on its side with an axial tilt of 98°, meaning its poles experience 42 years of sunlight followed by 42 years of darkness. It is an ice giant with a blue-green hue from atmospheric methane.',
        massKg: 8.681e25,
        radiusKm: 25362,
        imageUrl: 'https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?w=800&q=80',
        attributes: {
            distanceFromSun: '2.87 billion km (19.2 AU)',
            orbitalPeriod: '84 Earth years',
            rotationPeriod: '17h 14m (retrograde)',
            cloudTopTemp: '-195°C',
            moons: 27,
            largestMoons: 'Miranda, Ariel, Umbriel, Titania, Oberon',
            gravity: '8.87 m/s²',
            escapeVelocity: '21.3 km/s',
            axialTilt: '97.77° (rotates on its side)',
            atmosphere: 'Hydrogen, Helium, Methane (gives blue-green colour)',
            type: 'Ice giant',
        },
    },
    {
        slug: 'neptune',
        name: 'Neptune',
        type: 'PLANET' as const,
        summary: 'Neptune is the eighth and farthest known planet from the Sun. It is an ice giant with the strongest winds in the Solar System, reaching speeds of 2,100 km/h. It was the first planet predicted by mathematics before being observed.',
        massKg: 1.024e26,
        radiusKm: 24622,
        imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80',
        attributes: {
            distanceFromSun: '4.5 billion km (30.07 AU)',
            orbitalPeriod: '164.8 Earth years',
            rotationPeriod: '16h 6m',
            cloudTopTemp: '-201°C',
            moons: 16,
            largestMoon: 'Triton (retrograde orbit, likely captured)',
            gravity: '11.15 m/s²',
            escapeVelocity: '23.5 km/s',
            windSpeed: 'Up to 2,100 km/h (fastest in Solar System)',
            discoveredBy: 'Urbain Le Verrier & Johann Galle (1846)',
            type: 'Ice giant',
        },
    },
]

const dwarfPlanets = [
    {
        slug: 'pluto',
        name: 'Pluto',
        type: 'DWARF_PLANET' as const,
        summary: 'Pluto is a dwarf planet in the Kuiper Belt. It was considered the ninth planet until 2006 when the IAU reclassified it. The New Horizons spacecraft conducted a flyby in 2015, revealing a heart-shaped nitrogen ice plain called Tombaugh Regio.',
        massKg: 1.303e22,
        radiusKm: 1188.3,
        imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80',
        attributes: {
            distanceFromSun: '5.9 billion km (39.5 AU)',
            orbitalPeriod: '248 Earth years',
            surfaceTempAvg: '-229°C',
            moons: 5,
            largestMoon: 'Charon (half the size of Pluto)',
            reclassified: '2006 by International Astronomical Union',
            exploredBy: 'New Horizons (flyby July 14, 2015)',
            type: 'Dwarf planet (Kuiper Belt Object)',
        },
    },
]

async function main() {
    console.log('🪐 Seeding planets and dwarf planets...')

    // Find the Sun to link planets
    const sun = await db.celestialObject.findUnique({
        where: { slug: 'sun' },
        select: { id: true },
    })

    let count = 0

    for (const planet of [...planets, ...dwarfPlanets]) {
        const record = await db.celestialObject.upsert({
            where: { slug: planet.slug },
            create: planet,
            update: planet,
            select: { id: true, name: true },
        })
        console.log(`  ✅ ${record.name}`)

        // Link to Sun via ORBITS relation
        if (sun) {
            await db.objectRelation.upsert({
                where: {
                    fromId_toId_relationType: {
                        fromId: record.id,
                        toId: sun.id,
                        relationType: 'ORBITS',
                    },
                },
                create: { fromId: record.id, toId: sun.id, relationType: 'ORBITS' },
                update: {},
            })
        }
        count++
    }

    console.log(`\n🚀 Done! Seeded ${count} planets and dwarf planets.`)
}

main()
    .catch((e) => {
        console.error('❌ Failed:', e)
        process.exit(1)
    })
    .finally(() => db.$disconnect())