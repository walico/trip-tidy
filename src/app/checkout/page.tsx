"use client";

import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { isShopifyConfigured } from '@/lib/shopify';

export default function CheckoutPage() {
  const { items, cartId, checkoutUrl, isLoading, syncWithShopify } = useCart();
  const router = useRouter();
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  // Auto-redirect to Shopify checkout if we have the checkout URL
  useEffect(() => {
    if (checkoutUrl) {
      console.log('Redirecting to Shopify checkout:', checkoutUrl);
      window.location.href = checkoutUrl;
    }
  }, [checkoutUrl]);

  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('$', ''));
    return sum + (price * item.quantity);
  }, 0);

  const shipping: number = 0; // Free shipping for demo
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('No items in cart');
      return;
    }

    setIsCreatingCheckout(true);

    try {
      // First, ensure cart is properly synced with Shopify
      console.log('Starting cart sync...');
      console.log('Current items:', items.map(item => ({
        id: item.id,
        title: item.title,
        merchandiseId: item.merchandiseId,
        quantity: item.quantity
      })));

      await syncWithShopify();

      // Check if we now have a cart ID
      if (!cartId) {
        console.error('Cart sync failed - no cart ID');
        toast.error('Failed to synchronize cart with Shopify. Please try again.');
        return;
      }

      console.log('Cart synced successfully, cart ID:', cartId);

      // If we have a cart ID, use Shopify checkout
      if (cartId) {
        // Create checkout
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
cartId: cartId,
          }),
        });

        const result = await response.json();
        console.log('Checkout creation response:', result);

        if (result.success) {
          console.log('Redirecting to Shopify checkout:', result.data.checkoutUrl);
          // Redirect to Shopify's hosted checkout
          window.location.href = result.data.checkoutUrl;
        } else {
          console.error('Checkout creation failed:', result.error);
          toast.error(result.error || 'Failed to create checkout');
        }
      }
    } catch (error) {
      console.error('Error in checkout process:', error);
      toast.error('Failed to create checkout. Please try again.');
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6.5-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Add some items to get started with your order</p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#be7960] to-[#a66b53] text-white font-medium rounded-lg hover:from-[#a66b53] hover:to-[#8f5d46] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if Shopify is configured
  if (!isShopifyConfigured()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Shopify Integration Required</h2>
            <p className="text-gray-600 mb-4">
              To process payments and manage orders, you need to configure your Shopify store.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
              <p className="text-sm text-gray-700 mb-2">Add these environment variables to your <code>.env.local</code> file:</p>
              <div className="font-mono text-xs bg-white p-2 rounded border">
                NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com<br />
                NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_access_token
              </div>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Checkout</h1>
          <p className="text-gray-600">Complete your purchase with our secure payment system</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#be7960] to-[#a66b53] px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Order Summary
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-lg shadow-sm"
                        />
                        <div className="absolute -top-2 -right-2 bg-[#be7960] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Contact Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be7960] focus:border-transparent transition-colors bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-gray-800">
                    Shopify integration is now mandatory. You'll be redirected to Shopify's secure checkout page to complete your purchase with your preferred payment method.
                  </p>
                </div>
              </div>
            </div>

            {/* Debug Information */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-2">Debug Information:</p>
                <p className="text-blue-800">Environment: Production (Development mode is no longer supported)</p>
<p className="text-blue-800">Cart ID: {cartId || 'Not synchronized'}</p>
                <p className="text-blue-800">Items in cart: {items.length}</p>
                {items.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-blue-900">Cart Items:</p>
                    {items.map((item, index) => (
                      <div key={index} className="text-xs text-blue-800 ml-2">
                        • {item.title} - ID: {item.id.substring(0, 50)}... - MerchandiseID: {item.merchandiseId?.substring(0, 50) || 'Not set'} (Shopify integration is mandatory)
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Order Summary Sidebar */}
              <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({items.length})</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-[#be7960]">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Manual Sync Button */}
                <button
                  onClick={syncWithShopify}
                  disabled={isLoading || items.length === 0}
                  className={`w-full py-2 px-4 mt-4 text-sm font-medium rounded-lg border transition-colors ${
                    isLoading
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-[#be7960] border-[#be7960] hover:bg-[#be7960] hover:text-white'
                  }`}
                >
                  {isLoading ? 'Syncing...' : 'Sync with Shopify'}
                </button>

                <button
                  onClick={handleCheckout}
disabled={isCreatingCheckout || isLoading || !cartId}
                  className={`w-full py-4 px-6 mt-6 bg-gradient-to-r from-[#be7960] to-[#a66b53] text-white font-semibold rounded-lg hover:from-[#a66b53] hover:to-[#8f5d46] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#be7960] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                    isCreatingCheckout ? 'animate-pulse' : ''
                  }`}
                >
                  {isCreatingCheckout ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Checkout...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Proceed to Payment
                    </div>
                  )}
                </button>

                <div className="mt-4 text-center">
                  <div className="flex items-center justify-center text-xs text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Secure SSL Encrypted
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Security & Privacy
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    SSL encrypted checkout
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    PCI compliant payment processing
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Your data is protected
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
