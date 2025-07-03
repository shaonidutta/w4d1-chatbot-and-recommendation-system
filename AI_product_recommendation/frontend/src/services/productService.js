/**
 * Product Service
 * Handles all product-related API calls
 */
import { productsAPI } from './api';

class ProductService {
  /**
   * Get products with filters and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Products data
   */
  async getProducts(params = {}) {
    try {
      const response = await productsAPI.getProducts(params);
      return {
        success: true,
        data: response,
        message: 'Products fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
        message: 'Failed to fetch products'
      };
    }
  }

  /**
   * Search products
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Search results
   */
  async searchProducts(params = {}) {
    try {
      const response = await productsAPI.searchProducts(params);
      return {
        success: true,
        data: response,
        message: 'Search completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
        message: 'Search failed'
      };
    }
  }

  /**
   * Get single product by ID
   * @param {string|number} productId - Product ID
   * @returns {Promise<Object>} Product data
   */
  async getProduct(productId) {
    try {
      const response = await productsAPI.getProduct(productId);
      return {
        success: true,
        data: response,
        message: 'Product fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
        message: 'Failed to fetch product'
      };
    }
  }

  /**
   * Get products by category
   * @param {string|number} categoryId - Category ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Products data
   */
  async getProductsByCategory(categoryId, params = {}) {
    try {
      const response = await productsAPI.getProductsByCategory(categoryId, params);
      return {
        success: true,
        data: response,
        message: 'Category products fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
        message: 'Failed to fetch category products'
      };
    }
  }

  /**
   * Get all categories
   * @returns {Promise<Object>} Categories data
   */
  async getCategories() {
    try {
      const response = await productsAPI.getCategories();
      return {
        success: true,
        data: response,
        message: 'Categories fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
        message: 'Failed to fetch categories'
      };
    }
  }

  /**
   * Get trending products
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Trending products data
   */
  async getTrendingProducts(params = {}) {
    try {
      const response = await productsAPI.getTrendingProducts(params);
      return {
        success: true,
        data: response,
        message: 'Trending products fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
        message: 'Failed to fetch trending products'
      };
    }
  }

  /**
   * Track product view
   * @param {string|number} productId - Product ID
   * @param {number} duration - View duration in seconds
   * @returns {Promise<Object>} Track result
   */
  async trackView(productId, duration = 0) {
    try {
      const response = await productsAPI.trackView(productId, duration);
      return {
        success: true,
        data: response,
        message: 'View tracked successfully'
      };
    } catch (error) {
      // Don't show error to user for tracking failures
      console.warn('Failed to track view:', error);
      return {
        success: false,
        error: this.getErrorMessage(error),
        message: 'Failed to track view'
      };
    }
  }

  /**
   * Toggle product like
   * @param {string|number} productId - Product ID
   * @returns {Promise<Object>} Like result
   */
  async toggleLike(productId) {
    try {
      const response = await productsAPI.toggleLike(productId);
      return {
        success: true,
        data: response,
        message: response.liked ? 'Product liked' : 'Product unliked'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
        message: 'Failed to update like status'
      };
    }
  }

  /**
   * Extract error message from API error
   * @param {Error} error - API error
   * @returns {string} Error message
   */
  getErrorMessage(error) {
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }
}

// Export singleton instance
export const productService = new ProductService();
export default productService;
