export interface MoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface Image {
  url: string;
  altText?: string | null;
  width?: number;
  height?: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: SelectedOption[];
  price: MoneyV2;
  compareAtPrice?: MoneyV2;
  image?: Image;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  productType: string;
  vendor: string;
  options: {
    id: string;
    name: string;
    values: string[];
  }[];
  priceRange: {
    maxVariantPrice: MoneyV2;
    minVariantPrice: MoneyV2;
  };
  variants: {
    edges: Array<{ node: ProductVariant }>;
  };
  images: {
    edges: Array<{ node: Image }>;
  };
  featuredImage?: Image;
}

export interface CartLineItem {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    selectedOptions: SelectedOption[];
    product: Product;
    priceV2: MoneyV2;
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: MoneyV2;
    totalAmount: MoneyV2;
    totalTaxAmount?: MoneyV2;
  };
  lines: {
    edges: Array<{ node: CartLineItem }>;
  };
}

// Shopify Storefront API types
export interface ShopifyCart extends Omit<Cart, 'lines'> {
  lines: {
    edges: Array<{
      node: Omit<CartLineItem, 'merchandise'> & {
        merchandise: Omit<CartLineItem['merchandise'], 'product'> & {
          product: {
            id: string;
            title: string;
            handle: string;
            variants: {
              edges: Array<{ node: ProductVariant }>;
            };
          };
        };
      };
    }>;
  };
}
