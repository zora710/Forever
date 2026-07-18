
import BestSellers from '../components/BestSellers'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import NewsLetter from '../components/NewsLetter'
import OurPolicy from '../components/OurPolicy'
import NewArrivalsMarquee from '../components/NewArrivalsMarquee'

function Home() {
  return (
    <div>
      <Hero />
      <NewArrivalsMarquee />
      <LatestCollection />
      <BestSellers />
      <OurPolicy />
      <NewsLetter />
    </div>
  )
}

export default Home
