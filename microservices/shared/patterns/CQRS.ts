export interface Command {
  id: string;
  type: string;
  aggregateId: string;
  payload: any;
  timestamp: Date;
  userId: string;
  correlationId?: string;
}

export interface Query {
  id: string;
  type: string;
  parameters: any;
  timestamp: Date;
  userId?: string;
}

export interface CommandResult {
  success: boolean;
  aggregateId: string;
  version: number;
  events?: DomainEvent[];
  error?: string;
}

export interface QueryResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    totalCount?: number;
    page?: number;
    limit?: number;
  };
}

export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  version: number;
  data: any;
  timestamp: Date;
  userId: string;
  correlationId?: string;
}

// Command Handler Interface
export interface CommandHandler<T extends Command> {
  handle(command: T): Promise<CommandResult>;
}

// Query Handler Interface
export interface QueryHandler<T extends Query, R = any> {
  handle(query: T): Promise<QueryResult<R>>;
}

// Command Bus
export class CommandBus {
  private handlers: Map<string, CommandHandler<any>> = new Map();

  register<T extends Command>(commandType: string, handler: CommandHandler<T>): void {
    this.handlers.set(commandType, handler);
  }

  async execute<T extends Command>(command: T): Promise<CommandResult> {
    const handler = this.handlers.get(command.type);
    if (!handler) {
      throw new Error(`No handler registered for command type: ${command.type}`);
    }

    console.log(`[COMMAND] Executing: ${command.type} for aggregate: ${command.aggregateId}`);
    
    try {
      const result = await handler.handle(command);
      
      if (result.success && result.events) {
        // Publish domain events
        for (const event of result.events) {
          await this.publishEvent(event);
        }
      }
      
      return result;
    } catch (error) {
      console.error(`[COMMAND] Error executing ${command.type}:`, error);
      return {
        success: false,
        aggregateId: command.aggregateId,
        version: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async publishEvent(event: DomainEvent): Promise<void> {
    // In production, publish to event store and message bus
    console.log(`[EVENT] Published: ${event.type} for ${event.aggregateType}:${event.aggregateId}`);
  }
}

// Query Bus
export class QueryBus {
  private handlers: Map<string, QueryHandler<any, any>> = new Map();

  register<T extends Query, R>(queryType: string, handler: QueryHandler<T, R>): void {
    this.handlers.set(queryType, handler);
  }

  async execute<T extends Query, R>(query: T): Promise<QueryResult<R>> {
    const handler = this.handlers.get(query.type);
    if (!handler) {
      throw new Error(`No handler registered for query type: ${query.type}`);
    }

    console.log(`[QUERY] Executing: ${query.type}`);
    
    try {
      return await handler.handle(query);
    } catch (error) {
      console.error(`[QUERY] Error executing ${query.type}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

// Aggregate Root Base Class
export abstract class AggregateRoot {
  protected id: string;
  protected version: number = 0;
  private uncommittedEvents: DomainEvent[] = [];

  constructor(id: string) {
    this.id = id;
  }

  getId(): string {
    return this.id;
  }

  getVersion(): number {
    return this.version;
  }

  getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }

  markEventsAsCommitted(): void {
    this.uncommittedEvents = [];
  }

  protected addEvent(event: DomainEvent): void {
    this.uncommittedEvents.push(event);
    this.version++;
  }

  // Apply event to aggregate state
  protected abstract applyEvent(event: DomainEvent): void;

  // Replay events to rebuild aggregate state
  public replayEvents(events: DomainEvent[]): void {
    for (const event of events) {
      this.applyEvent(event);
      this.version = event.version;
    }
  }
}

// Event Store Interface
export interface EventStore {
  saveEvents(aggregateId: string, events: DomainEvent[], expectedVersion: number): Promise<void>;
  getEvents(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]>;
  getAllEvents(fromTimestamp?: Date): Promise<DomainEvent[]>;
}

// In-Memory Event Store (for development)
export class InMemoryEventStore implements EventStore {
  private events: Map<string, DomainEvent[]> = new Map();

  async saveEvents(aggregateId: string, events: DomainEvent[], expectedVersion: number): Promise<void> {
    const existingEvents = this.events.get(aggregateId) || [];
    
    if (existingEvents.length !== expectedVersion) {
      throw new Error(`Concurrency conflict. Expected version ${expectedVersion}, but was ${existingEvents.length}`);
    }

    const newEvents = [...existingEvents, ...events];
    this.events.set(aggregateId, newEvents);
  }

  async getEvents(aggregateId: string, fromVersion: number = 0): Promise<DomainEvent[]> {
    const events = this.events.get(aggregateId) || [];
    return events.filter(event => event.version > fromVersion);
  }

  async getAllEvents(fromTimestamp?: Date): Promise<DomainEvent[]> {
    const allEvents: DomainEvent[] = [];
    
    for (const events of this.events.values()) {
      allEvents.push(...events);
    }

    if (fromTimestamp) {
      return allEvents.filter(event => event.timestamp >= fromTimestamp);
    }

    return allEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}

// Repository Base Class
export abstract class Repository<T extends AggregateRoot> {
  constructor(protected eventStore: EventStore) {}

  async save(aggregate: T): Promise<void> {
    const events = aggregate.getUncommittedEvents();
    if (events.length === 0) return;

    await this.eventStore.saveEvents(
      aggregate.getId(),
      events,
      aggregate.getVersion() - events.length
    );

    aggregate.markEventsAsCommitted();
  }

  async getById(id: string): Promise<T | null> {
    const events = await this.eventStore.getEvents(id);
    if (events.length === 0) return null;

    const aggregate = this.createEmptyAggregate(id);
    aggregate.replayEvents(events);
    return aggregate;
  }

  protected abstract createEmptyAggregate(id: string): T;
}

// Global instances
export const commandBus = new CommandBus();
export const queryBus = new QueryBus();
export const eventStore = new InMemoryEventStore();

// Utility functions for creating commands and queries
export function createCommand(type: string, aggregateId: string, payload: any, userId: string): Command {
  return {
    id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    aggregateId,
    payload,
    timestamp: new Date(),
    userId,
    correlationId: `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
}

export function createQuery(type: string, parameters: any, userId?: string): Query {
  return {
    id: `qry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    parameters,
    timestamp: new Date(),
    userId
  };
}

export function createDomainEvent(
  type: string,
  aggregateId: string,
  aggregateType: string,
  version: number,
  data: any,
  userId: string
): DomainEvent {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    aggregateId,
    aggregateType,
    version,
    data,
    timestamp: new Date(),
    userId,
    correlationId: `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
} 