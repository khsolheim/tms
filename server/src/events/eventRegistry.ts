import { eventBus, EventType } from './eventBus';
import { UserEventHandler } from './handlers/userEventHandler';
import { BedriftEventHandler } from './handlers/bedriftEventHandler';
import { SikkerhetskontrollEventHandler } from './handlers/sikkerhetskontrollEventHandler';
import { SystemEventHandler } from './handlers/systemEventHandler';

export class EventRegistry {
  private static instance: EventRegistry;
  private handlers: Map<string, any> = new Map();

  constructor() {}

  public static getInstance(): EventRegistry {
    if (!EventRegistry.instance) {
      EventRegistry.instance = new EventRegistry();
    }
    return EventRegistry.instance;
  }

  public registerAllHandlers(): void {
    console.log('Event registry: Skipping handler registration for minimal setup');
  }

  public getHandler(name: string): any {
    return this.handlers.get(name);
  }

  public getAllHandlers(): Map<string, any> {
    return new Map(this.handlers);
  }

  public unregisterAllHandlers(): void {
    console.log('🔄 Unregistering all event handlers...');
    
    // Clear all handlers from event bus
    eventBus.removeAllListeners();
    
    // Clear handler references
    this.handlers.clear();
    
    console.log('✅ All event handlers unregistered');
  }
}

// Export singleton instance
export const eventRegistry = new EventRegistry(); 