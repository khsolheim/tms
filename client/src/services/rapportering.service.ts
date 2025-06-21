import api from '../lib/api';

// Interfaces
export interface FinancialData {
  id: string;
  periode: string;
  inntekter: number;
  utgifter: number;
  resultat: number;
  margin: number;
  kundeantall: number;
  gjennomsnittFaktura: number;
  kategori: 'MÅNEDLIG' | 'KVARTALSVIS' | 'ÅRLIG';
  detaljer: {
    kjøretimer: number;
    teoriundervisning: number;
    prøveavgifter: number;
    andre: number;
  };
}

export interface OperationalData {
  id: string;
  periode: string;
  antallElever: number;
  nyeElever: number;
  fullførteElever: number;
  aktivitetsrate: number;
  gjennomsnittTimer: number;
  beståttprosent: number;
  instruktørUtilisering: number;
  kjøretøyUtilisering: number;
  kategori: 'DAGLIG' | 'UKENTLIG' | 'MÅNEDLIG';
}

export interface ExportTemplate {
  id: string;
  navn: string;
  beskrivelse: string;
  type: 'FINANSIELL' | 'OPERASJONELL' | 'ELEV' | 'INSTRUKTØR' | 'CUSTOM';
  format: 'PDF' | 'EXCEL' | 'CSV' | 'JSON';
  felter: string[];
  filtre: Record<string, any>;
  opprettet: string;
  sistBrukt?: string;
  antallBruk: number;
}

export interface ExportHistory {
  id: string;
  templateId: string;
  templateNavn: string;
  format: string;
  status: 'VELLYKKET' | 'FEILET' | 'BEHANDLES';
  filstørrelse?: number;
  nedlastningsUrl?: string;
  opprettet: string;
  fullført?: string;
  feilmelding?: string;
}

export interface RapportFilters {
  periode?: string;
  type?: string;
  kategori?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ReportCard {
  title: string;
  description: string;
  icon: string;
  solidIcon: string;
  href: string;
  color: string;
  stats?: {
    total: string;
    change: string;
    changeType: 'increase' | 'decrease' | 'neutral';
  };
  lastUpdated: string;
}

export interface QuickAction {
  name: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

export interface RapporteringDashboardData {
  reportSections: ReportCard[];
  quickActions: QuickAction[];
}

export interface Rapport {
  id: string;
  navn: string;
  beskrivelse: string;
  type: 'finansiell' | 'operasjonell' | 'sikkerhet' | 'bruker' | 'custom';
  opprettet: string;
  sistOppdatert: string;
  opprettetAv: string;
  status: 'draft' | 'published' | 'archived';
  data: any;
  parametere: { [key: string]: any };
}

export interface RapportMal {
  id: string;
  navn: string;
  beskrivelse: string;
  kategori: string;
  parametere: RapportParameter[];
  standardVerdier: { [key: string]: any };
}

export interface RapportParameter {
  navn: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  påkrevd: boolean;
  standardVerdi?: any;
  alternativer?: string[];
  beskrivelse?: string;
}

export interface RapportPlanlegging {
  id: string;
  rapportId: string;
  navn: string;
  frekvens: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nestKjoring: string;
  aktiv: boolean;
  mottakere: string[];
  format: 'pdf' | 'excel' | 'csv';
}

class RapporteringService {
  // Hent finansielle data
  async hentFinansielleData(filters?: RapportFilters): Promise<FinancialData[]> {
    const params = new URLSearchParams();
    if (filters?.periode) params.append('periode', filters.periode);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    const response = await api.get(`/rapporter/finansiell?${params.toString()}`);
    return response.data;
  }

  // Hent operasjonelle data
  async hentOperasjonelleData(filters?: RapportFilters): Promise<OperationalData[]> {
    const params = new URLSearchParams();
    if (filters?.periode) params.append('periode', filters.periode);
    if (filters?.kategori) params.append('kategori', filters.kategori);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    const response = await api.get(`/rapporter/operasjonell?${params.toString()}`);
    return response.data;
  }

  // Hent eksport-maler
  async hentEksportMaler(): Promise<ExportTemplate[]> {
    const response = await api.get('/rapporter/eksport/maler');
    return response.data;
  }

  // Hent eksport-historikk
  async hentEksportHistorikk(): Promise<ExportHistory[]> {
    const response = await api.get('/rapporter/eksport/historikk');
    return response.data;
  }

  // Opprett eksport-mal
  async opprettEksportMal(malData: Partial<ExportTemplate>): Promise<ExportTemplate> {
    const response = await api.post('/rapporter/eksport/maler', malData);
    return response.data;
  }

  // Eksporter rapport
  async eksporterRapportTemplate(templateId: string, format: string): Promise<ExportHistory> {
    const response = await api.post(`/rapporter/eksport/${templateId}`, { format });
    return response.data;
  }

  // Mock data for utvikling
  async hentFinansielleDataMock(): Promise<FinancialData[]> {
    await new Promise(resolve => setTimeout(resolve, 500));

    return [
      {
        id: '1',
        periode: '2025-06',
        inntekter: 285000,
        utgifter: 165000,
        resultat: 120000,
        margin: 42.1,
        kundeantall: 45,
        gjennomsnittFaktura: 6333,
        kategori: 'MÅNEDLIG',
        detaljer: {
          kjøretimer: 180000,
          teoriundervisning: 65000,
          prøveavgifter: 25000,
          andre: 15000
        }
      },
      {
        id: '2',
        periode: '2025-05',
        inntekter: 312000,
        utgifter: 178000,
        resultat: 134000,
        margin: 42.9,
        kundeantall: 52,
        gjennomsnittFaktura: 6000,
        kategori: 'MÅNEDLIG',
        detaljer: {
          kjøretimer: 195000,
          teoriundervisning: 72000,
          prøveavgifter: 30000,
          andre: 15000
        }
      },
      {
        id: '3',
        periode: '2025-04',
        inntekter: 298000,
        utgifter: 172000,
        resultat: 126000,
        margin: 42.3,
        kundeantall: 48,
        gjennomsnittFaktura: 6208,
        kategori: 'MÅNEDLIG',
        detaljer: {
          kjøretimer: 188000,
          teoriundervisning: 68000,
          prøveavgifter: 27000,
          andre: 15000
        }
      },
      {
        id: '4',
        periode: '2025-03',
        inntekter: 275000,
        utgifter: 158000,
        resultat: 117000,
        margin: 42.5,
        kundeantall: 43,
        gjennomsnittFaktura: 6395,
        kategori: 'MÅNEDLIG',
        detaljer: {
          kjøretimer: 175000,
          teoriundervisning: 62000,
          prøveavgifter: 23000,
          andre: 15000
        }
      },
      {
        id: '5',
        periode: '2025-02',
        inntekter: 265000,
        utgifter: 152000,
        resultat: 113000,
        margin: 42.6,
        kundeantall: 41,
        gjennomsnittFaktura: 6463,
        kategori: 'MÅNEDLIG',
        detaljer: {
          kjøretimer: 168000,
          teoriundervisning: 58000,
          prøveavgifter: 24000,
          andre: 15000
        }
      },
      {
        id: '6',
        periode: '2025-01',
        inntekter: 245000,
        utgifter: 145000,
        resultat: 100000,
        margin: 40.8,
        kundeantall: 38,
        gjennomsnittFaktura: 6447,
        kategori: 'MÅNEDLIG',
        detaljer: {
          kjøretimer: 155000,
          teoriundervisning: 55000,
          prøveavgifter: 20000,
          andre: 15000
        }
      }
    ];
  }

  async hentOperasjonelleDataMock(): Promise<OperationalData[]> {
    await new Promise(resolve => setTimeout(resolve, 500));

    return [
      {
        id: '1',
        periode: '2025-06',
        antallElever: 125,
        nyeElever: 18,
        fullførteElever: 12,
        aktivitetsrate: 78.5,
        gjennomsnittTimer: 24.3,
        beståttprosent: 85.2,
        instruktørUtilisering: 82.1,
        kjøretøyUtilisering: 76.8,
        kategori: 'MÅNEDLIG'
      },
      {
        id: '2',
        periode: '2025-05',
        antallElever: 119,
        nyeElever: 22,
        fullførteElever: 15,
        aktivitetsrate: 81.2,
        gjennomsnittTimer: 25.1,
        beståttprosent: 88.1,
        instruktørUtilisering: 85.3,
        kjøretøyUtilisering: 79.2,
        kategori: 'MÅNEDLIG'
      },
      {
        id: '3',
        periode: '2025-04',
        antallElever: 112,
        nyeElever: 16,
        fullførteElever: 11,
        aktivitetsrate: 75.8,
        gjennomsnittTimer: 23.7,
        beståttprosent: 82.4,
        instruktørUtilisering: 78.9,
        kjøretøyUtilisering: 74.1,
        kategori: 'MÅNEDLIG'
      },
      {
        id: '4',
        periode: '2025-03',
        antallElever: 107,
        nyeElever: 19,
        fullførteElever: 13,
        aktivitetsrate: 79.3,
        gjennomsnittTimer: 24.8,
        beståttprosent: 86.7,
        instruktørUtilisering: 81.7,
        kjøretøyUtilisering: 77.5,
        kategori: 'MÅNEDLIG'
      },
      {
        id: '5',
        periode: '2025-02',
        antallElever: 101,
        nyeElever: 14,
        fullførteElever: 9,
        aktivitetsrate: 73.2,
        gjennomsnittTimer: 22.9,
        beståttprosent: 79.8,
        instruktørUtilisering: 76.4,
        kjøretøyUtilisering: 71.3,
        kategori: 'MÅNEDLIG'
      },
      {
        id: '6',
        periode: '2025-01',
        antallElever: 96,
        nyeElever: 21,
        fullførteElever: 8,
        aktivitetsrate: 77.1,
        gjennomsnittTimer: 23.5,
        beståttprosent: 83.3,
        instruktørUtilisering: 79.8,
        kjøretøyUtilisering: 73.9,
        kategori: 'MÅNEDLIG'
      }
    ];
  }

  async hentEksportMalerMock(): Promise<ExportTemplate[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return [
      {
        id: '1',
        navn: 'Månedlig Finansrapport',
        beskrivelse: 'Komplett finansiell oversikt for månedlig rapportering',
        type: 'FINANSIELL',
        format: 'PDF',
        felter: ['inntekter', 'utgifter', 'resultat', 'margin', 'kundeantall'],
        filtre: { periode: 'månedlig' },
        opprettet: '2025-01-15T10:00:00Z',
        sistBrukt: '2025-06-15T14:30:00Z',
        antallBruk: 6
      },
      {
        id: '2',
        navn: 'Elevstatistikk Excel',
        beskrivelse: 'Detaljert elevstatistikk for analyse i Excel',
        type: 'ELEV',
        format: 'EXCEL',
        felter: ['navn', 'startdato', 'timer', 'fremgang', 'status'],
        filtre: { status: 'aktiv' },
        opprettet: '2025-02-01T09:00:00Z',
        sistBrukt: '2025-06-10T11:15:00Z',
        antallBruk: 12
      },
      {
        id: '3',
        navn: 'Instruktør Utiliseringsrapport',
        beskrivelse: 'Oversikt over instruktør arbeidsbelastning og effektivitet',
        type: 'INSTRUKTØR',
        format: 'PDF',
        felter: ['navn', 'timer', 'utiliseringsgrad', 'elevantall', 'vurdering'],
        filtre: { periode: 'ukentlig' },
        opprettet: '2025-03-10T13:00:00Z',
        sistBrukt: '2025-06-12T16:45:00Z',
        antallBruk: 8
      }
    ];
  }

  async hentEksportHistorikkMock(): Promise<ExportHistory[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return [
      {
        id: '1',
        templateId: '1',
        templateNavn: 'Månedlig Finansrapport',
        format: 'PDF',
        status: 'VELLYKKET',
        filstørrelse: 2048576,
        nedlastningsUrl: '/downloads/finansrapport-2025-06.pdf',
        opprettet: '2025-06-15T14:30:00Z',
        fullført: '2025-06-15T14:31:23Z'
      },
      {
        id: '2',
        templateId: '2',
        templateNavn: 'Elevstatistikk Excel',
        format: 'EXCEL',
        status: 'VELLYKKET',
        filstørrelse: 1536000,
        nedlastningsUrl: '/downloads/elevstatistikk-2025-06.xlsx',
        opprettet: '2025-06-10T11:15:00Z',
        fullført: '2025-06-10T11:16:45Z'
      },
      {
        id: '3',
        templateId: '3',
        templateNavn: 'Instruktør Utiliseringsrapport',
        format: 'PDF',
        status: 'FEILET',
        opprettet: '2025-06-08T09:30:00Z',
        feilmelding: 'Ikke tilstrekkelig data for valgt periode'
      },
      {
        id: '4',
        templateId: '1',
        templateNavn: 'Månedlig Finansrapport',
        format: 'PDF',
        status: 'BEHANDLES',
        opprettet: '2025-06-16T10:00:00Z'
      }
    ];
  }

  async hentDashboardData(): Promise<RapporteringDashboardData> {
    try {
      const response = await api.get('/rapportering/dashboard');
      return response.data;
    } catch (error) {
      // Returner standarddata hvis API ikke er tilgjengelig
      return this.getStandardDashboardData();
    }
  }

  async hentRapporter(): Promise<Rapport[]> {
    const response = await api.get('/rapportering/rapporter');
    return response.data;
  }

  async hentRapport(id: string): Promise<Rapport> {
    const response = await api.get(`/rapportering/rapporter/${id}`);
    return response.data;
  }

  async opprettRapport(rapport: Omit<Rapport, 'id' | 'opprettet' | 'sistOppdatert'>): Promise<Rapport> {
    const response = await api.post('/rapportering/rapporter', rapport);
    return response.data;
  }

  async oppdaterRapport(id: string, rapport: Partial<Rapport>): Promise<Rapport> {
    const response = await api.put(`/rapportering/rapporter/${id}`, rapport);
    return response.data;
  }

  async slettRapport(id: string): Promise<void> {
    await api.delete(`/rapportering/rapporter/${id}`);
  }

  async genererRapport(malId: string, parametere: { [key: string]: any }): Promise<Rapport> {
    const response = await api.post('/rapportering/generer', { malId, parametere });
    return response.data;
  }

  async eksporterRapport(rapportId: string, format: 'pdf' | 'excel' | 'csv'): Promise<Blob> {
    const response = await api.get(`/rapportering/rapporter/${rapportId}/eksport/${format}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async hentRapportMaler(): Promise<RapportMal[]> {
    const response = await api.get('/rapportering/maler');
    return response.data;
  }

  async opprettRapportMal(mal: Omit<RapportMal, 'id'>): Promise<RapportMal> {
    const response = await api.post('/rapportering/maler', mal);
    return response.data;
  }

  async hentPlanlagteRapporter(): Promise<RapportPlanlegging[]> {
    const response = await api.get('/rapportering/planlegging');
    return response.data;
  }

  async opprettPlanlagtRapport(planlegging: Omit<RapportPlanlegging, 'id'>): Promise<RapportPlanlegging> {
    const response = await api.post('/rapportering/planlegging', planlegging);
    return response.data;
  }

  async oppdaterPlanlagtRapport(id: string, planlegging: Partial<RapportPlanlegging>): Promise<RapportPlanlegging> {
    const response = await api.put(`/rapportering/planlegging/${id}`, planlegging);
    return response.data;
  }

  async slettPlanlagtRapport(id: string): Promise<void> {
    await api.delete(`/rapportering/planlegging/${id}`);
  }



  private getStandardDashboardData(): RapporteringDashboardData {
    return {
      reportSections: [
        {
          title: 'Business Intelligence',
          description: 'Avanserte analyser, KPI-dashboards og prediktive modeller for dybdeinnsikt i virksomheten.',
          icon: 'ChartBarIcon',
          solidIcon: 'ChartBarSolidIcon',
          href: '/rapportering/business-intelligence',
          color: 'blue',
          stats: {
            total: '24 aktive dashboards',
            change: '+12%',
            changeType: 'increase'
          },
          lastUpdated: '2 timer siden'
        },
        {
          title: 'Økonomirapporter',
          description: 'Finansielle rapporter, budsjettanalyser og økonomisk ytelse for styring og planlegging.',
          icon: 'CurrencyDollarIcon',
          solidIcon: 'CurrencyDollarIcon',
          href: '/rapportering/okonomi',
          color: 'green',
          stats: {
            total: 'NOK 2.4M omsetning',
            change: '+8.3%',
            changeType: 'increase'
          },
          lastUpdated: '1 time siden'
        },
        {
          title: 'Sikkerhetsrapporter',
          description: 'Sikkerhetskontroller, avvikshåndtering og compliance-rapporter for kvalitetssikring.',
          icon: 'ShieldCheckIcon',
          solidIcon: 'ShieldCheckIcon',
          href: '/rapportering/sikkerhet',
          color: 'red',
          stats: {
            total: '98.7% godkjent',
            change: '+2.1%',
            changeType: 'increase'
          },
          lastUpdated: '30 min siden'
        },
        {
          title: 'Brukerrapporter',
          description: 'Brukeraktivitet, engasjement og systembruk for optimering av brukeropplevelsen.',
          icon: 'UsersIcon',
          solidIcon: 'UsersIcon',
          href: '/rapportering/brukere',
          color: 'purple',
          stats: {
            total: '342 aktive brukere',
            change: '+15.2%',
            changeType: 'increase'
          },
          lastUpdated: '15 min siden'
        },
        {
          title: 'Operasjonelle Rapporter',
          description: 'Driftsstatistikk, ressursbruk og operasjonell effektivitet for kontinuerlig forbedring.',
          icon: 'DocumentChartBarIcon',
          solidIcon: 'DocumentChartBarSolidIcon',
          href: '/rapportering/operasjonelle',
          color: 'indigo',
          stats: {
            total: '94.2% oppetid',
            change: '+1.8%',
            changeType: 'increase'
          },
          lastUpdated: '5 min siden'
        }
      ],
      quickActions: [
        {
          name: 'Generer rapport',
          description: 'Opprett tilpasset rapport',
          icon: 'DocumentArrowDownIcon',
          href: '/rapportering/generer',
          color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
        },
        {
          name: 'Planlegg rapport',
          description: 'Sett opp automatisk rapportering',
          icon: 'CalendarIcon',
          href: '/rapportering/planlegg',
          color: 'bg-green-50 text-green-700 hover:bg-green-100'
        },
        {
          name: 'Rapporthistorikk',
          description: 'Se tidligere rapporter',
          icon: 'ClockIcon',
          href: '/rapportering/historikk',
          color: 'bg-purple-50 text-purple-700 hover:bg-purple-100'
        },
        {
          name: 'Innstillinger',
          description: 'Konfigurer rapportering',
          icon: 'Cog6ToothIcon',
          href: '/rapportering/innstillinger',
          color: 'bg-gray-50 text-gray-700 hover:bg-gray-100'
        }
      ]
    };
  }
}

const rapporteringService = new RapporteringService();
export { rapporteringService };
export default rapporteringService; 