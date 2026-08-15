
import { NextResponse } from 'next/server'
import { getISSPosition } from '@/lib/services/live.service'

export const runtime = 'nodejs'

export async function GET() {
    try {
        const data = await getISSPosition()
        return NextResponse.json(data)
    } catch (err) {
        console.error('[api/live/iss] failed:', err)
        return NextResponse.json(
            { error: 'Failed to fetch ISS position' },
            { status: 503 }
        )
    }
}
