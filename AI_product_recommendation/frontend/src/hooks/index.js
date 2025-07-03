/**
 * Hooks barrel export
 * Centralized export for all custom hooks
 */

export { useAuth } from './useAuth';
export { useApiCall, usePaginatedApi, useDebouncedApi } from './useApi';
export { useLocalStorage } from './useLocalStorage';

// Re-export commonly used React hooks for convenience
export { useState, useEffect, useCallback, useMemo, useRef } from 'react';
