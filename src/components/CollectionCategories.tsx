"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

const categories = [  
  { slug: 'tech', title: 'Tech Accessories', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop' },
  { slug: 'luggage', title: 'Luggage', img: 'https://images.unsplash.com/photo-1521185496955-15097b20c5fe?q=80&w=1200&auto=format&fit=crop' },
  { slug: 'accessories', title: 'Accessories', img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop' },
  { slug: 'electronics', title: 'Electronics', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&auto=format&fit=crop' },
  { slug: 'toiletries', title: 'Toiletries', img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop' },
  { slug: 'documents', title: 'Documents', img: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=1200&auto=format&fit=crop' },
  { slug: 'outdoor', title: 'Outdoor Gear', img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1200&auto=format&fit=crop' },
];

export default function CollectionCategories() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === categories.length - 1 ? 0 : prevIndex + 1
    );
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? categories.length - 1 : prevIndex - 1
    );
  }, []);

  // Auto slide effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
      nextSlide();
    }, 3000); // Change slide every 5 seconds

    // Clear interval on component unmount
    return () => clearInterval(slideInterval);
  }, [nextSlide]);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-center justify-center mb-8">
          <h2 className="font-semibold text-4xl text-gray-700">Shop by Category</h2>
        </div>

        <div className="relative group">
          {/* Navigation arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-50"
            aria-label="Previous category"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-foreground)" strokeWidth="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-50"
            aria-label="Next category"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-foreground)" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
          {/* Carousel container */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out gap-6"
              style={{ transform: `translateX(-${currentIndex * (100 / categories.length)}%)` }}
            >
              {categories.map((category) => (
                <div key={category.slug} className="w-52 flex-shrink-0">
                  <Link
                    href={`/collections?c=${category.slug}`}
                    className="group block bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200 h-full"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-gray-100">
                      <Image
                        src={category.img}
                        alt={category.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <div className="font-medium text-center text-gray-500 group-hover:text-[var(--color-primary)] transition-colors">
                        {category.title}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {categories.map((_, index) => (
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
      </div>
    </section>
  );
}
