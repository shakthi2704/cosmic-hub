import { db } from '@/lib/db'
import { PersonRole } from '@prisma/client'

export async function getPeople(params?: {
    role?: PersonRole
    search?: string
    page?: number
    limit?: number
}) {
    const { role, search, page = 1, limit = 24 } = params ?? {}
    const skip = (page - 1) * limit

    const where = {
        ...(role ? { role } : {}),
        ...(search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { bio: { contains: search, mode: 'insensitive' as const } },
                    { nationality: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {}),
    }

    const [items, total] = await Promise.all([
        db.person.findMany({
            where,
            include: {
                agency: {
                    select: { name: true, slug: true, abbreviation: true },
                },
                missions: {
                    include: {
                        mission: {
                            select: { id: true, slug: true, name: true, status: true },
                        },
                    },
                },
            },
            orderBy: { name: 'asc' },
            skip,
            take: limit,
        }),
        db.person.count({ where }),
    ])

    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    }
}

export async function getPersonBySlug(slug: string) {
    return db.person.findUnique({
        where: { slug },
        include: {
            agency: true,
            missions: {
                include: {
                    mission: {
                        select: {
                            id: true,
                            slug: true,
                            name: true,
                            status: true,
                            missionType: true,
                            launchDate: true,
                        },
                    },
                },
            },
        },
    })
}