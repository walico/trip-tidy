"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Truck, Shield, ChevronRight, Heart, ChevronLeft } from 'lucide-react';
import Footer from '@/components/Footer';
import TopProducts from '@/components/TopProducts';
import { formatPrice } from '@/lib/shopify';
import { Product, ProductVariant } from '@/lib/types';

export default function ProductDetailContent({ product }: { product: Product }) {
  const { addProductsWithQuantities } = useCart();

  // State for the component
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    product.selectedOptions || {}
  );
  const [currentVariant, setCurrentVariant] = useState<ProductVariant | null>(
    product.selectedVariant || null
  );

  // Ensure we have at least one image
  const images = useMemo(() => {
    if (currentVariant?.image?.url) {
      return [currentVariant.image.url, ...product.images.filter(img => img !== currentVariant.image?.url)];
    }
    return product.images.length > 0 ? product.images : ['/placeholder-product.jpg'];
  }, [product.images, currentVariant]);

  // Update current variant when selected options change
  useEffect(() => {
    if (!product.variants) return;

    const selectedVariant = product.variants.find((variant) => {
      return variant.selectedOptions.every(
        (option) => selectedOptions[option.name] === option.value
      );
    });

    if (selectedVariant) {
      setCurrentVariant(selectedVariant);
    }
  }, [selectedOptions, product.variants]);

  // Handle option selection
  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  // Get available values for an option based on current selections
  const getAvailableValues = (optionName: string) => {
    if (!product.variants) return [];
    
    return product.variants
      .filter((variant) => {
        return variant.selectedOptions.every(
          (option) =>
            option.name === optionName || selectedOptions[option.name] === option.value
        );
      })
      .flatMap((variant) =>
        variant.selectedOptions
          .filter((option) => option.name === optionName)
          .map((option) => option.value)
      )
      .filter((value, index, self) => self.indexOf(value) === index);
  };
  
  // Image navigation functions
  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
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
          <div className="flex flex-col w-full">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={images[selectedImage]}
                alt={product.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />

              {/* Navigation Controls */}
              {images.length > 1 && (
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
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`h-2 w-2 rounded-full ${i === selectedImage ? 'bg-primary' : 'bg-white/60'}`}
                      onClick={() => setSelectedImage(i)}
                      aria-label={`View image ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-7 gap-2 mt-2">
              {images.map((image, index) => (
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
                    sizes="(max-width: 1024px) 14.2857vw, 7.1428vw"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product details */}
          <div className="mt-6 lg:mt-0 lg:pl-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{product.title}</h1>

            {/* Price and availability */}
            <div className="mt-4">
              <div className="flex items-center">
                <p className="text-3xl font-bold text-gray-900">
                  {currentVariant?.price ? formatPrice(currentVariant.price.amount, currentVariant.price.currencyCode) : 'Loading...'}
                </p>
                {currentVariant?.compareAtPrice && (
                  <>
                    <p className="ml-3 text-lg text-gray-500 line-through">
                      {formatPrice(currentVariant.compareAtPrice.amount, currentVariant.compareAtPrice.currencyCode)}
                    </p>
                    <span className="ml-3 rounded bg-red-100 px-2.5 py-0.5 text-sm font-semibold text-red-800">
                      Save {(
                        parseFloat(currentVariant.compareAtPrice.amount) - 
                        parseFloat(currentVariant.price.amount)
                      ).toFixed(2)} {currentVariant.price.currencyCode}
                    </span>
                  </>
                )}
              </div>
              <p className={`mt-2 text-sm ${currentVariant?.availableForSale ? 'text-green-600' : 'text-red-600'}`}>
                {currentVariant?.availableForSale 
                  ? currentVariant.quantityAvailable 
                    ? `In stock (${currentVariant.quantityAvailable} available)` 
                    : 'In stock'
                  : 'Out of stock'}
              </p>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h2 className="text-sm font-medium text-gray-900">Description</h2>
              <p className="mt-2 text-base text-gray-600">{product.description}</p>
            </div>

            {/* Variant selection */}
            {product.options?.map((option) => {
              const availableValues = getAvailableValues(option.name);
              return (
                <div key={option.id} className="mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      {option.name}: <span className="font-normal">{selectedOptions[option.name] || 'Select'}</span>
                    </h3>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const isAvailable = availableValues.includes(value);
                      const isSelected = selectedOptions[option.name] === value;
                      
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleOptionSelect(option.name, value)}
                          disabled={!isAvailable}
                          className={`px-3 py-1.5 border rounded-md text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-primary text-white border-primary'
                              : isAvailable
                              ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                              : 'border-gray-200 text-gray-400 cursor-not-allowed line-through'
                          }`}
                          title={!isAvailable ? 'Not available in this combination' : ''}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

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
                      if (!currentVariant) return;
                      
                      addProductsWithQuantities([
                        {
                          product: {
                            id: product.id,
                            variantId: currentVariant.id,
                            productId: product.id,
                            title: `${product.title}${currentVariant.title !== 'Default Title' ? ` - ${currentVariant.title}` : ''}`,
                            price: currentVariant.price.amount,
                            image: currentVariant.image?.url || product.images[0] || '',
                            merchandiseId: currentVariant.id,
                          },
                          quantity,
                        },
                      ]);
                    }}
                    disabled={!currentVariant?.availableForSale}
                    className="rounded-r-none border-r-0 py-2 text-base font-medium bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors cursor-pointer"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                      <circle cx="9" cy="21" r="1"/>
                      <circle cx="20" cy="21" r="1"/>
                      <path d="M3 3h2l3.6 7.59a2 2 0 0 0 1.8 1.18H19a2 2 0 0 0 2-1.5l1-4H6"/>
                    </svg>
                    {currentVariant?.availableForSale 
                      ? `Add to Cart - ${(parseFloat(currentVariant.price.amount) * quantity).toFixed(2)} ${currentVariant.price.currencyCode}`
                      : 'Out of Stock'}
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
