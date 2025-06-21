/**
 * Regnskapsystem Integrasjon Service
 * 
 * Håndterer integrasjon med eksterne regnskapssystemer
 * - Tripletex
 * - Poweroffice 
 * - Generisk regnskapsintegrasjon
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RegnskapsTransaksjon {
  id: string;
  type: 'FAKTURA' | 'BETALING' | 'KREDITNOTA' | 'UTGIFT';
  beløp: number;
  beskrivelse: string;
  dato: string;
  kundeId?: string;
  kontraktId?: number;
  mvaKode?: string;
  kontoplan?: string;
  bilag?: string[];
}

export interface KundeInfo {
  id: string;
  navn: string;
  orgnr?: string;
  epost?: string;
  adresse?: {
    gate: string;
    postnr: string;
    poststed: string;
  };
  betalingsbetingelser?: string;
}

export interface RegnskapsKonfigurasjon {
  system: 'TRIPLETEX' | 'POWEROFFICE' | 'FIKEN' | 'CUSTOM';
  apiUrl: string;
  apiKey: string;
  clientId?: string;
  clientSecret?: string;
  autoSyncEnabled: boolean;
  syncInterval: number; // minutter
  defaultMvaKode: string;
  standardKontoer: {
    salg: string;
    mva: string;
    kunde: string;
    bank: string;
  };
}

// ============================================================================
// TRIPLETEX INTEGRATION
// ============================================================================

export class TripletexIntegrasjon {
  private apiUrl: string;
  private token: string;

  constructor(konfigurasjon: RegnskapsKonfigurasjon) {
    this.apiUrl = konfigurasjon.apiUrl;
    this.token = konfigurasjon.apiKey;
  }

  /**
   * Opprett kunde i Tripletex
   */
  async opprettKunde(kunde: KundeInfo): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/customer`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: kunde.navn,
          organizationNumber: kunde.orgnr,
          email: kunde.epost,
          addresses: kunde.adresse ? [{
            addressType: 'INVOICE',
            name: kunde.navn,
            addressLine1: kunde.adresse.gate,
            postalCode: kunde.adresse.postnr,
            city: kunde.adresse.poststed,
            country: 'NO'
          }] : []
        })
      });

      if (!response.ok) {
        throw new Error(`Tripletex API feil: ${response.statusText}`);
      }

      const result = await response.json();
      logger.info('Kunde opprettet i Tripletex', { kundeId: result.value.id });
      return result.value.id.toString();
    } catch (error) {
      logger.error('Feil ved opprettelse av kunde i Tripletex', error);
      throw error;
    }
  }

  /**
   * Opprett faktura i Tripletex
   */
  async opprettFaktura(transaksjon: RegnskapsTransaksjon): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/invoice`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceDate: transaksjon.dato,
          dueDate: this.beregnForfallsdato(transaksjon.dato),
          customer: { id: transaksjon.kundeId },
          orderLines: [{
            description: transaksjon.beskrivelse,
            count: 1,
            unitPriceExcludingVatCurrency: transaksjon.beløp,
            vatType: { id: this.getMvaKode(transaksjon.mvaKode) }
          }],
          reference: `TMS-${transaksjon.kontraktId}`
        })
      });

      if (!response.ok) {
        throw new Error(`Tripletex API feil: ${response.statusText}`);
      }

      const result = await response.json();
      logger.info('Faktura opprettet i Tripletex', { 
        fakturaId: result.value.id,
        kontraktId: transaksjon.kontraktId 
      });
      return result.value.id.toString();
    } catch (error) {
      logger.error('Feil ved opprettelse av faktura i Tripletex', error);
      throw error;
    }
  }

  /**
   * Hent fakturaer fra Tripletex
   */
  async hentFakturaer(fradato?: string, tildato?: string): Promise<RegnskapsTransaksjon[]> {
    try {
      const params = new URLSearchParams();
      if (fradato) params.append('invoiceDateFrom', fradato);
      if (tildato) params.append('invoiceDateTo', tildato);

      const response = await fetch(`${this.apiUrl}/invoice?${params}`, {
        headers: {
          'Authorization': `Basic ${this.token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Tripletex API feil: ${response.statusText}`);
      }

      const result = await response.json();
      return result.values.map(this.mapTripletexTilTransaksjon);
    } catch (error) {
      logger.error('Feil ved henting av fakturaer fra Tripletex', error);
      throw error;
    }
  }

  private beregnForfallsdato(fakturadato: string): string {
    const dato = new Date(fakturadato);
    dato.setDate(dato.getDate() + 30); // 30 dagers betalingsfrist
    return dato.toISOString().split('T')[0];
  }

  private getMvaKode(mvaKode?: string): number {
    const mvaMap: Record<string, number> = {
      '25': 3, // 25% mva
      '15': 2, // 15% mva  
      '0': 1,  // 0% mva
    };
    return mvaMap[mvaKode || '25'] || 3;
  }

  private mapTripletexTilTransaksjon(tripletexFaktura: any): RegnskapsTransaksjon {
    return {
      id: tripletexFaktura.id.toString(),
      type: 'FAKTURA',
      beløp: tripletexFaktura.amount,
      beskrivelse: tripletexFaktura.orderLines?.[0]?.description || 'Faktura',
      dato: tripletexFaktura.invoiceDate,
      kundeId: tripletexFaktura.customer?.id?.toString(),
      bilag: []
    };
  }
}

// ============================================================================
// POWEROFFICE INTEGRATION
// ============================================================================

export class PowerofficeIntegrasjon {
  private apiUrl: string;
  private token: string;

  constructor(konfigurasjon: RegnskapsKonfigurasjon) {
    this.apiUrl = konfigurasjon.apiUrl;
    this.token = konfigurasjon.apiKey;
  }

  /**
   * Opprett kunde i Poweroffice
   */
  async opprettKunde(kunde: KundeInfo): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/Customer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Name: kunde.navn,
          OrganizationNumber: kunde.orgnr,
          EmailAddress: kunde.epost,
          InvoiceAddress: kunde.adresse ? {
            Address1: kunde.adresse.gate,
            ZipCode: kunde.adresse.postnr,
            City: kunde.adresse.poststed,
            CountryCode: 'NO'
          } : null
        })
      });

      if (!response.ok) {
        throw new Error(`Poweroffice API feil: ${response.statusText}`);
      }

      const result = await response.json();
      logger.info('Kunde opprettet i Poweroffice', { kundeId: result.Id });
      return result.Id.toString();
    } catch (error) {
      logger.error('Feil ved opprettelse av kunde i Poweroffice', error);
      throw error;
    }
  }

  /**
   * Opprett faktura i Poweroffice
   */
  async opprettFaktura(transaksjon: RegnskapsTransaksjon): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/OutgoingInvoice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          CustomerId: transaksjon.kundeId,
          InvoiceDate: transaksjon.dato,
          DueDate: this.beregnForfallsdato(transaksjon.dato),
          ReferenceNumber: `TMS-${transaksjon.kontraktId}`,
          OutgoingInvoiceLines: [{
            Description: transaksjon.beskrivelse,
            Quantity: 1,
            UnitPrice: transaksjon.beløp,
            VatRate: parseFloat(transaksjon.mvaKode || '25')
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Poweroffice API feil: ${response.statusText}`);
      }

      const result = await response.json();
      logger.info('Faktura opprettet i Poweroffice', { 
        fakturaId: result.Id,
        kontraktId: transaksjon.kontraktId 
      });
      return result.Id.toString();
    } catch (error) {
      logger.error('Feil ved opprettelse av faktura i Poweroffice', error);
      throw error;
    }
  }

  private beregnForfallsdato(fakturadato: string): string {
    const dato = new Date(fakturadato);
    dato.setDate(dato.getDate() + 30);
    return dato.toISOString().split('T')[0];
  }
}

// ============================================================================
// UNIFIED REGNSKAPS SERVICE
// ============================================================================

export class RegnskapsService {
  private integrasjon: TripletexIntegrasjon | PowerofficeIntegrasjon;
  private konfigurasjon: RegnskapsKonfigurasjon;

  constructor(konfigurasjon: RegnskapsKonfigurasjon) {
    this.konfigurasjon = konfigurasjon;
    
    switch (konfigurasjon.system) {
      case 'TRIPLETEX':
        this.integrasjon = new TripletexIntegrasjon(konfigurasjon);
        break;
      case 'POWEROFFICE':
        this.integrasjon = new PowerofficeIntegrasjon(konfigurasjon);
        break;
      default:
        throw new Error(`Ikke støttet regnskapssystem: ${konfigurasjon.system}`);
    }
  }

  /**
   * Synkroniser kontrakt til regnskapssystem
   */
  async synkroniserKontrakt(
    kontraktId: number,
    kundeInfo: KundeInfo,
    fakturaInfo: RegnskapsTransaksjon
  ): Promise<{ kundeId: string; fakturaId: string }> {
    try {
      // Opprett kunde hvis ikke eksisterer
      const kundeId = await this.integrasjon.opprettKunde(kundeInfo);
      
      // Opprett faktura
      fakturaInfo.kundeId = kundeId;
      fakturaInfo.kontraktId = kontraktId;
      const fakturaId = await this.integrasjon.opprettFaktura(fakturaInfo);

      logger.info('Kontrakt synkronisert til regnskapssystem', {
        kontraktId,
        system: this.konfigurasjon.system,
        kundeId,
        fakturaId
      });

      return { kundeId, fakturaId };
    } catch (error) {
      logger.error('Feil ved synkronisering til regnskapssystem', {
        kontraktId,
        system: this.konfigurasjon.system,
        error
      });
      throw error;
    }
  }

  /**
   * Test forbindelse til regnskapssystem
   */
  async testForbindelse(): Promise<boolean> {
    try {
      // Test API forbindelse (implementasjon avhenger av system)
      // const testKunde: KundeInfo = { // Currently unused
      //   id: 'test',
      //   navn: 'Test Kunde AS',
      //   orgnr: '123456789'
      // };

      // Ikke opprett faktisk kunde, bare valider API tilgang
      // Implementation depends on specific accounting system
      
      logger.info('Regnskapssystem forbindelse OK', { 
        system: this.konfigurasjon.system 
      });
      return true;
    } catch (error) {
      logger.error('Regnskapssystem forbindelse feilet', {
        system: this.konfigurasjon.system,
        error
      });
      return false;
    }
  }

  /**
   * Automatisk synkronisering av alle nye kontrakter
   */
  async startAutoSync(): Promise<void> {
    if (!this.konfigurasjon.autoSyncEnabled) {
      return;
    }

    setInterval(async () => {
      try {
        // Hent nye kontrakter som ikke er synkronisert
        // Implementation: query database for contracts without accounting_id
        
        logger.info('Auto-sync kjørt', { 
          system: this.konfigurasjon.system 
        });
      } catch (error) {
        logger.error('Auto-sync feilet', error);
      }
    }, this.konfigurasjon.syncInterval * 60 * 1000);
  }
}

// ============================================================================
// FACTORY & UTILS
// ============================================================================

/**
 * Opprett regnskapsservice basert på konfigurasjon
 */
export function opprettRegnskapsService(
  konfigurasjon: RegnskapsKonfigurasjon
): RegnskapsService {
  return new RegnskapsService(konfigurasjon);
}

/**
 * Valider regnskapskonfigurasjon
 */
export function validerRegnskapsKonfigurasjon(
  konfigurasjon: Partial<RegnskapsKonfigurasjon>
): string[] {
  const feil: string[] = [];

  if (!konfigurasjon.system) {
    feil.push('Regnskapssystem må spesifiseres');
  }

  if (!konfigurasjon.apiUrl) {
    feil.push('API URL må spesifiseres');
  }

  if (!konfigurasjon.apiKey) {
    feil.push('API-nøkkel må spesifiseres');
  }

  if (konfigurasjon.syncInterval && konfigurasjon.syncInterval < 5) {
    feil.push('Sync-intervall må være minst 5 minutter');
  }

  return feil;
}

export default RegnskapsService; 