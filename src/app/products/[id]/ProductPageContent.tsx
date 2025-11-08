'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductDetailContent from './ProductDetailContent';
import { Product } from '@/lib/types';

interface ProductPageContentProps {
  initialProduct: Product | null;
  productId: string;
}

export default function ProductPageContent({ initialProduct, productId }: ProductPageContentProps) {
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [isLoading, setIsLoading] = useState(!initialProduct);
  const router = useRouter();

  useEffect(() => {
    async function fetchProductData() {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        router.push('/404');
      } finally {
        setIsLoading(false);
      }
    }

    if (!initialProduct) {
      fetchProductData();
    }
  }, [productId, initialProduct, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return <ProductDetailContent product={product} />;
}
