import api from '../lib/api';

// Interfaces for rapporter
export interface RapportData {
  id: string;
  navn: string;
  type: 'MÅNEDLIG' | 'UKENTLIG' | 'KVARTALSVIS' | 'ÅRLIG' | 'AD_HOC';
  kategori: 'AKTIVITET' | 'ØKONOMI' | 'UTDANNING' | 'SIKKERHET' | 'RESSURSER' | 'ÅRLIG';
  periode: string;
  generert: string;
  status: 'FERDIG' | 'UNDER_GENERERING' | 'FEILET';
  format: 'PDF' | 'XLSX' | 'CSV';
  størrelse: string;
  beskrivelse: string;
  parameters: Record<string, any>;
}

export interface SikkerhetsRapport {
  id: string;
  tittel: string;
  type: 'UKENTLIG' | 'MÅNEDLIG' | 'KVARTALSVIS' | 'AD_HOC';
  periode: string;
  generert: string;
  status: 'FERDIG' | 'UNDER_GENERERING' | 'FEILET';
  kritiskeAvvik: number;
  totaleKontroller: number;
  beståtteProsent: number;
  risikoscore: 'LAV' | 'MODERAT' | 'HØY' | 'KRITISK' | 'UKJENT';
  kategorier: {
    kjøretøy: { kontroller: number; bestått: number; avvik: number };
    instruktør: { kontroller: number; bestått: number; avvik: number };
    elev: { kontroller: number; bestått: number; avvik: number };
  };
  hovedfunn: string[];
}

export interface PersonalData {
  id: string;
  periode: string;
  ansatte: {
    totalt: number;
    aktive: number;
    nye: number;
    sluttet: number;
    turnover_rate: number;
  };
  produktivitet: {
    timer_totalt: number;
    timer_fakturerbare: number;
    utnyttelsesgrad: number;
    overtime_timer: number;
  };
  kompetanse: {
    sertifiseringer: number;
    kurs_fullført: number;
    gjennomsnitt_score: number;
    forbedring_rate: number;
  };
  tilfredshet: {
    score: number;
    undersøkelser: number;
    klager: number;
    anbefalinger: number;
  };
  kostnad: {
    lønn_totalt: number;
    overtime_kostnad: number;
    opplæring_kostnad: number;
    rekruttering_kostnad: number;
  };
}

export interface CustomerData {
  id: string;
  periode: string;
  demografi: {
    total_kunder: number;
    nye_kunder: number;
    aktive_kunder: number;
    gjennomsnitt_alder: number;
    kjønnsfordeling: {
      menn: number;
      kvinner: number;
    };
  };
  geografi: {
    oslo: number;
    bergen: number;
    trondheim: number;
    stavanger: number;
    andre: number;
  };
  atferd: {
    gjennomsnitt_verdi: number;
    antall_timer_booket: number;
    gjennomsnitt_timer_per_kunde: number;
    fullført_kurs: number;
    avbrutt_kurs: number;
  };
  tilfredshet: {
    nps_score: number;
    kundescore: number;
    anbefalinger: number;
    klager: number;
    gjentakende_kunder: number;
  };
}

export interface OperationalData {
  id: string;
  periode: string;
  produktivitet: {
    timer_totalt: number;
    timer_fakturerbare: number;
    utnyttelsesgrad: number;
    timer_per_elev: number;
  };
  kvalitet: {
    gjennomført_prøver: number;
    bestått_prøver: number;
    bestått_prosent: number;
    gjennomsnitt_karakter: number;
  };
  kapasitet: {
    instruktører_aktive: number;
    kjøretøy_tilgjengelige: number;
    bookede_timer: number;
    ledig_kapasitet: number;
  };
  kundetilfredshet: {
    score: number;
    anmeldelser: number;
    klager: number;
    anbefaling_rate: number;
  };
}

export interface AnalyticsMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: any;
  color: string;
}

class RapporterService {
  // Bedrift rapporter
  async hentBedriftRapporter(bedriftId?: string): Promise<RapportData[]> {
    try {
      const response = await api.get(`/rapporter/bedrift${bedriftId ? `/${bedriftId}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av bedrift-rapporter:', error);
      // Fallback til mock data for utvikling
      return this.getMockBedriftRapporter();
    }
  }

  // Sikkerhetskontroll rapporter
  async hentSikkerhetsRapporter(): Promise<SikkerhetsRapport[]> {
    try {
      const response = await api.get('/rapporter/sikkerhet');
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av sikkerhets-rapporter:', error);
      return this.getMockSikkerhetsRapporter();
    }
  }

  // Personal analyse
  async hentPersonalData(periode?: string): Promise<PersonalData[]> {
    try {
      const response = await api.get(`/rapporter/personal${periode ? `?periode=${periode}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av personal-data:', error);
      return this.getMockPersonalData();
    }
  }

  // Kunde analyse
  async hentCustomerData(periode?: string): Promise<CustomerData[]> {
    try {
      const response = await api.get(`/rapporter/kunder${periode ? `?periode=${periode}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av kunde-data:', error);
      return this.getMockCustomerData();
    }
  }

  // Operasjonell analyse
  async hentOperationalData(periode?: string): Promise<OperationalData[]> {
    try {
      const response = await api.get(`/rapporter/operasjonell${periode ? `?periode=${periode}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av operasjonell data:', error);
      return this.getMockOperationalData();
    }
  }

  // Analytics metrics
  async hentAnalyticsMetrics(): Promise<AnalyticsMetric[]> {
    try {
      const response = await api.get('/analytics/metrics');
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av analytics metrics:', error);
      return this.getMockAnalyticsMetrics();
    }
  }

  // Generer rapport
  async genererRapport(type: string, parametere: Record<string, any>): Promise<{ id: string; status: string }> {
    try {
      const response = await api.post('/rapporter/generer', { type, parametere });
      return response.data;
    } catch (error) {
      console.error('Feil ved generering av rapport:', error);
      throw error;
    }
  }

  // Last ned rapport
  async lastNedRapport(rapportId: string): Promise<Blob> {
    try {
      const response = await api.get(`/rapporter/${rapportId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Feil ved nedlasting av rapport:', error);
      throw error;
    }
  }

  // Mock data metoder (for utvikling)
  private getMockBedriftRapporter(): RapportData[] {
    return [
      {
        id: 'RAP001',
        navn: 'Månedlig Aktivitetsrapport',
        type: 'MÅNEDLIG',
        kategori: 'AKTIVITET',
        periode: 'Mai 2025',
        generert: '2025-06-01',
        status: 'FERDIG',
        format: 'PDF',
        størrelse: '2.1 MB',
        beskrivelse: 'Oversikt over alle aktiviteter og progression for mai måned',
        parameters: {
          antallElever: 24,
          kjørtetimer: 156,
          beståttProver: 8,
          inntekt: 185000
        }
      },
      {
        id: 'RAP002',
        navn: 'Kvartalsøkonomisk Rapport Q1',
        type: 'KVARTALSVIS',
        kategori: 'ØKONOMI',
        periode: 'Q1 2025',
        generert: '2025-04-15',
        status: 'FERDIG',
        format: 'XLSX',
        størrelse: '890 KB',
        beskrivelse: 'Detaljert økonomisk analyse for første kvartal',
        parameters: {
          omsetning: 545000,
          kostnader: 387000,
          resultat: 158000,
          margin: 29
        }
      }
    ];
  }

  private getMockSikkerhetsRapporter(): SikkerhetsRapport[] {
    return [
      {
        id: 'SR001',
        tittel: 'Ukentlig Sikkerhetsstatus',
        type: 'UKENTLIG',
        periode: 'Uke 23, 2025',
        generert: '2025-06-09',
        status: 'FERDIG',
        kritiskeAvvik: 2,
        totaleKontroller: 45,
        beståtteProsent: 93,
        risikoscore: 'LAV',
        kategorier: {
          kjøretøy: { kontroller: 15, bestått: 14, avvik: 1 },
          instruktør: { kontroller: 10, bestått: 10, avvik: 0 },
          elev: { kontroller: 20, bestått: 19, avvik: 1 }
        },
        hovedfunn: [
          'Bremsesystem feil på kjøretøy KJ-001',
          'Manglende førstehjelp-utstyr i bil KJ-003'
        ]
      }
    ];
  }

  private getMockPersonalData(): PersonalData[] {
    return [
      {
        id: '2024-06',
        periode: 'Juni 2024',
        ansatte: {
          totalt: 47,
          aktive: 45,
          nye: 3,
          sluttet: 1,
          turnover_rate: 12.8
        },
        produktivitet: {
          timer_totalt: 1920,
          timer_fakturerbare: 1615,
          utnyttelsesgrad: 84.2,
          overtime_timer: 128
        },
        kompetanse: {
          sertifiseringer: 156,
          kurs_fullført: 23,
          gjennomsnitt_score: 4.6,
          forbedring_rate: 8.5
        },
        tilfredshet: {
          score: 4.6,
          undersøkelser: 42,
          klager: 2,
          anbefalinger: 38
        },
        kostnad: {
          lønn_totalt: 3200000,
          overtime_kostnad: 145000,
          opplæring_kostnad: 85000,
          rekruttering_kostnad: 45000
        }
      }
    ];
  }

  private getMockCustomerData(): CustomerData[] {
    return [
      {
        id: '2024-06',
        periode: 'Juni 2024',
        demografi: {
          total_kunder: 1284,
          nye_kunder: 156,
          aktive_kunder: 892,
          gjennomsnitt_alder: 22.5,
          kjønnsfordeling: {
            menn: 678,
            kvinner: 606
          }
        },
        geografi: {
          oslo: 485,
          bergen: 298,
          trondheim: 189,
          stavanger: 156,
          andre: 156
        },
        atferd: {
          gjennomsnitt_verdi: 15750,
          antall_timer_booket: 3420,
          gjennomsnitt_timer_per_kunde: 38.5,
          fullført_kurs: 187,
          avbrutt_kurs: 23
        },
        tilfredshet: {
          nps_score: 67,
          kundescore: 4.6,
          anbefalinger: 234,
          klager: 8,
          gjentakende_kunder: 301
        }
      }
    ];
  }

  private getMockOperationalData(): OperationalData[] {
    return [
      {
        id: '2024-06',
        periode: 'Juni 2024',
        produktivitet: {
          timer_totalt: 1920,
          timer_fakturerbare: 1506,
          utnyttelsesgrad: 78.4,
          timer_per_elev: 45.2
        },
        kvalitet: {
          gjennomført_prøver: 87,
          bestått_prøver: 81,
          bestått_prosent: 93.1,
          gjennomsnitt_karakter: 4.2
        },
        kapasitet: {
          instruktører_aktive: 24,
          kjøretøy_tilgjengelige: 18,
          bookede_timer: 1506,
          ledig_kapasitet: 21.6
        },
        kundetilfredshet: {
          score: 4.6,
          anmeldelser: 45,
          klager: 2,
          anbefaling_rate: 89.3
        }
      }
    ];
  }

  private getMockAnalyticsMetrics(): AnalyticsMetric[] {
    return [
      {
        label: 'Totale sikkerhetskontroller',
        value: 234,
        change: 12.5,
        trend: 'up',
        icon: null,
        color: 'text-green-600'
      },
      {
        label: 'Avvik funnet',
        value: 18,
        change: -8.2,
        trend: 'down',
        icon: null,
        color: 'text-yellow-600'
      }
    ];
  }
}

export const rapporterService = new RapporterService();
export default rapporterService; 