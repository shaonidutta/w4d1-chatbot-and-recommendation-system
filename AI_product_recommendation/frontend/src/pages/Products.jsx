/**
 * Products Page with Filtering and Pagination
 */
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FunnelIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { productsAPI } from '../services/api';
import ProductCard from '../components/Products/ProductCard';
import LoadingSpinner, { CardSkeleton } from '../components/UI/LoadingSpinner';
import Pagination from '../components/UI/Pagination';
import CategoryFilter from '../components/Products/CategoryFilter';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    per_page: 20,
    total_pages: 0,
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category_id: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    min_rating: searchParams.get('min_rating') || '',
    brand: searchParams.get('brand') || '',
    sort_by: searchParams.get('sort_by') || 'name',
    sort_order: searchParams.get('sort_order') || 'asc',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || 1;
    setPagination(prev => ({ ...prev, page }));
    loadProducts(page);
  }, [searchParams, filters]);

  const loadCategories = async () => {
    try {
      const categoriesData = await productsAPI.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async (page = 1) => {
    try {
      setIsLoading(true);
      
      const params = {
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
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
  };

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'rating', label: 'Rating' },
    { value: 'created_at', label: 'Newest' },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-2">
              All Products ✨
            </h1>
            <p className="text-gray-600">
              Discover amazing products just for you
            </p>
          </motion.div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-ghost flex items-center space-x-2 ${showFilters ? 'text-primary-600' : ''}`}
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filters</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: showFilters ? 1 : 0, x: showFilters ? 0 : -20 }}
            className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}
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
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
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

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {products.length} of {pagination.total} products
              </p>
            </div>

            {/* Products */}
            {isLoading ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {[...Array(12)].map((_, index) => (
                  <CardSkeleton key={index} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
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

                {/* Pagination */}
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
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
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
                  className="btn-primary mt-4"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
