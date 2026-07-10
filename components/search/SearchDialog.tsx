'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface SearchResult {
    id: string
    slug: string
    name: string
    type: 'celestial' | 'mission' | 'person'
    subtype?: string
    summary?: string | null
    imageUrl?: string | null
}

const TYPE_META = {
    celestial: { label: 'Object', color: '#4a90d9', href: (slug: string) => `/celestial/${slug}` },
    mission: { label: 'Mission', color: '#22c55e', href: (slug: string) => `/missions/${slug}` },
    person: { label: 'Person', color: '#f5a623', href: (slug: string) => `/people/${slug}` },
}

const HINTS = ['Milky Way', 'Apollo 11', 'Neil Armstrong', 'Black Hole', 'Voyager']

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(t)
    }, [value, delay])
    return debounced
}

interface Props {
    open: boolean
    onClose: () => void
}

export default function SearchDialog({ open, onClose }: Props) {
    const router = useRouter()
    const inputRef = useRef<HTMLInputElement>(null)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const debouncedQuery = useDebounce(query, 300)

    // Reset on open
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 80)
            setQuery('')
            setResults([])
            setActiveIndex(0)
        }
    }, [open])

    // Fetch results
    useEffect(() => {
        if (!debouncedQuery || debouncedQuery.trim().length < 2) {
            setResults([])
            return
        }
        setLoading(true)
        fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
            .then(r => r.json())
            .then((data: SearchResult[]) => {
                setResults(data)
                setActiveIndex(0)
            })
            .catch(() => setResults([]))
            .finally(() => setLoading(false))
    }, [debouncedQuery])

    const navigate = useCallback((result: SearchResult) => {
        router.push(TYPE_META[result.type].href(result.slug))
        onClose()
    }, [router, onClose])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex(i => Math.min(i + 1, results.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex(i => Math.max(i - 1, 0))
        } else if (e.key === 'Enter' && results[activeIndex]) {
            navigate(results[activeIndex])
        }
    }, [results, activeIndex, navigate])

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="p-0 gap-0 max-w-2xl bg-[#0a0a0f] border border-white/[0.10] shadow-2xl overflow-hidden">

                {/* Input row */}
                <div className="flex items-center gap-3 px-4 py-3.5">
                    {loading
                        ? <Loader2 className="w-4 h-4 text-white/30 shrink-0 animate-spin" />
                        : <Search className="w-4 h-4 text-white/30 shrink-0" />
                    }
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search celestial objects, missions, people..."
                        className="flex-1 bg-transparent text-white text-sm placeholder:text-white/25 outline-none"
                    />
                    {query && (
                        <button
                            onClick={() => { setQuery(''); setResults([]) }}
                            className="text-white/30 hover:text-white/60 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <kbd className="hidden sm:flex items-center text-[10px] text-white/20 font-mono bg-white/[0.05] border border-white/[0.08] px-1.5 py-0.5 rounded">
                        ESC
                    </kbd>
                </div>

                <Separator className="bg-white/[0.07]" />

                {/* Results */}
                {results.length > 0 && (
                    <ul className="py-2 max-h-[55vh] overflow-y-auto">
                        {results.map((result, i) => {
                            const meta = TYPE_META[result.type]
                            const active = i === activeIndex
                            return (
                                <li key={result.id}>
                                    <button
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'}`}
                                        onClick={() => navigate(result)}
                                        onMouseEnter={() => setActiveIndex(i)}
                                    >
                                        {/* Type indicator */}
                                        <div
                                            className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-mono font-bold border"
                                            style={{
                                                color: meta.color,
                                                borderColor: `${meta.color}30`,
                                                backgroundColor: `${meta.color}12`,
                                            }}
                                        >
                                            {meta.label[0]}
                                        </div>

                                        {/* Name + subtype */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white/90 text-sm font-medium truncate">
                                                {result.name}
                                            </p>
                                            <p className="text-white/30 text-xs font-mono truncate mt-0.5">
                                                {result.subtype?.replace(/_/g, ' ')}
                                            </p>
                                        </div>

                                        {/* Badge */}
                                        <Badge
                                            variant="outline"
                                            className="shrink-0 text-[10px] font-mono border-0 px-2"
                                            style={{
                                                color: meta.color,
                                                backgroundColor: `${meta.color}12`,
                                            }}
                                        >
                                            {meta.label}
                                        </Badge>

                                        {active && (
                                            <span className="text-white/20 text-sm shrink-0 ml-1">↵</span>
                                        )}
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                )}

                {/* No results */}
                {query.length >= 2 && !loading && results.length === 0 && (
                    <div className="px-4 py-10 text-center">
                        <p className="text-white/20 text-sm">
                            No results for &ldquo;{query}&rdquo;
                        </p>
                        <p className="text-white/10 text-xs font-mono mt-1">
                            Try a different search term
                        </p>
                    </div>
                )}

                {/* Hints */}
                {!query && (
                    <div className="px-4 py-5">
                        <p className="text-[11px] font-mono text-white/20 mb-3 uppercase tracking-widest">
                            Suggestions
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {HINTS.map(hint => (
                                <button
                                    key={hint}
                                    onClick={() => setQuery(hint)}
                                    className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/40 hover:text-white/70 hover:border-white/[0.12] transition-all font-mono"
                                >
                                    {hint}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <Separator className="bg-white/[0.05]" />

                {/* Footer hints */}
                <div className="px-4 py-2.5 flex items-center gap-4">
                    {[
                        { key: '↑↓', label: 'navigate' },
                        { key: '↵', label: 'open' },
                        { key: 'ESC', label: 'close' },
                    ].map(({ key, label }) => (
                        <span key={label} className="flex items-center gap-1.5 text-[10px] text-white/20 font-mono">
                            <kbd className="bg-white/[0.05] border border-white/[0.08] px-1.5 py-0.5 rounded text-[9px]">
                                {key}
                            </kbd>
                            {label}
                        </span>
                    ))}
                </div>

            </DialogContent>
        </Dialog>
    )
}