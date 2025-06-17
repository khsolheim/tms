export interface QueueMessage {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  delay?: number;
  priority: number;
}

export interface QueueOptions {
  maxRetries: number;
  retryDelay: number;
  maxConcurrency: number;
  visibilityTimeout: number;
}

export interface MessageHandler {
  (message: QueueMessage): Promise<void>;
}

export class MessageQueue {
  private handlers: Map<string, MessageHandler> = new Map();
  private processing: Set<string> = new Set();
  private options: QueueOptions;
  private isRunning: boolean = false;

  constructor(options: Partial<QueueOptions> = {}) {
    this.options = {
      maxRetries: 3,
      retryDelay: 5000,
      maxConcurrency: 10,
      visibilityTimeout: 30000,
      ...options
    };
  }

  // Register message handler
  subscribe(messageType: string, handler: MessageHandler): void {
    this.handlers.set(messageType, handler);
  }

  // Send message to queue
  async publish(messageType: string, payload: any, options: Partial<Pick<QueueMessage, 'delay' | 'priority'>> = {}): Promise<void> {
    const message: QueueMessage = {
      id: this.generateId(),
      type: messageType,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.options.maxRetries,
      delay: options.delay || 0,
      priority: options.priority || 0
    };

    await this.enqueueMessage(message);
  }

  // Start processing messages
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.processMessages();
  }

  // Stop processing messages
  stop(): void {
    this.isRunning = false;
  }

  private async processMessages(): Promise<void> {
    while (this.isRunning) {
      try {
        if (this.processing.size >= this.options.maxConcurrency) {
          await this.sleep(100);
          continue;
        }

        const message = await this.dequeueMessage();
        if (!message) {
          await this.sleep(1000);
          continue;
        }

        // Process message asynchronously
        this.processMessage(message).catch(error => {
          console.error('Message processing error:', error);
        });

      } catch (error) {
        console.error('Queue processing error:', error);
        await this.sleep(5000);
      }
    }
  }

  private async processMessage(message: QueueMessage): Promise<void> {
    this.processing.add(message.id);

    try {
      const handler = this.handlers.get(message.type);
      if (!handler) {
        console.warn(`No handler found for message type: ${message.type}`);
        return;
      }

      // Check if message should be delayed
      if (message.delay && message.delay > Date.now()) {
        await this.requeueMessage(message);
        return;
      }

      await handler(message);
      console.log(`Message processed successfully: ${message.type}:${message.id}`);

    } catch (error) {
      console.error(`Message processing failed: ${message.type}:${message.id}`, error);
      await this.handleFailedMessage(message, error);
    } finally {
      this.processing.delete(message.id);
    }
  }

  private async handleFailedMessage(message: QueueMessage, error: any): Promise<void> {
    message.retryCount++;

    if (message.retryCount <= message.maxRetries) {
      // Exponential backoff
      const delay = this.options.retryDelay * Math.pow(2, message.retryCount - 1);
      message.delay = Date.now() + delay;
      
      console.log(`Retrying message ${message.id} in ${delay}ms (attempt ${message.retryCount}/${message.maxRetries})`);
      await this.requeueMessage(message);
    } else {
      console.error(`Message ${message.id} failed permanently after ${message.maxRetries} retries`);
      await this.sendToDeadLetterQueue(message, error);
    }
  }

  // Mock implementations (in production, use Redis)
  private async enqueueMessage(message: QueueMessage): Promise<void> {
    // In production: await redis.lpush('queue:messages', JSON.stringify(message));
    console.log(`[QUEUE] Enqueued: ${message.type}:${message.id}`);
  }

  private async dequeueMessage(): Promise<QueueMessage | null> {
    // In production: const result = await redis.brpop('queue:messages', 1);
    // Mock: return null to simulate empty queue
    return null;
  }

  private async requeueMessage(message: QueueMessage): Promise<void> {
    // In production: await redis.lpush('queue:messages', JSON.stringify(message));
    console.log(`[QUEUE] Requeued: ${message.type}:${message.id}`);
  }

  private async sendToDeadLetterQueue(message: QueueMessage, error: any): Promise<void> {
    // In production: await redis.lpush('queue:dead-letter', JSON.stringify({ message, error: error.message }));
    console.log(`[QUEUE] Dead letter: ${message.type}:${message.id}`);
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global message queue instance
export const messageQueue = new MessageQueue();

// Predefined message types
export const MessageTypes = {
  USER_REGISTERED: 'user.registered',
  USER_UPDATED: 'user.updated',
  QUIZ_COMPLETED: 'quiz.completed',
  SIKKERHETSKONTROLL_COMPLETED: 'sikkerhetskontroll.completed',
  CERTIFICATE_GENERATED: 'certificate.generated',
  EMAIL_SEND: 'email.send',
  NOTIFICATION_SEND: 'notification.send',
  REPORT_GENERATE: 'report.generate',
  DATA_SYNC: 'data.sync'
} as const;

// Message handlers setup
export function setupMessageHandlers(): void {
  // User events
  messageQueue.subscribe(MessageTypes.USER_REGISTERED, async (message) => {
    console.log('Processing user registration:', message.payload);
    // Send welcome email, create default settings, etc.
  });

  messageQueue.subscribe(MessageTypes.USER_UPDATED, async (message) => {
    console.log('Processing user update:', message.payload);
    // Update related data, sync with external systems, etc.
  });

  // Quiz events
  messageQueue.subscribe(MessageTypes.QUIZ_COMPLETED, async (message) => {
    console.log('Processing quiz completion:', message.payload);
    // Generate certificate, update statistics, send notifications
  });

  // Safety control events
  messageQueue.subscribe(MessageTypes.SIKKERHETSKONTROLL_COMPLETED, async (message) => {
    console.log('Processing safety control completion:', message.payload);
    // Generate reports, update compliance status, notify supervisors
  });

  // Certificate generation
  messageQueue.subscribe(MessageTypes.CERTIFICATE_GENERATED, async (message) => {
    console.log('Processing certificate generation:', message.payload);
    // Send certificate via email, update user records
  });

  // Email sending
  messageQueue.subscribe(MessageTypes.EMAIL_SEND, async (message) => {
    console.log('Processing email send:', message.payload);
    // Send email via SMTP, track delivery status
  });

  // Notification sending
  messageQueue.subscribe(MessageTypes.NOTIFICATION_SEND, async (message) => {
    console.log('Processing notification send:', message.payload);
    // Send push notification, SMS, or in-app notification
  });

  // Report generation
  messageQueue.subscribe(MessageTypes.REPORT_GENERATE, async (message) => {
    console.log('Processing report generation:', message.payload);
    // Generate PDF reports, aggregate data, send to stakeholders
  });

  // Data synchronization
  messageQueue.subscribe(MessageTypes.DATA_SYNC, async (message) => {
    console.log('Processing data sync:', message.payload);
    // Sync with external systems, update caches, maintain consistency
  });
}

// Utility functions for common message patterns
export async function publishUserEvent(eventType: string, userId: string, data: any): Promise<void> {
  await messageQueue.publish(eventType, {
    userId,
    timestamp: Date.now(),
    ...data
  });
}

export async function publishQuizEvent(quizId: string, userId: string, data: any): Promise<void> {
  await messageQueue.publish(MessageTypes.QUIZ_COMPLETED, {
    quizId,
    userId,
    timestamp: Date.now(),
    ...data
  });
}

export async function publishSafetyEvent(kontrollId: string, userId: string, data: any): Promise<void> {
  await messageQueue.publish(MessageTypes.SIKKERHETSKONTROLL_COMPLETED, {
    kontrollId,
    userId,
    timestamp: Date.now(),
    ...data
  });
}

export async function publishEmailEvent(to: string, subject: string, template: string, data: any): Promise<void> {
  await messageQueue.publish(MessageTypes.EMAIL_SEND, {
    to,
    subject,
    template,
    data,
    timestamp: Date.now()
  }, { priority: 1 }); // High priority for emails
}

export async function publishNotificationEvent(userId: string, type: string, message: string, data?: any): Promise<void> {
  await messageQueue.publish(MessageTypes.NOTIFICATION_SEND, {
    userId,
    type,
    message,
    data,
    timestamp: Date.now()
  });
} 