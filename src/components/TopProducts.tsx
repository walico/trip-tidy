'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { shopifyClient, GET_PRODUCTS_QUERY, getProductImage } from '@/lib/shopify';

type Product = {
  id: string;
  title: string;
  handle: string;
  image: string;
  price: string;
};

type Promo = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
  bg: string;
};

const backgroundColors = [
  'bg-[#FFF2EA]',
  'bg-[#EAF2F5]',
  'bg-[#F0F7EE]',
  'bg-[#f5f0f4]',
  'bg-[#d3e4e8]',
  'bg-[#bdb5bd]',
  'bg-[#ffc107]',
  'bg-[#ffd7be]',
];

// Define CTA colors for each background color (adjust for contrast/readability)
const ctaColors: Record<string, string> = {
  'bg-[#FFF2EA]': 'text-[#D97706]',   // warm orange
  'bg-[#EAF2F5]': 'text-[#0C4A6E]',   // dark blue
  'bg-[#F0F7EE]': 'text-[#15803D]',   // dark green
  'bg-[#f5f0f4]': 'text-[#7E22CE]',   // purple
  'bg-[#d3e4e8]': 'text-[#1E3A8A]',   // blue
  'bg-[#bdb5bd]': 'text-[#831843]',   // deep pink/maroon
  'bg-[#ffc107]': 'text-[#6B3E00]',   // brownish
  'bg-[#ffd7be]': 'text-[#B45309]',   // darker orange
};


export default function TopProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch products from Shopify
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const { data } = await (shopifyClient as any).request(GET_PRODUCTS_QUERY, {
          variables: { first: 8 }
        });

        const fetchedProducts = data.products.edges.map((edge: any, index: number) => {
          const product = edge.node;
          return {
            id: product.id,
            title: product.title,
            handle: product.handle,
            image: getProductImage(product),
            price: product.priceRange?.minVariantPrice?.amount || '0',
          };
        });

        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Keep empty or use fallback data
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // Convert products to promo format for the carousel
  const promos: Promo[] = products.map((product, index) => ({
    id: product.id,
    title: product.title,
    subtitle: `Premium quality • $${product.price}`,
    cta: 'VIEW PRODUCT',
    href: `/products/${product.handle}`,
    image: product.image,
    bg: backgroundColors[index % backgroundColors.length],
  }));

  const totalSlides = Math.ceil(promos.length / 2);

  useEffect(() => {
    if (isPaused || promos.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused, totalSlides, promos.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const visiblePromos = promos.slice(currentSlide * 2, currentSlide * 2 + 2);

  if (loading) {
    return (
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
          <div className="px-2 sm:px-0">
            <h2 className="font-semibold text-2xl sm:text-4xl text-gray-700 mb-1 sm:mb-2">Trending Products</h2>
            <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">Discover our most loved items this season</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Loading trending products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (promos.length === 0) {
    return (
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
          <div className="px-2 sm:px-0">
            <h2 className="font-semibold text-2xl sm:text-4xl text-gray-700 mb-1 sm:mb-2">Trending Products</h2>
            <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">Discover our most loved items this season</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">No trending products available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

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
              <div
                key={p.id}
                className={`${p.bg} rounded-2xl hover:shadow-md transition-shadow relative overflow-hidden`}
              >
                <div className="flex flex-col md:flex-row items-center h-full">
                  
                  {/* Image Section */}
                  <div className="relative w-full h-64 md:h-full md:w-1/2 order-1 md:order-2">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      className="object-contain object-center"
                      sizes="(max-width: 768px) 100vw, 40vw"
                      priority
                    />
                  </div>

                  {/* Content Section */}
                  <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 order-2 md:order-1 flex flex-col justify-center">
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">{p.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mt-2">{p.subtitle}</p>
                    <Link
                      href={p.href}
                      className={`mt-4 inline-flex items-center font-medium group ${ctaColors[p.bg] || 'text-primary'}`}
                    >
                      {p.cta}
                      <svg
                        className={`w-4 h-4 ml-2 transition-transform group-hover:translate-x-1 ${ctaColors[p.bg] || 'text-primary'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </Link>

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
                    ? 'bg-(--color-primary) w-6 sm:w-8'
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
