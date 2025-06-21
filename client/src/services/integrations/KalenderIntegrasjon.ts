/**
 * KalenderIntegrasjon Service
 * 
 * Comprehensive kalender integrasjon tjeneste for TMS
 * Støtter Google Calendar og Microsoft Outlook
 */

export interface KalenderEvent {
  id?: string;
  tittel: string;
  beskrivelse?: string;
  startTid: Date;
  sluttTid: Date;
  deltakere?: string[];
  lokasjon?: string;
  metadata?: {
    kontraktId?: number;
    elevId?: number;
    type: 'timeplan' | 'avtale' | 'kurs' | 'eksamen';
  };
}

export interface KalenderKonfigurasjon {
  type: 'GOOGLE_CALENDAR' | 'OUTLOOK';
  accessToken: string;
  refreshToken?: string;
  kalenderId?: string;
  defaultReminders?: number[]; // minutter før event
  autoSync: boolean;
  syncInterval: number; // minutter
}

export interface KalenderSyncResult {
  success: boolean;
  eventsCreated: number;
  eventsUpdated: number;
  eventsDeleted: number;
  errors: string[];
}

/**
 * Google Calendar Integration
 */
class GoogleCalendarIntegrasjon {
  private readonly config: KalenderKonfigurasjon;
  private readonly apiUrl = 'https://www.googleapis.com/calendar/v3';

  constructor(config: KalenderKonfigurasjon) {
    this.config = config;
  }

  async createEvent(event: KalenderEvent): Promise<{ success: boolean; eventId?: string; error?: string }> {
    try {
      const googleEvent = this.transformToGoogleEvent(event);
      
      const response = await fetch(`${this.apiUrl}/calendars/${this.config.kalenderId || 'primary'}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(googleEvent)
      });

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, eventId: result.id };
    } catch (error) {
      console.error('Google Calendar create event error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateEvent(eventId: string, event: KalenderEvent): Promise<{ success: boolean; error?: string }> {
    try {
      const googleEvent = this.transformToGoogleEvent(event);
      
      const response = await fetch(`${this.apiUrl}/calendars/${this.config.kalenderId || 'primary'}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(googleEvent)
      });

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Google Calendar update event error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/calendars/${this.config.kalenderId || 'primary'}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`
        }
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`Google Calendar API error: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Google Calendar delete event error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async listEvents(startDate: Date, endDate: Date): Promise<{ success: boolean; events?: KalenderEvent[]; error?: string }> {
    try {
      const params = new URLSearchParams({
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime'
      });

      const response = await fetch(`${this.apiUrl}/calendars/${this.config.kalenderId || 'primary'}/events?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.status}`);
      }

      const result = await response.json();
      const events = result.items.map((item: any) => this.transformFromGoogleEvent(item));
      
      return { success: true, events };
    } catch (error) {
      console.error('Google Calendar list events error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private transformToGoogleEvent(event: KalenderEvent): any {
    return {
      summary: event.tittel,
      description: event.beskrivelse,
      start: {
        dateTime: event.startTid.toISOString(),
        timeZone: 'Europe/Oslo'
      },
      end: {
        dateTime: event.sluttTid.toISOString(),
        timeZone: 'Europe/Oslo'
      },
      attendees: event.deltakere?.map(email => ({ email })),
      location: event.lokasjon,
      reminders: {
        useDefault: false,
        overrides: this.config.defaultReminders?.map(minutes => ({
          method: 'email',
          minutes
        })) || [{ method: 'email', minutes: 15 }]
      },
      extendedProperties: {
        private: event.metadata ? {
          tmsData: JSON.stringify(event.metadata)
        } : undefined
      }
    };
  }

  private transformFromGoogleEvent(googleEvent: any): KalenderEvent {
    const metadata = googleEvent.extendedProperties?.private?.tmsData 
      ? JSON.parse(googleEvent.extendedProperties.private.tmsData)
      : undefined;

    return {
      id: googleEvent.id,
      tittel: googleEvent.summary || 'Uten tittel',
      beskrivelse: googleEvent.description,
      startTid: new Date(googleEvent.start.dateTime || googleEvent.start.date),
      sluttTid: new Date(googleEvent.end.dateTime || googleEvent.end.date),
      deltakere: googleEvent.attendees?.map((a: any) => a.email),
      lokasjon: googleEvent.location,
      metadata
    };
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/calendars/primary`, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

/**
 * Microsoft Outlook Integration
 */
class OutlookKalenderIntegrasjon {
  private readonly config: KalenderKonfigurasjon;
  private readonly apiUrl = 'https://graph.microsoft.com/v1.0/me';

  constructor(config: KalenderKonfigurasjon) {
    this.config = config;
  }

  async createEvent(event: KalenderEvent): Promise<{ success: boolean; eventId?: string; error?: string }> {
    try {
      const outlookEvent = this.transformToOutlookEvent(event);
      
      const response = await fetch(`${this.apiUrl}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(outlookEvent)
      });

      if (!response.ok) {
        throw new Error(`Outlook API error: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, eventId: result.id };
    } catch (error) {
      console.error('Outlook create event error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateEvent(eventId: string, event: KalenderEvent): Promise<{ success: boolean; error?: string }> {
    try {
      const outlookEvent = this.transformToOutlookEvent(event);
      
      const response = await fetch(`${this.apiUrl}/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(outlookEvent)
      });

      if (!response.ok) {
        throw new Error(`Outlook API error: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Outlook update event error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`
        }
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`Outlook API error: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Outlook delete event error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async listEvents(startDate: Date, endDate: Date): Promise<{ success: boolean; events?: KalenderEvent[]; error?: string }> {
    try {
      const params = new URLSearchParams({
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
        $orderby: 'start/dateTime'
      });

      const response = await fetch(`${this.apiUrl}/calendarView?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Outlook API error: ${response.status}`);
      }

      const result = await response.json();
      const events = result.value.map((item: any) => this.transformFromOutlookEvent(item));
      
      return { success: true, events };
    } catch (error) {
      console.error('Outlook list events error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private transformToOutlookEvent(event: KalenderEvent): any {
    return {
      subject: event.tittel,
      body: {
        contentType: 'Text',
        content: event.beskrivelse || ''
      },
      start: {
        dateTime: event.startTid.toISOString(),
        timeZone: 'Europe/Oslo'
      },
      end: {
        dateTime: event.sluttTid.toISOString(),
        timeZone: 'Europe/Oslo'
      },
      attendees: event.deltakere?.map(email => ({
        emailAddress: { address: email, name: email }
      })),
      location: event.lokasjon ? {
        displayName: event.lokasjon
      } : undefined,
      reminderMinutesBeforeStart: this.config.defaultReminders?.[0] || 15,
      singleValueExtendedProperties: event.metadata ? [{
        id: 'String {66f5a359-4659-4830-9070-00047ec6ac6e} Name tmsData',
        value: JSON.stringify(event.metadata)
      }] : undefined
    };
  }

  private transformFromOutlookEvent(outlookEvent: any): KalenderEvent {
    const tmsDataProperty = outlookEvent.singleValueExtendedProperties?.find(
      (prop: any) => prop.id.includes('tmsData')
    );
    
    const metadata = tmsDataProperty?.value 
      ? JSON.parse(tmsDataProperty.value)
      : undefined;

    return {
      id: outlookEvent.id,
      tittel: outlookEvent.subject || 'Uten tittel',
      beskrivelse: outlookEvent.body?.content,
      startTid: new Date(outlookEvent.start.dateTime),
      sluttTid: new Date(outlookEvent.end.dateTime),
      deltakere: outlookEvent.attendees?.map((a: any) => a.emailAddress.address),
      lokasjon: outlookEvent.location?.displayName,
      metadata
    };
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/calendar`, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

/**
 * Unified Kalender Service
 */
export class KalenderService {
  private provider: GoogleCalendarIntegrasjon | OutlookKalenderIntegrasjon;

  constructor(config: KalenderKonfigurasjon) {
    if (config.type === 'GOOGLE_CALENDAR') {
      this.provider = new GoogleCalendarIntegrasjon(config);
    } else {
      this.provider = new OutlookKalenderIntegrasjon(config);
    }
  }

  async createEvent(event: KalenderEvent): Promise<{ success: boolean; eventId?: string; error?: string }> {
    return this.provider.createEvent(event);
  }

  async updateEvent(eventId: string, event: KalenderEvent): Promise<{ success: boolean; error?: string }> {
    return this.provider.updateEvent(eventId, event);
  }

  async deleteEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    return this.provider.deleteEvent(eventId);
  }

  async listEvents(startDate: Date, endDate: Date): Promise<{ success: boolean; events?: KalenderEvent[]; error?: string }> {
    return this.provider.listEvents(startDate, endDate);
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    return this.provider.testConnection();
  }

  async syncEvents(localEvents: KalenderEvent[]): Promise<KalenderSyncResult> {
    const result: KalenderSyncResult = {
      success: true,
      eventsCreated: 0,
      eventsUpdated: 0,
      eventsDeleted: 0,
      errors: []
    };

    // Get current events from calendar
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1); // Last month
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3); // Next 3 months

    const remoteResult = await this.listEvents(startDate, endDate);
    if (!remoteResult.success) {
      result.success = false;
      result.errors.push(remoteResult.error || 'Failed to fetch remote events');
      return result;
    }

    const remoteEvents = remoteResult.events || [];

    // Sync local events to calendar
    for (const localEvent of localEvents) {
      try {
        const existingEvent = remoteEvents.find(e => 
          e.metadata?.kontraktId === localEvent.metadata?.kontraktId &&
          e.metadata?.type === localEvent.metadata?.type
        );

        if (existingEvent) {
          // Update existing event
          const updateResult = await this.updateEvent(existingEvent.id!, localEvent);
          if (updateResult.success) {
            result.eventsUpdated++;
          } else {
            result.errors.push(`Failed to update event: ${updateResult.error}`);
          }
        } else {
          // Create new event
          const createResult = await this.createEvent(localEvent);
          if (createResult.success) {
            result.eventsCreated++;
          } else {
            result.errors.push(`Failed to create event: ${createResult.error}`);
          }
        }
      } catch (error) {
        result.errors.push(`Sync error for event ${localEvent.tittel}: ${error}`);
      }
    }

    // Clean up orphaned events (events in calendar but not in local data)
    const localEventIds = new Set(localEvents.map(e => `${e.metadata?.kontraktId}-${e.metadata?.type}`));
    
    for (const remoteEvent of remoteEvents) {
      if (remoteEvent.metadata?.kontraktId) {
        const eventKey = `${remoteEvent.metadata.kontraktId}-${remoteEvent.metadata.type}`;
        if (!localEventIds.has(eventKey)) {
          try {
            const deleteResult = await this.deleteEvent(remoteEvent.id!);
            if (deleteResult.success) {
              result.eventsDeleted++;
            } else {
              result.errors.push(`Failed to delete orphaned event: ${deleteResult.error}`);
            }
          } catch (error) {
            result.errors.push(`Error deleting orphaned event: ${error}`);
          }
        }
      }
    }

    result.success = result.errors.length === 0;
    return result;
  }

  // Utility method for creating contract-related events
  async createKontraktEvent(kontrakt: any, type: 'start' | 'slutt' | 'termin', terminNummer?: number): Promise<{ success: boolean; eventId?: string; error?: string }> {
    let tittel: string;
    let startTid: Date;
    let sluttTid: Date;
    let beskrivelse: string;

    switch (type) {
      case 'start':
        tittel = `Kontrakt start - ${kontrakt.elevFornavn} ${kontrakt.elevEtternavn}`;
        startTid = new Date(kontrakt.startDato);
        sluttTid = new Date(startTid.getTime() + 2 * 60 * 60 * 1000); // 2 timer
        beskrivelse = `Kontrakt ${kontrakt.id} starter. Lånebeløp: ${kontrakt.lan} kr`;
        break;
      case 'slutt':
        tittel = `Kontrakt slutt - ${kontrakt.elevFornavn} ${kontrakt.elevEtternavn}`;
        startTid = new Date(kontrakt.sluttDato);
        sluttTid = new Date(startTid.getTime() + 1 * 60 * 60 * 1000); // 1 time
        beskrivelse = `Kontrakt ${kontrakt.id} avsluttes`;
        break;
      case 'termin':
        tittel = `Terminbetaling ${terminNummer} - ${kontrakt.elevFornavn} ${kontrakt.elevEtternavn}`;
        // Beregn termin dato (ca 30 dager * terminNummer fra start)
        startTid = new Date(kontrakt.startDato);
        startTid.setDate(startTid.getDate() + (terminNummer || 1) * 30);
        sluttTid = new Date(startTid.getTime() + 30 * 60 * 1000); // 30 minutter
        beskrivelse = `Termin ${terminNummer} forfaller. Beløp: ${kontrakt.terminbelop} kr`;
        break;
    }

    const event: KalenderEvent = {
      tittel,
      beskrivelse,
      startTid,
      sluttTid,
      deltakere: [kontrakt.elevEpost],
      metadata: {
        kontraktId: kontrakt.id,
        elevId: kontrakt.elevId,
        type: type === 'termin' ? 'timeplan' : 'avtale'
      }
    };

    return this.createEvent(event);
  }
}

// Export individual classes
export { GoogleCalendarIntegrasjon, OutlookKalenderIntegrasjon }; 