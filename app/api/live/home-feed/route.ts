import { NextResponse } from 'next/server'
import { getNASAApod, getSpaceNews } from '@/lib/services/live.service'

export const runtime = 'nodejs'

export async function GET() {
    try {
        const [apod, articles] = await Promise.all([
            getNASAApod(),
            getSpaceNews(3),
        ])
        return NextResponse.json({ apod, articles })
    } catch (err) {
        console.error('[api/live/home-feed] failed:', err)
        return NextResponse.json(
            { error: 'Failed to fetch home feed' },
            { status: 503 }
        )
    }
}