"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ChevronRight, Heart } from 'lucide-react';
import TopProducts from '@/components/TopProducts';
import Footer from '@/components/Footer';
import Newsletter from '@/components/Newsletter';
import { useCart } from '@/contexts/CartContext';

// Define product type
interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  image: string;
}

// Sample collection data - in a real app, this would come from an API
const collection = {
  id: 'summer-collection',
  title: 'Summer Collection 2023',
  description: 'Discover our latest summer collection featuring lightweight and breathable fabrics perfect for your next adventure. Designed for comfort and style, these pieces will keep you cool and looking great all season long.',
  products: [
    {
      id: '1',
      title: 'Lightweight Travel Shirt',
      price: 49.99,
      originalPrice: 69.99,
      rating: 4.5,
      reviewCount: 42,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: '2',
      title: 'Breathable Shorts',
      price: 39.99,
      originalPrice: 59.99,
      rating: 4.2,
      reviewCount: 36,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: '3',
      title: 'Sun Protection Hat',
      price: 29.99,
      originalPrice: 39.99,
      rating: 4.7,
      reviewCount: 28,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
    },
  ] as Product[],
};

function CollectionDetailContent({ id }: { id: string }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price.toString(),
      img: product.image
    });
  };

  return (
    <main className="bg-white">
      {/* Collection Header */}
      <div className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
              <li className="inline-flex items-center">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                  <Link href="/collections" className="text-sm font-medium text-gray-700 hover:text-primary">
                    Collections
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    {collection.title}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              {collection.title}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-600">
              {collection.description}
            </p>
          </div>
        </div>
      </div>

      {/* Collection Products */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {collection.products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="group block overflow-hidden rounded-lg bg-white transition-shadow hover:shadow-md">
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-[10px_10px_0_0] bg-gray-200 xl:aspect-h-8 xl:aspect-w-7 relative">
                <Image
                  src={product.image}
                  alt={product.title}
                  width={500}
                  height={500}
                  className="h-full w-full object-cover object-center group-hover:opacity-75"
                />
                
                {product.originalPrice > product.price && (
                  <div className="absolute top-2 right-2 rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
                    SALE
                  </div>
                )}

                <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Add to wishlist logic here
                    }}
                    className="flex items-center justify-center rounded-full bg-white/90 p-2 text-gray-700 shadow-md transition-all hover:bg-white hover:scale-110"
                    aria-label="Add to wishlist"
                  >
                    <Heart className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={(e) => handleAddToCart(e, product)}
                    className="flex items-center justify-center rounded-full bg-white/90 p-2 text-gray-700 shadow-md transition-all hover:bg-white hover:scale-110"
                    aria-label="Add to cart"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between border border-t-0 border-gray-200 p-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 truncate" title={product.title.trim()}>
                    {product.title.trim().slice(0, 20)}{product.title.length > 20 ? '...' : ''}
                  </h3>
                  <div className="mt-3 flex items-center">
                    <div className="flex items-center">
                      {[0, 1, 2, 3, 4].map((rating) => (
                        <Star
                          key={rating}
                          className={`h-4 w-4 flex-shrink-0 ${
                            rating < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-200'
                          }`}
                          aria-hidden="true"
                          fill={rating < Math.floor(product.rating || 0) ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                    <p className="ml-2 text-xs text-gray-500">
                      {product.reviewCount} reviews
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {product.originalPrice > product.price ? (
                    <>
                      <p className="text-lg font-medium text-[var(--color-primary)]">${product.price.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 line-through">${product.originalPrice.toFixed(2)}</p>
                    </>
                  ) : (
                    <p className="text-lg font-medium text-[var(--color-primary)]">${product.price.toFixed(2)}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <TopProducts />
      <Newsletter />
      <Footer />
    </main>
  );
}

// Server component that handles the params
export default function CollectionDetailPage({ params }: { params: { id: string } }) {
  return <CollectionDetailContent id={params.id} />;
}
