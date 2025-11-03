"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Truck, Shield, ChevronRight, Heart, ChevronLeft } from 'lucide-react';
import Footer from '@/components/Footer';
import TopProducts from '@/components/TopProducts';
import { formatPrice } from '@/lib/shopify';

interface Product {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  handle: string;
  description: string;
  images: string[];
  variantId: string;
  merchandiseId: string;
}

export default function ProductDetailContent({ product }: { product: Product }) {
  const { addProductsWithQuantities } = useCart();

  // State for the component
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);

  // Image navigation functions
  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

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
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100 mb-4 group">
              <Image
                src={product.images[selectedImage]}
                alt={product.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {/* Navigation Controls */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-700" />
                  </button>
                </>
              )}
            </div>
            <div className="grid grid-cols-7 gap-2 mt-2">
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
                <p className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</p>
                {product.originalPrice && (
                  <>
                    <p className="ml-3 text-lg text-gray-500 line-through">${formatPrice(product.originalPrice)}</p>
                    <span className="ml-3 rounded bg-red-100 px-2.5 py-0.5 text-sm font-semibold text-red-800">
                      Save ${(parseFloat(product.originalPrice) - parseFloat(product.price)).toFixed(2)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h2 className="text-sm font-medium text-gray-900">Description</h2>
              <p className="mt-2 text-base text-gray-600">{product.description}</p>
            </div>

            {/* Size selection */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Size: <span className="font-normal">{selectedSize}</span></h3>
                <button type="button" className="text-xs font-medium text-gray-400 hover:text-gray-600">
                  Size guide
                </button>
              </div>
              <div className="mt-2 w-60 grid grid-cols-4 gap-1">
                {['S', 'M', 'L', 'XL'].map((size) => (
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
                      addProductsWithQuantities([
                        {
                          product: {
                            id: product.id,
                            variantId: product.variantId,
                            productId: product.id,
                            title: product.title,
                            price: product.price,
                            image: product.images[0],
                            merchandiseId: product.merchandiseId,
                          },
                          quantity,
                        },
                      ]);
                    }}
                    className="rounded-r-none border-r-0 py-2 text-base font-medium bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors cursor-pointer"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                      <circle cx="9" cy="21" r="1"/>
                      <circle cx="20" cy="21" r="1"/>
                      <path d="M3 3h2l3.6 7.59a2 2 0 0 0 1.8 1.18H19a2 2 0 0 0 2-1.5l1-4H6"/>
                    </svg>
                    Add to Cart - ${(parseFloat(product.price) * quantity).toFixed(2)}
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
