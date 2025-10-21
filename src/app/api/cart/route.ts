import { NextResponse } from 'next/server';
import { shopifyClient, isShopifyConfigured } from '@/lib/shopify';
import { ShopifyCart } from '@/lib/types';

// Essential GraphQL fragment
const cartFragment = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              priceV2 {
                amount
                currencyCode
              }
              product {
                id
                title
                handle
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Error handling
class CartError extends Error {
  constructor(public message: string, public status: number = 500, public details?: any) {
    super(message);
    this.name = 'CartError';
  }
}

// Add these interfaces at the top with other interfaces
interface ShopifyCartCreateResponse {
  data: {
    cartCreate: {
      cart: ShopifyCart | null;
      userErrors: Array<{
        field: string;
        message: string;
      }>;
    };
  };
}

interface ShopifyCartAddResponse {
  data: {
    cartLinesAdd: {
      cart: ShopifyCart | null;
      userErrors: Array<{
        field: string;
        message: string;
      }>;
    };
  };
}

// Core cart operations
async function createCart(lines: { merchandiseId: string; quantity: number }[] = []): Promise<ShopifyCart> {
  try {
    console.debug('Creating cart with lines:', JSON.stringify(lines, null, 2));

    const mutation = `
      mutation CreateCart($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            ...CartFields
          }
          userErrors {
            field
            message
          }
        }
      }
      ${cartFragment}
    `;

    const variables = {
      input: {
        lines: lines.map(line => ({
          merchandiseId: line.merchandiseId,
          quantity: parseInt(String(line.quantity))
        }))
      }
    };

    console.debug('Sending mutation with variables:', JSON.stringify(variables, null, 2));

    const response = await shopifyClient.request<ShopifyCartCreateResponse>(mutation, variables);
    console.debug('Received response:', JSON.stringify(response, null, 2));

    if (!response.data?.cartCreate) {
      throw new CartError('Invalid response from Shopify', 500, { response });
    }

    if (response.data.cartCreate.userErrors?.length > 0) {
      throw new CartError('Failed to create cart', 400, response.data.cartCreate.userErrors);
    }

    if (!response.data.cartCreate.cart) {
      throw new CartError('No cart returned', 500, { response });
    }

    return response.data.cartCreate.cart;
  } catch (err: any) {
    console.error('Cart creation error:', {
      error: err,
      lines,
      message: err.message,
      details: err.details
    });
    throw new CartError(
      'Failed to create cart: ' + (err.message || 'Unknown error'),
      err.status || 500,
      err.details || err
    );
  }
}

async function addToCart(cartId: string, lines: { merchandiseId: string; quantity: number }[]): Promise<ShopifyCart> {
  try {
    const response = await shopifyClient.request<ShopifyCartAddResponse>(`
      mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            ...CartFields
          }
          userErrors {
            field
            message
          }
        }
      }
      ${cartFragment}
    `, { cartId, lines });

    if (!response.data?.cartLinesAdd) {
      throw new CartError('Invalid response from Shopify', 500, { response });
    }

    if (response.data.cartLinesAdd.userErrors?.length > 0) {
      throw new CartError('Failed to add items', 400, response.data.cartLinesAdd.userErrors);
    }

    if (!response.data.cartLinesAdd.cart) {
      throw new CartError('No cart returned', 500, { response });
    }

    return response.data.cartLinesAdd.cart;
  } catch (err: any) {
    console.error('Add to cart error:', err);
    throw new CartError('Failed to add items', 500, err);
  }
}

// API Routes
export async function POST(request: Request) {
  if (!isShopifyConfigured()) {
    return NextResponse.json({ error: 'Shopify is not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    console.debug('POST /api/cart received:', JSON.stringify(body, null, 2));

    if (!body.items?.length) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const lines = body.items.map((item: any) => ({
      merchandiseId: String(item.id),
      quantity: parseInt(String(item.quantity))
    }));

    console.debug('Processed lines:', JSON.stringify(lines, null, 2));

    let cart: ShopifyCart;
    if (body.cartId) {
      cart = await addToCart(body.cartId, lines);
    } else {
      cart = await createCart(lines);
    }

    return NextResponse.json({ success: true, cart });
  } catch (error: any) {
    console.error('Cart API error:', {
      error: error,
      message: error.message,
      details: error.details
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Cart operation failed',
        details: error.details || error
      },
      { status: error.status || 500 }
    );
  }
}

// ...rest of HTTP methods (GET, PUT, DELETE)...