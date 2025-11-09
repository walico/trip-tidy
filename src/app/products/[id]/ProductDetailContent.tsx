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
  const { addToCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    product.selectedOptions || {}
  );
  const [currentVariant, setCurrentVariant] = useState<ProductVariant | null>(
    product.selectedVariant || null
  );
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentVariant?.availableForSale || isAddingToCart) return;
    
    setIsAddingToCart(true);
    
    try {
      await addToCart({
        id: product.id,
        variantId: currentVariant.id,
        productId: product.id,
        title: product.title,
        price: currentVariant.price.amount,
        image: images[0],
        merchandiseId: currentVariant.id
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

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
              
              {/* Out of Stock */}
              {!currentVariant?.availableForSale && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-medium">Out of Stock</span>
                </div>
              )}
            </div>

              {/* Thumbnails */}
              {images?.filter(img => img && (typeof img !== 'string' || img.trim() !== '')).length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-2">
                  {images
                    .filter(img => img && (typeof img !== 'string' || img.trim() !== ''))
                    .map((image, index) => {
                      const originalIndex = images.indexOf(image);
                      const isSelected = selectedImage === originalIndex;
                      const src = typeof image === 'string' ? image : ''; // Ensure src is string

                      if (!src) return null; // Skip if src is invalid

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedImage(originalIndex)}
                          className={`
                            relative aspect-square rounded-md overflow-hidden
                            transition-all duration-200
                            ${isSelected ? 'ring-2 ring-[#be7960cc]' : 'opacity-70 hover:opacity-100'}
                          `}
                        >
                          <Image
                            src={src}
                            alt={`${product.title} - ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      );
                    })}
                </div>
              )}

          </div>

          {/* Product details */}
          <div className="mt-6 lg:mt-0 lg:pl-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{product.title}</h1>

            {/* Price and availability */}
            <div className="mt-1 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-primary">
                  {formatPrice(currentVariant?.price.amount || '0')}
                </span>
                {currentVariant?.compareAtPrice?.amount && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(currentVariant.compareAtPrice.amount)}
                  </span>
                )}
              </div>
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
            <div className="mt-6">
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
                    onClick={handleAddToCart}
                    disabled={!currentVariant?.availableForSale || isAddingToCart}
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

            {/* Description */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h2 className="text-sm font-medium text-gray-900 mb-3">Description</h2>
              <div 
                className="prose prose-sm text-gray-600"
                dangerouslySetInnerHTML={{ __html: product.description || 'No description available' }}
              />
            </div>

            {/* Shipping & Support */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-start">
                  <div className="shrink-0 bg-primary/10 p-2 rounded-full">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">Free Shipping</h3>
                    <p className="text-sm text-gray-500">Free on orders over $50</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="shrink-0 bg-primary/10 p-2 rounded-full">
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
