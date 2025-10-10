import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { li } from 'framer-motion/client';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">SHOP</h3>
            <ul className="space-y-3">
              <li><Link href="/products" className="text-sm text-gray-500 hover:text-gray-900">All Products</Link></li>
              <li><Link href="/collections" className="text-sm text-gray-500 hover:text-gray-900">Collections</Link></li>
              <li><Link href="/new-arrivals" className="text-sm text-gray-500 hover:text-gray-900">Trending</Link></li>
              <li><Link href="/new-arrivals" className="text-sm text-gray-500 hover:text-gray-900">New Arrivals</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">HELP</h3>
            <ul className="space-y-3">
              <li><Link href="/shipping" className="text-sm text-gray-500 hover:text-gray-900">Shipping</Link></li>
              <li><Link href="/returns" className="text-sm text-gray-500 hover:text-gray-900">Returns & Exchanges</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">ABOUT</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-gray-500 hover:text-gray-900">Our Story</Link></li>
              <li><Link href="/blog" className="text-sm text-gray-500 hover:text-gray-900">Journal</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-500 hover:text-gray-900">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">CONNECT</h3>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
            
            <h3 className="text-sm font-medium text-gray-900 mb-3">WE ACCEPT</h3>
            <div className="flex items-center space-x-3">
              {/* Visa */}
              <svg className="h-6 w-10 opacity-70 hover:opacity-100" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#1A1F71"/>
                <path d="M35 0c1.7 0 3 1.3 3 3v18c0 1.7-1.4 3-3 3h-5.3L35 0z" fill="#F7A600"/>
                <path d="M12.9 15.4h-2.2l-1.3-8.7h2.2l.8 6.4 3.5-6.4h2.1l-3.6 6.4 1.1 2.3h-2.4l-1.2-2.4-1.1 2.4z" fill="#fff"/>
              </svg>
              
              {/* Mastercard */}
              <svg className="h-6 w-10 opacity-70 hover:opacity-100" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#252525"/>
                <path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32z" fill="#FF5F00"/>
                <path d="M19 17.5c2.8 0 5-2.2 5-5s-2.2-5-5-5-5 2.2-5 5 2.2 5 5 5z" fill="#EB001B"/>
                <path d="M19 17.5c1.1 0 2.1-.4 2.9-1.1-1.4-.9-2.3-2.5-2.3-4.2 0-1.7.9-3.3 2.3-4.2-.8-.7-1.8-1.1-2.9-1.1-2.8 0-5 2.2-5 5s2.2 5 5 5z" fill="#F79E1B"/>
              </svg>
              
              {/* PayPal */}
              <svg className="h-6 w-10 opacity-70 hover:opacity-100" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#002987"/>
                <path d="M28.5 6.5c-.7-.8-1.7-1.2-2.9-1.2h-8.5c-.4 0-.7.3-.8.7l-2.1 13.5c0 .2.1.3.3.3h3.9c.2 0 .4-.2.4-.4l.5-3.3c0-.2.2-.4.4-.4h2.4c3.5 0 6.2-.8 7-3.4.4-1.2.3-2.3-.4-3.2z" fill="#009CDE"/>
                <path d="M27.3 7.3c-.7-.8-1.8-1.2-3-1.2H15.8c-.4 0-.7.3-.8.7l-2.1 13.5c0 .2.1.3.3.3h4.5l1.2-7.7c0-.2.2-.4.4-.4h2.4c3.5 0 6.2-.8 7-3.4.2-.7.2-1.3.1-1.8z" fill="#00186A"/>
              </svg>
              
              {/* Apple Pay */}
              <svg className="h-6 w-10 opacity-70 hover:opacity-100" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#000"/>
                <path d="M19 17.5c-1.9 0-3.4-1.5-3.4-3.4 0-1.9 1.5-3.4 3.4-3.4 1.9 0 3.4 1.5 3.4 3.4 0 1.9-1.5 3.4-3.4 3.4z" fill="#fff"/>
                <path d="M19 11.7c-1.3 0-2.4 1.1-2.4 2.4s1.1 2.4 2.4 2.4 2.4-1.1 2.4-2.4c0-1.3-1.1-2.4-2.4-2.4zm0 3.3c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9z" fill="#000"/>
                <path d="M19 12.6c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5-.7-1.5-1.5-1.5z" fill="#000"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-8">
          <p className="text-xs text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Trip&Tidy. All rights reserved.
          </p>
          <div className="mt-2 flex justify-center space-x-6 text-xs">
            <Link href="/privacy" className="text-gray-500 hover:text-gray-700">Privacy Policy</Link>
            <span className="text-gray-300">|</span>
            <Link href="/terms" className="text-gray-500 hover:text-gray-700">Terms of Service</Link>
            <span className="text-gray-300">|</span>
            <Link href="/cookies" className="text-gray-500 hover:text-gray-700">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
