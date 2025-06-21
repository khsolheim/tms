import api from '../lib/api';

// Interfaces
export interface Prøve {
  id: string;
  navn: string;
  type: 'TEORIPRØVE' | 'PRAKTISK_PRØVE' | 'OPPKJØRING' | 'KONTROLLKJØRING';
  status: 'PLANLAGT' | 'GJENNOMFØRT' | 'BESTÅTT' | 'IKKE_BESTÅTT' | 'AVLYST';
  dato: string;
  tidspunkt: string;
  varighet: number; // minutter
  sted: string;
  instruktør?: {
    id: string;
    navn: string;
  };
  sensor?: {
    id: string;
    navn: string;
  };
  kjøretøy?: {
    id: string;
    registreringsnummer: string;
    merke: string;
    modell: string;
  };
  resultat?: {
    poeng: number;
    maksPoeng: number;
    prosent: number;
    karakter?: string;
    kommentar: string;
    feilområder: string[];
    sterkeområder: string[];
  };
  forberedelse?: {
    studietimer: number;
    øvingskjøringer: number;
    simulatortimer: number;
    teoriprøver: number;
  };
  kostnad: number;
  betalt: boolean;
  påmeldingsfrist: string;
  avlysningsfrist: string;
  beskrivelse?: string;
  krav?: string[];
  opprettet: string;
  oppdatert: string;
}

export interface PrøveStatistikk {
  totalePrøver: number;
  beståttePrøver: number;
  ikkeBeståttePrøver: number;
  planlagtePrøver: number;
  avlystePrøver: number;
  gjennomsnittPoeng: number;
  beståttprosent: number;
  teoriprøver: number;
  praktiskeprøver: number;
  oppkjøringer: number;
  totalKostnad: number;
  betaltKostnad: number;
  nestePrøve?: Prøve;
  fremgang: {
    måned: number;
    total: number;
  };
}

export interface PrøveFilters {
  type?: string;
  status?: string;
  instruktør?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

class PrøverService {
  // Hent prøver for en elev
  async hentElevPrøver(elevId: string, filters?: PrøveFilters): Promise<Prøve[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.instruktør) params.append('instruktør', filters.instruktør);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get(`/elever/${elevId}/prover?${params.toString()}`);
    return response.data;
  }

  // Hent prøve-statistikk for en elev
  async hentPrøveStatistikk(elevId: string): Promise<PrøveStatistikk> {
    const response = await api.get(`/elever/${elevId}/prover/statistikk`);
    return response.data;
  }

  // Meld på prøve
  async meldPåPrøve(elevId: string, prøveData: Partial<Prøve>): Promise<Prøve> {
    const response = await api.post(`/elever/${elevId}/prover`, prøveData);
    return response.data;
  }

  // Oppdater prøve
  async oppdaterPrøve(prøveId: string, prøveData: Partial<Prøve>): Promise<Prøve> {
    const response = await api.put(`/prover/${prøveId}`, prøveData);
    return response.data;
  }

  // Avlys prøve
  async avlysPrøve(prøveId: string, årsak: string): Promise<void> {
    await api.put(`/prover/${prøveId}/avlys`, { årsak });
  }

  // Registrer prøveresultat
  async registrerResultat(prøveId: string, resultat: Prøve['resultat']): Promise<void> {
    await api.put(`/prover/${prøveId}/resultat`, { resultat });
  }

  // Mock data for utvikling
  async hentMockData(): Promise<{
    prøver: Prøve[];
    statistikk: PrøveStatistikk;
  }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const prøver: Prøve[] = [
      {
        id: '1',
        navn: 'Teoriprøve - Førerkort klasse B',
        type: 'TEORIPRØVE',
        status: 'BESTÅTT',
        dato: '2025-06-10',
        tidspunkt: '10:00',
        varighet: 45,
        sted: 'Statens vegvesen - Tromsø',
        resultat: {
          poeng: 38,
          maksPoeng: 45,
          prosent: 84.4,
          karakter: 'Bestått',
          kommentar: 'Godt resultat! Spesielt sterke områder innen trafikkregler.',
          feilområder: ['Miljøvennlig kjøring', 'Tekniske krav'],
          sterkeområder: ['Trafikkregler', 'Forkjørsrett', 'Skiltlære']
        },
        forberedelse: {
          studietimer: 25,
          øvingskjøringer: 0,
          simulatortimer: 0,
          teoriprøver: 12
        },
        kostnad: 600,
        betalt: true,
        påmeldingsfrist: '2025-06-03',
        avlysningsfrist: '2025-06-08',
        beskrivelse: 'Obligatorisk teoriprøve for førerkort klasse B',
        krav: ['Gyldig ID', 'Helseattest', 'Førstehjelp kurs'],
        opprettet: '2025-05-15T10:00:00Z',
        oppdatert: '2025-06-10T11:00:00Z'
      },
      {
        id: '2',
        navn: 'Praktisk prøve - Førerkort klasse B',
        type: 'PRAKTISK_PRØVE',
        status: 'PLANLAGT',
        dato: '2025-06-25',
        tidspunkt: '14:00',
        varighet: 60,
        sted: 'Statens vegvesen - Tromsø',
        sensor: {
          id: '1',
          navn: 'Kari Nordahl'
        },
        kjøretøy: {
          id: '1',
          registreringsnummer: 'AB12345',
          merke: 'Toyota',
          modell: 'Corolla'
        },
        forberedelse: {
          studietimer: 0,
          øvingskjøringer: 15,
          simulatortimer: 3,
          teoriprøver: 0
        },
        kostnad: 1200,
        betalt: false,
        påmeldingsfrist: '2025-06-18',
        avlysningsfrist: '2025-06-23',
        beskrivelse: 'Praktisk kjøreprøve for førerkort klasse B',
        krav: ['Bestått teoriprøve', 'Minimum 20 kjøretimer', 'Gyldig øvingskjøring'],
        opprettet: '2025-06-12T14:00:00Z',
        oppdatert: '2025-06-12T14:00:00Z'
      },
      {
        id: '3',
        navn: 'Oppkjøring - Første forsøk',
        type: 'OPPKJØRING',
        status: 'IKKE_BESTÅTT',
        dato: '2025-05-20',
        tidspunkt: '09:30',
        varighet: 45,
        sted: 'Statens vegvesen - Tromsø',
        sensor: {
          id: '2',
          navn: 'Lars Hansen'
        },
        kjøretøy: {
          id: '1',
          registreringsnummer: 'AB12345',
          merke: 'Toyota',
          modell: 'Corolla'
        },
        resultat: {
          poeng: 65,
          maksPoeng: 100,
          prosent: 65.0,
          karakter: 'Ikke bestått',
          kommentar: 'Trenger mer øvelse på parkering og speilbruk. Ellers god kjøring.',
          feilområder: ['Parkering', 'Speilbruk', 'Observasjon'],
          sterkeområder: ['Trafikktilpasning', 'Hastighetsregulering']
        },
        forberedelse: {
          studietimer: 0,
          øvingskjøringer: 18,
          simulatortimer: 2,
          teoriprøver: 0
        },
        kostnad: 1200,
        betalt: true,
        påmeldingsfrist: '2025-05-13',
        avlysningsfrist: '2025-05-18',
        beskrivelse: 'Første oppkjøring for førerkort klasse B',
        krav: ['Bestått teoriprøve', 'Minimum 20 kjøretimer'],
        opprettet: '2025-05-01T12:00:00Z',
        oppdatert: '2025-05-20T10:30:00Z'
      },
      {
        id: '4',
        navn: 'Kontrollkjøring - Etter ikke bestått',
        type: 'KONTROLLKJØRING',
        status: 'PLANLAGT',
        dato: '2025-07-05',
        tidspunkt: '11:00',
        varighet: 30,
        sted: 'Kjøreskole Nord - Øvingsplass',
        instruktør: {
          id: '1',
          navn: 'Ole Hansen'
        },
        kjøretøy: {
          id: '1',
          registreringsnummer: 'AB12345',
          merke: 'Toyota',
          modell: 'Corolla'
        },
        kostnad: 800,
        betalt: false,
        påmeldingsfrist: '2025-06-28',
        avlysningsfrist: '2025-07-03',
        beskrivelse: 'Kontrollkjøring for å vurdere fremgang etter ikke bestått oppkjøring',
        krav: ['Minimum 5 ekstra kjøretimer'],
        opprettet: '2025-06-15T16:00:00Z',
        oppdatert: '2025-06-15T16:00:00Z'
      }
    ];

    const statistikk: PrøveStatistikk = {
      totalePrøver: 4,
      beståttePrøver: 1,
      ikkeBeståttePrøver: 1,
      planlagtePrøver: 2,
      avlystePrøver: 0,
      gjennomsnittPoeng: 51.5,
      beståttprosent: 50.0,
      teoriprøver: 1,
      praktiskeprøver: 1,
      oppkjøringer: 2,
      totalKostnad: 3800,
      betaltKostnad: 1800,
      nestePrøve: prøver[1],
      fremgang: {
        måned: 2,
        total: 4
      }
    };

    return { prøver, statistikk };
  }
}

export const prøverService = new PrøverService();
export default prøverService; 