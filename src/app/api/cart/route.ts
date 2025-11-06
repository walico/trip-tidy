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
              selectedOptions {
                name
                value
              }
              product {
                id
                title
                handle
                options {
                  id
                  name
                  values
                }
                variants(first: 100) {
                  edges {
                    node {
                      id
                      title
                      selectedOptions {
                        name
                        value
                      }
                      priceV2 {
                        amount
                        currencyCode
                      }
                      image {
                        url
                        altText
                      }
                    }
                  }
                }
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
  // Ensure we always return JSON, never HTML
  const headers = {
    'Content-Type': 'application/json',
  };

  if (!isShopifyConfigured()) {
    console.error('Shopify configuration check failed');
    console.error('Environment variables:');
    console.error('- NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN:', process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'Not set');
    console.error('- NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN:', process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN ? 'Set' : 'Not set');
    return NextResponse.json({ error: 'Shopify is not configured' }, { status: 500, headers });
  }

  try {
    let body;
    try {
      body = await request.json();
      console.debug('POST /api/cart received:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body format' },
        { status: 400, headers }
      );
    }

    if (!body.items?.length) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400, headers });
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

      // Use cartLinesAdd mutation to add items to existing cart
      try {
        const mutation = `
          mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
            cartLinesAdd(cartId: $cartId, lines: $lines) {
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

        console.log('🔵 Attempting cartLinesAdd with:');
        console.log('   Cart ID:', body.cartId);
        console.log('   Lines to add:', JSON.stringify(lines, null, 2));

        const response = await (shopifyClient as any).request(mutation, {
          variables: {
            cartId: body.cartId,
            lines: lines
          }
        });

        console.log('========================================');
        console.log('cartLinesAdd FULL RESPONSE:', JSON.stringify(response, null, 2));
        console.log('========================================');

        if (response.data?.cartLinesAdd?.userErrors?.length > 0) {
          console.error('❌ cartLinesAdd had errors:', response.data.cartLinesAdd.userErrors);
          // Cart might be invalid/expired, create new cart
          console.log('Creating new cart due to errors');
          cart = await createCart(lines);
        } else if (response.data?.cartLinesAdd?.cart) {
          cart = response.data.cartLinesAdd.cart;
          console.log('✅ Successfully added to existing cart:', cart.id);
          console.log('Total items now:', cart.totalQuantity);
        } else {
          console.error('❌ Unexpected response from cartLinesAdd, creating new cart');
          console.error('Response was:', response);
          cart = await createCart(lines);
        }
      } catch (error) {
        console.error('❌ EXCEPTION when adding to existing cart:', error);
        console.error('Error details:', {
          message: (error as any).message,
          stack: (error as any).stack,
          response: (error as any).response
        });
        console.log('Creating new cart as fallback...');
        cart = await createCart(lines);
      }
    } else {
      console.debug('Creating new cart');
      cart = await createCart(lines);
    }

    return NextResponse.json({ success: true, cart }, { headers });
  } catch (error: any) {
    console.error('Cart API error:', {
      error: error,
      message: error.message,
      details: error.details,
      stack: error.stack
    });

    // Always return JSON, never HTML
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Cart operation failed',
        details: error.details || error
      },
      { status: error.status || 500, headers }
    );
  }
}

export async function GET(request: Request) {
  const headers = { 'Content-Type': 'application/json' };

  if (!isShopifyConfigured()) {
    return NextResponse.json({ error: 'Shopify is not configured' }, { status: 500, headers });
  }

  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('cartId') ? decodeURIComponent(searchParams.get('cartId')!) : null;

    console.debug('GET /api/cart - Request for cartId:', cartId);

    if (!cartId) {
      console.debug('No cartId provided, returning error');
      return NextResponse.json({ error: 'Cart ID is required' }, { status: 400, headers });
    }

    console.debug('GET /api/cart - Fetching cart:', cartId);

    const query = `
      query GetCart($cartId: ID!) {
        cart(id: $cartId) {
          ...CartFields
        }
      }
      ${cartFragment}
    `;

    const response = await (shopifyClient as any).request(query, { variables: { cartId } });
    let fallbackResponse: any = null;
    if (!response?.data?.cart && cartId.includes('?')) {
      const withoutKey = cartId.split('?')[0];
      console.debug('GET /api/cart - Primary lookup returned null, trying without key:', withoutKey);
      fallbackResponse = await (shopifyClient as any).request(query, { variables: { cartId: withoutKey } });
    }

    const finalCart = response?.data?.cart || fallbackResponse?.data?.cart;
    console.debug('Shopify GET response:', JSON.stringify(finalCart, null, 2));

    if (!finalCart) {
      console.error('Cart not found in Shopify:', cartId);
      throw new CartError('Cart not found', 404);
    }

    console.debug('Cart found successfully:', finalCart.id);
    return NextResponse.json({ success: true, cart: finalCart }, { headers });
  } catch (error: any) {
    console.error('Cart GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch cart',
        details: error.details || error
      },
      { status: error.status || 500, headers }
    );
  }
}

export async function PUT(request: Request) {
  const headers = { 'Content-Type': 'application/json' };

  if (!isShopifyConfigured()) {
    return NextResponse.json({ error: 'Shopify is not configured' }, { status: 500, headers });
  }

  try {
    let body;
    try {
      body = await request.json();
      console.debug('PUT /api/cart received:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body format' },
        { status: 400, headers }
      );
    }

    if (!body.cartId) {
      return NextResponse.json({ error: 'Cart ID is required' }, { status: 400, headers });
    }

    if (!body.items?.length && !body.lines?.length) {
      return NextResponse.json({ error: 'No items or lines provided' }, { status: 400, headers });
    }

    const updateItems = body.lines || body.items;
    console.debug('Updating cart:', JSON.stringify({ 
      cartId: body.cartId,
      items: updateItems
    }, null, 2));

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

    let effectiveCartId: string = body.cartId;
    let cartLookup = await (shopifyClient as any).request(getCartQuery, { variables: { cartId: effectiveCartId } });
    if (!cartLookup?.data?.cart && effectiveCartId.includes('?')) {
      const withoutKey = effectiveCartId.split('?')[0];
      console.debug('PUT /api/cart - primary lookup failed, trying without key:', withoutKey);
      const fallback = await (shopifyClient as any).request(getCartQuery, { variables: { cartId: withoutKey } });
      if (fallback?.data?.cart) {
        effectiveCartId = withoutKey;
        cartLookup = fallback;
      }
    }

    if (!cartLookup?.data?.cart?.lines?.edges) {
      throw new CartError('Cart not found or empty', 404);
    }

    const lineUpdates = updateItems.map((item: any) => {
      if (item.merchandiseId) {
        // For variant updates
        return {
          id: item.id, // This is the line ID
          merchandiseId: item.merchandiseId,
          quantity: parseInt(String(item.quantity))
        };
      } else {
        // For quantity updates
        const lineToUpdate = cartLookup.data.cart.lines.edges.find(
          (edge: any) => edge.node.merchandise.id === String(item.id)
        );

        if (!lineToUpdate) {
          console.error('Cart line lookup failed:', {
            itemId: item.id,
            availableLines: cartLookup.data.cart.lines.edges.map((e: any) => ({
              lineId: e.node.id,
              merchandiseId: e.node.merchandise.id
            }))
          });
          throw new CartError(`Item not found in cart: ${item.id}`, 404);
        }

        return {
          id: lineToUpdate.node.id,
          quantity: parseInt(String(item.quantity))
        };
      }
    });

    const mutation = `
      mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
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

    const response = await (shopifyClient as any).request(mutation, {
      variables: {
        cartId: effectiveCartId,
        lines: lineUpdates
      }
    });

    if (response.data?.cartLinesUpdate?.userErrors?.length > 0) {
      throw new CartError('Failed to update cart', 400, response.data.cartLinesUpdate.userErrors);
    }

    if (!response.data?.cartLinesUpdate?.cart) {
      throw new CartError('No cart returned', 500, { response });
    }

    return NextResponse.json({ success: true, cart: response.data.cartLinesUpdate.cart }, { headers });
  } catch (error: any) {
    console.error('Cart PUT error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update cart',
        details: error.details || error
      },
      { status: error.status || 500, headers }
    );
  }
}

export async function DELETE(request: Request) {
  const headers = { 'Content-Type': 'application/json' };

  if (!isShopifyConfigured()) {
    return NextResponse.json({ error: 'Shopify is not configured' }, { status: 500, headers });
  }

  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('cartId') ? decodeURIComponent(searchParams.get('cartId')!) : null;
    const variantId = searchParams.get('variantId') ? decodeURIComponent(searchParams.get('variantId')!) : null;
    const lineId = searchParams.get('lineId') ? decodeURIComponent(searchParams.get('lineId')!) : null;

    if (!cartId) {
      return NextResponse.json({ error: 'Cart ID is required' }, { status: 400, headers });
    }

    if (!variantId && !lineId) {
      console.debug('No variantId or lineId provided, will clear entire cart');
    }

    console.debug('DELETE /api/cart - Removing from cart:', { cartId, variantId, lineId });

    let cart: ShopifyCart;

    let lineIdsToRemove: string[] = [];

    if (lineId) {
      lineIdsToRemove = [lineId];
    } else {
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
        variables: { cartId }
      });

      if (!cartResponse?.data?.cart) {
        throw new CartError('Cart not found or empty', 404);
      }

      const edges = cartResponse.data.cart.lines?.edges || [];

      if (variantId) {
        const lineToRemove = edges.find((edge: any) => edge.node.merchandise.id === variantId);
        if (!lineToRemove) {
          throw new CartError('Item not found in cart', 404);
        }
        lineIdsToRemove = [lineToRemove.node.id];
      } else {
        // Clear all
        lineIdsToRemove = edges.map((edge: any) => edge.node.id);
        if (lineIdsToRemove.length === 0) {
          return NextResponse.json({ success: true, cart: cartResponse.data.cart }, { headers });
        }
      }
    }

      const mutation = `
        mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
          cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
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

      const response = await (shopifyClient as any).request(mutation, {
        variables: {
          cartId,
          lineIds: lineIdsToRemove
        }
      });

      if (response.data?.cartLinesRemove?.userErrors?.length > 0) {
        throw new CartError('Failed to remove item', 400, response.data.cartLinesRemove.userErrors);
      }

      if (!response.data?.cartLinesRemove?.cart) {
        throw new CartError('No cart returned', 500, { response });
      }

      cart = response.data.cartLinesRemove.cart;

    return NextResponse.json({ success: true, cart }, { headers });
  } catch (error: any) {
    console.error('Cart DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete from cart',
        details: error.details || error
      },
      { status: error.status || 500, headers }
    );
  }
}