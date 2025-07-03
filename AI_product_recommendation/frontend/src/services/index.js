/**
 * Services barrel export
 * Centralized export for all services
 */

export { authService } from './authService';
export { productService } from './productService';

// Re-export API modules for direct access if needed
export * from './api';

// Export default API instance
export { default as api } from './api';
