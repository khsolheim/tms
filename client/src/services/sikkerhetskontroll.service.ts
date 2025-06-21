import api from '../lib/api';

// Dashboard interfaces
export interface SikkerhetskontrollDashboardData {
  quickStats: {
    totaleSjekkpunkter: number;
    a1Sjekkpunkter: number;
    forskjelligeSystemer: number;
  };
}

// Interfaces
export interface SikkerhetskontrollStatistikk {
  totalControls: number;
  completedControls: number;
  pendingControls: number;
  failedControls: number;
  averageCompletionTime: number;
  complianceRate: number;
  criticalIssues: number;
  trendChange: number;
}

export interface MonthlyTrend {
  month: string;
  completed: number;
  failed: number;
  pending: number;
}

export interface TopIssue {
  category: string;
  count: number;
  severity: 'low' | 'medium' | 'high';
}

export interface CompanyComparison {
  name: string;
  score: number;
  controls: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ArchivedControl {
  id: string;
  kontrollId: string;
  tittel: string;
  bedrift: string;
  kontrollør: string;
  dato: string;
  arkiveringsDato: string;
  status: 'godkjent' | 'avvik' | 'ikke_utført';
  kategori: string;
  dokumenter: number;
  årsak: string;
  oppbevaringsPeriode: string;
  kanSlettes: boolean;
  tags: string[];
  størrelse: string;
}

export interface SigningDocument {
  id: string;
  title: string;
  company: string;
  type: 'safety_check' | 'inspection' | 'report' | 'certificate';
  status: 'pending' | 'signed' | 'expired';
  createdDate: string;
  dueDate: string;
  urgency: 'low' | 'medium' | 'high';
  requiredSignatures: Array<{
    role: string;
    name: string;
    required: boolean;
  }>;
  completedSignatures: Array<{
    role: string;
    name: string;
    signedDate: string;
    signature: string;
  }>;
}

export interface StatisticsFilter {
  status: 'all' | 'completed' | 'pending' | 'failed';
  dateFrom?: string;
  dateTo?: string;
  company?: string;
  category?: string;
}

class SikkerhetskontrollService {
  // Dashboard
  async hentDashboardData(): Promise<SikkerhetskontrollDashboardData> {
    try {
      const response = await api.get('/sikkerhetskontroll/dashboard');
      return response.data;
    } catch (error) {
      // Returner standarddata hvis API ikke er tilgjengelig
      return this.getStandardDashboardData();
    }
  }

  private getStandardDashboardData(): SikkerhetskontrollDashboardData {
    return {
      quickStats: {
        totaleSjekkpunkter: 21,
        a1Sjekkpunkter: 10,
        forskjelligeSystemer: 6
      }
    };
  }

  // Statistikk
  async hentStatistikk(filter?: StatisticsFilter): Promise<SikkerhetskontrollStatistikk> {
    const response = await api.get('/sikkerhetskontroll/statistikk', { params: filter });
    return response.data;
  }

  async hentMånedligeTrends(): Promise<MonthlyTrend[]> {
    const response = await api.get('/sikkerhetskontroll/trends/monthly');
    return response.data;
  }

  async hentTopProblemer(): Promise<TopIssue[]> {
    const response = await api.get('/sikkerhetskontroll/issues/top');
    return response.data;
  }

  async hentBedriftSammenligning(): Promise<CompanyComparison[]> {
    const response = await api.get('/sikkerhetskontroll/comparison/companies');
    return response.data;
  }

  // Arkiv
  async hentArkiverteKontroller(): Promise<ArchivedControl[]> {
    const response = await api.get('/sikkerhetskontroll/arkiv');
    return response.data;
  }

  async arkiverKontroll(kontrollId: string, årsak: string): Promise<void> {
    await api.post(`/sikkerhetskontroll/${kontrollId}/arkiver`, { årsak });
  }

  async slettArkivertKontroll(arkivId: string): Promise<void> {
    await api.delete(`/sikkerhetskontroll/arkiv/${arkivId}`);
  }

  async eksporterArkiv(arkivIds: string[]): Promise<Blob> {
    const response = await api.post('/sikkerhetskontroll/arkiv/eksporter', 
      { arkivIds }, 
      { responseType: 'blob' }
    );
    return response.data;
  }

  // Avtegning/Signering
  async hentSigneringsDokumenter(): Promise<SigningDocument[]> {
    const response = await api.get('/sikkerhetskontroll/signering');
    return response.data;
  }

  async signerDokument(dokumentId: string, signatur: string): Promise<void> {
    await api.post(`/sikkerhetskontroll/signering/${dokumentId}/signer`, { signatur });
  }

  async avvisDokument(dokumentId: string, årsak: string): Promise<void> {
    await api.post(`/sikkerhetskontroll/signering/${dokumentId}/avvis`, { årsak });
  }

  // Mock data for utvikling
  async hentStatistikkMock(): Promise<{
    overallStats: SikkerhetskontrollStatistikk;
    monthlyTrends: MonthlyTrend[];
    topIssues: TopIssue[];
    companyComparison: CompanyComparison[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const overallStats: SikkerhetskontrollStatistikk = {
      totalControls: 2847,
      completedControls: 2495,
      pendingControls: 234,
      failedControls: 118,
      averageCompletionTime: 24.5,
      complianceRate: 87.6,
      criticalIssues: 23,
      trendChange: 5.2
    };

    const monthlyTrends: MonthlyTrend[] = [
      { month: 'Jan', completed: 245, failed: 12, pending: 23 },
      { month: 'Feb', completed: 267, failed: 8, pending: 19 },
      { month: 'Mar', completed: 289, failed: 15, pending: 27 },
      { month: 'Apr', completed: 234, failed: 11, pending: 31 },
      { month: 'Mai', completed: 298, failed: 9, pending: 18 },
      { month: 'Jun', completed: 312, failed: 7, pending: 22 }
    ];

    const topIssues: TopIssue[] = [
      { category: 'Brannslukningsapparat', count: 34, severity: 'high' },
      { category: 'Førstehjelp utstyr', count: 28, severity: 'medium' },
      { category: 'Nødutgang', count: 19, severity: 'high' },
      { category: 'Verneinnretning', count: 15, severity: 'low' },
      { category: 'Renhold', count: 12, severity: 'medium' }
    ];

    const companyComparison: CompanyComparison[] = [
      { name: 'ABC Transport AS', score: 94.2, controls: 145, trend: 'up' },
      { name: 'XYZ Logistics', score: 89.7, controls: 89, trend: 'up' },
      { name: 'Nordic Freight', score: 85.3, controls: 112, trend: 'down' },
      { name: 'Scandinavian Cargo', score: 82.1, controls: 67, trend: 'stable' },
      { name: 'Oslo Transport', score: 78.9, controls: 98, trend: 'up' }
    ];

    return { overallStats, monthlyTrends, topIssues, companyComparison };
  }

  async hentArkivMock(): Promise<ArchivedControl[]> {
    await new Promise(resolve => setTimeout(resolve, 400));

    return [
      {
        id: 'arch-1',
        kontrollId: 'SK-2024-001',
        tittel: 'Månedlig sikkerhetssjekk - Verksted A',
        bedrift: 'Oslo Trafikkskole AS',
        kontrollør: 'Lars Hansen',
        dato: '2024-01-15',
        arkiveringsDato: '2024-02-15',
        status: 'godkjent',
        kategori: 'Verksted',
        dokumenter: 8,
        årsak: 'Automatisk arkivering etter 30 dager',
        oppbevaringsPeriode: '7 år',
        kanSlettes: false,
        tags: ['verksted', 'månedlig', 'rutinejekk'],
        størrelse: '2.4 MB'
      },
      {
        id: 'arch-2',
        kontrollId: 'SK-2024-002',
        tittel: 'Kjøretøy sikkerhetskontroll - Fleet B',
        bedrift: 'Bergen Trafikkskole',
        kontrollør: 'Nina Olsen',
        dato: '2024-01-20',
        arkiveringsDato: '2024-03-01',
        status: 'avvik',
        kategori: 'Kjøretøy',
        dokumenter: 12,
        årsak: 'Manuell arkivering - sak løst',
        oppbevaringsPeriode: '10 år',
        kanSlettes: false,
        tags: ['kjøretøy', 'avvik', 'fleet'],
        størrelse: '5.8 MB'
      },
      {
        id: 'arch-3',
        kontrollId: 'SK-2024-003',
        tittel: 'HMS-kontroll kontorlokaler',
        bedrift: 'Trondheim Kjøreskole',
        kontrollør: 'Per Andersen',
        dato: '2024-02-10',
        arkiveringsDato: '2024-03-15',
        status: 'godkjent',
        kategori: 'HMS',
        dokumenter: 6,
        årsak: 'Automatisk arkivering etter 30 dager',
        oppbevaringsPeriode: '5 år',
        kanSlettes: true,
        tags: ['hms', 'kontor', 'rutinejekk'],
        størrelse: '1.9 MB'
      }
    ];
  }

  async hentSigneringMock(): Promise<SigningDocument[]> {
    await new Promise(resolve => setTimeout(resolve, 350));

    return [
      {
        id: '1',
        title: 'HMS Kontroll - Hovedlager',
        company: 'ABC Transport AS',
        type: 'safety_check',
        status: 'pending',
        createdDate: '2025-06-10',
        dueDate: '2025-06-17',
        urgency: 'high',
        requiredSignatures: [
          { role: 'HMS Ansvarlig', name: 'Per Hansen', required: true },
          { role: 'Leder', name: 'Kari Olsen', required: true },
          { role: 'Verneombud', name: 'Ole Nordahl', required: false }
        ],
        completedSignatures: [
          { role: 'HMS Ansvarlig', name: 'Per Hansen', signedDate: '2025-06-12', signature: 'signature_data_1' }
        ]
      },
      {
        id: '2',
        title: 'Brannøvelse Rapport',
        company: 'XYZ Logistics',
        type: 'inspection',
        status: 'signed',
        createdDate: '2025-06-05',
        dueDate: '2025-06-12',
        urgency: 'medium',
        requiredSignatures: [
          { role: 'Brannvernleder', name: 'Anne Berg', required: true },
          { role: 'Daglig leder', name: 'Tom Eriksen', required: true }
        ],
        completedSignatures: [
          { role: 'Brannvernleder', name: 'Anne Berg', signedDate: '2025-06-10', signature: 'signature_data_2' },
          { role: 'Daglig leder', name: 'Tom Eriksen', signedDate: '2025-06-11', signature: 'signature_data_3' }
        ]
      },
      {
        id: '3',
        title: 'Årlig Sikkerhetsrapport',
        company: 'Nordic Freight',
        type: 'report',
        status: 'pending',
        createdDate: '2025-06-08',
        dueDate: '2025-06-20',
        urgency: 'low',
        requiredSignatures: [
          { role: 'Sikkerhetsansvarlig', name: 'Maria Larsen', required: true },
          { role: 'Administrerende direktør', name: 'John Smith', required: true }
        ],
        completedSignatures: []
      }
    ];
  }
}

export const sikkerhetskontrollService = new SikkerhetskontrollService();
export default sikkerhetskontrollService; 