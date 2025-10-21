'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  title: string;
  price: string;
  image: string;
  quantity: number;
  merchandiseId: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  cartId: string | null;
  isLoading: boolean;
  addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeFromCart: (variantId: string) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCart: () => Promise<void>;
  syncWithShopify: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Initialize cart on mount
  useEffect(() => {
    if (!isInitialized) {
      getCart();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Get or create cart
  const getCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cart' + (cartId ? `?cartId=${cartId}` : ''));
      const data = await response.json();
      
      if (data.success && data.cart) {
        setCartId(data.cart.id);
        setItems(
          data.cart.lines?.edges?.map((edge: any) => ({
            id: edge.node.id,
            variantId: edge.node.merchandise.id,
            productId: edge.node.merchandise.product.id,
            title: edge.node.merchandise.product.title,
            price: edge.node.merchandise.priceV2.amount,
            image: edge.node.merchandise.product.images?.edges[0]?.node?.url || '',
            quantity: edge.node.quantity,
            merchandiseId: edge.node.merchandise.id,
          })) || []
        );
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  }, [cartId]);

  // Sync with Shopify (alias for getCart)
  const syncWithShopify = useCallback(async () => {
    await getCart();
  }, [getCart]);

  // Add item to cart
  const addToCart = useCallback(async (item: Omit<CartItem, 'quantity'>) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          items: [{ id: item.variantId, quantity: 1 }],
        }),
      });

      const data = await response.json();

      if (data.success && data.cart) {
        setCartId(data.cart.id);
        setItems((prevItems) => {
          const existingItem = prevItems.find((i) => i.variantId === item.variantId);
          if (existingItem) {
            return prevItems.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            );
          }
          return [...prevItems, { ...item, quantity: 1 }];
        });
        toast.success('Added to cart');
      } else {
        throw new Error(data.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  }, [cartId]);

  // Remove item from cart
  const removeFromCart = useCallback(
    async (variantId: string) => {
      if (!cartId) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/cart?cartId=${cartId}&variantId=${variantId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          setItems((prevItems) =>
            prevItems.filter((item) => item.variantId !== variantId)
          );
          toast.success('Removed from cart');
        } else {
          throw new Error(data.error || 'Failed to remove from cart');
        }
      } catch (error) {
        console.error('Failed to remove from cart:', error);
        toast.error('Failed to remove from cart');
      } finally {
        setIsLoading(false);
      }
    },
    [cartId]
  );

  // Update item quantity
  const updateQuantity = useCallback(
    async (variantId: string, quantity: number) => {
      if (!cartId) return;

      if (quantity < 1) {
        await removeFromCart(variantId);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch('/api/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cartId,
            items: [{ id: variantId, quantity }],
          }),
        });

        const data = await response.json();

        if (data.success) {
          setItems((prevItems) =>
            prevItems.map((item) =>
              item.variantId === variantId ? { ...item, quantity } : item
            )
          );
        } else {
          throw new Error(data.error || 'Failed to update quantity');
        }
      } catch (error) {
        console.error('Failed to update quantity:', error);
        toast.error('Failed to update quantity');
      } finally {
        setIsLoading(false);
      }
    },
    [cartId, removeFromCart]
  );

  // Clear cart
  const clearCart = useCallback(async () => {
    if (!cartId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/cart?cartId=${cartId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setItems([]);
        setCartId(null);
        toast.success('Cart cleared');
      } else {
        throw new Error('Failed to clear cart');
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast.error('Failed to clear cart');
    } finally {
      setIsLoading(false);
    }
  }, [cartId]);

  const value = {
    items,
    itemCount,
    cartId,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCart,
    syncWithShopify,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}