import api from '../lib/api';

// Interfaces
export interface HistorikkEntry {
  id: string;
  type: 'OPPRETTET' | 'OPPDATERT' | 'ELEV_LAGT_TIL' | 'ELEV_FJERNET' | 'KONTRAKT_SIGNERT' | 'FAKTURA_SENDT' | 'BETALING_MOTTATT' | 'NOTAT_LAGT_TIL';
  beskrivelse: string;
  dato: string;
  bruker: string;
  detaljer?: Record<string, any>;
  viktig?: boolean;
}

export interface BedriftDetaljer {
  id: string;
  navn: string;
  organisasjonsnummer: string;
  kontaktperson: string;
  epost?: string;
  telefon?: string;
  adresse: {
    gate: string;
    postnummer: string;
    poststed: string;
  };
  status: 'AKTIV' | 'INAKTIV' | 'SUSPENDERT';
  opprettet: string;
  sistOppdatert: string;
  antallElever: number;
  antallKontrakter: number;
  totalOmsetning: number;
}

export interface BedriftStatistikk {
  elevUtvikling: {
    periode: string;
    antall: number;
  }[];
  omsetningUtvikling: {
    periode: string;
    beløp: number;
  }[];
  kontraktStatus: {
    aktive: number;
    fullførte: number;
    kansellerte: number;
  };
  betalingshistorikk: {
    totalFakturert: number;
    totalBetalt: number;
    utestående: number;
    forsinket: number;
  };
}

export interface BedriftFilters {
  type?: string;
  periode?: string;
  bruker?: string;
  viktig?: boolean;
}

class BedriftHistorikkService {
  // Hent bedrift-detaljer
  async hentBedriftDetaljer(bedriftId: string): Promise<BedriftDetaljer> {
    const response = await api.get(`/bedrifter/${bedriftId}`);
    return response.data;
  }

  // Hent bedrift-historikk
  async hentBedriftHistorikk(bedriftId: string, filters?: BedriftFilters): Promise<HistorikkEntry[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.periode) params.append('periode', filters.periode);
    if (filters?.bruker) params.append('bruker', filters.bruker);
    if (filters?.viktig !== undefined) params.append('viktig', filters.viktig.toString());

    const response = await api.get(`/bedrifter/${bedriftId}/historikk?${params.toString()}`);
    return response.data;
  }

  // Hent bedrift-statistikk
  async hentBedriftStatistikk(bedriftId: string): Promise<BedriftStatistikk> {
    const response = await api.get(`/bedrifter/${bedriftId}/statistikk`);
    return response.data;
  }

  // Legg til historikk-entry
  async leggTilHistorikkEntry(bedriftId: string, entry: Partial<HistorikkEntry>): Promise<HistorikkEntry> {
    const response = await api.post(`/bedrifter/${bedriftId}/historikk`, entry);
    return response.data;
  }

  // Mock data for utvikling
  async hentMockBedriftDetaljer(): Promise<BedriftDetaljer> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      id: '1',
      navn: 'Oslo Trafikkskole AS',
      organisasjonsnummer: '987654321',
      kontaktperson: 'Kari Nordmann',
      epost: 'kari@oslotrafikkskole.no',
      telefon: '+47 22 12 34 56',
      adresse: {
        gate: 'Storgata 15',
        postnummer: '0155',
        poststed: 'Oslo'
      },
      status: 'AKTIV',
      opprettet: '2024-01-15T10:00:00Z',
      sistOppdatert: '2025-06-15T14:30:00Z',
      antallElever: 45,
      antallKontrakter: 12,
      totalOmsetning: 1250000
    };
  }

  async hentMockBedriftHistorikk(): Promise<HistorikkEntry[]> {
    await new Promise(resolve => setTimeout(resolve, 400));

    return [
      {
        id: '1',
        type: 'BETALING_MOTTATT',
        beskrivelse: 'Betaling mottatt for faktura #2025-156',
        dato: '2025-06-15T14:30:00Z',
        bruker: 'System',
        detaljer: {
          fakturaId: '2025-156',
          beløp: 45000,
          betalingsmåte: 'Bankoverføring'
        },
        viktig: true
      },
      {
        id: '2',
        type: 'ELEV_LAGT_TIL',
        beskrivelse: 'Ny elev registrert: Magnus Olsen',
        dato: '2025-06-14T11:15:00Z',
        bruker: 'Kari Nordmann',
        detaljer: {
          elevNavn: 'Magnus Olsen',
          kurstype: 'Klasse B',
          startdato: '2025-06-20'
        }
      },
      {
        id: '3',
        type: 'FAKTURA_SENDT',
        beskrivelse: 'Faktura #2025-156 sendt til bedriften',
        dato: '2025-06-10T09:00:00Z',
        bruker: 'System',
        detaljer: {
          fakturaId: '2025-156',
          beløp: 45000,
          forfallsdato: '2025-06-24'
        },
        viktig: true
      },
      {
        id: '4',
        type: 'KONTRAKT_SIGNERT',
        beskrivelse: 'Kontrakt for sommerkurs 2025 signert',
        dato: '2025-06-08T16:45:00Z',
        bruker: 'Kari Nordmann',
        detaljer: {
          kontraktId: 'K-2025-089',
          periode: 'Juni-August 2025',
          antallElever: 8
        },
        viktig: true
      },
      {
        id: '5',
        type: 'OPPDATERT',
        beskrivelse: 'Kontaktinformasjon oppdatert',
        dato: '2025-06-05T13:20:00Z',
        bruker: 'Admin',
        detaljer: {
          endringer: ['telefon', 'epost'],
          gammeltTelefon: '+47 22 11 22 33',
          nyttTelefon: '+47 22 12 34 56'
        }
      },
      {
        id: '6',
        type: 'ELEV_FJERNET',
        beskrivelse: 'Elev avsluttet kurs: Lisa Hansen',
        dato: '2025-06-03T10:30:00Z',
        bruker: 'Instruktør',
        detaljer: {
          elevNavn: 'Lisa Hansen',
          årsak: 'Kurs fullført',
          sluttdato: '2025-06-03'
        }
      },
      {
        id: '7',
        type: 'NOTAT_LAGT_TIL',
        beskrivelse: 'Notat lagt til angående spesielle behov',
        dato: '2025-06-01T14:15:00Z',
        bruker: 'Kari Nordmann',
        detaljer: {
          notat: 'Bedriften har behov for ekstra fleksibilitet i timeplanen på grunn av skiftarbeid.'
        }
      },
      {
        id: '8',
        type: 'BETALING_MOTTATT',
        beskrivelse: 'Betaling mottatt for faktura #2025-134',
        dato: '2025-05-28T12:00:00Z',
        bruker: 'System',
        detaljer: {
          fakturaId: '2025-134',
          beløp: 38000,
          betalingsmåte: 'Vipps'
        },
        viktig: true
      },
      {
        id: '9',
        type: 'ELEV_LAGT_TIL',
        beskrivelse: 'Ny elev registrert: Erik Johansen',
        dato: '2025-05-25T09:45:00Z',
        bruker: 'Kari Nordmann',
        detaljer: {
          elevNavn: 'Erik Johansen',
          kurstype: 'Klasse B',
          startdato: '2025-06-01'
        }
      },
      {
        id: '10',
        type: 'OPPRETTET',
        beskrivelse: 'Bedrift opprettet i systemet',
        dato: '2024-01-15T10:00:00Z',
        bruker: 'Admin',
        detaljer: {
          opprettetAv: 'System Administrator',
          initialStatus: 'AKTIV'
        },
        viktig: true
      }
    ];
  }

  async hentMockBedriftStatistikk(): Promise<BedriftStatistikk> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      elevUtvikling: [
        { periode: '2025-01', antall: 28 },
        { periode: '2025-02', antall: 32 },
        { periode: '2025-03', antall: 38 },
        { periode: '2025-04', antall: 41 },
        { periode: '2025-05', antall: 43 },
        { periode: '2025-06', antall: 45 }
      ],
      omsetningUtvikling: [
        { periode: '2025-01', beløp: 180000 },
        { periode: '2025-02', beløp: 210000 },
        { periode: '2025-03', beløp: 245000 },
        { periode: '2025-04', beløp: 268000 },
        { periode: '2025-05', beløp: 285000 },
        { periode: '2025-06', beløp: 295000 }
      ],
      kontraktStatus: {
        aktive: 8,
        fullførte: 4,
        kansellerte: 0
      },
      betalingshistorikk: {
        totalFakturert: 1450000,
        totalBetalt: 1250000,
        utestående: 150000,
        forsinket: 50000
      }
    };
  }
}

export const bedriftHistorikkService = new BedriftHistorikkService();
export default bedriftHistorikkService; 