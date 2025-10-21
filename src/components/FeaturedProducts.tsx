"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import { formatPrice, getProductImage, getProductPrice, getProductOriginalPrice } from '@/lib/shopify';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=8');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch products');
        }

        const formattedProducts = data.data.edges.map((edge: any) => {
          const product = edge.node;
          // Get the first variant's full GID or fall back to product GID
          const variantId = product.variants?.edges?.[0]?.node?.id || product.id;
          
          return {
            id: product.id,
            title: product.title,
            price: getProductPrice(product),
            originalPrice: getProductOriginalPrice(product),
            img: getProductImage(product),
            handle: product.handle,
            variantId, // This is now the full Shopify GID
            rating: 4.5,
            reviewCount: 0
          };
        });

        setProducts(formattedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-64 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Featured Products</h2>
          <Link 
            href="/products" 
            className="text-sm font-medium text-gray-500 hover:text-primary/80 transition-colors"
          >
            View all products
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const cartItem = {
        id: product.variantId, // This should be the full Shopify GID
        quantity: 1
      };

      console.debug('Adding to cart:', {
        cartItem,
        product: {
          id: product.id,
          variantId: product.variantId
        }
      });

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [cartItem]
        }),
      });

      const result = await response.json();
      console.debug('Cart API response:', result);

      if (!response.ok) {
        throw new Error(
          result.error || 'Failed to add to cart' + 
          (result.details ? `: ${JSON.stringify(result.details)}` : '')
        );
      }

      if (result.cart?.checkoutUrl) {
        window.open(result.cart.checkoutUrl, '_blank');
      } else {
        alert(`${product.title} added to cart!`);
      }
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      alert(`Failed to add ${product.title} to cart: ${err.message}`);
    }
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Add to wishlist logic here
  };

  const hasSale = product.originalPrice !== product.price;

  return (
    <Link 
      href={`/products/${product.handle || product.id}`} 
      className="group"
    >
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-[10px_10px_0_0] bg-gray-100 relative">
        <Image
          src={product.img}
          alt={product.title}
          width={500}
          height={500}
          className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
          priority
        />
        
        {hasSale && (
          <div className="absolute top-2 right-2 rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
            SALE
          </div>
        )}

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
      
      <div className="flex justify-between border border-t-0 border-gray-200 p-4">
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
            {product.reviewCount && product.reviewCount > 0 && (
              <p className="ml-2 text-xs text-gray-500">
                {product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          {hasSale ? (
            <>
              <p className="text-lg font-medium text-[var(--color-primary)]">
                {formatPrice(product.price)}
              </p>
              <p className="text-xs text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </p>
            </>
          ) : (
            <p className="text-lg font-medium text-[var(--color-primary)]">
              {formatPrice(product.price)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}