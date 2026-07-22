import { db } from '@/lib/db'
import { AgencyType } from '@prisma/client'

export async function getAgencies(params?: {
    type?: AgencyType
    page?: number
    limit?: number
}) {
    const { type, page = 1, limit = 24 } = params ?? {}
    const skip = (page - 1) * limit

    const where = {
        ...(type ? { type } : {}),
    }

    const [items, total] = await Promise.all([
        db.agency.findMany({
            where,
            include: {
                _count: {
                    select: {
                        missions: true,
                        people: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
            skip,
            take: limit,
        }),
        db.agency.count({ where }),
    ])

    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    }
}

export async function getAgencyBySlug(slug: string) {
    return db.agency.findUnique({
        where: { slug },
        include: {
            missions: {
                select: {
                    id: true,
                    slug: true,
                    name: true,
                    status: true,
                    missionType: true,
                    launchDate: true,
                },
                orderBy: { launchDate: 'desc' },
            },
            people: {
                select: {
                    id: true,
                    slug: true,
                    name: true,
                    role: true,
                    imageUrl: true,
                    nationality: true,
                },
                orderBy: { name: 'asc' },
            },
            _count: {
                select: {
                    missions: true,
                    people: true,
                },
            },
        },
    })
}