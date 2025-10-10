"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { Star } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: string;
  originalPrice: string;
  rating: number;
  img: string;
  reviewCount?: number;
}

const products: Product[] = [
  { 
    id: 'p1', 
    title: 'Carry-On Luggage', 
    price: '180.00', 
    originalPrice: '220.00', 
    rating: 4.5,
    reviewCount: 124,
    img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop', 
  },
  { 
    id: 'p2', 
    title: 'Travel Backpack', 
    price: '120.00', 
    originalPrice: '150.00', 
    rating: 4.2,
    reviewCount: 89,
    img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
  },

  { 
    id: 'p4', 
    title: 'Neck Pillow', 
    price: '25.00', 
    originalPrice: '35.00', 
    rating: 4.0,
    reviewCount: 203,
    img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
  },
  { 
    id: 'p5', 
    title: 'Passport Wallet', 
    price: '32.00', 
    originalPrice: '40.00', 
    rating: 4.7,
    reviewCount: 78,
    img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
  },
  { 
    id: 'p6', 
    title: 'Travel Adapter', 
    price: '29.99', 
    originalPrice: '39.99', 
    rating: 4.6,
    reviewCount: 156,
    img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
  },
  { 
    id: 'p7', 
    title: 'Water Bottle', 
    price: '22.00', 
    originalPrice: '28.00', 
    rating: 4.9,
    reviewCount: 312,
    img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
  },
  { 
    id: 'p8', 
    title: 'Travel Pillow', 
    price: '34.99', 
    originalPrice: '44.99', 
    rating: 4.3,
    reviewCount: 87,
    img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
  },
  { 
    id: 'p9', 
    title: 'Luggage Tag Set', 
    price: '15.99', 
    originalPrice: '45.00',
    rating: 4.1,
    reviewCount: 42,
    img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
  },
  { 
    id: 'p10', 
    title: 'Travel Blanket', 
    price: '38.50', 
    originalPrice: '45.00', 
    rating: 4.4,
    reviewCount: 67,
    img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
  },
  { 
    id: 'p11', 
    title: 'Toiletry Bag', 
    price: '28.00', 
    originalPrice: '35.00', 
    rating: 4.6,
    reviewCount: 94,
    img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
  },
  { 
    id: 'p12', 
    title: 'Travel Umbrella', 
    price: '24.99', 
    originalPrice: '29.99', 
    rating: 4.2,
    reviewCount: 113,
    img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
  }
];

function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      img: product.img
    });
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Add to wishlist logic here
  };

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-[10px_10px_0_0] bg-gray-200 xl:aspect-h-8 xl:aspect-w-7 relative">
        <Image
          src={product.img}
          alt={product.title}
          width={500}
          height={500}
          className="h-full w-full object-cover object-center group-hover:opacity-75"
          priority
        />
        
        {product.originalPrice !== product.price && (
          <div className="absolute top-2 right-2 rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
            SALE
          </div>
        )}

        {/* Action Buttons - Desktop (Show on hover) */}
        <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            onClick={handleAddToWishlist}
            className="flex items-center justify-center rounded-full bg-white/90 p-2 text-gray-700 shadow-md transition-all hover:bg-white hover:scale-110"
            aria-label="Add to wishlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button 
            onClick={handleAddToCart}
            className="flex items-center justify-center rounded-full bg-white/90 p-2 text-gray-700 shadow-md transition-all hover:bg-white hover:scale-110"
            aria-label="Add to cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex justify-between border border-t-none border-gray-200 p-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{product.title}</h3>
          <div className="mt-1 flex items-center">
            <div className="flex items-center">
              {[0, 1, 2, 3, 4].map((rating) => (
                <Star
                  key={rating}
                  className={`h-4 w-4 flex-shrink-0 ${
                    rating < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-200'
                  }`}
                  aria-hidden="true"
                  fill={rating < Math.floor(product.rating) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <p className="ml-2 text-xs text-gray-500">
              {product.reviewCount} reviews
            </p>
          </div>
        </div>
        <div className="text-right">
          {product.originalPrice !== product.price ? (
            <>
              <p className="text-lg font-medium text-[var(--color-primary)]">${product.price}</p>
              <p className="text-xs text-gray-500 line-through">${product.originalPrice}</p>
            </>
          ) : (
            <p className="text-lg font-medium text-[var(--color-primary)]">${product.price}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedProducts() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Featured Products</h2>
          <Link href="/products" className="text-sm font-medium text-gray-500 hover:text-primary/80">
            View all products
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}