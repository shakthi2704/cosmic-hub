import { db } from '@/lib/db'

export interface SearchResult {
    id: string
    slug: string
    name: string
    type: 'celestial' | 'mission' | 'person'
    subtype?: string
    summary?: string | null
    imageUrl?: string | null
}

export async function globalSearch(query: string, limit = 5): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) return []

    const q = query.trim()

    const [celestial, missions, people] = await Promise.all([
        db.celestialObject.findMany({
            where: {
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { summary: { contains: q, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                slug: true,
                name: true,
                type: true,
                summary: true,
                imageUrl: true,
            },
            take: limit,
        }),
        db.mission.findMany({
            where: {
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { description: { contains: q, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                slug: true,
                name: true,
                status: true,
                missionType: true,
            },
            take: limit,
        }),
        db.person.findMany({
            where: {
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { bio: { contains: q, mode: 'insensitive' } },
                    { nationality: { contains: q, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                slug: true,
                name: true,
                role: true,
                imageUrl: true,
            },
            take: limit,
        }),
    ])

    const results: SearchResult[] = [
        ...celestial.map((c) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
            type: 'celestial' as const,
            subtype: c.type,
            summary: c.summary,
            imageUrl: c.imageUrl,
        })),
        ...missions.map((m) => ({
            id: m.id,
            slug: m.slug,
            name: m.name,
            type: 'mission' as const,
            subtype: m.missionType,
        })),
        ...people.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            type: 'person' as const,
            subtype: p.role,
            imageUrl: p.imageUrl,
        })),
    ]

    return results
}