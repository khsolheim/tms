/**
<<<<<<< HEAD
 * Analytics Service for TMS Mobile
 * Handles event tracking and analytics
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

export class AnalyticsService {
  private static events: AnalyticsEvent[] = [];
  private static isEnabled = true;

  /**
   * Track an analytics event
   */
  static trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) {
      return;
    }

    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: new Date(),
    };

    this.events.push(event);
    console.log(`[Analytics] Event tracked: ${eventName}`, properties);

    // In a real implementation, you would send this to your analytics service
    // For now, we just log it
    this.sendEventToAnalytics(event);
=======
 * Analytics Service for TMS Mobile App
 * Handles user analytics, event tracking, and performance monitoring
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthenticationService } from './AuthenticationService';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

export interface UserProperties {
  userId: string;
  email?: string;
  rolle?: string;
  bedriftId?: string;
  appVersion: string;
  platform: string;
  deviceModel?: string;
}

export interface SessionInfo {
  sessionId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  eventCount: number;
}

class AnalyticsServiceClass {
  private readonly EVENTS_QUEUE_KEY = 'analytics_events_queue';
  private readonly SESSION_KEY = 'analytics_session';
  private readonly USER_PROPERTIES_KEY = 'analytics_user_properties';
  private readonly MAX_QUEUE_SIZE = 100;
  private readonly FLUSH_INTERVAL = 60000; // 1 minute
  
  private eventsQueue: AnalyticsEvent[] = [];
  private currentSession: SessionInfo | null = null;
  private flushInterval: NodeJS.Timeout | null = null;
  private baseUrl = process.env.API_BASE_URL || 'http://localhost:3001/api';

  /**
   * Initialize analytics service
   */
  async initialize(): Promise<void> {
    try {
      // Load queued events
      const queueData = await AsyncStorage.getItem(this.EVENTS_QUEUE_KEY);
      if (queueData) {
        this.eventsQueue = JSON.parse(queueData);
      }

      // Start or resume session
      await this.startSession();

      // Start periodic flush
      this.startPeriodicFlush();

      // Set user properties
      await this.updateUserProperties();

      console.log('Analytics service initialized');
    } catch (error) {
      console.error('Failed to initialize analytics service:', error);
    }
  }

  /**
   * Track an event
   */
  async trackEvent(eventName: string, properties?: Record<string, any>): Promise<void> {
    try {
      if (!this.currentSession) {
        await this.startSession();
      }

      const user = AuthenticationService.getCurrentUser();
      
      const event: AnalyticsEvent = {
        name: eventName,
        properties: {
          ...properties,
          sessionId: this.currentSession?.sessionId,
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
        userId: user?.id,
        sessionId: this.currentSession?.sessionId || 'unknown',
      };

      this.eventsQueue.push(event);

      // Update session event count
      if (this.currentSession) {
        this.currentSession.eventCount++;
        await this.saveSession();
      }

      // Auto-flush if queue is full
      if (this.eventsQueue.length >= this.MAX_QUEUE_SIZE) {
        await this.flushEvents();
      } else {
        await this.saveEventsQueue();
      }

      console.log(`Event tracked: ${eventName}`, properties);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
  }

  /**
   * Track screen view
   */
<<<<<<< HEAD
  static trackScreenView(screenName: string, properties?: Record<string, any>): void {
    this.trackEvent('screen_view', {
=======
  async trackScreenView(screenName: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent('screen_view', {
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Track user action
   */
<<<<<<< HEAD
  static trackUserAction(action: string, properties?: Record<string, any>): void {
    this.trackEvent('user_action', {
      action,
=======
  async trackUserAction(action: string, target: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent('user_action', {
      action,
      target,
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
      ...properties,
    });
  }

  /**
   * Track error
   */
<<<<<<< HEAD
  static trackError(error: Error, context?: string): void {
    this.trackEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      context,
=======
  async trackError(error: Error, context?: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      context,
      ...properties,
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
    });
  }

  /**
<<<<<<< HEAD
   * Enable or disable analytics
   */
  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`[Analytics] Analytics ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get all tracked events
   */
  static getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Clear all events
   */
  static clearEvents(): void {
    this.events = [];
  }

  /**
   * Send event to analytics service (placeholder)
   */
  private static sendEventToAnalytics(event: AnalyticsEvent): void {
    // TODO: Implement actual analytics service integration
    // This could be Firebase Analytics, Mixpanel, etc.
    console.log('[Analytics] Sending event:', event);
  }
} 
=======
   * Track performance metric
   */
  async trackPerformance(metric: string, value: number, unit: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent('performance', {
      metric,
      value,
      unit,
      ...properties,
    });
  }

  /**
   * Set user properties
   */
  async setUserProperties(properties: Partial<UserProperties>): Promise<void> {
    try {
      const existingProperties = await this.getUserProperties();
      const updatedProperties = {
        ...existingProperties,
        ...properties,
        lastUpdated: Date.now(),
      };

      await AsyncStorage.setItem(this.USER_PROPERTIES_KEY, JSON.stringify(updatedProperties));
      
      // Track user properties update
      await this.trackEvent('user_properties_updated', properties);
    } catch (error) {
      console.error('Error setting user properties:', error);
    }
  }

  /**
   * Get user properties
   */
  async getUserProperties(): Promise<UserProperties | null> {
    try {
      const data = await AsyncStorage.getItem(this.USER_PROPERTIES_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user properties:', error);
      return null;
    }
  }

  /**
   * Start new session
   */
  private async startSession(): Promise<void> {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.currentSession = {
        sessionId,
        startTime: Date.now(),
        eventCount: 0,
      };

      await this.saveSession();
      
      await this.trackEvent('session_start', {
        sessionId,
      });
    } catch (error) {
      console.error('Error starting session:', error);
    }
  }

  /**
   * End current session
   */
  async endSession(): Promise<void> {
    try {
      if (!this.currentSession) {
        return;
      }

      const endTime = Date.now();
      const duration = endTime - this.currentSession.startTime;

      await this.trackEvent('session_end', {
        sessionId: this.currentSession.sessionId,
        duration,
        eventCount: this.currentSession.eventCount,
      });

      this.currentSession.endTime = endTime;
      this.currentSession.duration = duration;
      
      await this.saveSession();
      await this.flushEvents();

      this.currentSession = null;
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  /**
   * Save session to storage
   */
  private async saveSession(): Promise<void> {
    try {
      if (this.currentSession) {
        await AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify(this.currentSession));
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  /**
   * Update user properties from current user
   */
  private async updateUserProperties(): Promise<void> {
    try {
      const user = AuthenticationService.getCurrentUser();
      if (user) {
        await this.setUserProperties({
          userId: user.id,
          email: user.email,
          rolle: user.rolle,
          bedriftId: user.bedriftId,
          appVersion: require('../../package.json').version,
          platform: 'react-native',
        });
      }
    } catch (error) {
      console.error('Error updating user properties:', error);
    }
  }

  /**
   * Flush events to server
   */
  async flushEvents(): Promise<void> {
    if (this.eventsQueue.length === 0) {
      return;
    }

    try {
      const authToken = AuthenticationService.getAuthToken();
      if (!authToken) {
        console.warn('No auth token available for analytics');
        return;
      }

      const eventsToSend = [...this.eventsQueue];
      const userProperties = await this.getUserProperties();

      const payload = {
        events: eventsToSend,
        userProperties,
        timestamp: Date.now(),
      };

      const response = await fetch(`${this.baseUrl}/analytics/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Clear sent events from queue
        this.eventsQueue = [];
        await AsyncStorage.removeItem(this.EVENTS_QUEUE_KEY);
        console.log(`Flushed ${eventsToSend.length} analytics events`);
      } else {
        console.error('Failed to flush analytics events:', response.status);
      }
    } catch (error) {
      console.error('Error flushing events:', error);
    }
  }

  /**
   * Save events queue to storage
   */
  private async saveEventsQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.EVENTS_QUEUE_KEY, JSON.stringify(this.eventsQueue));
    } catch (error) {
      console.error('Error saving events queue:', error);
    }
  }

  /**
   * Start periodic flush
   */
  private startPeriodicFlush(): void {
    if (this.flushInterval) {
      return;
    }

    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, this.FLUSH_INTERVAL);
  }

  /**
   * Stop periodic flush
   */
  private stopPeriodicFlush(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  /**
   * Get analytics summary
   */
  async getAnalyticsSummary(): Promise<{
    queuedEvents: number;
    currentSession: SessionInfo | null;
    userProperties: UserProperties | null;
  }> {
    return {
      queuedEvents: this.eventsQueue.length,
      currentSession: this.currentSession,
      userProperties: await this.getUserProperties(),
    };
  }

  /**
   * Clear all analytics data
   */
  async clearAnalyticsData(): Promise<void> {
    try {
      this.eventsQueue = [];
      this.currentSession = null;
      
      await AsyncStorage.multiRemove([
        this.EVENTS_QUEUE_KEY,
        this.SESSION_KEY,
        this.USER_PROPERTIES_KEY,
      ]);

      this.stopPeriodicFlush();
      console.log('Analytics data cleared');
    } catch (error) {
      console.error('Error clearing analytics data:', error);
    }
  }

  /**
   * Cleanup on app termination
   */
  async cleanup(): Promise<void> {
    try {
      await this.endSession();
      this.stopPeriodicFlush();
    } catch (error) {
      console.error('Error during analytics cleanup:', error);
    }
  }
}

export const AnalyticsService = new AnalyticsServiceClass(); 
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
