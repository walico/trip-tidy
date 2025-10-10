"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Star, Truck, Shield, ChevronLeft, Check, ChevronRight, ChevronLeft as ChevronLeftIcon, Heart } from 'lucide-react';
import Footer from '@/components/Footer';
import TopProducts from '@/components/TopProducts';

// Create a client component that handles the product display
function ProductDetailContent({ id }: { id: string }) {
  const { addToCart } = useCart();
  // Product data - in a real app, this would come from an API
  const product = {
    id,
    title: `Premium Travel Backpack ${id.toUpperCase()}`,
    price: 129.99,
    originalPrice: 159.99,
    rating: 4.8,
    reviewCount: 124,
    inStock: true,
    colors: ['Black', 'Navy', 'Olive'],
    sizes: ['S', 'M', 'L', 'XL'],
    features: [
      'Water-resistant fabric',
      'Laptop compartment fits up to 17"',
      'TSA-approved lock',
      'USB charging port',
      'Lifetime warranty'
    ],
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'The ultimate travel companion designed for modern explorers. This premium backpack combines style, durability, and functionality with multiple compartments to keep your belongings organized and easily accessible during your adventures.',
  };

  // State for the component
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[1]);
  const [quantity, setQuantity] = useState(1);

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-primary">
                  Products
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">{product.title}</span>
              </div>
            </li>
          </ol>
        </nav>
        
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          {/* Product images */}
          <div className="flex flex-col">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100 mb-4">
              <Image 
                src={product.images[selectedImage]} 
                alt={product.title} 
                fill 
                className="object-cover" 
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square overflow-hidden rounded-md border-2 transition-all ${
                    selectedImage === index ? 'border-primary' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image 
                    src={image} 
                    alt={`${product.title} view ${index + 1}`} 
                    fill 
                    className="object-cover"
                    sizes="(max-width: 1024px) 25vw, 12.5vw"
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Product details */}
          <div className="mt-6 lg:mt-0 lg:pl-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{product.title}</h1>
            
            {/* Price and rating */}
            <div className="mt-4">
              <div className="flex items-center">
                <p className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
                {product.originalPrice && (
                  <>
                    <p className="ml-3 text-lg text-gray-500 line-through">${product.originalPrice.toFixed(2)}</p>
                    <span className="ml-3 rounded bg-red-100 px-2.5 py-0.5 text-sm font-semibold text-red-800">
                      Save ${(product.originalPrice - product.price).toFixed(2)}
                    </span>
                  </>
                )}
              </div>
              
              <div className="mt-3 flex items-center">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <Star
                      key={rating}
                      className={`h-5 w-5 flex-shrink-0 ${
                        rating < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      aria-hidden="true"
                      fill={rating < Math.floor(product.rating) ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <p className="ml-2 text-sm text-gray-500">
                  {product.rating} <span className="text-gray-400">•</span> {product.reviewCount} reviews
                </p>
              </div>
            </div>

          {/* Description */}
          <div className="mt-6">
            <h2 className="text-sm font-medium text-gray-900">Description</h2>
            <p className="mt-2 text-base text-gray-600">{product.description}</p>
          </div>

          {/* Color selection */}
          {/* <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900">Color: <span className="font-normal">{selectedColor}</span></h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`relative w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                    selectedColor === color ? 'border-primary' : 'border-transparent hover:border-gray-300'
                  }`}
                  aria-label={`Select ${color} color`}
                >
                  <span 
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: color.toLowerCase() }}
                  >
                    <span className="sr-only">{color}</span>
                  </span>
                  {selectedColor === color && (
                    <span className="absolute inset-0 flex items-center justify-center text-white">
                      <Check className="h-5 w-5" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div> */}

          {/* Size selection */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Size: <span className="font-normal">{selectedSize}</span></h3>
              <button type="button" className="text-xs font-medium text-gray-400 hover:text-gray-600">
                Size guide
              </button>
            </div>
            <div className="mt-2 w-60 grid grid-cols-4 gap-1">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`flex items-center justify-center rounded-sm border py-1.5 text-xs text-gray-400 font-medium transition-colors cursor-pointer ${
                    selectedSize === size
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="mt-8">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center border rounded-md">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  <span className="sr-only">Decrease quantity</span>
                  <span className="text-xl">-</span>
                </button>
                <span className="w-12 text-center text-gray-700">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-8 w-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  <span className="sr-only">Increase quantity</span>
                  <span className="text-xl">+</span>
                </button>
              </div>
              
             <div className="flex">
               <Button 
                 onClick={() => {
                   addToCart({
                     id: product.id,
                     title: product.title,
                     price: product.price.toString(),
                     img: product.images[0]
                   });
                 }}
                 className="rounded-r-none border-r-0 py-2 text-base font-medium bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors cursor-pointer"
               >
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                   <circle cx="9" cy="21" r="1"/>
                   <circle cx="20" cy="21" r="1"/>
                   <path d="M3 3h2l3.6 7.59a2 2 0 0 0 1.8 1.18H19a2 2 0 0 0 2-1.5l1-4H6"/>
                 </svg>
                 Add to Cart - ${(product.price * quantity).toFixed(2)}
               </Button>
               
               <button
                 type="button"
                 className="rounded-r-md border-l-0 px-3 border-gray-400 bg-white text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center cursor-pointer"
                 aria-label="Add to wishlist"
               >
                 <Heart className="h-5 w-5" strokeWidth="1.8" />
               </button>
             </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-sm font-medium text-gray-900 mb-3">Product Features</h2>
            <ul className="space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Shipping & Support */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-primary/10 p-2 rounded-full">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Free Shipping</h3>
                  <p className="text-sm text-gray-500">Free on orders over $50</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-primary/10 p-2 rounded-full">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">2-Year Warranty</h3>
                  <p className="text-sm text-gray-500">Guaranteed quality</p>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      <TopProducts />
      <Footer />
    </main>
  );
}

// Server component that handles the params
export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return <ProductDetailContent id={params.id} />;
}
