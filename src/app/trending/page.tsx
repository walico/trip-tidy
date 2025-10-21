"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Filter, Search, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';

// Define product type
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  colors: string[];
  variantId?: string;
  merchandiseId?: string;
}
import Newsletter from '@/components/Newsletter';
import Banner from '@/components/Banner';

// Mock data for trending products
const trendingProducts: Product[] = [
  {
    id: 't1',
    name: 'Ultralight Daypack Pro',
    price: 99.99,
    originalPrice: 119.99,
    rating: 4.8,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
    category: 'Daypacks',
    colors: ['Black', 'Gray', 'Blue']
  },
  {
    id: 't2',
    name: 'Adventure Water Bottle',
    price: 29.99,
    originalPrice: 39.99,
    rating: 4.7,
    reviewCount: 203,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
    category: 'Accessories',
    colors: ['Blue', 'Green', 'Black']
  },
  {
    id: 't3',
    name: 'Trail Running Shoes',
    price: 129.99,
    originalPrice: 159.99,
    rating: 4.9,
    reviewCount: 278,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
    category: 'Footwear',
    colors: ['Red', 'Black', 'Blue']
  },
  {
    id: 't4',
    name: 'Compact Camping Stove',
    price: 49.99,
    rating: 4.6,
    reviewCount: 132,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
    category: 'Camping',
    colors: ['Silver', 'Black']
  },
  {
    id: 't5',
    name: 'Waterproof Hiking Jacket',
    price: 149.99,
    originalPrice: 199.99,
    rating: 4.8,
    reviewCount: 321,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
    category: 'Outerwear',
    colors: ['Blue', 'Black', 'Green']
  },
  {
    id: 't6',
    name: 'Portable Hammock',
    price: 59.99,
    rating: 4.5,
    reviewCount: 98,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
    category: 'Camping',
    colors: ['Blue', 'Green', 'Gray']
  },
  {
    id: 't7',
    name: 'Trekking Poles',
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.7,
    reviewCount: 145,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
    category: 'Hiking',
    colors: ['Black', 'Blue']
  },
  {
    id: 't8',
    name: 'Insulated Water Bottle',
    price: 34.99,
    rating: 4.8,
    reviewCount: 267,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
    category: 'Accessories',
    colors: ['Black', 'White', 'Blue']
  }
];

const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'daypacks', name: 'Daypacks' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'footwear', name: 'Footwear' },
  { id: 'camping', name: 'Camping' },
  { id: 'outerwear', name: 'Outerwear' },
  { id: 'hiking', name: 'Hiking' },
];

export default function TrendingProductsPage() {
  const { addToCart } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      title: product.name,
      price: product.price.toString(),
      img: product.image,
      merchandiseId: product.merchandiseId || product.id,
      variantId: product.variantId || product.id
    });
  };

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(8);

  // Filter and sort products
  const filteredProducts = trendingProducts
    .filter(product => {
      const matchesCategory = selectedCategory === 'all' || 
        product.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low-high') return a.price - b.price;
      if (sortBy === 'price-high-low') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // Default sort (featured)
    });

  // Get current products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Change page
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({
      top: 600,
      behavior: 'smooth'
    });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProductsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <main className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Trending Products
          </h1>
          <p className="mt-4 text-gray-500">
            Discover our most popular and trending outdoor gear and accessories
          </p>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          {/* Category Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Mobile filter button */}
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-5 w-5 text-gray-400" />
              Filters
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                id="sort"
                name="sort"
                className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile filter panel */}
        {showFilters && (
          <div className="mt-4 rounded-lg bg-white p-4 shadow md:hidden">
            <h3 className="mb-3 text-sm font-medium text-gray-900">Filters</h3>
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-700">Price Range</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-700">Colors</h4>
                <div className="flex flex-wrap gap-2">
                  {['Black', 'Blue', 'Green', 'Gray', 'Navy', 'Red', 'White'].map((color) => (
                    <button
                      key={color}
                      className="h-6 w-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: color.toLowerCase() }}
                      aria-label={`Filter by ${color}`}
                    ></button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {currentProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group block overflow-hidden rounded-lg bg-white transition-shadow hover:shadow-md">
                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-[10px_10px_0_0] bg-gray-200 xl:aspect-h-8 xl:aspect-w-7 relative">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="h-full w-full object-cover object-center group-hover:opacity-75"
                  />
                  
                  {product.originalPrice && (
                    <div className="absolute top-2 right-2 rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
                      SALE
                    </div>
                  )}

                  <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Add to wishlist logic here
                      }}
                      className="flex items-center justify-center rounded-full bg-white/90 p-2 text-gray-700 shadow-md transition-all hover:bg-white hover:scale-110"
                      aria-label="Add to wishlist"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    <button 
                      onClick={(e) => handleAddToCart(e, product)}
                      className="flex items-center justify-center rounded-full bg-white/90 p-2 text-gray-700 shadow-md transition-all hover:bg-white hover:scale-110"
                      aria-label="Add to cart"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between border border-t-0 border-gray-200 p-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 truncate" title={product.name.trim()}>
                      {product.name.trim().slice(0, 20)}{product.name.length > 20 ? '...' : ''}
                    </h3>
                    <div className="mt-3 flex items-center">
                      <div className="flex items-center">
                        {[0, 1, 2, 3, 4].map((rating) => (
                          <Star
                            key={rating}
                            className={`h-4 w-4 flex-shrink-0 ${
                              rating < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-200'
                            }`}
                            aria-hidden="true"
                            fill={rating < Math.floor(product.rating || 0) ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                      <p className="ml-2 text-xs text-gray-500">
                        {product.reviewCount} reviews
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {product.originalPrice ? (
                      <>
                        <p className="text-lg font-medium text-[var(--color-primary)]">${product.price.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 line-through">${product.originalPrice.toFixed(2)}</p>
                      </>
                    ) : (
                      <p className="text-lg font-medium text-[var(--color-primary)]">${product.price.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you&apos;re looking for.</p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination and Results Info */}
      {filteredProducts.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Items per page selector */}
            <div className="flex items-center space-x-2">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-700">
                Show:
              </label>
              <select
                id="itemsPerPage"
                value={productsPerPage}
                onChange={handleItemsPerPageChange}
                className="block w-20 rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
              >
                <option value={4}>4</option>
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
              <span className="text-sm text-gray-500">per page</span>
            </div>

            <div className="flex items-center justify-center space-x-2">
              {/* Results count */}
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstProduct + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastProduct, filteredProducts.length)}
                </span>{' '}
                of <span className="font-medium">{filteredProducts.length}</span>
              </div>

              {/* Pagination */}
              <nav className="flex items-center space-x-1">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="rounded-md p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      className={`w-10 h-10 rounded-md text-sm font-medium ${
                        currentPage === pageNum
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="px-2 text-gray-500">...</span>
                )}

                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-md p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      <Banner />
      <Newsletter />
      <Footer />
    </main>
  );
}
