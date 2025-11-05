import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCart } from '@/lib/cart';
import CartContent from './CartContent';

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const cookiesList = await cookies();
  const cartId = cookiesList.get('cartId')?.value;
  
  if (!cartId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link
          href="/products"
          className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }
  
  try {
    const cart = await getCart(cartId);
    
    if (!cart || !cart.lines?.edges || cart.lines.edges.length === 0) {
      return (
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link
            href="/products"
            className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      );
    }
    
    return <CartContent cart={cart} />;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Error loading your cart</h1>
        <p className="mb-8">There was an error loading your cart. Please try again.</p>
        <Link
          href="/products"
          className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }
}
