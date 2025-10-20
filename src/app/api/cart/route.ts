import { NextRequest, NextResponse } from 'next/server';
import { shopifyClient } from '@/lib/shopify';

// Create or update cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchandiseId, quantity } = body;

    if (!merchandiseId || !quantity) {
      console.error('Missing required fields:', { merchandiseId, quantity });
      return NextResponse.json(
        { success: false, error: 'Merchandise ID and quantity are required' },
        { status: 400 }
      );
    }

    if (!merchandiseId.startsWith('gid://shopify/ProductVariant/')) {
      console.error('Invalid merchandiseId format:', merchandiseId);
      return NextResponse.json(
        { success: false, error: 'Invalid merchandise ID format' },
        { status: 400 }
      );
    }

    const query = `
      mutation createCart($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
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
            lines {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      image {
                        url
                        altText
                      }
                      product {
                        id
                        title
                        handle
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

    const variables = {
      input: {
        lines: [
          {
            merchandiseId,
            quantity,
          },
        ],
      },
    };

    const response = await shopifyClient.request(query, { variables });

    if (Array.isArray(response.errors) && response.errors.length > 0) {
      console.error('GraphQL Errors:', response.errors);
      return NextResponse.json(
        { success: false, error: response.errors[0]?.message || 'Failed to create cart' },
        { status: 400 }
      );
    }

    if (!response.data?.cartCreate?.cart) {
      console.error('Cart creation failed: No cart returned');
      console.error('Full response data:', JSON.stringify(response.data, null, 2));
      return NextResponse.json(
        { success: false, error: 'Cart creation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data.cartCreate.cart,
    });
  } catch (error) {
    console.error('Error creating cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create cart' },
      { status: 500 }
    );
  }
}

// Get cart by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('cartId');

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: 'Cart ID is required' },
        { status: 400 }
      );
    }

    const query = `
      query getCart($cartId: ID!) {
        cart(id: $cartId) {
          id
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
          lines {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    image {
                      url
                      altText
                    }
                    product {
                      id
                      title
                      handle
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await shopifyClient.request(query, {
      variables: { cartId },
    });

    return NextResponse.json({
      success: true,
      data: response.data.cart,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}
