/**
 * BetalingsIntegrasjon Service
 * 
 * Comprehensive betalingsløsning for TMS
 * Støtter Vipps og Stripe betalinger
 */

export interface BetalingTransaksjon {
  id?: string;
  referanse: string;
  belop: number; // øre
  valuta: string;
  beskrivelse: string;
  kundeInfo: {
    navn: string;
    epost: string;
    telefon?: string;
  };
  metadata?: {
    kontraktId?: number;
    terminNummer?: number;
    type: 'termin' | 'gebyr' | 'etablering' | 'purring';
  };
  status?: 'pending' | 'authorized' | 'captured' | 'cancelled' | 'failed' | 'refunded';
  opprettet?: Date;
  utloper?: Date;
}

export interface BetalingKonfigurasjon {
  type: 'VIPPS' | 'STRIPE';
  accessToken: string;
  merchantId?: string; // For Vipps
  secretKey?: string; // For Stripe
  webhookSecret?: string;
  testMode: boolean;
  autoCapture: boolean;
  standardBeskrivelse: string;
}

export interface BetalingResultat {
  success: boolean;
  transaksjonId?: string;
  betalingsUrl?: string;
  status?: string;
  error?: string;
  metadata?: any;
}

export interface RefunderingResultat {
  success: boolean;
  refunderingId?: string;
  belop?: number;
  error?: string;
}

/**
 * Vipps Integration
 */
class VippsIntegrasjon {
  private readonly config: BetalingKonfigurasjon;
  private readonly baseUrl: string;

  constructor(config: BetalingKonfigurasjon) {
    this.config = config;
    this.baseUrl = config.testMode 
      ? 'https://apitest.vipps.no'
      : 'https://api.vipps.no';
  }

  async createPayment(transaksjon: BetalingTransaksjon): Promise<BetalingResultat> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: 'Failed to get Vipps access token' };
      }

      const payload = {
        amount: transaksjon.belop,
        text: transaksjon.beskrivelse,
        orderId: transaksjon.referanse,
        redirectUrl: `${window.location.origin}/betaling/ferdig`,
        fallbackUrl: `${window.location.origin}/betaling/avbrutt`,
        userFlow: 'WEB_REDIRECT',
        paymentMethod: {
          type: 'WALLET'
        },
        userInfo: {
          mobileNumber: transaksjon.kundeInfo.telefon
        },
        reference: transaksjon.referanse,
        paymentDescription: transaksjon.beskrivelse
      };

      const response = await fetch(`${this.baseUrl}/epayment/v1/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Merchant-Serial-Number': this.config.merchantId!,
          'Vipps-System-Name': 'TMS',
          'Vipps-System-Version': '1.0'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Vipps API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        transaksjonId: result.reference,
        betalingsUrl: result.redirectUrl,
        status: 'pending',
        metadata: result
      };
    } catch (error) {
      console.error('Vipps create payment error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getPaymentStatus(transaksjonId: string): Promise<BetalingResultat> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: 'Failed to get Vipps access token' };
      }

      const response = await fetch(`${this.baseUrl}/epayment/v1/payments/${transaksjonId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Merchant-Serial-Number': this.config.merchantId!
        }
      });

      if (!response.ok) {
        throw new Error(`Vipps API error: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        transaksjonId: result.reference,
        status: this.mapVippsStatus(result.state),
        metadata: result
      };
    } catch (error) {
      console.error('Vipps get payment status error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async capturePayment(transaksjonId: string, belop?: number): Promise<BetalingResultat> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: 'Failed to get Vipps access token' };
      }

      const payload = belop ? { modificationAmount: belop } : {};

      const response = await fetch(`${this.baseUrl}/epayment/v1/payments/${transaksjonId}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Merchant-Serial-Number': this.config.merchantId!
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Vipps capture error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        transaksjonId,
        status: 'captured',
        metadata: result
      };
    } catch (error) {
      console.error('Vipps capture payment error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async refundPayment(transaksjonId: string, belop: number, arsak: string): Promise<RefunderingResultat> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: 'Failed to get Vipps access token' };
      }

      const payload = {
        modificationAmount: belop,
        description: arsak
      };

      const response = await fetch(`${this.baseUrl}/epayment/v1/payments/${transaksjonId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Merchant-Serial-Number': this.config.merchantId!
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Vipps refund error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        refunderingId: result.refundId,
        belop
      };
    } catch (error) {
      console.error('Vipps refund payment error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private async getAccessToken(): Promise<string | null> {
    try {
      // In a real implementation, this would use client credentials flow
      // For now, we assume the access token is provided in config
      return this.config.accessToken;
    } catch (error) {
      console.error('Failed to get Vipps access token:', error);
      return null;
    }
  }

  private mapVippsStatus(vippsState: string): string {
    const statusMap: { [key: string]: string } = {
      'CREATED': 'pending',
      'AUTHORIZED': 'authorized',
      'CAPTURED': 'captured',
      'CANCELLED': 'cancelled',
      'TERMINATED': 'failed',
      'REFUNDED': 'refunded'
    };
    return statusMap[vippsState] || 'unknown';
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: 'No access token available' };
      }

      // Test with a simple API call
      const response = await fetch(`${this.baseUrl}/epayment/v1/payments?state=CREATED&limit=1`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Merchant-Serial-Number': this.config.merchantId!
        }
      });

      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

/**
 * Stripe Integration
 */
class StripeIntegrasjon {
  private readonly config: BetalingKonfigurasjon;
  private readonly baseUrl = 'https://api.stripe.com/v1';

  constructor(config: BetalingKonfigurasjon) {
    this.config = config;
  }

  async createPayment(transaksjon: BetalingTransaksjon): Promise<BetalingResultat> {
    try {
      const payload = new URLSearchParams({
        amount: transaksjon.belop.toString(),
        currency: transaksjon.valuta.toLowerCase(),
        description: transaksjon.beskrivelse,
        'metadata[referanse]': transaksjon.referanse,
        'metadata[kontraktId]': transaksjon.metadata?.kontraktId?.toString() || '',
        'metadata[type]': transaksjon.metadata?.type || '',
        'receipt_email': transaksjon.kundeInfo.epost,
        capture_method: this.config.autoCapture ? 'automatic' : 'manual'
      });
      
      // Legg til payment method types separat for å unngå duplikater
      payload.append('payment_method_types[]', 'card');
      payload.append('payment_method_types[]', 'klarna');

      const response = await fetch(`${this.baseUrl}/payment_intents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: payload
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Stripe API error: ${response.status} - ${errorData.error?.message}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        transaksjonId: result.id,
        status: this.mapStripeStatus(result.status),
        metadata: {
          clientSecret: result.client_secret,
          paymentIntent: result
        }
      };
    } catch (error) {
      console.error('Stripe create payment error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getPaymentStatus(transaksjonId: string): Promise<BetalingResultat> {
    try {
      const response = await fetch(`${this.baseUrl}/payment_intents/${transaksjonId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Stripe API error: ${response.status} - ${errorData.error?.message}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        transaksjonId: result.id,
        status: this.mapStripeStatus(result.status),
        metadata: result
      };
    } catch (error) {
      console.error('Stripe get payment status error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async capturePayment(transaksjonId: string, belop?: number): Promise<BetalingResultat> {
    try {
      const payload = new URLSearchParams();
      if (belop) {
        payload.append('amount_to_capture', belop.toString());
      }

      const response = await fetch(`${this.baseUrl}/payment_intents/${transaksjonId}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: payload
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Stripe capture error: ${response.status} - ${errorData.error?.message}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        transaksjonId,
        status: this.mapStripeStatus(result.status),
        metadata: result
      };
    } catch (error) {
      console.error('Stripe capture payment error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async refundPayment(transaksjonId: string, belop: number, arsak: string): Promise<RefunderingResultat> {
    try {
      // First get the payment intent to find the charge
      const paymentIntent = await this.getPaymentStatus(transaksjonId);
      if (!paymentIntent.success || !paymentIntent.metadata?.latest_charge) {
        return { success: false, error: 'Could not find charge for refund' };
      }

      const payload = new URLSearchParams({
        charge: paymentIntent.metadata.latest_charge,
        amount: belop.toString(),
        reason: 'requested_by_customer',
        'metadata[reason]': arsak
      });

      const response = await fetch(`${this.baseUrl}/refunds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: payload
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Stripe refund error: ${response.status} - ${errorData.error?.message}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        refunderingId: result.id,
        belop: result.amount
      };
    } catch (error) {
      console.error('Stripe refund payment error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private mapStripeStatus(stripeStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'requires_payment_method': 'pending',
      'requires_confirmation': 'pending',
      'requires_action': 'pending',
      'processing': 'pending',
      'requires_capture': 'authorized',
      'succeeded': 'captured',
      'canceled': 'cancelled'
    };
    return statusMap[stripeStatus] || 'unknown';
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/payment_methods?type=card&limit=1`, {
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Connection test failed: ${response.status} - ${errorData.error?.message}`);
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

/**
 * Unified Betalings Service
 */
export class BetalingsService {
  private provider: VippsIntegrasjon | StripeIntegrasjon;

  constructor(config: BetalingKonfigurasjon) {
    if (config.type === 'VIPPS') {
      this.provider = new VippsIntegrasjon(config);
    } else {
      this.provider = new StripeIntegrasjon(config);
    }
  }

  async createPayment(transaksjon: BetalingTransaksjon): Promise<BetalingResultat> {
    return this.provider.createPayment(transaksjon);
  }

  async getPaymentStatus(transaksjonId: string): Promise<BetalingResultat> {
    return this.provider.getPaymentStatus(transaksjonId);
  }

  async capturePayment(transaksjonId: string, belop?: number): Promise<BetalingResultat> {
    return this.provider.capturePayment(transaksjonId, belop);
  }

  async refundPayment(transaksjonId: string, belop: number, arsak: string): Promise<RefunderingResultat> {
    return this.provider.refundPayment(transaksjonId, belop, arsak);
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    return this.provider.testConnection();
  }

  // Utility methods for common payment scenarios
  async createTerminPayment(kontrakt: any, terminNummer: number): Promise<BetalingResultat> {
    const transaksjon: BetalingTransaksjon = {
      referanse: `TMS-${kontrakt.id}-T${terminNummer}-${Date.now()}`,
      belop: kontrakt.terminbelop * 100, // Convert to øre
      valuta: 'NOK',
      beskrivelse: `Terminbetaling ${terminNummer} for kontrakt ${kontrakt.id}`,
      kundeInfo: {
        navn: `${kontrakt.elevFornavn} ${kontrakt.elevEtternavn}`,
        epost: kontrakt.elevEpost,
        telefon: kontrakt.elevTelefon
      },
      metadata: {
        kontraktId: kontrakt.id,
        terminNummer,
        type: 'termin'
      }
    };

    return this.createPayment(transaksjon);
  }

  async createGebyrPayment(kontrakt: any, gebyrType: 'etablering' | 'purring', belop: number): Promise<BetalingResultat> {
    const transaksjon: BetalingTransaksjon = {
      referanse: `TMS-${kontrakt.id}-${gebyrType.toUpperCase()}-${Date.now()}`,
      belop: belop * 100, // Convert to øre
      valuta: 'NOK',
      beskrivelse: `${gebyrType === 'etablering' ? 'Etableringsgebyr' : 'Purregebyr'} for kontrakt ${kontrakt.id}`,
      kundeInfo: {
        navn: `${kontrakt.elevFornavn} ${kontrakt.elevEtternavn}`,
        epost: kontrakt.elevEpost,
        telefon: kontrakt.elevTelefon
      },
      metadata: {
        kontraktId: kontrakt.id,
        type: gebyrType
      }
    };

    return this.createPayment(transaksjon);
  }
}

// Export individual classes
export { VippsIntegrasjon, StripeIntegrasjon }; 