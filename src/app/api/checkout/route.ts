import { NextRequest, NextResponse } from 'next/server';
import { shopifyClient, isShopifyConfigured } from '@/lib/shopify';

export async function POST(request: NextRequest) {
  // Check if Shopify is properly configured
  if (!isShopifyConfigured()) {
    return NextResponse.json(
      { success: false, error: 'Shopify is not configured' },
      { status: 500 }
    );
  }

  if (!shopifyClient) {
    return NextResponse.json(
      { success: false, error: 'Shopify client not initialized' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { cartId } = body;

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: 'Cart ID is required' },
        { status: 400 }
      );
    }

    // Create checkout from cart
    const query = `
      mutation checkoutCreate($input: CheckoutCreateInput!) {
        checkoutCreate(input: $input) {
          checkout {
            id
            webUrl
          }
          checkoutUserErrors {
            code
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        cartId,
      },
    };

    const response = await shopifyClient.request(query, { variables });

    // Check for GraphQL errors
    if (response.errors) {
      console.error('GraphQL Errors:', response.errors);
      const errorMessage = Array.isArray(response.errors)
        ? response.errors[0]?.message || 'Failed to create checkout'
        : 'Failed to create checkout';
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const checkout = response.data?.checkoutCreate;
    if (!checkout) {
      return NextResponse.json(
        { success: false, error: 'Failed to create checkout' },
        { status: 500 }
      );
    }

    if (checkout.checkoutUserErrors && checkout.checkoutUserErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: checkout.checkoutUserErrors[0]?.message || 'Checkout creation failed' },
        { status: 400 }
      );
    }

    if (!checkout.checkout?.webUrl) {
      return NextResponse.json(
        { success: false, error: 'No checkout URL returned' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl: checkout.checkout.webUrl,
        checkoutId: checkout.checkout.id,
      },
    });
  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout' },
      { status: 500 }
    );
  }
}
