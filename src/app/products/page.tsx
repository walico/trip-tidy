"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Filter, Search, Star } from 'lucide-react';
import Footer from '@/components/Footer';
import TopProducts from '@/components/TopProducts';
import { useCart } from '@/contexts/CartContext';
import { shopifyClient, GET_PRODUCTS_QUERY, GET_COLLECTIONS_QUERY, formatPrice, getProductImage, getProductPrice, getProductOriginalPrice } from '@/lib/shopify';

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
  availableForSale: boolean;
  variants: {
    edges: Array<{
      node: {
        availableForSale: boolean;
        quantityAvailable: number | null;
      };
    }>;
  };
  collections?: {
    edges: Array<{
      node: {
        handle: string;
        title?: string; // Add this if you need title as well
      };
    }>;
  };
  description?: string;
}

export default function ProductsPage() {
  const { addToCart, addMultipleToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Fetch collections
  useEffect(() => {
    async function loadCollections() {
      if (!shopifyClient) {
        console.warn('Shopify client not initialized');
        return;
      }
      
      try {
        const { data } = await shopifyClient.request(GET_COLLECTIONS_QUERY, { 
          variables: { first: 10 } 
        });
        
        const fetchedCollections = data.collections.edges.map((edge: any) => ({
          handle: edge.node.handle,
          title: edge.node.title
        }));
        
        setCollections(fetchedCollections);
      } catch (err) {
        console.error('Error fetching collections:', err);
      }
    }
    
    loadCollections();
  }, []);

  // Update product collections when products change
  useEffect(() => {
    const collectionsMap: Record<string, string[]> = {};
    
    products.forEach(product => {
      if (product.collections?.edges) {
        collectionsMap[product.id] = product.collections.edges.map((edge: any) => edge.node.handle);
      } else {
        collectionsMap[product.id] = [];
      }
    });
    
    setProductCollections(collectionsMap);
  }, [products]);

  // Fetch products on mount
  useEffect(() => {
    async function loadProducts() {
      // Log Shopify configuration for debugging
      const config = {
        storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
        hasAccessToken: !!process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
        apiVersion: '2025-01',
        apiUrl: `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2025-01/graphql.json`
      };

      if (!shopifyClient) {
        const errorMsg = 'Shopify client not properly initialized. ' + 
          (config.storeDomain ? 'Check your Storefront Access Token.' : 'Missing store domain.');
        setError(errorMsg);
        setLoading(false);
        return;
      }

      const startTime = Date.now();
      try {
        setLoading(true);
        setError(null);
        
        // Make the request with error handling
        let response;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        try {
          response = await shopifyClient.request(GET_PRODUCTS_QUERY, {
            variables: { first: 50 },
            signal: controller.signal
          });
          
          clearTimeout(timeout);
          
          if (!response) {
            throw new Error('No response received from Shopify');
          }
            
        } catch (error: any) {
          clearTimeout(timeout);
          
          if (error.name === 'AbortError') {
            throw new Error('Request to Shopify API timed out after 15 seconds');
          }
          
          if (error.message.includes('Failed to fetch')) {
            throw new Error('Network error: Could not connect to Shopify. Check your internet connection.');
          }
          
          if (error.response?.errors) {
            const firstError = error.response.errors[0];
            throw new Error(`Shopify API Error: ${firstError.message || 'Unknown error'}`);
          }
          
          throw new Error(`API request failed: ${error.message || 'Unknown error occurred'}`);
        }

        // Handle response format
        let productsData;
        const responseData = response.data || response;

        // The Shopify Storefront API typically returns products in the 'products' field
        if (responseData.products) {
          productsData = responseData.products;
        } 
        // Handle case where products might be nested under data.products
        else if (responseData.data?.products) {
          productsData = responseData.data.products;
        } 
        // Handle direct array response (unlikely but possible)
        else if (Array.isArray(responseData)) {
          productsData = { edges: responseData.map((item: any) => ({ node: item })) };
        } 
        // Handle connection-style response (edges/nodes)
        else if (responseData.edges) {
          productsData = responseData;
        } 
        // Last resort check for products at root level
        else if ('products' in responseData) {
          productsData = responseData.products;
        } else {
          throw new Error('Unexpected response format from Shopify. Could not locate products data.');
        }

        if (!productsData?.edges) {
          throw new Error('No products found in the response.');
        }

        const fetchedProducts = productsData.edges.map((edge: any) => {
          const product = edge.node;
          const firstVariant = product.variants?.edges?.[0]?.node;

          // Ensure we have a valid Shopify variant ID
          let variantId = firstVariant?.id;
          let merchandiseId = firstVariant?.id;

          // If no variant ID, use product ID as fallback
          if (!variantId || !variantId.startsWith('gid://shopify/')) {
            variantId = product.id;
            merchandiseId = product.id;
          }
          
          // Map the product with all necessary fields including collections
          return {
            ...product, // Include all product fields
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
            availableForSale: product.availableForSale,
            variants: product.variants,
          };
        });

        setProducts(fetchedProducts);
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const [selectedCategory, setSelectedCategory] = useState('all');
  // State to store the collection data for each product
  const [productCollections, setProductCollections] = useState<Record<string, string[]>>({});
  const [collections, setCollections] = useState<Array<{handle: string; title: string}>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(8);

  // Filter and sort products
  const filteredProducts = products
    .filter((product: Product) => {
      // If 'all' is selected, show all products
      if (selectedCategory === 'all') return true;
      
      // Get all collection handles for this product
      const productCollections = product.collections?.edges?.map(edge => edge.node.handle.toLowerCase()) || [];
      
      // Check if any of the product's collections match the selected category
      const matchesCategory = productCollections.some(collectionHandle => 
        collectionHandle === selectedCategory.toLowerCase()
      );

      
      // Check search query
      const matchesSearch = searchQuery === '' || 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        
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
    
    if (!product.availableForSale) {
      return;
    }
    
    addToCart({
      id: product.id,
      variantId: product.variantId,
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
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
            <button
              key="all"
              onClick={() => setSelectedCategory('all')}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                selectedCategory === 'all'
                  ? 'bg-[color-primary] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Products
            </button>

            {[...collections]
              .sort((a, b) => a.title.localeCompare(b.title))
              .map((collection) => (
                <button
                  key={collection.handle}
                  onClick={() => setSelectedCategory(collection.handle)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium capitalize cursor-pointer ${
                    selectedCategory === collection.handle
                      ? 'bg-[color-primary] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {collection.title}
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
          <>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {filteredProducts.map((product) => {
                const hasSale = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);
                const isOutOfStock = !product.availableForSale;
                
                return (
                  <div key={product.id} className="group h-full flex flex-col bg-white p-2 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-primary/20">
                    <Link href={`/products/${product.handle}`} className="block flex-1">
                      <div className="relative overflow-hidden bg-gray-50 aspect-square rounded-xl">
                        <Image
                          src={product.image}
                          alt={product.title}
                          width={500}
                          height={500}
                          className={`w-full h-full border border-gray-200 object-cover rounded-xl transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'opacity-70' : ''}`}
                        />
                        
                        {/* Stock status */}
                        {isOutOfStock && (
                          <div className="absolute top-3 left-3 bg-gray-600 text-white text-xs font-medium px-2 py-1 rounded">
                            Out of Stock
                          </div>
                        )}
                        
                        {/* In Stock tag */}
                        {!isOutOfStock && !hasSale && (
                          <div className="absolute top-3 left-3 bg-black text-white text-xs font-medium px-2 py-1 rounded">
                            In Stock
                          </div>
                        )}
                        
                        {/* Sale tag */}
                        {hasSale && !isOutOfStock && (
                          <div className="absolute top-3 left-3 bg-red-700 text-white text-xs font-medium px-2 py-1 rounded">
                            SALE
                          </div>
                        )}
                        
                        {/* Wishlist + Cart */}
                        <div className={`absolute top-3 right-3 flex flex-col gap-2 ${isOutOfStock ? 'opacity-50' : ''}`}>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Add to wishlist logic here
                            }}
                            className="flex items-center justify-center rounded-full bg-white p-2 text-gray-700 shadow-md transition-all hover:bg-gray-100 hover:scale-110"
                            aria-label="Add to wishlist"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                          </button>

                          {!isOutOfStock ? (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddToCart(e, product);
                              }}
                              className="flex items-center justify-center rounded-full bg-white p-2 text-gray-700 shadow-md transition-all hover:bg-gray-100 hover:scale-110 disabled:opacity-70 disabled:cursor-not-allowed"
                              disabled={isAddingToCart}
                            >
                              {isAddingToCart ? (
                                <svg className="animate-spin h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                                  <circle cx="9" cy="21" r="1"/>
                                  <circle cx="20" cy="21" r="1"/>
                                  <path d="M3 3h2l3.6 7.59a2 2 0 0 0 1.8 1.18H19a2 2 0 0 0 2-1.5l1-4H6"/>
                                </svg>
                              )}
                            </button>
                          ) : (
                            <button
                              disabled
                              className="flex items-center justify-center rounded-full bg-gray-200 p-2 text-gray-400 cursor-not-allowed"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                                <circle cx="9" cy="21" r="1"/>
                                <circle cx="20" cy="21" r="1"/>
                                <path d="M3 3h2l3.6 7.59a2 2 0 0 0 1.8 1.18H19a2 2 0 0 0 2-1.5l1-4H6"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col text-gray-900">
                        <h3 className="text-sm font-medium line-clamp-2 h-10">
                          {product.title}
                        </h3>
                        
                        <div className="mt-1">
                          {hasSale ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-(--color-primary)">
                                {formatPrice(product.price)}
                              </span>
                              <span className="text-xs line-through text-gray-400">
                                {formatPrice(product.originalPrice)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xl font-bold text-(--color-primary)">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-8">
              <nav className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">
                        {filteredProducts.length === 0 ? 0 : (currentPage - 1) * productsPerPage + 1}
                      </span> to {' '}
                      <span className="font-medium">
                        {Math.min(currentPage * productsPerPage, filteredProducts.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredProducts.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => paginate(1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        aria-label="First"
                      >
                        <span className="sr-only">First</span>
                        &laquo;
                      </button>
                      <button
                        onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        aria-label="Previous"
                      >
                        <span className="sr-only">Previous</span>
                        &lsaquo;
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

                        if ((i === 1 && currentPage > 4) || (i === 3 && currentPage < totalPages - 3)) {
                          return (
                            <span key={`ellipsis-${i}`} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                              ...
                            </span>
                          );
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => paginate(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              currentPage === pageNum
                                ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
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
                        className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        aria-label="Next"
                      >
                        <span className="sr-only">Next</span>
                        &rsaquo;
                      </button>
                      <button
                        onClick={() => paginate(totalPages)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        aria-label="Last"
                      >
                        <span className="sr-only">Last</span>
                        &raquo;
                      </button>
                    </nav>
                  </div>
                </div>
              </nav>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
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

      <TopProducts />
      <Footer />
    </main>
  );
}
