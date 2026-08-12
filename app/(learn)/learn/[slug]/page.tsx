import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { getArticleBySlug, getArticleTags } from '@/lib/services/article.service'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Tag as TagIcon } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const article = await getArticleBySlug(slug)
    if (!article) return {}
    return {
        title: `${article.title} | CosmicHub`,
        description: article.excerpt ?? undefined,
    }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const article = await getArticleBySlug(slug)

    if (!article) notFound()

    const tags = await getArticleTags(article.id)

    return (
        <div className="min-h-screen bg-black">
            <Navbar />

            {/* Hero */}
            <div className="relative pt-20 border-b border-white/[0.06]">
                {article.coverImage ? (
                    <div className="relative h-64 md:h-80 overflow-hidden">
                        <Image
                            src={article.coverImage}
                            alt={article.title}
                            fill
                            className="object-cover opacity-50"
                            sizes="100vw"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
                    </div>
                ) : null}

                <div
                    className={`max-w-3xl mx-auto px-6 ${article.coverImage ? 'absolute inset-x-0 bottom-0 pb-8' : 'py-10'
                        }`}
                >
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-white/40">
                        {article.kind === 'FEATURE' ? 'Feature Article' : 'Glossary'}
                    </span>
                    <h1 className="text-2xl md:text-3xl font-semibold text-white mt-2">
                        {article.title}
                    </h1>
                    {article.excerpt && (
                        <p className="text-white/50 text-sm mt-2 max-w-xl">{article.excerpt}</p>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="max-w-3xl mx-auto px-6 py-10">
                <div className="prose prose-invert prose-sm md:prose-base max-w-none prose-headings:font-semibold prose-headings:text-white prose-p:text-white/70 prose-p:leading-relaxed prose-strong:text-white/90">
                    <ReactMarkdown>{article.body}</ReactMarkdown>
                </div>

                {tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-white/[0.06]">
                        <TagIcon className="w-3.5 h-3.5 text-white/25" />
                        {tags.map((tag) => (
                            <span
                                key={tag.id}
                                className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-white/[0.08] text-white/40"
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-8">
                    <Link
                        href="/learn"
                        className="text-sm text-white/40 hover:text-white/70 transition-colors"
                    >
                        ← Back to Learn
                    </Link>
                </div>
            </div>

            <Footer />
        </div>
    )
}