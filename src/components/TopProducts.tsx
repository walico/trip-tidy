import Image from 'next/image';
import Link from 'next/link';

type Promo = {
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
  bg: string; // background color class
};

const promos: Promo[] = [
  {
    title: 'Long Sofa',
    subtitle: 'Structure almost highlights',
    cta: 'SHOP NOW',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1582582621995-f3d7ed1c2b7a?q=80&w=1600&auto=format&fit=crop',
    bg: 'bg-[#FFF2EA]',
  },
  {
    title: 'Dining Chair',
    subtitle: 'Structure almost highlights',
    cta: 'SHOP NOW',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?q=80&w=1600&auto=format&fit=crop',
    bg: 'bg-[#EAF2F5]',
  },
];

export default function TopProducts() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {promos.map((p) => (
            <div key={p.title} className={`${p.bg} rounded-lg overflow-hidden`}> 
              <div className="relative grid grid-cols-1 md:grid-cols-2 items-center">
                {/* Left content */}
                <div className="p-8 md:p-10">
                  <h3 className="text-2xl font-semibold text-gray-800">{p.title}</h3>
                  <p className="text-gray-500 mt-2">{p.subtitle}</p>
                  <Link href={p.href} className="mt-6 inline-block text-[var(--color-primary)] font-medium underline underline-offset-4">
                    {p.cta}
                  </Link>
                </div>
                {/* Right image */}
                <div className="relative h-64 md:h-full min-h-[260px]">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className="object-contain p-6 md:p-10"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
