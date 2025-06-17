import { EventHandler, TMSEvent, EventType } from '../eventBus';

export class SikkerhetskontrollEventHandler implements EventHandler {
  async handle(event: TMSEvent): Promise<void> {
    switch (event.type) {
      case EventType.SIKKERHETSKONTROLL_CREATED:
        await this.handleSikkerhetskontrollCreated(event);
        break;
      case EventType.SIKKERHETSKONTROLL_COMPLETED:
        await this.handleSikkerhetskontrollCompleted(event);
        break;
      case EventType.SIKKERHETSKONTROLL_FAILED:
        await this.handleSikkerhetskontrollFailed(event);
        break;
      default:
        console.log(`Unhandled sikkerhetskontroll event: ${event.type}`);
    }
  }

  private async handleSikkerhetskontrollCreated(event: TMSEvent): Promise<void> {
    const { sikkerhetskontroll } = event.data;
    console.log(`Sikkerhetskontroll created: ${sikkerhetskontroll.tittel}`);
    
    // Schedule notifications
    // Create checklist items
    // Assign inspectors
    // Update compliance metrics
  }

  private async handleSikkerhetskontrollCompleted(event: TMSEvent): Promise<void> {
    const { sikkerhetskontroll, results } = event.data;
    console.log(`Sikkerhetskontroll completed: ${sikkerhetskontroll.tittel}`);
    
    // Generate compliance report
    // Send completion notifications
    // Update safety metrics
    // Schedule follow-up actions
  }

  private async handleSikkerhetskontrollFailed(event: TMSEvent): Promise<void> {
    const { sikkerhetskontroll, failures } = event.data;
    console.log(`Sikkerhetskontroll failed: ${sikkerhetskontroll.tittel}`, failures);
    
    // Send urgent notifications
    // Create corrective action plan
    // Update risk assessment
    // Schedule re-inspection
  }
} 