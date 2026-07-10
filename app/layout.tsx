import type { Metadata } from 'next'
import { IBM_Plex_Sans, Space_Grotesk, Syne } from "next/font/google";
import './globals.css'

export const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
});

const heroFont = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-hero",
});
export const metadata: Metadata = {
  title: 'CosmicHub — Explore the Universe',
  description: 'A production-grade space encyclopedia. Browse 8,500+ celestial objects, space missions, agencies, and real-time launch data.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable} ${heroFont.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black">{children}</body>
    </html>
  )
}