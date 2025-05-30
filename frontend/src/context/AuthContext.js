import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

// Safe function to parse user data from localStorage
const safeParseUser = () => {
  try {
    const userData = localStorage.getItem('user');
    
    // Check if userData exists and is not 'undefined' or 'null' string
    if (!userData || userData === 'undefined' || userData === 'null') {
      return null;
    }
    
    const parsed = JSON.parse(userData);
    
    // Validate that the parsed data has the expected structure
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    // Clear invalid data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  }
};

// Initial state - Load user from localStorage if available
const initialState = {
  user: safeParseUser(), // Use safe parsing function
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      // Store both token and user in localStorage safely
      try {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      } catch (error) {
        console.error('Error storing auth data:', error);
      }
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      // Clear both token and user from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    
    case AUTH_ACTIONS.LOGOUT:
      // Clear both token and user from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      // Store user in localStorage safely
      try {
        localStorage.setItem('user', JSON.stringify(action.payload));
      } catch (error) {
        console.error('Error storing user data:', error);
      }
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      // Clear both token and user from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on mount if token exists
  useEffect(() => {
    if (state.token && !state.user) {
      // Token exists but no user data, load from API
      loadUser();
    } else if (state.user && state.token) {
      // Both token and user exist, set as authenticated
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_SUCCESS, payload: state.user });
    } else {
      // No token or user, not authenticated
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const response = await authService.login(credentials);
      
      // Check if response has the expected structure
      if (!response || !response.user || !response.token) {
        throw new Error('Invalid response structure from login service');
      }
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: response.user,
          token: response.token,
        },
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    try {
      const response = await authService.register(userData);
      
      // Check if response has the expected structure
      if (!response || !response.user || !response.token) {
        throw new Error('Invalid response structure from register service');
      }
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: {
          user: response.user,
          token: response.token,
        },
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Load user function
  const loadUser = async () => {
    try {
      const response = await authService.getUser();
      
      if (response && response.user) {
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
          payload: response.user,
        });
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE });
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    loadUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};