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
      handle: product.handle,
      description: product.description,
      images: getProductImages(product),
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
