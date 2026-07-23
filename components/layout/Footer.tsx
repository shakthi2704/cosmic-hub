import Link from 'next/link'

const links: Record<string, { label: string; href?: string; soon?: boolean }[]> = {
    Explore: [
        { label: 'Celestial Objects', href: '/celestial' },
        { label: 'Missions', href: '/missions' },
        { label: 'People', href: '/people' },
        { label: 'Agencies', href: '/agencies' },
        { label: 'Live Launches', href: '/launches' },
    ],
    Resources: [
        { label: 'Satellite Tracker', soon: true },
        { label: 'Observatories', soon: true },
        { label: 'NASA API', href: 'https://api.nasa.gov' },
    ],
    Company: [
        { label: 'About', soon: true },
        { label: 'Mission', soon: true },
        { label: 'Careers', soon: true },
        { label: 'Press', soon: true },
    ],
    Legal: [
        { label: 'Privacy Policy', soon: true },
        { label: 'Terms of Service', soon: true },
    ],
}

export default function Footer() {
    return (
        <footer className="space-bg border-t border-white/[0.06]">
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-10">

                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6">
                                <circle cx="14" cy="14" r="13" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                                <circle cx="14" cy="14" r="9" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                <circle cx="14" cy="14" r="2.5" fill="rgba(255,255,255,0.7)" />
                            </svg>
                            <span className="text-white font-semibold text-sm">CosmicHub</span>
                        </Link>
                        <p className="text-gray-500 text-xs leading-relaxed mb-5">
                            The universe is vast and mysterious. We are here to help you navigate it with data-driven precision and cinematic wonder.
                        </p>
                        <div className="flex items-center gap-3">
                            {/* Twitter/X */}
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                                className="w-7 h-7 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-gray-500 hover:text-white hover:border-white/[0.15] transition-all">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            {/* GitHub */}
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                                className="w-7 h-7 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-gray-500 hover:text-white hover:border-white/[0.15] transition-all">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                                </svg>
                            </a>
                            {/* LinkedIn */}
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                                className="w-7 h-7 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-gray-500 hover:text-white hover:border-white/[0.15] transition-all">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(links).map(([group, items]) => (
                        <div key={group}>
                            <p className="text-[10px] font-mono text-gray-600 tracking-[0.15em] uppercase mb-4">
                                {group}
                            </p>
                            <ul className="space-y-2.5">
                                {items.map((item) => (
                                    <li key={item.label}>
                                        {item.soon ? (
                                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-700 cursor-default">
                                                {item.label}
                                                <span className="text-[9px] font-mono uppercase tracking-wider text-gray-800 border border-white/[0.06] rounded-full px-1.5 py-0.5">
                                                    Soon
                                                </span>
                                            </span>
                                        ) : (
                                            <Link
                                                href={item.href!}
                                                className="text-xs text-gray-500 hover:text-white transition-colors"
                                            >
                                                {item.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-16 pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[11px] text-gray-600">
                        © 2026 CosmicHub. For those who look up.
                    </p>
                    <p className="text-[11px] text-gray-700 font-mono">
                        Powered by NASA Open APIs · Data updated in real-time
                    </p>
                </div>
            </div>
        </footer>
    )
}