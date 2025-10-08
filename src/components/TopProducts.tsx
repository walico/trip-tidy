import Image from 'next/image';
import Link from 'next/link';

const products = [
  { id: 'tp1', title: 'Weekender Duffel', price: '$140', img: 'https://images.unsplash.com/photo-1520975922324-6ae4c1a2a6c5?q=80&w=1200&auto=format&fit=crop' },
  { id: 'tp2', title: 'Compression Cubes', price: '$35', img: 'https://images.unsplash.com/photo-1582582621959-48d7a41f0c23?q=80&w=1200&auto=format&fit=crop' },
  { id: 'tp3', title: 'Travel Organizer', price: '$29', img: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=1200&auto=format&fit=crop' },
  { id: 'tp4', title: 'Sling Bag', price: '$60', img: 'https://images.unsplash.com/photo-1582582621995-f3d7ed1c2b7a?q=80&w=1200&auto=format&fit=crop' },
];

export default function TopProducts() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl font-semibold">Top Picks</h2>
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
