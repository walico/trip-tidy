'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ProductView from './ProductView';

export default function Page() {
  const params = useParams();
  const router = useRouter();
  
  // Get the product ID safely
  const productId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  
  // If no product ID is available, redirect to 404
  if (!productId) {
    // Using a side effect to handle navigation to avoid hydration issues
    useEffect(() => {
      router.push('/404');
    }, [router]);
    
    // Return a loading state while redirecting
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  return <ProductView productId={productId} />;
}

export const dynamic = 'force-dynamic';