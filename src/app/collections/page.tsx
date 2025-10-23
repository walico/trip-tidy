"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import TopProducts from '@/components/TopProducts';
import Footer from '@/components/Footer';
import Newsletter from '@/components/Newsletter';
import { shopifyClient, GET_COLLECTIONS_QUERY, getProductImage } from '@/lib/shopify';

// Define collection type
interface Collection {
  id: string;
  title: string;
  description: string;
  handle: string;
  image: string;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch collections on mount
  useEffect(() => {
    async function loadCollections() {
      if (!shopifyClient) {
        setError('Shopify client not configured');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data } = await shopifyClient.request(GET_COLLECTIONS_QUERY, { variables: { first: 20 } });

        const fetchedCollections = data.collections.edges.map((edge: any) => {
          const collection = edge.node;
          return {
            id: collection.id,
            title: collection.title,
            description: collection.description,
            handle: collection.handle,
            image: collection.image?.url || '/images/shopping_cart.jpg',
          };
        });

        setCollections(fetchedCollections);
      } catch (err) {
        console.error('Error fetching collections:', err);
        setError('Failed to load collections');
      } finally {
        setLoading(false);
      }
    }

    loadCollections();
  }, []);

  if (loading) {
    return (
      <main className="bg-white">
        <div className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Loading Collections...
            </h1>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-white">
        <div className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-red-600 sm:text-5xl md:text-6xl">
              Error
            </h1>
            <p className="text-gray-600 mt-4">{error}</p>
          </div>
        </div>
      </main>
    );
  }

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
                  <span className="text-sm text-gray-500">View collection</span>
                  <Link
                    href={`/collections/${collection.handle}`}
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary/80 transition-colors"
                  >
                    Explore
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
