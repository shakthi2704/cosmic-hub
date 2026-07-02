import { db } from '@/lib/db'
import { MissionStatus, MissionType } from '@prisma/client'

export async function getMissions(params?: {
    status?: MissionStatus
    missionType?: MissionType
    page?: number
    limit?: number
}) {
    const { status, missionType, page = 1, limit = 24 } = params ?? {}
    const skip = (page - 1) * limit

    const where = {
        ...(status ? { status } : {}),
        ...(missionType ? { missionType } : {}),
    }

    const [items, total] = await Promise.all([
        db.mission.findMany({
            where,
            include: {
                agency: {
                    select: { name: true, slug: true, abbreviation: true },
                },
                target: {
                    select: { name: true, slug: true, type: true },
                },
            },
            orderBy: { launchDate: 'desc' },
            skip,
            take: limit,
        }),
        db.mission.count({ where }),
    ])

    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    }
}

export async function getMissionBySlug(slug: string) {
    return db.mission.findUnique({
        where: { slug },
        include: {
            agency: true,
            target: {
                select: {
                    id: true,
                    slug: true,
                    name: true,
                    type: true,
                    imageUrl: true,
                    summary: true,
                },
            },
            crew: {
                include: {
                    person: {
                        select: {
                            id: true,
                            slug: true,
                            name: true,
                            role: true,
                            imageUrl: true,
                            nationality: true,
                        },
                    },
                },
            },
        },
    })
}