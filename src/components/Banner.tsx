import Image from 'next/image';
import Link from 'next/link';

export default function Banner() {
  return (
    <div className="my-12 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid md:grid-cols-[1.3fr_1fr] items-stretch gap-0 md:gap-0">
          {/* Left: Image */}
          <div className="relative h-64 md:h-[320px] rounded-t-[10px] md:rounded-l-[10px] md:rounded-tr-none overflow-hidden">
            <Image
              src="/images/bg1.jpg"
              alt="Lifestyle banner"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
            />
          </div>

          {/* Right: Text */}
          <div className="p-6 md:p-8 flex flex-col justify-center bg-[#0f172a] rounded-b-[10px] md:rounded-r-[10px] md:rounded-bl-none">
            <div className="text-xs uppercase tracking-widest text-gray-400">Limited offer</div>
            <h3 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight text-gray-50">
              35% off only this Friday and get a special gift
            </h3>
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-[#be7960] px-5 py-2 text-sm uppercase font-medium text-white hover:bg-[#a86b54] transition"
              >
                Grab it now
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
