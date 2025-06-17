export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
  expectedErrors?: string[];
}

export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private successCount: number = 0;
  private readonly options: CircuitBreakerOptions;

  constructor(options: CircuitBreakerOptions) {
    this.options = {
      expectedErrors: [],
      ...options
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitBreakerState.HALF_OPEN;
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= 3) { // Require 3 successful calls to close
        this.state = CircuitBreakerState.CLOSED;
      }
    }
  }

  private onFailure(error: any): void {
    // Don't count expected errors as failures
    if (this.options.expectedErrors?.includes(error.name)) {
      return;
    }

    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
    }
  }

  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime >= this.options.resetTimeout;
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime
    };
  }

  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
  }
}

// Service-specific circuit breakers
export const circuitBreakers = {
  authService: new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 30000,
    monitoringPeriod: 10000
  }),
  
  userService: new CircuitBreaker({
    failureThreshold: 3,
    resetTimeout: 60000,
    monitoringPeriod: 15000
  }),
  
  quizService: new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 45000,
    monitoringPeriod: 10000
  }),
  
  sikkerhetskontrollService: new CircuitBreaker({
    failureThreshold: 3,
    resetTimeout: 60000,
    monitoringPeriod: 20000
  }),
  
  hrService: new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 30000,
    monitoringPeriod: 10000
  }),
  
  database: new CircuitBreaker({
    failureThreshold: 3,
    resetTimeout: 120000, // 2 minutes for database
    monitoringPeriod: 30000,
    expectedErrors: ['ConnectionError', 'TimeoutError']
  })
}; 