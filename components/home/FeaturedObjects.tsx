import Link from 'next/link'
import Image from 'next/image'

const featured = [
    {
        slug: 'andromeda',
        name: 'Andromeda Galaxy',
        type: 'Galaxy',
        distance: '2.537M light years',
        mass: '1.5 trillion suns',
        fact: 'On a collision course with the Milky Way — expected impact in 4.5 billion years.',
        image: 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?w=900&q=85',
        accent: '#9b59b6',
    },
    {
        slug: 'sagittarius-a-star',
        name: 'Sagittarius A*',
        type: 'Black Hole',
        distance: '26,000 light years',
        mass: '4.1M solar masses',
        fact: 'The supermassive black hole sitting at the center of our Milky Way galaxy.',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&q=85',
        accent: '#a855f7',
    },
    {
        slug: 'orion-nebula',
        name: 'Orion Nebula',
        type: 'Nebula',
        distance: '1,344 light years',
        mass: '2,000 solar masses',
        fact: 'One of the most photographed objects — a stellar nursery visible to the naked eye.',
        image: 'https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=900&q=85',
        accent: '#e74c9f',
    },
]

export default function FeaturedObjects() {
    return (
        <section className="space-bg py-24 px-6 border-t border-white/[0.05]">
            <div className="max-w-7xl mx-auto">

                <div className="flex items-end justify-between mb-10">
                    <div>
                        <p className="text-[11px] font-mono text-blue-400 tracking-[0.2em] uppercase mb-2">
                            Deep Space
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                            Featured objects
                        </h2>
                        <p className="text-gray-500 text-sm mt-2">
                            Handpicked highlights from across the observable universe
                        </p>
                    </div>
                    <Link
                        href="/celestial"
                        className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors"
                    >
                        Browse all
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {featured.map((obj) => (
                        <Link key={obj.slug} href={`/celestial/${obj.slug}`}>
                            <div className="group space-card rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full">

                                {/* Image */}
                                <div className="relative h-52 overflow-hidden shrink-0">
                                    <Image
                                        src={obj.image}
                                        alt={obj.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-[#0a0a12]/20 to-transparent" />

                                    {/* Type badge */}
                                    <div className="absolute top-4 left-4">
                                        <span
                                            className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-md border"
                                            style={{
                                                color: obj.accent,
                                                borderColor: `${obj.accent}50`,
                                                backgroundColor: `${obj.accent}18`,
                                                backdropFilter: 'blur(8px)',
                                            }}
                                        >
                                            {obj.type.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="text-white font-semibold text-xl leading-tight mb-2">
                                        {obj.name}
                                    </h3>
                                    <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-5">
                                        {obj.fact}
                                    </p>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.06]">
                                        <div>
                                            <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5">
                                                Distance
                                            </p>
                                            <p className="text-sm text-white font-medium tabular-nums">
                                                {obj.distance}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5">
                                                Mass
                                            </p>
                                            <p className="text-sm text-white font-medium tabular-nums">
                                                {obj.mass}
                                            </p>
                                        </div>
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