export interface JourneyFact {
    label: string
    value: string
}

export interface JourneyContent {
    slug: string
    name: string
    /** Small line above the title. */
    kicker: string
    title: string
    summary: string
    facts: JourneyFact[]
    /** Optional honesty note shown under the facts. */
    note?: string
    source: { label: string; href: string }
    /** Main button. Swap to the Sanity article once it exists. */
    primary: { label: string; href: string }
    secondary: { label: string; href: string }
}

export const JOURNEY_CONTENT: JourneyContent[] = [
    {
        slug: 'mars',
        name: 'Mars',
        kicker: 'Region · Tharsis',
        title: 'Tharsis',
        summary:
            'Tharsis is a vast volcanic region of Mars. It holds the Tharsis Montes and Olympus Mons, the largest known volcano in the Solar System.',
        facts: [
            { label: 'Mean radius', value: '3,389.5 km' },
            { label: 'Length of day', value: '24 h 39 min' },
            { label: 'Year', value: '687 Earth days' },
            { label: 'Surface gravity', value: '0.38 × Earth' },
        ],
        note: 'The highlighted area is approximate, not an official boundary.',
        source: {
            label: 'NASA Mars Fact Sheet',
            href: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html',
        },
        primary: { label: 'Open the Mars page', href: '/celestial/mars' },
        secondary: { label: 'Explore the Solar System', href: '/solar-system' },
    },
    {
        slug: 'earth',
        name: 'Earth',
        kicker: 'Our home planet',
        title: 'Earth',
        summary:
            'Earth is the third planet from the Sun and the only world where life is known to exist. Liquid water, a protective atmosphere and active plate tectonics shape its surface.',
        facts: [
            { label: 'Mean radius', value: '6,371 km' },
            { label: 'Length of day', value: '24 h' },
            { label: 'Year', value: '365.25 days' },
            { label: 'Natural satellites', value: '1' },
        ],
        source: {
            label: 'NASA Earth Fact Sheet',
            href: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html',
        },
        primary: { label: 'Open the Earth page', href: '/celestial/earth' },
        secondary: { label: 'Explore the Solar System', href: '/solar-system' },
    },
    {
        slug: 'saturn',
        name: 'Saturn',
        kicker: 'Planet · Ringed giant',
        title: 'Saturn',
        summary:
            'Saturn is the second-largest planet in the Solar System, a gas giant whose mean density is lower than water. Its rings are made largely of water ice and lie in the planet’s equatorial plane.',
        facts: [
            { label: 'Mean radius', value: '58,232 km' },
            { label: 'Length of day', value: '10 h 39 min' },
            { label: 'Year', value: '10,759 Earth days' },
            { label: 'Axial tilt', value: '26.73°' },
        ],
        note: 'Ring size and shading are illustrative, not to scale.',
        source: {
            label: 'NASA Saturn Fact Sheet',
            href: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/saturnfact.html',
        },
        primary: { label: 'Open the Saturn page', href: '/celestial/saturn' },
        secondary: { label: 'Explore the Solar System', href: '/solar-system' },
    },
    {
        slug: 'sun',
        name: 'The Sun',
        kicker: 'Our star',
        title: 'The Sun',
        summary:
            'The Sun is the star at the centre of the Solar System and holds more than 99.8% of its mass. The visible surface, the photosphere, is a churning layer of hot plasma.',
        facts: [
            { label: 'Mean radius', value: '695,700 km' },
            { label: 'Surface temperature', value: '5,772 K (effective)' },
            { label: 'Rotation at equator', value: 'About 25 days' },
            { label: 'Share of Solar System mass', value: 'Over 99.8%' },
        ],
        note: 'The surface is a procedural illustration, not a photograph. Granules and dark patches are not to scale.',
        source: {
            label: 'NASA Sun Fact Sheet',
            href: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html?level=1',
        },
        primary: { label: 'Open the Sun page', href: '/celestial/sun' },
        secondary: { label: 'Explore the Solar System', href: '/solar-system' },
    },
    {
        slug: 'black-hole',
        name: 'Black hole',
        kicker: 'Supermassive black hole',
        title: 'Sagittarius A*',
        summary:
            'Sagittarius A* is the supermassive black hole at the centre of the Milky Way. Its gravity bends light so strongly that astronomers can see a ring of glowing gas around a dark shadow.',
        facts: [
            { label: 'Mass', value: 'About 4.3 million Suns' },
            { label: 'Distance', value: 'About 27,000 light-years' },
            { label: 'First image', value: 'May 2022 (EHT)' },
            { label: 'Type', value: 'Supermassive' },
        ],
        note: 'A stylised illustration of light bending near a black hole. It is not a simulation of Sagittarius A* or the real Event Horizon Telescope image.',
        source: {
            label: 'EHT Collaboration results (EurekAlert)',
            href: 'https://www.eurekalert.org/news-releases/952538',
        },
        primary: { label: 'Open the Sagittarius A* page', href: '/celestial/sagittarius-a-star' },
        secondary: { label: 'Read: What is a black hole?', href: '/learn/what-is-a-black-hole' },
    },
    {
        slug: 'galaxy',
        name: 'Galaxy',
        kicker: 'Our home galaxy',
        title: 'The Milky Way',
        summary:
            'The Milky Way is a barred spiral galaxy: a disk of stars, gas and dust with a bright central bulge and a bar of stars across its centre. The Solar System sits in the disk, far from the middle.',
        facts: [
            { label: 'Type', value: 'Barred spiral' },
            { label: 'Diameter', value: 'About 100,000 light-years' },
            { label: 'Stars', value: '100–400 billion' },
            { label: 'Sun’s orbit', value: '225–250 million years' },
        ],
        note: 'A stylised illustration, not a map. Nobody has photographed the Milky Way from outside, and the rotation shown here is far faster than the real one. Values are estimates and vary between studies.',
        source: {
            label: 'NASA Imagine the Universe: The Milky Way',
            href: 'https://imagine.gsfc.nasa.gov/science/objects/milkyway1.html',
        },
        primary: { label: 'Open the Milky Way page', href: '/celestial/milky-way' },
        secondary: { label: 'Read: What is a galaxy?', href: '/learn/what-is-a-galaxy' },
    },
]