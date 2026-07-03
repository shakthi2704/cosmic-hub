'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search } from 'lucide-react'
import { navLinks } from '@/config/nav'
import { cn } from '@/lib/utils'

export default function Navbar() {
    const pathname = usePathname()

    return (
        <header className="fixed top-0 inset-x-0 z-50 h-14 border-b border-white/[0.06] bg-[#04040a]/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-8">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
                    <div className="relative w-7 h-7 shrink-0">
                        <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
                            <circle cx="14" cy="14" r="13" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                            <circle cx="14" cy="14" r="9" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            <circle cx="14" cy="14" r="2.5" fill="rgba(255,255,255,0.7)" className="group-hover:fill-blue-400 transition-colors" />
                            <circle cx="14" cy="5" r="1" fill="rgba(255,255,255,0.4)" />
                            <circle cx="23" cy="14" r="1" fill="rgba(255,255,255,0.3)" />
                        </svg>
                    </div>
                    <span className="text-white font-semibold text-[15px] tracking-tight">
                        CosmicHub
                    </span>
                </Link>

                {/* Nav */}
                <nav className="hidden md:flex items-center h-full">
                    {navLinks.map((link) => {
                        const active = pathname === link.href
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'relative flex items-center h-full px-4 text-[13px] font-medium transition-colors',
                                    active ? 'text-white' : 'text-gray-500 hover:text-gray-200'
                                )}
                            >
                                {link.label}
                                {active && (
                                    <span className="absolute bottom-0 inset-x-4 h-[2px] bg-blue-500 rounded-t-full" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Right */}
                <div className="flex items-center gap-2.5 shrink-0">
                    <button className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg border border-white/[0.08] bg-white/[0.04] text-gray-500 hover:text-gray-300 hover:border-white/15 hover:bg-white/[0.07] transition-all text-xs">
                        <Search className="w-3.5 h-3.5" />
                        <span>Search the cosmos...</span>
                        <kbd className="ml-1 text-[10px] bg-white/[0.08] px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
                    </button>
                    <button className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-gray-400 hover:text-white transition-colors">
                        <Search className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-full border border-white/[0.08] bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.1] transition-colors overflow-hidden">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-gray-400">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                    </button>
                </div>

            </div>
        </header>
    )
}