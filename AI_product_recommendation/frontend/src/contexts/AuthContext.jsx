/**
 * Authentication Context for managing user state
 */
import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { authService } from '../services/authService';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const hasCheckedAuth = useRef(false);
  const isCheckingAuth = useRef(false);

  // Check if user is authenticated on app load (only once)
  useEffect(() => {
    if (!hasCheckedAuth.current && !isCheckingAuth.current) {
      checkAuthStatus();
    }
  }, []);

  const checkAuthStatus = async () => {
    // Prevent multiple simultaneous auth checks
    if (isCheckingAuth.current || hasCheckedAuth.current) {
      return;
    }

    try {
      isCheckingAuth.current = true;
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const user = await authService.checkAuthStatus();

      if (user) {
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
      } else {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } finally {
      isCheckingAuth.current = false;
      hasCheckedAuth.current = true;
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const result = await authService.login(credentials);

      if (result.success) {
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: result.user });
        return { success: true, user: result.user };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = authService.getErrorMessage(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const result = await authService.register(userData);

      if (result.success) {
        // Auto-login after registration
        const loginResult = await login({
          email: userData.email,
          password: userData.password,
        });
        return loginResult;
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = authService.getErrorMessage(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const result = await authService.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      return result;
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      return { success: true, message: 'Logout completed' };
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const result = await authService.updateProfile(profileData);

      if (result.success) {
        dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: result.user });
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = authService.getErrorMessage(error);
      return { success: false, error: errorMessage };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    clearError,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
