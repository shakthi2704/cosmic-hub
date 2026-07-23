import { NextRequest, NextResponse } from 'next/server'
import { getMissions } from '@/lib/services/mission.service'
import { MissionStatus, MissionType } from '@prisma/client'

export async function GET(req: NextRequest) {
    try {
        const sp = req.nextUrl.searchParams
        const status = sp.get('status') as MissionStatus | null
        const missionType = sp.get('missionType') as MissionType | null
        const page = Math.max(1, parseInt(sp.get('page') ?? '1', 10))

        const data = await getMissions({
            status: status ?? undefined,
            missionType: missionType ?? undefined,
            page,
        })
        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}