import Hero from '@/components/home/Hero'
import LiveBanner from '@/components/home/LiveBanner'
import ExploreCategories from '@/components/home/ExploreCategories'
import FeaturedObjects from '@/components/home/FeaturedObjects'
import NewsSection from '@/components/home/NewsSection'

export default function HomePage() {
  return (
    <>
      <Hero />
      <LiveBanner />
      <ExploreCategories />
      <FeaturedObjects />
      <NewsSection />
    </>
  )
}