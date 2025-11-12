"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { shopifyClient, GET_COLLECTIONS_QUERY } from '@/lib/shopify';
import TopProducts from '@/components/TopProducts';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';

interface Collection {
  id: string;
  title: string;
  handle: string;
  image: string;
  description: string; // include description
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCollections() {
      try {
        setLoading(true);
        if (!shopifyClient) return;

        const { data } = await shopifyClient.request(GET_COLLECTIONS_QUERY, {
          variables: { first: 20 },
        });

        const fetchedCollections = data.collections.edges.map((edge: any) => {
          const collection = edge.node;
          return {
            id: collection.id,
            title: collection.title,
            handle: collection.handle,
            image: collection.image?.url || '/images/shopping_cart.jpg',
            description: collection.description || '',
          };
        });

        setCollections(fetchedCollections);
      } catch (err) {
        console.error('Error fetching collections:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCollections();
  }, []);

  if (loading || collections.length === 0) {
    return (
      <main className="bg-white">
        <div className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-gray-700 sm:text-5xl md:text-6xl">
              Loading Collections...
            </h1>
            <p className="mt-4 text-gray-500">
              Please wait while we fetch our curated collections of products.
            </p>
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
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Explore Our Collections
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg sm:text-xl text-gray-600">
            Browse through our thoughtfully curated collections of products, handpicked to meet your lifestyle needs. Whether you’re looking for everyday essentials or unique finds, our collections make it easy to discover something special.
          </p>
        </div>
      </div>

      {/* Collections Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 lg:gap-4 w-full max-w-5xl mx-auto">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.handle}`}
              className={`
                group block bg-white 
                rounded-none sm:rounded-lg 
                border border-[#be7960cc] 
                transition-all duration-200 
                h-full md:hover:shadow-lg md:hover:shadow-[#be7960cc]/40
              `}
            >
             <div className="relative w-full h-96 sm:h-64 overflow-hidden rounded-none sm:rounded-t-lg bg-white/50">
              <Image
                src={collection.image}
                alt={collection.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              />
            </div>

              <div className="p-4">
                <div className="text-center text-gray-600 group-hover:text-[#be7960cc] transition-colors uppercase text-sm font-light sm:font-normal sm:text-gray-800 sm:text-lg">
                  {collection.title}
                </div>
                {collection.description && (
                  <p className="mt-1 text-center text-gray-500 text-xs line-clamp-2 sm:text-sm sm:text-gray-600 sm:mt-2 sm:line-clamp-2">
                    {collection.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

      </section>

      <TopProducts />
      <Newsletter />
      <Footer />
    </main>
  );
}
