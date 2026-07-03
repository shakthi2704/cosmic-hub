'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

type APOD = {
    title: string
    date: string
    explanation: string
    url: string
    media_type: 'image' | 'video'
}

type Article = {
    id: number
    title: string
    summary: string
    url: string
    image_url: string
    news_site: string
    published_at: string
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const d = Math.floor(diff / 86400000)
    const h = Math.floor(diff / 3600000)
    if (d > 0) return `${d}d ago`
    if (h > 0) return `${h}h ago`
    return 'Just now'
}

export default function NewsSection() {
    const [apod, setApod] = useState<APOD | null>(null)
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const nasaKey = process.env.NEXT_PUBLIC_NASA_API_KEY

        Promise.all([
            fetch(`https://api.nasa.gov/planetary/apod?api_key=${nasaKey}`)
                .then(r => r.json()),
            fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=3&format=json')
                .then(r => r.json())
                .then(d => d.results),
        ])
            .then(([apodData, newsData]) => {
                setApod(apodData)
                setArticles(Array.isArray(newsData) ? newsData : [])
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    return (
        <section className="space-bg py-24 px-6 border-t border-white/[0.05]">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <p className="text-[11px] font-mono text-blue-400 tracking-[0.2em] uppercase mb-2">
                            Latest
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                            Space news & discoveries
                        </h2>
                        <p className="text-gray-500 text-sm mt-2">
                            Real-time updates from NASA and leading space agencies
                        </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-dot" />
                        Updated live
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                        <div className="lg:col-span-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] h-[520px] animate-pulse" />
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="rounded-xl bg-white/[0.03] border border-white/[0.06] h-[152px] animate-pulse" />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                        {/* Left — NASA APOD */}
                        {apod && (
                            <a
                                href="https://apod.nasa.gov"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="lg:col-span-3 group relative rounded-2xl overflow-hidden border border-white/[0.08] hover:border-white/[0.18] transition-all duration-300 cursor-pointer block min-h-[520px]"
                            >
                                {apod.media_type === 'image' ? (
                                    <div className="absolute inset-0">
                                        <Image
                                            src={apod.url}
                                            alt={apod.title}
                                            fill
                                            priority
                                            loading="eager"
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            sizes="(max-width: 1024px) 100vw, 60vw"
                                            unoptimized
                                        />
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 bg-[#0a0a0f]" />
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />

                                <div className="absolute top-4 left-4 z-10">
                                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-300">
                                        NASA · APOD
                                    </span>
                                </div>
                                <div className="absolute top-4 right-4 z-10">
                                    <span className="text-[10px] font-mono text-gray-500">{apod.date}</span>
                                </div>

                                <div className="absolute bottom-0 inset-x-0 z-10 p-6">
                                    <h3 className="text-white font-bold text-2xl leading-tight mb-3">
                                        {apod.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                                        {apod.explanation}
                                    </p>
                                    <div className="mt-4 flex items-center gap-2 text-blue-400 text-xs font-medium group-hover:gap-3 transition-all">
                                        View on NASA APOD
                                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                                            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </a>
                        )}

                        {/* Right — Spaceflight news */}
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            {articles.map((article) => (
                                <a
                                    key={article.id}
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group space-card rounded-xl overflow-hidden flex cursor-pointer"
                                >
                                    <div className="relative w-32 shrink-0 overflow-hidden">
                                        {article.image_url ? (
                                            <Image
                                                src={article.image_url}
                                                alt={article.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                sizes="128px"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-white/[0.03]" />
                                        )}
                                    </div>

                                    <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] font-mono text-gray-600 truncate">
                                                    {article.news_site}
                                                </span>
                                                <span className="text-gray-700 text-[10px]">·</span>
                                                <span className="text-[10px] font-mono text-gray-600 shrink-0">
                                                    {timeAgo(article.published_at)}
                                                </span>
                                            </div>
                                            <h4 className="text-white text-sm font-medium leading-snug line-clamp-2 group-hover:text-blue-200 transition-colors">
                                                {article.title}
                                            </h4>
                                        </div>
                                        <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 mt-2">
                                            {article.summary}
                                        </p>
                                    </div>
                                </a>
                            ))}

                            <a
                                href="https://www.spaceflightnewsapi.net"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 text-center py-3 rounded-xl border border-white/[0.06] text-xs text-gray-600 hover:text-gray-300 hover:border-white/[0.12] transition-all"
                            >
                                View all space news →
                            </a>
                        </div>

                    </div>
                )}

            </div>
        </section>
    )
}