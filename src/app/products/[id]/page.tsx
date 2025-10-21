import { notFound } from 'next/navigation';
import ProductDetailContent from './ProductDetailContent';
import { shopifyClient, GET_PRODUCT_QUERY, getProductImage, getProductImages, getProductPrice, getProductOriginalPrice } from '@/lib/shopify';

// Define product type based on Shopify data structure
interface Product {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  handle: string;
  description: string;
  images: string[];
  variantId: string;
  merchandiseId: string;
}

// GraphQL query function
async function fetchProduct(handle: string): Promise<Product | null> {
  try {
    const { data } = await shopifyClient.request(GET_PRODUCT_QUERY, { variables: { handle } });

    if (!data.product) {
      return null;
    }

    const product = data.product;
    const firstVariant = product.variants?.edges?.[0]?.node;

    console.log('Product data:', {
      productId: product.id,
      firstVariant: firstVariant,
      variantsCount: product.variants?.edges?.length || 0
    });

    // Ensure we have a valid Shopify variant ID
    let variantId = firstVariant?.id;
    let merchandiseId = firstVariant?.id;

    // If no variant ID, use product ID as fallback (for debugging)
    if (!variantId || !variantId.startsWith('gid://shopify/')) {
      console.warn('No valid variant ID found, using product ID as fallback');
      variantId = product.id;
      merchandiseId = product.id;
    }

    return {
      id: product.id,
      title: product.title,
      price: getProductPrice(product),
      originalPrice: getProductOriginalPrice(product),
      handle: product.handle,
      description: product.description,
      images: getProductImages(product),
      variantId: variantId,
      merchandiseId: merchandiseId,
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Server component that handles the params
export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await fetchProduct(params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetailContent product={product} />;
}
