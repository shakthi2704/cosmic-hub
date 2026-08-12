import { PrismaClient } from '@prisma/client'

interface ArticleSeed {
    slug: string
    title: string
    excerpt: string
    body: string
    kind: 'GLOSSARY' | 'FEATURE'
    coverImage?: string
    tagSlugs: string[]
}

const GLOSSARY: ArticleSeed[] = [
    {
        slug: 'what-is-a-nebula',
        title: 'What Is a Nebula?',
        excerpt: 'Clouds of gas and dust where stars are born — or where they leave their remains.',
        kind: 'GLOSSARY',
        tagSlugs: ['stellar-nursery'],
        body: `A nebula is a vast cloud of gas and dust in space, made mostly of hydrogen and helium along with trace amounts of heavier elements. Nebulae come in several distinct types, each tied to a different stage of stellar life.

**Stellar nurseries**, like the Orion Nebula, are regions where gravity slowly pulls together clumps of gas until they become dense and hot enough to ignite nuclear fusion — the birth of a new star. These are often called emission nebulae, glowing because radiation from young, hot stars excites the surrounding gas.

**Planetary nebulae** form at the opposite end of a star's life. Despite the name, they have nothing to do with planets — early astronomers just thought they looked planet-like through small telescopes. They're created when a Sun-like star exhausts its fuel and sheds its outer layers, leaving behind an expanding shell of glowing gas around a hot, dying core.

**Supernova remnants**, like the Crab Nebula, are the debris left behind after a massive star explodes. These nebulae are especially important scientifically — they seed surrounding space with heavy elements like carbon, oxygen, and iron, the same elements that eventually form planets, and life.

Nebulae are typically enormous, often spanning dozens of light-years, but they're also extremely diffuse — far less dense than any vacuum humans can create on Earth. Their glow comes almost entirely from the stars embedded within or near them.`,
    },
    {
        slug: 'what-is-the-solar-system',
        title: 'What Is the Solar System?',
        excerpt: 'The Sun, its eight planets, and everything gravitationally bound to it.',
        kind: 'GLOSSARY',
        tagSlugs: ['solar-system'],
        body: `The Solar System is the Sun and everything that orbits it, held together by gravity. At its center, the Sun contains more than 99.8% of the system's total mass — everything else, from Jupiter down to the smallest asteroid, makes up the remainder.

Closest to the Sun are the four rocky **terrestrial planets** — Mercury, Venus, Earth, and Mars — small, dense worlds with solid surfaces. Beyond Mars lies the asteroid belt, a region of rocky debris left over from the Solar System's formation. Further out are the four **giant planets**: Jupiter and Saturn, the gas giants, and Uranus and Neptune, the ice giants, all far larger than the terrestrial planets but far less dense.

Beyond Neptune lies the Kuiper Belt, a distant region of icy bodies including Pluto, and further still, the theorized Oort Cloud — a spherical shell of icy objects thought to be the source of long-period comets, marking the outer edge of the Sun's gravitational influence.

The entire Solar System formed roughly 4.6 billion years ago from a collapsing cloud of gas and dust. Most of that material fell into the Sun; the rest flattened into a spinning disk, within which planets gradually formed through collisions and accretion — smaller particles sticking together to build larger and larger bodies over millions of years.`,
    },
    {
        slug: 'what-is-an-exoplanet',
        title: 'What Is an Exoplanet?',
        excerpt: 'A planet orbiting a star other than our own Sun.',
        kind: 'GLOSSARY',
        tagSlugs: ['exoplanet', 'habitable-zone'],
        body: `An exoplanet, short for "extrasolar planet," is any planet that orbits a star other than the Sun. The first confirmed exoplanet orbiting a Sun-like star was discovered in 1995; since then, astronomers have confirmed thousands more, revealing an extraordinary diversity of worlds — far more varied than anything in our own Solar System.

Exoplanets are grouped into rough categories based on size and composition. **Earth-sized** and **super-Earth** planets are rocky worlds up to roughly twice Earth's radius. **Sub-Neptunes** are smaller gas-rich planets, a type entirely absent from our Solar System. **Gas giants**, often called "hot Jupiters" when found in tight, scorching orbits, are large worlds dominated by hydrogen and helium atmospheres.

A planet's **habitable zone** status refers to whether it orbits at a distance from its star where liquid water could theoretically exist on its surface — not too hot, not too cold. Being in the habitable zone doesn't guarantee a planet has water, an atmosphere, or is otherwise capable of supporting life; it simply means the temperature range makes it possible in principle.

Because exoplanets are so far away and so faint compared to their host stars, almost none have ever been directly photographed. Instead, astronomers infer their existence and properties indirectly, most commonly through the transit method and radial velocity method — both covered in more detail in our feature article on exoplanet discovery.`,
    },
    {
        slug: 'what-is-a-black-hole',
        title: 'What Is a Black Hole?',
        excerpt: 'A region of space where gravity is so strong that nothing, not even light, can escape.',
        kind: 'GLOSSARY',
        tagSlugs: ['supermassive', 'event-horizon-imaged'],
        body: `A black hole is a region of space where gravity has become so strong that nothing — not even light — can escape once it crosses a boundary called the **event horizon**. This isn't a physical surface; it's simply the point of no return.

Black holes form when massive stars run out of fuel and collapse under their own gravity. If the collapsing core is massive enough, no known force can stop the collapse, and it compresses into a **singularity** — a point of theoretically infinite density where our current understanding of physics breaks down.

Astronomers classify black holes roughly by mass. **Stellar-mass black holes**, typically a few to a few dozen times the Sun's mass, form from the collapse of individual massive stars. **Supermassive black holes**, millions to billions of times the Sun's mass, are found at the centers of most large galaxies, including our own Milky Way. How supermassive black holes grow so large remains an active area of research.

Despite their reputation, black holes don't "suck in" everything nearby — they exert gravity just like any other object of the same mass. A black hole with the Sun's mass would have exactly the Sun's gravitational pull at the same distance. It's only very close to the event horizon that the effects become extreme.

In 2019, the Event Horizon Telescope captured the first-ever image of a black hole's shadow — the supermassive black hole at the center of galaxy M87 — followed in 2022 by an image of Sagittarius A*, the black hole at the center of our own galaxy.`,
    },
    {
        slug: 'what-is-a-galaxy',
        title: 'What Is a Galaxy?',
        excerpt: 'A gravitationally bound system of stars, gas, dust, and dark matter.',
        kind: 'GLOSSARY',
        tagSlugs: [],
        body: `A galaxy is an enormous, gravitationally bound collection of stars, gas, dust, and dark matter — anywhere from a few hundred million to over a trillion stars, depending on the galaxy's size. Galaxies are the basic building blocks of the large-scale structure of the universe.

Galaxies come in several broad shapes. **Spiral galaxies**, like the Milky Way, have a flat, rotating disk with distinct spiral arms and a central bulge. **Elliptical galaxies** are smoother, more rounded collections of stars with little ongoing star formation. **Irregular galaxies** lack a defined shape, often as a result of gravitational interactions or collisions with other galaxies.

Most galaxies, including the Milky Way, contain a supermassive black hole at their center. Galaxies themselves are rarely isolated — they cluster together in groups, clusters, and superclusters, connected by a vast cosmic web of filaments, with enormous voids in between.

Our own galaxy, the Milky Way, contains an estimated 100–400 billion stars and is roughly 100,000 light-years across. It's part of the Local Group, a collection of over 80 galaxies that includes the Andromeda Galaxy — which is on a slow collision course with the Milky Way, expected to merge in roughly 4–5 billion years.`,
    },
    {
        slug: 'what-is-a-star',
        title: 'What Is a Star?',
        excerpt: 'A massive, glowing ball of plasma held together by its own gravity, powered by nuclear fusion.',
        kind: 'GLOSSARY',
        tagSlugs: [],
        body: `A star is a massive sphere of plasma held together by its own gravity, generating energy through nuclear fusion in its core. Fusion occurs when the immense pressure and temperature at a star's center force hydrogen atoms to combine into helium, releasing enormous amounts of energy as light and heat in the process.

Stars are classified primarily by temperature and color, using a system of spectral types running from hottest to coolest: O, B, A, F, G, K, and M. The Sun is a G-type star — a fairly average, mid-temperature yellow-white star. Blue O-type stars are far hotter and more massive but burn through their fuel quickly; red M-type dwarfs are cooler, smaller, and can burn for trillions of years.

A star's life cycle depends almost entirely on its initial mass. Low- and medium-mass stars like the Sun eventually swell into red giants before shedding their outer layers as a planetary nebula, leaving behind a slowly cooling white dwarf. Massive stars burn through their fuel far faster and end their lives in a supernova explosion, leaving behind either a neutron star or, for the most massive stars, a black hole.

Stars are not scattered randomly — they form in clusters within nebulae, spend most of their lives on the "main sequence" steadily fusing hydrogen, and ultimately return much of their material back into space, enriching future generations of stars and planets with heavier elements.`,
    },
    {
        slug: 'what-is-a-light-year',
        title: 'What Is a Light-Year?',
        excerpt: 'A unit of distance, not time — how far light travels in one year.',
        kind: 'GLOSSARY',
        tagSlugs: [],
        body: `A light-year is a unit of distance, despite the word "year" — it's the distance light travels in one Earth year, roughly 9.46 trillion kilometers (about 5.88 trillion miles). Astronomers use it because the numbers involved in measuring cosmic distances in kilometers or miles quickly become unmanageable.

Light travels at about 300,000 kilometers per second, fast enough to circle the Earth roughly seven times in a single second. Even at that speed, it takes light about 8 minutes to reach us from the Sun, and over 4 years to reach us from Proxima Centauri, the nearest star system beyond our own.

Because light takes time to travel, looking at distant objects in space means looking back in time. A galaxy 10 million light-years away is being seen as it existed 10 million years ago, not as it exists today. The most distant galaxies observed by telescopes like the James Webb Space Telescope are seen as they were over 13 billion years ago, not long after the universe itself began.

This delay is often described as looking through a kind of time machine — the deeper astronomers look into space, the further back in cosmic history they're actually seeing.`,
    },
    {
        slug: 'what-is-a-habitable-zone',
        title: 'What Is a Habitable Zone?',
        excerpt: 'The orbital distance from a star where a planet could support liquid water.',
        kind: 'GLOSSARY',
        tagSlugs: ['habitable-zone'],
        body: `A habitable zone, sometimes called the "Goldilocks zone," is the range of orbital distances around a star where a planet's surface temperature could allow liquid water to exist — not so close that water boils away, not so far that it freezes solid.

The boundaries of a star's habitable zone depend on the star's temperature and brightness. Hotter, more luminous stars push the habitable zone further out; cooler, dimmer stars have a habitable zone much closer in. In our own Solar System, Earth sits comfortably within the Sun's habitable zone, while Venus lies just inside its inner edge and Mars just outside its outer edge.

Being in the habitable zone is necessary but not sufficient for a planet to actually be habitable. Venus, despite orbiting near the zone's inner edge, has a runaway greenhouse atmosphere hot enough to melt lead. Mars, near the outer edge, lost most of its atmosphere billions of years ago and is now a cold, thin-aired desert. Atmosphere, magnetic field, geological activity, and a planet's history all matter as much as orbital distance.

For exoplanets, habitable-zone status is often the first and easiest thing astronomers can determine, since it only requires knowing the planet's orbital distance and the host star's properties — long before anything can be learned about its atmosphere or surface conditions.`,
    },
]

const FEATURES: ArticleSeed[] = [
    {
        slug: 'how-we-discover-exoplanets',
        title: 'How Do We Discover Exoplanets?',
        excerpt: 'Exoplanets are too faint and too distant to photograph directly — so astronomers had to get creative.',
        kind: 'FEATURE',
        coverImage: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=1200&q=80',
        tagSlugs: ['exoplanet'],
        body: `Finding a planet orbiting a star trillions of kilometers away sounds close to impossible — and in the most direct sense, it almost is. Stars are enormously bright compared to the planets orbiting them; trying to spot an exoplanet directly is often compared to trying to see a firefly next to a searchlight, from thousands of kilometers away. Almost none of the thousands of confirmed exoplanets have ever actually been photographed. Instead, astronomers have developed several indirect methods that infer a planet's presence from its effect on its host star.

**The Transit Method**

By far the most productive technique, the transit method watches for tiny, regular dips in a star's brightness as a planet passes in front of it from our point of view. If a planet's orbit happens to be aligned edge-on relative to Earth, it will periodically block a small fraction of the star's light — often less than 1%. Missions like NASA's Kepler and TESS space telescopes have used this method to find the vast majority of confirmed exoplanets, staring at hundreds of thousands of stars simultaneously and watching for these characteristic dips. The size of the dip reveals the planet's size, and the time between dips reveals its orbital period.

**The Radial Velocity Method**

Also called the "wobble method," this technique doesn't watch the star's light directly, but its motion. A planet doesn't just orbit its star — the star also wobbles slightly around the system's shared center of mass, pulled by the planet's own gravity. This wobble stretches and compresses the wavelength of the star's light as it moves slightly toward and away from Earth, a Doppler shift that can be measured with extremely precise instruments. This was the method used for the first exoplanet discovery around a Sun-like star in 1995, and it remains especially useful for confirming and measuring the mass of planets first spotted through transits.

**Direct Imaging and Microlensing**

A small number of exoplanets — usually massive, young, and orbiting far from their star — have been imaged directly, using techniques that block out the overwhelming glare of the host star. An even rarer method, gravitational microlensing, relies on chance: when a foreign star with a planet passes precisely in front of a more distant background star, its gravity briefly bends and magnifies the background star's light in a distinctive pattern, revealing the presence of the planet.

**Why It Matters**

Each method has its own strengths and blind spots. Transit surveys favor planets with orbits aligned just right for us to see; radial velocity favors massive planets orbiting close to their star. Combining multiple methods — and improving each one's sensitivity — is how astronomers have gone from zero confirmed exoplanets before 1995 to thousands today, revealing that planets are not the exception in our galaxy, but the norm.`,
    },
    {
        slug: 'life-cycle-of-a-star',
        title: 'The Life Cycle of a Star',
        excerpt: "From a collapsing cloud of gas to a stellar remnant — a star's fate is written the moment it's born.",
        kind: 'FEATURE',
        coverImage: 'https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=1200&q=80',
        tagSlugs: ['stellar-nursery'],
        body: `Every star's story begins and ends in the same basic way: gravity pulling matter together, and eventually, gravity winning. But between birth and death, that story can play out over anywhere from a few million to trillions of years, and the ending is determined almost entirely by one factor — how much mass the star started with.

**Birth in a Nebula**

Stars form within nebulae, vast clouds of gas and dust. Gravity slowly pulls denser clumps of material together; as a clump contracts, it heats up, spins faster, and flattens into a rotating disk with a growing, increasingly hot core at its center. Once that core reaches roughly 10 million degrees Celsius, nuclear fusion ignites — hydrogen atoms fuse into helium, releasing energy that halts further collapse. A star is born, and it enters the longest, most stable phase of its life.

**The Main Sequence**

Most stars, including our Sun, spend the vast majority of their lives in what's called the main sequence — steadily fusing hydrogen into helium in their core, in a stable balance between the inward pull of gravity and the outward pressure of fusion energy. How long a star stays on the main sequence depends heavily on its mass: massive, hot blue stars burn through their fuel in just a few million years, while small, cool red dwarfs can sustain fusion for trillions of years — longer than the current age of the universe.

**Death of a Sun-Like Star**

When a star like the Sun exhausts the hydrogen in its core, fusion shifts to an outer shell, and the star swells dramatically into a red giant. Eventually, it sheds its outer layers entirely, creating a glowing planetary nebula, while the exposed core — now a dense, Earth-sized white dwarf — slowly cools over billions of years, no longer generating energy of its own.

**Death of a Massive Star**

Stars far more massive than the Sun meet a much more violent end. After exhausting hydrogen, they continue fusing progressively heavier elements — helium, carbon, oxygen, all the way up to iron — in a layered structure sometimes compared to an onion. Iron fusion doesn't release energy, so once a massive star's core turns to iron, fusion can no longer support it against gravity. The core collapses in a fraction of a second, triggering a catastrophic supernova explosion that can briefly outshine an entire galaxy. What's left behind depends on the original star's mass: a dense neutron star, or for the most massive stars, a black hole.

**Seeding the Next Generation**

Neither death is truly an ending. The material shed by dying stars — hydrogen, helium, and the heavier elements forged inside them — mixes back into the surrounding gas, eventually collapsing again into new stars and new planetary systems. Nearly every element heavier than hydrogen and helium in your body, in the Earth, in everything around you, was forged inside a star that died long before the Sun ever formed.`,
    },
    {
        slug: 'black-holes-where-physics-breaks-down',
        title: 'Black Holes: Where Physics Breaks Down',
        excerpt: 'The most extreme objects in the universe — and the place where our best theories of gravity stop giving clear answers.',
        kind: 'FEATURE',
        coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
        tagSlugs: ['supermassive', 'event-horizon-imaged'],
        body: `Few objects capture the imagination quite like black holes — regions of space where gravity has grown so overwhelming that nothing, not even light, can escape. But behind the popular image lies a genuinely strange set of physics, one that pushes our best theories of the universe to their breaking point.

**A Prediction Before a Discovery**

Black holes were first predicted mathematically, not observed. Albert Einstein's theory of general relativity, published in 1915, describes gravity not as a force but as the curvature of spacetime itself caused by mass. Shortly after, physicist Karl Schwarzschild found a solution to Einstein's equations describing an object so dense that its curvature of spacetime would become infinite — a black hole, decades before anyone had direct evidence they actually existed.

**The Event Horizon**

The defining feature of a black hole isn't a physical surface — it's the event horizon, an invisible boundary marking the point of no return. Cross it, and no signal, no light, no information of any kind can ever reach the outside universe again. This isn't because black holes are "stronger" magnets for matter than anything else; a black hole exerts exactly the same gravitational pull as any other object of equal mass at the same distance. It's only extremely close to the event horizon that gravity becomes so extreme that escape becomes physically impossible.

**Where the Math Breaks**

At the very center of a black hole lies a singularity — a point where, according to general relativity, density becomes infinite and the equations simply stop producing meaningful answers. Most physicists don't believe a true infinity actually exists in nature; instead, the breakdown is understood as a sign that general relativity alone isn't the complete picture. Describing what actually happens at a singularity likely requires a theory that successfully merges gravity with quantum mechanics — something physicists have been chasing for nearly a century without success.

**From Theory to Image**

For decades, black holes could only be detected indirectly — through their gravitational pull on nearby stars, or the intense radiation emitted by matter heating up as it spirals in. That changed in 2019, when the Event Horizon Telescope, a global network of radio telescopes working together as one Earth-sized instrument, captured the first-ever image of a black hole's shadow: the supermassive black hole at the center of galaxy M87. In 2022, the same collaboration imaged Sagittarius A*, the supermassive black hole at the very center of our own Milky Way — turning what was once a purely theoretical prediction into something humanity has now, quite literally, seen.`,
    },
]

// ─── Seed Function ──────────────────────────────────────────

export async function seedArticles(db: PrismaClient) {
    console.log('📚 Seeding articles...')

    const topicTagData = [
        { slug: 'nebula', name: 'Nebula', category: 'topic' },
        { slug: 'solar-system', name: 'Solar System', category: 'topic' },
        { slug: 'exoplanet', name: 'Exoplanet', category: 'topic' },
    ]

    const topicTags: Record<string, { id: string }> = {}
    for (const t of topicTagData) {
        const tag = await db.tag.upsert({
            where: { slug: t.slug },
            update: {},
            create: t,
        })
        topicTags[t.slug] = tag
    }

    const allTags = [...GLOSSARY, ...FEATURES]

    for (const entry of allTags) {
        const article = await db.article.upsert({
            where: { slug: entry.slug },
            update: {
                title: entry.title,
                excerpt: entry.excerpt,
                body: entry.body,
                kind: entry.kind,
                coverImage: entry.coverImage,
            },
            create: {
                slug: entry.slug,
                title: entry.title,
                excerpt: entry.excerpt,
                body: entry.body,
                kind: entry.kind,
                coverImage: entry.coverImage,
            },
        })

        for (const tagSlug of entry.tagSlugs) {
            // some tagSlugs reference tags already seeded in seed.ts
            // (e.g. 'habitable-zone', 'stellar-nursery'), others are
            // the new topic tags created above — look up either
            const existingTag = await db.tag.findUnique({ where: { slug: tagSlug } })
            if (!existingTag) {
                console.warn(`  ⚠ tag "${tagSlug}" not found, skipping for article ${entry.slug}`)
                continue
            }

            await db.taggable.upsert({
                where: {
                    tagId_entityType_entityId: {
                        tagId: existingTag.id,
                        entityType: 'article',
                        entityId: article.id,
                    },
                },
                update: {},
                create: {
                    tag: { connect: { id: existingTag.id } },
                    entityType: 'article',
                    entityId: article.id,
                },
            })
        }
    }

    console.log(`✅ Articles seeded (${GLOSSARY.length} glossary, ${FEATURES.length} features)`)
}