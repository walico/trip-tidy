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
  checkoutUrl: string | null;
  isCartOpen: boolean;
  isLoading: boolean;
  addToCart: (itemOrItems: Omit<CartItem, 'quantity'> | Omit<CartItem, 'quantity'>[]) => Promise<void>;
  addMultipleToCart: (items: Omit<CartItem, 'quantity'>[]) => Promise<void>;
  addProductsWithQuantities: (productQuantities: Array<{ product: Omit<CartItem, 'quantity'>, quantity: number }>) => Promise<void>;
  removeFromCart: (variantId: string) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCart: () => Promise<void>;
  syncWithShopify: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Cart Context - Enhanced for Multiple Product Support
 *
 * This cart implementation supports adding multiple different products to the cart
 * via the Shopify Storefront API. You can add products in several ways:
 *
 * 1. Single Product:
 *    addToCart(product)
 *
 * 2. Multiple Different Products:
 *    addToCart([product1, product2, product3])
 *
 * 3. Multiple Products (explicit function):
 *    addMultipleToCart([product1, product2, product3])
 *
 * 4. Products with Custom Quantities:
 *    addProductsWithQuantities([
 *      { product: watchProduct, quantity: 2 },
 *      { product: phoneProduct, quantity: 1 }
 *    ])
 *
 * All methods automatically handle cart creation, quantity updates, and state synchronization.
 */

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Initialize cart on mount
  useEffect(() => {
    if (!isInitialized) {
      // Rehydrate cartId from localStorage if present
      try {
        const storedCartId = typeof window !== 'undefined' ? localStorage.getItem('cartId') : null;
        if (storedCartId) {
          setCartId(storedCartId);
        }
      } catch (e) {
        // ignore storage errors
      }

      // Only try to get cart if we have a cartId (from previous session)
      // If no cartId, we'll create a new cart when first item is added
      getCart();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Persist cartId changes
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      if (cartId) {
        localStorage.setItem('cartId', cartId);
      } else {
        localStorage.removeItem('cartId');
      }
    } catch (e) {
      // ignore storage errors
    }
  }, [cartId]);

  // Get or create cart
  const getCart = useCallback(async () => {
    // Only fetch if we have a cartId (meaning cart exists in Shopify)
    if (!cartId) {
      console.log('No cartId available, skipping cart fetch');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching existing cart:', cartId);
      const response = await fetch('/api/cart?cartId=' + cartId);

      if (!response.ok) {
        console.warn('Failed to fetch cart, response not ok:', response.status);
        setCartId(null); // Reset cartId if cart doesn't exist
        return;
      }

      const data = await response.json();

      if (data.success && data.cart) {
        setCartId(data.cart.id);
        setCheckoutUrl(data.cart.checkoutUrl);
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
        console.log('Cart loaded successfully:', data.cart.lines?.edges?.length || 0, 'items');
      } else {
        console.warn('Cart fetch failed or cart not found, resetting cartId');
        setCartId(null);
        localStorage.removeItem('cartId');
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      // Don't show error toast on init, as this is normal for new users
      setCartId(null);
      localStorage.removeItem('cartId');
    } finally {
      setIsLoading(false);
    }
  }, [cartId]);

  // Sync with Shopify (alias for getCart)
  const syncWithShopify = useCallback(async () => {
    await getCart();
  }, [getCart]);

  // Cart visibility functions
  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  // Add item(s) to cart - supports both single item and arrays
  // Usage examples:
  // addToCart(singleProduct) - adds 1 product
  // addToCart([product1, product2, product3]) - adds 3 different products
  const addToCart = useCallback(async (itemOrItems: Omit<CartItem, 'quantity'> | Omit<CartItem, 'quantity'>[]) => {
    try {
      setIsLoading(true);

      // Handle both single item and array of items
      const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
      const isMultiple = items.length > 1;

      console.log(`Adding ${isMultiple ? 'multiple' : 'single'} item(s) to cart via API:`, items.map(i => i.variantId));
      console.log('Current cartId:', cartId);

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          items: items.map(item => ({
            id: item.variantId,
            quantity: 1
          })),
        }),
      });

      console.log('API Response status:', response.status);
      const data = await response.json();
      console.log('API Response data:', data);

      if (data.success && data.cart) {
        // Validate that the cart has a valid ID
        if (!data.cart.id) {
          console.error('Cart response missing ID:', data.cart);
          throw new Error('Invalid cart response from Shopify');
        }

        setCartId(data.cart.id);
        setCheckoutUrl(data.cart.checkoutUrl);

        // Update local state based on Shopify's response
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

        setIsCartOpen(true);
        toast.success(isMultiple ? `Added ${items.length} items to cart` : 'Added to cart');
        console.log('Cart updated successfully:', {
          cartId: data.cart.id,
          itemCount: data.cart.lines?.edges?.length || 0,
          totalQuantity: data.cart.totalQuantity,
          items: data.cart.lines?.edges?.map((edge: any) => ({
            title: edge.node.merchandise.product.title,
            quantity: edge.node.quantity,
            variantId: edge.node.merchandise.id
          })) || []
        });
      } else {
        console.error('Failed to add to cart:', data.error);
        // The API should handle all cart merging and creation automatically
        throw new Error(data.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  }, [cartId]);

  // Add multiple items to cart at once
  const addMultipleToCart = useCallback(async (items: Omit<CartItem, 'quantity'>[]) => {
    try {
      setIsLoading(true);

      console.log('Adding multiple items to cart via API:', items.length, 'items');
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          items: items.map(item => ({
            id: item.variantId,
            quantity: 1
          })),
        }),
      });

      const data = await response.json();

      if (data.success && data.cart) {
        setCartId(data.cart.id);
        setCheckoutUrl(data.cart.checkoutUrl);

        // Update local state based on Shopify's response
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

        setIsCartOpen(true);
        toast.success(`Added ${items.length} items to cart`);
      } else {
        throw new Error(data.error || 'Failed to add items to cart');
      }
    } catch (error) {
      console.error('Failed to add multiple items to cart:', error);
      toast.error('Failed to add items to cart');
    } finally {
      setIsLoading(false);
    }
  }, [cartId]);

  // Helper function to add products with specific quantities
  const addProductsWithQuantities = useCallback(async (productQuantities: Array<{ product: Omit<CartItem, 'quantity'>, quantity: number }>) => {
    try {
      setIsLoading(true);

      console.log('Adding products with custom quantities:', productQuantities.length, 'items');

      // Validate quantities
      const validQuantities = productQuantities.filter(pq => pq.quantity > 0);
      if (validQuantities.length === 0) {
        toast.error('Please specify quantities greater than 0');
        return;
      }

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          items: validQuantities.map(({ product, quantity }) => ({
            id: product.variantId,
            quantity: quantity
          })),
        }),
      });

      const data = await response.json();

      if (data.success && data.cart) {
        setCartId(data.cart.id);
        setCheckoutUrl(data.cart.checkoutUrl);

        // Update local state based on Shopify's response
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

        setIsCartOpen(true);
        const totalItems = validQuantities.reduce((sum, pq) => sum + pq.quantity, 0);
        toast.success(`Added ${totalItems} items to cart`);
      } else {
        throw new Error(data.error || 'Failed to add items to cart');
      }
    } catch (error) {
      console.error('Failed to add products with quantities:', error);
      toast.error('Failed to add items to cart');
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
          // Refresh from Shopify response to avoid divergence
          if (data.cart) {
            setCheckoutUrl(data.cart.checkoutUrl || null);
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
          } else {
            // Fallback: filter locally
            setItems((prevItems) => prevItems.filter((item) => item.variantId !== variantId));
          }
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
          if (data.cart) {
            setCheckoutUrl(data.cart.checkoutUrl || null);
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
          } else {
            // Fallback: update locally
            setItems((prevItems) =>
              prevItems.map((item) =>
                item.variantId === variantId ? { ...item, quantity } : item
              )
            );
          }
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
        localStorage.removeItem('cartId'); // Clean up localStorage
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
    checkoutUrl,
    isCartOpen,
    isLoading,
    addToCart,
    addMultipleToCart,
    addProductsWithQuantities,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCart,
    syncWithShopify,
    openCart,
    closeCart,
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