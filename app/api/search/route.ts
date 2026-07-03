import { NextRequest, NextResponse } from 'next/server'
import { globalSearch } from '@/lib/services/search.service'

export async function GET(req: NextRequest) {
    try {
        const q = req.nextUrl.searchParams.get('q') ?? ''
        const results = await globalSearch(q)
        return NextResponse.json(results)
    } catch {
        return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }
}