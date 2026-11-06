import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Design system · CosmicHub',
    robots: { index: false, follow: false },
}

const WORLDS = [
    { slug: 'solar-system', name: 'Solar System' },
    { slug: 'moons', name: 'Moons' },
    { slug: 'stars', name: 'Stars' },
    { slug: 'galaxies', name: 'Galaxies' },
    { slug: 'deep-space', name: 'Deep Space' },
    { slug: 'cosmology', name: 'Cosmology' },
    { slug: 'space-exploration', name: 'Space Exploration' },
    { slug: 'universe', name: 'The Universe' },
]

function Block({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
    return (
        <section className="mt-section-sm border-t border-line pt-12">
            <p className="kicker text-fg-subtle">{kicker}</p>
            <h2 className="mt-2 text-h2 font-bold tracking-tight">{title}</h2>
            <div className="mt-8">{children}</div>
        </section>
    )
}

function Swatch({ className, label, note }: { className: string; label: string; note: string }) {
    return (
        <div>
            <div className={`h-20 rounded-md border border-line ${className}`} />
            <p className="mt-2 text-sm font-medium">{label}</p>
            <p className="text-xs text-fg-subtle">{note}</p>
        </div>
    )
}

const ARTICLE_SAMPLE =
    'The Universe is expanding. Galaxies that are far from us are, on average, moving away, and the farther away they are, the faster they recede. This pattern, known as Hubble’s law, is one of the observational foundations of modern cosmology.'

export default function DesignPage() {
    return (
        <main className="bg-ink text-fg">
            <div className="mx-auto max-w-page px-6 py-section">
                <p className="kicker text-fg-subtle">Design system</p>
                <h1 className="mt-3 text-h1 font-bold tracking-tight">CosmicHub foundations</h1>
                <p className="mt-4 max-w-reading text-fg-muted">
                    Everything on this page is built only from the tokens in <code className="font-mono text-sm">app/design-tokens.css</code>.
                    If a colour, size or width looks wrong here, it will look wrong everywhere, so we fix it once, here.
                </p>

                {/* ── Colour ───────────────────────────── */}
                <Block kicker="01 · Colour" title="Surfaces and text">
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                        <Swatch className="bg-ink" label="ink" note="Page background" />
                        <Swatch className="bg-surface" label="surface" note="Cards and panels" />
                        <Swatch className="bg-surface-raised" label="surface-raised" note="Hover and raised layers" />
                        <Swatch className="bg-ink border-line-strong" label="line / line-strong" note="Hairlines and borders" />
                    </div>
                    <div className="mt-8 rounded-md border border-line bg-surface p-6">
                        <p className="text-fg">fg: main text. Headings and key facts.</p>
                        <p className="mt-2 text-fg-muted">fg-muted: body copy and descriptions.</p>
                        <p className="mt-2 text-fg-subtle">fg-subtle: labels, captions and sources. The dimmest text allowed.</p>
                    </div>
                </Block>

                <Block kicker="02 · Colour worlds" title="One accent per subject">
                    <p className="mb-6 max-w-reading text-fg-muted">
                        Set <code className="font-mono text-sm">data-world</code> on a page and its accents change together.
                        Accents are used for kickers, thin bars and link hovers only, never as a large fill behind white text.
                    </p>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {WORLDS.map((w) => (
                            <div key={w.slug} data-world={w.slug} className="rounded-md border border-line bg-surface p-4">
                                <div className="h-1.5 w-12 rounded-full bg-world" />
                                <p className="kicker mt-4 text-world">{w.name}</p>
                                <p className="mt-1 text-sm text-fg-muted">Accent sample text</p>
                            </div>
                        ))}
                    </div>
                </Block>

                {/* ── Type ─────────────────────────────── */}
                <Block kicker="03 · Typography" title="Fonts and scale">
                    <div className="grid gap-8 md:grid-cols-3">
                        <div>
                            <p className="kicker text-fg-subtle">Headings · Space Grotesk</p>
                            <p className="mt-2 font-heading text-3xl font-bold tracking-tight">The cosmic web</p>
                        </div>
                        <div>
                            <p className="kicker text-fg-subtle">Body · IBM Plex Sans</p>
                            <p className="mt-2 text-lg">Stars form inside dense clouds of gas and dust.</p>
                        </div>
                        <div>
                            <p className="kicker text-fg-subtle">Labels · IBM Plex Mono</p>
                            <p className="mt-2 font-mono text-lg">3,389.5 km</p>
                        </div>
                    </div>

                    <div className="mt-10 space-y-6 border-t border-line pt-8">
                        <p className="text-display font-bold tracking-tight">Display</p>
                        <p className="text-h1 font-bold tracking-tight">Heading 1</p>
                        <p className="text-h2 font-bold tracking-tight">Heading 2</p>
                        <p className="text-h3 font-semibold">Heading 3</p>
                        <p className="text-fg-muted">Body text, the default size, for everything that is read.</p>
                        <p className="kicker text-fg-subtle">Kicker label</p>
                    </div>

                    <div className="mt-10 border-t border-line pt-8">
                        <p className="kicker text-fg-subtle">Article text: choose one</p>
                        <div className="mt-6 grid gap-10 md:grid-cols-2">
                            <div>
                                <p className="kicker text-world">A · Newsreader</p>
                                <p className="mt-3 font-article text-xl leading-relaxed">{ARTICLE_SAMPLE}</p>
                            </div>
                            <div>
                                <p className="kicker text-world">B · Source Serif 4</p>
                                <p
                                    className="mt-3 text-xl leading-relaxed"
                                    style={{ fontFamily: 'var(--font-article-b), Georgia, serif' }}
                                >
                                    {ARTICLE_SAMPLE}
                                </p>
                            </div>
                        </div>
                    </div>
                </Block>

                {/* ── Components ───────────────────────── */}
                <Block kicker="04 · Pattern" title="Kicker, title, facts, source, actions">
                    <p className="mb-6 max-w-reading text-fg-muted">
                        The same pattern as the homepage tour. This is the shape every information panel on the site will use.
                    </p>
                    <div data-world="solar-system" className="max-w-md border-l border-line-strong pl-6">
                        <p className="kicker text-world">Region · Tharsis</p>
                        <h3 className="mt-2 text-h2 font-extrabold leading-none tracking-tight">Tharsis</h3>
                        <p className="mt-4 text-sm leading-relaxed text-fg-muted">
                            A vast volcanic region of Mars. It holds the Tharsis Montes and Olympus Mons, the largest known volcano in the Solar System.
                        </p>
                        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
                            <div>
                                <dt className="kicker text-fg-subtle">Mean radius</dt>
                                <dd className="text-sm font-semibold">3,389.5 km</dd>
                            </div>
                            <div>
                                <dt className="kicker text-fg-subtle">Length of day</dt>
                                <dd className="text-sm font-semibold">24 h 39 min</dd>
                            </div>
                        </dl>
                        <p className="mt-4 text-xs text-fg-subtle">
                            Source:{' '}
                            <a
                                href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline underline-offset-2 hover:text-fg"
                            >
                                NASA Mars Fact Sheet
                            </a>
                        </p>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <Link
                                href="/celestial/mars"
                                className="rounded-sm bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition-opacity hover:opacity-90"
                            >
                                Primary action
                            </Link>
                            <Link
                                href="/solar-system"
                                className="rounded-sm border border-line-strong px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-white/10"
                            >
                                Secondary action
                            </Link>
                        </div>
                    </div>

                    <div className="mt-10 grid gap-4 md:grid-cols-3">
                        {['Card', 'Card on hover', 'Card'].map((label, i) => (
                            <div
                                key={i}
                                className={`rounded-md border border-line p-5 ${i === 1 ? 'bg-surface-raised' : 'bg-surface'}`}
                            >
                                <p className="kicker text-fg-subtle">{label}</p>
                                <p className="mt-2 font-heading text-h3 font-semibold">A card title</p>
                                <p className="mt-2 text-sm text-fg-muted">Short description text sits here.</p>
                            </div>
                        ))}
                    </div>
                </Block>

                {/* ── Layout ───────────────────────────── */}
                <Block kicker="05 · Layout" title="Widths and spacing">
                    <ul className="space-y-2 text-fg-muted">
                        <li><code className="font-mono text-sm">max-w-page</code> · 80 rem · every page's content width</li>
                        <li><code className="font-mono text-sm">max-w-reading</code> · 42 rem · the width of long article text</li>
                        <li><code className="font-mono text-sm">py-section</code> · 6 rem · vertical rhythm between page sections</li>
                        <li><code className="font-mono text-sm">py-section-sm</code> · 4 rem · tighter sections</li>
                    </ul>
                </Block>
            </div>
        </main>
    )
}