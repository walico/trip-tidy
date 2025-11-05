"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import { formatPrice, getProductImage, getProductPrice, getProductOriginalPrice } from '@/lib/shopify';
import { useCart } from '@/contexts/CartContext';

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
            reviewCount: 0,
            availableForSale: product.availableForSale,
            variants: product.variants
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
    <div className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-2xl sm:text-4xl text-gray-700 mb-1 sm:mb-2">Featured Products</h2>
          <Link 
            href="/products" 
            className="text-sm font-medium text-gray-500 hover:text-primary/80 transition-colors"
          >
            View all products
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-x-3 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
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
        image: product.img,
        merchandiseId: product.variantId
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      // You might want to show an error toast here
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
  const isNew = true; // You might want to make this dynamic based on product data
  const isOutOfStock = !product.availableForSale;

return (
<div className="group h-full flex flex-col bg-white p-2 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-primary/20">
    <Link href={`/products/${product.handle || product.id}`} className="block flex-1">

      <div className="relative overflow-hidden bg-gray-50 aspect-square rounded-xl">
        <Image
          src={product.img}
          alt={product.title}
          width={500}
          height={500}
          className={`w-full h-full border border-gray-200 object-cover rounded-xl transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'opacity-70' : ''}`}
        />

        {/* Stock status */}
        {isOutOfStock && (
          <div className="absolute top-3 left-3 bg-gray-600 text-white text-xs font-medium px-2 py-1 rounded">
            Out of Stock
          </div>
        )}

        {/* In Stock tag */}
        {!isOutOfStock && !hasSale && (
          <div className="absolute top-3 left-3 bg-black text-white text-xs font-medium px-2 py-1 rounded">
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
            className="flex items-center justify-center rounded-full bg-white p-2 text-gray-700 shadow-md transition-all hover:bg-gray-100 hover:scale-110"
            aria-label="Add to wishlist"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
          </button>

          {!isOutOfStock ? (
            <button 
              onClick={handleAddToCart}
              className="flex items-center justify-center rounded-full bg-white p-2 text-gray-700 shadow-md transition-all hover:bg-gray-100 hover:scale-110 disabled:opacity-70 disabled:cursor-not-allowed"
              aria-label={isAddingToCart ? 'Adding to cart...' : 'Add to cart'}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <svg className="animate-spin h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M3 3h2l3.6 7.59a2 2 0 0 0 1.8 1.18H19a2 2 0 0 0 2-1.5l1-4H6"/>
                </svg>
              )}
            </button>
          ) : (
            <button disabled className="flex items-center justify-center rounded-full bg-gray-200 p-2 text-gray-400 cursor-not-allowed">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                   <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M3 3h2l3.6 7.59a2 2 0 0 0 1.8 1.18H19a2 2 0 0 0 2-1.5l1-4H6"/>
                 </svg>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col text-gray-900">
        <h3 className="text-sm font-medium line-clamp-2 h-10">
          {product.title}
        </h3>

        <div className="mt-1">
          {hasSale ? (
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[var(--color-primary)]">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs line-through text-gray-200">
                {formatPrice(product.originalPrice)}
              </span>
            </div>
          ) : (
            <span className="text-xl font-bold text-[var(--color-primary)]">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

      </div>
    </Link>
  </div>
);

}