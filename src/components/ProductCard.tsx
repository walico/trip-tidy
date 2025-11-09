"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/shopify';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    price: string;
    originalPrice?: string;
    image: string;
    handle: string;
    variantId: string;
    merchandiseId: string;
    availableForSale?: boolean;
  };
  className?: string;
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.availableForSale || isAddingToCart) return;
    
    setIsAddingToCart(true);
    
    try {
      await addToCart({
        id: product.id,
        variantId: product.variantId,
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        merchandiseId: product.merchandiseId
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Add to wishlist logic here
  };

  const hasSale = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);
  const isOutOfStock = product.availableForSale === false;

  return (
    <div className={`group h-full flex flex-col bg-white p-2 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-primary/20 ${className}`}>
      <Link href={`/products/${product.handle || product.id}`} className="block flex-1">
        <div className="relative overflow-hidden bg-gray-50 aspect-square rounded-[12px_12px_0_0]">
          <Image
            src={product.image}
            alt={product.title}
            width={500}
            height={500}
            className={`w-full h-full border border-[#be7960cc] object-cover transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'opacity-70' : ''}`}
          />

          {/* Stock status */}
          {isOutOfStock && (
            <div className="absolute top-3 left-3 bg-gray-600 text-white text-xs font-medium px-2 py-1 rounded">
              Out of Stock
            </div>
          )}

          {/* In Stock tag */}
          {!isOutOfStock && !hasSale && (
            <div className="absolute top-3 left-3 bg-[#be7960cc] text-white text-xs font-medium px-2 py-1 rounded">
              In Stock
            </div>
          )}

          {/* Sale tag */}
          {hasSale && !isOutOfStock && (
            <div className="absolute top-3 left-3 bg-red-700 text-white text-xs font-medium px-2 py-1 rounded">
              SALE
            </div>
          )}

          {/* Wishlist + Cart */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 ${isOutOfStock ? 'opacity-50' : ''}`}>
            <button 
              onClick={handleAddToWishlist}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-white text-gray-700 shadow-md transition-all hover:bg-gray-100 hover:scale-110"
              aria-label="Add to wishlist"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </button>

            {!isOutOfStock ? (
              <button 
                onClick={handleAddToCart}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-white text-gray-700 shadow-md transition-all hover:bg-gray-100 hover:scale-110 disabled:opacity-70 disabled:cursor-not-allowed"
                aria-label={isAddingToCart ? 'Adding to cart...' : 'Add to cart'}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? (
                  <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M3 3h2l3.6 7.59a2 2 0 0 0 1.8 1.18H19a2 2 0 0 0 2-1.5l1-4H6"/>
                  </svg>
                )}
              </button>
            ) : (
              <button disabled className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-400 cursor-not-allowed">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M3 3h2l3.6 7.59a2 2 0 0 0 1.8 1.18H19a2 2 0 0 0 2-1.5l1-4H6"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col text-gray-900">
          <h3 className="text-sm font-medium line-clamp-2 h-10" style={{ letterSpacing: '0.05em' }}>
            {product.title}
          </h3>

          <div className="mt-1">
            {hasSale ? (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-(--color-primary)">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xs line-through text-gray-200">
                  {formatPrice(product.originalPrice)}
                </span>
              </div>
            ) : (
              <span className="text-xl font-bold text-(--color-primary)">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
