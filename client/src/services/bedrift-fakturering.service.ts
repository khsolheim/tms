import api from '../lib/api';

export interface Faktura {
  id: string;
  fakturaNummerr: string;
  bedriftId: string;
  bedriftNavn: string;
  dato: string;
  forfallsdato: string;
  beløp: number;
  mva: number;
  totalBeløp: number;
  status: 'usendt' | 'sendt' | 'betalt' | 'forsinket' | 'kreditert';
  betalingsdato?: string;
  beskrivelse: string;
  linjer: FakturaLinje[];
  vedlegg?: string[];
}

export interface FakturaLinje {
  id: string;
  beskrivelse: string;
  antall: number;
  enhetspris: number;
  mvaSats: number;
  totalPris: number;
  kategori: string;
}

export interface FaktureringsStatistikk {
  totalOmsetning: number;
  antallFakturaer: number;
  gjennomsnittligFaktura: number;
  ubetalte: number;
  forsinkedeBetaling: number;
  betalingsgrad: number;
}

export interface BetalingsHistorikk {
  id: string;
  fakturaId: string;
  beløp: number;
  dato: string;
  metode: 'bankoverføring' | 'kort' | 'vipps' | 'kontant';
  referanse: string;
  status: 'fullført' | 'venter' | 'feilet';
}

export interface FaktureringsFilter {
  status?: string;
  bedriftId?: string;
  datoFra?: string;
  datoTil?: string;
  beløpFra?: number;
  beløpTil?: number;
}

class BedriftFaktureringService {
  async hentFakturaer(filter?: FaktureringsFilter): Promise<Faktura[]> {
    try {
      const response = await api.get('/bedrifter/fakturering/fakturaer', { params: filter });
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av fakturaer:', error);
      return this.hentMockFakturaer();
    }
  }

  async hentFaktura(fakturaId: string): Promise<Faktura | null> {
    try {
      const response = await api.get(`/bedrifter/fakturering/fakturaer/${fakturaId}`);
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av faktura:', error);
      return this.hentMockFakturaer().find(f => f.id === fakturaId) || null;
    }
  }

  async opprettFaktura(faktura: Omit<Faktura, 'id' | 'fakturaNummerr' | 'dato'>): Promise<Faktura> {
    try {
      const response = await api.post('/bedrifter/fakturering/fakturaer', faktura);
      return response.data;
    } catch (error) {
      console.error('Feil ved opprettelse av faktura:', error);
      throw error;
    }
  }

  async oppdaterFaktura(fakturaId: string, faktura: Partial<Faktura>): Promise<Faktura> {
    try {
      const response = await api.put(`/bedrifter/fakturering/fakturaer/${fakturaId}`, faktura);
      return response.data;
    } catch (error) {
      console.error('Feil ved oppdatering av faktura:', error);
      throw error;
    }
  }

  async sendFaktura(fakturaId: string): Promise<void> {
    try {
      await api.post(`/bedrifter/fakturering/fakturaer/${fakturaId}/send`);
    } catch (error) {
      console.error('Feil ved sending av faktura:', error);
      throw error;
    }
  }

  async registrerBetaling(fakturaId: string, betaling: Omit<BetalingsHistorikk, 'id' | 'fakturaId'>): Promise<void> {
    try {
      await api.post(`/bedrifter/fakturering/fakturaer/${fakturaId}/betaling`, betaling);
    } catch (error) {
      console.error('Feil ved registrering av betaling:', error);
      throw error;
    }
  }

  async hentFaktureringsStatistikk(bedriftId?: string): Promise<FaktureringsStatistikk> {
    try {
      const response = await api.get('/bedrifter/fakturering/statistikk', { 
        params: bedriftId ? { bedriftId } : {} 
      });
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av faktureringsstatistikk:', error);
      return this.hentMockFaktureringsStatistikk();
    }
  }

  async hentBetalingsHistorikk(fakturaId?: string): Promise<BetalingsHistorikk[]> {
    try {
      const response = await api.get('/bedrifter/fakturering/betalinger', {
        params: fakturaId ? { fakturaId } : {}
      });
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av betalingshistorikk:', error);
      return this.hentMockBetalingsHistorikk();
    }
  }

  async genererFakturaPdf(fakturaId: string): Promise<Blob> {
    try {
      const response = await api.get(`/bedrifter/fakturering/fakturaer/${fakturaId}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Feil ved generering av faktura PDF:', error);
      throw error;
    }
  }

  async slettFaktura(fakturaId: string): Promise<void> {
    try {
      await api.delete(`/bedrifter/fakturering/fakturaer/${fakturaId}`);
    } catch (error) {
      console.error('Feil ved sletting av faktura:', error);
      throw error;
    }
  }

  // Mock data metoder
  private hentMockFakturaer(): Faktura[] {
    return [
      {
        id: 'fakt-1',
        fakturaNummerr: 'F-2024-001',
        bedriftId: 'bedrift-1',
        bedriftNavn: 'Oslo Trafikkskole AS',
        dato: '2024-06-01T00:00:00Z',
        forfallsdato: '2024-06-31T00:00:00Z',
        beløp: 25000,
        mva: 6250,
        totalBeløp: 31250,
        status: 'betalt',
        betalingsdato: '2024-06-15T10:30:00Z',
        beskrivelse: 'Kjøretimer juni 2024',
        linjer: [
          {
            id: 'linje-1',
            beskrivelse: 'Kjøretimer - 20 timer',
            antall: 20,
            enhetspris: 800,
            mvaSats: 25,
            totalPris: 16000,
            kategori: 'Kjøreopplæring'
          },
          {
            id: 'linje-2',
            beskrivelse: 'Teorikurs - Grunnkurs',
            antall: 1,
            enhetspris: 3500,
            mvaSats: 25,
            totalPris: 3500,
            kategori: 'Teori'
          },
          {
            id: 'linje-3',
            beskrivelse: 'Sikkerhetskurs',
            antall: 1,
            enhetspris: 5500,
            mvaSats: 25,
            totalPris: 5500,
            kategori: 'Sikkerhet'
          }
        ]
      },
      {
        id: 'fakt-2',
        fakturaNummerr: 'F-2024-002',
        bedriftId: 'bedrift-2',
        bedriftNavn: 'Bergen Kjøreskole',
        dato: '2024-06-05T00:00:00Z',
        forfallsdato: '2024-07-05T00:00:00Z',
        beløp: 18000,
        mva: 4500,
        totalBeløp: 22500,
        status: 'sendt',
        beskrivelse: 'Månedlig abonnement juni 2024',
        linjer: [
          {
            id: 'linje-3',
            beskrivelse: 'Månedlig lisens - Premium',
            antall: 1,
            enhetspris: 12000,
            mvaSats: 25,
            totalPris: 12000,
            kategori: 'Lisens'
          },
          {
            id: 'linje-4',
            beskrivelse: 'Support og vedlikehold',
            antall: 1,
            enhetspris: 6000,
            mvaSats: 25,
            totalPris: 6000,
            kategori: 'Support'
          }
        ]
      },
      {
        id: 'fakt-3',
        fakturaNummerr: 'F-2024-003',
        bedriftId: 'bedrift-3',
        bedriftNavn: 'Trondheim Trafikkopplæring',
        dato: '2024-06-10T00:00:00Z',
        forfallsdato: '2024-06-25T00:00:00Z',
        beløp: 8500,
        mva: 2125,
        totalBeløp: 10625,
        status: 'forsinket',
        beskrivelse: 'Ekstra tjenester mai 2024',
        linjer: [
          {
            id: 'linje-5',
            beskrivelse: 'Ekstra kjøretimer - 10 timer',
            antall: 10,
            enhetspris: 850,
            mvaSats: 25,
            totalPris: 8500,
            kategori: 'Kjøreopplæring'
          }
        ]
      },
      {
        id: 'fakt-4',
        fakturaNummerr: 'F-2024-004',
        bedriftId: 'bedrift-1',
        bedriftNavn: 'Oslo Trafikkskole AS',
        dato: '2024-06-15T00:00:00Z',
        forfallsdato: '2024-07-15T00:00:00Z',
        beløp: 15000,
        mva: 3750,
        totalBeløp: 18750,
        status: 'usendt',
        beskrivelse: 'Spesialkurs - Lastebil',
        linjer: [
          {
            id: 'linje-6',
            beskrivelse: 'Lastebilkurs - C-klasse',
            antall: 1,
            enhetspris: 15000,
            mvaSats: 25,
            totalPris: 15000,
            kategori: 'Spesialkurs'
          }
        ]
      }
    ];
  }

  private hentMockFaktureringsStatistikk(): FaktureringsStatistikk {
    return {
      totalOmsetning: 2456789,
      antallFakturaer: 156,
      gjennomsnittligFaktura: 15748,
      ubetalte: 8,
      forsinkedeBetaling: 3,
      betalingsgrad: 94.2
    };
  }

  private hentMockBetalingsHistorikk(): BetalingsHistorikk[] {
    return [
      {
        id: 'bet-1',
        fakturaId: 'fakt-1',
        beløp: 31250,
        dato: '2024-06-15T10:30:00Z',
        metode: 'bankoverføring',
        referanse: 'REF-123456789',
        status: 'fullført'
      },
      {
        id: 'bet-2',
        fakturaId: 'fakt-2',
        beløp: 22500,
        dato: '2024-06-20T14:15:00Z',
        metode: 'vipps',
        referanse: 'VIPPS-987654321',
        status: 'venter'
      },
      {
        id: 'bet-3',
        fakturaId: 'fakt-3',
        beløp: 5000,
        dato: '2024-06-25T09:45:00Z',
        metode: 'kort',
        referanse: 'CARD-456789123',
        status: 'feilet'
      }
    ];
  }
}

export const bedriftFaktureringService = new BedriftFaktureringService(); 