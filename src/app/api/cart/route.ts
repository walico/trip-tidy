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
      warnings?: Array<{
        field: string;
        message: string;
      }>;
    };
  };
}

// Core cart operations
async function createCart(lines: { merchandiseId: string; quantity: number }[] = []): Promise<ShopifyCart> {
  if (!shopifyClient) {
    throw new CartError('Shopify client not configured', 500);
  }

  try {
    console.debug('Creating cart with lines:', JSON.stringify(lines, null, 2));

    const mutation = `
      mutation CreateCart($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
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
          userErrors {
            field
            message
          }
        }
      }
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

    const response = await (shopifyClient as any).request(mutation, {
      variables,
    });

    console.debug('Received response:', JSON.stringify(response, null, 2));

    // Check if response is empty or invalid
    if (!response) {
      throw new CartError('Empty response from Shopify', 500);
    }

    if (typeof response !== 'object') {
      throw new CartError('Invalid response format from Shopify', 500, { response });
    }

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
      details: err.details,
      response: err.response,
      status: err.status
    });
    throw new CartError(
      'Failed to create cart: ' + (err.message || 'Unknown error'),
      err.status || 500,
      err.details || err
    );
  }
}

// API Routes
export async function POST(request: Request) {
  if (!isShopifyConfigured()) {
    console.error('Shopify configuration check failed');
    console.error('Environment variables:');
    console.error('- NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN:', process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'Not set');
    console.error('- NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN:', process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN ? 'Set' : 'Not set');
    return NextResponse.json({ error: 'Shopify is not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    console.debug('POST /api/cart received:', JSON.stringify(body, null, 2));

    if (!body.items?.length) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const lines = body.items.map((item: any) => ({
      merchandiseId: String(item.id), // This is actually the variantId from frontend
      quantity: parseInt(String(item.quantity))
    }));

    console.debug('Processed lines:', JSON.stringify(lines, null, 2));
    console.debug('Cart ID provided:', body.cartId || 'null');

    let cart: ShopifyCart;
    if (body.cartId) {
      console.debug('Adding to existing cart:', body.cartId);

      // NEW APPROACH: Fetch existing cart and merge items into new cart
      try {
        console.debug('Fetching existing cart to merge items');
        const existingCartResponse = await (shopifyClient as any).request(`
          query GetCart($cartId: ID!) {
            cart(id: $cartId) {
              lines(first: 100) {
                edges {
                  node {
                    quantity
                    merchandise {
                      ... on ProductVariant {
                        id
                      }
                    }
                  }
                }
              }
            }
          }
        `, { cartId: body.cartId });

        if (existingCartResponse?.data?.cart?.lines?.edges) {
          console.debug('Found existing cart with', existingCartResponse.data.cart.lines.edges.length, 'items');

          // Merge existing items with new items
          const existingLines = existingCartResponse.data.cart.lines.edges.map((edge: any) => ({
            merchandiseId: edge.node.merchandise.id,
            quantity: edge.node.quantity
          }));

          const newLines = lines.map((line: { merchandiseId: string; quantity: number }) => ({
            merchandiseId: line.merchandiseId,
            quantity: line.quantity
          }));

          // Combine and deduplicate lines
          const combinedLines = [...existingLines];
          newLines.forEach((newLine: { merchandiseId: string; quantity: number }) => {
            const existingIndex = combinedLines.findIndex((line: { merchandiseId: string; quantity: number }) =>
              line.merchandiseId === newLine.merchandiseId
            );
            if (existingIndex >= 0) {
              combinedLines[existingIndex].quantity += newLine.quantity;
            } else {
              combinedLines.push(newLine);
            }
          });

          console.debug('Creating new cart with combined items:', combinedLines.length, 'total items');
          console.debug('Combined lines:', JSON.stringify(combinedLines, null, 2));

          cart = await createCart(combinedLines);
        } else {
          console.warn('Existing cart not found, creating new cart');
          cart = await createCart(lines);
        }
      } catch (fetchError) {
        console.warn('Error fetching existing cart, creating new cart:', fetchError);
        cart = await createCart(lines);
      }
    } else {
      console.debug('Creating new cart');
      cart = await createCart(lines);
    }

    return NextResponse.json({ success: true, cart });
  } catch (error: any) {
    console.error('Cart API error:', {
      error: error,
      message: error.message,
      details: error.details,
      stack: error.stack
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

export async function GET(request: Request) {
  if (!isShopifyConfigured()) {
    return NextResponse.json({ error: 'Shopify is not configured' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('cartId');

    console.debug('GET /api/cart - Request for cartId:', cartId);

    if (!cartId) {
      console.debug('No cartId provided, returning error');
      return NextResponse.json({ error: 'Cart ID is required' }, { status: 400 });
    }

    console.debug('GET /api/cart - Fetching cart:', cartId);

    const query = `
      query GetCart($cartId: ID!) {
        cart(id: $cartId) {
          ${cartFragment}
        }
      }
    `;

    const response = await (shopifyClient as any).request(query, { cartId });

    console.debug('Shopify GET response:', JSON.stringify(response, null, 2));

    if (!response?.data?.cart) {
      console.error('Cart not found in Shopify:', cartId);
      throw new CartError('Cart not found', 404);
    }

    console.debug('Cart found successfully:', response.data.cart.id);
    return NextResponse.json({ success: true, cart: response.data.cart });
  } catch (error: any) {
    console.error('Cart GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch cart',
        details: error.details || error
      },
      { status: error.status || 500 }
    );
  }
}

export async function PUT(request: Request) {
  if (!isShopifyConfigured()) {
    return NextResponse.json({ error: 'Shopify is not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    console.debug('PUT /api/cart received:', JSON.stringify(body, null, 2));

    if (!body.cartId) {
      return NextResponse.json({ error: 'Cart ID is required' }, { status: 400 });
    }

    if (!body.items?.length) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    // Update cart lines - need to find line IDs first
    console.debug('Updating cart quantities for items:', JSON.stringify(body.items, null, 2));

    // First fetch the cart to find the line IDs
    const getCartQuery = `
      query GetCart($cartId: ID!) {
        cart(id: $cartId) {
          lines(first: 100) {
            edges {
              node {
                id
                merchandise {
                  ... on ProductVariant {
                    id
                  }
                }
              }
            }
          }
        }
      }
    `;

    const cartResponse = await (shopifyClient as any).request(getCartQuery, {
      cartId: body.cartId
    });

    if (!cartResponse?.data?.cart?.lines?.edges) {
      throw new CartError('Cart not found or empty', 404);
    }

    // Map frontend items to line updates
    const lineUpdates = body.items.map((item: any) => {
      const lineToUpdate = cartResponse.data.cart.lines.edges.find((edge: any) =>
        edge.node.merchandise.id === String(item.id)
      );

      if (!lineToUpdate) {
        throw new CartError(`Item not found in cart: ${item.id}`, 404);
      }

      return {
        id: lineToUpdate.node.id,
        merchandiseId: String(item.id),
        quantity: parseInt(String(item.quantity))
      };
    });

    const mutation = `
      mutation UpdateCart($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            ${cartFragment}
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await (shopifyClient as any).request(mutation, {
      cartId: body.cartId,
      lines: lineUpdates
    });

    if (response.data?.cartLinesUpdate?.userErrors?.length > 0) {
      throw new CartError('Failed to update cart', 400, response.data.cartLinesUpdate.userErrors);
    }

    if (!response.data?.cartLinesUpdate?.cart) {
      throw new CartError('No cart returned', 500, { response });
    }

    return NextResponse.json({ success: true, cart: response.data.cartLinesUpdate.cart });
  } catch (error: any) {
    console.error('Cart PUT error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update cart',
        details: error.details || error
      },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!isShopifyConfigured()) {
    return NextResponse.json({ error: 'Shopify is not configured' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('cartId');
    const variantId = searchParams.get('variantId');

    if (!cartId) {
      return NextResponse.json({ error: 'Cart ID is required' }, { status: 400 });
    }

    console.debug('DELETE /api/cart - Removing from cart:', { cartId, variantId });

    let cart: ShopifyCart;

    if (variantId) {
      // Remove specific item - need to find the line ID first
      console.debug('Finding line ID for variant:', variantId);

      // First fetch the cart to find the line ID
      const getCartQuery = `
        query GetCart($cartId: ID!) {
          cart(id: $cartId) {
            lines(first: 100) {
              edges {
                node {
                  id
                  merchandise {
                    ... on ProductVariant {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const cartResponse = await (shopifyClient as any).request(getCartQuery, {
        cartId: cartId
      });

      if (!cartResponse?.data?.cart?.lines?.edges) {
        throw new CartError('Cart not found or empty', 404);
      }

      // Find the line ID that matches the variant ID
      const lineToRemove = cartResponse.data.cart.lines.edges.find((edge: any) =>
        edge.node.merchandise.id === variantId
      );

      if (!lineToRemove) {
        throw new CartError('Item not found in cart', 404);
      }

      const mutation = `
        mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
          cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
            cart {
              ${cartFragment}
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const response = await (shopifyClient as any).request(mutation, {
        cartId,
        lineIds: [lineToRemove.node.id]
      });

      if (response.data?.cartLinesRemove?.userErrors?.length > 0) {
        throw new CartError('Failed to remove item', 400, response.data.cartLinesRemove.userErrors);
      }

      if (!response.data?.cartLinesRemove?.cart) {
        throw new CartError('No cart returned', 500, { response });
      }

      cart = response.data.cartLinesRemove.cart;
    } else {
      // Clear entire cart
      const mutation = `
        mutation ClearCart($cartId: ID!) {
          cartLinesRemove(cartId: $cartId, lineIds: []) {
            cart {
              ${cartFragment}
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const response = await (shopifyClient as any).request(mutation, {
        cartId: cartId
      });

      if (response.data?.cartLinesRemove?.userErrors?.length > 0) {
        throw new CartError('Failed to clear cart', 400, response.data.cartLinesRemove.userErrors);
      }

      if (!response.data?.cartLinesRemove?.cart) {
        throw new CartError('No cart returned', 500, { response });
      }

      cart = response.data.cartLinesRemove.cart;
    }

    return NextResponse.json({ success: true, cart });
  } catch (error: any) {
    console.error('Cart DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete from cart',
        details: error.details || error
      },
      { status: error.status || 500 }
    );
  }
}