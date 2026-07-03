import { NextResponse } from 'next/server'
import { getUpcomingLaunches } from '@/lib/services/live.service'

export const runtime = 'nodejs'

export async function GET() {
    try {
        const data = await getUpcomingLaunches()
        return NextResponse.json(data)
    } catch (err) {
        return NextResponse.json(
            { error: 'Failed to fetch launches' },
            { status: 503 }
        )
    }
}