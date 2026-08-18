import { NextResponse } from 'next/server'
import { getSpaceWeather } from '@/lib/services/live.service'

export const runtime = 'nodejs'

export async function GET() {
    try {
        const data = await getSpaceWeather()
        return NextResponse.json(data)
    } catch (err) {
        console.error('[api/live/space-weather] failed:', err)
        return NextResponse.json(
            { error: 'Failed to fetch space weather' },
            { status: 503 }
        )
    }
}