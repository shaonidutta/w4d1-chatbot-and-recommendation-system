/**
 * Custom hooks for API calls
 * Provides loading states and error handling for API operations
 */
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for handling async API calls with loading and error states
 * @param {Function} apiCall - The API function to call
 * @param {Array} dependencies - Dependencies to trigger re-fetch
 * @param {boolean} immediate - Whether to call immediately on mount
 */
export const useApiCall = (apiCall, dependencies = [], immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};

/**
 * Hook for handling paginated API calls
 * @param {Function} apiCall - The API function to call
 * @param {Object} initialParams - Initial parameters
 */
export const usePaginatedApi = (apiCall, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(async (reset = false) => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);
      
      const currentPage = reset ? 1 : page;
      const params = { ...initialParams, page: currentPage, limit: 20 };
      
      const result = await apiCall(params);
      
      if (reset) {
        setData(result.items || result);
        setPage(2);
      } else {
        setData(prev => [...prev, ...(result.items || result)]);
        setPage(prev => prev + 1);
      }
      
      // Check if there are more items
      if (result.items) {
        setHasMore(result.items.length === params.limit);
      } else {
        setHasMore(result.length === params.limit);
      }
      
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [apiCall, initialParams, loading, page]);

  const refresh = useCallback(() => {
    loadMore(true);
  }, [loadMore]);

  useEffect(() => {
    loadMore(true);
  }, []);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore: () => loadMore(false),
    refresh
  };
};

/**
 * Hook for debounced API calls (useful for search)
 * @param {Function} apiCall - The API function to call
 * @param {number} delay - Debounce delay in milliseconds
 */
export const useDebouncedApi = (apiCall, delay = 300) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedExecute = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setData(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await apiCall(query);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }, delay),
    [apiCall, delay]
  );

  return {
    data,
    loading,
    error,
    search: debouncedExecute
  };
};

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
