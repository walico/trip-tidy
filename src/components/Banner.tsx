import Image from 'next/image';
import Link from 'next/link';

export default function Banner() {
  return (
    <section className="my-12">
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="relative h-64 w-full overflow-hidden rounded-lg bg-gray-100">
          <Image
            src="https://images.unsplash.com/photo-1531973968078-9bb02785f13d?q=80&w=1600&auto=format&fit=crop"
            alt="Mid-season sale banner"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 flex items-center justify-center text-center px-6">
            <div>
              <div className="text-white text-2xl md:text-3xl font-semibold">Mid-Season Sale</div>
              <p className="text-white/90 mt-2">Up to 30% off selected travel essentials</p>
              <Link href="/products" className="inline-block mt-4 btn-primary px-5 py-2 rounded text-sm font-medium">Shop Deals</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
