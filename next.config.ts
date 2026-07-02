import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images-assets.nasa.gov' },
      { protocol: 'https', hostname: 'apod.nasa.gov' },
      { protocol: 'https', hostname: '**.nasa.gov' },
      { protocol: 'https', hostname: '**.spaceflightnewsapi.net' },
      { protocol: 'https', hostname: 'spaceflightnow.com' },
      { protocol: 'https', hostname: '**.spaceflightnow.com' },
      { protocol: 'http', hostname: 'spaceflightnow.com' },
    ],
  },
}

export default nextConfig