<<<<<<< HEAD
import React, { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value: AuthContextType = {
    isAuthenticated: false,
    user: null,
    login: async () => {},
    logout: async () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
=======
/**
 * Auth Context for TMS Mobile App
 * Provides authentication state management across the app
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthenticationService, AuthStatus } from '../services/AuthenticationService';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthStatus['user'] | null;
  token: string | null;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: AuthStatus }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' };

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: action.payload.isAuthenticated,
        user: action.payload.user || null,
        token: action.payload.token || null,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Initialize authentication service and check auth status
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      
      // Initialize authentication service
      await AuthenticationService.initialize();
      
      // Check current auth status
      const authStatus = await AuthenticationService.checkAuthStatus();
      
      dispatch({ type: 'AUTH_SUCCESS', payload: authStatus });
    } catch (error) {
      console.error('Auth initialization error:', error);
      dispatch({ type: 'AUTH_FAILURE', payload: 'Failed to initialize authentication' });
    }
  };

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      
      const authStatus = await AuthenticationService.login({
        email,
        password,
        rememberMe,
      });
      
      dispatch({ type: 'AUTH_SUCCESS', payload: authStatus });
    } catch (error: any) {
      console.error('Login error:', error);
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Login failed' });
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      
      const authStatus = await AuthenticationService.register(userData);
      
      dispatch({ type: 'AUTH_SUCCESS', payload: authStatus });
    } catch (error: any) {
      console.error('Registration error:', error);
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Registration failed' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      
      await AuthenticationService.logout();
      
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  const refreshAuth = async () => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      
      const authStatus = await AuthenticationService.checkAuthStatus();
      
      dispatch({ type: 'AUTH_SUCCESS', payload: authStatus });
    } catch (error: any) {
      console.error('Auth refresh error:', error);
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Failed to refresh authentication' });
    }
  };

  const contextValue: AuthContextType = {
    state,
    login,
    logout,
    register,
    clearError,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
}; 