import { EventHandler, TMSEvent, EventType } from '../eventBus';

export class UserEventHandler implements EventHandler {
  async handle(event: TMSEvent): Promise<void> {
    switch (event.type) {
      case EventType.USER_REGISTERED:
        await this.handleUserRegistered(event);
        break;
      case EventType.USER_LOGIN:
        await this.handleUserLogin(event);
        break;
      case EventType.USER_LOGOUT:
        await this.handleUserLogout(event);
        break;
      case EventType.USER_PROFILE_UPDATED:
        await this.handleUserProfileUpdated(event);
        break;
      default:
        console.log(`Unhandled user event: ${event.type}`);
    }
  }

  private async handleUserRegistered(event: TMSEvent): Promise<void> {
    const { user } = event.data;
    console.log(`User registered: ${user.epost || user.email || 'unknown'}`);
    
    // TODO: Send welcome email
    // TODO: Create user profile
    // TODO: Log audit event
    // TODO: Update metrics
  }

  private async handleUserLogin(event: TMSEvent): Promise<void> {
    const { user } = event.data;
    console.log(`User logged in: ${user.epost || user.email || 'unknown'}`);
    
    // TODO: Update last login
    // TODO: Log audit event
    // TODO: Update metrics
    // TODO: Check suspicious activity
  }

  private async handleUserLogout(event: TMSEvent): Promise<void> {
    const { user } = event.data;
    console.log(`User logged out: ${user.epost || user.email || 'unknown'}`);
    
    // TODO: Log audit event
    // TODO: Update metrics
    // TODO: Clean up session
  }

  private async handleUserProfileUpdated(event: TMSEvent): Promise<void> {
    const { user, changes } = event.data;
    console.log(`User profile updated: ${user.epost || user.email || 'unknown'}`, changes);
    
    // TODO: Log audit event with changes
    // TODO: Update metrics
    // TODO: Send notification if email changed
    // TODO: Invalidate cache
  }
} 