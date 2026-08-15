import { NextResponse } from 'next/server'
import { getNearEarthObjects } from '@/lib/services/live.service'

export const runtime = 'nodejs'

export async function GET() {
    try {
        const data = await getNearEarthObjects()
        return NextResponse.json(data)
    } catch (err) {
        console.error('[api/live/neo] failed:', err)
        return NextResponse.json(
            { error: 'Failed to fetch near-Earth objects' },
            { status: 503 }
        )
    }
}