import { NextResponse } from 'next/server';
import { shopifyClient, COLLECTION_FIELDS } from '@/lib/shopify';

export async function GET() {
  if (!shopifyClient) {
    return NextResponse.json({ error: 'Shopify client not configured' }, { status: 500 });
  }

  try {
    const query = `
      query getCollections($first: Int!) {
        collections(first: $first) {
          edges {
            node {
              ...CollectionFields
            }
          }
        }
      }
      ${COLLECTION_FIELDS}
    `;

    const response = await shopifyClient.request(query, {
      variables: { first: 20 },
    });

    return NextResponse.json({
      success: true,
      data: response.data.collections,
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}
