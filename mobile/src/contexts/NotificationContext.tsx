<<<<<<< HEAD
import React, { createContext, ReactNode } from 'react';

interface NotificationContextType {
  notifications: any[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value: NotificationContextType = {
    notifications: [],
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
=======
/**
 * Notification Context for TMS Mobile App
 * Manages push notifications and in-app notifications
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
import { AnalyticsService } from '../services/AnalyticsService';

interface NotificationState {
  isInitialized: boolean;
  permissionGranted: boolean;
  pushToken: string | null;
  notifications: InAppNotification[];
  error: string | null;
}

interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  read: boolean;
  data?: any;
}

type NotificationAction =
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_PERMISSION'; payload: boolean }
  | { type: 'SET_PUSH_TOKEN'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: InAppNotification }
  | { type: 'MARK_READ'; payload: string }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_ERROR'; payload: string | null };

interface NotificationContextType {
  state: NotificationState;
  requestPermission: () => Promise<boolean>;
  showNotification: (title: string, message: string, type?: InAppNotification['type'], data?: any) => void;
  markAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  scheduleLocalNotification: (title: string, message: string, date: Date, data?: any) => void;
  cancelLocalNotification: (id: string) => void;
}

const initialState: NotificationState = {
  isInitialized: false,
  permissionGranted: false,
  pushToken: null,
  notifications: [],
  error: null,
};

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'SET_INITIALIZED':
      return {
        ...state,
        isInitialized: action.payload,
      };
    case 'SET_PERMISSION':
      return {
        ...state,
        permissionGranted: action.payload,
      };
    case 'SET_PUSH_TOKEN':
      return {
        ...state,
        pushToken: action.payload,
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        ),
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload),
      };
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      // Configure push notifications
      PushNotification.configure({
        onRegister: function(token) {
          console.log('Push token received:', token);
          dispatch({ type: 'SET_PUSH_TOKEN', payload: token.token });
          
          // Track token registration
          AnalyticsService.trackEvent('push_token_registered', {
            platform: Platform.OS,
            token: token.token,
          });
        },

        onNotification: function(notification) {
          console.log('Push notification received:', notification);
          
          // Track notification received
          AnalyticsService.trackEvent('push_notification_received', {
            foreground: notification.foreground,
            userInteraction: notification.userInteraction,
            data: notification.data,
          });

          // Handle notification based on app state
          if (notification.foreground) {
            // App is in foreground, show in-app notification
            showNotification(
              notification.title || 'Ny melding',
              notification.message || notification.body || 'Du har mottatt en ny melding',
              'info',
              notification.data
            );
          }

          if (notification.userInteraction) {
            // User tapped notification
            AnalyticsService.trackEvent('push_notification_tapped', {
              data: notification.data,
            });
            
            // Handle navigation or action based on notification data
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
        requestPermissions: Platform.OS === 'ios',
      });

      // Request permissions for Android
      if (Platform.OS === 'android') {
        await requestPermission();
      }

      dispatch({ type: 'SET_INITIALIZED', payload: true });
    } catch (error: any) {
      console.error('Failed to initialize notifications:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to initialize notifications' });
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      const permissions = await PushNotification.requestPermissions();
      const granted = !!(permissions.alert && permissions.badge && permissions.sound);
      
      dispatch({ type: 'SET_PERMISSION', payload: granted });
      
      if (!granted) {
        Alert.alert(
          'Tillatelser kreves',
          'For å motta viktige meldinger, vennligst aktiver push-notifikasjoner i innstillingene.',
          [{ text: 'OK' }]
        );
      }

      // Track permission result
      AnalyticsService.trackEvent('push_permission_requested', {
        granted,
        platform: Platform.OS,
      });

      return granted;
    } catch (error: any) {
      console.error('Permission request error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to request permissions' });
      return false;
    }
  };

  const showNotification = (
    title: string,
    message: string,
    type: InAppNotification['type'] = 'info',
    data?: any
  ) => {
    const notification: InAppNotification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      type,
      timestamp: Date.now(),
      read: false,
      data,
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

    // Track in-app notification
    AnalyticsService.trackEvent('in_app_notification_shown', {
      type,
      title,
    });
  };

  const markAsRead = (id: string) => {
    dispatch({ type: 'MARK_READ', payload: id });
    
    // Track notification read
    AnalyticsService.trackEvent('notification_read', { id });
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    
    // Track notification dismissed
    AnalyticsService.trackEvent('notification_dismissed', { id });
  };

  const clearAllNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    
    // Track all notifications cleared
    AnalyticsService.trackEvent('all_notifications_cleared');
  };

  const scheduleLocalNotification = (title: string, message: string, date: Date, data?: any) => {
    try {
      PushNotification.localNotificationSchedule({
        title,
        message,
        date,
        userInfo: data,
        playSound: true,
        soundName: 'default',
      });

      // Track scheduled notification
      AnalyticsService.trackEvent('local_notification_scheduled', {
        title,
        scheduledFor: date.toISOString(),
      });
    } catch (error: any) {
      console.error('Schedule notification error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to schedule notification' });
    }
  };

  const cancelLocalNotification = (id: string) => {
    try {
      PushNotification.cancelLocalNotifications({ id });
      
      // Track cancelled notification
      AnalyticsService.trackEvent('local_notification_cancelled', { id });
    } catch (error: any) {
      console.error('Cancel notification error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to cancel notification' });
    }
  };

  const handleNotificationTap = (data: any) => {
    // Handle navigation or actions based on notification data
    if (data?.screen) {
      console.log('Navigate to screen:', data.screen);
      // Navigation logic would be implemented here
    }
    
    if (data?.action) {
      console.log('Perform action:', data.action);
      // Action handling would be implemented here
    }
  };

  const contextValue: NotificationContextType = {
    state,
    requestPermission,
    showNotification,
    markAsRead,
    removeNotification,
    clearAllNotifications,
    scheduleLocalNotification,
    cancelLocalNotification,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
}; 