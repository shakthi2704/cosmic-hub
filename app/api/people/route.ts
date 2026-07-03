import { NextRequest, NextResponse } from 'next/server'
import { getPeople } from '@/lib/services/people.service'
import { PersonRole } from '@prisma/client'

export async function GET(req: NextRequest) {
    try {
        const sp = req.nextUrl.searchParams
        const role = sp.get('role') as PersonRole | null
        const search = sp.get('search') ?? undefined
        const page = Math.max(1, parseInt(sp.get('page') ?? '1', 10))

        const data = await getPeople({
            role: role ?? undefined,
            search,
            page,
        })
        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}