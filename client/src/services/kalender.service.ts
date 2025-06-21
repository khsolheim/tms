import api from '../lib/api';

// Interfaces
export interface KalenderEvent {
  id: string;
  tittel: string;
  beskrivelse?: string;
  startTid: string;
  sluttTid: string;
  type: 'KJØRETIME' | 'TEORITIME' | 'PRØVE' | 'MØTE' | 'VEDLIKEHOLD' | 'ANNET';
  status: 'PLANLAGT' | 'BEKREFTET' | 'AVLYST' | 'FULLFØRT';
  deltakere: Array<{
    id: string;
    navn: string;
    rolle: 'ELEV' | 'INSTRUKTØR' | 'ADMIN';
    status: 'INVITERT' | 'BEKREFTET' | 'AVSLÅTT';
  }>;
  ressurser?: Array<{
    id: string;
    navn: string;
    type: 'KJØRETØY' | 'ROM' | 'UTSTYR';
  }>;
  lokasjon?: string;
  notater?: string;
  opprettetAv: string;
  opprettet: string;
  sistEndret: string;
  gjentakelse?: {
    type: 'DAGLIG' | 'UKENTLIG' | 'MÅNEDLIG';
    intervall: number;
    sluttDato?: string;
  };
}

export interface KalenderFilter {
  startDato: string;
  sluttDato: string;
  typer?: string[];
  statuser?: string[];
  deltakere?: string[];
  ressurser?: string[];
}

export interface KalenderStatistikk {
  totalEvents: number;
  planlagteEvents: number;
  fullførteEvents: number;
  avlysteEvents: number;
  utnyttelsesgrad: number;
  gjennomsnittligVarighet: number;
  populæreTider: Array<{
    time: string;
    count: number;
  }>;
  ressursUtnyttelse: Array<{
    ressurs: string;
    utnyttelse: number;
  }>;
}

export interface TimeSlot {
  startTid: string;
  sluttTid: string;
  ledig: boolean;
  eventId?: string;
  eventTittel?: string;
}

export interface Ressurs {
  id: string;
  navn: string;
  type: 'KJØRETØY' | 'ROM' | 'UTSTYR';
  beskrivelse?: string;
  kapasitet?: number;
  tilgjengelig: boolean;
  vedlikeholdsDato?: string;
  kostnadPerTime?: number;
  bookinger: Array<{
    eventId: string;
    startTid: string;
    sluttTid: string;
  }>;
}

class KalenderService {
  // Events
  async hentEvents(filter?: KalenderFilter): Promise<KalenderEvent[]> {
    const params = filter ? new URLSearchParams(filter as any).toString() : '';
    const response = await api.get(`/kalender/events?${params}`);
    return response.data;
  }

  async hentEvent(eventId: string): Promise<KalenderEvent> {
    const response = await api.get(`/kalender/events/${eventId}`);
    return response.data;
  }

  async opprettEvent(event: Omit<KalenderEvent, 'id' | 'opprettet' | 'sistEndret'>): Promise<KalenderEvent> {
    const response = await api.post('/kalender/events', event);
    return response.data;
  }

  async oppdaterEvent(eventId: string, updates: Partial<KalenderEvent>): Promise<KalenderEvent> {
    const response = await api.put(`/kalender/events/${eventId}`, updates);
    return response.data;
  }

  async slettEvent(eventId: string): Promise<void> {
    await api.delete(`/kalender/events/${eventId}`);
  }

  // Ressurser
  async hentRessurser(): Promise<Ressurs[]> {
    const response = await api.get('/kalender/ressurser');
    return response.data;
  }

  async hentLedigeTider(ressursId: string, dato: string): Promise<TimeSlot[]> {
    const response = await api.get(`/kalender/ressurser/${ressursId}/ledige-tider?dato=${dato}`);
    return response.data;
  }

  // Statistikk
  async hentStatistikk(periode?: { fra: string; til: string }): Promise<KalenderStatistikk> {
    const params = periode ? `?fra=${periode.fra}&til=${periode.til}` : '';
    const response = await api.get(`/kalender/statistikk${params}`);
    return response.data;
  }

  // Mock data for utvikling
  async hentMockData(): Promise<{
    events: KalenderEvent[];
    ressurser: Ressurs[];
    statistikk: KalenderStatistikk;
  }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const events: KalenderEvent[] = [
      {
        id: '1',
        tittel: 'Kjøretime - Grunnleggende manøvrering',
        beskrivelse: 'Første kjøretime med fokus på grunnleggende kjøreteknikk',
        startTid: '2025-06-16T09:00:00Z',
        sluttTid: '2025-06-16T10:30:00Z',
        type: 'KJØRETIME',
        status: 'BEKREFTET',
        deltakere: [
          {
            id: 'elev1',
            navn: 'Lars Hansen',
            rolle: 'ELEV',
            status: 'BEKREFTET'
          },
          {
            id: 'inst1',
            navn: 'Kari Instruktør',
            rolle: 'INSTRUKTØR',
            status: 'BEKREFTET'
          }
        ],
        ressurser: [
          {
            id: 'bil1',
            navn: 'Toyota Corolla - AB12345',
            type: 'KJØRETØY'
          }
        ],
        lokasjon: 'Kjøreskole Oslo Sentrum',
        opprettetAv: 'admin1',
        opprettet: '2025-06-10T10:00:00Z',
        sistEndret: '2025-06-12T14:30:00Z'
      },
      {
        id: '2',
        tittel: 'Teoritime - Trafikkregler',
        beskrivelse: 'Gjennomgang av viktige trafikkregler og skiltlære',
        startTid: '2025-06-16T14:00:00Z',
        sluttTid: '2025-06-16T15:30:00Z',
        type: 'TEORITIME',
        status: 'PLANLAGT',
        deltakere: [
          {
            id: 'elev2',
            navn: 'Maria Olsen',
            rolle: 'ELEV',
            status: 'INVITERT'
          },
          {
            id: 'elev3',
            navn: 'Per Andersen',
            rolle: 'ELEV',
            status: 'BEKREFTET'
          },
          {
            id: 'inst2',
            navn: 'Ole Lærer',
            rolle: 'INSTRUKTØR',
            status: 'BEKREFTET'
          }
        ],
        ressurser: [
          {
            id: 'rom1',
            navn: 'Teorirom A',
            type: 'ROM'
          }
        ],
        lokasjon: 'Kjøreskole Oslo Sentrum - Rom A',
        opprettetAv: 'admin1',
        opprettet: '2025-06-08T12:00:00Z',
        sistEndret: '2025-06-08T12:00:00Z'
      },
      {
        id: '3',
        tittel: 'Praktisk prøve',
        beskrivelse: 'Praktisk kjøreprøve for førerkortkandidater',
        startTid: '2025-06-17T10:00:00Z',
        sluttTid: '2025-06-17T11:00:00Z',
        type: 'PRØVE',
        status: 'BEKREFTET',
        deltakere: [
          {
            id: 'elev4',
            navn: 'Anna Kristiansen',
            rolle: 'ELEV',
            status: 'BEKREFTET'
          },
          {
            id: 'sensor1',
            navn: 'Bjørn Sensor',
            rolle: 'INSTRUKTØR',
            status: 'BEKREFTET'
          }
        ],
        ressurser: [
          {
            id: 'bil2',
            navn: 'Volkswagen Golf - CD67890',
            type: 'KJØRETØY'
          }
        ],
        lokasjon: 'Statens vegvesen - Prøvested Oslo',
        opprettetAv: 'admin1',
        opprettet: '2025-06-05T09:00:00Z',
        sistEndret: '2025-06-14T16:00:00Z'
      },
      {
        id: '4',
        tittel: 'Bilvedlikehold - Service',
        beskrivelse: 'Rutinemessig service av kjøretøy',
        startTid: '2025-06-18T08:00:00Z',
        sluttTid: '2025-06-18T12:00:00Z',
        type: 'VEDLIKEHOLD',
        status: 'PLANLAGT',
        deltakere: [
          {
            id: 'mek1',
            navn: 'Stein Mekaniker',
            rolle: 'ADMIN',
            status: 'BEKREFTET'
          }
        ],
        ressurser: [
          {
            id: 'bil1',
            navn: 'Toyota Corolla - AB12345',
            type: 'KJØRETØY'
          }
        ],
        lokasjon: 'Bilverksted AS',
        notater: 'Oljeskift, bremsekontroll og EU-kontroll',
        opprettetAv: 'admin1',
        opprettet: '2025-06-01T10:00:00Z',
        sistEndret: '2025-06-01T10:00:00Z'
      },
      {
        id: '5',
        tittel: 'Personalmøte',
        beskrivelse: 'Månedlig personalmøte for alle instruktører',
        startTid: '2025-06-19T16:00:00Z',
        sluttTid: '2025-06-19T17:30:00Z',
        type: 'MØTE',
        status: 'PLANLAGT',
        deltakere: [
          {
            id: 'inst1',
            navn: 'Kari Instruktør',
            rolle: 'INSTRUKTØR',
            status: 'INVITERT'
          },
          {
            id: 'inst2',
            navn: 'Ole Lærer',
            rolle: 'INSTRUKTØR',
            status: 'INVITERT'
          },
          {
            id: 'admin1',
            navn: 'Admin Bruker',
            rolle: 'ADMIN',
            status: 'BEKREFTET'
          }
        ],
        ressurser: [
          {
            id: 'rom2',
            navn: 'Møterom B',
            type: 'ROM'
          }
        ],
        lokasjon: 'Kjøreskole Oslo Sentrum - Møterom B',
        gjentakelse: {
          type: 'MÅNEDLIG',
          intervall: 1
        },
        opprettetAv: 'admin1',
        opprettet: '2025-05-19T10:00:00Z',
        sistEndret: '2025-05-19T10:00:00Z'
      }
    ];

    const ressurser: Ressurs[] = [
      {
        id: 'bil1',
        navn: 'Toyota Corolla - AB12345',
        type: 'KJØRETØY',
        beskrivelse: 'Manuell girkasse, bensin, 2020 modell',
        kapasitet: 2,
        tilgjengelig: true,
        kostnadPerTime: 450,
        bookinger: [
          {
            eventId: '1',
            startTid: '2025-06-16T09:00:00Z',
            sluttTid: '2025-06-16T10:30:00Z'
          },
          {
            eventId: '4',
            startTid: '2025-06-18T08:00:00Z',
            sluttTid: '2025-06-18T12:00:00Z'
          }
        ]
      },
      {
        id: 'bil2',
        navn: 'Volkswagen Golf - CD67890',
        type: 'KJØRETØY',
        beskrivelse: 'Automat girkasse, diesel, 2021 modell',
        kapasitet: 2,
        tilgjengelig: true,
        kostnadPerTime: 500,
        bookinger: [
          {
            eventId: '3',
            startTid: '2025-06-17T10:00:00Z',
            sluttTid: '2025-06-17T11:00:00Z'
          }
        ]
      },
      {
        id: 'rom1',
        navn: 'Teorirom A',
        type: 'ROM',
        beskrivelse: 'Hovedteorirom med projektor og whiteboard',
        kapasitet: 20,
        tilgjengelig: true,
        kostnadPerTime: 200,
        bookinger: [
          {
            eventId: '2',
            startTid: '2025-06-16T14:00:00Z',
            sluttTid: '2025-06-16T15:30:00Z'
          }
        ]
      },
      {
        id: 'rom2',
        navn: 'Møterom B',
        type: 'ROM',
        beskrivelse: 'Mindre møterom for personalmøter',
        kapasitet: 8,
        tilgjengelig: true,
        kostnadPerTime: 150,
        bookinger: [
          {
            eventId: '5',
            startTid: '2025-06-19T16:00:00Z',
            sluttTid: '2025-06-19T17:30:00Z'
          }
        ]
      }
    ];

    const statistikk: KalenderStatistikk = {
      totalEvents: 156,
      planlagteEvents: 89,
      fullførteEvents: 45,
      avlysteEvents: 22,
      utnyttelsesgrad: 78.5,
      gjennomsnittligVarighet: 90, // minutter
      populæreTider: [
        { time: '09:00', count: 34 },
        { time: '10:00', count: 28 },
        { time: '14:00', count: 25 },
        { time: '15:00', count: 22 },
        { time: '11:00', count: 19 }
      ],
      ressursUtnyttelse: [
        { ressurs: 'Toyota Corolla - AB12345', utnyttelse: 85.2 },
        { ressurs: 'Volkswagen Golf - CD67890', utnyttelse: 72.8 },
        { ressurs: 'Teorirom A', utnyttelse: 65.4 },
        { ressurs: 'Møterom B', utnyttelse: 45.1 }
      ]
    };

    return { events, ressurser, statistikk };
  }

  async opprettMockEvent(event: Omit<KalenderEvent, 'id' | 'opprettet' | 'sistEndret'>): Promise<KalenderEvent> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      ...event,
      id: `mock_${Date.now()}`,
      opprettet: new Date().toISOString(),
      sistEndret: new Date().toISOString()
    };
  }

  async slettMockEvent(eventId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Mock deletion - i praksis ville dette fjerne fra database
  }
}

export const kalenderService = new KalenderService();
export default kalenderService; 