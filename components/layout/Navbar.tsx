'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, ChevronDown, Menu, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { navLinks } from '@/config/nav'
import { cn } from '@/lib/utils'
import SearchDialog from '@/components/search/SearchDialog'

/** Height of the bar (h-14). Pages use pt-14 to clear it. */
const NAV_HEIGHT = 56

const focusRing =
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'

function isActive(pathname: string, href: string) {
    return pathname === href || pathname.startsWith(href + '/')
}

export default function Navbar() {
    const pathname = usePathname()
    const [searchOpen, setSearchOpen] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [openGroup, setOpenGroup] = useState<string | null>(null)
    const [overHero, setOverHero] = useState(false)
    const [isMac, setIsMac] = useState(true)
    const navRef = useRef<HTMLElement>(null)

    const openSearch = useCallback(() => setSearchOpen(true), [])
    const closeSearch = useCallback(() => setSearchOpen(false), [])

    // Show the right shortcut hint for the visitor's system.
    useEffect(() => {
        setIsMac(/Mac|iPhone|iPad/.test(navigator.userAgent))
    }, [])

    // ⌘K / Ctrl+K opens search.
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setSearchOpen((prev) => !prev)
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])

    // Transparent while a page's cinematic hero (marked data-nav-transparent) covers the top
    // of the screen; solid black everywhere else.
    useEffect(() => {
        const update = () => {
            const hero = document.querySelector('[data-nav-transparent]')
            if (!hero) {
                setOverHero(false)
                return
            }
            const r = hero.getBoundingClientRect()
            setOverHero(r.top <= NAV_HEIGHT && r.bottom > NAV_HEIGHT)
        }
        update()
        window.addEventListener('scroll', update, { passive: true })
        window.addEventListener('resize', update)
        return () => {
            window.removeEventListener('scroll', update)
            window.removeEventListener('resize', update)
        }
    }, [pathname])

    // Close menus when the page changes.
    useEffect(() => {
        setMobileOpen(false)
        setOpenGroup(null)
    }, [pathname])

    // Close the open dropdown on outside click or Escape; close the mobile menu on Escape.
    useEffect(() => {
        if (!openGroup && !mobileOpen) return
        const onMouseDown = (e: MouseEvent) => {
            if (openGroup && navRef.current && !navRef.current.contains(e.target as Node)) {
                setOpenGroup(null)
            }
        }
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpenGroup(null)
                setMobileOpen(false)
            }
        }
        window.addEventListener('mousedown', onMouseDown)
        window.addEventListener('keydown', onKeyDown)
        return () => {
            window.removeEventListener('mousedown', onMouseDown)
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [openGroup, mobileOpen])

    // Stop the page scrolling behind the open mobile menu.
    useEffect(() => {
        if (!mobileOpen) return
        const previous = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = previous
        }
    }, [mobileOpen])

    const solid = !overHero || mobileOpen
    const linkTone = overHero && !mobileOpen ? 'text-white/85 hover:text-white' : 'text-white/60 hover:text-white'

    return (
        <>
            <header
                className={cn(
                    'fixed top-0 inset-x-0 z-50 h-14 border-b transition-colors duration-200 motion-reduce:transition-none',
                    solid
                        ? 'bg-black border-white/[0.08]'
                        : 'bg-gradient-to-b from-black/55 to-transparent border-transparent'
                )}
            >
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-8">
                    {/* Logo */}
                    <Link href="/" className={cn('flex items-center gap-2.5 shrink-0 rounded-sm', focusRing)}>
                        <svg viewBox="0 0 28 28" fill="none" className="w-7 h-7 shrink-0" aria-hidden="true">
                            <circle cx="14" cy="14" r="13" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
                            <circle cx="14" cy="14" r="9" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                            <circle cx="14" cy="14" r="2.5" fill="rgba(255,255,255,0.9)" />
                            <circle cx="14" cy="5" r="1" fill="rgba(255,255,255,0.6)" />
                            <circle cx="23" cy="14" r="1" fill="rgba(255,255,255,0.5)" />
                        </svg>
                        <span className="text-white font-semibold text-[15px] tracking-tight">CosmicHub</span>
                    </Link>

                    {/* Desktop navigation */}
                    <nav ref={navRef} aria-label="Main" className="hidden md:flex items-center h-full">
                        {navLinks.map((entry) => {
                            if (entry.type === 'link') {
                                const active = isActive(pathname, entry.href)
                                return (
                                    <Link
                                        key={entry.href}
                                        href={entry.href}
                                        aria-current={active ? 'page' : undefined}
                                        className={cn(
                                            'relative flex items-center h-full px-4 text-[13px] font-medium transition-colors',
                                            active ? 'text-white' : linkTone,
                                            focusRing
                                        )}
                                    >
                                        {entry.label}
                                        {active && <span className="absolute bottom-0 inset-x-4 h-[2px] bg-white" />}
                                    </Link>
                                )
                            }

                            const active = entry.items.some((i) => isActive(pathname, i.href))
                            const isOpen = openGroup === entry.label
                            const menuId = `nav-menu-${entry.label.toLowerCase()}`
                            return (
                                <div key={entry.label} className="relative h-full">
                                    <button
                                        type="button"
                                        onClick={() => setOpenGroup(isOpen ? null : entry.label)}
                                        aria-expanded={isOpen}
                                        aria-controls={menuId}
                                        className={cn(
                                            'relative flex items-center gap-1 h-full px-4 text-[13px] font-medium transition-colors',
                                            active || isOpen ? 'text-white' : linkTone,
                                            focusRing
                                        )}
                                    >
                                        {entry.label}
                                        <ChevronDown
                                            className={cn('w-3 h-3 transition-transform', isOpen && 'rotate-180')}
                                            aria-hidden="true"
                                        />
                                        {active && <span className="absolute bottom-0 inset-x-4 h-[2px] bg-white" />}
                                    </button>
                                    {isOpen && (
                                        <ul
                                            id={menuId}
                                            className="absolute top-full left-0 mt-1 min-w-[200px] rounded-lg border border-white/10 bg-black py-1.5 shadow-2xl"
                                        >
                                            {entry.items.map((item) => {
                                                const itemActive = isActive(pathname, item.href)
                                                return (
                                                    <li key={item.href}>
                                                        <Link
                                                            href={item.href}
                                                            onClick={() => setOpenGroup(null)}
                                                            aria-current={itemActive ? 'page' : undefined}
                                                            className={cn(
                                                                'flex items-center px-4 py-2 text-[13px] transition-colors focus-visible:outline-offset-[-2px]',
                                                                itemActive
                                                                    ? 'text-white bg-white/[0.08]'
                                                                    : 'text-white/70 hover:text-white hover:bg-white/[0.06]',
                                                                focusRing
                                                            )}
                                                        >
                                                            {item.label}
                                                        </Link>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    )}
                                </div>
                            )
                        })}
                    </nav>

                    {/* Right: search and mobile menu button */}
                    <div className="flex items-center gap-2.5 shrink-0">
                        <button
                            type="button"
                            onClick={openSearch}
                            aria-label="Search"
                            className={cn(
                                'hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg border border-white/15 bg-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.1] transition-colors text-xs',
                                focusRing
                            )}
                        >
                            <Search className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Search the cosmos…</span>
                            <kbd className="ml-1 text-[10px] bg-white/[0.1] px-1.5 py-0.5 rounded font-mono">
                                {isMac ? '⌘K' : 'Ctrl K'}
                            </kbd>
                        </button>
                        <button
                            type="button"
                            onClick={openSearch}
                            aria-label="Search"
                            className={cn(
                                'sm:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] text-white/80 hover:text-white transition-colors',
                                focusRing
                            )}
                        >
                            <Search className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobileOpen((prev) => !prev)}
                            aria-expanded={mobileOpen}
                            aria-controls="mobile-menu"
                            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                            className={cn(
                                'md:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] text-white/80 hover:text-white transition-colors',
                                focusRing
                            )}
                        >
                            {mobileOpen ? (
                                <X className="w-4 h-4" aria-hidden="true" />
                            ) : (
                                <Menu className="w-4 h-4" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile menu: full-screen, below the bar */}
            {mobileOpen && (
                <div id="mobile-menu" className="md:hidden fixed inset-x-0 top-14 bottom-0 z-40 overflow-y-auto bg-black">
                    <nav aria-label="Mobile" className="px-6 py-8 flex flex-col gap-8">
                        {navLinks.map((entry) => {
                            if (entry.type === 'link') {
                                const active = isActive(pathname, entry.href)
                                return (
                                    <Link
                                        key={entry.href}
                                        href={entry.href}
                                        onClick={() => setMobileOpen(false)}
                                        aria-current={active ? 'page' : undefined}
                                        className={cn(
                                            'text-2xl font-semibold tracking-tight rounded-sm',
                                            active ? 'text-white' : 'text-white/80',
                                            focusRing
                                        )}
                                    >
                                        {entry.label}
                                    </Link>
                                )
                            }
                            return (
                                <div key={entry.label}>
                                    <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
                                        {entry.label}
                                    </p>
                                    <ul className="flex flex-col gap-1">
                                        {entry.items.map((item) => {
                                            const active = isActive(pathname, item.href)
                                            return (
                                                <li key={item.href}>
                                                    <Link
                                                        href={item.href}
                                                        onClick={() => setMobileOpen(false)}
                                                        aria-current={active ? 'page' : undefined}
                                                        className={cn(
                                                            'block py-2 text-xl font-medium rounded-sm',
                                                            active ? 'text-white' : 'text-white/75',
                                                            focusRing
                                                        )}
                                                    >
                                                        {item.label}
                                                    </Link>
                                                </li>
                                            )
                                        })}
                                    </ul>
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