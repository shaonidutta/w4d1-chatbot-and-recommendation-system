/**
 * Search Page with Advanced Filtering and Hybrid Recommendations
 */
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { productsAPI, recommendationsAPI, apiUtils } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ProductCard from '../components/Products/ProductCard';
import LoadingSpinner, { CardSkeleton } from '../components/UI/LoadingSpinner';
import Pagination from '../components/UI/Pagination';
import CategoryFilter from '../components/Products/CategoryFilter';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [products, setProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    per_page: 20,
    total_pages: 0,
  });
  const [filters, setFilters] = useState({
    category_id: '',
    min_price: '',
    max_price: '',
    min_rating: '',
    brand: '',
    sort_by: 'name',
    sort_order: 'asc',
  });

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadCategories();
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    } else {
      loadRecommendations();
    }
  }, []);

  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || 1;
    setPagination(prev => ({ ...prev, page }));
  }, [searchParams]);

  const loadCategories = async () => {
    try {
      const categoriesData = await productsAPI.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadRecommendations = async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      const recommendations = await recommendationsAPI.getPersonalizedRecommendations(12);
      setRecommendedProducts(recommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async (query, page = 1) => {
    try {
      setIsSearching(true);
      
      const params = {
        query: query || '',
        page,
        per_page: pagination.per_page,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        ),
      };

      const response = await productsAPI.searchProducts(params);
      setProducts(response.products);
      setPagination({
        total: response.total,
        page: response.page,
        per_page: response.per_page,
        total_pages: response.total_pages,
      });

      // Update URL
      const urlParams = new URLSearchParams();
      if (query) urlParams.set('q', query);
      if (page > 1) urlParams.set('page', page.toString());
      setSearchParams(urlParams);

    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(searchQuery, 1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    performSearch(searchQuery, 1);
  };

  const handlePageChange = (page) => {
    performSearch(searchQuery, page);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setProducts([]);
    setPagination({ total: 0, page: 1, per_page: 20, total_pages: 0 });
    setSearchParams({});
    loadRecommendations();
  };

  const hasSearchResults = searchQuery && products.length > 0;
  const hasSearchQuery = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-4">
            Search & Discover ✨
          </h1>
          <p className="text-gray-600 mb-8">
            Find exactly what you're looking for with our smart search
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
            <div className="search-bar flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands, categories..."
                className="flex-1 bg-transparent border-none outline-none placeholder-gray-500 text-lg"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors mr-2"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
              <button
                type="submit"
                disabled={isSearching}
                className="p-2 text-primary-600 hover:text-primary-700 transition-colors"
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                ) : (
                  <MagnifyingGlassIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>

          {/* Filter Toggle */}
          {hasSearchQuery && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-ghost flex items-center space-x-2 mx-auto ${showFilters ? 'text-primary-600' : ''}`}
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Advanced Filters</span>
            </button>
          )}
        </motion.div>

        {/* Search Results */}
        {hasSearchQuery ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:w-80"
              >
                <div className="glass-card p-6 sticky top-24">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
                  
                  <CategoryFilter
                    categories={categories}
                    selectedCategory={filters.category_id}
                    onCategoryChange={(categoryId) => 
                      handleFilterChange({ ...filters, category_id: categoryId })
                    }
                  />

                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3">Price Range</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.min_price}
                        onChange={(e) => handleFilterChange({ ...filters, min_price: e.target.value })}
                        className="input-girly text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.max_price}
                        onChange={(e) => handleFilterChange({ ...filters, max_price: e.target.value })}
                        className="input-girly text-sm"
                      />
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3">Minimum Rating</h4>
                    <select
                      value={filters.min_rating}
                      onChange={(e) => handleFilterChange({ ...filters, min_rating: e.target.value })}
                      className="input-girly w-full"
                    >
                      <option value="">Any Rating</option>
                      <option value="4">4+ Stars</option>
                      <option value="3">3+ Stars</option>
                      <option value="2">2+ Stars</option>
                      <option value="1">1+ Stars</option>
                    </select>
                  </div>

                  {/* Brand Filter */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3">Brand</h4>
                    <input
                      type="text"
                      placeholder="Enter brand name"
                      value={filters.brand}
                      onChange={(e) => handleFilterChange({ ...filters, brand: e.target.value })}
                      className="input-girly w-full"
                    />
                  </div>

                  {/* Sort Options */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3">Sort By</h4>
                    <select
                      value={filters.sort_by}
                      onChange={(e) => handleFilterChange({ ...filters, sort_by: e.target.value })}
                      className="input-girly w-full mb-3"
                    >
                      <option value="name">Name</option>
                      <option value="price">Price</option>
                      <option value="rating">Rating</option>
                      <option value="created_at">Newest</option>
                    </select>
                    <select
                      value={filters.sort_order}
                      onChange={(e) => handleFilterChange({ ...filters, sort_order: e.target.value })}
                      className="input-girly w-full"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <button
                    onClick={() => handleFilterChange({
                      category_id: '',
                      min_price: '',
                      max_price: '',
                      min_rating: '',
                      brand: '',
                      sort_by: 'name',
                      sort_order: 'asc',
                    })}
                    className="btn-secondary w-full"
                  >
                    Clear All Filters
                  </button>
                </div>
              </motion.div>
            )}

            {/* Results */}
            <div className="flex-1">
              {isSearching ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(12)].map((_, index) => (
                    <CardSkeleton key={index} />
                  ))}
                </div>
              ) : hasSearchResults ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-600">
                      Found {pagination.total} results for "{searchQuery}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product, index) => (
                      <motion.div
                        key={product.product_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>

                  {pagination.total_pages > 1 && (
                    <div className="mt-12">
                      <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.total_pages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">
                    No results found for "{searchQuery}"
                  </p>
                  <p className="text-gray-400 mb-6">
                    Try adjusting your search terms or filters
                  </p>
                  <button onClick={clearSearch} className="btn-primary">
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Recommendations when no search */
          <div>
            {isAuthenticated ? (
              <div>
                <h2 className="text-2xl font-display font-bold gradient-text mb-6 text-center">
                  Recommended For You 💖
                </h2>
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(12)].map((_, index) => (
                      <CardSkeleton key={index} />
                    ))}
                  </div>
                ) : recommendedProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {recommendedProducts.map((product, index) => (
                      <motion.div
                        key={product.product_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      Start searching to discover amazing products!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-display font-bold gradient-text mb-4">
                  Start Your Search Journey ✨
                </h2>
                <p className="text-gray-600 mb-6">
                  Search for products above or sign in to get personalized recommendations
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
