import { NextResponse } from 'next/server';
import { updateCartItemVariant } from '@/lib/shopify/cart';

export async function POST(request: Request) {
  try {
    const { lineId, variantId, cartId } = await request.json();
    
    if (!lineId || !variantId || !cartId) {
      return NextResponse.json(
        { error: 'Missing required parameters: lineId, variantId, or cartId' },
        { status: 400 }
      );
    }

    const result = await updateCartItemVariant(lineId, variantId, cartId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update variant' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating variant:', error);
    return NextResponse.json(
      { error: 'Failed to update variant. Please try again.' },
      { status: 500 }
    );
  }
}
