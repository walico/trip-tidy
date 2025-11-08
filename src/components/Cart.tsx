"use client";

import { useCart } from '@/contexts/CartContext';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface CartProps {
  onClose?: () => void;
}

export default function Cart({ onClose }: CartProps) {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    itemCount, 
    checkoutUrl, 
    isCartOpen 
  } = useCart();
  
  const cartRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  // Close cart when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    }

    if (isCartOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Reset scroll position when opening
      if (cartRef.current && !hasScrolled.current) {
        cartRef.current.scrollTop = 0;
        hasScrolled.current = true;
      }
    } else {
      hasScrolled.current = false;
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCartOpen, onClose]);

  // Calculate cart totals
  const subtotal: number = items.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/[^0-9.-]+/g, ''));
    return sum + (price * item.quantity);
  }, 0);

  const shipping: number = subtotal > 100 ? 0 : 10; // Free shipping or $10
  const tax: number = subtotal * 0.1; // 10% tax
  const total: number = subtotal + shipping + tax;

  // Clear localStorage if cart is empty
  useEffect(() => {
    if (itemCount === 0 && typeof window !== 'undefined') {
      localStorage.removeItem('cartItems');
      localStorage.removeItem('cartId');
    }
  }, [itemCount]);

  // Clear localStorage if cart is empty
  useEffect(() => {
    if (itemCount === 0 && typeof window !== 'undefined') {
      localStorage.removeItem('cartItems');
      localStorage.removeItem('cartId');
    }
  }, [itemCount]);

  // Empty cart state
  if (itemCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-20 h-20 mb-4 flex items-center justify-center bg-gray-100 rounded-full">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-10 w-10 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link 
          href="/products" 
          className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div 
      ref={cartRef}
      className="h-full flex flex-col bg-white shadow-xl w-full max-w-md mx-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Cart Header */}
      <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">
          Your Cart <span className="text-gray-500">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
        </h2>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          className="text-gray-400 hover:text-gray-500"
          aria-label="Close cart"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-4 py-2 sm:px-6">
        <ul className="divide-y divide-gray-200">
          {items.map((item) => (
            <li key={item.id} className="py-4 flex">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gray-200">
                <Image
                  src={item.image || '/placeholder-product.jpg'}
                  alt={item.title}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover object-center"
                />
              </div>

              <div className="ml-4 flex flex-1 flex-col">
                <div>
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <h3 className="line-clamp-1">{item.title}</h3>
                    <p className="ml-4 whitespace-nowrap">${parseFloat(item.price).toFixed(2)}</p>
                  </div>
                  {/* {item.variantTitle && (
                    <p className="mt-1 text-sm text-gray-500">{item.variantTitle}</p>
                  )} */}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.variantId, item.quantity - 1);
                      }}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-sm w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.variantId, item.quantity + 1);
                      }}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromCart(item.variantId);
                    }}
                    className="font-medium text-red-600 hover:text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Cart Summary */}
      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-gray-600">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="border-t border-gray-200 pt-4 flex justify-between text-base font-medium text-gray-900">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="mt-6">
          {checkoutUrl ? (
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center w-full bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
              </svg>
              Proceed to Checkout
            </a>
          ) : (
            <Link
              href="/checkout"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center w-full bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
              </svg>
              Proceed to Checkout
            </Link>
          )}
          
          <div className="mt-4 space-y-3">
            <Link
              href="/cart"
              onClick={(e) => {
                e.stopPropagation();
                if (onClose) onClose();
              }}
              className="flex items-center justify-center w-full border border-gray-300 bg-white text-gray-800 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              View Full Cart
            </Link>
            <div className="text-center">
              <Link 
                href="/products" 
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
