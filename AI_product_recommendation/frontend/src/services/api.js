/**
 * API Service for AI Product Recommendation System
 * Handles all HTTP requests to the FastAPI backend
 */
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10000,
  withCredentials: true, // Important for HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    // Token is handled via HTTP-only cookies, but we can add headers if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on 401 for auth check endpoints
    if (error.response?.status === 401 && !error.config.url.includes('/auth/me')) {
      // Only redirect to login for other 401 errors, not auth status checks
      console.warn('Unauthorized access, redirecting to login');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/api/v1/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/api/v1/auth/login', credentials);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/api/v1/auth/logout');
    return response.data;
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post('/api/v1/auth/refresh');
    return response.data;
  },
};

// Products API
export const productsAPI = {
  // Get products with pagination and filters
  getProducts: async (params = {}) => {
    const response = await api.get('/api/v1/products/', { params });
    return response.data;
  },

  // Search products
  searchProducts: async (params = {}) => {
    const response = await api.get('/api/v1/products/search', { params });
    return response.data;
  },

  // Get single product
  getProduct: async (productId) => {
    const response = await api.get(`/api/v1/products/${productId}`);
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (categoryId, params = {}) => {
    const response = await api.get(`/api/v1/products/category/${categoryId}`, { params });
    return response.data;
  },

  // Get all categories
  getCategories: async () => {
    const response = await api.get('/api/v1/products/categories');
    return response.data;
  },

  // Get trending products
  getTrendingProducts: async (params = {}) => {
    const response = await api.get('/api/v1/products/trending', { params });
    return response.data;
  },

  // Track product view
  trackView: async (productId, duration = 0) => {
    const response = await api.post(`/api/v1/products/${productId}/view`, {
      duration_seconds: duration,
    });
    return response.data;
  },

  // Like/unlike product
  toggleLike: async (productId) => {
    const response = await api.post(`/api/v1/products/${productId}/like`);
    return response.data;
  },
};

// Recommendations API
export const recommendationsAPI = {
  // Get similar products
  getSimilarProducts: async (productId, limit = 10) => {
    const response = await api.get(`/api/v1/recommendations/similar/${productId}`, {
      params: { limit },
    });
    return response.data;
  },

  // Get personalized recommendations
  getPersonalizedRecommendations: async (limit = 20) => {
    const response = await api.get('/api/v1/recommendations/user/me', {
      params: { limit },
    });
    return response.data;
  },

  // Get trending recommendations
  getTrendingRecommendations: async (limit = 10, days = 7) => {
    const response = await api.get('/api/v1/recommendations/trending', {
      params: { limit, days },
    });
    return response.data;
  },

  // Get category recommendations
  getCategoryRecommendations: async (categoryId, limit = 10) => {
    const response = await api.get(`/api/v1/recommendations/categories/${categoryId}/recommended`, {
      params: { limit },
    });
    return response.data;
  },

  // Get recommendation stats
  getRecommendationStats: async () => {
    const response = await api.get('/api/v1/recommendations/stats');
    return response.data;
  },

  // Rebuild recommendation model
  rebuildModel: async () => {
    const response = await api.post('/api/v1/recommendations/rebuild');
    return response.data;
  },
};

// Users API
export const usersAPI = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/api/v1/users/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/api/v1/users/me', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.post('/api/v1/users/me/change-password', passwordData);
    return response.data;
  },

  // Get user preferences
  getPreferences: async () => {
    const response = await api.get('/api/v1/users/me/preferences');
    return response.data;
  },
};

// Utility functions
export const apiUtils = {
  // Handle API errors
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.detail || error.response.data?.message || 'An error occurred';
      return { error: true, message, status: error.response.status };
    } else if (error.request) {
      // Request was made but no response received
      return { error: true, message: 'Network error. Please check your connection.', status: 0 };
    } else {
      // Something else happened
      return { error: true, message: error.message || 'An unexpected error occurred', status: 0 };
    }
  },

  // Format price
  formatPrice: (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  },

  // Format date
  formatDate: (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  // Debounce function for search
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
};

export default api;
