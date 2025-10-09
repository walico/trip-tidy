"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import Cart from './Cart';

// NavLink component for consistent styling
function NavLink({ 
  href, 
  isActive, 
  onClick, 
  children 
}: { 
  href: string; 
  isActive: boolean; 
  onClick?: () => void; 
  children: React.ReactNode 
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-4 py-2 text-base font-medium rounded-md transition-colors ${
        isActive 
          ? 'text-[var(--color-primary)] bg-gray-50' 
          : 'text-gray-700 hover:text-[var(--color-primary)] hover:bg-gray-50'
      }`}
    >
      {children}
    </Link>
  );
}

export default function NavBar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemCount } = useCart();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    console.log('Searching for:', searchQuery);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav 
      ref={menuRef}
      className={`sticky top-0 z-50 bg-white border-b border-gray-200 transition-all duration-300 ${
        isScrolled ? 'shadow-sm' : ''
      }`}
    >
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-8 border-b border-gray-100">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-700 hover:text-gray-900 focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
        
        <Link href="/" className="font-extrabold text-gray-800" onClick={closeMenu}>
          <span className="text-2xl uppercase" style={{ fontFamily: 'Playfair Display' }}>Trip And Tidy</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="text-gray-700 hover:text-gray-900"
            aria-label="Search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
          </button>
          
          <button 
            className="relative text-gray-700 hover:text-gray-900"
            onClick={(e) => {
              e.preventDefault();
              setIsCartOpen(!isCartOpen);
              closeMenu();
            }}
            aria-label="Cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M3 3h2l3.6 7.59a2 2 0 0 0 1.8 1.18H19a2 2 0 0 0 2-1.5l1-4H6"/>
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--color-primary)] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-7xl px-4 py-3 grid grid-cols-3 items-center">
          {/* Left: search */}
          <div className="flex items-center">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="icon-link text-gray-700 hover:text-gray-900 transition-colors" 
              aria-label="Search"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
            </button>
          </div>

          {/* Center: logo */}
          <div className="font-extrabold text-center uppercase" style={{ fontFamily: 'Playfair Display' }}>
            <Link href="/" className="flex flex-col items-center leading-[-5em] text-gray-800 duration-300">
              <span className="text-4xl font-bold">Trip And</span>
              <span className="text-4xl font-extrabold">Tidy</span>
            </Link>
          </div>

          {/* Right: icons */}
          <div className="flex items-center justify-end gap-5 text-xl text-gray-700">
            <Link className={`icon-link ${isActive('/wishlist') ? 'text-[var(--color-primary)]' : ''}`} href="/wishlist" aria-label="Wishlist">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>
              </svg>
            </Link>
            <Link className={`icon-link ${isActive('/account') ? 'text-[var(--color-primary)]' : ''}`} href="/account" aria-label="Account">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21a8 8 0 1 0-16 0"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
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
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-100">
                  <Cart />
                </div>
              )}
            </div>
          </div>
        </div>
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
      
      {/* Mobile menu */}
      <div 
        className={`lg:hidden bg-white overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-screen' : 'max-h-0'
        }`}
      >
        <div className="px-4 py-2 space-y-1">
          <NavLink href="/" isActive={pathname === '/'} onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink href="/products" isActive={isActive('/products')} onClick={closeMenu}>
            Shop All
          </NavLink>
          <NavLink href="/collections" isActive={isActive('/collections')} onClick={closeMenu}>
            Collections
          </NavLink>
          <NavLink href="/new-arrivals" isActive={pathname === '/new-arrivals'} onClick={closeMenu}>
            New Arrivals
          </NavLink>
          <NavLink href="/best-sellers" isActive={pathname === '/best-sellers'} onClick={closeMenu}>
            Best Sellers
          </NavLink>
          <NavLink href="/sale" isActive={pathname === '/sale'} onClick={closeMenu}>
            Sale
          </NavLink>
          <div className="border-t border-gray-100 my-2"></div>
          <NavLink href="/account" isActive={pathname === '/account'} onClick={closeMenu}>
            My Account
          </NavLink>
          <NavLink href="/wishlist" isActive={pathname === '/wishlist'} onClick={closeMenu}>
            Wishlist
          </NavLink>
        </div>
      </div>

      {/* Desktop navigation */}
      <div className="hidden lg:block border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex justify-center space-x-6 py-3 text-gray-600">
            <NavLink href="/" isActive={pathname === '/'}>
              Home
            </NavLink>
            <NavLink href="/products" isActive={isActive('/products')}>
              Shop All
            </NavLink>
            <NavLink href="/collections" isActive={isActive('/collections')}>
              Collections
            </NavLink>
            <NavLink href="/new-arrivals" isActive={pathname === '/new-arrivals'}>
              New Arrivals
            </NavLink>
            <NavLink href="/best-sellers" isActive={pathname === '/best-sellers'}>
              Best Sellers
            </NavLink>
            <NavLink href="/sale" isActive={pathname === '/sale'}>
              Sale
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}