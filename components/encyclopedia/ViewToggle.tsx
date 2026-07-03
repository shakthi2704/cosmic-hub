'use client'

import { useRouter } from 'next/navigation'
import { LayoutGrid, List } from 'lucide-react'

interface Props {
    current: 'grid' | 'list'
    type: string | null
    page: number
}

export default function ViewToggle({ current, type, page }: Props) {
    const router = useRouter()

    function toggle(view: 'grid' | 'list') {
        const params = new URLSearchParams()
        if (type) params.set('type', type)
        if (page > 1) params.set('page', String(page))
        params.set('view', view)
        router.push(`/celestial?${params.toString()}`)
    }

    return (
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-lg p-1">
            <button
                onClick={() => toggle('grid')}
                className={`p-1.5 rounded-md transition-colors ${current === 'grid'
                    ? 'bg-white/10 text-white'
                    : 'text-white/30 hover:text-white/60'
                    }`}
                aria-label="Grid view"
            >
                <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
                onClick={() => toggle('list')}
                className={`p-1.5 rounded-md transition-colors ${current === 'list'
                    ? 'bg-white/10 text-white'
                    : 'text-white/30 hover:text-white/60'
                    }`}
                aria-label="List view"
            >
                <List className="w-3.5 h-3.5" />
            </button>
        </div>
    )
}