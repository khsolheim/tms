/**
<<<<<<< HEAD
 * Authentication Service for TMS Mobile
=======
 * Authentication Service for TMS Mobile App
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
 * Handles user authentication, token management, and session handling
 */

import EncryptedStorage from 'react-native-encrypted-storage';
import { Alert } from 'react-native';

export interface AuthStatus {
  isAuthenticated: boolean;
  user?: {
    id: string;
    email: string;
<<<<<<< HEAD
    name: string;
    role: string;
=======
    navn: string;
    rolle: string;
    bedriftId?: string;
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
  };
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
<<<<<<< HEAD
}

export class AuthenticationService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'user_data';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
=======
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  fornavn: string;
  etternavn: string;
  telefon?: string;
}

class AuthenticationServiceClass {
  private baseUrl = process.env.API_BASE_URL || 'http://localhost:3001/api';
  private currentUser: AuthStatus['user'] | null = null;
  private authToken: string | null = null;

  /**
   * Initialize authentication service
   */
  async initialize(): Promise<void> {
    try {
      const token = await EncryptedStorage.getItem('auth_token');
      const userData = await EncryptedStorage.getItem('user_data');

      if (token && userData) {
        this.authToken = token;
        this.currentUser = JSON.parse(userData);
      }
    } catch (error) {
      console.error('Failed to initialize auth service:', error);
    }
  }
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)

  /**
   * Check current authentication status
   */
<<<<<<< HEAD
  static async checkAuthStatus(): Promise<AuthStatus> {
    try {
      const token = await EncryptedStorage.getItem(this.TOKEN_KEY);
      const userData = await EncryptedStorage.getItem(this.USER_KEY);

      if (token && userData) {
        return {
          isAuthenticated: true,
          user: JSON.parse(userData),
          token,
        };
=======
  async checkAuthStatus(): Promise<AuthStatus> {
    try {
      const token = await EncryptedStorage.getItem('auth_token');
      const userData = await EncryptedStorage.getItem('user_data');

      if (token && userData) {
        const user = JSON.parse(userData);
        
        // Verify token is still valid
        const isValid = await this.verifyToken(token);
        
        if (isValid) {
          this.authToken = token;
          this.currentUser = user;
          
          return {
            isAuthenticated: true,
            user,
            token
          };
        } else {
          // Token expired, clear storage
          await this.clearAuthData();
        }
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
      }

      return { isAuthenticated: false };
    } catch (error) {
      console.error('Error checking auth status:', error);
      return { isAuthenticated: false };
    }
  }

  /**
<<<<<<< HEAD
   * Login user with credentials
   */
  static async login(credentials: LoginCredentials): Promise<AuthStatus> {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
=======
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

<<<<<<< HEAD
      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Store tokens and user data securely
      await EncryptedStorage.setItem(this.TOKEN_KEY, data.token);
      await EncryptedStorage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken);
      await EncryptedStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
=======
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store authentication data
      await EncryptedStorage.setItem('auth_token', data.token);
      await EncryptedStorage.setItem('user_data', JSON.stringify(data.user));

      if (credentials.rememberMe) {
        await EncryptedStorage.setItem('remember_me', 'true');
      }

      this.authToken = data.token;
      this.currentUser = data.user;
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)

      return {
        isAuthenticated: true,
        user: data.user,
<<<<<<< HEAD
        token: data.token,
=======
        token: data.token
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
<<<<<<< HEAD
   * Logout user and clear stored data
   */
  static async logout(): Promise<void> {
    try {
      await EncryptedStorage.removeItem(this.TOKEN_KEY);
      await EncryptedStorage.removeItem(this.REFRESH_TOKEN_KEY);
      await EncryptedStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Logout error:', error);
=======
   * Register new user
   */
  async register(userData: RegisterData): Promise<AuthStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Auto-login after registration
      return await this.login({
        email: userData.email,
        password: userData.password,
      });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
    }
  }

  /**
<<<<<<< HEAD
   * Get current auth token
   */
  static async getToken(): Promise<string | null> {
    try {
      return await EncryptedStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
=======
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      if (this.authToken) {
        // Notify server about logout
        await fetch(`${this.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearAuthData();
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
    }
  }

  /**
   * Refresh authentication token
   */
<<<<<<< HEAD
  static async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await EncryptedStorage.getItem(this.REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${process.env.API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      await EncryptedStorage.setItem(this.TOKEN_KEY, data.token);
=======
  async refreshToken(): Promise<string | null> {
    try {
      if (!this.authToken) {
        throw new Error('No token to refresh');
      }

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Token refresh failed');
      }

      await EncryptedStorage.setItem('auth_token', data.token);
      this.authToken = data.token;
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)

      return data.token;
    } catch (error) {
      console.error('Token refresh error:', error);
<<<<<<< HEAD
      // If refresh fails, logout user
      await this.logout();
=======
      await this.clearAuthData();
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
      return null;
    }
  }

  /**
<<<<<<< HEAD
   * Register push notification token
   */
  static async registerPushToken(pushToken: string): Promise<void> {
    try {
      const authToken = await this.getToken();
      if (!authToken) {
        return;
      }

      await fetch(`${process.env.API_BASE_URL}/auth/push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ pushToken }),
      });
    } catch (error) {
      console.error('Error registering push token:', error);
    }
  }

  /**
   * Validate token and handle expiration
   */
  static async validateToken(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) {
        return false;
      }

      const response = await fetch(`${process.env.API_BASE_URL}/auth/validate`, {
=======
   * Verify if token is still valid
   */
  private async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify`, {
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

<<<<<<< HEAD
      if (response.status === 401) {
        // Token expired, try to refresh
        const newToken = await this.refreshToken();
        return newToken !== null;
      }

      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }
} 
=======
      return response.ok;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  /**
   * Clear all authentication data
   */
  private async clearAuthData(): Promise<void> {
    try {
      await EncryptedStorage.removeItem('auth_token');
      await EncryptedStorage.removeItem('user_data');
      await EncryptedStorage.removeItem('remember_me');
      
      this.authToken = null;
      this.currentUser = null;
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthStatus['user'] | null {
    return this.currentUser;
  }

  /**
   * Get current auth token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Register push notification token
   */
  async registerPushToken(pushToken: string): Promise<void> {
    try {
      if (!this.authToken) {
        console.warn('No auth token available for push token registration');
        return;
      }

      await fetch(`${this.baseUrl}/auth/push-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pushToken }),
      });
    } catch (error) {
      console.error('Push token registration error:', error);
    }
  }

  /**
   * Change user password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      if (!this.authToken) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${this.baseUrl}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password change failed');
      }
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset request failed');
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }
}

export const AuthenticationService = new AuthenticationServiceClass(); 
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
