import api from '../lib/api';

// Interfaces
export interface DokumentKategori {
  id: string;
  navn: string;
  beskrivelse: string;
  ikon: string;
  farge: string;
  antallDokumenter: number;
  påkrevd: boolean;
  sortering: number;
}

export interface Dokument {
  id: string;
  navn: string;
  type: string;
  størrelse: string;
  kategoriId: string;
  kategori: string;
  status: 'GODKJENT' | 'VENTER' | 'AVVIST' | 'UTLØPT';
  lastetOpp: string;
  utløper?: string;
  lastetOppAv: string;
  godkjentAv?: string;
  godkjentDato?: string;
  kommentarer?: string;
  url: string;
  versjon: number;
  erAktiv: boolean;
}

export interface DokumentFilters {
  kategori?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

class DokumenterService {
  // Hent alle kategorier
  async hentKategorier(): Promise<DokumentKategori[]> {
    const response = await api.get('/dokumenter/kategorier');
    return response.data;
  }

  // Hent dokumenter for en elev
  async hentElevDokumenter(elevId: string, filters?: DokumentFilters): Promise<Dokument[]> {
    const params = new URLSearchParams();
    if (filters?.kategori) params.append('kategori', filters.kategori);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get(`/elever/${elevId}/dokumenter?${params.toString()}`);
    return response.data;
  }

  // Last opp nytt dokument
  async lastOppDokument(elevId: string, file: File, kategoriId: string): Promise<Dokument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kategoriId', kategoriId);

    const response = await api.post(`/elever/${elevId}/dokumenter`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Godkjenn dokument
  async godkjennDokument(dokumentId: string, kommentar?: string): Promise<void> {
    await api.put(`/dokumenter/${dokumentId}/godkjenn`, { kommentar });
  }

  // Avvis dokument
  async avvisDokument(dokumentId: string, kommentar: string): Promise<void> {
    await api.put(`/dokumenter/${dokumentId}/avvis`, { kommentar });
  }

  // Slett dokument
  async slettDokument(dokumentId: string): Promise<void> {
    await api.delete(`/dokumenter/${dokumentId}`);
  }

  // Mock data for utvikling
  async hentMockData(): Promise<{
    kategorier: DokumentKategori[];
    dokumenter: Dokument[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const kategorier: DokumentKategori[] = [
      {
        id: '1',
        navn: 'Identifikasjon',
        beskrivelse: 'Pass, førerkort, ID-kort',
        ikon: 'FiUser',
        farge: 'blue',
        antallDokumenter: 3,
        påkrevd: true,
        sortering: 1
      },
      {
        id: '2',
        navn: 'Helseattest',
        beskrivelse: 'Legeerklæring og helseattest',
        ikon: 'FiHeart',
        farge: 'green',
        antallDokumenter: 2,
        påkrevd: true,
        sortering: 2
      },
      {
        id: '3',
        navn: 'Kursbevis',
        beskrivelse: 'Bevis for gjennomførte kurs',
        ikon: 'FiAward',
        farge: 'yellow',
        antallDokumenter: 4,
        påkrevd: false,
        sortering: 3
      },
      {
        id: '4',
        navn: 'Kontrakter',
        beskrivelse: 'Signerte kontrakter og avtaler',
        ikon: 'FiFileText',
        farge: 'purple',
        antallDokumenter: 2,
        påkrevd: true,
        sortering: 4
      }
    ];

    const dokumenter: Dokument[] = [
      {
        id: '1',
        navn: 'Pass - Magnus Carlsen.pdf',
        type: 'PDF',
        størrelse: '2.3 MB',
        kategoriId: '1',
        kategori: 'Identifikasjon',
        status: 'GODKJENT',
        lastetOpp: '2025-01-15T10:30:00Z',
        utløper: '2030-01-15T00:00:00Z',
        lastetOppAv: 'Magnus Carlsen',
        godkjentAv: 'Ole Hansen',
        godkjentDato: '2025-01-16T09:15:00Z',
        url: '/api/dokumenter/1/download',
        versjon: 1,
        erAktiv: true
      },
      {
        id: '2',
        navn: 'Helseattest 2025.pdf',
        type: 'PDF',
        størrelse: '1.8 MB',
        kategoriId: '2',
        kategori: 'Helseattest',
        status: 'VENTER',
        lastetOpp: '2025-06-10T14:20:00Z',
        utløper: '2026-06-10T00:00:00Z',
        lastetOppAv: 'Magnus Carlsen',
        url: '/api/dokumenter/2/download',
        versjon: 1,
        erAktiv: true
      },
      {
        id: '3',
        navn: 'Førstehjelp kursbevis.jpg',
        type: 'JPG',
        størrelse: '3.1 MB',
        kategoriId: '3',
        kategori: 'Kursbevis',
        status: 'GODKJENT',
        lastetOpp: '2025-02-20T11:45:00Z',
        lastetOppAv: 'Magnus Carlsen',
        godkjentAv: 'Anne Olsen',
        godkjentDato: '2025-02-21T08:30:00Z',
        url: '/api/dokumenter/3/download',
        versjon: 1,
        erAktiv: true
      },
      {
        id: '4',
        navn: 'Kjøreopplæring kontrakt.pdf',
        type: 'PDF',
        størrelse: '1.2 MB',
        kategoriId: '4',
        kategori: 'Kontrakter',
        status: 'GODKJENT',
        lastetOpp: '2025-01-10T16:00:00Z',
        lastetOppAv: 'Ole Hansen',
        godkjentAv: 'Ole Hansen',
        godkjentDato: '2025-01-10T16:05:00Z',
        url: '/api/dokumenter/4/download',
        versjon: 1,
        erAktiv: true
      },
      {
        id: '5',
        navn: 'Gammel helseattest.pdf',
        type: 'PDF',
        størrelse: '1.5 MB',
        kategoriId: '2',
        kategori: 'Helseattest',
        status: 'UTLØPT',
        lastetOpp: '2024-06-10T14:20:00Z',
        utløper: '2025-06-10T00:00:00Z',
        lastetOppAv: 'Magnus Carlsen',
        godkjentAv: 'Ole Hansen',
        godkjentDato: '2024-06-11T09:00:00Z',
        url: '/api/dokumenter/5/download',
        versjon: 1,
        erAktiv: false
      }
    ];

    return { kategorier, dokumenter };
  }
}

export const dokumenterService = new DokumenterService();
export default dokumenterService; 