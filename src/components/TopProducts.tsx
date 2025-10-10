'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Promo = {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
  bg: string;
};

const promos: Promo[] = [
  {
    id: 1,
    title: 'Modern Sofa',
    subtitle: 'Luxury meets comfort in every curve',
    cta: 'SHOP NOW',
    href: '/products',
    image: '/images/backpack.png',
    bg: 'bg-[#FFF2EA]',
  },
  {
    id: 2,
    title: 'Elegant Chair',
    subtitle: 'Perfect blend of style and comfort',
    cta: 'SHOP NOW',
    href: '/products',
    image: '/images/backpack.png',
    bg: 'bg-[#EAF2F5]',
  },
  {
    id: 3,
    title: 'Minimalist Desk',
    subtitle: 'Sleek design for productive spaces',
    cta: 'SHOP NOW',
    href: '/products',
    image: '/images/backpack.png',
    bg: 'bg-[#F0F7EE]',
  },
  {
    id: 4,
    title: 'Cozy Armchair',
    subtitle: 'Your personal relaxation spot',
    cta: 'SHOP NOW',
    href: '/products',
    image: '/images/backpack.png',
    bg: 'bg-[#f5f0f4]',
  },
  {
    id: 5,
    title: 'Modern Bookshelf',
    subtitle: 'Elegant storage solution',
    cta: 'EXPLORE',
    href: '/products',
    image: '/images/backpack.png',
    bg: 'bg-[#d3e4e8]',
  },
  {
    id: 6,
    title: 'Glass Coffee Table',
    subtitle: 'Contemporary centerpiece',
    cta: 'SHOP NOW',
    href: '/products',
    image: '/images/backpack.png',
    bg: 'bg-[#bdb5bd]',
  },
  {
    id: 7,
    title: 'Dining Set',
    subtitle: 'Gather around in style',
    cta: 'VIEW COLLECTION',
    href: '/products',
    image: '/images/backpack.png',
    bg: 'bg-[#ffc107]',
  },
  {
    id: 8,
    title: 'Nightstand',
    subtitle: 'Functional bedside companion',
    cta: 'DISCOVER',
    href: '/products',
    image: '/images/backpack.png',
    bg: 'bg-[#ffd7be]',
  },
];

export default function TopProducts() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalSlides = Math.ceil(promos.length / 2);

  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused, totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const visiblePromos = promos.slice(currentSlide * 2, currentSlide * 2 + 2);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="px-2 sm:px-0">
          <h2 className="font-semibold text-2xl sm:text-4xl text-gray-700 mb-1 sm:mb-2">Trending Products</h2>
          <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">Discover our most loved items this season</p>
        </div>
        
        <div 
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="grid gap-6 md:grid-cols-2 transition-transform duration-500 ease-in-out">
            {visiblePromos.map((p) => (
              <div key={p.id} className={`${p.bg} rounded-2xl hover:shadow-md transition-shadow relative h-[320px] sm:h-64 md:h-60 overflow-hidden`}>
                <div className="relative grid grid-cols-1 md:grid-cols-2 items-center h-full">
                  {/* Content Section */}
                  <div className="p-6 sm:p-8 md:p-10 order-2 md:order-1 z-10 bg-gradient-to-t from-black/10 to-transparent md:bg-none">
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 md:text-gray-800">{p.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 md:text-gray-500 mt-1 sm:mt-2">{p.subtitle}</p>
                    <Link 
                      href={p.href} 
                      className="mt-4 md:mt-6 inline-flex items-center text-[var(--color-primary)] font-medium group"
                    >
                      {p.cta}
                      <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </Link>
                  </div>
                  
                  {/* Image Section */}
                  <div className="relative h-48 md:h-full order-1 md:order-2">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-full h-full max-h-[180px] md:max-h-none">
                        <Image
                          src={p.image}
                          alt={p.title}
                          fill
                          className="object-contain object-center"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center mt-6 sm:mt-8 space-x-1 sm:space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentSlide 
                    ? 'bg-[var(--color-primary)] w-6 sm:w-8' 
                    : 'w-2 sm:w-3 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
