import { NextRequest, NextResponse } from 'next/server'
import { getCelestialObjects } from '@/lib/services/celestial.service'
import { CelestialType } from '@prisma/client'

export async function GET(req: NextRequest) {
    try {
        const sp = req.nextUrl.searchParams
        const type = sp.get('type') as CelestialType | null
        const page = Math.max(1, parseInt(sp.get('page') ?? '1', 10))
        const search = sp.get('search') ?? undefined

        const data = await getCelestialObjects({
            type: type ?? undefined,
            page,
            search,
        })
        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}