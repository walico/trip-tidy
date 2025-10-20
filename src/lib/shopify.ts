import { createStorefrontApiClient } from '@shopify/storefront-api-client';

export const shopifyClient = createStorefrontApiClient({
  storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!,
  publicAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
  apiVersion: '2025-01', // Updated to current supported API version
});

export const PRODUCT_FIELDS = `
  fragment ProductFields on Product {
    id
    title
    description
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 100) {
      edges {
        node {
          url
          altText
        }
      }
    }
    variants(first: 100) {
      edges {
        node {
          id
          title
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

export const COLLECTION_FIELDS = `
  fragment CollectionFields on Collection {
    id
    title
    description
    handle
    image {
      url
      altText
    }
  }
`;

export const GET_COLLECTIONS_QUERY = `
  query getCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          ...CollectionFields
        }
      }
    }
  }
  ${COLLECTION_FIELDS}
`;

export const GET_COLLECTION_QUERY = `
  query getCollection($handle: String!) {
    collection(handle: $handle) {
      ...CollectionFields
      products(first: 50) {
        edges {
          node {
            ...ProductFields
          }
        }
      }
    }
  }
  ${COLLECTION_FIELDS}
  ${PRODUCT_FIELDS}
`;

export const GET_PRODUCTS_QUERY = `
  query getProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          ...ProductFields
        }
      }
    }
  }
  ${PRODUCT_FIELDS}
`;

export const GET_PRODUCT_QUERY = `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
  ${PRODUCT_FIELDS}
`;

// Utility functions
export const formatPrice = (amount: string, currencyCode: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount));
};

export const getProductImage = (product: any): string => {
  return product.images?.edges?.[0]?.node?.url || '';
};

export const getProductImages = (product: any): string[] => {
  return product.images?.edges?.map((edge: any) => edge.node.url) || [];
};

export const getProductPrice = (product: any): string => {
  return product.priceRange?.minVariantPrice?.amount || '0';
};

export const getProductOriginalPrice = (product: any): string => {
  // Check all variants for compare at price and return the minimum one
  const variants = product.variants?.edges || [];
  if (variants.length === 0) return '';

  const compareAtPrices = variants
    .map((edge: any) => edge.node.compareAtPrice?.amount)
    .filter((price: string) => price);

  return compareAtPrices.length > 0 ? Math.min(...compareAtPrices.map(parseFloat)).toString() : '';
};
