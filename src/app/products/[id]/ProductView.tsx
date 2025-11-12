'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductDetailContent from './ProductDetailContent';
import { Product, ProductVariant } from '@/lib/types';
import { shopifyClient, GET_PRODUCT_QUERY } from '@/lib/shopify';

async function fetchProduct(handle: string): Promise<Product | null> {
  if (!shopifyClient) {
    return null;
  }

  try {
    const { data, errors } = await shopifyClient.request<{ product: any }>(GET_PRODUCT_QUERY, {
      variables: { handle }
    });

    if (!data?.product) {
      return null;
    }

    const { product: productData } = data;
    const variants = (productData.variants?.edges?.map((edge: { node: ProductVariant }) => edge.node) || []) as ProductVariant[];
    const firstVariant = variants[0] as ProductVariant | undefined;

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
    return null;
  }
}

export default function ProductView({ productId }: { productId: string }) {
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await fetchProduct(productId);
        if (!data) {
          throw new Error('Product not found');
        }
        setProduct(data);
      } catch (error) {
        router.push('/404');
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [productId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Link href="/products" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors">
          Back to Products
        </Link>
      </div>
    );
  }

  const productWithDefaults: Product = {
    ...product,
    selectedOptions: product.selectedOptions || {},
    selectedVariant: product.selectedVariant || undefined,
    images: product.images || [],
    variants: product.variants || [],
    options: product.options || [],
    priceRange: product.priceRange || {
      minVariantPrice: { amount: '0', currencyCode: 'USD' },
      maxVariantPrice: { amount: '0', currencyCode: 'USD' }
    } as const,
    variantId: product.variantId || '',
    merchandiseId: product.merchandiseId || ''
  };

  return <ProductDetailContent product={productWithDefaults} />;
}
