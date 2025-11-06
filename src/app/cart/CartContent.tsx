
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
      
      setCart(data.cart);
    } catch (error: any) {
      console.error('Error removing item:', error);
      alert(error.message || 'Failed to remove item');
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
                  {isChangingVariant[item.id] ? (
                    <div className="absolute inset-0 bg-gray-100 rounded flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  ) : (
                    <Image
                      src={
                        // Try to find the matching variant's image
                        item.merchandise.product.variants?.edges.find(
                          (edge: { node: { id: string } }) => edge.node.id === item.merchandise.id
                        )?.node.image?.url ||
                        // Fall back to the first product image
                        item.merchandise.product.images?.edges[0]?.node.url ||
                        '/placeholder-product.jpg'
                      }
                      alt={
                        item.merchandise.product.variants?.edges.find(
                          (edge: { node: { id: string } }) => edge.node.id === item.merchandise.id
                        )?.node.image?.altText ||
                        item.merchandise.product.images?.edges[0]?.node.altText ||
                        item.merchandise.product.title
                      }
                      fill
                      className="object-cover rounded"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  )}
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
                    {item.merchandise.product.options && item.merchandise.product.options.length > 0 && item.merchandise.product.variants?.edges.length > 0 ? (
                      <div className="space-y-3 mt-2">
                        {item.merchandise.product.options.map((option: { name: string; values: string[] }) => (
                          <div key={`${option.name}-${option.values.join('-')}`} className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">
                              {option.name}
                            </label>
                            <select
                              value={item.merchandise.selectedOptions?.find((opt: { name: string; value: string }) => opt.name === option.name)?.value || option.values[0] || ''}
                              onChange={async (e) => {
                                try {
                                  // Initialize base selected options from current variant or create new array
                                  const currentSelectedOptions = item.merchandise.selectedOptions || 
                                    item.merchandise.product.options.map((opt: { name: string; values: string[] }) => ({
                                      name: opt.name,
                                      value: opt.values[0]
                                    }));

                                  // Create new selected options with the changed value
                                  const newSelectedOptions = currentSelectedOptions.map((opt: { name: string; value: string }) => 
                                    opt.name === option.name 
                                      ? { ...opt, value: e.target.value }
                                      : opt
                                  );

                                  // Find the variant that matches all selected options
                                  const newVariant = item.merchandise.product.variants?.edges.find(({ node }: { node: any }) => {
                                    // Check if the variant has the selectedOptions at the root level
                                    const variantOptions = node.selectedOptions || [];
                                    return newSelectedOptions.every((selectedOpt: { name: string; value: string }) => 
                                     variantOptions.some((variantOpt: { name: string; value: string }) => 
                                      selectedOpt.name === variantOpt.name && 
                                      selectedOpt.value === variantOpt.value
                                    )
                                  );
                                  })?.node;
                                  
                                  console.log('Variant selection:', {
                                    currentSelectedOptions,
                                    newSelectedOptions,
                                    newVariant
                                  });

                                  if (newVariant) {
                                    setIsChangingVariant(prev => ({ ...prev, [item.id]: true }));
                                    
                                    // Use the full cart line ID as provided by Shopify
                                    const cartLineId = item.id;
                                    
                                    // Update the line item to the new variant
                                    const response = await fetch('/api/cart', {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        cartId: cart.id,
                                        items: [{
                                          id: cartLineId,
                                          merchandiseId: newVariant.id,
                                          quantity: item.quantity
                                        }]
                                      })
                                    });

                                    let data;
                                    try {
                                      data = await response.json();
                                    } catch (jsonError) {
                                      console.error('Failed to parse JSON response:', jsonError);
                                      throw new Error('Invalid server response');
                                    }
                                    
                                    if (!response.ok) {
                                      const errorMessage = data?.error || 'Failed to update variant';
                                      console.error('Server error:', errorMessage);
                                      throw new Error(errorMessage);
                                    }
                                    
                                    if (!data?.success || !data?.cart) {
                                      console.error('Invalid response structure:', data);
                                      throw new Error('Invalid response from server');
                                    }
                                    
                                    setCart(data.cart);
                                  }
                                } catch (error: any) {
                                  console.error('Error updating variant:', error);
                                  alert(error.message || 'Failed to update variant. Please try again.');
                                } finally {
                                  setIsChangingVariant(prev => ({ ...prev, [item.id]: false }));
                                }
                              }}
                              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-black focus:outline-none focus:ring-black sm:text-sm"
                            >
                              {option.values.map((value) => (
                                <option key={value} value={value}>
                                  {value}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    ) : item.merchandise.title !== 'Default Title' && (
                      <p className="text-sm text-gray-600 mt-1">
                        {item.merchandise.title}
                      </p>
                    )}
                    <p className="text-lg font-medium mt-2">
                      {formatPrice(item.merchandise.priceV2.amount, item.merchandise.priceV2.currencyCode)}
                      {item.quantity > 1 && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({(parseFloat(item.merchandise.priceV2.amount) * item.quantity).toFixed(2)} {item.merchandise.priceV2.currencyCode})
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
