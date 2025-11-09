"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { shopifyClient, GET_COLLECTIONS_QUERY } from '@/lib/shopify';

interface Collection {
  id: string;
  title: string;
  handle: string;
  image: string;
}

export default function CollectionCategories() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function loadCollections() {
      try {
        setLoading(true);
        if (!shopifyClient) return;

        const { data } = await shopifyClient.request(GET_COLLECTIONS_QUERY, {
          variables: { first: 10 }
        });

        const fetchedCollections = data.collections.edges.map((edge: any) => {
          const collection = edge.node;
          return {
            id: collection.id,
            title: collection.title,
            handle: collection.handle,
            image: collection.image?.url || '/images/shopping_cart.jpg',
          };
        });

        setCollections(fetchedCollections);
      } catch {
        // optional: fallback handling
      } finally {
        setLoading(false);
      }
    }
    loadCollections();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === collections.length - 1 ? 0 : prevIndex + 1
    );
  }, [collections.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? collections.length - 1 : prevIndex - 1
    );
  }, [collections.length]);

  useEffect(() => {
    if (collections.length <= 5) return;

    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, [nextSlide, collections.length]);

  if (loading || collections.length === 0) {
    return (
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <h2 className="font-semibold text-4xl text-gray-700 mb-4">Shop by Category</h2>
          <p className="text-gray-500">Loading categories...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-center justify-center mb-8">
          <h2 className="font-semibold text-4xl text-gray-700">Shop by Category</h2>
        </div>

        {collections.length > 5 ? (
          // Carousel version
          <div className="relative group">
            {/* Prev Arrow */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-2 rounded-full bg-[#be7960cc]/10 hover:bg-[#be7960cc]/20 text-[#be7960cc]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>

            {/* Next Arrow */}
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-2 rounded-full bg-[#be7960cc]/10 hover:bg-[#be7960cc]/20 text-[#be7960cc]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>

            {/* Carousel Container */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out gap-0 sm:gap-6"
                style={{ transform: `translateX(-${currentIndex * (100 / Math.min(collections.length, 7))}%)` }}
              >
                {collections.map((collection) => (
                  <div key={collection.id} className="w-52 shrink-0">
                    <Link
                      href={`/collections/${collection.handle}`}
                      className="group block bg-white rounded-lg border border-[#be7960cc] transition-all duration-200 h-full md:hover:shadow-lg md:hover:shadow-[#be7960cc]/40"
                    >
                      <div className="relative aspect-4/3 w-full overflow-hidden rounded-t-lg bg-gray-100">
                        <Image
                          src={collection.image}
                          alt={collection.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <div className="text-center text-gray-600 group-hover:text-[#be7960cc] transition-colors uppercase text-sm font-thin">
                          {collection.title}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center mt-8 space-x-2">
              {collections.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1 rounded-full transition-all ${
                    index === currentIndex ? 'bg-[#be7960cc] w-8' : 'bg-gray-300 w-1'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          // Static grid version
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0 sm:gap-6 w-full max-w-4xl">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.handle}`}
                  className="group block bg-white rounded-none sm:rounded-lg border border-[#be7960cc] transition-all duration-200 h-full md:hover:shadow-lg md:hover:shadow-[#be7960cc]/40"
                >
                  <div className="relative aspect-4/3 w-full overflow-hidden rounded-none sm:rounded-t-lg bg-white/50">
                    <Image
                      src={collection.image}
                      alt={collection.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-center text-gray-600 group-hover:text-[#be7960cc] transition-colors uppercase text-sm font-light">
                      {collection.title}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
