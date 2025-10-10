"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: string;
  title: string;
  price: string;
  originalPrice: string;
  rating: number;
  img: string;
}

const products: Product[] = [
  { 
    id: 'p1', 
    title: 'Carry-On Luggage', 
    price: '$180', 
    originalPrice: '$220', 
    rating: 4.5, 
    img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop' 
  },
  { 
    id: 'p2', 
    title: 'Travel Backpack', 
    price: '$120', 
    originalPrice: '$150', 
    rating: 4.2, 
    img: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=1200&auto=format&fit=crop' 
  },
  { 
    id: 'p3', 
    title: 'Packing Cubes Set', 
    price: '$45', 
    originalPrice: '$55', 
    rating: 4.8, 
    img: 'https://images.unsplash.com/photo-1586015555751-63eb0ae5d5ae?q=80&w=1200&auto=format&fit=crop' 
  },
  { 
    id: 'p4', 
    title: 'Neck Pillow', 
    price: '$25', 
    originalPrice: '$35', 
    rating: 4.0, 
    img: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1200&auto=format&fit=crop' 
  },
];

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-3 w-3 sm:h-4 sm:w-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event bubbling
    
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      img: product.img
    });
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.img}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        
        <div className="absolute right-2 top-2 sm:right-4 sm:top-4 flex gap-2">
          {/* Mobile: Always visible buttons */}
          <div className="flex sm:hidden gap-2">
            <button 
              className="flex items-center justify-center rounded-full bg-white/80 p-1.5 text-gray-700 shadow-md transition-all hover:bg-white hover:scale-110"
              aria-label="Add to wishlist"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button 
              onClick={handleAddToCart}
              className="flex items-center justify-center rounded-full bg-white/80 p-1.5 text-gray-700 shadow-md transition-all hover:bg-white hover:scale-110"
              aria-label="Add to cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </button>
          </div>
          
          {/* Desktop: Buttons shown on hover */}
          <div className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-2">
            <button 
              className="flex items-center justify-center rounded-full bg-white/80 p-2 text-gray-700 shadow-md transition-all hover:bg-white hover:scale-110 cursor-pointer"
              aria-label="Add to wishlist"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button 
              onClick={handleAddToCart}
              className="flex items-center justify-center rounded-full bg-white/80 p-2 text-gray-700 shadow-md transition-all hover:bg-white hover:scale-110 cursor-pointer"
              aria-label="Add to cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <Link href={`/products/${product.id}`} className="block">
          <div className="space-y-1 sm:space-y-2">
            <div className="text-sm sm:text-base font-medium text-gray-600 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 h-10 sm:h-auto">
              {product.title}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-semibold text-[var(--color-primary)]">
                {product.price}
              </span>
              <span className="text-xs sm:text-sm text-gray-400 line-through">
                {product.originalPrice}
              </span>
            </div>

            <div className="flex items-center">
              <StarRating rating={product.rating} />
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-600">{product.rating}</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function FeaturedProducts() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 mb-4 sm:mb-6">
          <h2 className="font-semibold text-2xl sm:text-4xl text-gray-700">Featured Products</h2>
          <Link href="/products" className="text-sm text-gray-600 hover:underline">View all products →</Link>
        </div>
        <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
