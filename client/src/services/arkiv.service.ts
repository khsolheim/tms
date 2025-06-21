import api from '../lib/api';

export interface ArchivedControl {
  id: string;
  kontrollId: string;
  tittel: string;
  bedrift: string;
  kontrollør: string;
  dato: string;
  arkiveringsDato: string;
  status: 'godkjent' | 'avvik' | 'kritisk';
  kategori: string;
  dokumenter: number;
  årsak: string;
  oppbevaringsPeriode: string;
  kanSlettes: boolean;
  tags: string[];
  størrelse: string;
}

export interface ArkivStatistikk {
  totaltArkiverte: number;
  godkjente: number;
  avvik: number;
  kritiske: number;
  totalStørrelse: string;
}

export interface ArkivFilter {
  status?: string[];
  kategori?: string;
  bedrift?: string;
  datoFra?: string;
  datoTil?: string;
}

class ArkivService {
  async hentArkiverteKontroller(filter?: ArkivFilter): Promise<ArchivedControl[]> {
    try {
      const response = await api.get('/arkiv/kontroller', { params: filter });
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av arkiverte kontroller:', error);
      return this.hentMockArkiverteKontroller();
    }
  }

  async hentArkivStatistikk(): Promise<ArkivStatistikk> {
    try {
      const response = await api.get('/arkiv/statistikk');
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av arkivstatistikk:', error);
      return this.hentMockArkivStatistikk();
    }
  }

  async gjenopprettKontroll(kontrollId: string): Promise<void> {
    try {
      await api.post(`/arkiv/kontroller/${kontrollId}/gjenopprett`);
    } catch (error) {
      console.error('Feil ved gjenoppretting av kontroll:', error);
      throw error;
    }
  }

  async slettPermanent(kontrollIds: string[]): Promise<void> {
    try {
      await api.delete('/arkiv/kontroller', { data: { ids: kontrollIds } });
    } catch (error) {
      console.error('Feil ved permanent sletting:', error);
      throw error;
    }
  }

  async eksporterArkiv(kontrollIds?: string[]): Promise<Blob> {
    try {
      const response = await api.post('/arkiv/eksporter', 
        { ids: kontrollIds }, 
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Feil ved eksport av arkiv:', error);
      throw error;
    }
  }

  private hentMockArkiverteKontroller(): ArchivedControl[] {
    return [
      {
        id: 'arch-1',
        kontrollId: 'SK-2024-001',
        tittel: 'Månedlig sikkerhetssjekk - Verksted A',
        bedrift: 'Oslo Trafikkskole AS',
        kontrollør: 'Lars Hansen',
        dato: '2024-01-15',
        arkiveringsDato: '2024-02-15',
        status: 'godkjent',
        kategori: 'Verksted',
        dokumenter: 8,
        årsak: 'Automatisk arkivering etter 30 dager',
        oppbevaringsPeriode: '7 år',
        kanSlettes: false,
        tags: ['verksted', 'månedlig', 'rutinesjekk'],
        størrelse: '2.4 MB'
      },
      {
        id: 'arch-2',
        kontrollId: 'SK-2024-002',
        tittel: 'Kjøretøy sikkerhetskontroll - Fleet B',
        bedrift: 'Bergen Trafikkskole',
        kontrollør: 'Nina Olsen',
        dato: '2024-01-20',
        arkiveringsDato: '2024-03-01',
        status: 'avvik',
        kategori: 'Kjøretøy',
        dokumenter: 12,
        årsak: 'Manuell arkivering - sak løst',
        oppbevaringsPeriode: '10 år',
        kanSlettes: false,
        tags: ['kjøretøy', 'avvik', 'fleet'],
        størrelse: '5.8 MB'
      },
      {
        id: 'arch-3',
        kontrollId: 'SK-2024-003',
        tittel: 'Årlig revisjon - Hovedkontor',
        bedrift: 'Trondheim Trafikkskole',
        kontrollør: 'Erik Johansen',
        dato: '2024-02-10',
        arkiveringsDato: '2024-03-15',
        status: 'kritisk',
        kategori: 'Revisjon',
        dokumenter: 25,
        årsak: 'Automatisk arkivering - kritiske avvik løst',
        oppbevaringsPeriode: '15 år',
        kanSlettes: false,
        tags: ['revisjon', 'årlig', 'kritisk'],
        størrelse: '12.3 MB'
      },
      {
        id: 'arch-4',
        kontrollId: 'SK-2024-004',
        tittel: 'Utstyrskontroll - Simulator',
        bedrift: 'Stavanger Trafikkskole',
        kontrollør: 'Maria Andersen',
        dato: '2024-02-25',
        arkiveringsDato: '2024-03-20',
        status: 'godkjent',
        kategori: 'Utstyr',
        dokumenter: 6,
        årsak: 'Automatisk arkivering etter godkjenning',
        oppbevaringsPeriode: '5 år',
        kanSlettes: true,
        tags: ['utstyr', 'simulator', 'godkjent'],
        størrelse: '1.8 MB'
      },
      {
        id: 'arch-5',
        kontrollId: 'SK-2024-005',
        tittel: 'Brannsikkerhet - Alle lokaler',
        bedrift: 'Kristiansand Trafikkskole',
        kontrollør: 'Tom Nilsen',
        dato: '2024-03-05',
        arkiveringsDato: '2024-04-01',
        status: 'avvik',
        kategori: 'Brann',
        dokumenter: 15,
        årsak: 'Manuell arkivering - tiltak implementert',
        oppbevaringsPeriode: '10 år',
        kanSlettes: false,
        tags: ['brann', 'sikkerhet', 'lokaler'],
        størrelse: '7.2 MB'
      }
    ];
  }

  private hentMockArkivStatistikk(): ArkivStatistikk {
    return {
      totaltArkiverte: 156,
      godkjente: 98,
      avvik: 42,
      kritiske: 16,
      totalStørrelse: '2.8 GB'
    };
  }
}

export const arkivService = new ArkivService(); 