"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';

interface NavLinkProps {
  href: string;
  isActive: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// NavLink with light font weight and custom active color
const NavLink = ({ href, isActive, onClick, children }: NavLinkProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={`block p-2 text-base font-medium rounded-md transition-colors ${
      isActive
        ? 'text-[#be7960cc]'
        : 'text-gray-700 hover:text-[#be7960cc]'
    }`}
  >
    {children}
  </Link>
);

const NavBar = () => {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { itemCount } = useCart();
  const [mounted, setMounted] = useState(false);

  // Set mounted for client-only rendering
  useEffect(() => setMounted(true), []);
  const showCartCount = mounted && itemCount > 0;

  // Close menu when clicking outside & handle scroll shadow
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleScroll = () => setIsScrolled(window.scrollY > 10);

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav
      ref={menuRef}
      className={`sticky top-0 z-50 bg-white border-b border-gray-200 transition-all duration-300 ${
        isScrolled ? 'shadow-sm' : ''
      }`}
    >
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-8 border-b border-gray-100">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-700 hover:text-gray-900 focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <Link href="/" onClick={closeMenu} className="font-extrabold text-gray-800 uppercase text-2xl" style={{ fontFamily: 'Playfair Display' }}>
          Trip And Tidy
        </Link>

        <div className="flex items-center space-x-4">
          <button onClick={() => setIsSearchOpen(true)} className="text-gray-700 hover:text-gray-900" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          <Link href="/cart" className="p-2 text-gray-600 hover:text-gray-900 relative" aria-label={`Cart (${itemCount})`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {showCartCount && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-7xl px-4 py-3 grid grid-cols-3 items-center">
          {/* Left: Search */}
          <div className="flex items-center">
            <button onClick={() => setIsSearchOpen(true)} className="text-gray-700 hover:text-gray-900" aria-label="Search">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          </div>

          {/* Center: Logo */}
          <div className="font-extrabold text-center uppercase" style={{ fontFamily: 'Playfair Display' }}>
            <Link href="/" className="flex flex-col items-center leading-[-5em] text-gray-800 duration-300">
              <span className="text-3xl font-bold">Trip And</span>
              <span className="text-3xl font-extrabold">Tidy</span>
            </Link>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center justify-end gap-5 text-xl text-gray-700">
            <Link className={`icon-link ${isActive('/wishlist') ? 'text-[#be7960cc]' : ''}`} href="/wishlist" aria-label="Wishlist">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
              </svg>
            </Link>
            <Link className={`icon-link ${isActive('/account/login') ? 'text-[#be7960cc]' : ''}`} href="/account/login" aria-label="Account">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21a8 8 0 1 0-16 0" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
            <Link href="/cart" className="p-2 text-gray-600 hover:text-gray-900 relative" aria-label={`Cart (${itemCount})`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {showCartCount && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="w-6"></div>
              <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </form>
              <button
                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                className="text-gray-700 hover:text-gray-900 text-xl w-6 flex items-center justify-center cursor-pointer"
                aria-label="Close search"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      <div className={`lg:hidden bg-white overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="px-4 py-2 space-y-1">
          <NavLink href="/" isActive={pathname === '/'} onClick={closeMenu}>Home</NavLink>
          <NavLink href="/products" isActive={isActive('/products')} onClick={closeMenu}>Products</NavLink>
          <NavLink href="/collections" isActive={isActive('/collections')} onClick={closeMenu}>Collections</NavLink>
          {/* <NavLink href="/trending" isActive={pathname === '/trending'} onClick={closeMenu}>Trending</NavLink> */}
          <NavLink href="/contact" isActive={pathname === '/contact'} onClick={closeMenu}>Contact</NavLink>
          <div className="border-t border-[#be7960cc] my-2"></div>
          <NavLink href="/account/login" isActive={pathname === '/account/login'} onClick={closeMenu}>My Account</NavLink>
          <NavLink href="/wishlist" isActive={pathname === '/wishlist'} onClick={closeMenu}>Wishlist</NavLink>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:block ">
        <div className="mx-auto max-w-7xl px-4 border-t border-[#be7960cc]">
          <div className="flex justify-center space-x-6 py-3 text-gray-600 font-light">
            <NavLink href="/" isActive={pathname === '/'}>Home</NavLink>
            <NavLink href="/products" isActive={isActive('/products')}>Products</NavLink>
            <NavLink href="/collections" isActive={isActive('/collections')}>Collections</NavLink>
            {/* <NavLink href="/trending" isActive={pathname === '/trending'}>Trending</NavLink> */}
            <NavLink href="/contact" isActive={pathname === '/contact'}>Contact</NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
