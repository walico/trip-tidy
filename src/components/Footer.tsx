import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-lg font-semibold">Trip&Tidy</div>
          <p className="mt-3 text-sm text-white/80">Travel gear made for modern journeys — blending durability, utility, and style.</p>
        </div>
        <div>
          <div className="font-medium">Shop</div>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li><Link href="/products" className="hover:underline">All Products</Link></li>
            <li><Link href="/collections" className="hover:underline">Collections</Link></li>
            <li><Link href="/" className="hover:underline">New Arrivals</Link></li>
            <li><Link href="/" className="hover:underline">Best Sellers</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-medium">Support</div>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li><Link href="/" className="hover:underline">Help Center</Link></li>
            <li><Link href="/" className="hover:underline">Shipping & Returns</Link></li>
            <li><Link href="/" className="hover:underline">Warranty</Link></li>
            <li><Link href="/" className="hover:underline">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-medium">Company</div>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li><Link href="/" className="hover:underline">About</Link></li>
            <li><Link href="/" className="hover:underline">Careers</Link></li>
            <li><Link href="/" className="hover:underline">Sustainability</Link></li>
            <li><Link href="/" className="hover:underline">Press</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/70">
          <div>© {new Date().getFullYear()} Trip&Tidy. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:underline">Terms</Link>
            <Link href="/" className="hover:underline">Privacy</Link>
            <Link href="/" className="hover:underline">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
