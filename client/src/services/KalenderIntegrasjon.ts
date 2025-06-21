/**
 * Kalendersystem Integrasjon Service
 * 
 * Håndterer integrasjon med eksterne kalendersystemer
 * - Google Calendar
 * - Microsoft Outlook
 * - Synkronisering av kurs og timer
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface KalenderEvent {
  id?: string;
  title: string;
  beskrivelse?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  location?: string;
  attendees?: string[]; // email addresses
  kontraktId?: number;
  elevId?: number;
  kategori?: 'KURSTIME' | 'TEORITIME' | 'KJØRETIME' | 'PRØVE' | 'MØTE';
  status?: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED';
  recurring?: boolean;
  recurrenceRule?: string; // RRULE format
  reminders?: {
    minutes: number;
    method: 'EMAIL' | 'POPUP';
  }[];
}

export interface KalenderKonfigurasjon {
  provider: 'GOOGLE_CALENDAR' | 'OUTLOOK';
  accessToken: string;
  refreshToken?: string;
  calendarId?: string;
  autoSync: boolean;
  syncInterval: number; // minutter
  defaultReminders: boolean;
  timeZone: string;
  workingHours: {
    start: string; // "09:00"
    end: string;   // "17:00"
    workDays: number[]; // [1,2,3,4,5] = Monday to Friday
  };
}

export interface SyncStatus {
  lastSync: Date;
  totalEvents: number;
  syncedEvents: number;
  errors: string[];
  nextSync?: Date;
}

// ============================================================================
// GOOGLE CALENDAR INTEGRATION
// ============================================================================

export class GoogleCalendarIntegrasjon {
  private accessToken: string;
  private calendarId: string;
  private apiUrl = 'https://www.googleapis.com/calendar/v3';

  constructor(konfigurasjon: KalenderKonfigurasjon) {
    this.accessToken = konfigurasjon.accessToken;
    this.calendarId = konfigurasjon.calendarId || 'primary';
  }

  /**
   * Opprett event i Google Calendar
   */
  async opprettEvent(event: KalenderEvent): Promise<string> {
    try {
      const googleEvent = this.mapTilGoogleEvent(event);

      const response = await fetch(`${this.apiUrl}/calendars/${this.calendarId}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEvent)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Google Calendar API feil: ${error.error?.message || response.statusText}`);
      }

      const result = await response.json();
      logger.info('Event opprettet i Google Calendar', { 
        eventId: result.id,
        title: event.title 
      });
      return result.id;
    } catch (error) {
      logger.error('Feil ved opprettelse av Google Calendar event', error);
      throw error;
    }
  }

  /**
   * Oppdater event i Google Calendar
   */
  async oppdaterEvent(eventId: string, event: KalenderEvent): Promise<void> {
    try {
      const googleEvent = this.mapTilGoogleEvent(event);

      const response = await fetch(`${this.apiUrl}/calendars/${this.calendarId}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEvent)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Google Calendar API feil: ${error.error?.message || response.statusText}`);
      }

      logger.info('Event oppdatert i Google Calendar', { eventId, title: event.title });
    } catch (error) {
      logger.error('Feil ved oppdatering av Google Calendar event', error);
      throw error;
    }
  }

  /**
   * Slett event fra Google Calendar
   */
  async slettEvent(eventId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/calendars/${this.calendarId}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        }
      });

      if (!response.ok && response.status !== 410) { // 410 = already deleted
        const error = await response.json();
        throw new Error(`Google Calendar API feil: ${error.error?.message || response.statusText}`);
      }

      logger.info('Event slettet fra Google Calendar', { eventId });
    } catch (error) {
      logger.error('Feil ved sletting av Google Calendar event', error);
      throw error;
    }
  }

  /**
   * Hent events fra Google Calendar
   */
  async hentEvents(fradato: string, tildato: string): Promise<KalenderEvent[]> {
    try {
      const params = new URLSearchParams({
        timeMin: fradato,
        timeMax: tildato,
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '2500'
      });

      const response = await fetch(`${this.apiUrl}/calendars/${this.calendarId}/events?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Google Calendar API feil: ${error.error?.message || response.statusText}`);
      }

      const result = await response.json();
      return result.items?.map(this.mapFraGoogleEvent) || [];
    } catch (error) {
      logger.error('Feil ved henting av Google Calendar events', error);
      throw error;
    }
  }

  private mapTilGoogleEvent(event: KalenderEvent): any {
    return {
      summary: event.title,
      description: event.beskrivelse,
      location: event.location,
      start: {
        dateTime: event.startTime,
        timeZone: 'Europe/Oslo'
      },
      end: {
        dateTime: event.endTime,
        timeZone: 'Europe/Oslo'
      },
      attendees: event.attendees?.map(email => ({ email })),
      reminders: event.reminders ? {
        useDefault: false,
        overrides: event.reminders.map(reminder => ({
          method: reminder.method.toLowerCase(),
          minutes: reminder.minutes
        }))
      } : {
        useDefault: true
      },
      status: event.status?.toLowerCase() || 'confirmed',
      extendedProperties: {
        private: {
          kontraktId: event.kontraktId?.toString(),
          elevId: event.elevId?.toString(),
          kategori: event.kategori,
          source: 'TMS'
        }
      }
    };
  }

  private mapFraGoogleEvent = (googleEvent: any): KalenderEvent => {
    return {
      id: googleEvent.id,
      title: googleEvent.summary || 'Uten tittel',
      beskrivelse: googleEvent.description,
      startTime: googleEvent.start?.dateTime || googleEvent.start?.date,
      endTime: googleEvent.end?.dateTime || googleEvent.end?.date,
      location: googleEvent.location,
      attendees: googleEvent.attendees?.map((a: any) => a.email),
      kontraktId: googleEvent.extendedProperties?.private?.kontraktId ? 
        parseInt(googleEvent.extendedProperties.private.kontraktId) : undefined,
      elevId: googleEvent.extendedProperties?.private?.elevId ? 
        parseInt(googleEvent.extendedProperties.private.elevId) : undefined,
      kategori: googleEvent.extendedProperties?.private?.kategori,
      status: googleEvent.status?.toUpperCase() as any,
      reminders: googleEvent.reminders?.overrides?.map((reminder: any) => ({
        minutes: reminder.minutes,
        method: reminder.method.toUpperCase()
      }))
    };
  };
}

// ============================================================================
// OUTLOOK INTEGRATION
// ============================================================================

export class OutlookIntegrasjon {
  private accessToken: string;
  private apiUrl = 'https://graph.microsoft.com/v1.0';

  constructor(konfigurasjon: KalenderKonfigurasjon) {
    this.accessToken = konfigurasjon.accessToken;
  }

  /**
   * Opprett event i Outlook
   */
  async opprettEvent(event: KalenderEvent): Promise<string> {
    try {
      const outlookEvent = this.mapTilOutlookEvent(event);

      const response = await fetch(`${this.apiUrl}/me/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(outlookEvent)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Outlook API feil: ${error.error?.message || response.statusText}`);
      }

      const result = await response.json();
      logger.info('Event opprettet i Outlook', { 
        eventId: result.id,
        title: event.title 
      });
      return result.id;
    } catch (error) {
      logger.error('Feil ved opprettelse av Outlook event', error);
      throw error;
    }
  }

  /**
   * Oppdater event i Outlook
   */
  async oppdaterEvent(eventId: string, event: KalenderEvent): Promise<void> {
    try {
      const outlookEvent = this.mapTilOutlookEvent(event);

      const response = await fetch(`${this.apiUrl}/me/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(outlookEvent)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Outlook API feil: ${error.error?.message || response.statusText}`);
      }

      logger.info('Event oppdatert i Outlook', { eventId, title: event.title });
    } catch (error) {
      logger.error('Feil ved oppdatering av Outlook event', error);
      throw error;
    }
  }

  /**
   * Slett event fra Outlook
   */
  async slettEvent(eventId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/me/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        }
      });

      if (!response.ok && response.status !== 404) { // 404 = already deleted
        const error = await response.json();
        throw new Error(`Outlook API feil: ${error.error?.message || response.statusText}`);
      }

      logger.info('Event slettet fra Outlook', { eventId });
    } catch (error) {
      logger.error('Feil ved sletting av Outlook event', error);
      throw error;
    }
  }

  /**
   * Hent events fra Outlook
   */
  async hentEvents(fradato: string, tildato: string): Promise<KalenderEvent[]> {
    try {
      const params = new URLSearchParams({
        startDateTime: fradato,
        endDateTime: tildato,
        $top: '1000',
        $orderby: 'start/dateTime'
      });

      const response = await fetch(`${this.apiUrl}/me/calendarView?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Prefer': 'outlook.timezone="Europe/Oslo"'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Outlook API feil: ${error.error?.message || response.statusText}`);
      }

      const result = await response.json();
      return result.value?.map(this.mapFraOutlookEvent) || [];
    } catch (error) {
      logger.error('Feil ved henting av Outlook events', error);
      throw error;
    }
  }

  private mapTilOutlookEvent(event: KalenderEvent): any {
    return {
      subject: event.title,
      body: {
        contentType: 'text',
        content: event.beskrivelse || ''
      },
      start: {
        dateTime: event.startTime,
        timeZone: 'Europe/Oslo'
      },
      end: {
        dateTime: event.endTime,
        timeZone: 'Europe/Oslo'
      },
      location: event.location ? {
        displayName: event.location
      } : undefined,
      attendees: event.attendees?.map(email => ({
        emailAddress: {
          address: email,
          name: email
        },
        type: 'required'
      })),
      isReminderOn: (event.reminders?.length || 0) > 0,
      reminderMinutesBeforeStart: event.reminders?.[0]?.minutes || 15,
      showAs: event.status === 'TENTATIVE' ? 'tentative' : 'busy',
      isAllDay: false,
      singleValueExtendedProperties: [
        {
          id: 'String {66f5a359-4659-4830-9070-00047ec6ac6e} Name kontraktId',
          value: event.kontraktId?.toString() || ''
        },
        {
          id: 'String {66f5a359-4659-4830-9070-00047ec6ac6f} Name elevId',
          value: event.elevId?.toString() || ''
        },
        {
          id: 'String {66f5a359-4659-4830-9070-00047ec6ac70} Name kategori',
          value: event.kategori || ''
        },
        {
          id: 'String {66f5a359-4659-4830-9070-00047ec6ac71} Name source',
          value: 'TMS'
        }
      ]
    };
  }

  private mapFraOutlookEvent = (outlookEvent: any): KalenderEvent => {
    const customProperties = outlookEvent.singleValueExtendedProperties || [];
    const getCustomProperty = (name: string) => {
      const prop = customProperties.find((p: any) => p.id.includes(name));
      return prop?.value;
    };

    return {
      id: outlookEvent.id,
      title: outlookEvent.subject || 'Uten tittel',
      beskrivelse: outlookEvent.body?.content,
      startTime: outlookEvent.start?.dateTime,
      endTime: outlookEvent.end?.dateTime,
      location: outlookEvent.location?.displayName,
      attendees: outlookEvent.attendees?.map((a: any) => a.emailAddress?.address),
      kontraktId: getCustomProperty('kontraktId') ? parseInt(getCustomProperty('kontraktId')) : undefined,
      elevId: getCustomProperty('elevId') ? parseInt(getCustomProperty('elevId')) : undefined,
      kategori: getCustomProperty('kategori'),
      status: outlookEvent.showAs === 'tentative' ? 'TENTATIVE' : 'CONFIRMED',
      reminders: outlookEvent.isReminderOn ? [{
        minutes: outlookEvent.reminderMinutesBeforeStart || 15,
        method: 'EMAIL' as const
      }] : []
    };
  };
}

// ============================================================================
// UNIFIED CALENDAR SERVICE
// ============================================================================

export class KalenderService {
  private integrasjon: GoogleCalendarIntegrasjon | OutlookIntegrasjon;
  private konfigurasjon: KalenderKonfigurasjon;

  constructor(konfigurasjon: KalenderKonfigurasjon) {
    this.konfigurasjon = konfigurasjon;
    
    if (konfigurasjon.provider === 'GOOGLE_CALENDAR') {
      this.integrasjon = new GoogleCalendarIntegrasjon(konfigurasjon);
    } else {
      this.integrasjon = new OutlookIntegrasjon(konfigurasjon);
    }
  }

  /**
   * Synkroniser kurs til kalendersystem
   */
  async synkroniserKurs(
    kontraktId: number,
    kursPlan: {
      titel: string;
      startDato: string;
      sluttDato: string;
      timer: {
        dag: string;
        startTid: string;
        sluttTid: string;
        type: 'TEORI' | 'KJØRING';
        instruktør: string;
      }[];
    }
  ): Promise<string[]> {
    try {
      const events: string[] = [];

      for (const time of kursPlan.timer) {
        const startTime = `${time.dag}T${time.startTid}:00.000Z`;
        const endTime = `${time.dag}T${time.sluttTid}:00.000Z`;

        const event: KalenderEvent = {
          title: `${kursPlan.titel} - ${time.type}`,
          beskrivelse: `Kontrakt ${kontraktId}\nInstruktør: ${time.instruktør}`,
          startTime,
          endTime,
          kontraktId,
          kategori: time.type === 'TEORI' ? 'TEORITIME' : 'KJØRETIME',
          reminders: this.konfigurasjon.defaultReminders ? [
            { minutes: 60, method: 'EMAIL' },
            { minutes: 15, method: 'POPUP' }
          ] : []
        };

        const eventId = await this.integrasjon.opprettEvent(event);
        events.push(eventId);
      }

      logger.info('Kurs synkronisert til kalender', {
        kontraktId,
        antallTimer: events.length,
        provider: this.konfigurasjon.provider
      });

      return events;
    } catch (error) {
      logger.error('Feil ved synkronisering av kurs', error);
      throw error;
    }
  }

  /**
   * Test forbindelse til kalendersystem
   */
  async testForbindelse(): Promise<boolean> {
    try {
      const imorgen = new Date();
      imorgen.setDate(imorgen.getDate() + 1);
      
      const fradato = new Date().toISOString();
      const tildato = imorgen.toISOString();

      await this.integrasjon.hentEvents(fradato, tildato);
      return true;
    } catch (error) {
      logger.error('Kalenderforbindelse test feilet', error);
      return false;
    }
  }

  /**
   * Hent sync status
   */
  async hentSyncStatus(): Promise<SyncStatus> {
    // Mock implementasjon - i virkeligheten ville dette komme fra database
    return {
      lastSync: new Date(Date.now() - 3600000), // 1 time siden
      totalEvents: 25,
      syncedEvents: 23,
      errors: ['2 events kunne ikke synkroniseres pga. konflikter'],
      nextSync: this.konfigurasjon.autoSync ? 
        new Date(Date.now() + (this.konfigurasjon.syncInterval * 60000)) : undefined
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function opprettKalenderService(
  konfigurasjon: KalenderKonfigurasjon
): KalenderService {
  return new KalenderService(konfigurasjon);
}

export function validerKalenderKonfigurasjon(
  konfigurasjon: Partial<KalenderKonfigurasjon>
): string[] {
  const feil: string[] = [];

  if (!konfigurasjon.provider) {
    feil.push('Kalenderprovider er påkrevd');
  }

  if (!konfigurasjon.accessToken) {
    feil.push('Access token er påkrevd');
  }

  if (konfigurasjon.syncInterval && konfigurasjon.syncInterval < 5) {
    feil.push('Sync interval må være minst 5 minutter');
  }

  if (konfigurasjon.workingHours) {
    const { start, end, workDays } = konfigurasjon.workingHours;
    
    if (!start || !end) {
      feil.push('Arbeidstimer må ha start og slutt tid');
    }

    if (workDays && workDays.length === 0) {
      feil.push('Minst en arbeidsdag må være valgt');
    }
  }

  return feil;
} 