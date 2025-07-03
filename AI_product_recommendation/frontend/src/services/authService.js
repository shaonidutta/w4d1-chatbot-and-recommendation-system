/**
 * Authentication Service
 * Handles all authentication-related API calls and token management
 */
import { authAPI } from './api';

class AuthService {
  constructor() {
    this.isCheckingAuth = false;
  }

  /**
   * Check if user is currently authenticated
   * @returns {Promise<Object|null>} User object if authenticated, null otherwise
   */
  async checkAuthStatus() {
    // Prevent multiple simultaneous auth checks
    if (this.isCheckingAuth) {
      console.log('Auth check already in progress, skipping...');
      return null;
    }

    try {
      this.isCheckingAuth = true;
      console.log('Checking authentication status...');

      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth check timeout')), 5000)
      );

      const user = await Promise.race([
        authAPI.getCurrentUser(),
        timeoutPromise
      ]);

      console.log('Auth check successful:', user ? 'User found' : 'No user');
      return user;
    } catch (error) {
      // 401 is expected when not authenticated, don't log as error
      if (error.response?.status === 401) {
        console.log('User not authenticated (401)');
      } else if (error.message === 'Auth check timeout') {
        console.warn('Auth check timed out');
      } else {
        console.error('Auth check failed:', error);
      }
      return null;
    } finally {
      this.isCheckingAuth = false;
    }
  }

  /**
   * Login user with credentials
   * @param {Object} credentials - Email and password
   * @returns {Promise<Object>} Login result
   */
  async login(credentials) {
    try {
      const response = await authAPI.login(credentials);
      return {
        success: true,
        user: response.user,
        message: 'Login successful'
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      const errorType = this.getErrorType(error);

      return {
        success: false,
        error: errorMessage,
        errorType: errorType,
        message: 'Login failed'
      };
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  async register(userData) {
    try {
      const response = await authAPI.register(userData);
      return {
        success: true,
        user: response, // Backend returns user data directly
        message: 'Registration successful'
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      const errorType = this.getErrorType(error);

      return {
        success: false,
        error: errorMessage,
        errorType: errorType,
        message: 'Registration failed'
      };
    }
  }

  /**
   * Logout current user
   * @returns {Promise<Object>} Logout result
   */
  async logout() {
    try {
      await authAPI.logout();
      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      // Even if logout API fails, we should clear local state
      console.warn('Logout API failed, but clearing local state:', error);
      return {
        success: true,
        message: 'Logout completed'
      };
    }
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile update data
   * @returns {Promise<Object>} Update result
   */
  async updateProfile(profileData) {
    try {
      const response = await authAPI.updateProfile(profileData);
      return {
        success: true,
        user: response,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
        message: 'Profile update failed'
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

  /**
   * Get error type for specific handling
   * @param {Error} error - API error
   * @returns {string} Error type
   */
  getErrorType(error) {
    const errorMessage = this.getErrorMessage(error).toLowerCase();

    // Registration specific errors
    if (errorMessage.includes('email already registered') ||
        errorMessage.includes('email already exists')) {
      return 'EMAIL_EXISTS';
    }
    if (errorMessage.includes('username already taken') ||
        errorMessage.includes('username already exists')) {
      return 'USERNAME_EXISTS';
    }

    // Login specific errors
    if (errorMessage.includes('incorrect email or password') ||
        errorMessage.includes('invalid credentials') ||
        errorMessage.includes('authentication failed')) {
      return 'INVALID_CREDENTIALS';
    }

    // Validation errors
    if (errorMessage.includes('password must') ||
        errorMessage.includes('password validation')) {
      return 'PASSWORD_VALIDATION';
    }
    if (errorMessage.includes('email') && errorMessage.includes('invalid')) {
      return 'EMAIL_VALIDATION';
    }

    // Network/Server errors
    if (error.response?.status === 500) {
      return 'SERVER_ERROR';
    }
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      return 'NETWORK_ERROR';
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * Check if error is authentication related
   * @param {Error} error - API error
   * @returns {boolean} True if auth error
   */
  isAuthError(error) {
    return error.response?.status === 401;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
