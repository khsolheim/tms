import api from '../lib/api';

// Interfaces
export interface ElevKontrakt {
  id: string;
  tittel: string;
  type: 'KJØREOPPLÆRING' | 'OPPKJØRING' | 'LASTEBIL' | 'MOTORSYKKEL' | 'ANNET';
  startdato: string;
  sluttdato: string;
  status: 'AKTIV' | 'PLANLAGT' | 'IKKE_STARTET' | 'FULLFØRT' | 'AVBRUTT';
  totalSum: number;
  betaltSum: number;
  timerTotalt: number;
  timerFullført: number;
  timerIgjen: number;
  fremgang: number;
  instruktør: string;
  bedrift: string;
  kategori: string;
  beskrivelse: string;
  milepæler: Array<{
    navn: string;
    status: 'FULLFØRT' | 'PLANLAGT' | 'VENTER' | 'IKKE_STARTET';
    dato: string | null;
  }>;
}

export interface ElevStatistikk {
  id: string;
  navn: string;
  personnummer: string;
  startDato: string;
  status: 'AKTIV' | 'FULLFØRT' | 'AVBRUTT' | 'PAUSE';
  fremgang: {
    totalTimer: number;
    gjennomførteTimer: number;
    teoriTimer: number;
    praksis: number;
    prosent: number;
  };
  prøver: {
    bestått: number;
    stryk: number;
    ventende: number;
    totalPoeng: number;
    gjennomsnitt: number;
  };
  karakter: string;
  sistAktiv: string;
  instruktør: string;
  kostnader: {
    totalt: number;
    betalt: number;
    utestående: number;
  };
}

export interface BedriftElevData {
  bedriftNavn: string;
  organisasjonsnummer: string;
  antallElever: number;
  aktiveElever: number;
  fullførte: number;
  gjennomsnittligVarighet: number;
  suksessrate: number;
  totalKostnader: number;
}

export interface ElevFilters {
  status?: string;
  instruktør?: string;
  kategori?: string;
  bedrift?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ElevProfil {
  id: string;
  fornavn: string;
  etternavn: string;
  personnummer: string;
  telefon: string;
  epost: string;
  adresse: {
    gate: string;
    postnummer: string;
    poststed: string;
  };
  status: 'aktiv' | 'inaktiv' | 'fullført' | 'pause';
  opprettDato: string;
  førerkortklass: string[];
  bedrift: {
    id: string;
    navn: string;
  };
  instruktør: {
    id: string;
    navn: string;
  };
  statistikk: {
    totalTimer: number;
    gjennomførteTimer: number;
    beståttePrøver: number;
    totaltPrøver: number;
    gjennomsnittKarakter: number;
  };
}

export interface Fremgang {
  kategori: string;
  beskrivelse: string;
  status: 'ikke_startet' | 'pågår' | 'fullført';
  prosent: number;
  sistOppdatert: string;
}

class ElevService {
  // Hent elev kontrakter
  async hentElevKontrakter(elevId: string): Promise<ElevKontrakt[]> {
    const response = await api.get(`/elever/${elevId}/kontrakter`);
    return response.data;
  }

  // Hent elev statistikk
  async hentElevStatistikk(filters: ElevFilters = {}): Promise<ElevStatistikk[]> {
    const searchParams = new URLSearchParams();
    
    if (filters.status) searchParams.append('status', filters.status);
    if (filters.instruktør) searchParams.append('instruktør', filters.instruktør);
    if (filters.kategori) searchParams.append('kategori', filters.kategori);
    if (filters.bedrift) searchParams.append('bedrift', filters.bedrift);
    if (filters.dateFrom) searchParams.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) searchParams.append('dateTo', filters.dateTo);
    
    const queryString = searchParams.toString();
    const url = `/elever/statistikk${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  }

  // Hent bedrift elev data
  async hentBedriftElevData(bedriftId: string): Promise<BedriftElevData> {
    const response = await api.get(`/bedrifter/${bedriftId}/elev-data`);
    return response.data;
  }

  // Opprett ny kontrakt
  async opprettKontrakt(kontraktData: Omit<ElevKontrakt, 'id'>): Promise<ElevKontrakt> {
    const response = await api.post('/elever/kontrakter', kontraktData);
    return response.data;
  }

  // Oppdater kontrakt
  async oppdaterKontrakt(id: string, kontraktData: Partial<ElevKontrakt>): Promise<ElevKontrakt> {
    const response = await api.put(`/elever/kontrakter/${id}`, kontraktData);
    return response.data;
  }

  // Mock data metoder (for utvikling)
  async hentMockElevKontrakter(): Promise<ElevKontrakt[]> {
    return [
      {
        id: 'K001',
        tittel: 'Kjøreopplæring B-klasse Standard',
        type: 'KJØREOPPLÆRING',
        startdato: '2025-01-15',
        sluttdato: '2025-06-15',
        status: 'AKTIV',
        totalSum: 25000,
        betaltSum: 15000,
        timerTotalt: 50,
        timerFullført: 30,
        timerIgjen: 20,
        fremgang: 60,
        instruktør: 'Ole Hansen',
        bedrift: 'Kjøreskole Nord AS',
        kategori: 'B-klasse',
        beskrivelse: 'Standard kjøreopplæring for B-klasse førerkort',
        milepæler: [
          { navn: 'Teoretisk prøve', status: 'FULLFØRT', dato: '2025-02-15' },
          { navn: 'Førstehjelp kurs', status: 'FULLFØRT', dato: '2025-02-20' },
          { navn: 'Praktisk prøve', status: 'PLANLAGT', dato: '2025-07-01' },
          { navn: 'Utvida prøve', status: 'VENTER', dato: null }
        ]
      },
      {
        id: 'K002',
        tittel: 'Oppkjøring til praktisk prøve',
        type: 'OPPKJØRING',
        startdato: '2025-06-01',
        sluttdato: '2025-07-01',
        status: 'PLANLAGT',
        totalSum: 8000,
        betaltSum: 0,
        timerTotalt: 15,
        timerFullført: 0,
        timerIgjen: 15,
        fremgang: 0,
        instruktør: 'Ole Hansen',
        bedrift: 'Kjøreskole Nord AS',
        kategori: 'B-klasse',
        beskrivelse: 'Oppkjøring og forberedelse til praktisk førerprøve',
        milepæler: [
          { navn: 'Oppkjøring timer', status: 'PLANLAGT', dato: '2025-06-01' },
          { navn: 'Praktisk prøve', status: 'PLANLAGT', dato: '2025-07-01' }
        ]
      },
      {
        id: 'K003',
        tittel: 'Lastebil C-klasse Intensiv',
        type: 'LASTEBIL',
        startdato: '2025-08-01',
        sluttdato: '2025-11-01',
        status: 'IKKE_STARTET',
        totalSum: 45000,
        betaltSum: 5000,
        timerTotalt: 80,
        timerFullført: 0,
        timerIgjen: 80,
        fremgang: 0,
        instruktør: 'Kari Nordmann',
        bedrift: 'Kjøreskole Nord AS',
        kategori: 'C-klasse',
        beskrivelse: 'Intensivkurs for C-klasse lastebil førerkort',
        milepæler: [
          { navn: 'Teoretisk forberedelse', status: 'IKKE_STARTET', dato: null },
          { navn: 'Praktisk opplæring', status: 'IKKE_STARTET', dato: null },
          { navn: 'Teoriprøve', status: 'IKKE_STARTET', dato: null },
          { navn: 'Praktisk prøve', status: 'IKKE_STARTET', dato: null }
        ]
      }
    ];
  }

  async hentMockElevStatistikk(): Promise<ElevStatistikk[]> {
    return [
      {
        id: '1',
        navn: 'Ola Nordmann',
        personnummer: '010195-****',
        startDato: '2024-08-15',
        status: 'AKTIV',
        fremgang: {
          totalTimer: 300,
          gjennomførteTimer: 245,
          teoriTimer: 100,
          praksis: 145,
          prosent: 81.7
        },
        prøver: {
          bestått: 8,
          stryk: 1,
          ventende: 2,
          totalPoeng: 426,
          gjennomsnitt: 4.2
        },
        karakter: 'B',
        sistAktiv: '2025-06-14',
        instruktør: 'Lars Hansen',
        kostnader: {
          totalt: 125000,
          betalt: 100000,
          utestående: 25000
        }
      },
      {
        id: '2',
        navn: 'Kari Svendsen',
        personnummer: '150392-****',
        startDato: '2024-09-01',
        status: 'AKTIV',
        fremgang: {
          totalTimer: 300,
          gjennomførteTimer: 180,
          teoriTimer: 80,
          praksis: 100,
          prosent: 60.0
        },
        prøver: {
          bestått: 6,
          stryk: 0,
          ventende: 1,
          totalPoeng: 312,
          gjennomsnitt: 4.5
        },
        karakter: 'A',
        sistAktiv: '2025-06-13',
        instruktør: 'Anne Olsen',
        kostnader: {
          totalt: 125000,
          betalt: 75000,
          utestående: 50000
        }
      }
    ];
  }

  async hentMockBedriftElevData(): Promise<BedriftElevData> {
    return {
      bedriftNavn: 'Grønn Transport AS',
      organisasjonsnummer: '123456789',
      antallElever: 45,
      aktiveElever: 12,
      fullførte: 28,
      gjennomsnittligVarighet: 18.5,
      suksessrate: 89.2,
      totalKostnader: 2750000
    };
  }

  async hentElev(elevId: string): Promise<ElevProfil | null> {
    try {
      const response = await api.get(`/elever/${elevId}`);
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av elev:', error);
      return this.hentMockElev(elevId);
    }
  }

  async hentElevFremgang(elevId: string): Promise<Fremgang[]> {
    try {
      const response = await api.get(`/elever/${elevId}/fremgang`);
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av elevfremgang:', error);
      return this.hentMockFremgang();
    }
  }

  // Mock data metoder
  private hentMockElev(elevId: string): ElevProfil | null {
    const mockElever: ElevProfil[] = [
      {
        id: '1',
        fornavn: 'Ola',
        etternavn: 'Nordmann',
        personnummer: '010190-12345',
        telefon: '+47 123 45 678',
        epost: 'ola.nordmann@example.com',
        adresse: {
          gate: 'Storgata 123',
          postnummer: '0001',
          poststed: 'Oslo'
        },
        status: 'aktiv',
        opprettDato: '2024-01-15',
        førerkortklass: ['B', 'BE'],
        bedrift: {
          id: '1',
          navn: 'Oslo Trafikklærerskole'
        },
        instruktør: {
          id: '1',
          navn: 'Kari Hansen'
        },
        statistikk: {
          totalTimer: 40,
          gjennomførteTimer: 28,
          beståttePrøver: 3,
          totaltPrøver: 4,
          gjennomsnittKarakter: 4.2
        }
      }
    ];
    
    return mockElever.find(e => e.id === elevId) || mockElever[0];
  }

  private hentMockFremgang(): Fremgang[] {
    return [
      {
        kategori: 'Teoriprøve',
        beskrivelse: 'Bestått teoriprøve for klasse B',
        status: 'fullført',
        prosent: 100,
        sistOppdatert: '2024-02-20'
      },
      {
        kategori: 'Kjøretimer',
        beskrivelse: 'Gjennomført obligatoriske kjøretimer',
        status: 'pågår',
        prosent: 70,
        sistOppdatert: '2024-06-10'
      },
      {
        kategori: 'Trafikkopplæring',
        beskrivelse: 'Spesiell trafikkopplæring',
        status: 'pågår',
        prosent: 45,
        sistOppdatert: '2024-06-08'
      },
      {
        kategori: 'Førerkortprøve',
        beskrivelse: 'Praktisk førerkortprøve',
        status: 'ikke_startet',
        prosent: 0,
        sistOppdatert: '2024-06-15'
      }
    ];
  }
}

export const elevService = new ElevService(); 