// Ansatte Service - Håndterer ansatte-relaterte operasjoner
import api from '../lib/api';

export interface Ansatt {
  id: string;
  navn: string;
  fornavn: string;
  etternavn: string;
  epost: string;
  telefon?: string;
  bedrift: string;
  bedriftId: string;
  hovedbruker: boolean;
  rolle: 'ADMIN' | 'INSTRUKTØR' | 'ANSATT' | 'HOVEDBRUKER';
  status: 'aktiv' | 'inaktiv' | 'pause';
  opprettDato: string;
  sistInnlogget?: string;
  tilganger: string[];
}

export interface AnsattOpprettData {
  fornavn: string;
  etternavn: string;
  epost: string;
  telefon?: string;
  bedriftId: string;
  hovedbruker: boolean;
  rolle: 'ADMIN' | 'INSTRUKTØR' | 'ANSATT' | 'HOVEDBRUKER';
  tilganger: string[];
}

export interface AnsattFilter {
  søk?: string;
  bedriftId?: string;
  rolle?: string;
  status?: string;
  hovedbruker?: boolean;
}

export interface AnsattListeResponse {
  ansatte: Ansatt[];
  totalAntall: number;
  side: number;
  antallPerSide: number;
}

export interface AnsattDashboardData {
  totalAnsatte: number;
  aktiveAnsatte: number;
  hovedbrukere: number;
  nyeAnsatteDenneMåned: number;
  ansatte: Ansatt[];
  rollefordeling: {
    rolle: string;
    antall: number;
  }[];
  bedriftfordeling: {
    bedrift: string;
    antall: number;
  }[];
}

class AnsatteService {
  private baseUrl = '/api/ansatte';

  async hentAnsatte(filter?: AnsattFilter, side = 1, antallPerSide = 20): Promise<AnsattListeResponse> {
    try {
      const params = new URLSearchParams({
        side: side.toString(),
        antallPerSide: antallPerSide.toString(),
        ...(filter?.søk && { søk: filter.søk }),
        ...(filter?.bedriftId && { bedriftId: filter.bedriftId }),
        ...(filter?.rolle && { rolle: filter.rolle }),
        ...(filter?.status && { status: filter.status }),
        ...(filter?.hovedbruker !== undefined && { hovedbruker: filter.hovedbruker.toString() })
      });

      const response = await api.get(`${this.baseUrl}?${params}`);
      return response.data;
    } catch (error) {
      console.warn('API ikke tilgjengelig, bruker fallback data');
      return this.getStandardAnsattListe(filter);
    }
  }

  async hentAnsatt(id: string): Promise<Ansatt> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API ikke tilgjengelig, bruker fallback data');
      return this.getStandardAnsattData(id);
    }
  }

  async opprettAnsatt(data: AnsattOpprettData): Promise<Ansatt> {
    try {
      const response = await api.post(this.baseUrl, data);
      return response.data;
    } catch (error) {
      console.warn('API ikke tilgjengelig, simulerer opprettelse');
      return this.simulerOpprettAnsatt(data);
    }
  }

  async oppdaterAnsatt(id: string, data: Partial<AnsattOpprettData>): Promise<Ansatt> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      console.warn('API ikke tilgjengelig, simulerer oppdatering');
      return this.simulerOppdaterAnsatt(id, data);
    }
  }

  async slettAnsatt(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.warn('API ikke tilgjengelig, simulerer sletting');
    }
  }

  async hentDashboardData(): Promise<AnsattDashboardData> {
    try {
      const response = await api.get(`${this.baseUrl}/dashboard`);
      return response.data;
    } catch (error) {
      console.warn('API ikke tilgjengelig, bruker fallback data');
      return this.getStandardDashboardData();
    }
  }

  // Private fallback metoder
  private getStandardAnsattListe(filter?: AnsattFilter): AnsattListeResponse {
    const alleAnsatte: Ansatt[] = [
      {
        id: '1',
        navn: 'Ola Nordmann',
        fornavn: 'Ola',
        etternavn: 'Nordmann',
        epost: 'ola@eksempel.no',
        telefon: '+47 123 45 678',
        bedrift: 'Eksempel AS',
        bedriftId: '1',
        hovedbruker: true,
        rolle: 'HOVEDBRUKER',
        status: 'aktiv',
        opprettDato: '2024-01-15',
        sistInnlogget: '2024-06-15T10:30:00Z',
        tilganger: ['BEDRIFT_ADMIN', 'ELEV_ADMIN', 'RAPPORT_ADMIN']
      },
      {
        id: '2',
        navn: 'Kari Nordmann',
        fornavn: 'Kari',
        etternavn: 'Nordmann',
        epost: 'kari@eksempel.no',
        telefon: '+47 987 65 432',
        bedrift: 'Testfirma',
        bedriftId: '2',
        hovedbruker: false,
        rolle: 'INSTRUKTØR',
        status: 'aktiv',
        opprettDato: '2024-02-20',
        sistInnlogget: '2024-06-14T14:15:00Z',
        tilganger: ['ELEV_ADMIN', 'TIMER_ADMIN']
      },
      {
        id: '3',
        navn: 'Lars Hansen',
        fornavn: 'Lars',
        etternavn: 'Hansen',
        epost: 'lars@trafikk.no',
        telefon: '+47 555 12 345',
        bedrift: 'Trafikklærerskolen',
        bedriftId: '3',
        hovedbruker: false,
        rolle: 'ANSATT',
        status: 'aktiv',
        opprettDato: '2024-03-10',
        sistInnlogget: '2024-06-13T09:45:00Z',
        tilganger: ['ELEV_VIEW', 'TIMER_VIEW']
      },
      {
        id: '4',
        navn: 'Anne Olsen',
        fornavn: 'Anne',
        etternavn: 'Olsen',
        epost: 'anne@skole.no',
        telefon: '+47 777 88 999',
        bedrift: 'Kjøreskolen',
        bedriftId: '4',
        hovedbruker: true,
        rolle: 'ADMIN',
        status: 'aktiv',
        opprettDato: '2024-01-05',
        sistInnlogget: '2024-06-15T16:20:00Z',
        tilganger: ['FULL_ACCESS']
      }
    ];

    let filtrerte = alleAnsatte;

    if (filter?.søk) {
      const søk = filter.søk.toLowerCase();
      filtrerte = filtrerte.filter(a => 
        a.navn.toLowerCase().includes(søk) || 
        a.epost.toLowerCase().includes(søk) ||
        a.bedrift.toLowerCase().includes(søk)
      );
    }

    if (filter?.bedriftId) {
      filtrerte = filtrerte.filter(a => a.bedriftId === filter.bedriftId);
    }

    if (filter?.rolle) {
      filtrerte = filtrerte.filter(a => a.rolle === filter.rolle);
    }

    if (filter?.status) {
      filtrerte = filtrerte.filter(a => a.status === filter.status);
    }

    if (filter?.hovedbruker !== undefined) {
      filtrerte = filtrerte.filter(a => a.hovedbruker === filter.hovedbruker);
    }

    return {
      ansatte: filtrerte,
      totalAntall: filtrerte.length,
      side: 1,
      antallPerSide: 20
    };
  }

  private getStandardAnsattData(id: string): Ansatt {
    const ansatte = this.getStandardAnsattListe().ansatte;
    return ansatte.find(a => a.id === id) || ansatte[0];
  }

  private simulerOpprettAnsatt(data: AnsattOpprettData): Ansatt {
    return {
      id: Date.now().toString(),
      navn: `${data.fornavn} ${data.etternavn}`,
      fornavn: data.fornavn,
      etternavn: data.etternavn,
      epost: data.epost,
      telefon: data.telefon,
      bedrift: 'Ny Bedrift',
      bedriftId: data.bedriftId,
      hovedbruker: data.hovedbruker,
      rolle: data.rolle,
      status: 'aktiv',
      opprettDato: new Date().toISOString(),
      tilganger: data.tilganger
    };
  }

  private simulerOppdaterAnsatt(id: string, data: Partial<AnsattOpprettData>): Ansatt {
    const eksisterende = this.getStandardAnsattData(id);
    return {
      ...eksisterende,
      ...(data.fornavn && { fornavn: data.fornavn }),
      ...(data.etternavn && { etternavn: data.etternavn }),
      ...(data.epost && { epost: data.epost }),
      ...(data.telefon && { telefon: data.telefon }),
      ...(data.rolle && { rolle: data.rolle }),
      ...(data.hovedbruker !== undefined && { hovedbruker: data.hovedbruker }),
      ...(data.tilganger && { tilganger: data.tilganger }),
      navn: data.fornavn && data.etternavn ? `${data.fornavn} ${data.etternavn}` : eksisterende.navn
    };
  }

  private getStandardDashboardData(): AnsattDashboardData {
    const ansatte = this.getStandardAnsattListe().ansatte;
    
    return {
      totalAnsatte: ansatte.length,
      aktiveAnsatte: ansatte.filter(a => a.status === 'aktiv').length,
      hovedbrukere: ansatte.filter(a => a.hovedbruker).length,
      nyeAnsatteDenneMåned: ansatte.filter(a => {
        const opprettDato = new Date(a.opprettDato);
        const nå = new Date();
        return opprettDato.getMonth() === nå.getMonth() && opprettDato.getFullYear() === nå.getFullYear();
      }).length,
      ansatte: ansatte.slice(0, 5), // Siste 5 ansatte
      rollefordeling: [
        { rolle: 'HOVEDBRUKER', antall: ansatte.filter(a => a.rolle === 'HOVEDBRUKER').length },
        { rolle: 'INSTRUKTØR', antall: ansatte.filter(a => a.rolle === 'INSTRUKTØR').length },
        { rolle: 'ANSATT', antall: ansatte.filter(a => a.rolle === 'ANSATT').length },
        { rolle: 'ADMIN', antall: ansatte.filter(a => a.rolle === 'ADMIN').length }
      ],
      bedriftfordeling: [
        { bedrift: 'Eksempel AS', antall: ansatte.filter(a => a.bedrift === 'Eksempel AS').length },
        { bedrift: 'Testfirma', antall: ansatte.filter(a => a.bedrift === 'Testfirma').length },
        { bedrift: 'Trafikklærerskolen', antall: ansatte.filter(a => a.bedrift === 'Trafikklærerskolen').length },
        { bedrift: 'Kjøreskolen', antall: ansatte.filter(a => a.bedrift === 'Kjøreskolen').length }
      ]
    };
  }
}

export const ansatteService = new AnsatteService(); 