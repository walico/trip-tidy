import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import TopProducts from '@/components/TopProducts';
import Footer from '@/components/Footer';
import Newsletter from '@/components/Newsletter';

// Sample collections data - in a real app, this would come from an API
const collections = [
  {
    id: 'summer-collection',
    title: 'Summer Collection',
    description: 'Lightweight and breathable pieces for your summer adventures',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop',
    productCount: 12,
  },
  {
    id: 'winter-essentials',
    title: 'Winter Essentials',
    description: 'Stay warm and stylish in cold weather',
    image: 'https://images.unsplash.com/photo-1516764559460-3a2c8f4a3b3e?q=80&w=1200&auto=format&fit=crop',
    productCount: 15,
  },
  {
    id: 'travel-gear',
    title: 'Travel Gear',
    description: 'Essential gear for your next adventure',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop',
    productCount: 20,
  },
  {
    id: 'accessories',
    title: 'Accessories',
    description: 'Complete your look with our accessories',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop',
    productCount: 18,
  },
];

export default function CollectionsPage() {
  return (
    <main className="bg-white">
      {/* Hero Section */}
      <div className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Our Collections
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-600">
            Discover our curated selection of products for every adventure
          </p>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
          {collections.map((collection) => (
            <div key={collection.id} className="group relative overflow-hidden rounded-lg bg-white border hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={collection.image}
                  alt={collection.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{collection.title}</h2>
                <p className="text-gray-600 mb-4">{collection.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{collection.productCount} items</span>
                  <Link 
                    href={`/collections/${collection.id}`}
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary/80 transition-colors"
                  >
                    View collection
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TopProducts />
      <Newsletter />
      <Footer />
    </main>
  );
}
