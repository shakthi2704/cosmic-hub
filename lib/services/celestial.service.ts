import { db } from '@/lib/db'
import { CelestialType } from '@prisma/client'

export async function getCelestialObjects(params?: {
    type?: CelestialType
    search?: string
    page?: number
    limit?: number
}) {
    const { type, search, page = 1, limit = 24 } = params ?? {}
    const skip = (page - 1) * limit

    const where = {
        ...(type ? { type } : {}),
        ...(search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { summary: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {}),
    }

    const [items, total] = await Promise.all([
        db.celestialObject.findMany({
            where,
            orderBy: { name: 'asc' },
            skip,
            take: limit,
            select: {
                id: true,
                slug: true,
                name: true,
                type: true,
                summary: true,
                imageUrl: true,
                massKg: true,
                radiusKm: true,
                attributes: true,
            },
        }),
        db.celestialObject.count({ where }),
    ])

    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    }
}

export async function getCelestialBySlug(slug: string) {
    return db.celestialObject.findUnique({
        where: { slug },
        include: {
            parent: {
                select: { id: true, slug: true, name: true, type: true },
            },
            children: {
                select: { id: true, slug: true, name: true, type: true, imageUrl: true },
                orderBy: { name: 'asc' },
            },
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
            relationsFrom: {
                include: {
                    to: { select: { id: true, slug: true, name: true, type: true } },
                },
            },
            relationsTo: {
                include: {
                    from: { select: { id: true, slug: true, name: true, type: true } },
                },
            },
        },
    })
}

export async function getCelestialTypeCounts() {
    const counts = await db.celestialObject.groupBy({
        by: ['type'],
        _count: { _all: true },
        orderBy: { _count: { type: 'desc' } },
    })

    return counts.map((c) => ({
        type: c.type,
        count: c._count._all,
    }))
}

export async function getFeaturedObjects() {
    const featured = ['milky-way', 'sagittarius-a-star', 'orion-nebula']
    return db.celestialObject.findMany({
        where: { slug: { in: featured } },
        select: {
            id: true,
            slug: true,
            name: true,
            type: true,
            summary: true,
            imageUrl: true,
            attributes: true,
        },
    })
}