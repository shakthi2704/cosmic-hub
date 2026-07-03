import { NextRequest, NextResponse } from 'next/server'
import { getCelestialBySlug } from '@/lib/services/celestial.service'

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params
        const data = await getCelestialBySlug(slug)
        if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}