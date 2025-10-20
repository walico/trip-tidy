// Shopify Product Types
export interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  handle: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        price: {
          amount: string;
          currencyCode: string;
        };
        compareAtPrice: {
          amount: string;
          currencyCode: string;
        } | null;
      };
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
    price: {
      amount: string;
      currencyCode: string;
    };
    image: {
      url: string;
      altText: string | null;
    } | null;
    product: {
      id: string;
      title: string;
      handle: string;
    };
  };
}

export interface ShopifyCart {
  id: string;
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
}

// Simplified Collection type for our components
export interface Collection {
  id: string;
  title: string;
  description: string;
  img: string;
  handle: string;
}
