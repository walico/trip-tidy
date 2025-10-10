import AnnouncementBar from '@/components/AnnouncementBar';
import Banner from '@/components/Banner';
import CollectionCategories from '@/components/CollectionCategories';
import FeaturedProducts from '@/components/FeaturedProducts';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import Info from '@/components/Info';
import NavBar from '@/components/NavBar';
import Newsletter from '@/components/Newsletter';
import TopProducts from '@/components/TopProducts';

export default function Home() {
  return (
    <main>
      <Hero />
      <Info />
      <CollectionCategories />
      <FeaturedProducts />
      <TopProducts />
      <Banner />
      <Newsletter />
      <Footer />
    </main>
  );
}
