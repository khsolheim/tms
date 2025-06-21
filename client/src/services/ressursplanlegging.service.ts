import api from '../lib/api';

// Interfaces
export interface Ressurs {
  id: string;
  navn: string;
  type: 'KJØRETØY' | 'INSTRUKTØR' | 'ROM' | 'UTSTYR';
  status: 'TILGJENGELIG' | 'OPPTATT' | 'VEDLIKEHOLD' | 'UTILGJENGELIG';
  beskrivelse?: string;
  kapasitet?: number;
  kostnadPerTime?: number;
  vedlikeholdsDato?: string;
  sertifiseringer?: string[];
  tilgjengelighet: {
    mandag: { start: string; slutt: string; tilgjengelig: boolean };
    tirsdag: { start: string; slutt: string; tilgjengelig: boolean };
    onsdag: { start: string; slutt: string; tilgjengelig: boolean };
    torsdag: { start: string; slutt: string; tilgjengelig: boolean };
    fredag: { start: string; slutt: string; tilgjengelig: boolean };
    lørdag: { start: string; slutt: string; tilgjengelig: boolean };
    søndag: { start: string; slutt: string; tilgjengelig: boolean };
  };
  bookinger: Array<{
    id: string;
    startTid: string;
    sluttTid: string;
    formål: string;
    booketAv: string;
  }>;
}

export interface RessursBooking {
  id: string;
  ressursId: string;
  startTid: string;
  sluttTid: string;
  formål: string;
  beskrivelse?: string;
  booketAv: string;
  status: 'BEKREFTET' | 'VENTER' | 'AVLYST';
  deltakere?: string[];
  kostnad?: number;
  notater?: string;
}

export interface RessursStatistikk {
  totalRessurser: number;
  tilgjengeligeRessurser: number;
  utnyttelsesgrad: number;
  gjennomsnittligBookingTid: number;
  populæreRessurser: Array<{
    ressursId: string;
    navn: string;
    antallBookinger: number;
    utnyttelse: number;
  }>;
  inntektPerRessurs: Array<{
    ressursId: string;
    navn: string;
    totalInntekt: number;
    gjennomsnittPerTime: number;
  }>;
  bookingTrender: Array<{
    måned: string;
    antallBookinger: number;
    totalTimer: number;
    inntekt: number;
  }>;
}

export interface RessursFilter {
  type?: string[];
  status?: string[];
  tilgjengeligFra?: string;
  tilgjengeligTil?: string;
  kapasitetMin?: number;
  kapasitetMax?: number;
  kostnadMin?: number;
  kostnadMax?: number;
}

export interface LedigTid {
  startTid: string;
  sluttTid: string;
  varighet: number; // minutter
}

export interface ResourceMetric {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: string;
  subtitle: string;
}

export interface ResourceModule {
  title: string;
  description: string;
  icon: string;
  solidIcon: string;
  href: string;
  color: string;
  stats?: {
    total: string;
    change: string;
    changeType: 'increase' | 'decrease' | 'neutral';
  };
}

export interface QuickAction {
  name: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

export interface RessursplanleggingDashboardData {
  resourceMetrics: ResourceMetric[];
  resourceModules: ResourceModule[];
  quickActions: QuickAction[];
}

class RessursplanleggingService {
  // Hent dashboard data
  async hentDashboardData(): Promise<RessursplanleggingDashboardData> {
    try {
      const response = await api.get('/ressursplanlegging/dashboard');
      return response.data;
    } catch (error) {
      // Returner standarddata hvis API ikke er tilgjengelig
      return this.getStandardDashboardData();
    }
  }

  // Ressurser
  async hentRessurser(filter?: RessursFilter): Promise<Ressurs[]> {
    const params = filter ? new URLSearchParams(filter as any).toString() : '';
    const response = await api.get(`/ressursplanlegging/ressurser?${params}`);
    return response.data;
  }

  async hentRessurs(ressursId: string): Promise<Ressurs> {
    const response = await api.get(`/ressursplanlegging/ressurser/${ressursId}`);
    return response.data;
  }

  async opprettRessurs(ressurs: Omit<Ressurs, 'id' | 'bookinger'>): Promise<Ressurs> {
    const response = await api.post('/ressursplanlegging/ressurser', ressurs);
    return response.data;
  }

  async oppdaterRessurs(ressursId: string, updates: Partial<Ressurs>): Promise<Ressurs> {
    const response = await api.put(`/ressursplanlegging/ressurser/${ressursId}`, updates);
    return response.data;
  }

  async slettRessurs(ressursId: string): Promise<void> {
    await api.delete(`/ressursplanlegging/ressurser/${ressursId}`);
  }

  // Bookinger
  async hentBookinger(ressursId?: string, fra?: string, til?: string): Promise<RessursBooking[]> {
    const params = new URLSearchParams();
    if (ressursId) params.append('ressursId', ressursId);
    if (fra) params.append('fra', fra);
    if (til) params.append('til', til);
    
    const response = await api.get(`/ressursplanlegging/bookinger?${params.toString()}`);
    return response.data;
  }

  async opprettBooking(booking: Omit<RessursBooking, 'id'>): Promise<RessursBooking> {
    const response = await api.post('/ressursplanlegging/bookinger', booking);
    return response.data;
  }

  async oppdaterBooking(bookingId: string, updates: Partial<RessursBooking>): Promise<RessursBooking> {
    const response = await api.put(`/ressursplanlegging/bookinger/${bookingId}`, updates);
    return response.data;
  }

  async slettBooking(bookingId: string): Promise<void> {
    await api.delete(`/ressursplanlegging/bookinger/${bookingId}`);
  }

  // Tilgjengelighet
  async hentLedigeTider(ressursId: string, dato: string, varighet: number): Promise<LedigTid[]> {
    const response = await api.get(`/ressursplanlegging/ressurser/${ressursId}/ledige-tider?dato=${dato}&varighet=${varighet}`);
    return response.data;
  }

  // Statistikk
  async hentStatistikk(periode?: { fra: string; til: string }): Promise<RessursStatistikk> {
    const params = periode ? `?fra=${periode.fra}&til=${periode.til}` : '';
    const response = await api.get(`/ressursplanlegging/statistikk${params}`);
    return response.data;
  }

  private getStandardDashboardData(): RessursplanleggingDashboardData {
    return {
      resourceMetrics: [
        {
          title: 'Kjøretøy Tilgjengelighet',
          value: '89%',
          change: '+5%',
          changeType: 'increase',
          icon: 'TruckIcon',
          color: 'blue',
          subtitle: 'Operative kjøretøy'
        },
        {
          title: 'Personal Kapasitet',
          value: '76%',
          change: '-3%',
          changeType: 'decrease',
          icon: 'UsersIcon',
          color: 'green',
          subtitle: 'Utnytt kapasitet'
        },
        {
          title: 'Utstyr Status',
          value: '94%',
          change: '+8%',
          changeType: 'increase',
          icon: 'WrenchScrewdriverIcon',
          color: 'purple',
          subtitle: 'Funksjonsdyktig'
        },
        {
          title: 'Booking Effektivitet',
          value: '83%',
          change: '+12%',
          changeType: 'increase',
          icon: 'CalendarIcon',
          color: 'indigo',
          subtitle: 'Ressursbruk'
        }
      ],
      resourceModules: [
        {
          title: 'Kjøretøyplanlegging',
          description: 'Administrer kjøretøypark, vedlikehold og bookinger for optimal disponering.',
          icon: 'TruckIcon',
          solidIcon: 'TruckSolidIcon',
          href: '/ressursplanlegging/kjoretoy',
          color: 'blue',
          stats: {
            total: '34 kjøretøy',
            change: '+2',
            changeType: 'increase'
          }
        },
        {
          title: 'Personalplanlegging',
          description: 'Planlægg arbeidsplaner, skiftordninger og kompetanseallokering.',
          icon: 'UsersIcon',
          solidIcon: 'UsersSolidIcon',
          href: '/ressursplanlegging/personal',
          color: 'green',
          stats: {
            total: '127 ansatte',
            change: '+8',
            changeType: 'increase'
          }
        },
        {
          title: 'Utstyrsadministrasjon',
          description: 'Håndter spesialutstyr, vedlikehold og tilgjengelighet.',
          icon: 'WrenchScrewdriverIcon',
          solidIcon: 'WrenchScrewdriverSolidIcon',
          href: '/ressursplanlegging/utstyr',
          color: 'purple',
          stats: {
            total: '156 enheter',
            change: '+12',
            changeType: 'increase'
          }
        },
        {
          title: 'Kapasitetsanalyse',
          description: 'Analyser ressursbruk og identifiser optimeringsmuligheter.',
          icon: 'ChartBarIcon',
          solidIcon: 'ChartBarSolidIcon',
          href: '/ressursplanlegging/kapasitet',
          color: 'red',
          stats: {
            total: '83% effektivitet',
            change: '+7%',
            changeType: 'increase'
          }
        },
        {
          title: 'Bookingsystem',
          description: 'Sentralisert booking av alle ressurser med konfliktløsning.',
          icon: 'CalendarIcon',
          solidIcon: 'CalendarSolidIcon',
          href: '/ressursplanlegging/booking',
          color: 'yellow',
          stats: {
            total: '248 bookinger',
            change: '+34',
            changeType: 'increase'
          }
        },
        {
          title: 'Lokasjonstyring',
          description: 'GPS-sporing og geografisk disponering av mobile ressurser.',
          icon: 'MapPinIcon',
          solidIcon: 'MapPinIcon',
          href: '/ressursplanlegging/lokasjon',
          color: 'indigo',
          stats: {
            total: '23 lokasjoner',
            change: '+1',
            changeType: 'increase'
          }
        }
      ],
      quickActions: [
        {
          name: 'Book ressurs',
          description: 'Ny booking',
          icon: 'PlusIcon',
          href: '/ressursplanlegging/booking/ny',
          color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
        },
        {
          name: 'Kjøretøy status',
          description: 'Se tilgjengelighet',
          icon: 'TruckIcon',
          href: '/ressursplanlegging/kjoretoy/status',
          color: 'bg-green-50 text-green-700 hover:bg-green-100'
        },
        {
          name: 'Skiftplan',
          description: 'Personalplanlegging',
          icon: 'ClockIcon',
          href: '/ressursplanlegging/personal/skift',
          color: 'bg-purple-50 text-purple-700 hover:bg-purple-100'
        },
        {
          name: 'Kapasitetsrapport',
          description: 'Analyser ressursbruk',
          icon: 'ChartBarIcon',
          href: '/ressursplanlegging/kapasitet/rapport',
          color: 'bg-red-50 text-red-700 hover:bg-red-100'
        }
      ]
    };
  }

  // Mock data for utvikling
  async hentMockData(): Promise<{
    ressurser: Ressurs[];
    bookinger: RessursBooking[];
    statistikk: RessursStatistikk;
  }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const ressurser: Ressurs[] = [
      {
        id: 'kj1',
        navn: 'Toyota Corolla - AB12345',
        type: 'KJØRETØY',
        status: 'TILGJENGELIG',
        beskrivelse: 'Manuell girkasse, bensin, 2020 modell',
        kapasitet: 2,
        kostnadPerTime: 450,
        sertifiseringer: ['Klasse B', 'Øvingskjøring'],
        tilgjengelighet: {
          mandag: { start: '08:00', slutt: '18:00', tilgjengelig: true },
          tirsdag: { start: '08:00', slutt: '18:00', tilgjengelig: true },
          onsdag: { start: '08:00', slutt: '18:00', tilgjengelig: true },
          torsdag: { start: '08:00', slutt: '18:00', tilgjengelig: true },
          fredag: { start: '08:00', slutt: '18:00', tilgjengelig: true },
          lørdag: { start: '09:00', slutt: '15:00', tilgjengelig: true },
          søndag: { start: '10:00', slutt: '14:00', tilgjengelig: false }
        },
        bookinger: [
          {
            id: 'b1',
            startTid: '2025-06-16T09:00:00Z',
            sluttTid: '2025-06-16T10:30:00Z',
            formål: 'Kjøretime - Grunnleggende',
            booketAv: 'Lars Hansen'
          },
          {
            id: 'b2',
            startTid: '2025-06-16T14:00:00Z',
            sluttTid: '2025-06-16T15:30:00Z',
            formål: 'Kjøretime - Parkering',
            booketAv: 'Maria Olsen'
          }
        ]
      },
      {
        id: 'kj2',
        navn: 'Volkswagen Golf - CD67890',
        type: 'KJØRETØY',
        status: 'OPPTATT',
        beskrivelse: 'Automat girkasse, diesel, 2021 modell',
        kapasitet: 2,
        kostnadPerTime: 500,
        sertifiseringer: ['Klasse B', 'Automat', 'Prøvekjøring'],
        tilgjengelighet: {
          mandag: { start: '08:00', slutt: '18:00', tilgjengelig: true },
          tirsdag: { start: '08:00', slutt: '18:00', tilgjengelig: true },
          onsdag: { start: '08:00', slutt: '18:00', tilgjengelig: true },
          torsdag: { start: '08:00', slutt: '18:00', tilgjengelig: true },
          fredag: { start: '08:00', slutt: '18:00', tilgjengelig: true },
          lørdag: { start: '09:00', slutt: '15:00', tilgjengelig: true },
          søndag: { start: '10:00', slutt: '14:00', tilgjengelig: false }
        },
        bookinger: [
          {
            id: 'b3',
            startTid: '2025-06-17T10:00:00Z',
            sluttTid: '2025-06-17T11:00:00Z',
            formål: 'Praktisk prøve',
            booketAv: 'Anna Kristiansen'
          }
        ]
      },
      {
        id: 'inst1',
        navn: 'Kari Instruktør',
        type: 'INSTRUKTØR',
        status: 'TILGJENGELIG',
        beskrivelse: 'Erfaren kjøreinstruktør med 15 års erfaring',
        kostnadPerTime: 650,
        sertifiseringer: ['Klasse B', 'Klasse C', 'Førstehjelp', 'Trafikklærer'],
        tilgjengelighet: {
          mandag: { start: '08:00', slutt: '16:00', tilgjengelig: true },
          tirsdag: { start: '08:00', slutt: '16:00', tilgjengelig: true },
          onsdag: { start: '08:00', slutt: '16:00', tilgjengelig: true },
          torsdag: { start: '08:00', slutt: '16:00', tilgjengelig: true },
          fredag: { start: '08:00', slutt: '16:00', tilgjengelig: true },
          lørdag: { start: '09:00', slutt: '13:00', tilgjengelig: true },
          søndag: { start: '10:00', slutt: '14:00', tilgjengelig: false }
        },
        bookinger: [
          {
            id: 'b4',
            startTid: '2025-06-16T09:00:00Z',
            sluttTid: '2025-06-16T10:30:00Z',
            formål: 'Kjøretime med Lars',
            booketAv: 'Lars Hansen'
          }
        ]
      },
      {
        id: 'rom1',
        navn: 'Teorirom A',
        type: 'ROM',
        status: 'TILGJENGELIG',
        beskrivelse: 'Hovedteorirom med projektor og whiteboard',
        kapasitet: 20,
        kostnadPerTime: 200,
        tilgjengelighet: {
          mandag: { start: '08:00', slutt: '20:00', tilgjengelig: true },
          tirsdag: { start: '08:00', slutt: '20:00', tilgjengelig: true },
          onsdag: { start: '08:00', slutt: '20:00', tilgjengelig: true },
          torsdag: { start: '08:00', slutt: '20:00', tilgjengelig: true },
          fredag: { start: '08:00', slutt: '20:00', tilgjengelig: true },
          lørdag: { start: '09:00', slutt: '17:00', tilgjengelig: true },
          søndag: { start: '10:00', slutt: '16:00', tilgjengelig: false }
        },
        bookinger: [
          {
            id: 'b5',
            startTid: '2025-06-16T14:00:00Z',
            sluttTid: '2025-06-16T15:30:00Z',
            formål: 'Teoritime - Trafikkregler',
            booketAv: 'Ole Lærer'
          }
        ]
      },
      {
        id: 'sim1',
        navn: 'Kjøresimulator Pro',
        type: 'UTSTYR',
        status: 'VEDLIKEHOLD',
        beskrivelse: 'Avansert kjøresimulator for risikotrening',
        kapasitet: 1,
        kostnadPerTime: 300,
        vedlikeholdsDato: '2025-06-20',
        tilgjengelighet: {
          mandag: { start: '09:00', slutt: '17:00', tilgjengelig: false },
          tirsdag: { start: '09:00', slutt: '17:00', tilgjengelig: false },
          onsdag: { start: '09:00', slutt: '17:00', tilgjengelig: false },
          torsdag: { start: '09:00', slutt: '17:00', tilgjengelig: false },
          fredag: { start: '09:00', slutt: '17:00', tilgjengelig: false },
          lørdag: { start: '10:00', slutt: '14:00', tilgjengelig: false },
          søndag: { start: '10:00', slutt: '14:00', tilgjengelig: false }
        },
        bookinger: []
      }
    ];

    const bookinger: RessursBooking[] = [
      {
        id: 'b1',
        ressursId: 'kj1',
        startTid: '2025-06-16T09:00:00Z',
        sluttTid: '2025-06-16T10:30:00Z',
        formål: 'Kjøretime - Grunnleggende manøvrering',
        beskrivelse: 'Første kjøretime med fokus på grunnleggende kjøreteknikk',
        booketAv: 'Lars Hansen',
        status: 'BEKREFTET',
        deltakere: ['Lars Hansen', 'Kari Instruktør'],
        kostnad: 675,
        notater: 'Elev er nybegynner, trenger ekstra oppmerksomhet'
      },
      {
        id: 'b2',
        ressursId: 'kj1',
        startTid: '2025-06-16T14:00:00Z',
        sluttTid: '2025-06-16T15:30:00Z',
        formål: 'Kjøretime - Parkering',
        beskrivelse: 'Øving på parallellparkering og innkjøring',
        booketAv: 'Maria Olsen',
        status: 'BEKREFTET',
        deltakere: ['Maria Olsen', 'Ole Instruktør'],
        kostnad: 675
      },
      {
        id: 'b3',
        ressursId: 'kj2',
        startTid: '2025-06-17T10:00:00Z',
        sluttTid: '2025-06-17T11:00:00Z',
        formål: 'Praktisk prøve',
        beskrivelse: 'Praktisk kjøreprøve for førerkortkandidater',
        booketAv: 'Anna Kristiansen',
        status: 'BEKREFTET',
        deltakere: ['Anna Kristiansen', 'Bjørn Sensor'],
        kostnad: 500
      }
    ];

    const statistikk: RessursStatistikk = {
      totalRessurser: 5,
      tilgjengeligeRessurser: 3,
      utnyttelsesgrad: 72.5,
      gjennomsnittligBookingTid: 90, // minutter
      populæreRessurser: [
        {
          ressursId: 'kj1',
          navn: 'Toyota Corolla - AB12345',
          antallBookinger: 45,
          utnyttelse: 85.2
        },
        {
          ressursId: 'inst1',
          navn: 'Kari Instruktør',
          antallBookinger: 38,
          utnyttelse: 78.9
        },
        {
          ressursId: 'rom1',
          navn: 'Teorirom A',
          antallBookinger: 32,
          utnyttelse: 65.4
        }
      ],
      inntektPerRessurs: [
        {
          ressursId: 'kj1',
          navn: 'Toyota Corolla - AB12345',
          totalInntekt: 20250,
          gjennomsnittPerTime: 450
        },
        {
          ressursId: 'inst1',
          navn: 'Kari Instruktør',
          totalInntekt: 24700,
          gjennomsnittPerTime: 650
        },
        {
          ressursId: 'rom1',
          navn: 'Teorirom A',
          totalInntekt: 6400,
          gjennomsnittPerTime: 200
        }
      ],
      bookingTrender: [
        { måned: 'Jan', antallBookinger: 89, totalTimer: 134, inntekt: 45600 },
        { måned: 'Feb', antallBookinger: 95, totalTimer: 143, inntekt: 48900 },
        { måned: 'Mar', antallBookinger: 102, totalTimer: 153, inntekt: 52300 },
        { måned: 'Apr', antallBookinger: 87, totalTimer: 131, inntekt: 44700 },
        { måned: 'Mai', antallBookinger: 98, totalTimer: 147, inntekt: 50200 },
        { måned: 'Jun', antallBookinger: 105, totalTimer: 158, inntekt: 53800 }
      ]
    };

    return { ressurser, bookinger, statistikk };
  }

  async opprettMockBooking(booking: Omit<RessursBooking, 'id'>): Promise<RessursBooking> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      ...booking,
      id: `mock_${Date.now()}`
    };
  }

  async slettMockBooking(bookingId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Mock deletion
  }
}

export const ressursplanleggingService = new RessursplanleggingService();
export default ressursplanleggingService; 