"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import { formatPrice, getProductImage, getProductPrice, getProductOriginalPrice } from '@/lib/shopify';
import ProductCard from './ProductCard';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products...');
        const response = await fetch('/api/products?limit=20');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch products');
        }

        console.log('Raw API response:', {
          productCount: data.data?.edges?.length || 0,
          firstProduct: data.data?.edges?.[0]?.node?.title
        });

        if (!data.data?.edges?.length) {
          console.warn('No products found in the API response');
          setProducts([]);
          return;
        }

        // Process and sort products
        const now = Date.now();
        const processedProducts = data.data.edges
          .map((edge: any) => {
            const product = edge.node;
            const firstVariant = product.variants?.edges?.[0]?.node;
            
            // Log raw product data for debugging
            console.log('Processing product:', {
              title: product.title,
              id: product.id,
              createdAt: product.createdAt,
              publishedAt: product.publishedAt,
              availableForSale: product.availableForSale,
              variantsCount: product.variants?.edges?.length || 0
            });

            // Parse dates with fallbacks
            const createdAt = new Date(
              product.createdAt || 
              product.publishedAt || 
              product.updatedAt || 
              new Date(now - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString() // Fallback: random date in last 30 days
            );

            return {
              id: product.id,
              title: product.title,
              price: getProductPrice(product),
              originalPrice: getProductOriginalPrice(product),
              img: getProductImage(product),
              handle: product.handle,
              variantId: firstVariant?.id || product.id,
              merchandiseId: firstVariant?.id || product.id,
              rating: 4.5,
              reviewCount: 0,
              availableForSale: product.availableForSale !== false, // Default to true if undefined
              createdAt: createdAt.getTime(),
              rawCreatedAt: product.createdAt || product.publishedAt
            };
          })
          // Sort by creation date (newest first), with fallback to 0 if createdAt is undefined
          .sort((a: Product, b: Product) => (b.createdAt || 0) - (a.createdAt || 0));

        // Log sorted products
        console.log('Sorted products:', processedProducts.map((p: Product) => ({
          title: p.title,
          date: p.createdAt ? new Date(p.createdAt).toISOString() : 'N/A',
          available: p.availableForSale
        })));

        // Filter available products and limit to 8
        const availableProducts = processedProducts
          .filter((product: Product) => product.availableForSale)
          .slice(0, 8);

        console.log('Final available products:', availableProducts.map((p: Product) => ({
          title: p.title,
          date: p.createdAt ? new Date(p.createdAt).toISOString() : 'N/A'
        })));

        setProducts(availableProducts);
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