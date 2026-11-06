import HomeJourney from '@/components/home/HomeJourney'
import LiveBanner from '@/components/home/LiveBanner'
import ExploreCategories from '@/components/home/ExploreCategories'
import SolarSystemTeaser from '@/components/home/SolarSystemTeaser'
import FeaturedObjects from '@/components/home/FeaturedObjects'
import NewsSection from '@/components/home/NewsSection'

export default function HomePage() {
  return (
    <>
      <HomeJourney />
      <LiveBanner />
      <ExploreCategories />
      <SolarSystemTeaser />
      <FeaturedObjects />
      <NewsSection />
    </>
  )
}