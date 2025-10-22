"use client";

import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';

interface CartProps {
  onClose?: () => void;
}

export default function Cart({ onClose }: CartProps) {
  const { items, removeFromCart, updateQuantity, itemCount, checkoutUrl } = useCart();
  const subtotal: number = items.reduce((sum: number, item) => {
    const price: number = parseFloat(item.price.replace(/[^0-9.-]+/g, ''));
    return sum + (price * item.quantity);
  }, 0);

  const shipping: number = 0; // Free shipping
  const tax: number = subtotal * 0.1; // 10% tax
  const total: number = subtotal + shipping + tax;

  if (itemCount === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-500 mb-6">Looks like you haven&apos;t added anything to your cart yet.</p>
        <Link 
          href="/products" 
          className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-container w-[400px] max-w-[95vw] bg-white shadow-xl rounded-lg overflow-hidden flex flex-col h-[90vh] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
      {/* Cart Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Your Cart <span className="text-gray-500 text-base font-normal">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span></h2>
        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 -mr-2 text-gray-400 hover:text-gray-500 transition-colors rounded-full hover:bg-gray-100"
            aria-label="Close cart"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
        {items.map((item) => (
          <div key={item.id} className="p-4 flex gap-4 hover:bg-gray-50 transition-colors duration-150">
            {/* Product Image */}
            <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                sizes="60px"
              />
            </div>
            
            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900 truncate pr-2">{item.title}</h3>
                
              </div>
              <div className=" text-xs text-gray-500">Color: Black</div>
              <div className="text-xs text-gray-500 ">Size: M</div>
              <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromCart(item.variantId);
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1  -mr-2"
                  aria-label="Remove item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
            </div>
            
            {/* Price and Quantity */}
            <div className="flex flex-col items-end">
              <div className="font-medium text-gray-900">${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}</div>
              <div className="text-xs text-gray-500 mb-2">${parseFloat(item.price.replace('$', '')).toFixed(2)} each</div>
              
              {/* Quantity Selector */}
              <div className="mt-1">
                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQuantity(item.variantId, Math.max(1, item.quantity - 1));
                    }}
                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-gray-700">
                    {item.quantity}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQuantity(item.variantId, item.quantity + 1);
                    }}
                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Order Summary */}
      <div className="border-t border-gray-200 bg-gray-50 p-6">
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
          
          <div className="mt-4 text-center">
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
  );
}
