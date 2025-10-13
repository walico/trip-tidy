import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import Image from 'next/image';

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
              <div className="h-8 w-8 relative opacity-70 hover:opacity-100">
                <Image 
                  src="/images/visa.png" 
                  alt="Visa" 
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              </div>
              
              {/* Mastercard */}
              <div className="h-8 w-8 relative opacity-70 hover:opacity-100">
                <Image 
                  src="/images/mastercard.png" 
                  alt="Mastercard" 
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              </div>  
              
              {/* PayPal */}
              <div className="h-10 w-10 relative opacity-70 hover:opacity-100">
                <Image 
                  src="/images/paypal1.png" 
                  alt="PayPal" 
                  fill
                  sizes="120px"
                  className="object-contain"
                />
              </div>
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
