import { notFound } from 'next/navigation';
import ProductDetailContent from './ProductDetailContent';
import { shopifyClient, GET_PRODUCT_QUERY, getProductImage, getProductPrice, getProductOriginalPrice } from '@/lib/shopify';

// Define product type
interface Product {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  rating: number;
  reviewCount: number;
  image: string;
  handle: string;
  description: string;
  features: string[];
  images: string[];
}

// GraphQL query function
async function fetchProduct(handle: string): Promise<Product | null> {
  try {
    const { data } = await shopifyClient.request(GET_PRODUCT_QUERY, { variables: { handle } });

    if (!data.product) {
      return null;
    }

    const product = data.product;
    return {
      id: product.id,
      title: product.title,
      price: getProductPrice(product),
      originalPrice: getProductOriginalPrice(product),
      rating: 4.5, // Default rating since Shopify doesn't provide this
      reviewCount: 0, // Default review count
      image: getProductImage(product),
      handle: product.handle,
      description: product.description,
      features: [
        'Premium quality materials',
        'Durable construction',
        'Comfortable design',
        'Easy to use',
        'Long-lasting performance'
      ], // Default features since Shopify doesn't provide this
      images: [getProductImage(product)], // Using the same image for all variants for now
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
