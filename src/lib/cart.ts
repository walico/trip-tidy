import { cookies } from 'next/headers';
import { shopifyClient, formatPrice } from './shopify';

const CART_ID_COOKIE = 'cartId';

export async function getCart(cartId?: string) {
  if (!cartId) return null;
  
  try {
    const { data } = await (shopifyClient as any).request(
      `query getCart($cartId: ID!) {
        cart(id: $cartId) {
          id
          checkoutUrl
          totalQuantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
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
                    priceV2: price {
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
      }`,
      { variables: { cartId } }
    );
    
    return data.cart;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
}

const CREATE_CART_MUTATION = `
  mutation createCart($input: CartInput) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function createCart() {
  try {
    const { data } = await (shopifyClient as any).request(CREATE_CART_MUTATION, {
      input: {}
    });
    
    if (!data?.cartCreate?.cart) {
      const errorMessage = data?.cartCreate?.userErrors?.[0]?.message || 'Failed to create cart';
      throw new Error(errorMessage);
    }
    
    const { id, checkoutUrl } = data.cartCreate.cart;
    
    // Set the cart ID in a cookie
    // For Next.js 13+ App Router, we'll set a client-side cookie
    // The server component will handle reading this cookie
    if (typeof document !== 'undefined') {
      document.cookie = `${CART_ID_COOKIE}=${id}; path=/; max-age=${60 * 60 * 24 * 30}; sameSite=lax${process.env.NODE_ENV === 'production' ? '; secure' : ''}`;
    }
    
    return { id, checkoutUrl };
  } catch (error) {
    console.error('Error creating cart:', error);
    throw error;
  }
}

export async function addToCart(cartId: string, lines: Array<{ merchandiseId: string; quantity: number }>) {
  try {
    // First add items to cart
    const { data } = await (shopifyClient as any).request(
      `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            totalQuantity
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          cartId,
          lines,
        },
      }
    );

    if (data.cartLinesAdd.userErrors?.length) {
      console.error('Cart add errors:', data.cartLinesAdd.userErrors);
      throw new Error('Failed to add items to cart');
    }
    
    // Then fetch the complete cart data
    const cart = await getCart(cartId);
    if (!cart) {
      throw new Error('Failed to fetch updated cart');
    }
    
    return cart;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

export async function updateCart(cartId: string, updates: Array<{ id: string; quantity: number }>) {
  try {
    const { data } = await (shopifyClient as any).request(
      `mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            totalQuantity
            cost {
              totalAmount {
                amount
                currencyCode
              }
              subtotalAmount {
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
                      product {
                        title
                        handle
                      }
                      price {
                        amount
                        currencyCode
                      }
                      image {
                        url
                        altText
                        width
                        height
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }`,
      {
        variables: {
          cartId,
          lines: updates.map(update => ({
            id: update.id,
            quantity: update.quantity,
          })),
        },
      }
    );
    
    return data.cartLinesUpdate.cart;
  } catch (error) {
    console.error('Error updating cart:', error);
    throw error;
  }
}

export async function removeFromCart(cartId: string, lineIds: string[]) {
  try {
    const { data } = await (shopifyClient as any).request(
      `mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            id
            checkoutUrl
            totalQuantity
            cost {
              totalAmount {
                amount
                currencyCode
              }
              subtotalAmount {
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
                      product {
                        title
                        handle
                      }
                      price {
                        amount
                        currencyCode
                      }
                      image {
                        url
                        altText
                        width
                        height
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }`,
      {
        variables: {
          cartId,
          lineIds,
        },
      }
    );
    
    return data.cartLinesRemove.cart;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
}
