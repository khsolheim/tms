/**
 * TMS Mobile App - React Native Main Application
 * 
 * Enterprise mobile app for Training Management System
 * Features: Offline-first, Push notifications, Biometric auth, QR scanning
 */

import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  Alert,
  AppState,
  AppStateStatus,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import EncryptedStorage from 'react-native-encrypted-storage';
import PushNotification, { Importance } from 'react-native-push-notification';

// Navigation
import { RootNavigator } from './navigation/RootNavigator';

// Services
import { AuthenticationService } from './services/AuthenticationService';
import { OfflineService } from './services/OfflineService';
import { BiometricService } from './services/BiometricService';
import { SyncService } from './services/SyncService';
import { AnalyticsService } from './services/AnalyticsService';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Components
import { SplashScreen } from './components/SplashScreen';
import { OfflineNotice } from './components/OfflineNotice';
import { BiometricPrompt } from './components/BiometricPrompt';

// Utils
import { initializeServices } from './utils/initialization';

// React Query Client Setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeApp();
    setupAppStateListener();
    setupNetworkListener();
    setupPushNotifications();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize core services
      await initializeServices();

      // Check authentication status
      const authStatus = await AuthenticationService.checkAuthStatus();
      setIsAuthenticated(authStatus.isAuthenticated);

      // Initialize offline service (handled by OfflineContext)

      // Start background sync
      SyncService.startBackgroundSync();

      // Check if biometric authentication is available and enabled
      const biometricService = BiometricService.getInstance();
      const biometricAvailable = await biometricService.isAvailable();
      const biometricEnabled = await EncryptedStorage.getItem('biometric_enabled');
      
      if (authStatus.isAuthenticated && biometricAvailable && biometricEnabled === 'true') {
        setShowBiometricPrompt(true);
      }

      // Track app launch
      AnalyticsService.trackEvent('app_launched', {
        timestamp: new Date().toISOString(),
        version: require('../package.json').version,
      });

    } catch (error) {
      console.error('App initialization failed:', error);
      Alert.alert(
        'Initialization Error',
        'Failed to initialize the app. Please restart the application.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const setupAppStateListener = () => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App became active
        SyncService.syncOfflineData();
        AnalyticsService.trackEvent('app_foreground');
      } else if (nextAppState === 'background') {
        // App went to background
        AnalyticsService.trackEvent('app_background');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  };

  const setupNetworkListener = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !isOnline;
      const isNowOnline = state.isConnected ?? false;
      
      setIsOnline(isNowOnline);

      if (wasOffline && isNowOnline) {
        // Back online - start sync
        SyncService.syncOfflineData();
        AnalyticsService.trackEvent('network_reconnected');
      } else if (!isNowOnline) {
        AnalyticsService.trackEvent('network_disconnected');
      }
    });

    return unsubscribe;
  };

  const setupPushNotifications = () => {
    // Configure push notifications
    PushNotification.configure({
      onRegister: function(token) {
        console.log('Push token:', token);
        // Send token to server
        AuthenticationService.registerPushToken(token.token);
      },

      onNotification: function(notification) {
        console.log('Push notification received:', notification);
        
        AnalyticsService.trackEvent('push_notification_received', {
          type: notification.data?.type,
          foreground: notification.foreground,
        });

        if (notification.userInteraction) {
          // User tapped notification
          AnalyticsService.trackEvent('push_notification_tapped');
          // Handle navigation based on notification data
          handleNotificationTap(notification.data);
        }
      },

      senderID: process.env.FCM_SENDER_ID || '123456789',
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

    // Create notification channels (Android)
    PushNotification.createChannel(
      {
        channelId: 'tms-general',
        channelName: 'TMS General Notifications',
        channelDescription: 'General notifications from TMS',
        importance: Importance.HIGH,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );

    PushNotification.createChannel(
      {
        channelId: 'tms-urgent',
        channelName: 'TMS Urgent Notifications',
        channelDescription: 'Urgent notifications from TMS',
        importance: Importance.HIGH,
        vibrate: true,
<<<<<<< HEAD

=======
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
      },
      (created) => console.log(`Urgent channel created: ${created}`)
    );
  };

  const handleNotificationTap = (data: any) => {
    // Navigate based on notification data
    if (data?.screen) {
      // Navigation logic would be handled by navigation service
      console.log('Navigate to:', data.screen);
    }
  };

  const handleBiometricSuccess = () => {
    setShowBiometricPrompt(false);
    AnalyticsService.trackEvent('biometric_auth_success');
  };

  const handleBiometricFailure = () => {
    setShowBiometricPrompt(false);
    // Logout or show alternative auth
    AuthenticationService.logout();
    setIsAuthenticated(false);
    AnalyticsService.trackEvent('biometric_auth_failure');
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <OfflineProvider>
            <NotificationProvider>
              <NavigationContainer>
                <StatusBar
                  barStyle="dark-content"
                  backgroundColor="#ffffff"
                  translucent={false}
                />
                
                {/* Main App Navigation */}
                <RootNavigator />
                
                {/* Offline Notice */}
                {!isOnline && <OfflineNotice />}
                
                {/* Biometric Authentication Prompt */}
                {showBiometricPrompt && (
                  <BiometricPrompt
                    visible={showBiometricPrompt}
                    onSuccess={handleBiometricSuccess}
                    onFailure={handleBiometricFailure}
                    onCancel={handleBiometricFailure}
                  />
                )}
              </NavigationContainer>
            </NotificationProvider>
          </OfflineProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

export default App; 