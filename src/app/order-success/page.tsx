"use client";

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

export default function OrderSuccessPage() {
  const router = useRouter();
  const { clearCart } = useCart();

  // Clear cart and redirect to home if user directly accesses this page without completing checkout
  useEffect(() => {
    // Clear the cart since the order was successful
    clearCart();

    const timer = setTimeout(() => {
      router.push('/');
    }, 10000); // Redirect after 10 seconds

    return () => clearTimeout(timer);
  }, [router, clearCart]);

  return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-12 h-12 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your order has been received and is being processed.
          You will receive an email confirmation shortly.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/"
            className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-md hover:bg-[var(--color-primary)]/90 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/products"
            className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          You will be redirected to the homepage in 10 seconds...
        </p>
      </div>
    </div>
  );
}
