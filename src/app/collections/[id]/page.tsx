"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ChevronRight } from 'lucide-react';
import TopProducts from '@/components/TopProducts';
import Footer from '@/components/Footer';
import Newsletter from '@/components/Newsletter';
import ProductCard from '@/components/ProductCard';
import { shopifyClient, GET_COLLECTION_QUERY, formatPrice, getProductImage, getProductPrice, getProductOriginalPrice } from '@/lib/shopify';

// Define product type
interface Product {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  rating: number;
  reviewCount: number;
  image: string;
  handle: string;
  variantId: string;
  merchandiseId: string;
  availableForSale?: boolean;
}

interface Collection {
  id: string;
  title: string;
  description: string;
  handle: string;
  image: string;
  products: Product[];
}

export default function CollectionDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { addToCart } = useCart();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch collection and products on mount
  useEffect(() => {
    async function loadCollection() {
      if (!shopifyClient) {
        setError('Shopify client not configured');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data } = await shopifyClient.request(GET_COLLECTION_QUERY, { variables: { handle: id } });

        if (!data.collection) {
          setError('Collection not found');
          return;
        }

        const collectionData = data.collection;
        const products = collectionData.products.edges.map((edge: any) => {
          const product = edge.node;
          const firstVariant = product.variants?.edges?.[0]?.node;

          console.log('Collection product data:', {
            productId: product.id,
            firstVariant: firstVariant,
            variantsCount: product.variants?.edges?.length || 0
          });

          // Ensure we have a valid Shopify variant ID
          let variantId = firstVariant?.id;
          let merchandiseId = firstVariant?.id;

          // If no variant ID, use product ID as fallback (for debugging)
          if (!variantId || !variantId.startsWith('gid://shopify/')) {
            console.warn('No valid variant ID found, using product ID as fallback');
            variantId = product.id;
            merchandiseId = product.id;
          }

          return {
            id: product.id,
            title: product.title,
            price: getProductPrice(product),
            originalPrice: getProductOriginalPrice(product),
            rating: 4.5, // Default rating
            reviewCount: 0, // Default review count
            image: getProductImage(product),
            handle: product.handle,
            variantId: variantId,
            merchandiseId: merchandiseId,
          };
        });

        setCollection({
          id: collectionData.id,
          title: collectionData.title,
          description: collectionData.description,
          handle: collectionData.handle,
          image: collectionData.image?.url || '',
          products,
        });
      } catch (err) {
        console.error('Error fetching collection:', err);
        setError('Failed to load collection');
      } finally {
        setLoading(false);
      }
    }

    loadCollection();
  }, [id]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      merchandiseId: product.merchandiseId,
      variantId: product.variantId,
      productId: product.id
    });
  };

  if (loading) {
    return (
      <main className="bg-white">
        <div className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Loading Collection...
            </h1>
          </div>
        </div>
      </main>
    );
  }

  if (error || !collection) {
    return (
      <main className="bg-white">
        <div className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-red-600 sm:text-5xl md:text-6xl">
              {error || 'Collection not found'}
            </h1>
          </div>
        </div>
      </main>
    );
  }

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
            <ProductCard 
              key={product.id}
              product={{
                ...product,
                image: product.image,
                availableForSale: product.availableForSale ?? true
              }}
            />
          ))}
        </div>
      </div>

      <TopProducts />
      <Newsletter />
      <Footer />
    </main>
  );
}

