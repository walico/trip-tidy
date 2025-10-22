import { NextRequest, NextResponse } from 'next/server';
import { shopifyClient, PRODUCT_FIELDS } from '@/lib/shopify';

export async function GET(request: NextRequest) {
  if (!shopifyClient) {
    return NextResponse.json({ error: 'Shopify client not configured' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection');
    const limit = parseInt(searchParams.get('limit') || '10');
    const cursor = searchParams.get('cursor');

    let query;
    let variables: any = { first: limit };

    if (cursor) {
      variables.after = cursor;
    }

    if (collection) {
      // Get products from specific collection
      query = `
        query getCollectionProducts($handle: String!, $first: Int!, $after: String) {
          collection(handle: $handle) {
            id
            title
            products(first: $first, after: $after) {
              edges {
                node {
                  ...ProductFields
                }
                cursor
              }
              pageInfo {
                hasNextPage
                hasPreviousPage
              }
            }
          }
        }
        ${PRODUCT_FIELDS}
      `;
      variables.handle = collection;
    } else {
      // Get all products
      query = `
        query getProducts($first: Int!, $after: String) {
          products(first: $first, after: $after) {
            edges {
              node {
                ...ProductFields
              }
              cursor
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
        ${PRODUCT_FIELDS}
      `;
    }

    const response = await (shopifyClient as any).request(query, {
      variables,
    });

    return NextResponse.json({
      success: true,
      data: collection ? response.data.collection : response.data.products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
