"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Filter, Search, Star } from 'lucide-react';
import Footer from '@/components/Footer';
import TopProducts from '@/components/TopProducts';
import { useCart } from '@/contexts/CartContext';
import { shopifyClient, GET_PRODUCTS_QUERY, formatPrice, getProductImage, getProductPrice, getProductOriginalPrice } from '@/lib/shopify';

// Define product type
interface Product {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  rating: number;
  reviewCount: number;
  image: string;
  handle: string;
  variantId: string;
  merchandiseId: string;
}

export default function ProductsPage() {
  const { addToCart, addMultipleToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products on mount
  useEffect(() => {
    async function loadProducts() {
      if (!shopifyClient) {
        setError('Shopify client not configured');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data } = await shopifyClient.request(GET_PRODUCTS_QUERY, {
          variables: { first: 50 }
        });

        const fetchedProducts = data.products.edges.map((edge: any) => {
          const product = edge.node;
          const firstVariant = product.variants?.edges?.[0]?.node;

          console.log('Product data:', {
            productId: product.id,
            firstVariant: firstVariant,
            variantsCount: product.variants?.edges?.length || 0
          });

          // Ensure we have a valid Shopify variant ID
          let variantId = firstVariant?.id;
          let merchandiseId = firstVariant?.id;

          // If no variant ID, use product ID as fallback (for debugging)
          if (!variantId || !variantId.startsWith('gid://shopify/')) {
            console.warn('No valid variant ID found, using product ID as fallback');
            variantId = product.id;
            merchandiseId = product.id;
          }

          return {
            id: product.id,
            title: product.title,
            price: getProductPrice(product),
            originalPrice: getProductOriginalPrice(product),
            rating: 4.5, // Default rating
            reviewCount: 0, // Default review count
            image: getProductImage(product),
            handle: product.handle,
            variantId: variantId,
            merchandiseId: merchandiseId,
          };
        });

        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(8);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesCategory = selectedCategory === 'all' ||
        product.title.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low-high') return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === 'price-high-low') return parseFloat(b.price) - parseFloat(a.price);
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // Default sort (featured)
    });

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      variantId: product.variantId,
      productId: product.id, // Using product ID as productId
      title: product.title,
      price: product.price,
      image: product.image, // Changed from 'img' to 'image'
      merchandiseId: product.merchandiseId
    });
  };

  // Handle selecting products for bulk add
  const handleProductSelect = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  // Handle bulk add to cart
  const handleBulkAddToCart = () => {
    if (selectedProducts.length === 0) return;

    const productsToAdd = products.filter(product =>
      selectedProducts.includes(product.id)
    );

    addMultipleToCart(productsToAdd.map(product => ({
      id: product.id,
      variantId: product.variantId,
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      merchandiseId: product.merchandiseId
    })));

    setSelectedProducts([]); // Clear selection after adding
  };

  // Change page
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of product grid
    window.scrollTo({
      top: 600,
      behavior: 'smooth'
    });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProductsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (loading) {
    return (
      <main className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Loading products...</h1>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-600">Error</h1>
            <p className="text-gray-500 mt-4">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Our Products
          </h1>
          <p className="mt-4 text-gray-500">
            Browse our premium selection of travel gear and accessories
          </p>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          {/* Category Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
            {['all', 'backpacks', 'daypacks', 'hiking', 'duffles', 'urban'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category === 'all' ? 'All Products' : category.charAt(0).toUpperCase() + category.slice(1)}
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

            {/* Bulk Add Button */}
            {selectedProducts.length > 0 && (
              <button
                onClick={handleBulkAddToCart}
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Add {selectedProducts.length} Selected
              </button>
            )}

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
            <select
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
                    {['Black', 'Blue', 'Green', 'Gray', 'Navy', 'Olive'].map((color) => (
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
      </div>

      {/* Product Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {currentProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.handle}`} className="group block overflow-hidden rounded-lg bg-white transition-shadow hover:shadow-md">
                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-[10px_10px_0_0] bg-gray-200 xl:aspect-h-8 xl:aspect-w-7 relative">
                  <Image
                    src={product.image}
                    alt={product.title}
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
                    <h3 className="text-sm font-medium text-gray-900 truncate" title={product.title}>
                      {product.title.slice(0, 30)}...
                    </h3>
                    <div className="mt-3 flex items-center">
                      <div className="flex items-center">
                        {[0, 1, 2, 3, 4].map((rating) => (
                          <Star
                            key={rating}
                            className={`h-4 w-4 flex-shrink-0 ${
                              rating < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-200'
                            }`}
                            aria-hidden="true"
                            fill={rating < Math.floor(product.rating) ? 'currentColor' : 'none'}
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
                        <p className="text-lg font-medium text-[var(--color-primary)]">${formatPrice(product.price)}</p>
                        <p className="text-xs text-gray-500 line-through">${formatPrice(product.originalPrice)}</p>
                      </>
                    ) : (
                      <p className="text-lg font-medium text-[var(--color-primary)]">${formatPrice(product.price)}</p>
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
      {totalPages > 1 && (
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="text-sm text-gray-700 sm:hidden">
                  Page {currentPage} of {totalPages}
                </div>

                <nav className="flex items-center space-x-1">
                  <button
                    onClick={() => paginate(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="First page"
                  >
                    &laquo;
                  </button>
                  <button
                    onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    &lsaquo;
                  </button>

                  <span className="hidden sm:inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>

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

                    if ((i === 1 && currentPage > 3) || (i === 3 && currentPage < totalPages - 2)) {
                      return (
                        <span key={`ellipsis-${i}`} className="px-2 py-1.5">
                          ...
                        </span>
                      );
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-primary text-white hover:bg-primary/90'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    &rsaquo;
                  </button>
                  <button
                    onClick={() => paginate(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Last page"
                  >
                    &raquo;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      <TopProducts />
      <Footer />
    </main>
  );
}
