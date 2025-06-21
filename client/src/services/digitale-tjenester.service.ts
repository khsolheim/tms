import api from '../lib/api';

export interface QrKode {
  id: string;
  navn: string;
  type: 'url' | 'tekst' | 'wifi' | 'kontakt' | 'sms' | 'email';
  innhold: string;
  opprettet: string;
  sistBrukt?: string;
  antallSkann: number;
  aktiv: boolean;
  utløpsdato?: string;
  beskrivelse?: string;
}

export interface QrStatistikk {
  totaleKoder: number;
  aktiveKoder: number;
  totalSkann: number;
  skannIdag: number;
  populæresteType: string;
  gjennomsnittligBruk: number;
}

export interface PdfMal {
  id: string;
  navn: string;
  type: 'sertifikat' | 'faktura' | 'rapport' | 'kontrakt' | 'bevis';
  beskrivelse: string;
  opprettet: string;
  sistEndret: string;
  aktiv: boolean;
  felter: PdfFelt[];
  forhåndsvisning?: string;
}

export interface PdfFelt {
  id: string;
  navn: string;
  type: 'tekst' | 'nummer' | 'dato' | 'bilde' | 'signatur';
  påkrevd: boolean;
  standardverdi?: string;
  validering?: string;
}

export interface PdfDokument {
  id: string;
  malId: string;
  malNavn: string;
  filnavn: string;
  opprettet: string;
  størrelse: string;
  status: 'generert' | 'sendt' | 'arkivert';
  mottaker?: string;
  nedlastinger: number;
}

export interface PdfStatistikk {
  totaleDokumenter: number;
  genererteIdag: number;
  populæresteMal: string;
  totalStørrelse: string;
  gjennomsnittligGenerering: string;
}

class DigitaleTjenesterService {
  // QR-kode metoder
  async hentQrKoder(): Promise<QrKode[]> {
    try {
      const response = await api.get('/digitale-tjenester/qr-koder');
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av QR-koder:', error);
      return this.hentMockQrKoder();
    }
  }

  async opprettQrKode(qrKode: Omit<QrKode, 'id' | 'opprettet' | 'antallSkann'>): Promise<QrKode> {
    try {
      const response = await api.post('/digitale-tjenester/qr-koder', qrKode);
      return response.data;
    } catch (error) {
      console.error('Feil ved opprettelse av QR-kode:', error);
      throw error;
    }
  }

  async oppdaterQrKode(qrId: string, qrKode: Partial<QrKode>): Promise<QrKode> {
    try {
      const response = await api.put(`/digitale-tjenester/qr-koder/${qrId}`, qrKode);
      return response.data;
    } catch (error) {
      console.error('Feil ved oppdatering av QR-kode:', error);
      throw error;
    }
  }

  async slettQrKode(qrId: string): Promise<void> {
    try {
      await api.delete(`/digitale-tjenester/qr-koder/${qrId}`);
    } catch (error) {
      console.error('Feil ved sletting av QR-kode:', error);
      throw error;
    }
  }

  async hentQrStatistikk(): Promise<QrStatistikk> {
    try {
      const response = await api.get('/digitale-tjenester/qr-koder/statistikk');
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av QR-statistikk:', error);
      return this.hentMockQrStatistikk();
    }
  }

  // PDF metoder
  async hentPdfMaler(): Promise<PdfMal[]> {
    try {
      const response = await api.get('/digitale-tjenester/pdf-maler');
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av PDF-maler:', error);
      return this.hentMockPdfMaler();
    }
  }

  async opprettPdfMal(mal: Omit<PdfMal, 'id' | 'opprettet' | 'sistEndret'>): Promise<PdfMal> {
    try {
      const response = await api.post('/digitale-tjenester/pdf-maler', mal);
      return response.data;
    } catch (error) {
      console.error('Feil ved opprettelse av PDF-mal:', error);
      throw error;
    }
  }

  async genererPdf(malId: string, data: Record<string, any>): Promise<PdfDokument> {
    try {
      const response = await api.post(`/digitale-tjenester/pdf-maler/${malId}/generer`, data);
      return response.data;
    } catch (error) {
      console.error('Feil ved generering av PDF:', error);
      throw error;
    }
  }

  async hentPdfDokumenter(): Promise<PdfDokument[]> {
    try {
      const response = await api.get('/digitale-tjenester/pdf-dokumenter');
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av PDF-dokumenter:', error);
      return this.hentMockPdfDokumenter();
    }
  }

  async hentPdfStatistikk(): Promise<PdfStatistikk> {
    try {
      const response = await api.get('/digitale-tjenester/pdf-dokumenter/statistikk');
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av PDF-statistikk:', error);
      return this.hentMockPdfStatistikk();
    }
  }

  async lastNedPdf(dokumentId: string): Promise<Blob> {
    try {
      const response = await api.get(`/digitale-tjenester/pdf-dokumenter/${dokumentId}/last-ned`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Feil ved nedlasting av PDF:', error);
      throw error;
    }
  }

  // Mock data metoder
  private hentMockQrKoder(): QrKode[] {
    return [
      {
        id: 'qr-1',
        navn: 'Trafikkskole hjemmeside',
        type: 'url',
        innhold: 'https://www.oslotrafikkskole.no',
        opprettet: '2024-01-15T10:00:00Z',
        sistBrukt: '2024-06-15T14:30:00Z',
        antallSkann: 247,
        aktiv: true,
        beskrivelse: 'QR-kode for enkel tilgang til hjemmesiden'
      },
      {
        id: 'qr-2',
        navn: 'WiFi Venterom',
        type: 'wifi',
        innhold: 'WIFI:T:WPA;S:TrafikkskoleWiFi;P:sikkerhet123;H:false;',
        opprettet: '2024-02-01T09:00:00Z',
        sistBrukt: '2024-06-15T11:20:00Z',
        antallSkann: 89,
        aktiv: true,
        beskrivelse: 'WiFi-tilgang for elever i venterommet'
      },
      {
        id: 'qr-3',
        navn: 'Kontakt instruktør',
        type: 'kontakt',
        innhold: 'BEGIN:VCARD\nVERSION:3.0\nFN:Lars Hansen\nTEL:+4798765432\nEMAIL:lars@trafikkskole.no\nEND:VCARD',
        opprettet: '2024-03-10T15:30:00Z',
        sistBrukt: '2024-06-14T16:45:00Z',
        antallSkann: 34,
        aktiv: true,
        beskrivelse: 'Kontaktinfo til hovedinstruktør'
      },
      {
        id: 'qr-4',
        navn: 'Teoriprøve booking',
        type: 'url',
        innhold: 'https://booking.trafikkskole.no/teori',
        opprettet: '2024-04-05T12:00:00Z',
        sistBrukt: '2024-06-13T09:15:00Z',
        antallSkann: 156,
        aktiv: true,
        utløpsdato: '2024-12-31T23:59:59Z',
        beskrivelse: 'Direkte link til teoriprøve booking'
      }
    ];
  }

  private hentMockQrStatistikk(): QrStatistikk {
    return {
      totaleKoder: 12,
      aktiveKoder: 10,
      totalSkann: 1247,
      skannIdag: 23,
      populæresteType: 'url',
      gjennomsnittligBruk: 103.9
    };
  }

  private hentMockPdfMaler(): PdfMal[] {
    return [
      {
        id: 'mal-1',
        navn: 'Kjøresertifikat',
        type: 'sertifikat',
        beskrivelse: 'Mal for utstedelse av kjøresertifikat etter bestått prøve',
        opprettet: '2024-01-10T10:00:00Z',
        sistEndret: '2024-05-15T14:30:00Z',
        aktiv: true,
        felter: [
          { id: 'navn', navn: 'Fullt navn', type: 'tekst', påkrevd: true },
          { id: 'fødselsdato', navn: 'Fødselsdato', type: 'dato', påkrevd: true },
          { id: 'prøvedato', navn: 'Prøvedato', type: 'dato', påkrevd: true },
          { id: 'klasse', navn: 'Førerkortklasse', type: 'tekst', påkrevd: true, standardverdi: 'B' }
        ]
      },
      {
        id: 'mal-2',
        navn: 'Faktura',
        type: 'faktura',
        beskrivelse: 'Standard faktura for kjøretimer og kurs',
        opprettet: '2024-01-15T11:00:00Z',
        sistEndret: '2024-06-01T09:20:00Z',
        aktiv: true,
        felter: [
          { id: 'kundenavn', navn: 'Kundenavn', type: 'tekst', påkrevd: true },
          { id: 'adresse', navn: 'Adresse', type: 'tekst', påkrevd: true },
          { id: 'beløp', navn: 'Beløp', type: 'nummer', påkrevd: true },
          { id: 'forfallsdato', navn: 'Forfallsdato', type: 'dato', påkrevd: true }
        ]
      },
      {
        id: 'mal-3',
        navn: 'Fremgangsrapport',
        type: 'rapport',
        beskrivelse: 'Månedlig fremgangsrapport for elever',
        opprettet: '2024-02-01T08:00:00Z',
        sistEndret: '2024-04-20T16:45:00Z',
        aktiv: true,
        felter: [
          { id: 'elevnavn', navn: 'Elevnavn', type: 'tekst', påkrevd: true },
          { id: 'periode', navn: 'Periode', type: 'tekst', påkrevd: true },
          { id: 'timer', navn: 'Antall timer', type: 'nummer', påkrevd: true },
          { id: 'fremgang', navn: 'Fremgangsbeskrivelse', type: 'tekst', påkrevd: true }
        ]
      }
    ];
  }

  private hentMockPdfDokumenter(): PdfDokument[] {
    return [
      {
        id: 'dok-1',
        malId: 'mal-1',
        malNavn: 'Kjøresertifikat',
        filnavn: 'sertifikat_ola_nordmann_2024.pdf',
        opprettet: '2024-06-15T10:30:00Z',
        størrelse: '245 KB',
        status: 'sendt',
        mottaker: 'ola.nordmann@email.com',
        nedlastinger: 3
      },
      {
        id: 'dok-2',
        malId: 'mal-2',
        malNavn: 'Faktura',
        filnavn: 'faktura_2024_001234.pdf',
        opprettet: '2024-06-14T14:15:00Z',
        størrelse: '189 KB',
        status: 'generert',
        nedlastinger: 1
      },
      {
        id: 'dok-3',
        malId: 'mal-3',
        malNavn: 'Fremgangsrapport',
        filnavn: 'rapport_kari_hansen_juni_2024.pdf',
        opprettet: '2024-06-13T16:20:00Z',
        størrelse: '312 KB',
        status: 'arkivert',
        mottaker: 'kari.hansen@email.com',
        nedlastinger: 5
      }
    ];
  }

  private hentMockPdfStatistikk(): PdfStatistikk {
    return {
      totaleDokumenter: 1247,
      genererteIdag: 8,
      populæresteMal: 'Faktura',
      totalStørrelse: '2.8 GB',
      gjennomsnittligGenerering: '1.2 sek'
    };
  }
}

export const digitaleTjenesterService = new DigitaleTjenesterService(); 