import Image from 'next/image';
import Link from 'next/link';

const products = [
  { id: 'p1', title: 'Carry-On Luggage', price: '$180', img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop' },
  { id: 'p2', title: 'Travel Backpack', price: '$120', img: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=1200&auto=format&fit=crop' },
  { id: 'p3', title: 'Packing Cubes Set', price: '$45', img: 'https://images.unsplash.com/photo-1586015555751-63eb0ae5d5ae?q=80&w=1200&auto=format&fit=crop' },
  { id: 'p4', title: 'Neck Pillow', price: '$25', img: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1200&auto=format&fit=crop' },
];

export default function FeaturedProducts() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Featured Products</h2>
          <Link href="/products" className="text-sm text-gray-600 hover:underline">View all</Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <Link key={p.id} href={`/products/${p.id}`} className="group block">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                <Image src={p.img} alt={p.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="font-medium group-hover:underline">{p.title}</div>
                <div className="text-gray-700 text-sm">{p.price}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
