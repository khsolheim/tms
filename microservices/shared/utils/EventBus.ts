import { EventEmitter } from 'events';
import { ServiceEvent } from '../types';

export class EventBus extends EventEmitter {
  private static instance: EventBus;

  private constructor() {
    super();
    this.setMaxListeners(100); // Increase max listeners for microservices
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public publish(event: ServiceEvent): void {
    console.log(`📡 Publishing event: ${event.type} from ${event.source}`);
    this.emit(event.type, event);
    this.emit('*', event); // Wildcard listener for logging/monitoring
  }

  public subscribe(eventType: string, handler: (event: ServiceEvent) => void): void {
    console.log(`📥 Subscribing to event: ${eventType}`);
    this.on(eventType, handler);
  }

  public unsubscribe(eventType: string, handler: (event: ServiceEvent) => void): void {
    console.log(`📤 Unsubscribing from event: ${eventType}`);
    this.off(eventType, handler);
  }

  public subscribeToAll(handler: (event: ServiceEvent) => void): void {
    console.log(`📥 Subscribing to all events`);
    this.on('*', handler);
  }
}

// Event factory functions
export const createUserCreatedEvent = (data: {
  userId: string;
  email: string;
  bedriftId: string;
  rolle: string;
}): ServiceEvent => ({
  id: generateEventId(),
  type: 'USER_CREATED',
  source: 'user-service',
  data,
  timestamp: new Date(),
  correlationId: generateCorrelationId()
});

export const createServiceActivatedEvent = (data: {
  bedriftId: string;
  serviceId: string;
  serviceType: string;
  activatedBy: string;
}): ServiceEvent => ({
  id: generateEventId(),
  type: 'SERVICE_ACTIVATED',
  source: 'admin-service',
  data,
  timestamp: new Date(),
  correlationId: generateCorrelationId()
});

export const createQuizCompletedEvent = (data: {
  quizId: string;
  userId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  bedriftId: string;
}): ServiceEvent => ({
  id: generateEventId(),
  type: 'QUIZ_COMPLETED',
  source: 'quiz-service',
  data,
  timestamp: new Date(),
  correlationId: generateCorrelationId()
});

export const createSikkerhetskontrollCompletedEvent = (data: {
  kontrollId: string;
  userId: string;
  status: string;
  bedriftId: string;
}): ServiceEvent => ({
  id: generateEventId(),
  type: 'SIKKERHETSKONTROLL_COMPLETED',
  source: 'sikkerhetskontroll-service',
  data,
  timestamp: new Date(),
  correlationId: generateCorrelationId()
});

export const createEmployeeCreatedEvent = (data: {
  employeeId: string;
  bedriftId: string;
  role: string;
  email: string;
}): ServiceEvent => ({
  id: generateEventId(),
  type: 'EMPLOYEE_CREATED',
  source: 'hr-service',
  data,
  timestamp: new Date(),
  correlationId: generateCorrelationId()
});

export const createAttendanceRecordedEvent = (data: {
  employeeId: string;
  date: string;
  type: string;
  hours: number;
  bedriftId: string;
}): ServiceEvent => ({
  id: generateEventId(),
  type: 'ATTENDANCE_RECORDED',
  source: 'hr-service',
  data,
  timestamp: new Date(),
  correlationId: generateCorrelationId()
});

export const createPayrollGeneratedEvent = (data: {
  employeeId: string;
  period: string;
  amount: number;
  bedriftId: string;
}): ServiceEvent => ({
  id: generateEventId(),
  type: 'PAYROLL_GENERATED',
  source: 'hr-service',
  data,
  timestamp: new Date(),
  correlationId: generateCorrelationId()
});

// Utility functions
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateCorrelationId(): string {
  return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Export singleton instance
export const eventBus = EventBus.getInstance(); 