'use client';

import dynamic from 'next/dynamic';
import { Product } from '@/lib/types';

interface ProductClientWrapperProps {
  initialProduct: Product | null;
  productId: string;
}

const ProductPageContent = dynamic(
  () => import('./ProductPageContent'),
  { ssr: false }
);

export default function ProductClientWrapper({ initialProduct, productId }: ProductClientWrapperProps) {
  return <ProductPageContent initialProduct={initialProduct} productId={productId} />;
}
