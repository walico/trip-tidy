import Image from 'next/image';
import Link from 'next/link';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  // Mock product data by id
  const product = {
    id,
    title: `Product ${id.toUpperCase()}`,
    price: '$99',
    img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop',
    desc: 'This is a sample product description. Replace with real product data from your backend.',
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
          <Image src={product.img} alt={product.title} fill className="object-cover" />
        </div>
        <div>
          <nav className="text-sm text-gray-600">
            <Link href="/products" className="hover:underline">Products</Link>
            <span className="mx-2">/</span>
            <span>{product.title}</span>
          </nav>
          <h1 className="mt-4 text-3xl font-semibold">{product.title}</h1>
          <div className="mt-2 text-xl">{product.price}</div>
          <p className="mt-6 text-gray-700">{product.desc}</p>
          <div className="mt-6 flex gap-3">
            <button className="bg-black text-white px-5 py-3 text-sm rounded">Add to Cart</button>
            <button className="border border-gray-300 px-5 py-3 text-sm rounded">Add to Wishlist</button>
          </div>
        </div>
      </div>
    </main>
  );
}
