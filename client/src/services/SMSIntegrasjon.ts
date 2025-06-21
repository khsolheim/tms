/**
 * SMS Integrasjon Service
 * 
 * Tjenester for SMS-utsendelse via ulike leverandører:
 * - Twilio (internasjonalt)
 * - SMS.no (norsk)
 * - Custom SMS-tjenester
 */

import { logger } from '../utils/logger';

export interface SMSKonfigurasjon {
  leverandor: 'TWILIO' | 'SMS_NO' | 'CUSTOM';
  accountSid?: string; // Twilio
  authToken?: string; // Twilio
  fromNumber?: string; // Twilio
  brukernavn?: string; // SMS.no
  passord?: string; // SMS.no
  avsender?: string; // SMS.no/Custom
  customApiUrl?: string; // Custom
  customApiKey?: string; // Custom
  testModus: boolean;
  dailyLimit: number;
  costPerSMS: number; // øre per SMS
}

export interface SMSMelding {
  til: string; // Telefonnummer
  melding: string;
  avsender?: string;
  planlagtTid?: Date;
  prioritet?: 'LAV' | 'NORMAL' | 'HOY';
  type?: 'VARSEL' | 'PÅMINNELSE' | 'INFO' | 'MARKEDSFØRING';
}

export interface SMSResultat {
  suksess: boolean;
  meldingsId?: string;
  feilmelding?: string;
  kostnad?: number;
  sendt?: Date;
  leverandor: string;
}

export interface SMSStatistikk {
  sendtIdag: number;
  sendtDenneMåneden: number;
  kostnaderDenneMåneden: number;
  leveringsrate: number; // prosent
  feilrate: number; // prosent
  populæreSmsTyper: { type: string; antall: number }[];
}

// ============================================================================
// TWILIO INTEGRATION
// ============================================================================

export class TwilioSMSIntegrasjon {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;
  private testModus: boolean;

  constructor(konfigurasjon: SMSKonfigurasjon) {
    this.accountSid = konfigurasjon.accountSid || '';
    this.authToken = konfigurasjon.authToken || '';
    this.fromNumber = konfigurasjon.fromNumber || '';
    this.testModus = konfigurasjon.testModus;
  }

  /**
   * Send SMS via Twilio
   */
  async sendSMS(melding: SMSMelding): Promise<SMSResultat> {
    try {
      if (this.testModus) {
        logger.info('Twilio SMS (test modus)', {
          til: melding.til,
          melding: melding.melding.substring(0, 50) + '...',
          type: melding.type
        });

        return {
          suksess: true,
          meldingsId: `twilio-test-${Date.now()}`,
          kostnad: 0.25, // Test kostnad i NOK
          sendt: new Date(),
          leverandor: 'TWILIO'
        };
      }

      // Ekte Twilio API-kall
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      
      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${this.accountSid}:${this.authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: melding.til,
          From: this.fromNumber,
          Body: melding.melding
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Twilio feil: ${errorData.message}`);
      }

      const data = await response.json();
      
      logger.info('SMS sendt via Twilio', {
        til: melding.til,
        meldingsId: data.sid,
        status: data.status
      });

      return {
        suksess: true,
        meldingsId: data.sid,
        kostnad: this.beregnKostnad('TWILIO'),
        sendt: new Date(),
        leverandor: 'TWILIO'
      };

    } catch (error) {
      logger.error('Feil ved sending av Twilio SMS', {
        error,
        til: melding.til
      });

      return {
        suksess: false,
        feilmelding: error instanceof Error ? error.message : 'Ukjent feil',
        leverandor: 'TWILIO'
      };
    }
  }

  /**
   * Test Twilio forbindelse
   */
  async testForbindelse(): Promise<boolean> {
    try {
      const testUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}.json`;
      
      const response = await fetch(testUrl, {
        headers: {
          'Authorization': `Basic ${btoa(`${this.accountSid}:${this.authToken}`)}`
        }
      });

      return response.ok;
    } catch (error) {
      logger.error('Twilio forbindelsestest feilet', error);
      return false;
    }
  }

  private beregnKostnad(leverandor: string): number {
    // Twilio priser (ca)
    return 0.85; // NOK per SMS
  }
}

// ============================================================================
// SMS.NO INTEGRATION
// ============================================================================

export class SMSNoIntegrasjon {
  private brukernavn: string;
  private passord: string;
  private avsender: string;
  private testModus: boolean;

  constructor(konfigurasjon: SMSKonfigurasjon) {
    this.brukernavn = konfigurasjon.brukernavn || '';
    this.passord = konfigurasjon.passord || '';
    this.avsender = konfigurasjon.avsender || 'TMS';
    this.testModus = konfigurasjon.testModus;
  }

  /**
   * Send SMS via SMS.no
   */
  async sendSMS(melding: SMSMelding): Promise<SMSResultat> {
    try {
      if (this.testModus) {
        logger.info('SMS.no SMS (test modus)', {
          til: melding.til,
          melding: melding.melding.substring(0, 50) + '...',
          type: melding.type
        });

        return {
          suksess: true,
          meldingsId: `smsno-test-${Date.now()}`,
          kostnad: 0.39, // Test kostnad i NOK
          sendt: new Date(),
          leverandor: 'SMS_NO'
        };
      }

      // SMS.no API-kall
      const smsNoUrl = 'https://www.sms.no/api/sendsms.php';
      
      const formData = new URLSearchParams({
        username: this.brukernavn,
        password: this.passord,
        message: melding.melding,
        to: melding.til,
        from: melding.avsender || this.avsender
      });

      const response = await fetch(smsNoUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });

      const responseText = await response.text();
      
      if (!response.ok || responseText.includes('ERROR')) {
        throw new Error(`SMS.no feil: ${responseText}`);
      }

      const meldingsId = responseText.trim();
      
      logger.info('SMS sendt via SMS.no', {
        til: melding.til,
        meldingsId,
        avsender: this.avsender
      });

      return {
        suksess: true,
        meldingsId,
        kostnad: this.beregnKostnad(),
        sendt: new Date(),
        leverandor: 'SMS_NO'
      };

    } catch (error) {
      logger.error('Feil ved sending av SMS.no SMS', {
        error,
        til: melding.til
      });

      return {
        suksess: false,
        feilmelding: error instanceof Error ? error.message : 'Ukjent feil',
        leverandor: 'SMS_NO'
      };
    }
  }

  /**
   * Test SMS.no forbindelse
   */
  async testForbindelse(): Promise<boolean> {
    try {
      const testUrl = 'https://www.sms.no/api/auth.php';
      
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          username: this.brukernavn,
          password: this.passord
        })
      });

      const responseText = await response.text();
      return response.ok && responseText.includes('OK');
    } catch (error) {
      logger.error('SMS.no forbindelsestest feilet', error);
      return false;
    }
  }

  private beregnKostnad(): number {
    // SMS.no priser (ca)
    return 0.39; // NOK per SMS
  }
}

// ============================================================================
// UNIFIED SMS SERVICE
// ============================================================================

export class SMSService {
  private konfigurasjon: SMSKonfigurasjon;
  private twilioIntegrasjon?: TwilioSMSIntegrasjon;
  private smsNoIntegrasjon?: SMSNoIntegrasjon;

  constructor(konfigurasjon: SMSKonfigurasjon) {
    this.konfigurasjon = konfigurasjon;
    this.initializeIntegrasjon();
  }

  private initializeIntegrasjon() {
    switch (this.konfigurasjon.leverandor) {
      case 'TWILIO':
        this.twilioIntegrasjon = new TwilioSMSIntegrasjon(this.konfigurasjon);
        break;
      case 'SMS_NO':
        this.smsNoIntegrasjon = new SMSNoIntegrasjon(this.konfigurasjon);
        break;
      case 'CUSTOM':
        // Implementer custom integrasjon
        break;
    }
  }

  /**
   * Send en SMS-melding
   */
  async sendSMS(melding: SMSMelding): Promise<SMSResultat> {
    try {
      // Valider telefonnummer
      if (!this.validerTelefonnummer(melding.til)) {
        return {
          suksess: false,
          feilmelding: 'Ugyldig telefonnummer format',
          leverandor: this.konfigurasjon.leverandor
        };
      }

      // Valider melding
      if (!melding.melding || melding.melding.length > 1600) {
        return {
          suksess: false,
          feilmelding: 'Ugyldig melding (maks 1600 tegn)',
          leverandor: this.konfigurasjon.leverandor
        };
      }

      // Send via valgt leverandør
      let resultat: SMSResultat;
      
      switch (this.konfigurasjon.leverandor) {
        case 'TWILIO':
          if (!this.twilioIntegrasjon) throw new Error('Twilio ikke konfigurert');
          resultat = await this.twilioIntegrasjon.sendSMS(melding);
          break;
        case 'SMS_NO':
          if (!this.smsNoIntegrasjon) throw new Error('SMS.no ikke konfigurert');
          resultat = await this.smsNoIntegrasjon.sendSMS(melding);
          break;
        default:
          throw new Error(`Leverandør ${this.konfigurasjon.leverandor} ikke støttet`);
      }

      // Log resultat
      if (resultat.suksess) {
        logger.info('SMS sendt successfully', {
          leverandor: this.konfigurasjon.leverandor,
          til: melding.til,
          type: melding.type,
          kostnad: resultat.kostnad
        });
      }

      return resultat;

    } catch (error) {
      logger.error('Feil ved SMS-sending', {
        error,
        leverandor: this.konfigurasjon.leverandor,
        til: melding.til
      });

      return {
        suksess: false,
        feilmelding: error instanceof Error ? error.message : 'Ukjent feil',
        leverandor: this.konfigurasjon.leverandor
      };
    }
  }

  /**
   * Send bulk SMS til flere mottakere
   */
  async sendBulkSMS(meldinger: SMSMelding[]): Promise<SMSResultat[]> {
    const resultater: SMSResultat[] = [];
    
    for (const melding of meldinger) {
      const resultat = await this.sendSMS(melding);
      resultater.push(resultat);
      
      // Pause mellom meldinger for å unngå rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const vellykket = resultater.filter(r => r.suksess).length;
    const totalKostnad = resultater
      .filter(r => r.kostnad)
      .reduce((sum, r) => sum + (r.kostnad || 0), 0);

    logger.info('Bulk SMS fullført', {
      totalt: meldinger.length,
      vellykket,
      feilet: meldinger.length - vellykket,
      totalKostnad
    });

    return resultater;
  }

  /**
   * Test forbindelse til SMS-leverandør
   */
  async testForbindelse(): Promise<boolean> {
    try {
      switch (this.konfigurasjon.leverandor) {
        case 'TWILIO':
          return this.twilioIntegrasjon?.testForbindelse() || false;
        case 'SMS_NO':
          return this.smsNoIntegrasjon?.testForbindelse() || false;
        default:
          return false;
      }
    } catch (error) {
      logger.error('SMS forbindelsestest feilet', {
        leverandor: this.konfigurasjon.leverandor,
        error
      });
      return false;
    }
  }

  /**
   * Hent SMS-statistikk (mock for nå)
   */
  async hentStatistikk(): Promise<SMSStatistikk> {
    // Mock data - implementer ekte database-spørringer senere
    return {
      sendtIdag: 25,
      sendtDenneMåneden: 847,
      kostnaderDenneMåneden: 330.23,
      leveringsrate: 98.5,
      feilrate: 1.5,
      populæreSmsTyper: [
        { type: 'VARSEL', antall: 450 },
        { type: 'PÅMINNELSE', antall: 280 },
        { type: 'INFO', antall: 117 }
      ]
    };
  }

  /**
   * Valider norsk telefonnummer
   */
  private validerTelefonnummer(telefon: string): boolean {
    // Fjern mellomrom og spesialtegn
    const cleanTelefon = telefon.replace(/[\s\-+()]/g, '');
    
    // Norsk mobilnummer: +47xxxxxxxx eller 8-sifret
    const norskMobil = /^(?:47)?[4-9]\d{7}$/;
    
    return norskMobil.test(cleanTelefon);
  }
}

/**
 * Valider SMS-konfigurasjon
 */
export function validerSMSKonfigurasjon(
  konfigurasjon: Partial<SMSKonfigurasjon>
): string[] {
  const feil: string[] = [];

  if (!konfigurasjon.leverandor) {
    feil.push('SMS-leverandør må spesifiseres');
  }

  switch (konfigurasjon.leverandor) {
    case 'TWILIO':
      if (!konfigurasjon.accountSid) feil.push('Twilio Account SID er påkrevd');
      if (!konfigurasjon.authToken) feil.push('Twilio Auth Token er påkrevd');
      if (!konfigurasjon.fromNumber) feil.push('Twilio avsendernummer er påkrevd');
      break;
    case 'SMS_NO':
      if (!konfigurasjon.brukernavn) feil.push('SMS.no brukernavn er påkrevd');
      if (!konfigurasjon.passord) feil.push('SMS.no passord er påkrevd');
      break;
    case 'CUSTOM':
      if (!konfigurasjon.customApiUrl) feil.push('Custom API URL er påkrevd');
      if (!konfigurasjon.customApiKey) feil.push('Custom API-nøkkel er påkrevd');
      break;
  }

  if (konfigurasjon.dailyLimit && konfigurasjon.dailyLimit < 1) {
    feil.push('Daglig grense må være minst 1');
  }

  return feil;
}

/**
 * Standard SMS-maler
 */
export const SMSMaler = {
  kontraktVarsel: (elevNavn: string, bedriftNavn: string) => ({
    melding: `Hei ${elevNavn}! Din kontrakt med ${bedriftNavn} er klar for signering. Logg inn på TMS for å se detaljer.`,
    type: 'VARSEL' as const,
    prioritet: 'HOY' as const
  }),
  
  sikkerhetskontrollPåminnelse: (bedriftNavn: string, dato: string) => ({
    melding: `Påminnelse: Sikkerhetskontroll for ${bedriftNavn} planlagt ${dato}. Husk å forberede nødvendig dokumentasjon.`,
    type: 'PÅMINNELSE' as const,
    prioritet: 'NORMAL' as const
  }),
  
  kursStartVarsel: (kursNavn: string, dato: string, tid: string) => ({
    melding: `Kurset "${kursNavn}" starter ${dato} kl. ${tid}. Vi sees!`,
    type: 'INFO' as const,
    prioritet: 'NORMAL' as const
  }),
  
  betalingsPåminnelse: (belop: number, forfallsdato: string) => ({
    melding: `Betalingspåminnelse: kr ${belop} forfaller ${forfallsdato}. Betal via TMS eller kontakt oss.`,
    type: 'PÅMINNELSE' as const,
    prioritet: 'HOY' as const
  })
}; 