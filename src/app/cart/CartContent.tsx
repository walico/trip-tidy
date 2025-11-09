
'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Minus, Plus } from 'lucide-react';
import { formatPrice } from '@/lib/shopify';
import { Button } from '@/components/ui/button';

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
    product: {
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
      options?: Array<{
        name: string;
        values: string[];
      }>;
    };
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
  const [isChangingVariant, setIsChangingVariant] = useState<Record<string, boolean>>({});
  const { refreshCart } = useCart();

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setIsUpdating(prev => ({ ...prev, [lineId]: true }));
    
    // Find the merchandise ID for the line item
    const lineItem = cart.lines.edges.find(edge => edge.node.id === lineId)?.node;
    if (!lineItem) {
      console.error('Line item not found:', lineId);
      setIsUpdating(prev => ({ ...prev, [lineId]: false }));
      return;
    }

    const merchandiseId = lineItem.merchandise.id;
    
    try {
      console.log('Updating cart:', { merchandiseId, quantity, cartId: cart.id });
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartId: cart.id,
          items: [{ id: merchandiseId, quantity }]
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Cart update failed:', data);
        throw new Error(data.error || 'Failed to update cart');
      }
      
      if (!data.success || !data.cart) {
        console.error('Invalid cart update response:', data);
        throw new Error('Invalid cart update response');
      }
      
      setCart(data.cart);
    } catch (error: any) {
      console.error('Error updating cart:', error);
      // Show error to user using toast or alert
      alert(error.message || 'Failed to update cart quantity');
    } finally {
      setIsUpdating(prev => ({ ...prev, [lineId]: false }));
    }
  };

  const removeItem = async (lineId: string) => {
    setIsUpdating(prev => ({ ...prev, [lineId]: true }));
    
    // Find the line item to remove
    const lineItem = cart.lines.edges.find(edge => edge.node.id === lineId)?.node;
    if (!lineItem) {
      console.error('Line item not found:', lineId);
      setIsUpdating(prev => ({ ...prev, [lineId]: false }));
      return;
    }
    
    try {
      console.log('Removing item:', { lineId, cartId: cart.id });
      const response = await fetch(`/api/cart?cartId=${encodeURIComponent(cart.id)}&lineId=${encodeURIComponent(lineId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Remove item failed:', data);
        throw new Error(data.error || 'Failed to remove item');
      }
      
      if (!data.success || !data.cart) {
        console.error('Invalid remove item response:', data);
        throw new Error('Invalid remove item response');
      }
      
      // Update the cart state
      setCart(data.cart);
      
      // Refresh the cart context to update the cart count
      await refreshCart();
      
      // If this was the last item, clear localStorage
      if (data.cart.lines.edges.length === 0 && typeof window !== 'undefined') {
        localStorage.removeItem('cartItems');
        localStorage.removeItem('cartId');
      }
    } catch (error: any) {
      console.error('Error removing item:', error);
      alert(error.message || 'Failed to remove item');
    } finally {
      setIsUpdating(prev => ({ ...prev, [lineId]: false }));
    }
  };

  return (
 <div className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
  <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center lg:text-left">Your Cart</h1>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    
    {/* Cart Items */}
    <div className="lg:col-span-2 space-y-6">
      {cart.lines.edges.map(({ node: item }) => (
        <div key={item.id} className="bg-white transition-shadow flex flex-col md:flex-row p-4 md:p-6 border-b border-gray-100">
          
          {/* Product Image */}
          <div className="relative w-full md:w-1/4 h-32 md:h-36 shrink-0 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={item.merchandise.product.images?.edges[0]?.node.url || '/placeholder-product.jpg'}
              alt={item.merchandise.product.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="flex-1 md:pl-6 flex flex-col justify-between mt-4 md:mt-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                <Link href={`/products/${item.merchandise.product.handle}`} className="hover:underline">
                  {item.merchandise.product.title}
                </Link>
              </h3>
              {item.merchandise.selectedOptions && (
                <ul className="mt-1 text-sm text-gray-600 space-y-1">
                  {item.merchandise.selectedOptions.map((opt) => (
                    <li key={opt.name}>{opt.name}: {opt.value}</li>
                  ))}
                </ul>
              )}
              <p className="text-gray-800 font-medium mt-2">
                {formatPrice(item.merchandise.priceV2.amount, item.merchandise.priceV2.currencyCode)}
                {item.quantity > 1 && (
                  <span className="text-gray-500 ml-2">
                    ({(parseFloat(item.merchandise.priceV2.amount) * item.quantity).toFixed(2)})
                  </span>
                )}
              </p>
            </div>

            {/* Quantity + Remove */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center border rounded-md overflow-hidden">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={isUpdating[item.id] || item.quantity <= 1}
                  className="px-3 py-1 hover:bg-gray-100 disabled:opacity-30 cursor-pointer text-gray-600"
                >−</button>
                <span className="px-3 py-1 w-10 text-center text-gray-600">{isUpdating[item.id] ? '...' : item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={isUpdating[item.id]}
                  className="px-3 py-1 hover:bg-gray-100 cursor-pointer text-gray-600"
                >+</button>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                disabled={isUpdating[item.id]}
                className="text-sm text-gray-500 hover:text-red-600 flex items-center cursor-pointer"
              >
                <Trash2 size={16} className="mr-1" />
              </button>
            </div>
          </div>

        </div>
      ))}
    </div>

    {/* Order Summary */}
    <div>
      <div className="bg-gray-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-600 mb-4">Order Summary</h2>
        <div className="space-y-4">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}</span>
          </div>
          <div className="border-t pt-4 font-medium flex justify-between text-gray-800">
            <span>Total</span>
            <span>{formatPrice(cart.cost.totalAmount.amount, cart.cost.totalAmount.currencyCode)}</span>
          </div>

          <a
            href={cart.checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full mt-4 bg-[#be7960cc] text-white py-3 rounded-lg text-center font-medium transition-colors hover:bg-[#be7960cc]/80"
          >
            Proceed to Checkout
          </a>


          <p className="text-xs text-gray-500 mt-2 text-center">Shipping and taxes calculated at checkout.</p>

          <div className="mt-4 text-center">
            <Link href="/products" className="text-sm text-gray-600 hover:underline">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>

  </div>
</div>

  );
}
