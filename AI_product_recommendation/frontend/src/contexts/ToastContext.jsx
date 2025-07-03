/**
 * Toast Context for Global Toast Management
 */
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import ToastContainer from '../components/UI/ToastContainer';

// Toast Actions
const TOAST_ACTIONS = {
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
  CLEAR_ALL: 'CLEAR_ALL'
};

// Toast Reducer
const toastReducer = (state, action) => {
  switch (action.type) {
    case TOAST_ACTIONS.ADD_TOAST:
      return [...state, action.payload];
    
    case TOAST_ACTIONS.REMOVE_TOAST:
      return state.filter(toast => toast.id !== action.payload);
    
    case TOAST_ACTIONS.CLEAR_ALL:
      return [];
    
    default:
      return state;
  }
};

// Create Context
const ToastContext = createContext();

// Toast Provider Component
export const ToastProvider = ({ children, position = 'top-right', maxToasts = 5 }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  // Add a new toast
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast
    };

    dispatch({ type: TOAST_ACTIONS.ADD_TOAST, payload: newToast });

    // Remove oldest toast if we exceed maxToasts
    if (toasts.length >= maxToasts) {
      setTimeout(() => {
        dispatch({ type: TOAST_ACTIONS.REMOVE_TOAST, payload: toasts[0].id });
      }, 100);
    }

    return id;
  }, [toasts.length, maxToasts]);

  // Remove a specific toast
  const removeToast = useCallback((id) => {
    dispatch({ type: TOAST_ACTIONS.REMOVE_TOAST, payload: id });
  }, []);

  // Clear all toasts
  const clearAllToasts = useCallback(() => {
    dispatch({ type: TOAST_ACTIONS.CLEAR_ALL });
  }, []);

  // Convenience methods for different toast types
  const showSuccess = useCallback((message, options = {}) => {
    return addToast({
      type: 'success',
      message,
      title: options.title || 'Success',
      ...options
    });
  }, [addToast]);

  const showError = useCallback((message, options = {}) => {
    return addToast({
      type: 'error',
      message,
      title: options.title || 'Error',
      duration: options.duration || 7000, // Longer duration for errors
      ...options
    });
  }, [addToast]);

  const showWarning = useCallback((message, options = {}) => {
    return addToast({
      type: 'warning',
      message,
      title: options.title || 'Warning',
      ...options
    });
  }, [addToast]);

  const showInfo = useCallback((message, options = {}) => {
    return addToast({
      type: 'info',
      message,
      title: options.title || 'Info',
      ...options
    });
  }, [addToast]);

  const contextValue = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer 
        toasts={toasts} 
        onRemoveToast={removeToast}
        position={position}
      />
    </ToastContext.Provider>
  );
};

// Custom hook to use toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
