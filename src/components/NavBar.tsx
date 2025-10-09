"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import Cart from './Cart';

export default function NavBar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount } = useCart();

  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isCartOpen && !target.closest('.cart-container')) {
        setIsCartOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCartOpen]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic here
    console.log('Searching for:', searchQuery);
    // You can add navigation or other search logic here
  };
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* Top row: search left, logo center, other icons right */}
      <div className="mx-auto max-w-7xl px-4 py-3 grid grid-cols-3 items-center">
        {/* Left: search */}
        <div className="flex items-center">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="icon-link text-gray-700" 
            aria-label="Search"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
        </div>

        {/* Search Overlay */}
        {isSearchOpen && (
          <div className="fixed inset-0 bg-white z-50 h-[calc(100vh-75vh)] flex items-center justify-center">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="w-6"></div> {/* Spacer to balance the layout */}
                <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
                  <div className="relative w-full max-w-2xl">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full text-lg py-2 px-1 border-0 border-b-2 border-black text-gray-500 font-regular placeholder-gray-500"
                    />
                    <button 
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      aria-label="Search"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="7"/>
                        <path d="m21 21-4.3-4.3"/>
                      </svg>
                    </button>
                  </div>
                </form>
                <button 
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="text-gray-700 hover:text-gray-900 text-xl w-6 flex items-center justify-center cursor-pointer"
                  aria-label="Close search"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
       {/* Center: logo */}
        <div className="font-extrabold text-center uppercase" style={{ fontFamily: 'Playfair Display' }}>
          <Link href="/" className="flex flex-col items-center leading-[-5em] text-gray-800 duration-300">
            <span className="text-4xl font-bold">Trip And</span>
            <span className="text-4xl font-extrabold">Tidy</span>
          </Link>
        </div>


        {/* Right: remaining icons */}
        <div className="flex items-center justify-end gap-5 text-xl text-gray-700">
          {/* <Link className={`icon-link ${isActive('/checkout') ? 'text-[var(--color-primary)]' : ''}`} href="/checkout" aria-label="Checkout">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18l-2 13H5L3 6Z"/><path d="M16 10V6"/><path d="M8 10V6"/></svg>
          </Link> */}
          <Link className={`icon-link ${isActive('/wishlist') ? 'text-[var(--color-primary)]' : ''}`} href="/wishlist" aria-label="Wishlist">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>
            </svg>
          </Link>
          <Link className={`icon-link ${isActive('/account') ? 'text-[var(--color-primary)]' : ''}`} href="/account" aria-label="Account">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>
          </Link>
          <div className="relative">
            <button 
              onClick={(e) => {
                e.preventDefault();
                setIsCartOpen(!isCartOpen);
              }}
              className={`icon-link relative cursor-pointer ${isCartOpen ? 'text-[var(--color-primary)]' : ''}`}
              aria-label="Cart"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M3 3h2l3.6 7.59a2 2 0 0 0 1.8 1.18H19a2 2 0 0 0 2-1.5l1-4H6"/>
              </svg>
              {itemCount > 0 && (
                <span className="absolute -bottom-2 -right-3 bg-[var(--color-primary)] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            
            {/* Cart Dropdown */}
            {isCartOpen && (
              <div className="absolute right-0 mt-2 w-100 bg-white rounded-lg shadow-xl z-50 border border-gray-100">
                <Cart />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom row: primary menu */}
      <div className="mx-auto max-w-7xl px-4 pb-3">
        <div className="flex justify-center space-x-6 text-gray-500">
          <Link className={`nav-link ${pathname === '/' ? 'text-[var(--color-primary)]' : ''}`} href="/">Home</Link>
          <Link className={`nav-link ${isActive('/products') ? 'text-[var(--color-primary)]' : ''}`} href="/products">Shop All</Link>
          <Link className={`nav-link ${isActive('/collections') ? 'text-[var(--color-primary)]' : ''}`} href="/collections">Collections</Link>
          <Link className={`nav-link ${pathname === '/new-arrivals' ? 'text-[var(--color-primary)]' : ''}`} href="/new-arrivals">New Arrivals</Link>
          <Link className={`nav-link ${pathname === '/best-sellers' ? 'text-[var(--color-primary)]' : ''}`} href="/best-sellers">Best Sellers</Link>
          <Link className={`nav-link ${pathname === '/sale' ? 'text-[var(--color-primary)]' : ''}`} href="/sale">Sale</Link>
        </div>
      </div>
    </nav>
  );
}
