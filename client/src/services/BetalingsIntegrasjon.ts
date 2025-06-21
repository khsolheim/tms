/**
 * Betalingsløsning Integrasjon Service
 * 
 * Håndterer integrasjon med externe betalingsløsninger
 * - Vipps
 * - Stripe
 * - Betalingsbehandling for kontrakter og kurs
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface BetalingsTransaksjon {
  id?: string;
  eksternId?: string;
  beløp: number; // øre
  valuta: string; // 'NOK', 'USD', 'EUR'
  beskrivelse: string;
  kontraktId?: number;
  elevId?: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  betalingsmetode?: 'VIPPS' | 'CARD' | 'MOBILEPAY' | 'BANK_TRANSFER';
  kundeInfo: {
    navn: string;
    epost: string;
    telefon?: string;
  };
  fakturaInformasjon?: {
    fakturaId: string;
    forfallsdato: string;
  };
  metadata?: Record<string, any>;
  opprettet: string; // ISO string
  betalt?: string; // ISO string
  refundert?: string; // ISO string
}

export interface BetalingsKonfigurasjon {
  provider: 'VIPPS' | 'STRIPE';
  clientId: string;
  clientSecret: string;
  subscriptionKey?: string; // Vipps
  merchantSerialNumber?: string; // Vipps
  testMode: boolean;
  webhookSecret?: string;
  defaultCurrency: string;
  autoCapture: boolean;
  allowedPaymentMethods: string[];
}

export interface BetalingsResultat {
  success: boolean;
  transactionId: string;
  paymentUrl?: string; // For redirect-based payments
  error?: string;
  metadata?: any;
}

// ============================================================================
// VIPPS INTEGRATION
// ============================================================================

export class VippsIntegrasjon {
  private clientId: string;
  private clientSecret: string;
  private subscriptionKey: string;
  private merchantSerialNumber: string;
  private testMode: boolean;
  private apiUrl: string;
  private accessToken?: string;
  private tokenExpiry?: Date;

  constructor(konfigurasjon: BetalingsKonfigurasjon) {
    this.clientId = konfigurasjon.clientId;
    this.clientSecret = konfigurasjon.clientSecret;
    this.subscriptionKey = konfigurasjon.subscriptionKey!;
    this.merchantSerialNumber = konfigurasjon.merchantSerialNumber!;
    this.testMode = konfigurasjon.testMode;
    this.apiUrl = this.testMode 
      ? 'https://apitest.vipps.no'
      : 'https://api.vipps.no';
  }

  /**
   * Få access token fra Vipps
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${this.apiUrl}/accesstoken/get`, {
        method: 'POST',
        headers: {
          'client_id': this.clientId,
          'client_secret': this.clientSecret,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Vipps auth feil: ${response.statusText}`);
      }

      const result = await response.json();
      this.accessToken = result.access_token;
      this.tokenExpiry = new Date(Date.now() + (result.expires_in * 1000));
      
      if (!this.accessToken) {
        throw new Error('Ingen access token mottatt fra Vipps');
      }
      
      return this.accessToken;
    } catch (error) {
      logger.error('Feil ved henting av Vipps access token', error);
      throw error;
    }
  }

  /**
   * Opprett betaling i Vipps
   */
  async opprettBetaling(transaksjon: BetalingsTransaksjon): Promise<BetalingsResultat> {
    try {
      const accessToken = await this.getAccessToken();
      const orderId = `TMS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const vippsPayment = {
        orderId,
        amount: transaksjon.beløp,
        description: transaksjon.beskrivelse,
        redirectUrl: `${window.location.origin}/betaling/success?orderId=${orderId}`,
        userFlow: 'WEB_REDIRECT',
        paymentMethod: {
          type: 'WALLET'
        },
        customer: {
          phoneNumber: transaksjon.kundeInfo.telefon?.replace(/\s/g, ''),
        },
        merchantInfo: {
          merchantSerialNumber: this.merchantSerialNumber,
          callbackPrefix: `${window.location.origin}/api/vipps/callback`,
        }
      };

      const response = await fetch(`${this.apiUrl}/epayment/v1/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Merchant-Serial-Number': this.merchantSerialNumber,
          'Content-Type': 'application/json',
          'Idempotency-Key': orderId
        },
        body: JSON.stringify(vippsPayment)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Vipps API feil: ${error.message || response.statusText}`);
      }

      const result = await response.json();
      
      logger.info('Vipps betaling opprettet', { 
        orderId,
        beløp: transaksjon.beløp,
        kontraktId: transaksjon.kontraktId
      });

      return {
        success: true,
        transactionId: orderId,
        paymentUrl: result.redirectUrl,
        metadata: result
      };
    } catch (error) {
      logger.error('Feil ved opprettelse av Vipps betaling', error);
      return {
        success: false,
        transactionId: '',
        error: error instanceof Error ? error.message : 'Ukjent feil'
      };
    }
  }

  /**
   * Hent betalingsstatus fra Vipps
   */
  async hentBetalingsStatus(transactionId: string): Promise<BetalingsTransaksjon> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.apiUrl}/epayment/v1/payments/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Merchant-Serial-Number': this.merchantSerialNumber
        }
      });

      if (!response.ok) {
        throw new Error(`Vipps API feil: ${response.statusText}`);
      }

      const result = await response.json();
      return this.mapVippsTransaksjon(result);
    } catch (error) {
      logger.error('Feil ved henting av Vipps betalingsstatus', error);
      throw error;
    }
  }

  /**
   * Refunder betaling i Vipps
   */
  async refunderBetaling(transactionId: string, beløp?: number): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      const refundId = `REF-${Date.now()}`;

      const refundData = {
        amount: beløp, // Hvis ikke angitt, refunderes hele beløpet
        description: `Refundering fra TMS for ordre ${transactionId}`
      };

      const response = await fetch(`${this.apiUrl}/epayment/v1/payments/${transactionId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Merchant-Serial-Number': this.merchantSerialNumber,
          'Content-Type': 'application/json',
          'Idempotency-Key': refundId
        },
        body: JSON.stringify(refundData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Vipps refund feil: ${error.message || response.statusText}`);
      }

      logger.info('Vipps refundering utført', { transactionId, beløp });
      return true;
    } catch (error) {
      logger.error('Feil ved Vipps refundering', error);
      return false;
    }
  }

  private mapVippsTransaksjon(vippsData: any): BetalingsTransaksjon {
    const statusMap: Record<string, BetalingsTransaksjon['status']> = {
      'CREATED': 'PENDING',
      'INITIATED': 'PENDING',
      'AUTHORIZED': 'PENDING',
      'TERMINATED': 'COMPLETED',
      'CANCELLED': 'CANCELLED',
      'REFUNDED': 'REFUNDED',
      'FAILED': 'FAILED'
    };

    return {
      id: vippsData.orderId,
      eksternId: vippsData.reference,
      beløp: vippsData.amount,
      valuta: 'NOK',
      beskrivelse: vippsData.description,
      status: statusMap[vippsData.state] || 'PENDING',
      betalingsmetode: 'VIPPS',
      kundeInfo: {
        navn: vippsData.userDetails?.firstName + ' ' + vippsData.userDetails?.lastName || 'Ukjent',
        epost: vippsData.userDetails?.email || '',
        telefon: vippsData.userDetails?.phoneNumber
      },
      opprettet: vippsData.created,
      betalt: vippsData.state === 'TERMINATED' ? vippsData.lastModified : undefined,
      metadata: vippsData
    };
  }
}

// ============================================================================
// STRIPE INTEGRATION
// ============================================================================

export class StripeIntegrasjon {
  private secretKey: string;
  private publishableKey: string;
  private testMode: boolean;
  private apiUrl = 'https://api.stripe.com/v1';

  constructor(konfigurasjon: BetalingsKonfigurasjon) {
    this.secretKey = konfigurasjon.clientSecret;
    this.publishableKey = konfigurasjon.clientId;
    this.testMode = konfigurasjon.testMode;
  }

  /**
   * Opprett betaling i Stripe
   */
  async opprettBetaling(transaksjon: BetalingsTransaksjon): Promise<BetalingsResultat> {
    try {
      const paymentIntent = {
        amount: transaksjon.beløp,
        currency: transaksjon.valuta.toLowerCase(),
        description: transaksjon.beskrivelse,
        automatic_payment_methods: {
          enabled: true
        },
        metadata: {
          kontraktId: transaksjon.kontraktId?.toString() || '',
          elevId: transaksjon.elevId?.toString() || '',
          source: 'TMS'
        },
        receipt_email: transaksjon.kundeInfo.epost
      };

      const response = await fetch(`${this.apiUrl}/payment_intents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(this.flattenObject(paymentIntent))
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Stripe API feil: ${error.error?.message || response.statusText}`);
      }

      const result = await response.json();
      
      logger.info('Stripe betaling opprettet', { 
        paymentIntentId: result.id,
        beløp: transaksjon.beløp,
        kontraktId: transaksjon.kontraktId
      });

      return {
        success: true,
        transactionId: result.id,
        metadata: {
          clientSecret: result.client_secret,
          publishableKey: this.publishableKey
        }
      };
    } catch (error) {
      logger.error('Feil ved opprettelse av Stripe betaling', error);
      return {
        success: false,
        transactionId: '',
        error: error instanceof Error ? error.message : 'Ukjent feil'
      };
    }
  }

  /**
   * Hent betalingsstatus fra Stripe
   */
  async hentBetalingsStatus(transactionId: string): Promise<BetalingsTransaksjon> {
    try {
      const response = await fetch(`${this.apiUrl}/payment_intents/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Stripe API feil: ${response.statusText}`);
      }

      const result = await response.json();
      return this.mapStripeTransaksjon(result);
    } catch (error) {
      logger.error('Feil ved henting av Stripe betalingsstatus', error);
      throw error;
    }
  }

  /**
   * Refunder betaling i Stripe
   */
  async refunderBetaling(transactionId: string, beløp?: number): Promise<boolean> {
    try {
      const refundData: any = {
        payment_intent: transactionId,
        reason: 'requested_by_customer'
      };

      if (beløp) {
        refundData.amount = beløp;
      }

      const response = await fetch(`${this.apiUrl}/refunds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(refundData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Stripe refund feil: ${error.error?.message || response.statusText}`);
      }

      logger.info('Stripe refundering utført', { transactionId, beløp });
      return true;
    } catch (error) {
      logger.error('Feil ved Stripe refundering', error);
      return false;
    }
  }

  private mapStripeTransaksjon(stripeData: any): BetalingsTransaksjon {
    const statusMap: Record<string, BetalingsTransaksjon['status']> = {
      'requires_payment_method': 'PENDING',
      'requires_confirmation': 'PENDING',
      'requires_action': 'PENDING',
      'processing': 'PENDING',
      'succeeded': 'COMPLETED',
      'canceled': 'CANCELLED'
    };

    const paymentMethodMap: Record<string, string> = {
      'card': 'CARD',
      'mobilepay': 'MOBILEPAY'
    };

    return {
      id: stripeData.id,
      eksternId: stripeData.id,
      beløp: stripeData.amount,
      valuta: stripeData.currency.toUpperCase(),
      beskrivelse: stripeData.description || 'Stripe betaling',
      status: statusMap[stripeData.status] || 'PENDING',
      betalingsmetode: (paymentMethodMap[stripeData.payment_method?.type] as BetalingsTransaksjon['betalingsmetode']) || 'CARD',
      kundeInfo: {
        navn: stripeData.charges?.data?.[0]?.billing_details?.name || 'Ukjent',
        epost: stripeData.receipt_email || '',
        telefon: stripeData.charges?.data?.[0]?.billing_details?.phone
      },
      kontraktId: stripeData.metadata?.kontraktId ? parseInt(stripeData.metadata.kontraktId) : undefined,
      elevId: stripeData.metadata?.elevId ? parseInt(stripeData.metadata.elevId) : undefined,
      opprettet: new Date(stripeData.created * 1000).toISOString(),
      betalt: stripeData.status === 'succeeded' ? new Date().toISOString() : undefined,
      metadata: stripeData
    };
  }

  private flattenObject(obj: any, prefix = ''): Record<string, string> {
    const flattened: Record<string, string> = {};
    
    for (const key in obj) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}[${key}]` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else {
        flattened[newKey] = String(value);
      }
    }
    
    return flattened;
  }
}

// ============================================================================
// UNIFIED PAYMENT SERVICE
// ============================================================================

export class BetalingsService {
  private integrasjon: VippsIntegrasjon | StripeIntegrasjon;
  private konfigurasjon: BetalingsKonfigurasjon;

  constructor(konfigurasjon: BetalingsKonfigurasjon) {
    this.konfigurasjon = konfigurasjon;
    
    if (konfigurasjon.provider === 'VIPPS') {
      this.integrasjon = new VippsIntegrasjon(konfigurasjon);
    } else {
      this.integrasjon = new StripeIntegrasjon(konfigurasjon);
    }
  }

  /**
   * Opprett fakturabetaling for kontrakt
   */
  async opprettKontraktBetaling(
    kontraktId: number,
    beløp: number,
    kundeInfo: BetalingsTransaksjon['kundeInfo'],
    beskrivelse?: string
  ): Promise<BetalingsResultat> {
    try {
      const transaksjon: BetalingsTransaksjon = {
        beløp,
        valuta: this.konfigurasjon.defaultCurrency,
        beskrivelse: beskrivelse || `Betaling for kontrakt ${kontraktId}`,
        kontraktId,
        status: 'PENDING',
        kundeInfo,
        opprettet: new Date().toISOString()
      };

      const resultat = await this.integrasjon.opprettBetaling(transaksjon);

      logger.info('Kontraktbetaling opprettet', {
        kontraktId,
        provider: this.konfigurasjon.provider,
        success: resultat.success
      });

      return resultat;
    } catch (error) {
      logger.error('Feil ved opprettelse av kontraktbetaling', error);
      throw error;
    }
  }

  /**
   * Test forbindelse til betalingsleverandør
   */
  async testForbindelse(): Promise<boolean> {
    try {
      // Test med minimal transaksjon (1 øre)
      const testTransaksjon: BetalingsTransaksjon = {
        beløp: 1,
        valuta: this.konfigurasjon.defaultCurrency,
        beskrivelse: 'TMS forbindelsestest',
        status: 'PENDING',
        kundeInfo: {
          navn: 'Test Bruker',
          epost: 'test@tms.no'
        },
        opprettet: new Date().toISOString()
      };

      const resultat = await this.integrasjon.opprettBetaling(testTransaksjon);
      return resultat.success;
    } catch (error) {
      logger.error('Betalingsforbindelse test feilet', error);
      return false;
    }
  }

  /**
   * Hent betalingsstatistikk
   */
  async hentBetalingsStatistikk(): Promise<{
    totalBetalinger: number;
    vellykkedeBetalinger: number;
    feileteBetalinger: number;
    totalBeløp: number;
    gjennomsnittBeløp: number;
  }> {
    // Mock implementasjon - i virkeligheten ville dette komme fra database
    return {
      totalBetalinger: 156,
      vellykkedeBetalinger: 148,
      feileteBetalinger: 8,
      totalBeløp: 2450000, // øre = 24,500 NOK
      gjennomsnittBeløp: 15705 // øre = 157 NOK
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function opprettBetalingsService(
  konfigurasjon: BetalingsKonfigurasjon
): BetalingsService {
  return new BetalingsService(konfigurasjon);
}

export function validerBetalingsKonfigurasjon(
  konfigurasjon: Partial<BetalingsKonfigurasjon>
): string[] {
  const feil: string[] = [];

  if (!konfigurasjon.provider) {
    feil.push('Betalingsprovider er påkrevd');
  }

  if (!konfigurasjon.clientId) {
    feil.push('Client ID er påkrevd');
  }

  if (!konfigurasjon.clientSecret) {
    feil.push('Client Secret er påkrevd');
  }

  if (konfigurasjon.provider === 'VIPPS') {
    if (!konfigurasjon.subscriptionKey) {
      feil.push('Vipps Subscription Key er påkrevd');
    }
    if (!konfigurasjon.merchantSerialNumber) {
      feil.push('Vipps Merchant Serial Number er påkrevd');
    }
  }

  if (konfigurasjon.defaultCurrency && !['NOK', 'USD', 'EUR'].includes(konfigurasjon.defaultCurrency)) {
    feil.push('Ugyldig valuta (støttet: NOK, USD, EUR)');
  }

  return feil;
}

export function konverterTilØre(beløpKroner: number): number {
  return Math.round(beløpKroner * 100);
}

export function konverterFraØre(beløpØre: number): number {
  return beløpØre / 100;
} 