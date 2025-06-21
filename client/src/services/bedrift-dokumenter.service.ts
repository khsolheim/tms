import api from '../lib/api';

export interface BedriftDokument {
  id: string;
  navn: string;
  type: 'PDF' | 'DOCX' | 'XLSX' | 'PNG' | 'JPG' | 'TXT';
  kategori: 'REGISTRERING' | 'FORSIKRING' | 'KONTRAKT' | 'HMS' | 'REGNSKAP' | 'UTDANNING' | 'ANNET';
  størrelse: string;
  opplastet: string;
  opplastetAv: string;
  beskrivelse: string;
  tags: string[];
  status: 'GODKJENT' | 'AKTIV' | 'UNDER_REVIEW' | 'ARKIVERT' | 'AVVIST';
  sisteEndring: string;
  versjon: string;
  url?: string;
  bedriftId: string;
}

export interface DokumentStatistikk {
  totalt: number;
  godkjente: number;
  underReview: number;
  arkiverte: number;
  totalStørrelse: string;
  kategorier: Record<string, number>;
}

export interface DokumentFilter {
  kategori?: string;
  status?: string;
  type?: string;
  datoFra?: string;
  datoTil?: string;
  tags?: string[];
}

class BedriftDokumenterService {
  async hentDokumenter(bedriftId: string, filter?: DokumentFilter): Promise<BedriftDokument[]> {
    try {
      const response = await api.get(`/bedrifter/${bedriftId}/dokumenter`, { params: filter });
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av dokumenter:', error);
      return this.hentMockDokumenter(bedriftId);
    }
  }

  async hentDokument(bedriftId: string, dokumentId: string): Promise<BedriftDokument | null> {
    try {
      const response = await api.get(`/bedrifter/${bedriftId}/dokumenter/${dokumentId}`);
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av dokument:', error);
      return this.hentMockDokumenter(bedriftId).find(d => d.id === dokumentId) || null;
    }
  }

  async lastOppDokument(bedriftId: string, fil: File, metadata: Partial<BedriftDokument>): Promise<BedriftDokument> {
    try {
      const formData = new FormData();
      formData.append('fil', fil);
      formData.append('metadata', JSON.stringify(metadata));
      
      const response = await api.post(`/bedrifter/${bedriftId}/dokumenter`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Feil ved opplasting av dokument:', error);
      throw error;
    }
  }

  async oppdaterDokument(bedriftId: string, dokumentId: string, oppdateringer: Partial<BedriftDokument>): Promise<BedriftDokument> {
    try {
      const response = await api.patch(`/bedrifter/${bedriftId}/dokumenter/${dokumentId}`, oppdateringer);
      return response.data;
    } catch (error) {
      console.error('Feil ved oppdatering av dokument:', error);
      throw error;
    }
  }

  async slettDokument(bedriftId: string, dokumentId: string): Promise<void> {
    try {
      await api.delete(`/bedrifter/${bedriftId}/dokumenter/${dokumentId}`);
    } catch (error) {
      console.error('Feil ved sletting av dokument:', error);
      throw error;
    }
  }

  async hentDokumentStatistikk(bedriftId: string): Promise<DokumentStatistikk> {
    try {
      const response = await api.get(`/bedrifter/${bedriftId}/dokumenter/statistikk`);
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av dokumentstatistikk:', error);
      return this.hentMockStatistikk();
    }
  }

  async lastNedDokument(bedriftId: string, dokumentId: string): Promise<Blob> {
    try {
      const response = await api.get(`/bedrifter/${bedriftId}/dokumenter/${dokumentId}/last-ned`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Feil ved nedlasting av dokument:', error);
      throw error;
    }
  }

  private hentMockDokumenter(bedriftId: string): BedriftDokument[] {
    return [
      {
        id: 'DOK001',
        navn: 'Bedrift Registreringsdokument.pdf',
        type: 'PDF',
        kategori: 'REGISTRERING',
        størrelse: '2.4 MB',
        opplastet: '2025-01-15',
        opplastetAv: 'System Administrator',
        beskrivelse: 'Offisielt registreringsdokument fra Brønnøysundregistrene',
        tags: ['registrering', 'offisiell', 'brreg'],
        status: 'GODKJENT',
        sisteEndring: '2025-01-15',
        versjon: '1.0',
        bedriftId
      },
      {
        id: 'DOK002', 
        navn: 'Forsikringsbevis Kjøretøy 2025.pdf',
        type: 'PDF',
        kategori: 'FORSIKRING',
        størrelse: '1.8 MB',
        opplastet: '2025-02-01',
        opplastetAv: 'Kari Nordmann',
        beskrivelse: 'Forsikringsbevis for alle kjøretøy i flåten',
        tags: ['forsikring', 'kjøretøy', '2025'],
        status: 'GODKJENT',
        sisteEndring: '2025-02-01',
        versjon: '1.0',
        bedriftId
      },
      {
        id: 'DOK003',
        navn: 'Kontrakt Template Standard.docx',
        type: 'DOCX',
        kategori: 'KONTRAKT',
        størrelse: '456 KB',
        opplastet: '2025-01-20',
        opplastetAv: 'Ole Hansen',
        beskrivelse: 'Standard kontraktsmal for nye elever',
        tags: ['kontrakt', 'template', 'standard'],
        status: 'AKTIV',
        sisteEndring: '2025-03-10',
        versjon: '2.1',
        bedriftId
      },
      {
        id: 'DOK004',
        navn: 'HMS Prosedyrer 2025.pdf',
        type: 'PDF',
        kategori: 'HMS',
        størrelse: '5.2 MB',
        opplastet: '2025-01-05',
        opplastetAv: 'Inger Sikkerhetsansvarlig',
        beskrivelse: 'Oppdaterte HMS-prosedyrer og sikkerhetsprosedyrer',
        tags: ['hms', 'sikkerhet', 'prosedyrer'],
        status: 'GODKJENT',
        sisteEndring: '2025-01-05',
        versjon: '3.0',
        bedriftId
      },
      {
        id: 'DOK005',
        navn: 'Regnskapsrapport Q1 2025.xlsx',
        type: 'XLSX',
        kategori: 'REGNSKAP',
        størrelse: '890 KB',
        opplastet: '2025-04-15',
        opplastetAv: 'Regnskapsfører AS',
        beskrivelse: 'Kvartalsrapport for første kvartal 2025',
        tags: ['regnskap', 'q1', '2025', 'kvartalsrapport'],
        status: 'UNDER_REVIEW',
        sisteEndring: '2025-04-15',
        versjon: '1.0',
        bedriftId
      },
      {
        id: 'DOK006',
        navn: 'Elevhåndbok 2025.pdf',
        type: 'PDF',
        kategori: 'UTDANNING',
        størrelse: '3.1 MB',
        opplastet: '2024-12-20',
        opplastetAv: 'Lære Team',
        beskrivelse: 'Oppdatert elevhåndbok med alle regler og prosedyrer',
        tags: ['elevhåndbok', 'utdanning', 'regler'],
        status: 'ARKIVERT',
        sisteEndring: '2024-12-20',
        versjon: '4.2',
        bedriftId
      }
    ];
  }

  private hentMockStatistikk(): DokumentStatistikk {
    return {
      totalt: 6,
      godkjente: 3,
      underReview: 1,
      arkiverte: 1,
      totalStørrelse: '13.7 MB',
      kategorier: {
        'REGISTRERING': 1,
        'FORSIKRING': 1,
        'KONTRAKT': 1,
        'HMS': 1,
        'REGNSKAP': 1,
        'UTDANNING': 1
      }
    };
  }
}

export const bedriftDokumenterService = new BedriftDokumenterService(); 