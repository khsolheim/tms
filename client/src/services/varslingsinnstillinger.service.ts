import api from '../lib/api';

export interface VarslingInnstilling {
  navn: string;
  epost: boolean;
  sms: boolean;
}

export interface VarslingKategori {
  navn: string;
  beskrivelse: string;
  ikon: string;
  innstillinger: {
    [key: string]: VarslingInnstilling;
  };
}

export interface VarslingsinnstillingerData {
  innstillinger: { [key: string]: { epost: boolean; sms: boolean } };
  epostAktiv: boolean;
  smsAktiv: boolean;
  daglingSammendrag: boolean;
  umiddelbareVarsler: boolean;
}

export interface VarslingsinnstillingerResponse {
  success: boolean;
  data: VarslingsinnstillingerData;
}

class VarslingsinnstillingerService {
  async hentInnstillinger(): Promise<VarslingsinnstillingerData> {
    try {
      const response = await api.get('/notification-settings');
      return response.data;
    } catch (error) {
      // Returner standardverdier hvis ingen innstillinger finnes
      return {
        innstillinger: {},
        epostAktiv: true,
        smsAktiv: false,
        daglingSammendrag: true,
        umiddelbareVarsler: true
      };
    }
  }

  async lagreInnstillinger(data: VarslingsinnstillingerData): Promise<void> {
    const response = await api.put('/notification-settings', data);
    return response.data;
  }

  async hentVarslingKategorier(): Promise<VarslingKategori[]> {
    try {
      const response = await api.get('/notification-categories');
      return response.data;
    } catch (error) {
      // Returner standardkategorier hvis API ikke er tilgjengelig
      return this.getStandardKategorier();
    }
  }

  private getStandardKategorier(): VarslingKategori[] {
    return [
      {
        navn: 'Kontrakter',
        beskrivelse: 'Varsler relatert til kontrakter og avtaler',
        ikon: 'FiCheckCircle',
        innstillinger: {
          nyKontrakt: { navn: 'Ny kontrakt opprettet', epost: true, sms: false },
          kontraktGodkjent: { navn: 'Kontrakt godkjent', epost: true, sms: true },
          kontraktAvvist: { navn: 'Kontrakt avvist', epost: true, sms: true },
          kontraktUtloper: { navn: 'Kontrakt utløper snart', epost: true, sms: false },
          betalingForfall: { navn: 'Betaling forfaller', epost: true, sms: true }
        }
      },
      {
        navn: 'Sikkerhetskontroller',
        beskrivelse: 'Varsler om sikkerhetskontroller og avvik',
        ikon: 'FiAlertTriangle',
        innstillinger: {
          nyKontroll: { navn: 'Ny kontroll tildelt', epost: true, sms: false },
          kontrollFullfort: { navn: 'Kontroll fullført', epost: true, sms: false },
          avvikRegistrert: { navn: 'Avvik registrert', epost: true, sms: true },
          avvikLukket: { navn: 'Avvik lukket', epost: true, sms: false },
          kontrollForfall: { navn: 'Kontroll forfaller snart', epost: true, sms: true }
        }
      },
      {
        navn: 'Ressursplanlegging',
        beskrivelse: 'Varsler om bookinger og ressurser',
        ikon: 'FiCalendar',
        innstillinger: {
          nyBooking: { navn: 'Ny booking', epost: true, sms: false },
          bookingEndret: { navn: 'Booking endret', epost: true, sms: false },
          bookingAvlyst: { navn: 'Booking avlyst', epost: true, sms: true },
          ressursTilgjengelig: { navn: 'Ressurs tilgjengelig', epost: true, sms: false }
        }
      }
    ];
  }

  async testVarsling(type: 'epost' | 'sms', melding: string): Promise<void> {
    const response = await api.post('/notification-test', { type, melding });
    return response.data;
  }

  async hentVarslingHistorikk(limit: number = 50): Promise<any[]> {
    try {
      const response = await api.get(`/notification-history?limit=${limit}`);
      return response.data;
    } catch (error) {
      return [];
    }
  }
}

export default new VarslingsinnstillingerService(); 