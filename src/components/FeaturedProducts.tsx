"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import { 
  getProductImage, 
  getProductPrice, 
  getProductOriginalPrice,
  fetchProducts,
  isShopifyConfigured
} from '@/lib/shopify';
import ProductCard from './ProductCard';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      if (!isShopifyConfigured()) {
        setError('Shopify is not properly configured. Please check your environment variables.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching products from Shopify...');
        
        const shopifyProducts = await fetchProducts(8); // Get 8 featured products
        
        console.log('Fetched products:', {
          count: shopifyProducts.length,
          firstProduct: shopifyProducts[0]?.title
        });

        if (!shopifyProducts.length) {
          console.warn('No products found in Shopify');
          setProducts([]);
          return;
        }

        // Process products to match your Product type
        const processedProducts = shopifyProducts.map((product: any) => {
          const firstVariant = product.variants?.edges?.[0]?.node;
          const createdAt = product.createdAt || product.publishedAt || new Date().toISOString();
          
          return {
            id: product.id,
            title: product.title,
            price: getProductPrice(product),
            originalPrice: getProductOriginalPrice(product),
            img: getProductImage(product),
            handle: product.handle,
            variantId: firstVariant?.id || product.id,
            merchandiseId: firstVariant?.id || product.id,
            rating: 4.5, // Default rating
            reviewCount: 0, // Default review count
            availableForSale: product.availableForSale !== false,
            createdAt: new Date(createdAt).getTime(),
            rawCreatedAt: product.createdAt || product.publishedAt
          };
        });

        // Sort by creation date (newest first)
        const sortedProducts = [...processedProducts].sort((a, b) => 
          (b.createdAt || 0) - (a.createdAt || 0)
        );

        // Filter available products and limit to 8
        const availableProducts = sortedProducts
          .filter((product) => product.availableForSale)
          .slice(0, 8);

        setProducts(availableProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-square bg-gray-200 rounded"></div>
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

        <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={{
                ...product,
                image: product.img || '',
                availableForSale: product.availableForSale ?? true
              }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}