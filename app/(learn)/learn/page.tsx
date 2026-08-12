import Link from 'next/link'
import Image from 'next/image'
import { getArticles } from '@/lib/services/article.service'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { BookOpen } from 'lucide-react'

export const metadata = {
    title: 'Learn | CosmicHub',
    description: 'A glossary and collection of articles explaining the universe, one concept at a time.',
}

function Starfield() {
    return (
        <div className="absolute inset-0 bg-black overflow-hidden">
            {Array.from({ length: 20 }, (_, i) => (
                <span
                    key={i}
                    className="absolute rounded-full bg-white animate-twinkle"
                    style={{
                        top: `${(i * 41.3) % 100}%`,
                        left: `${(i * 67.9) % 100}%`,
                        width: '1px',
                        height: '1px',
                        opacity: 0.15 + (i % 6) * 0.05,
                    }}
                />
            ))}
        </div>
    )
}

// ─── Feature Card ──────────────────────────────────────────

function FeatureCard({ article }: { article: Awaited<ReturnType<typeof getArticles>>[number] }) {
    return (
        <Link href={`/learn/${article.slug}`} className="group block space-card rounded-2xl overflow-hidden">
            <div className="relative h-48 overflow-hidden bg-white/[0.03]">
                {article.coverImage ? (
                    <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-75 group-hover:opacity-90"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <Starfield />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/20 text-white/70 bg-black/40 backdrop-blur-sm">
                        Feature
                    </span>
                </div>
            </div>
            <div className="p-5">
                <h3 className="text-white font-medium mb-1.5 group-hover:text-white/90">
                    {article.title}
                </h3>
                {article.excerpt && (
                    <p className="text-white/40 text-sm line-clamp-2">{article.excerpt}</p>
                )}
            </div>
        </Link>
    )
}

// ─── Glossary Entry ────────────────────────────────────────

function GlossaryCard({ article }: { article: Awaited<ReturnType<typeof getArticles>>[number] }) {
    return (
        <Link
            href={`/learn/${article.slug}`}
            className="group flex items-start gap-3 p-4 rounded-xl border border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.02] transition-colors"
        >
            <BookOpen className="w-4 h-4 text-white/25 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
                <h3 className="text-white/85 text-sm font-medium group-hover:text-white">
                    {article.title}
                </h3>
                {article.excerpt && (
                    <p className="text-white/35 text-xs mt-1 line-clamp-2">{article.excerpt}</p>
                )}
            </div>
        </Link>
    )
}

// ─── Page ───────────────────────────────────────────────────

export default async function LearnPage() {
    const articles = await getArticles()
    const features = articles.filter((a) => a.kind === 'FEATURE')
    const glossary = articles.filter((a) => a.kind === 'GLOSSARY')

    return (
        <div className="min-h-screen bg-black">
            <Navbar />

            <div className="border-b border-white/[0.06] pt-20">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">
                        Learn
                    </p>
                    <h1 className="text-2xl font-semibold text-white mb-1">
                        Understanding the Universe
                    </h1>
                    <p className="text-white/40 text-sm">
                        A glossary and collection of articles explaining space, one concept at a time.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-14">
                {features.length > 0 && (
                    <div>
                        <h2 className="text-sm font-mono text-white/40 uppercase tracking-widest mb-4">
                            Featured Articles
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {features.map((a) => (
                                <FeatureCard key={a.id} article={a} />
                            ))}
                        </div>
                    </div>
                )}

                {glossary.length > 0 && (
                    <div>
                        <h2 className="text-sm font-mono text-white/40 uppercase tracking-widest mb-4">
                            Glossary ({glossary.length})
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {glossary.map((a) => (
                                <GlossaryCard key={a.id} article={a} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}