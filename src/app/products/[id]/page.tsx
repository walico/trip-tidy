import { notFound } from 'next/navigation';
import ProductDetailContent from './ProductDetailContent';
import { shopifyClient, GET_PRODUCT_QUERY, getProductImage, getProductImages, getProductPrice, getProductOriginalPrice } from '@/lib/shopify';
import { Product } from '@/lib/types';

// GraphQL query function
async function fetchProduct(handle: string): Promise<Product | null> {
  if (!shopifyClient) {
    return null;
  }

  try {
    const { data } = await (shopifyClient as any).request(GET_PRODUCT_QUERY, { variables: { handle } });

    if (!data.product) {
      return null;
    }

    const productData = data.product;
    const variants = productData.variants?.edges?.map((edge: any) => edge.node) || [];
    const firstVariant = variants[0];

    // Ensure we have a valid Shopify variant ID
    let variantId = firstVariant?.id;
    let merchandiseId = firstVariant?.id;

    // If no variant ID, use product ID as fallback
    if (!variantId || !variantId.startsWith('gid://shopify/')) {
      variantId = productData.id;
      merchandiseId = productData.id;
    }

    const productImages = getProductImages(productData);
    if (productImages.length === 0) {
      productImages.push('/placeholder-product.jpg');
    }

    // Get price range
    const priceRange = {
      minVariantPrice: {
        amount: Math.min(...variants.map((v: any) => parseFloat(v.price.amount))).toString(),
        currencyCode: firstVariant?.price?.currencyCode || 'USD'
      },
      maxVariantPrice: {
        amount: Math.max(...variants.map((v: any) => parseFloat(v.price.amount))).toString(),
        currencyCode: firstVariant?.price?.currencyCode || 'USD'
      }
    };

    // Get options
    const options = productData.options?.map((option: any) => ({
      id: option.id,
      name: option.name,
      values: option.values
    })) || [];

    // Process variants
    const processedVariants = variants.map((variant: any) => ({
      id: variant.id,
      title: variant.title,
      availableForSale: variant.availableForSale,
      selectedOptions: variant.selectedOptions,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      image: variant.image,
      quantityAvailable: variant.quantityAvailable
    }));

    // Get default selected options from first variant
    const selectedOptions = firstVariant?.selectedOptions?.reduce((acc: any, option: any) => {
      acc[option.name] = option.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      id: productData.id,
      title: productData.title,
      description: productData.description || 'No description available',
      handle: productData.handle,
      availableForSale: firstVariant?.availableForSale || false,
      price: firstVariant?.price?.amount || '0',
      originalPrice: firstVariant?.compareAtPrice?.amount || firstVariant?.price?.amount || '0',
      priceRange,
      options,
      images: productImages,
      variants: processedVariants,
      variantId,
      merchandiseId,
      selectedVariant: processedVariants[0],
      selectedOptions
    };
  } catch (error) {
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
