import { EventEmitter } from 'events';
import logger from '../utils/logger';

// Event types for type safety
export interface TMSEvent {
  id: string;
  type: string;
  timestamp: Date;
  source: string;
  data: any;
  metadata?: {
    userId?: string;
    sessionId?: string;
    correlationId?: string;
    version?: string;
  };
}

// Event categories
export enum EventType {
  // User events
  USER_REGISTERED = 'user.registered',
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  USER_PROFILE_UPDATED = 'user.profile.updated',
  
  // Bedrift events
  BEDRIFT_CREATED = 'bedrift.created',
  BEDRIFT_UPDATED = 'bedrift.updated',
  BEDRIFT_DELETED = 'bedrift.deleted',
  BEDRIFT_STATUS_CHANGED = 'bedrift.status.changed',
  
  // Sikkerhetskontroll events
  SIKKERHETSKONTROLL_CREATED = 'sikkerhetskontroll.created',
  SIKKERHETSKONTROLL_UPDATED = 'sikkerhetskontroll.updated',
  SIKKERHETSKONTROLL_COMPLETED = 'sikkerhetskontroll.completed',
  SIKKERHETSKONTROLL_FAILED = 'sikkerhetskontroll.failed',
  
  // Quiz events
  QUIZ_STARTED = 'quiz.started',
  QUIZ_COMPLETED = 'quiz.completed',
  QUIZ_QUESTION_ANSWERED = 'quiz.question.answered',
  QUIZ_SCORE_CALCULATED = 'quiz.score.calculated',
  
  // System events
  SYSTEM_STARTUP = 'system.startup',
  SYSTEM_SHUTDOWN = 'system.shutdown',
  SYSTEM_ERROR = 'system.error',
  SYSTEM_HEALTH_CHECK = 'system.health.check',
  
  // Security events
  SECURITY_THREAT_DETECTED = 'security.threat.detected',
  SECURITY_LOGIN_FAILED = 'security.login.failed',
  SECURITY_RATE_LIMIT_EXCEEDED = 'security.rate.limit.exceeded',
  SECURITY_UNAUTHORIZED_ACCESS = 'security.unauthorized.access',
  
  // Business events
  BUSINESS_OPERATION_STARTED = 'business.operation.started',
  BUSINESS_OPERATION_COMPLETED = 'business.operation.completed',
  BUSINESS_OPERATION_FAILED = 'business.operation.failed',
  BUSINESS_METRIC_UPDATED = 'business.metric.updated',
  
  // Integration events
  INTEGRATION_API_CALL = 'integration.api.call',
  INTEGRATION_WEBHOOK_RECEIVED = 'integration.webhook.received',
  INTEGRATION_SYNC_COMPLETED = 'integration.sync.completed',
  INTEGRATION_ERROR = 'integration.error'
}

// Event handler interface
export interface EventHandler {
  handle(event: TMSEvent): Promise<void>;
}

// Event bus class
export class TMSEventBus extends EventEmitter {
  private static instance: TMSEventBus;
  private eventHistory: TMSEvent[] = [];
  private maxHistorySize = 1000;
  private handlers: Map<string, EventHandler[]> = new Map();

  private constructor() {
    super();
    this.setMaxListeners(100);
  }

  public static getInstance(): TMSEventBus {
    if (!TMSEventBus.instance) {
      TMSEventBus.instance = new TMSEventBus();
    }
    return TMSEventBus.instance;
  }

  // Publish an event
  public async publish(eventType: EventType, data: any, metadata?: any): Promise<void> {
    const event: TMSEvent = {
      id: this.generateEventId(),
      type: eventType,
      timestamp: new Date(),
      source: 'tms-backend',
      data,
      metadata: {
        correlationId: this.generateCorrelationId(),
        version: '1.0',
        ...metadata
      }
    };

    try {
      // Add to history
      this.addToHistory(event);

      // Log the event
      logger.info(`Publishing event: ${eventType}`, {
        eventId: event.id,
        correlationId: event.metadata?.correlationId
      });

      // Emit to EventEmitter listeners
      this.emit(eventType, event);

      // Execute registered handlers
      await this.executeHandlers(eventType, event);

      // Emit generic event for monitoring
      this.emit('event.published', event);

    } catch (error) {
      logger.error(`Error publishing event ${eventType}:`, error);
      
      // Publish error event
      await this.publishErrorEvent(eventType, error, event);
      throw error;
    }
  }

  // Subscribe to events with handler
  public subscribe(eventType: EventType, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);

    logger.info(`Handler subscribed to event: ${eventType}`);
  }

  // Subscribe with callback function
  public on(eventType: EventType, callback: (event: TMSEvent) => void): this {
    return super.on(eventType, callback);
  }

  // Subscribe once
  public once(eventType: EventType, callback: (event: TMSEvent) => void): this {
    return super.once(eventType, callback);
  }

  // Unsubscribe handler
  public unsubscribe(eventType: EventType, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
        logger.info(`Handler unsubscribed from event: ${eventType}`);
      }
    }
  }

  // Get event history
  public getEventHistory(limit?: number): TMSEvent[] {
    return limit ? this.eventHistory.slice(-limit) : [...this.eventHistory];
  }

  // Get events by type
  public getEventsByType(eventType: EventType, limit?: number): TMSEvent[] {
    const filtered = this.eventHistory.filter(event => event.type === eventType);
    return limit ? filtered.slice(-limit) : filtered;
  }

  // Get events by correlation ID
  public getEventsByCorrelationId(correlationId: string): TMSEvent[] {
    return this.eventHistory.filter(
      event => event.metadata?.correlationId === correlationId
    );
  }

  // Clear event history
  public clearHistory(): void {
    this.eventHistory = [];
    logger.info('Event history cleared');
  }

  // Get event statistics
  public getEventStats(): any {
    const stats = {
      totalEvents: this.eventHistory.length,
      eventsByType: {} as Record<string, number>,
      recentEvents: this.eventHistory.slice(-10),
      oldestEvent: this.eventHistory[0]?.timestamp,
      newestEvent: this.eventHistory[this.eventHistory.length - 1]?.timestamp
    };

    // Count events by type
    this.eventHistory.forEach(event => {
      stats.eventsByType[event.type] = (stats.eventsByType[event.type] || 0) + 1;
    });

    return stats;
  }

  // Private methods
  private async executeHandlers(eventType: EventType, event: TMSEvent): Promise<void> {
    const handlers = this.handlers.get(eventType) || [];
    
    const promises = handlers.map(async (handler) => {
      try {
        await handler.handle(event);
      } catch (error) {
        logger.error(`Handler error for event ${eventType}:`, error);
        // Don't throw here to prevent one handler from breaking others
      }
    });

    await Promise.allSettled(promises);
  }

  private addToHistory(event: TMSEvent): void {
    this.eventHistory.push(event);
    
    // Maintain history size limit
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async publishErrorEvent(originalEventType: string, error: any, originalEvent: TMSEvent): Promise<void> {
    try {
      const errorEvent: TMSEvent = {
        id: this.generateEventId(),
        type: EventType.SYSTEM_ERROR,
        timestamp: new Date(),
        source: 'tms-backend',
        data: {
          originalEventType,
          originalEventId: originalEvent.id,
          error: error.message || error,
          stack: error.stack
        },
        metadata: {
          correlationId: originalEvent.metadata?.correlationId,
          version: '1.0'
        }
      };

      this.addToHistory(errorEvent);
      this.emit(EventType.SYSTEM_ERROR, errorEvent);
    } catch (nestedError) {
      logger.error('Failed to publish error event:', nestedError);
    }
  }
}

// Export singleton instance
export const eventBus = TMSEventBus.getInstance(); 