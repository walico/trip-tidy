import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative">
      <div className="relative h-[70vh] min-h-[420px] w-full">
        <Image
          src="/images/bg1.jpg"
          alt="Lifestyle hero with travel gear"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white">Elevate Your Travel. Pack Smarter.</h1>
            <p className="mt-4 text-white/90">Discover curated travel essentials designed for comfort, durability, and style. Make every journey feel effortless.</p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/products" className="inline-block btn-primary px-5 py-3 text-sm rounded">Shop Now</Link>
              <Link href="/collections" className="inline-block btn-outline px-5 py-3 text-sm rounded bg-white/10 text-white border-white/70">Browse Collections</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
