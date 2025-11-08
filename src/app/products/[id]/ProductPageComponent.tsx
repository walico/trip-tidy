'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductDetailContent from './ProductDetailContent';
import { Product } from '@/lib/types';
import { shopifyClient, GET_PRODUCT_QUERY } from '@/lib/shopify';

async function fetchProduct(handle: string): Promise<Product | null> {
  if (!shopifyClient) return null;

  try {
    const { data } = await (shopifyClient as any).request(GET_PRODUCT_QUERY, {
      variables: { handle }
    });

    if (!data?.product) return null;

    const { product: productData } = data;
    const variants = productData.variants?.edges?.map((edge: any) => edge.node) || [];
    const firstVariant = variants[0];

    return {
      id: productData.id,
      title: productData.title,
      description: productData.description || 'No description available',
      handle: productData.handle,
      availableForSale: firstVariant?.availableForSale || false,
      price: firstVariant?.price?.amount || '0',
      originalPrice: firstVariant?.compareAtPrice?.amount || firstVariant?.price?.amount || '0',
      priceRange: {
        minVariantPrice: {
          amount: Math.min(...variants.map((v: any) => parseFloat(v.price.amount))).toString(),
          currencyCode: firstVariant?.price?.currencyCode || 'USD'
        },
        maxVariantPrice: {
          amount: Math.max(...variants.map((v: any) => parseFloat(v.price.amount))).toString(),
          currencyCode: firstVariant?.price?.currencyCode || 'USD'
        }
      },
      options: productData.options?.map((option: any) => ({
        id: option.id,
        name: option.name,
        values: option.values
      })) || [],
      images: productData.images?.edges?.map((edge: any) => ({
        url: edge.node.originalSrc,
        altText: edge.node.altText || productData.title
      })) || [],
      variants: variants.map((variant: any) => ({
        id: variant.id,
        title: variant.title,
        availableForSale: variant.availableForSale,
        selectedOptions: variant.selectedOptions,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        image: variant.image,
        quantityAvailable: variant.quantityAvailable
      })),
      variantId: firstVariant?.id || productData.id,
      merchandiseId: firstVariant?.id || productData.id,
      selectedVariant: variants[0],
      selectedOptions: firstVariant?.selectedOptions?.reduce((acc: any, option: any) => ({
        ...acc,
        [option.name]: option.value
      }), {}) || {}
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default function ProductPage({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await fetchProduct(id);
        if (!data) {
          throw new Error('Product not found');
        }
        setProduct(data);
      } catch (error) {
        console.error('Error loading product:', error);
        router.push('/404');
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return null; // Router will handle the 404
  }

  return <ProductDetailContent product={product} />;
}
