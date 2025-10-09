"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const categories = [
  { slug: 'luggage', title: 'Luggage', img: 'https://images.unsplash.com/photo-1521185496955-15097b20c5fe?q=80&w=1200&auto=format&fit=crop' },
  { slug: 'backpacks', title: 'Backpacks', img: 'https://images.unsplash.com/photo-1514477917009-389c76a86b68?q=80&w=1200&auto=format&fit=crop' },
  { slug: 'accessories', title: 'Accessories', img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop' },
  { slug: 'electronics', title: 'Electronics', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&auto=format&fit=crop' },
  { slug: 'clothing', title: 'Clothing', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop' },
  { slug: 'shoes', title: 'Shoes', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop' },
  { slug: 'toiletries', title: 'Toiletries', img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop' },
  { slug: 'documents', title: 'Documents', img: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=1200&auto=format&fit=crop' },
  { slug: 'outdoor', title: 'Outdoor Gear', img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1200&auto=format&fit=crop' },
  { slug: 'tech', title: 'Tech Accessories', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop' },
];

export default function CollectionCategories() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === categories.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? categories.length - 1 : prevIndex - 1
    );
  };

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-gray-600">Shop by Category</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Previous category"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Next category"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="relative">
          {/* Carousel container */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out gap-6"
              style={{ transform: `translateX(-${currentIndex * (100 / categories.length)}%)` }}
            >
              {categories.map((category) => (
                <div key={category.slug} className="w-80 flex-shrink-0">
                  <Link
                    href={`/collections?c=${category.slug}`}
                    className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 h-full"
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
          <div className="flex justify-center mt-6 gap-2">
            {categories.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-[var(--color-primary)]' : 'bg-gray-300'
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
