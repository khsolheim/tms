import { EventHandler, TMSEvent, EventType } from '../eventBus';

export class BedriftEventHandler implements EventHandler {
  async handle(event: TMSEvent): Promise<void> {
    switch (event.type) {
      case EventType.BEDRIFT_CREATED:
        await this.handleBedriftCreated(event);
        break;
      case EventType.BEDRIFT_UPDATED:
        await this.handleBedriftUpdated(event);
        break;
      case EventType.BEDRIFT_DELETED:
        await this.handleBedriftDeleted(event);
        break;
      default:
        console.log(`Unhandled bedrift event: ${event.type}`);
    }
  }

  private async handleBedriftCreated(event: TMSEvent): Promise<void> {
    const { bedrift } = event.data;
    console.log(`Bedrift created: ${bedrift.navn}`);
    
    // Send notification to admins
    // Create default configurations
    // Initialize audit trail
    // Update business metrics
  }

  private async handleBedriftUpdated(event: TMSEvent): Promise<void> {
    const { bedrift, changes } = event.data;
    console.log(`Bedrift updated: ${bedrift.navn}`, changes);
    
    // Log changes
    // Notify stakeholders
    // Update search index
    // Invalidate cache
  }

  private async handleBedriftDeleted(event: TMSEvent): Promise<void> {
    const { bedrift } = event.data;
    console.log(`Bedrift deleted: ${bedrift.navn}`);
    
    // Archive related data
    // Notify users
    // Clean up resources
    // Update metrics
  }
} 