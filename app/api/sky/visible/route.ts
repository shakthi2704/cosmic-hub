import { NextRequest, NextResponse } from 'next/server'
import { getVisiblePlanets } from '@/lib/services/sky.service'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const latParam = searchParams.get('lat')
    const lngParam = searchParams.get('lng')

    if (!latParam || !lngParam) {
        return NextResponse.json(
            { error: 'lat and lng query params are required' },
            { status: 400 }
        )
    }

    const latitude = Number(latParam)
    const longitude = Number(lngParam)

    if (
        Number.isNaN(latitude) ||
        Number.isNaN(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        return NextResponse.json(
            { error: 'lat must be -90..90 and lng must be -180..180' },
            { status: 400 }
        )
    }

    try {
        const data = await getVisiblePlanets(latitude, longitude)
        return NextResponse.json(data)
    } catch (err) {
        console.error('[api/sky/visible] failed', err)
        return NextResponse.json(
            { error: 'Failed to compute sky visibility' },
            { status: 503 }
        )
    }
}