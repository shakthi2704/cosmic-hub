'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, ChevronDown, Menu, X } from 'lucide-react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { navLinks } from '@/config/nav'
import { cn } from '@/lib/utils'
import SearchDialog from '@/components/search/SearchDialog'

export default function Navbar() {
    const pathname = usePathname()
    const [searchOpen, setSearchOpen] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [openGroup, setOpenGroup] = useState<string | null>(null)
    const groupRef = useRef<HTMLDivElement>(null)

    const openSearch = useCallback(() => setSearchOpen(true), [])
    const closeSearch = useCallback(() => setSearchOpen(false), [])

    // ⌘K / Ctrl+K shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setSearchOpen(prev => !prev)
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])

    // Close dropdown on outside click
    useEffect(() => {
        if (!openGroup) return
        const handler = (e: MouseEvent) => {
            if (groupRef.current && !groupRef.current.contains(e.target as Node)) {
                setOpenGroup(null)
            }
        }
        window.addEventListener('mousedown', handler)
        return () => window.removeEventListener('mousedown', handler)
    }, [openGroup])

    // Close mobile drawer on route change
    useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    return (
        <>
            <header className="fixed top-0 inset-x-0 z-50 h-14 border-b border-white/[0.06] bg-black/80 backdrop-blur-xl">
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

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center h-full">
                        {navLinks.map((entry) => {
                            if (entry.type === 'link') {
                                const active = pathname === entry.href
                                return (
                                    <Link
                                        key={entry.href}
                                        href={entry.href}
                                        className={cn(
                                            'relative flex items-center h-full px-4 text-[13px] font-medium transition-colors',
                                            active ? 'text-white' : 'text-gray-500 hover:text-gray-200'
                                        )}
                                    >
                                        {entry.label}
                                        {active && (
                                            <span className="absolute bottom-0 inset-x-4 h-[2px] bg-blue-500 rounded-t-full" />
                                        )}
                                    </Link>
                                )
                            }

                            // Group (dropdown)
                            const active = entry.items.some(i => i.href === pathname)
                            const isOpen = openGroup === entry.label
                            return (
                                <div key={entry.label} ref={isOpen ? groupRef : undefined} className="relative h-full">
                                    <button
                                        onClick={() => setOpenGroup(isOpen ? null : entry.label)}
                                        className={cn(
                                            'relative flex items-center gap-1 h-full px-4 text-[13px] font-medium transition-colors',
                                            active || isOpen ? 'text-white' : 'text-gray-500 hover:text-gray-200'
                                        )}
                                    >
                                        {entry.label}
                                        <ChevronDown className={cn('w-3 h-3 transition-transform', isOpen && 'rotate-180')} />
                                        {active && (
                                            <span className="absolute bottom-0 inset-x-4 h-[2px] bg-blue-500 rounded-t-full" />
                                        )}
                                    </button>
                                    {isOpen && (
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-44 rounded-xl border border-white/[0.08] bg-black/95 backdrop-blur-xl shadow-2xl py-1.5 overflow-hidden">
                                            {entry.items.map((item) => {
                                                const itemActive = pathname === item.href
                                                return (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        onClick={() => setOpenGroup(null)}
                                                        className={cn(
                                                            'flex items-center px-3.5 py-2 text-[13px] transition-colors',
                                                            itemActive ? 'text-white bg-white/[0.06]' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                                                        )}
                                                    >
                                                        {item.label}
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </nav>

                    {/* Right */}
                    <div className="flex items-center gap-2.5 shrink-0">
                        <button
                            onClick={openSearch}
                            className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg border border-white/[0.08] bg-white/[0.04] text-gray-500 hover:text-gray-300 hover:border-white/15 hover:bg-white/[0.07] transition-all text-xs"
                        >
                            <Search className="w-3.5 h-3.5" />
                            <span>Search the cosmos...</span>
                            <kbd className="ml-1 text-[10px] bg-white/[0.08] px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
                        </button>
                        <button
                            onClick={openSearch}
                            className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-gray-400 hover:text-white transition-colors"
                        >
                            <Search className="w-4 h-4" />
                        </button>
                        <button className="hidden md:flex w-8 h-8 rounded-full border border-white/[0.08] bg-white/[0.04] items-center justify-center hover:bg-white/[0.1] transition-colors overflow-hidden">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-gray-400">
                                <circle cx="12" cy="8" r="4" />
                                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                            </svg>
                        </button>
                        {/* Mobile menu toggle */}
                        <button
                            onClick={() => setMobileOpen(prev => !prev)}
                            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-gray-400 hover:text-white transition-colors"
                        >
                            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                        </button>
                    </div>

                </div>
            </header>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="md:hidden fixed top-14 inset-x-0 z-40 border-b border-white/[0.06] bg-black/95 backdrop-blur-xl max-h-[calc(100vh-3.5rem)] overflow-y-auto">
                    <nav className="px-6 py-4 flex flex-col gap-1">
                        {navLinks.map((entry) => {
                            if (entry.type === 'link') {
                                const active = pathname === entry.href
                                return (
                                    <Link
                                        key={entry.href}
                                        href={entry.href}
                                        className={cn(
                                            'px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors',
                                            active ? 'text-white bg-white/[0.06]' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                                        )}
                                    >
                                        {entry.label}
                                    </Link>
                                )
                            }
                            return (
                                <div key={entry.label} className="pt-2">
                                    <p className="px-3 pb-1 text-[11px] font-mono uppercase tracking-widest text-white/30">
                                        {entry.label}
                                    </p>
                                    {entry.items.map((item) => {
                                        const active = pathname === item.href
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    'block px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors',
                                                    active ? 'text-white bg-white/[0.06]' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                                                )}
                                            >
                                                {item.label}
                                            </Link>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </nav>
                </div>
            )}

            <SearchDialog open={searchOpen} onClose={closeSearch} />
        </>
    )
}