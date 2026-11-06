import type { Metadata } from 'next'
import {
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Newsreader,
  Source_Serif_4,
  Space_Grotesk,
} from 'next/font/google'
import './globals.css'

const headingFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
})

const bodyFont = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
})

const monoFont = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono-face',
})

// Two serif candidates for long article text. One of them will be removed after review.
const articleFontA = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-article-a',
})

const articleFontB = Source_Serif_4({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-article-b',
})

export const metadata: Metadata = {
  title: 'CosmicHub — Explore the Universe',
  description:
    'A production-grade space encyclopedia. Browse 8,500+ celestial objects, space missions, agencies, and real-time launch data.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable} ${monoFont.variable} ${articleFontA.variable} ${articleFontB.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black">{children}</body>
    </html>
  )
}