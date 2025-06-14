/**
<<<<<<< HEAD
 * App Initialization Utilities
 * Handles startup initialization of services and configurations
 */

import { OfflineService } from '../services/OfflineService';
import { BiometricService } from '../services/BiometricService';
import { AnalyticsService } from '../services/AnalyticsService';
=======
 * Initialization utilities for TMS Mobile App
 * Handles app startup and service initialization
 */

import { AuthenticationService } from '../services/AuthenticationService';
import { SyncService } from '../services/SyncService';
import { AnalyticsService } from '../services/AnalyticsService';
import { BiometricService } from '../services/BiometricService';
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)

/**
 * Initialize all core services
 */
<<<<<<< HEAD
export async function initializeServices(): Promise<void> {
  try {
    console.log('[Initialization] Starting service initialization...');

    // Initialize offline service first
    await OfflineService.initialize();
    console.log('[Initialization] OfflineService initialized');

    // Initialize biometric service
    const biometricService = BiometricService.getInstance();
    await biometricService.initialize();
    console.log('[Initialization] BiometricService initialized');

    // Initialize analytics
    AnalyticsService.setEnabled(true);
    console.log('[Initialization] AnalyticsService initialized');

    console.log('[Initialization] All services initialized successfully');
  } catch (error) {
    console.error('[Initialization] Service initialization failed:', error);
    throw error;
  }
}

/**
 * Initialize app configuration
 */
export async function initializeConfiguration(): Promise<void> {
  try {
    console.log('[Initialization] Initializing app configuration...');

    // Set up environment variables
    if (!process.env.API_BASE_URL) {
      process.env.API_BASE_URL = 'https://api.tms.example.com';
    }

    console.log('[Initialization] Configuration initialized');
  } catch (error) {
    console.error('[Initialization] Configuration initialization failed:', error);
    throw error;
  }
} 
=======
export const initializeServices = async (): Promise<void> => {
  console.log('🚀 Initializing TMS Mobile services...');

  try {
    // Initialize services in order of dependency
    const initPromises = [
      initializeAuthenticationService(),
      initializeSyncService(),
      initializeAnalyticsService(),
      initializeBiometricService(),
    ];

    await Promise.all(initPromises);

    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('❌ Service initialization failed:', error);
    throw new Error(`Service initialization failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Initialize Authentication Service
 */
const initializeAuthenticationService = async (): Promise<void> => {
  try {
    console.log('🔐 Initializing Authentication Service...');
    await AuthenticationService.initialize();
    console.log('✅ Authentication Service initialized');
  } catch (error) {
    console.error('❌ Authentication Service initialization failed:', error);
    throw error;
  }
};

/**
 * Initialize Sync Service
 */
const initializeSyncService = async (): Promise<void> => {
  try {
    console.log('🔄 Initializing Sync Service...');
    await SyncService.initialize();
    console.log('✅ Sync Service initialized');
  } catch (error) {
    console.error('❌ Sync Service initialization failed:', error);
    throw error;
  }
};

/**
 * Initialize Analytics Service
 */
const initializeAnalyticsService = async (): Promise<void> => {
  try {
    console.log('📊 Initializing Analytics Service...');
    await AnalyticsService.initialize();
    console.log('✅ Analytics Service initialized');
  } catch (error) {
    console.error('❌ Analytics Service initialization failed:', error);
    throw error;
  }
};

/**
 * Initialize Biometric Service
 */
const initializeBiometricService = async (): Promise<void> => {
  try {
    console.log('👆 Initializing Biometric Service...');
    const biometricService = BiometricService.getInstance();
    await biometricService.initialize();
    console.log('✅ Biometric Service initialized');
  } catch (error) {
    console.error('❌ Biometric Service initialization failed:', error);
    // Biometric service failure is not critical, so we don't throw
    console.warn('⚠️ Continuing without biometric authentication');
  }
};

/**
 * Cleanup services on app termination
 */
export const cleanupServices = async (): Promise<void> => {
  console.log('🧹 Cleaning up services...');

  try {
    // Cleanup analytics service
    await AnalyticsService.cleanup();
    
    // Stop sync service
    SyncService.stopBackgroundSync();

    console.log('✅ Services cleaned up successfully');
  } catch (error) {
    console.error('❌ Service cleanup failed:', error);
  }
};

/**
 * Get initialization status
 */
export const getInitializationStatus = async (): Promise<{
  auth: boolean;
  sync: boolean;
  analytics: boolean;
  biometric: boolean;
}> => {
  try {
    const [authStatus, syncStatus, analyticsStatus] = await Promise.all([
      AuthenticationService.checkAuthStatus(),
      SyncService.getSyncStatus(),
      AnalyticsService.getAnalyticsSummary(),
    ]);

    const biometricService = BiometricService.getInstance();
    const biometricAvailable = await biometricService.isAvailable();

    return {
      auth: authStatus.isAuthenticated,
      sync: syncStatus.isOnline,
      analytics: analyticsStatus.currentSession !== null,
      biometric: biometricAvailable,
    };
  } catch (error) {
    console.error('Failed to get initialization status:', error);
    return {
      auth: false,
      sync: false,
      analytics: false,
      biometric: false,
    };
  }
};

/**
 * Perform health check on all services
 */
export const performHealthCheck = async (): Promise<{
  healthy: boolean;
  services: Record<string, { status: 'healthy' | 'unhealthy' | 'unknown'; message?: string }>;
}> => {
  const services: Record<string, { status: 'healthy' | 'unhealthy' | 'unknown'; message?: string }> = {};

  // Check Authentication Service
  try {
    const authStatus = await AuthenticationService.checkAuthStatus();
    services.auth = {
      status: 'healthy',
      message: authStatus.isAuthenticated ? 'User authenticated' : 'User not authenticated',
    };
  } catch (error) {
    services.auth = {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : String(error),
    };
  }

  // Check Sync Service
  try {
    const syncStatus = await SyncService.getSyncStatus();
    services.sync = {
      status: syncStatus.isOnline ? 'healthy' : 'unhealthy',
      message: `${syncStatus.pendingItems} items pending sync`,
    };
  } catch (error) {
    services.sync = {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : String(error),
    };
  }

  // Check Analytics Service
  try {
    const analyticsStatus = await AnalyticsService.getAnalyticsSummary();
    services.analytics = {
      status: 'healthy',
      message: `${analyticsStatus.queuedEvents} events queued`,
    };
  } catch (error) {
    services.analytics = {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : String(error),
    };
  }

  // Check Biometric Service
  try {
    const biometricService = BiometricService.getInstance();
    const isAvailable = await biometricService.isAvailable();
    services.biometric = {
      status: isAvailable ? 'healthy' : 'unknown',
      message: isAvailable ? 'Biometric authentication available' : 'Biometric authentication not available',
    };
  } catch (error) {
    services.biometric = {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : String(error),
    };
  }

  // Determine overall health
  const unhealthyServices = Object.values(services).filter(service => service.status === 'unhealthy');
  const healthy = unhealthyServices.length === 0;

  return {
    healthy,
    services,
  };
}; 
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
