// Shopify Product Types
export interface Money {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  url: string;
  altText?: string;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: Money;
        compareAtPrice?: Money;
      };
    }>;
  };
  images: {
    edges: Array<{
      node: ShopifyImage;
    }>;
  };
}

// Shopify Collection Types
export interface ShopifyCollection {
  id: string;
  title: string;
  description: string;
  handle: string;
  image: {
    url: string;
    altText: string | null;
  } | null;
}

// Shopify Cart Types
export interface ShopifyCartItem {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    priceV2: Money;
    product: {
      id: string;
      title: string;
      handle: string;
      images: {
        edges: Array<{
          node: ShopifyImage;
        }>;
      };
    };
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
  lines: {
    edges: Array<{
      node: ShopifyCartItem;
    }>;
  };
}

// Simplified Product type for our components
export interface Product {
  id: string;
  title: string;
  price: string;
  originalPrice: string;
  img: string;
  rating: number;
  reviewCount?: number;
  handle: string;
  variantId: string;
  merchandiseId: string; // Shopify merchandise ID for cart operations
}

// Simplified Collection type for our components
export interface Collection {
  id: string;
  title: string;
  description: string;
  img: string;
  handle: string;
}
