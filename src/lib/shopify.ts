import { createStorefrontApiClient } from '@shopify/storefront-api-client';

// Debug log environment variables
const shopifyConfig = {
  storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
  hasAccessToken: !!process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  apiVersion: '2025-01' // Using a more stable API version
};

// Create the Shopify client only if properly configured
export const shopifyClient = shopifyConfig.storeDomain && process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN
  ? createStorefrontApiClient({
      storeDomain: shopifyConfig.storeDomain,
      publicAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      apiVersion: shopifyConfig.apiVersion,
    })
  : null;

// Export function to log configuration
export function logShopifyConfig() {
  
  // Verify environment variables are set
  if (!shopifyConfig.storeDomain || !shopifyConfig.hasAccessToken) {
    return false;
  }
  
  if (!shopifyClient) {
    return false;
  }
  
  console.log('✅ Shopify configuration is valid');
  return true;
}

// Check if Shopify is properly configured
export const isShopifyConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN && 
            process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN &&
            shopifyClient);
};

// First, let's define a simpler version of the product fields
// that we know should work with the Storefront API
export const PRODUCT_FIELDS = `
  fragment ProductFields on Product {
    id
    title
    description
    handle
    availableForSale
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
    images(first: 10) {
      edges {
        node {
          url
          altText
        }
      }
    }
    variants(first: 10) {
      edges {
        node {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
        }
      }
    }
    collections(first: 10) {
      edges {
        node {
          handle
          title
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
export const formatPrice = (amount: string | undefined | null, currencyCode: string = 'USD'): string => {
  if (!amount) return '';
  const number = parseFloat(amount);
  if (isNaN(number)) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(number);
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
