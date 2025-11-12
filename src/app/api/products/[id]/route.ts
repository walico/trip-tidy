import { NextResponse } from 'next/server';
import { shopifyClient } from '@/lib/shopify';

interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  price: {
    amount: string;
    currencyCode: string;
  };
}

interface ProductResponse {
  product: {
    id: string;
    title: string;
    variants: {
      edges: Array<{
        node: ProductVariant;
      }>;
    };
  };
}

// Use the correct type for Next.js 13+ route handlers
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // In Next.js 13+, params is already resolved
    const { id } = context.params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    const productId = id.replace('gid://shopify/Product/', '');
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }
    
    const productQuery = `
      query getProduct($id: ID!) {
        product(id: $id) {
          id
          title
          variants(first: 100) {
            edges {
              node {
                id
                title
                availableForSale
                selectedOptions {
                  name
                  value
                }
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `;

    if (!shopifyClient) {
      console.error('Shopify client is not properly configured');
      return NextResponse.json(
        { 
          success: false,
          error: 'Shopify client is not properly configured',
          timestamp: new Date().toISOString()
        },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let response;
    try {
      // Add request timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      response = await shopifyClient.request<{ product: ProductResponse['product'] }>(
        productQuery,
        {
          variables: { id: `gid://shopify/Product/${productId}` },
          signal: controller.signal
        }
      );

      clearTimeout(timeout);

      if (!response?.data?.product) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Product not found',
            productId,
            timestamp: new Date().toISOString()
          },
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Create a clean response object to prevent memory leaks
      const productData = {
        id: response.data.product.id,
        title: response.data.product.title,
        variants: response.data.product.variants,
        _metadata: {
          fetchedAt: new Date().toISOString(),
          cacheControl: 'public, max-age=60, stale-while-revalidate=300'
        }
      };

      return NextResponse.json(
        { 
          success: true,
          data: { product: productData },
          timestamp: new Date().toISOString()
        },
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
          }
        }
      );
    } catch (error) {
      console.error('Error fetching product:', error);
      const status = error instanceof Error && error.name === 'AbortError' ? 504 : 500;
      
      return NextResponse.json(
        { 
          success: false,
          error: status === 504 ? 'Request timed out' : 'Failed to fetch product',
          details: error instanceof Error ? error.message : 'Unknown error',
          productId,
          timestamp: new Date().toISOString()
        },
        { 
          status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Unexpected error in product route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
