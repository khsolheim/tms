import api from '../lib/api';

export interface Kunde {
  id: number;
  navn: string;
  epost: string;
  telefon: string;
  adresse?: string;
  postnummer?: string;
  poststed?: string;
  organisasjonsnummer?: string;
  kontaktperson?: string;
  notater?: string;
  opprettet: string;
  oppdatert: string;
  status: 'aktiv' | 'inaktiv' | 'suspendert';
}

export interface KundeOpprettData {
  navn: string;
  epost: string;
  telefon: string;
  adresse?: string;
  postnummer?: string;
  poststed?: string;
  organisasjonsnummer?: string;
  kontaktperson?: string;
  notater?: string;
}

export interface KundeFilter {
  sok?: string;
  status?: 'aktiv' | 'inaktiv' | 'suspendert';
  side?: number;
  antallPerSide?: number;
}

export interface KundeListeResponse {
  kunder: Kunde[];
  totalt: number;
  side: number;
  antallPerSide: number;
  totaltSider: number;
}

class KundeService {
  async hentKunder(filter?: KundeFilter): Promise<KundeListeResponse> {
    try {
      const params = new URLSearchParams();
      if (filter?.sok) params.append('sok', filter.sok);
      if (filter?.status) params.append('status', filter.status);
      if (filter?.side) params.append('side', filter.side.toString());
      if (filter?.antallPerSide) params.append('antallPerSide', filter.antallPerSide.toString());

      const response = await api.get(`/kunder?${params.toString()}`);
      return response.data;
    } catch (error) {
      // Returner standarddata hvis API ikke er tilgjengelig
      return this.getStandardKundeData(filter);
    }
  }

  async hentKunde(id: number): Promise<Kunde> {
    try {
      const response = await api.get(`/kunder/${id}`);
      return response.data;
    } catch (error) {
      // Returner dummy data hvis API ikke er tilgjengelig
      return this.getStandardKundeData().kunder.find(k => k.id === id) || this.getStandardKundeData().kunder[0];
    }
  }

  async opprettKunde(kundeData: KundeOpprettData): Promise<Kunde> {
    const response = await api.post('/kunder', kundeData);
    return response.data;
  }

  async oppdaterKunde(id: number, kundeData: Partial<KundeOpprettData>): Promise<Kunde> {
    const response = await api.put(`/kunder/${id}`, kundeData);
    return response.data;
  }

  async slettKunde(id: number): Promise<void> {
    await api.delete(`/kunder/${id}`);
  }

  async sokKunder(sokeTerm: string): Promise<Kunde[]> {
    try {
      const response = await api.get(`/kunder/sok?q=${encodeURIComponent(sokeTerm)}`);
      return response.data;
    } catch (error) {
      // Filtrer standarddata hvis API ikke er tilgjengelig
      const standardData = this.getStandardKundeData();
      return standardData.kunder.filter(kunde => 
        kunde.navn.toLowerCase().includes(sokeTerm.toLowerCase()) ||
        kunde.epost.toLowerCase().includes(sokeTerm.toLowerCase()) ||
        kunde.telefon.includes(sokeTerm)
      );
    }
  }

  async hentKundeStatistikk(): Promise<any> {
    try {
      const response = await api.get('/kunder/statistikk');
      return response.data;
    } catch (error) {
      return {
        totaltAktive: 2,
        totaltInaktive: 0,
        nytteDenneManeden: 1,
        gjennomsnittligVerdi: 15000
      };
    }
  }

  async eksporterKunder(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await api.get(`/kunder/eksport?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  private getStandardKundeData(filter?: KundeFilter): KundeListeResponse {
    const alleKunder: Kunde[] = [
      {
        id: 1,
        navn: 'Ola Nordmann',
        epost: 'ola@eksempel.no',
        telefon: '12345678',
        adresse: 'Storgata 1',
        postnummer: '0001',
        poststed: 'Oslo',
        organisasjonsnummer: '123456789',
        kontaktperson: 'Ola Nordmann',
        notater: 'Viktig kunde',
        opprettet: '2024-01-15T10:00:00Z',
        oppdatert: '2024-01-15T10:00:00Z',
        status: 'aktiv'
      },
      {
        id: 2,
        navn: 'Kari Nordmann',
        epost: 'kari@eksempel.no',
        telefon: '87654321',
        adresse: 'Lillegata 2',
        postnummer: '0002',
        poststed: 'Bergen',
        organisasjonsnummer: '987654321',
        kontaktperson: 'Kari Nordmann',
        notater: 'Ny kunde',
        opprettet: '2024-02-01T14:30:00Z',
        oppdatert: '2024-02-01T14:30:00Z',
        status: 'aktiv'
      },
      {
        id: 3,
        navn: 'Acme Corporation',
        epost: 'kontakt@acme.no',
        telefon: '55555555',
        adresse: 'Bedriftsgata 10',
        postnummer: '0010',
        poststed: 'Trondheim',
        organisasjonsnummer: '555666777',
        kontaktperson: 'Per Hansen',
        notater: 'Stor bedriftskunde',
        opprettet: '2024-01-10T09:00:00Z',
        oppdatert: '2024-01-10T09:00:00Z',
        status: 'aktiv'
      }
    ];

    let filtrertKunder = alleKunder;

    // Filtrer basert på søk
    if (filter?.sok) {
      const sokeTerm = filter.sok.toLowerCase();
      filtrertKunder = filtrertKunder.filter(kunde =>
        kunde.navn.toLowerCase().includes(sokeTerm) ||
        kunde.epost.toLowerCase().includes(sokeTerm) ||
        kunde.telefon.includes(sokeTerm)
      );
    }

    // Filtrer basert på status
    if (filter?.status) {
      filtrertKunder = filtrertKunder.filter(kunde => kunde.status === filter.status);
    }

    // Paginering
    const side = filter?.side || 1;
    const antallPerSide = filter?.antallPerSide || 10;
    const startIndex = (side - 1) * antallPerSide;
    const endIndex = startIndex + antallPerSide;
    const paginertKunder = filtrertKunder.slice(startIndex, endIndex);

    return {
      kunder: paginertKunder,
      totalt: filtrertKunder.length,
      side,
      antallPerSide,
      totaltSider: Math.ceil(filtrertKunder.length / antallPerSide)
    };
  }
}

export default new KundeService(); 