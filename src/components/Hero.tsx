import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">Elevate Your Travel. Pack Smarter.</h1>
          <p className="mt-4 text-gray-600 max-w-prose">Discover curated travel essentials designed for comfort, durability, and style. Make every journey feel effortless.</p>
          <div className="mt-6 flex gap-3">
            <Link href="/products" className="inline-block btn-primary px-5 py-3 text-sm rounded">Shop Now</Link>
            <Link href="/collections" className="inline-block btn-outline px-5 py-3 text-sm rounded">Browse Collections</Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
          <Image
            src="https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1600&auto=format&fit=crop"
            alt="Lifestyle hero with travel gear"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
