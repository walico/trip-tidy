'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Minus, Plus } from 'lucide-react';
import { formatPrice } from '@/lib/shopify';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  title: string;
  handle: string;
  images?: {
    edges: Array<{
      node: {
        url: string;
        altText?: string | null;
      };
    }>;
  };
}

interface CartItem {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    priceV2: {
      amount: string;
      currencyCode: string;
    };
    selectedOptions?: Array<{
      name: string;
      value: string;
    }>;
    product: Product;
  };
}

interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
  lines: {
    edges: Array<{
      node: CartItem;
    }>;
  };
}

interface CartContentProps {
  cart: Cart;
}

export default function CartContent({ cart: initialCart }: CartContentProps) {
  const [cart, setCart] = useState(initialCart);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const { refreshCart } = useCart();

  // Update the cart count in the NavBar when cart changes
  useEffect(() => {
    // This will trigger a re-render of the NavBar with the correct cart count
    const cartCount = cart?.totalQuantity || 0;
    const cartBadge = document.querySelector('[aria-label^="Cart ("]');
    if (cartBadge) {
      cartBadge.setAttribute('aria-label', `Cart (${cartCount})`);
    }
  }, [cart?.totalQuantity]);

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setIsUpdating(prev => ({ ...prev, [lineId]: true }));
    
    const lineItem = cart.lines.edges.find(edge => edge.node.id === lineId)?.node;
    if (!lineItem) {
      setIsUpdating(prev => ({ ...prev, [lineId]: false }));
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: cart.id,
          items: [{ id: lineItem.merchandise.id, quantity }]
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update cart');
      if (!data.success || !data.cart) throw new Error('Invalid cart update response');

      setCart(data.cart);
    } catch (error: any) {
      alert(error.message || 'Failed to update cart quantity');
    } finally {
      setIsUpdating(prev => ({ ...prev, [lineId]: false }));
    }
  };

  const removeItem = async (lineId: string) => {
    setIsUpdating(prev => ({ ...prev, [lineId]: true }));

    try {
      const response = await fetch(
        `/api/cart?cartId=${encodeURIComponent(cart.id)}&lineId=${encodeURIComponent(lineId)}`,
        { method: 'DELETE', headers: { 'Content-Type': 'application/json' } }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to remove item');
      if (!data.success || !data.cart) throw new Error('Invalid remove item response');

      setCart(data.cart);
      await refreshCart();

      if (data.cart.lines.edges.length === 0 && typeof window !== 'undefined') {
        localStorage.removeItem('cartItems');
        localStorage.removeItem('cartId');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to remove item');
    } finally {
      setIsUpdating(prev => ({ ...prev, [lineId]: false }));
    }
  };

  if (!cart) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <p>Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <Toaster position="top-right" />
      <div className="max-w-2xl mx-auto pt-16 pb-24 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-8">
          {cart.lines.edges.length === 0 ? 'Your Cart' : `Shopping Cart`}
        </h1>
        
        {cart.lines.edges.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
            <div className="lg:col-span-7">
              {cart.lines.edges.map(({ node }) => {
                const item = node.merchandise;
                const product = item.product;
                const image = product.images?.edges[0]?.node.url || '/placeholder-product.jpg';
                const isLoading = isUpdating[node.id] || false;

                return (
                  <div key={node.id} className="flex items-stretch py-4 border-b">
                    {/* Image */}
                    <div className="w-28 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                      <Image
                        src={image}
                        alt={product.title}
                        width={112}
                        height={112}
                        priority
                        className="object-cover w-full h-full"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="ml-4 flex flex-col justify-between flex-1">
                      {/* Top: Title & Price */}
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-gray-900">
                          <Link href={`/products/${product.handle}`} className="hover:underline">
                            {product.title}
                          </Link>
                        </h3>
                        <div className="text-sm font-semibold text-gray-900">
                          {formatPrice(item.priceV2.amount, item.priceV2.currencyCode)}
                        </div>
                      </div>
                      
                      {/* Display variant name */}
                      {item.title !== 'Default Title' && (
                        <div className="mt-1 text-sm text-gray-500">
                          {item.title}
                        </div>
                      )}


                      {/* Bottom: Quantity & Remove Button */}
                      <div className="mt-3 flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => updateQuantity(node.id, node.quantity - 1)}
                            disabled={node.quantity <= 1}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-3 py-1 text-sm text-gray-900">{node.quantity}</span>
                          <button
                            onClick={() => updateQuantity(node.id, node.quantity + 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100 cursor-pointer"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <div className="flex items-center">
                          <button
                            onClick={() => removeItem(node.id)}
                            className="text-sm text-red-600 hover:text-red-800 flex items-center cursor-pointer"
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </button>

                          {isLoading && (
                            <div className="ml-2 h-4 w-4 border-2 border-t-transparent border-gray-500 rounded-full animate-spin"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-5">
              <div className="bg-gray-50 rounded-lg p-6 mt-8 lg:mt-0">
                <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
                
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <p className="text-base font-medium text-gray-900">Total</p>
                    <p className="text-base font-medium text-gray-900">
                      {formatPrice(cart.cost.totalAmount.amount, cart.cost.totalAmount.currencyCode)}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <a
                    href={cart.checkoutUrl}
                    target='_blank'
                    className="w-full bg-gray-900 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500 flex items-center justify-center"
                  >
                    Proceed to Checkout
                  </a>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    or{' '}
                    <Link href="/products" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Continue Shopping
                      <span aria-hidden="true"> &rarr;</span>
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
