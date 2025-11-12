"use client";

import { useState, useEffect } from 'react';
import { PageLoader } from '@/components/ui/page-loader';
import Footer from '@/components/Footer';
import TopProducts from '@/components/TopProducts';
import { shopifyClient, GET_PRODUCTS_QUERY, GET_COLLECTIONS_QUERY, getProductImage, getProductPrice, getProductOriginalPrice } from '@/lib/shopify';
import ProductCard from '@/components/ProductCard';

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
  const [products, setProducts] = useState<Product[]>([]);
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
  // Pagination state with URL parameters
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(8);
  const [isChangingPage, setIsChangingPage] = useState(false);

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

  // const handleAddToCart = (e: React.MouseEvent, product: Product) => {
  //   e.preventDefault();
  //   e.stopPropagation();
    
  //   if (!product.availableForSale) {
  //     return;
  //   }
    
  //   addToCart({
  //     id: product.id,
  //     variantId: product.variantId,
  //     productId: product.id,
  //     title: product.title,
  //     price: product.price,
  //     image: product.image,
  //     merchandiseId: product.merchandiseId
  //   });
  // };

  // Handle selecting products for bulk add
  // const handleProductSelect = (productId: string, checked: boolean) => {
  //   if (checked) {
  //     setSelectedProducts(prev => [...prev, productId]);
  //   } else {
  //     setSelectedProducts(prev => prev.filter(id => id !== productId));
  //   }
  // };

  // const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Handle bulk add to cart
  // const handleBulkAddToCart = () => {
  //   if (selectedProducts.length === 0) return;

  //   const productsToAdd = products.filter(product =>
  //     selectedProducts.includes(product.id)
  //   );

  //   addMultipleToCart(productsToAdd.map(product => ({
  //     id: product.id,
  //     variantId: product.variantId,
  //     productId: product.id,
  //     title: product.title,
  //     price: product.price,
  //     image: product.image,
  //     merchandiseId: product.merchandiseId
  //   })));

  //   setSelectedProducts([]); // Clear selection after adding
  // };

  // Sync with URL parameters
  useEffect(() => {
    // Update URL when page or items per page changes
    const params = new URLSearchParams(window.location.search);
    if (currentPage > 1) params.set('page', currentPage.toString());
    else params.delete('page');
    
    if (productsPerPage !== 12) params.set('perPage', productsPerPage.toString());
    else params.delete('perPage');
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newUrl);
  }, [currentPage, productsPerPage]);

  // Initialize from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('page') || '1', 10);
    const perPage = parseInt(params.get('perPage') || '12', 10);
    
    if (page > 0) setCurrentPage(page);
    if ([4, 8, 12, 24, 48].includes(perPage)) setProductsPerPage(perPage);
  }, []);

  // Change page with loading state
  const paginate = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    
    setIsChangingPage(true);
    setCurrentPage(pageNumber);
    
    // Scroll to top of product grid with a small delay for state to update
    setTimeout(() => {
      window.scrollTo({
        top: 400,
        behavior: 'smooth'
      });
      setIsChangingPage(false);
    }, 100);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPerPage = Number(e.target.value);
    setProductsPerPage(newPerPage);
    
    // Calculate new page to keep the same first item visible
    const newPage = Math.ceil(((currentPage - 1) * productsPerPage + 1) / newPerPage);
    setCurrentPage(Math.max(1, newPage));
  };

  if (loading) {
    return <PageLoader />;
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
          {/* "All Products" Button */}
          <button
            key="all"
            onClick={() => setSelectedCategory('all')}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#be7960cc] text-white'
                : 'bg-white text-gray-700 hover:bg-[#be7960cc] hover:text-white'
            }`}
          >
            All Products
          </button>

          {/* Collection Buttons */}
          {[...collections]
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((collection) => (
              <button
                key={collection.handle}
                onClick={() => setSelectedCategory(collection.handle)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium capitalize cursor-pointer transition-colors ${
                  selectedCategory === collection.handle
                    ? 'bg-[#be7960cc] text-white'
                    : 'bg-white text-gray-700 hover:bg-[#be7960cc] hover:text-white'
                }`}
              >
                {collection.title}
              </button>
            ))}
        </div>

      </div>
    </div>

      {/* Product Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isChangingPage ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {currentProducts.map((product) => (
                <div key={product.id} className="h-full">
                  <ProductCard 
                    product={{
                      ...product,
                      price: product.price,
                      originalPrice: product.originalPrice,
                      image: product.image,
                      handle: product.handle,
                      variantId: product.variantId,
                      merchandiseId: product.merchandiseId,
                      availableForSale: product.availableForSale
                    }}
                    className="h-full"
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-4 sm:px-6 mt-8">
              {/* Mobile pagination */}
              <div className="flex items-center justify-between w-full sm:hidden">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-600">
                  {currentPage} / {totalPages}
                </span>
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>

              {/* Desktop pagination */}
              <div className="hidden sm:flex items-center justify-between w-full">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {(() => {
                      const buttons = [];
                      const maxButtons = 3;
                      
                      // Always show first page
                      if (currentPage > 2) {
                        buttons.push(
                          <button
                            key={1}
                            onClick={() => paginate(1)}
                            className="w-8 h-8 rounded-full text-sm flex items-center justify-center text-gray-700 hover:bg-gray-100"
                          >
                            1
                          </button>
                        );
                        
                        if (currentPage > 3) {
                          buttons.push(
                            <span key="ellipsis-start" className="px-2 py-1 text-gray-500">
                              ...
                            </span>
                          );
                        }
                      }
                      
                      // Show current page and adjacent pages
                      const start = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
                      const end = Math.min(totalPages, start + 2);
                      
                      for (let i = start; i <= end; i++) {
                        buttons.push(
                          <button
                            key={i}
                            onClick={() => paginate(i)}
                            className={`w-8 h-8 rounded-full text-sm flex items-center justify-center ${
                              currentPage === i
                                ? 'bg-primary text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            aria-current={currentPage === i ? 'page' : undefined}
                          >
                            {i}
                          </button>
                        );
                      }
                      
                      // Show last page if not already shown
                      if (end < totalPages) {
                        if (end < totalPages - 1) {
                          buttons.push(
                            <span key="ellipsis-end" className="px-2 py-1 text-gray-500">
                              ...
                            </span>
                          );
                        }
                        
                        buttons.push(
                          <button
                            key={totalPages}
                            onClick={() => paginate(totalPages)}
                            className="w-8 h-8 rounded-full text-sm flex items-center justify-center text-gray-700 hover:bg-gray-100"
                          >
                            {totalPages}
                          </button>
                        );
                      }
                      
                      return buttons;
                    })()}
                  </div>
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                
                <div className="text-sm">
                  <select
                    value={productsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="text-sm border-0 bg-transparent focus:ring-0 focus:ring-offset-0 text-gray-600"
                    aria-label="Items per page"
                  >
                    <option value="8">8 per page</option>
                    <option value="12">12 per page</option>
                    <option value="24">24 per page</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* No results message and clear filters button */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No products match your current filters.</p>
                <div className="mt-4">
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
          </>
        )}
      </div>

      <TopProducts />
      <Footer />
    </main>
  );
}
