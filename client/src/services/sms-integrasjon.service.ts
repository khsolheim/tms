import api from '../lib/api';

export interface SmsProvider {
  id: string;
  navn: string;
  type: 'twilio' | 'sendgrid' | 'telenor' | 'telia' | 'ice';
  status: 'aktiv' | 'inaktiv' | 'feil';
  konfigurert: boolean;
  kostnadPerSms: number;
  månedligGrense: number;
  brukteDenneMåned: number;
  suksessrate: number;
  beskrivelse: string;
  logo?: string;
}

export interface SmsKonfigurasjon {
  providerId: string;
  apiKey: string;
  apiSecret?: string;
  senderId: string;
  testModus: boolean;
  maksAntallPerDag: number;
  aktiverLogging: boolean;
  webhook?: string;
}

export interface SmsStatistikk {
  totalSendt: number;
  sendtDenneMåned: number;
  suksessrate: number;
  feilrate: number;
  gjennomsnittligKostnad: number;
  totalKostnad: number;
  aktiveMottakere: number;
}

export interface SmsMelding {
  id: string;
  mottaker: string;
  innhold: string;
  sendt: string;
  status: 'sendt' | 'levert' | 'feil' | 'venter';
  kostnad: number;
  provider: string;
  type: 'varsel' | 'påminnelse' | 'bekreftelse' | 'markedsføring';
}

export interface SmsFilter {
  status?: string;
  provider?: string;
  type?: string;
  datoFra?: string;
  datoTil?: string;
}

class SmsIntegrasjonsService {
  async hentSmsProviders(): Promise<SmsProvider[]> {
    try {
      const response = await api.get('/integrasjoner/sms/providers');
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av SMS-providere:', error);
      return this.hentMockProviders();
    }
  }

  async konfigurerProvider(providerId: string, konfigurasjon: SmsKonfigurasjon): Promise<void> {
    try {
      await api.post(`/integrasjoner/sms/providers/${providerId}/konfigurer`, konfigurasjon);
    } catch (error) {
      console.error('Feil ved konfigurering av SMS-provider:', error);
      throw error;
    }
  }

  async testProvider(providerId: string, testMelding: string, testNummer: string): Promise<boolean> {
    try {
      const response = await api.post(`/integrasjoner/sms/providers/${providerId}/test`, {
        melding: testMelding,
        nummer: testNummer
      });
      return response.data.success;
    } catch (error) {
      console.error('Feil ved testing av SMS-provider:', error);
      return false;
    }
  }

  async hentSmsStatistikk(): Promise<SmsStatistikk> {
    try {
      const response = await api.get('/integrasjoner/sms/statistikk');
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av SMS-statistikk:', error);
      return this.hentMockStatistikk();
    }
  }

  async hentSmsMeldinger(filter?: SmsFilter): Promise<SmsMelding[]> {
    try {
      const response = await api.get('/integrasjoner/sms/meldinger', { params: filter });
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av SMS-meldinger:', error);
      return this.hentMockMeldinger();
    }
  }

  async sendSms(mottaker: string, innhold: string, type: string = 'varsel'): Promise<SmsMelding> {
    try {
      const response = await api.post('/integrasjoner/sms/send', {
        mottaker,
        innhold,
        type
      });
      return response.data;
    } catch (error) {
      console.error('Feil ved sending av SMS:', error);
      throw error;
    }
  }

  // Mock data metoder
  private hentMockProviders(): SmsProvider[] {
    return [
      {
        id: 'twilio',
        navn: 'Twilio',
        type: 'twilio',
        status: 'aktiv',
        konfigurert: true,
        kostnadPerSms: 0.85,
        månedligGrense: 1000,
        brukteDenneMåned: 234,
        suksessrate: 98.5,
        beskrivelse: 'Global SMS-tjeneste med høy leveringsrate',
        logo: '/logos/twilio.png'
      },
      {
        id: 'telenor',
        navn: 'Telenor SMS',
        type: 'telenor',
        status: 'inaktiv',
        konfigurert: false,
        kostnadPerSms: 0.75,
        månedligGrense: 2000,
        brukteDenneMåned: 0,
        suksessrate: 99.2,
        beskrivelse: 'Norsk SMS-tjeneste med god dekning',
        logo: '/logos/telenor.png'
      },
      {
        id: 'telia',
        navn: 'Telia SMS',
        type: 'telia',
        status: 'feil',
        konfigurert: true,
        kostnadPerSms: 0.80,
        månedligGrense: 1500,
        brukteDenneMåned: 156,
        suksessrate: 97.8,
        beskrivelse: 'Nordisk SMS-leverandør',
        logo: '/logos/telia.png'
      }
    ];
  }

  private hentMockStatistikk(): SmsStatistikk {
    return {
      totalSendt: 2847,
      sendtDenneMåned: 234,
      suksessrate: 98.5,
      feilrate: 1.5,
      gjennomsnittligKostnad: 0.82,
      totalKostnad: 2334.54,
      aktiveMottakere: 1247
    };
  }

  private hentMockMeldinger(): SmsMelding[] {
    return [
      {
        id: 'sms-1',
        mottaker: '+47 123 45 678',
        innhold: 'Din kjøretime er bekreftet for i morgen kl 10:00',
        sendt: '2024-06-15T08:30:00Z',
        status: 'levert',
        kostnad: 0.85,
        provider: 'Twilio',
        type: 'bekreftelse'
      },
      {
        id: 'sms-2',
        mottaker: '+47 987 65 432',
        innhold: 'Påminnelse: Teoriprøve i morgen kl 14:00',
        sendt: '2024-06-15T07:15:00Z',
        status: 'sendt',
        kostnad: 0.85,
        provider: 'Twilio',
        type: 'påminnelse'
      },
      {
        id: 'sms-3',
        mottaker: '+47 555 44 333',
        innhold: 'Gratulerer! Du har bestått førerkortprøven',
        sendt: '2024-06-14T16:45:00Z',
        status: 'levert',
        kostnad: 0.85,
        provider: 'Twilio',
        type: 'varsel'
      }
    ];
  }
}

export const smsIntegrasjonsService = new SmsIntegrasjonsService(); 