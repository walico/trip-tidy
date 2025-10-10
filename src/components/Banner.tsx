import Image from 'next/image';
import Link from 'next/link';

export default function Banner() {
  return (
    <div className="my-12 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid md:grid-cols-[1.3fr_1fr] items-stretch">
          {/* Left: full-bleed image with rounded container */}
          <div className="relative h-64 md:h-[320px] rounded-[10px_0_0_10px] overflow-hidden">
            <Image
              src="/images/bg1.jpg"
              alt="Lifestyle banner"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
            />
          </div>

          {/* Right: copy without background */}
          <div className="p-6 md:p-8 flex flex-col justify-center bg-[#0f172a] rounded-[0_10px_10px_0]">
            <div className="text-xs uppercase tracking-widest text-gray-500">Limited offer</div>
            <h3 className="mt-1 text-4xl md:text-4xl font-semibold leading-tight text-gray-50">35% off only this Friday and get special gift</h3>
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full btn-primary px-5 py-2 text-sm uppercase font-medium text-white"
              >
                Grab it now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
