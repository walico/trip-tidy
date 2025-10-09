"use client";

import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, itemCount } = useCart();
  const subtotal: number = items.reduce((sum: number, item) => {
    const price: number = parseFloat(item.price.replace(/[^0-9.-]+/g, ''));
    return sum + (price * item.quantity);
  }, 0);

  const shipping: number = 0; // Free shipping
  const tax: number = subtotal * 0.1; // 10% tax
  const total: number = subtotal + shipping + tax;

  if (itemCount === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty</p>
        <Link 
          href="/products" 
          className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-container w-[380px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
      {/* Cart Header */}
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-medium">Shopping Cart ({itemCount})</h2>
      </div>
      
      {/* Cart Items */}
      <div className="max-h-[60vh] overflow-y-auto divide-y">
        {items.map((item) => (
          <div key={item.id} className="p-4 flex gap-4 hover:bg-gray-50">
            {/* Product Image */}
            <div className="relative w-15 h-15 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
              <Image
                src={item.img}
                alt={item.title}
                fill
                className="object-cover"
                sizes="60px"
              />
            </div>
            
            {/* Product Info */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-lg text-gray-900">{item.title}</h3>
              </div>
              <div className="mt-0.5 text-xs text-gray-500">Color: Black</div>
              <div className=" text-xs text-gray-500">Size: M</div>
              
              <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromCart(item.id);
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Remove item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
            </div>
            
            {/* Price */}
            <div className="text-right">
              <div className="font-medium">${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}</div>
              {/* <div className="text-sm text-gray-500">${item.price} each</div> */}
               {/* Quantity Selector */}
               <div className="mt-3 flex items-center">
                <div className="flex items-center border rounded-md">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQuantity(item.id, Math.max(1, item.quantity - 1));
                    }}
                    className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm">
                    {item.quantity}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQuantity(item.id, item.quantity + 1);
                    }}
                    className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Order Summary */}
      <div className="border-t p-6">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="border-t pt-3 flex justify-between font-medium">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        
        <Link
          href="/checkout"
          onClick={(e) => e.stopPropagation()}
          className="mt-6 block w-full bg-[var(--color-primary)] text-white text-center py-3 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          Proceed to Checkout
        </Link>
        
        <div className="mt-4 text-center">
          <Link 
            href="/products" 
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
