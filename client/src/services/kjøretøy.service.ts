import api from '../lib/api';

export interface Kjøretøy {
  id: string;
  registreringsnummer: string;
  merke: string;
  modell: string;
  årsmodell: number;
  kjøretøytype: string;
  status: 'aktiv' | 'vedlikehold' | 'inaktiv';
  lastRevision: string;
  nesteRevision: string;
  kilometer: number;
  sitteplasser: number;
  drivstofftype: string;
  forsikring: {
    selskap: string;
    poliseNr: string;
    gyldigTil: string;
  };
  vedlikehold: {
    sistUtført: string;
    nesteService: string;
    kostnaderÅrlig: number;
  };
}

export interface KjøretøyStatistikk {
  totalt: number;
  aktive: number;
  vedlikehold: number;
  inaktive: number;
  gjennomsnittAlder: number;
  totalKilometer: number;
  vedlikeholdskostnader: number;
}

export interface KjøretøyFilter {
  status?: string;
  merke?: string;
  kjøretøytype?: string;
  årsmodellFra?: number;
  årsmodellTil?: number;
}

export interface VedlikeholdHistorikk {
  id: string;
  kjøretøyId: string;
  dato: string;
  type: 'service' | 'reparasjon' | 'revisjon' | 'skade';
  beskrivelse: string;
  kostnad: number;
  verksted: string;
  kilometer: number;
  neste?: string;
}

export interface KjøretøyPlanlegging {
  id: string;
  kjøretøyId: string;
  type: 'service' | 'revisjon' | 'forsikring';
  planlagtDato: string;
  beskrivelse: string;
  estimertKostnad?: number;
  påminnelse: boolean;
  status: 'planlagt' | 'bekreftet' | 'utført' | 'utsatt';
}

class KjøretøyService {
  async hentKjøretøy(bedriftId: string, filter?: KjøretøyFilter): Promise<Kjøretøy[]> {
    try {
      const response = await api.get(`/bedrifter/${bedriftId}/kjøretøy`, { params: filter });
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av kjøretøy:', error);
      return this.hentMockKjøretøy();
    }
  }

  async hentEnkeltKjøretøy(kjøretøyId: string): Promise<Kjøretøy | null> {
    try {
      const response = await api.get(`/kjøretøy/${kjøretøyId}`);
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av kjøretøy:', error);
      return this.hentMockKjøretøy().find(k => k.id === kjøretøyId) || null;
    }
  }

  async opprettKjøretøy(bedriftId: string, kjøretøy: Omit<Kjøretøy, 'id'>): Promise<Kjøretøy> {
    try {
      const response = await api.post(`/bedrifter/${bedriftId}/kjøretøy`, kjøretøy);
      return response.data;
    } catch (error) {
      console.error('Feil ved opprettelse av kjøretøy:', error);
      throw error;
    }
  }

  async oppdaterKjøretøy(kjøretøyId: string, kjøretøy: Partial<Kjøretøy>): Promise<Kjøretøy> {
    try {
      const response = await api.put(`/kjøretøy/${kjøretøyId}`, kjøretøy);
      return response.data;
    } catch (error) {
      console.error('Feil ved oppdatering av kjøretøy:', error);
      throw error;
    }
  }

  async slettKjøretøy(kjøretøyId: string): Promise<void> {
    try {
      await api.delete(`/kjøretøy/${kjøretøyId}`);
    } catch (error) {
      console.error('Feil ved sletting av kjøretøy:', error);
      throw error;
    }
  }

  async hentKjøretøyStatistikk(bedriftId: string): Promise<KjøretøyStatistikk> {
    try {
      const response = await api.get(`/bedrifter/${bedriftId}/kjøretøy/statistikk`);
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av kjøretøystatistikk:', error);
      return this.hentMockKjøretøyStatistikk();
    }
  }

  async hentVedlikeholdHistorikk(kjøretøyId: string): Promise<VedlikeholdHistorikk[]> {
    try {
      const response = await api.get(`/kjøretøy/${kjøretøyId}/vedlikehold`);
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av vedlikeholdhistorikk:', error);
      return this.hentMockVedlikeholdHistorikk();
    }
  }

  async hentKjøretøyPlanlegging(bedriftId: string): Promise<KjøretøyPlanlegging[]> {
    try {
      const response = await api.get(`/bedrifter/${bedriftId}/kjøretøy/planlegging`);
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av kjøretøyplanlegging:', error);
      return this.hentMockKjøretøyPlanlegging();
    }
  }

  async registrerVedlikehold(kjøretøyId: string, vedlikehold: Omit<VedlikeholdHistorikk, 'id' | 'kjøretøyId'>): Promise<VedlikeholdHistorikk> {
    try {
      const response = await api.post(`/kjøretøy/${kjøretøyId}/vedlikehold`, vedlikehold);
      return response.data;
    } catch (error) {
      console.error('Feil ved registrering av vedlikehold:', error);
      throw error;
    }
  }

  async hentKjøretøyFraVegvesen(registreringsnummer: string): Promise<any> {
    try {
      const response = await api.get(`/bedrifter/vegvesen/kjoretoy/${registreringsnummer}`);
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av kjøretøy fra Vegvesen:', error);
      throw error;
    }
  }

  private hentMockKjøretøy(): Kjøretøy[] {
    return [
      {
        id: '1',
        registreringsnummer: 'AB12345',
        merke: 'Toyota',
        modell: 'Yaris',
        årsmodell: 2022,
        kjøretøytype: 'Personbil',
        status: 'aktiv',
        lastRevision: '2024-03-15',
        nesteRevision: '2026-03-15',
        kilometer: 45000,
        sitteplasser: 5,
        drivstofftype: 'Bensin',
        forsikring: {
          selskap: 'If Forsikring',
          poliseNr: 'IF-123456789',
          gyldigTil: '2024-12-31'
        },
        vedlikehold: {
          sistUtført: '2024-05-10',
          nesteService: '2024-11-10',
          kostnaderÅrlig: 15000
        }
      },
      {
        id: '2',
        registreringsnummer: 'CD67890',
        merke: 'Volkswagen',
        modell: 'Golf',
        årsmodell: 2021,
        kjøretøytype: 'Personbil',
        status: 'vedlikehold',
        lastRevision: '2024-01-20',
        nesteRevision: '2026-01-20',
        kilometer: 67000,
        sitteplasser: 5,
        drivstofftype: 'Diesel',
        forsikring: {
          selskap: 'Tryg Forsikring',
          poliseNr: 'TG-987654321',
          gyldigTil: '2024-08-30'
        },
        vedlikehold: {
          sistUtført: '2024-06-01',
          nesteService: '2024-12-01',
          kostnaderÅrlig: 18000
        }
      },
      {
        id: '3',
        registreringsnummer: 'EF98765',
        merke: 'Ford',
        modell: 'Focus',
        årsmodell: 2020,
        kjøretøytype: 'Personbil',
        status: 'aktiv',
        lastRevision: '2024-02-10',
        nesteRevision: '2026-02-10',
        kilometer: 89000,
        sitteplasser: 5,
        drivstofftype: 'Bensin',
        forsikring: {
          selskap: 'Gjensidige',
          poliseNr: 'GJ-456789123',
          gyldigTil: '2024-10-15'
        },
        vedlikehold: {
          sistUtført: '2024-04-20',
          nesteService: '2024-10-20',
          kostnaderÅrlig: 16500
        }
      },
      {
        id: '4',
        registreringsnummer: 'GH54321',
        merke: 'Skoda',
        modell: 'Octavia',
        årsmodell: 2019,
        kjøretøytype: 'Stasjonsvogn',
        status: 'inaktiv',
        lastRevision: '2023-12-05',
        nesteRevision: '2025-12-05',
        kilometer: 125000,
        sitteplasser: 5,
        drivstofftype: 'Diesel',
        forsikring: {
          selskap: 'Storebrand',
          poliseNr: 'SB-789123456',
          gyldigTil: '2024-06-30'
        },
        vedlikehold: {
          sistUtført: '2024-01-15',
          nesteService: '2024-07-15',
          kostnaderÅrlig: 22000
        }
      }
    ];
  }

  private hentMockKjøretøyStatistikk(): KjøretøyStatistikk {
    return {
      totalt: 4,
      aktive: 2,
      vedlikehold: 1,
      inaktive: 1,
      gjennomsnittAlder: 3.5,
      totalKilometer: 326000,
      vedlikeholdskostnader: 71500
    };
  }

  private hentMockVedlikeholdHistorikk(): VedlikeholdHistorikk[] {
    return [
      {
        id: 'vh-1',
        kjøretøyId: '1',
        dato: '2024-05-10',
        type: 'service',
        beskrivelse: 'Ordinær service - olje, filter, bremsevæske',
        kostnad: 3500,
        verksted: 'Toyota Service Oslo',
        kilometer: 45000,
        neste: '2024-11-10'
      },
      {
        id: 'vh-2',
        kjøretøyId: '1',
        dato: '2024-03-15',
        type: 'revisjon',
        beskrivelse: 'Periodisk kjøretøykontroll',
        kostnad: 800,
        verksted: 'Statens Vegvesen',
        kilometer: 42000,
        neste: '2026-03-15'
      },
      {
        id: 'vh-3',
        kjøretøyId: '2',
        dato: '2024-06-01',
        type: 'reparasjon',
        beskrivelse: 'Utskifting av clutch',
        kostnad: 12000,
        verksted: 'VW Service Bergen',
        kilometer: 67000
      }
    ];
  }

  private hentMockKjøretøyPlanlegging(): KjøretøyPlanlegging[] {
    return [
      {
        id: 'kp-1',
        kjøretøyId: '1',
        type: 'service',
        planlagtDato: '2024-11-10',
        beskrivelse: 'Ordinær service',
        estimertKostnad: 3500,
        påminnelse: true,
        status: 'planlagt'
      },
      {
        id: 'kp-2',
        kjøretøyId: '2',
        type: 'service',
        planlagtDato: '2024-12-01',
        beskrivelse: 'Service etter clutch-reparasjon',
        estimertKostnad: 2500,
        påminnelse: true,
        status: 'bekreftet'
      },
      {
        id: 'kp-3',
        kjøretøyId: '3',
        type: 'forsikring',
        planlagtDato: '2024-10-15',
        beskrivelse: 'Fornyelse av forsikring',
        påminnelse: true,
        status: 'planlagt'
      }
    ];
  }
}

export const kjøretøyService = new KjøretøyService(); 