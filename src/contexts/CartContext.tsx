'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';


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

type CartItemInput = Omit<CartItem, 'quantity'>;

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
  refreshCart: () => Promise<void>;
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

// Helper function to get cart items from localStorage
const getStoredCartItems = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('cartItems');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const storedItems = localStorage.getItem('cartItems');
      return storedItems ? JSON.parse(storedItems) : [];
    }
    return [];
  });
  const [cartId, setCartId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Clear any stale cart data on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !cartId) {
      // If there's no cartId but we have items in localStorage, clear them
      const storedItems = localStorage.getItem('cartItems');
      if (storedItems) {
        try {
          const parsedItems = JSON.parse(storedItems);
          if (parsedItems.length > 0) {
            localStorage.removeItem('cartItems');
          }
        } catch (e) {
          localStorage.removeItem('cartItems');
        }
      }
    }
  }, [cartId]);

  // Initialize with items from localStorage on the client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedItems = getStoredCartItems();
      if (storedItems.length > 0) {
        setItems(storedItems);
      }
    }
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Initialize cart on mount
  useEffect(() => {
    if (!isInitialized) {
      // Function to get cookie value
      const getCookie = (name: string) => {
        if (typeof document === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
          const cookieValue = parts.pop()?.split(';').shift();
          return cookieValue ? decodeURIComponent(cookieValue) : null;
        }
        return null;
      };

      try {
        // Try to get cartId from either localStorage or cookie
        const storedCartId = typeof window !== 'undefined' ? 
          localStorage.getItem('cartId') || getCookie('cartId') : 
          null;

        if (storedCartId) {
          setCartId(storedCartId);
          // Ensure both storage mechanisms are in sync
          localStorage.setItem('cartId', storedCartId);
          document.cookie = `cartId=${encodeURIComponent(storedCartId)};path=/;max-age=31536000`;
        }
      } catch (e) {
      }

      // Only try to get cart if we have a cartId (from previous session)
      // If no cartId, we'll create a new cart when first item is added
      getCart();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Persist cart data in localStorage
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      
      // Persist cartId
      if (cartId) {
        localStorage.setItem('cartId', cartId);
        document.cookie = `cartId=${encodeURIComponent(cartId)};path=/;max-age=31536000`; // 1 year expiry
      } else {
        localStorage.removeItem('cartId');
        document.cookie = 'cartId=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
      
      // Persist cart items
      if (items.length > 0) {
        localStorage.setItem('cartItems', JSON.stringify(items));
      } else {
        localStorage.removeItem('cartItems');
      }
    } catch (e) {
    }
  }, [cartId, items]);

  // Get or create cart
  const getCart = useCallback<() => Promise<void>>(async () => {
    // Only fetch if we have a cartId (meaning cart exists in Shopify)
    if (!cartId) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/cart?cartId=' + encodeURIComponent(cartId));

      if (!response.ok) {
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
      } else {
        setCartId(null);
        localStorage.removeItem('cartId');
      }
    } catch (error) {
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

  // Add item(s) to cart - supports both single item and arrays
  // Usage examples:
  // addToCart(singleProduct) - adds 1 product
  // addToCart([product1, product2, product3]) - adds 3 different products
  const addToCart = useCallback(async (itemOrItems: CartItemInput | CartItemInput[]) => {
    try {
      setIsLoading(true);

      // Handle both single item and array of items
      const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
      const isMultiple = items.length > 1;

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
        // Validate that the cart has a valid ID
        if (!data.cart.id) {
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
      } else {
        // The API should handle all cart merging and creation automatically
        throw new Error(data.error || 'Failed to add to cart');
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, [cartId]);

  // Helper function to add products with specific quantities
  const addProductsWithQuantities = useCallback(async (productQuantities: Array<{ product: CartItemInput, quantity: number }>) => {
    try {
      setIsLoading(true);

      // Validate quantities
      const validQuantities = productQuantities.filter(pq => pq.quantity > 0);
      if (validQuantities.length === 0) {
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
        const updatedItems = data.cart.lines?.edges?.map((edge: any) => ({
          id: edge.node.id,
          variantId: edge.node.merchandise.id,
          productId: edge.node.merchandise.product.id,
          title: edge.node.merchandise.product.title,
          price: edge.node.merchandise.priceV2.amount,
          image: edge.node.merchandise.product.images?.edges[0]?.node?.url || '',
          quantity: edge.node.quantity,
          merchandiseId: edge.node.merchandise.id,
        })) || [];
        
        setItems(updatedItems);
        // Update localStorage with the new items
        localStorage.setItem('cartItems', JSON.stringify(updatedItems));

          setIsCartOpen(true);
            const totalItems = validQuantities.reduce((sum, pq) => sum + pq.quantity, 0);
        } else {
        throw new Error(data.error || 'Failed to add items to cart');
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, [cartId]);

  // Add multiple items to cart at once
  const addMultipleToCart = useCallback(async (itemsToAdd: Omit<CartItem, 'quantity'>[]) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          items: itemsToAdd.map(item => ({
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
        return data.cart;
      } else {
        throw new Error(data.error || 'Failed to add items to cart');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [cartId]);

  // Clear cart
  const clearCart = useCallback(async () => {
    // Clear local state first for immediate UI update
    setItems([]);
    setCartId(null);
    setCheckoutUrl(null);
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cartItems');
      localStorage.removeItem('cartId');
    }

    // If we have a cartId, also clear it from the server
    if (cartId) {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/cart?cartId=${encodeURIComponent(cartId)}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (!data.success) {
          // Don't show error to user since we've already cleared local state
        }
      } catch (error) {
        // Don't show error to user since we've already cleared local state
      } finally {
        setIsLoading(false);
      }
    }
    
  }, [cartId]);

  const refreshCart = useCallback(async () => {
    if (!cartId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/cart?cartId=${encodeURIComponent(cartId)}`);
      const data = await response.json();

      if (data.success && data.cart) {
        const cartItems = data.cart.lines?.edges?.map((edge: any) => ({
          id: edge.node.id,
          variantId: edge.node.merchandise.id,
          productId: edge.node.merchandise.product.id,
          title: edge.node.merchandise.product.title,
          price: edge.node.merchandise.priceV2.amount,
          image: edge.node.merchandise.product.images?.edges[0]?.node?.url || '',
          quantity: edge.node.quantity,
          merchandiseId: edge.node.merchandise.id,
        })) || [];

        setItems(cartItems);
        setCheckoutUrl(data.cart.checkoutUrl);
      }
    } catch (error) {
      // Don't show error to user since we've already cleared local state
    } finally {
      setIsLoading(false);
    }
  }, [cartId]);

  const updateQuantity = useCallback(async (variantId: string, quantity: number) => {
    try {
      if (quantity < 1) {
        await removeFromCart(variantId);
        return;
      }

      const updatedItems = items.map(item => 
        item.variantId === variantId ? { ...item, quantity } : item
      );
      
      setItems(updatedItems);
      
      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      }
      
      // If cart is managed by an API, you would call it here
      // await updateCartInAPI(updatedItems);
    } catch (error) {
    }
  }, [items]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const removeFromCart = useCallback(async (variantId: string) => {
    try {
      setIsLoading(true);
      const currentItems = [...items];
      const existingItemIndex = currentItems.findIndex(item => item.variantId === variantId);
      
      if (existingItemIndex > -1) {
        currentItems.splice(existingItemIndex, 1);
        setItems(currentItems);
        
        // If you're using a backend service to manage the cart, you would call it here
        // For example:
        // await updateCartInBackend(currentItems);
        
        // Update localStorage if you're using it for cart persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('cartItems', JSON.stringify(currentItems));
        }
        
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, [items]);

  const value: CartContextType = {
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
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
    refreshCart,
    openCart,
    closeCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;