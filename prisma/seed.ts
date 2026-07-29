import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const db = new PrismaClient({ adapter })

async function main() {
    console.log('🌌 Seeding CosmicHub database...')

    // ─── Agencies ────────────────────────────────────────
    const nasa = await db.agency.upsert({
        where: { slug: 'nasa' },
        update: {},
        create: {
            slug: 'nasa',
            name: 'National Aeronautics and Space Administration',
            abbreviation: 'NASA',
            countryCode: 'US',
            type: 'GOVERNMENT',
            websiteUrl: 'https://www.nasa.gov',
            foundedYear: 1958,
            description:
                'NASA is the United States federal agency responsible for the civilian space program, as well as aeronautics and space research. Founded in 1958, it has led humanity\'s exploration of the Moon, Mars, and beyond.',
            imageUrl: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=800&q=80',
        },
    })

    const esa = await db.agency.upsert({
        where: { slug: 'esa' },
        update: {},
        create: {
            slug: 'esa',
            name: 'European Space Agency',
            abbreviation: 'ESA',
            countryCode: 'EU',
            type: 'INTERNATIONAL',
            websiteUrl: 'https://www.esa.int',
            foundedYear: 1975,
            description:
                'ESA is an intergovernmental organisation of 22 member states dedicated to the exploration of space. Its headquarters are in Paris, and it operates major facilities across Europe.',
            imageUrl: 'https://images.unsplash.com/photo-1516849677043-ef67c9557e16?w=800&q=80',
        },
    })

    const spacex = await db.agency.upsert({
        where: { slug: 'spacex' },
        update: {},
        create: {
            slug: 'spacex',
            name: 'Space Exploration Technologies Corp.',
            abbreviation: 'SpaceX',
            countryCode: 'US',
            type: 'PRIVATE',
            websiteUrl: 'https://www.spacex.com',
            foundedYear: 2002,
            description:
                'SpaceX designs, manufactures, and launches advanced rockets and spacecraft. Founded by Elon Musk, it became the first private company to successfully launch, orbit, and recover a spacecraft.',
            imageUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=800&q=80',
        },
    })

    const roscosmos = await db.agency.upsert({
        where: { slug: 'roscosmos' },
        update: {},
        create: {
            slug: 'roscosmos',
            name: 'Roscosmos State Corporation for Space Activities',
            abbreviation: 'Roscosmos',
            countryCode: 'RU',
            type: 'GOVERNMENT',
            websiteUrl: 'https://www.roscosmos.ru',
            foundedYear: 1992,
            description:
                'Roscosmos is the governmental body responsible for the space science program of Russia and general aerospace research. It is the successor to the Soviet space program.',
            imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80',
        },
    })

    const isro = await db.agency.upsert({
        where: { slug: 'isro' },
        update: {},
        create: {
            slug: 'isro',
            name: 'Indian Space Research Organisation',
            abbreviation: 'ISRO',
            countryCode: 'IN',
            type: 'GOVERNMENT',
            websiteUrl: 'https://www.isro.gov.in',
            foundedYear: 1969,
            description:
                'ISRO is the national space agency of India, headquartered in Bengaluru. It operates under the Department of Space and has achieved landmark missions including Mars Orbiter Mission and Chandrayaan.',
            imageUrl: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&q=80',
        },
    })

    console.log('✅ Agencies seeded')

    // ─── Celestial Objects ────────────────────────────────

    // Sun
    const sun = await db.celestialObject.upsert({
        where: { slug: 'sun' },
        update: {},
        create: {
            slug: 'sun',
            name: 'Sun',
            type: 'STAR',
            summary:
                'The Sun is the star at the center of our Solar System. It is a nearly perfect sphere of hot plasma, heated to incandescence by nuclear fusion reactions in its core. The Sun radiates energy mainly as light, ultraviolet, and infrared radiation.',
            massKg: 1.989e30,
            radiusKm: 695700,
            imageUrl: 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=800&q=80',
            attributes: {
                age: '4.6 billion years',
                surfaceTemperature: '5,778 K',
                coreTemperature: '15 million K',
                spectralClass: 'G2V',
                luminosity: '3.828 × 10²⁶ W',
                rotationPeriod: '25.4 days (equatorial)',
                distanceFromEarth: '149.6 million km (1 AU)',
                composition: 'Hydrogen 73%, Helium 25%, other 2%',
                absoluteMagnitude: 4.83,
            },
        },
    })

    // Milky Way
    const milkyWay = await db.celestialObject.upsert({
        where: { slug: 'milky-way' },
        update: {},
        create: {
            slug: 'milky-way',
            name: 'Milky Way',
            type: 'GALAXY',
            summary:
                'The Milky Way is the galaxy that includes the Solar System. It is a barred spiral galaxy containing an estimated 100–400 billion stars and at least that many planets. The galaxy is approximately 87,400 light-years in diameter.',
            imageUrl: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&q=80',
            attributes: {
                type: 'Barred spiral galaxy (SBbc)',
                diameter: '87,400 light-years',
                thickness: '1,000 light-years (disk)',
                stars: '100–400 billion',
                age: '13.61 billion years',
                distanceToCenter: '26,000 light-years from Earth',
                mass: '1.5 × 10¹² solar masses',
                satellites: 'Large and Small Magellanic Clouds',
            },
        },
    })

    // Andromeda
    await db.celestialObject.upsert({
        where: { slug: 'andromeda' },
        update: {},
        create: {
            slug: 'andromeda',
            name: 'Andromeda Galaxy',
            type: 'GALAXY',
            summary:
                'The Andromeda Galaxy (M31) is a barred spiral galaxy and the nearest large galaxy to the Milky Way. It is on a collision course with the Milky Way, expected to merge in approximately 4.5 billion years.',
            imageUrl: 'https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=800&q=80',
            attributes: {
                designation: 'M31 / NGC 224',
                type: 'Barred spiral galaxy (SA(s)b)',
                distance: '2.537 million light-years',
                diameter: '220,000 light-years',
                stars: 'Approximately 1 trillion',
                apparentMagnitude: 3.44,
                mass: '1.5 × 10¹² solar masses',
                discoveredBy: 'Abd al-Rahman al-Sufi (964 AD)',
            },
        },
    })

    // Triangulum
    await db.celestialObject.upsert({
        where: { slug: 'triangulum' },
        update: {},
        create: {
            slug: 'triangulum',
            name: 'Triangulum Galaxy',
            type: 'GALAXY',
            summary:
                'The Triangulum Galaxy (M33) is a spiral galaxy 2.73 million light-years from Earth. It is the third-largest member of the Local Group, after the Milky Way and Andromeda galaxies, and the most distant permanent object visible to the naked eye.',
            imageUrl: 'https://images.unsplash.com/photo-1501862700950-18382cd41497?w=800&q=80',
            attributes: {
                designation: 'M33 / NGC 598',
                type: 'Spiral galaxy (SA(s)cd)',
                distance: '2.73 million light-years',
                diameter: '60,000 light-years',
                stars: '40 billion',
                apparentMagnitude: 5.72,
            },
        },
    })

    // Sombrero Galaxy
    await db.celestialObject.upsert({
        where: { slug: 'sombrero' },
        update: {},
        create: {
            slug: 'sombrero',
            name: 'Sombrero Galaxy',
            type: 'GALAXY',
            summary:
                'The Sombrero Galaxy (M104) is a lenticular or spiral galaxy in the constellation Virgo. It has a bright nucleus, an unusually large central bulge, and a prominent dust lane in its outer disk viewed edge-on, giving it the appearance of a sombrero hat.',
            imageUrl: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&q=80',
            attributes: {
                designation: 'M104 / NGC 4594',
                type: 'Unbarred spiral / Lenticular (SA(s)a)',
                distance: '31.1 million light-years',
                diameter: '50,000 light-years',
                stars: '100 billion',
                apparentMagnitude: 8.98,
            },
        },
    })

    // Sagittarius A*
    const sagA = await db.celestialObject.upsert({
        where: { slug: 'sagittarius-a-star' },
        update: {},
        create: {
            slug: 'sagittarius-a-star',
            name: 'Sagittarius A*',
            type: 'BLACK_HOLE',
            summary:
                'Sagittarius A* is a supermassive black hole at the center of the Milky Way. In 2022, the Event Horizon Telescope produced the first image of Sgr A*, confirming its identity. Its mass is approximately 4 million times that of the Sun.',
            massKg: 8e36,
            radiusKm: 12e6,
            imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
            attributes: {
                mass: '4.154 million solar masses',
                schwarzschildRadius: '12.4 million km',
                distanceFromEarth: '26,000 light-years',
                firstImaged: '2022 (Event Horizon Telescope)',
                type: 'Supermassive black hole',
            },
        },
    })

    // M87*
    await db.celestialObject.upsert({
        where: { slug: 'm87-star' },
        update: {},
        create: {
            slug: 'm87-star',
            name: 'M87*',
            type: 'BLACK_HOLE',
            summary:
                'M87* is a supermassive black hole at the center of the elliptical galaxy Messier 87. In April 2019, it became the first black hole to be directly imaged, captured by the Event Horizon Telescope collaboration.',
            massKg: 1.3e40,
            imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80',
            attributes: {
                mass: '6.5 billion solar masses',
                distanceFromEarth: '55 million light-years',
                firstImaged: 'April 10, 2019 (Event Horizon Telescope)',
                jet: 'Relativistic jet extending 5,000 light-years',
                type: 'Supermassive black hole',
            },
        },
    })

    // Cygnus X-1
    await db.celestialObject.upsert({
        where: { slug: 'cygnus-x1' },
        update: {},
        create: {
            slug: 'cygnus-x1',
            name: 'Cygnus X-1',
            type: 'BLACK_HOLE',
            summary:
                'Cygnus X-1 is a galactic X-ray source and one of the most studied stellar black holes. Discovered in 1964, it was the first strong candidate for a black hole, and was the subject of a famous bet between Stephen Hawking and Kip Thorne.',
            massKg: 2.8e31,
            imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80',
            attributes: {
                mass: '21.2 solar masses',
                distanceFromEarth: '7,200 light-years',
                companion: 'HDE 226868 (blue supergiant)',
                discovered: '1964',
                type: 'Stellar black hole',
                xrayLuminosity: '~10³⁷ erg/s',
            },
        },
    })

    // Orion Nebula
    await db.celestialObject.upsert({
        where: { slug: 'orion-nebula' },
        update: {},
        create: {
            slug: 'orion-nebula',
            name: 'Orion Nebula',
            type: 'NEBULA',
            summary:
                'The Orion Nebula (M42) is a diffuse nebula situated in the Milky Way, south of Orion\'s Belt. It is one of the brightest nebulae and is visible to the naked eye. It is 1,344 light-years away and is the closest region of massive star formation to Earth.',
            imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&q=80',
            attributes: {
                designation: 'M42 / NGC 1976',
                type: 'Diffuse / HII region nebula',
                distance: '1,344 light-years',
                diameter: '24 light-years',
                apparentMagnitude: 4.0,
                constellation: 'Orion',
                age: '~3 million years',
            },
        },
    })

    // Crab Nebula
    await db.celestialObject.upsert({
        where: { slug: 'crab-nebula' },
        update: {},
        create: {
            slug: 'crab-nebula',
            name: 'Crab Nebula',
            type: 'NEBULA',
            summary:
                'The Crab Nebula (M1) is a supernova remnant in the constellation Taurus. The common name comes from its appearance in a drawing made by Lord Rosse in 1842. At the center of the nebula lies the Crab Pulsar, a neutron star spinning 30 times per second.',
            imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80',
            attributes: {
                designation: 'M1 / NGC 1952',
                type: 'Supernova remnant',
                distance: '6,500 light-years',
                diameter: '11 light-years',
                supernova: 'SN 1054 (observed July 4, 1054)',
                pulsar: 'PSR B0531+21 (30 Hz)',
                constellation: 'Taurus',
            },
        },
    })

    // Eagle Nebula
    await db.celestialObject.upsert({
        where: { slug: 'eagle-nebula' },
        update: {},
        create: {
            slug: 'eagle-nebula',
            name: 'Eagle Nebula',
            type: 'NEBULA',
            summary:
                'The Eagle Nebula (M16) is a young open cluster of stars in the constellation Serpens, created 5.5 million years ago. It contains the famous "Pillars of Creation" — a set of elephant-trunk pillars of interstellar gas and dust, famously photographed by the Hubble Space Telescope in 1995.',
            imageUrl: 'https://images.unsplash.com/photo-1614732484003-ef9881555dc3?w=800&q=80',
            attributes: {
                designation: 'M16 / NGC 6611',
                type: 'HII region / open cluster',
                distance: '7,000 light-years',
                diameter: '70 × 55 light-years',
                constellation: 'Serpens',
                pillarsOfCreation: '4–5 light-years tall',
                age: '5.5 million years',
            },
        },
    })

    console.log('✅ Celestial objects seeded')

    // ─── People ───────────────────────────────────────────

    const armstrong = await db.person.upsert({
        where: { slug: 'neil-armstrong' },
        update: {},
        create: {
            slug: 'neil-armstrong',
            name: 'Neil Armstrong',
            role: 'ASTRONAUT',
            nationality: 'American',
            birthYear: 1930,
            deathYear: 2012,
            agency: { connect: { id: nasa.id } },
            imageUrl: 'https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?w=400&q=80',
            wikiUrl: 'https://en.wikipedia.org/wiki/Neil_Armstrong',
            bio: 'Neil Alden Armstrong was an American astronaut and aeronautical engineer who became the first person to walk on the Moon on July 20, 1969, during the Apollo 11 mission. Before joining NASA, he was a naval aviator and test pilot. His famous words upon landing — "That\'s one small step for man, one giant leap for mankind" — are among the most quoted in history.',
        },
    })

    const aldrin = await db.person.upsert({
        where: { slug: 'buzz-aldrin' },
        update: {},
        create: {
            slug: 'buzz-aldrin',
            name: 'Buzz Aldrin',
            role: 'ASTRONAUT',
            nationality: 'American',
            birthYear: 1930,
            agency: { connect: { id: nasa.id } },
            imageUrl: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=400&q=80',
            wikiUrl: 'https://en.wikipedia.org/wiki/Buzz_Aldrin',
            bio: 'Buzz Aldrin is an American former astronaut, engineer, and fighter pilot who was the Lunar Module Pilot on Apollo 11. He was the second person to walk on the Moon. A graduate of West Point and MIT, Aldrin has been a passionate advocate for space exploration and Mars colonization throughout his life.',
        },
    })

    await db.person.upsert({
        where: { slug: 'valentina-tereshkova' },
        update: {},
        create: {
            slug: 'valentina-tereshkova',
            name: 'Valentina Tereshkova',
            role: 'COSMONAUT',
            nationality: 'Russian',
            birthYear: 1937,
            agency: { connect: { id: roscosmos.id } },
            imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=80',
            wikiUrl: 'https://en.wikipedia.org/wiki/Valentina_Tereshkova',
            bio: 'Valentina Vladimirovna Tereshkova is a Russian engineer and former cosmonaut who became the first woman to fly in space on June 16, 1963, aboard Vostok 6. She orbited Earth 48 times over three days. She was selected from more than 400 applicants and five finalists for the historic mission.',
        },
    })

    await db.person.upsert({
        where: { slug: 'yuri-gagarin' },
        update: {},
        create: {
            slug: 'yuri-gagarin',
            name: 'Yuri Gagarin',
            role: 'COSMONAUT',
            nationality: 'Russian',
            birthYear: 1934,
            deathYear: 1968,
            agency: { connect: { id: roscosmos.id } },
            imageUrl: 'https://images.unsplash.com/photo-1516849677043-ef67c9557e16?w=400&q=80',
            wikiUrl: 'https://en.wikipedia.org/wiki/Yuri_Gagarin',
            bio: 'Yuri Alekseyevich Gagarin was a Soviet pilot and cosmonaut who became the first human to journey into outer space on April 12, 1961. His spacecraft, Vostok 1, completed one orbit around Earth. Gagarin became an international celebrity and was awarded the Hero of the Soviet Union, the nation\'s highest honour.',
        },
    })

    await db.person.upsert({
        where: { slug: 'carl-sagan' },
        update: {},
        create: {
            slug: 'carl-sagan',
            name: 'Carl Sagan',
            role: 'SCIENTIST',
            nationality: 'American',
            birthYear: 1934,
            deathYear: 1996,
            agency: { connect: { id: nasa.id } },
            imageUrl: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=400&q=80',
            wikiUrl: 'https://en.wikipedia.org/wiki/Carl_Sagan',
            bio: 'Carl Edward Sagan was an American astronomer, planetary scientist, cosmologist, and author. He is best known for his work as a science communicator, his book and television series Cosmos, and his role in the Voyager Golden Record project. Sagan contributed to many NASA missions and was instrumental in the search for extraterrestrial intelligence.',
        },
    })

    await db.person.upsert({
        where: { slug: 'stephen-hawking' },
        update: {},
        create: {
            slug: 'stephen-hawking',
            name: 'Stephen Hawking',
            role: 'SCIENTIST',
            nationality: 'British',
            birthYear: 1942,
            deathYear: 2018,
            imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&q=80',
            wikiUrl: 'https://en.wikipedia.org/wiki/Stephen_Hawking',
            bio: 'Stephen William Hawking was an English theoretical physicist, cosmologist, and author. He was the Lucasian Professor of Mathematics at Cambridge. His groundbreaking work on black holes and cosmology, including Hawking radiation, revolutionised our understanding of the universe. Despite being diagnosed with motor neurone disease at 21, he continued working for over five decades.',
        },
    })

    await db.person.upsert({
        where: { slug: 'kalpana-chawla' },
        update: {},
        create: {
            slug: 'kalpana-chawla',
            name: 'Kalpana Chawla',
            role: 'ASTRONAUT',
            nationality: 'American',
            birthYear: 1962,
            deathYear: 2003,
            agency: { connect: { id: nasa.id } },
            imageUrl: 'https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?w=400&q=80',
            wikiUrl: 'https://en.wikipedia.org/wiki/Kalpana_Chawla',
            bio: 'Kalpana Chawla was an American astronaut and aerospace engineer. She was the first woman of Indian origin to go to space, flying on Space Shuttle Columbia in 1997. She died in 2003 when Columbia disintegrated during re-entry. Chawla remains an enduring inspiration for millions, particularly in India and among women in STEM fields.',
        },
    })

    console.log('✅ People seeded')

    // ─── Missions ─────────────────────────────────────────

    const apollo11 = await db.mission.upsert({
        where: { slug: 'apollo-11' },
        update: {},
        create: {
            slug: 'apollo-11',
            name: 'Apollo 11',
            status: 'COMPLETED',
            missionType: 'CREWED',
            launchDate: new Date('1969-07-16'),
            endDate: new Date('1969-07-24'),
            agency: { connect: { id: nasa.id } },
            description:
                'Apollo 11 was the American spaceflight that first landed humans on the Moon. Commander Neil Armstrong and Lunar Module Pilot Buzz Aldrin landed on July 20, 1969, while Command Module Pilot Michael Collins orbited above. Armstrong became the first person to step onto the lunar surface, followed by Aldrin. They spent 21 hours on the Moon and returned with 21.5 kg of lunar material.',
            wikiUrl: 'https://en.wikipedia.org/wiki/Apollo_11',
        },
    })

    const voyager1 = await db.mission.upsert({
        where: { slug: 'voyager-1' },
        update: {},
        create: {
            slug: 'voyager-1',
            name: 'Voyager 1',
            status: 'ACTIVE',
            missionType: 'PROBE',
            launchDate: new Date('1977-09-05'),
            agency: { connect: { id: nasa.id } },
            description:
                'Voyager 1 is a space probe launched by NASA to study the outer Solar System. It is the farthest human-made object from Earth, currently in interstellar space. The probe carries a Golden Record — a phonograph record containing sounds and images selected to portray the diversity of life and culture on Earth.',
            wikiUrl: 'https://en.wikipedia.org/wiki/Voyager_1',
        },
    })

    await db.mission.upsert({
        where: { slug: 'curiosity' },
        update: {},
        create: {
            slug: 'curiosity',
            name: 'Mars Science Laboratory (Curiosity)',
            status: 'ACTIVE',
            missionType: 'ROVER',
            launchDate: new Date('2011-11-26'),
            agency: { connect: { id: nasa.id } },
            description:
                'Curiosity is a car-sized Mars rover designed to explore the Gale crater as part of NASA\'s Mars Science Laboratory mission. It landed on August 6, 2012 and has been operating for over a decade. Curiosity has confirmed that Mars once had conditions suitable for microbial life.',
            wikiUrl: 'https://en.wikipedia.org/wiki/Curiosity_(rover)',
        },
    })

    const jwst = await db.mission.upsert({
        where: { slug: 'james-webb-space-telescope' },
        update: {},
        create: {
            slug: 'james-webb-space-telescope',
            name: 'James Webb Space Telescope',
            status: 'ACTIVE',
            missionType: 'TELESCOPE',
            launchDate: new Date('2021-12-25'),
            agency: { connect: { id: nasa.id } },
            description:
                'The James Webb Space Telescope (JWST) is a space telescope designed to conduct infrared astronomy. As the largest optical telescope in space, its high resolution and sensitivity allow it to view objects too old, distant, or faint for Hubble. It observes in the infrared spectrum, enabling it to see the first galaxies that formed after the Big Bang.',
            wikiUrl: 'https://en.wikipedia.org/wiki/James_Webb_Space_Telescope',
        },
    })

    await db.mission.upsert({
        where: { slug: 'hubble-space-telescope' },
        update: {},
        create: {
            slug: 'hubble-space-telescope',
            name: 'Hubble Space Telescope',
            status: 'ACTIVE',
            missionType: 'TELESCOPE',
            launchDate: new Date('1990-04-24'),
            agency: { connect: { id: nasa.id } },
            description:
                'The Hubble Space Telescope is a space telescope that was launched into low Earth orbit in 1990 and remains operational. It is not the first space telescope, but it is one of the largest and most versatile, renowned both as a vital research tool and as a public relations boon for astronomy.',
            wikiUrl: 'https://en.wikipedia.org/wiki/Hubble_Space_Telescope',
        },
    })

    await db.mission.upsert({
        where: { slug: 'perseverance' },
        update: {},
        create: {
            slug: 'perseverance',
            name: 'Mars 2020 (Perseverance)',
            status: 'ACTIVE',
            missionType: 'ROVER',
            launchDate: new Date('2020-07-30'),
            agency: { connect: { id: nasa.id } },
            description:
                'Perseverance is a Mars rover manufactured by NASA\'s Jet Propulsion Laboratory. It landed in Jezero Crater on February 18, 2021. The mission is designed to seek signs of ancient microbial life, collect rock and soil samples for potential return to Earth, and test oxygen production from the Martian atmosphere.',
            wikiUrl: 'https://en.wikipedia.org/wiki/Perseverance_(rover)',
        },
    })

    await db.mission.upsert({
        where: { slug: 'cassini-huygens' },
        update: {},
        create: {
            slug: 'cassini-huygens',
            name: 'Cassini–Huygens',
            status: 'COMPLETED',
            missionType: 'ORBITER',
            launchDate: new Date('1997-10-15'),
            endDate: new Date('2017-09-15'),
            agency: { connect: { id: nasa.id } },
            description:
                'Cassini–Huygens was a collaboration between NASA, the ESA, and the Italian Space Agency to send a probe to study the planet Saturn and its system. The Cassini probe orbited Saturn for 13 years and the Huygens lander descended to Titan\'s surface. The mission ended with the Grand Finale — a controlled descent into Saturn\'s atmosphere.',
            wikiUrl: 'https://en.wikipedia.org/wiki/Cassini%E2%80%93Huygens',
        },
    })

    await db.mission.upsert({
        where: { slug: 'new-horizons' },
        update: {},
        create: {
            slug: 'new-horizons',
            name: 'New Horizons',
            status: 'ACTIVE',
            missionType: 'FLYBY',
            launchDate: new Date('2006-01-19'),
            agency: { connect: { id: nasa.id } },
            description:
                'New Horizons is an interplanetary space probe launched by NASA. In 2015 it performed a flyby study of the Pluto system, providing the first close-up images of Pluto. The spacecraft then continued into the Kuiper Belt, flying past the Arrokoth object in 2019 — the most distant object ever explored by a spacecraft.',
            wikiUrl: 'https://en.wikipedia.org/wiki/New_Horizons',
        },
    })

    console.log('✅ Missions seeded')

    // ─── Mission Crew ─────────────────────────────────────

    await db.missionCrew.upsert({
        where: { missionId_personId: { missionId: apollo11.id, personId: armstrong.id } },
        update: {},
        create: {
            mission: { connect: { id: apollo11.id } },
            person: { connect: { id: armstrong.id } },
            roleOnMission: 'Commander',
        },
    })

    await db.missionCrew.upsert({
        where: { missionId_personId: { missionId: apollo11.id, personId: aldrin.id } },
        update: {},
        create: {
            mission: { connect: { id: apollo11.id } },
            person: { connect: { id: aldrin.id } },
            roleOnMission: 'Lunar Module Pilot',
        },
    })

    console.log('✅ Mission crew seeded')

    // ─── Tags ─────────────────────────────────────────────

    const tagData = [
        { slug: 'habitable-zone', name: 'Habitable Zone', category: 'science' },
        { slug: 'rocky', name: 'Rocky', category: 'composition' },
        { slug: 'gas-giant', name: 'Gas Giant', category: 'composition' },
        { slug: 'ice-giant', name: 'Ice Giant', category: 'composition' },
        { slug: 'ring-system', name: 'Ring System', category: 'feature' },
        { slug: 'magnetic-field', name: 'Strong Magnetic Field', category: 'feature' },
        { slug: 'moons', name: 'Has Moons', category: 'feature' },
        { slug: 'crewed', name: 'Crewed Mission', category: 'mission' },
        { slug: 'historic', name: 'Historic', category: 'significance' },
        { slug: 'first', name: 'First of its Kind', category: 'significance' },
        { slug: 'active', name: 'Currently Active', category: 'status' },
        { slug: 'deep-space', name: 'Deep Space', category: 'location' },
        { slug: 'interstellar', name: 'Interstellar', category: 'location' },
        { slug: 'stellar-nursery', name: 'Stellar Nursery', category: 'science' },
        { slug: 'supermassive', name: 'Supermassive', category: 'classification' },
        { slug: 'event-horizon-imaged', name: 'Event Horizon Imaged', category: 'significance' },
    ]

    const tags: Record<string, { id: string }> = {}
    for (const t of tagData) {
        const tag = await db.tag.upsert({
            where: { slug: t.slug },
            update: {},
            create: t,
        })
        tags[t.slug] = tag
    }

    // Taggables
    const taggables = [
        { tagSlug: 'historic', entityType: 'mission', entityId: apollo11.id },
        { tagSlug: 'crewed', entityType: 'mission', entityId: apollo11.id },
        { tagSlug: 'first', entityType: 'mission', entityId: apollo11.id },
        { tagSlug: 'deep-space', entityType: 'mission', entityId: voyager1.id },
        { tagSlug: 'interstellar', entityType: 'mission', entityId: voyager1.id },
        { tagSlug: 'active', entityType: 'mission', entityId: voyager1.id },
        { tagSlug: 'active', entityType: 'mission', entityId: jwst.id },
        { tagSlug: 'supermassive', entityType: 'celestial', entityId: sagA.id },
        { tagSlug: 'event-horizon-imaged', entityType: 'celestial', entityId: sagA.id },
        { tagSlug: 'stellar-nursery', entityType: 'celestial', entityId: milkyWay.id },
        { tagSlug: 'first', entityType: 'person', entityId: armstrong.id },
        { tagSlug: 'historic', entityType: 'person', entityId: armstrong.id },
    ]

    for (const t of taggables) {
        await db.taggable.upsert({
            where: {
                tagId_entityType_entityId: {
                    tagId: tags[t.tagSlug].id,
                    entityType: t.entityType,
                    entityId: t.entityId,
                },
            },
            update: {},
            create: {
                tag: { connect: { id: tags[t.tagSlug].id } },
                entityType: t.entityType,
                entityId: t.entityId,
            },
        })
    }

    console.log('✅ Tags seeded')
    console.log('🚀 CosmicHub database seed complete!')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })