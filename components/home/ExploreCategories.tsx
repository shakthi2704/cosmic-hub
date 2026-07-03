import Link from 'next/link'
import Image from 'next/image'
import { categories } from '@/config/nav'

export default function ExploreCategories() {
    return (
        <section className="space-bg py-24 px-6">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <p className="text-[11px] font-mono text-blue-400 tracking-[0.2em] uppercase mb-2">
                            The Archive
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                            Explore by category
                        </h2>
                        <p className="text-gray-500 text-sm mt-2">
                            Cataloging the known universe — 8,500+ objects and counting
                        </p>
                    </div>
                    <Link
                        href="/celestial"
                        className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors"
                    >
                        View all
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((cat) => (
                        <Link key={cat.slug} href={cat.href}>
                            <div className="group relative rounded-2xl overflow-hidden border border-white/[0.08] hover:border-white/[0.20] transition-all duration-300 cursor-pointer h-52">

                                {/* Background image */}
                                <Image
                                    src={cat.image}
                                    alt={cat.label}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 768px) 50vw, 33vw"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-[#04040a]/35 group-hover:bg-[#04040a]/20 transition-colors duration-300" />

                                {/* Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#04040a]/95 via-[#04040a]/30 to-transparent" />

                                {/* Accent glow */}
                                <div
                                    className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-25 transition-opacity duration-500"
                                    style={{ backgroundColor: cat.accent }}
                                />

                                {/* Content */}
                                <div className="absolute inset-0 z-10 p-5 flex flex-col justify-between">
                                    <div
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: cat.accent }}
                                    />
                                    <div>
                                        <h3 className="text-white font-semibold text-lg leading-tight drop-shadow-lg">
                                            {cat.label}
                                        </h3>
                                        <p className="text-gray-300 text-xs mt-1 group-hover:text-white transition-colors drop-shadow-md">
                                            {cat.description}
                                        </p>
                                        <p
                                            className="text-[10px] font-mono mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0"
                                            style={{ color: cat.accent }}
                                        >
                                            {cat.count}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}