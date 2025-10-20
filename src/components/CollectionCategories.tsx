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

  // Fetch collections from Shopify
  useEffect(() => {
    async function loadCollections() {
      try {
        setLoading(true);
        const { data } = await shopifyClient.request(GET_COLLECTIONS_QUERY, { variables: { first: 10 } });

        const fetchedCollections = data.collections.edges.map((edge: any) => {
          const collection = edge.node;
          return {
            id: collection.id,
            title: collection.title,
            handle: collection.handle,
            image: collection.image?.url || '/images/shopping_cart.jpg', // Fallback image
          };
        });

        setCollections(fetchedCollections);
      } catch (error) {
        console.error('Error fetching collections:', error);
        // Keep empty or use fallback data
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

  // Auto slide effect - only when carousel is active
  useEffect(() => {
    if (collections.length <= 5) return; // Don't auto-slide for static grid

    const slideInterval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(slideInterval);
  }, [nextSlide, collections.length]);

  if (loading || collections.length === 0) {
    return (
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="flex items-center justify-center mb-8">
            <h2 className="font-semibold text-4xl text-gray-700">Shop by Category</h2>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Loading categories...</p>
          </div>
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
          // Carousel for more than 5 collections
          <div className="relative group">
            {/* Navigation arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-2 rounded-full bg-primary/10 shadow-primary/20 hover:bg-primary/20 text-primary"
              aria-label="Previous category"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-2 rounded-full bg-primary/10 shadow-primary/20 hover:bg-primary/20 text-primary"
              aria-label="Next category"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>

            {/* Carousel container */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out gap-6"
                style={{ transform: `translateX(-${currentIndex * (100 / Math.min(collections.length, 7))}%)` }}
              >
                {collections.map((collection) => (
                  <div key={collection.id} className="w-52 flex-shrink-0">
                    <Link
                      href={`/collections/${collection.handle}`}
                      className="group block bg-white rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 h-full"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-gray-100">
                        <Image
                          src={collection.image}
                          alt={collection.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <div className="font-thin uppercase text-center text-gray-500 group-hover:text-primary transition-colors">
                          {collection.title}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots indicator */}
            <div className="flex justify-center mt-8 space-x-2">
              {collections.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1 rounded-full transition-colors cursor-pointer ${
                    index === currentIndex
                      ? 'bg-[var(--color-primary)] w-8'
                      : 'w-1 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to category ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          // Static grid for 5 or fewer collections
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.handle}`}
                className="group block bg-white rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 h-full"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-gray-100">
                  <Image
                    src={collection.image}
                    alt={collection.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="font-medium text-center text-gray-500 group-hover:text-[var(--color-primary)] transition-colors">
                    {collection.title}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
