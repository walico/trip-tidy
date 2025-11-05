'use client';

import { useState } from 'react';
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
    price: {
      amount: string;
      currencyCode: string;
    };
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

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setIsUpdating(prev => ({ ...prev, [lineId]: true }));
    
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartId: cart.id,
          updates: [{ id: lineId, quantity }]
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update cart');
      }
      
      const data = await response.json();
      setCart(data.cart);
    } catch (error) {
      console.error('Error updating cart:', error);
      // Optionally show error to user
    } finally {
      setIsUpdating(prev => ({ ...prev, [lineId]: false }));
    }
  };

  const removeItem = async (lineId: string) => {
    setIsUpdating(prev => ({ ...prev, [lineId]: true }));
    
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartId: cart.id,
          lineIds: [lineId]
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove item');
      }
      
      const data = await response.json();
      setCart(data.cart);
    } catch (error) {
      console.error('Error removing item:', error);
      // Optionally show error to user
    } finally {
      setIsUpdating(prev => ({ ...prev, [lineId]: false }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {cart.lines.edges.map(({ node: item }: any) => (
            <div key={item.id} className="flex flex-col md:flex-row border-b py-6">
              <div className="w-full md:w-1/3 lg:w-1/4 mb-4 md:mb-0">
                <div className="relative aspect-square">
                  <Image
                    src={item.merchandise.product.images?.edges[0]?.node.url || '/placeholder-product.jpg'}
                    alt={item.merchandise.product.images?.edges[0]?.node.altText || item.merchandise.product.title}
                    fill
                    className="object-cover rounded"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>
              
              <div className="flex-1 md:pl-6">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">
                      <Link href={`/products/${item.merchandise.product.handle}`}>
                        {item.merchandise.product.title}
                      </Link>
                    </h3>
                    {item.merchandise.title !== 'Default Title' && (
                      <p className="text-sm text-gray-600 mt-1">
                        {item.merchandise.title}
                      </p>
                    )}
                    <p className="text-lg font-medium mt-2">
                      {formatPrice(item.merchandise.price.amount, item.merchandise.price.currencyCode)}
                      {item.quantity > 1 && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({(parseFloat(item.merchandise.price.amount) * item.quantity).toFixed(2)} {item.merchandise.price.currencyCode})
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors h-6"
                    disabled={isUpdating[item.id]}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                
                <div className="flex items-center mt-4">
                  <div className="flex items-center border rounded-md">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-8 w-8 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                      disabled={isUpdating[item.id]}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center">
                      {isUpdating[item.id] ? '...' : item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                      disabled={isUpdating[item.id]}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="lg:pl-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}</span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(cart.cost.totalAmount.amount, cart.cost.totalAmount.currencyCode)}</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Button
                  className="w-full bg-black hover:bg-gray-800"
                  asChild
                >
                  <a href={cart.checkoutUrl} className="block text-center">
                    Proceed to Checkout
                  </a>
                </Button>
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Shipping and taxes calculated at checkout.
                </p>
                
                <div className="mt-6 text-center">
                  <Link href="/products" className="text-sm text-gray-600 hover:underline">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
