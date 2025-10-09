"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

const products = [
  { id: 'p1', title: 'Carry-On Luggage', price: '$180', originalPrice: '$220', rating: 4.5, img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop' },
  { id: 'p2', title: 'Travel Backpack', price: '$120', originalPrice: '$150', rating: 4.2, img: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=1200&auto=format&fit=crop' },
  { id: 'p3', title: 'Packing Cubes Set', price: '$45', originalPrice: '$55', rating: 4.8, img: 'https://images.unsplash.com/photo-1586015555751-63eb0ae5d5ae?q=80&w=1200&auto=format&fit=crop' },
  { id: 'p4', title: 'Neck Pillow', price: '$25', originalPrice: '$35', rating: 4.0, img: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1200&auto=format&fit=crop' },
];

export default function FeaturedProducts() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-gray-600">Featured Products</h2>
          <Link href="/products" className="text-sm text-gray-600 hover:underline">View all</Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: { id: string; title: string; price: string; originalPrice: string; rating: number; img: string } }) {
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

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-3 h-3 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-xs text-gray-500 ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <div
      className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
          <Image
            src={product.img}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Overlay that appears on hover */}
          <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

          {/* Add to Cart button - slides up on hover */}
          <div className={`absolute bottom-0 left-0 right-0 bg-white transform transition-transform duration-300 ${
            isHovered ? 'translate-y-0' : 'translate-y-full'
          }`}>
            <button 
              onClick={handleAddToCart}
              className="w-full py-3 px-4 bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary)]/90 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.id}`} className="block">
          <div className="space-y-2">
            <div className="font-medium text-gray-600 group-hover:text-[var(--color-primary)] transition-colors">
              {product.title}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-700 text-sm font-medium">
                {product.price}
              </span>
              <span className="text-gray-400 text-xs line-through">
                {product.originalPrice}
              </span>
            </div>

            <StarRating rating={product.rating} />
          </div>
        </Link>
      </div>
    </div>
  );
}
