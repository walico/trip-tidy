"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };
  return (
    <nav className="bg-white border-b border-gray-200">
      {/* Top row: search left, logo center, other icons right */}
      <div className="mx-auto max-w-7xl px-4 py-3 grid grid-cols-3 items-center">
        {/* Left: search */}
        <div className="flex items-center">
          <Link className="icon-link text-gray-700" href="/search" aria-label="Search">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          </Link>
        </div>
        {/* Center: logo */}
        <div className="text-xl font-semibold text-center">
          <Link href="/" className={isActive('/') ? 'text-[var(--color-primary)]' : ''}>Trip&Tidy</Link>
        </div>
        {/* Right: remaining icons */}
        <div className="flex items-center justify-end gap-5 text-gray-700">
          <Link className={`icon-link ${isActive('/account') ? 'text-[var(--color-primary)]' : ''}`} href="/account" aria-label="Account">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>
          </Link>
          <Link className={`icon-link ${isActive('/checkout') ? 'text-[var(--color-primary)]' : ''}`} href="/checkout" aria-label="Checkout">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18l-2 13H5L3 6Z"/><path d="M16 10V6"/><path d="M8 10V6"/></svg>
          </Link>
          <Link className={`icon-link ${isActive('/cart') ? 'text-[var(--color-primary)]' : ''}`} href="/cart" aria-label="Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M3 3h2l3.6 7.59a2 2 0 0 0 1.8 1.18H19a2 2 0 0 0 2-1.5l1-4H6"/></svg>
          </Link>
          <Link className={`icon-link ${isActive('/wishlist') ? 'text-[var(--color-primary)]' : ''}`} href="/wishlist" aria-label="Wishlist">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
          </Link>
        </div>
      </div>
      
      {/* Bottom row: primary menu */}
      <div className="mx-auto max-w-7xl px-4 pb-3">
        <div className="flex items-center justify-center gap-6 text-sm text-gray-700">
          <Link className={`nav-link ${isActive('/products') ? 'text-[var(--color-primary)]' : ''}`} href="/products">Shop All</Link>
          <Link className={`nav-link ${isActive('/collections') ? 'text-[var(--color-primary)]' : ''}`} href="/collections">Collections</Link>
          <Link className={`nav-link ${pathname === '/' ? 'text-[var(--color-primary)]' : ''}`} href="/">New Arrivals</Link>
          <Link className={`nav-link ${pathname === '/' ? 'text-[var(--color-primary)]' : ''}`} href="/">Best Sellers</Link>
          <Link className={`nav-link ${pathname === '/' ? 'text-[var(--color-primary)]' : ''}`} href="/">Sale</Link>
        </div>
      </div>
    </nav>
  );
}
