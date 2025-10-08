import Image from 'next/image';
import Link from 'next/link';

const categories = [
  { slug: 'luggage', title: 'Luggage', img: 'https://images.unsplash.com/photo-1521185496955-15097b20c5fe?q=80&w=1200&auto=format&fit=crop' },
  { slug: 'backpacks', title: 'Backpacks', img: 'https://images.unsplash.com/photo-1514477917009-389c76a86b68?q=80&w=1200&auto=format&fit=crop' },
  { slug: 'accessories', title: 'Accessories', img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop' },
];

export default function CollectionCategories() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl font-semibold">Shop by Category</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link key={c.slug} href={`/collections?c=${c.slug}`} className="group block">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
                <Image src={c.img} alt={c.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div className="mt-3 font-medium group-hover:underline">{c.title}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
