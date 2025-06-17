/**
 * Analytics & Business Intelligence Service
 * 
 * Håndterer avancerte analytics og business intelligence operasjoner
 * - Brukeranalyse og atferdssporing
 * - Business intelligence dashboards
 * - Custom metrics og KPI-er
 * - Prediktiv analyse
 */

import { PrismaClient } from '@prisma/client';
import { BaseService } from './base.service';
import logger from '../utils/logger';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AnalyticsEvent {
  userId?: number;
  sessionId?: string;
  eventName: string;
  properties: Record<string, any>;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
  bedriftId?: number;
  tenantId?: number;
}

export interface UserAnalytics {
  userId: number;
  totalSessions: number;
  totalEvents: number;
  averageSessionDuration: number; // minutter
  lastActiveDate: Date;
  mostUsedFeatures: string[];
  conversionEvents: number;
  retentionRate: number; // prosent
}

export interface BusinessMetrics {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate: Date;
  endDate: Date;
  metrics: {
    activeUsers: number;
    newSignups: number;
    totalContracts: number;
    completedContracts: number;
    conversionRate: number;
    revenue: number;
    averageContractValue: number;
    customerRetention: number;
    featureAdoption: Record<string, number>;
    performanceMetrics: {
      averageLoadTime: number;
      errorRate: number;
      uptime: number;
    };
  };
}

export interface DashboardData {
  overview: {
    totalUsers: number;
    activeUsers24h: number;
    totalContracts: number;
    completedContracts: number;
    totalRevenue: number;
    conversionRate: number;
  };
  trends: {
    userGrowth: Array<{ date: string; count: number }>;
    contractTrends: Array<{ date: string; contracts: number; completed: number }>;
    revenueTrends: Array<{ date: string; revenue: number }>;
    featureUsage: Array<{ feature: string; usage: number; growth: number }>;
  };
  segments: {
    usersByType: Array<{ type: string; count: number }>;
    contractsByStatus: Array<{ status: string; count: number }>;
    revenueBySource: Array<{ source: string; revenue: number }>;
  };
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    metric: string;
    threshold: number;
    current: number;
  }>;
}

export interface PredictiveAnalysis {
  churnPrediction: {
    userId: number;
    churnProbability: number;
    riskFactors: string[];
    recommendedActions: string[];
  }[];
  revenueForecast: {
    period: string;
    predictedRevenue: number;
    confidence: number;
    factors: string[];
  }[];
  growthProjection: {
    metric: string;
    currentValue: number;
    projectedValue: number;
    timeframe: string;
    confidence: number;
  }[];
}

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

export class AnalyticsService extends BaseService {
  constructor() {
    super();
  }

  /**
   * Spor analytics event
   */
  async sporEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // I en ekte implementasjon ville dette sendes til en analytics platform
      // som Mixpanel, Amplitude, eller Google Analytics
      logger.info('Analytics event sporet', {
        eventName: event.eventName,
        userId: event.userId,
        bedriftId: event.bedriftId,
        properties: event.properties
      });

      // Lagre lokalt for backup og custom analytics
      await this.lagreEventLokalt(event);
    } catch (error) {
      logger.error('Feil ved sporing av analytics event', error);
      // Ikke kast feil her - analytics skal ikke påvirke hovedfunksjonalitet
    }
  }

  /**
   * Hent brukeranalyse
   */
  async hentBrukerAnalyse(userId: number, period: number = 30): Promise<UserAnalytics> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      // Mock data - i virkeligheten ville dette komme fra analytics database
      const analytics: UserAnalytics = {
        userId,
        totalSessions: 45,
        totalEvents: 1250,
        averageSessionDuration: 18.5,
        lastActiveDate: new Date(),
        mostUsedFeatures: ['kontrakter', 'elever', 'sikkerhetskontroll', 'rapporter'],
        conversionEvents: 8,
        retentionRate: 87.5
      };

      return analytics;
    } catch (error) {
      logger.error('Feil ved henting av brukeranalyse', error);
      throw error;
    }
  }

  /**
   * Hent business metrics
   */
  async hentBusinessMetrics(
    period: BusinessMetrics['period'],
    startDate: Date,
    endDate: Date
  ): Promise<BusinessMetrics> {
    try {
      const [
        activeUsers,
        newSignups,
        contractStats,
        revenueStats
      ] = await Promise.all([
        this.beregnActiveUsers(startDate, endDate),
        this.beregnNewSignups(startDate, endDate),
        this.beregnContractStats(startDate, endDate),
        this.beregnRevenueStats(startDate, endDate)
      ]);

      const metrics: BusinessMetrics = {
        period,
        startDate,
        endDate,
        metrics: {
          activeUsers: activeUsers,
          newSignups: newSignups,
          totalContracts: contractStats.total,
          completedContracts: contractStats.completed,
          conversionRate: contractStats.total > 0 ? (contractStats.completed / contractStats.total) * 100 : 0,
          revenue: revenueStats.total,
          averageContractValue: contractStats.total > 0 ? revenueStats.total / contractStats.total : 0,
          customerRetention: await this.beregnCustomerRetention(startDate, endDate),
          featureAdoption: await this.beregnFeatureAdoption(startDate, endDate),
          performanceMetrics: {
            averageLoadTime: 1.2, // seconds
            errorRate: 0.05, // 0.05%
            uptime: 99.9 // 99.9%
          }
        }
      };

      return metrics;
    } catch (error) {
      logger.error('Feil ved henting av business metrics', error);
      throw error;
    }
  }

  /**
   * Hent dashboard data
   */
  async hentDashboardData(): Promise<DashboardData> {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const [overview, trends, segments] = await Promise.all([
        this.beregnOverview(),
        this.beregnTrends(thirtyDaysAgo, today),
        this.beregnSegments()
      ]);

      const alerts = await this.beregnAlerts();

      return {
        overview,
        trends,
        segments,
        alerts
      };
    } catch (error) {
      logger.error('Feil ved henting av dashboard data', error);
      throw error;
    }
  }

  /**
   * Generer prediktiv analyse
   */
  async genererPrediktivAnalyse(): Promise<PredictiveAnalysis> {
    try {
      const [churnPrediction, revenueForecast, growthProjection] = await Promise.all([
        this.predikterChurn(),
        this.predikterRevenue(),
        this.predikterGrowth()
      ]);

      return {
        churnPrediction,
        revenueForecast,
        growthProjection
      };
    } catch (error) {
      logger.error('Feil ved generering av prediktiv analyse', error);
      throw error;
    }
  }

  /**
   * Eksporter analytics data
   */
  async eksporterAnalyticsData(
    format: 'csv' | 'excel' | 'json',
    startDate: Date,
    endDate: Date,
    metrics: string[]
  ): Promise<Buffer | object> {
    try {
      const data = await this.samleAnalyticsData(startDate, endDate, metrics);

      switch (format) {
        case 'json':
          return data;
        case 'csv':
          return this.konverterTilCSV(data);
        case 'excel':
          return this.konverterTilExcel(data);
        default:
          throw new Error('Ugyldig eksportformat');
      }
    } catch (error) {
      logger.error('Feil ved eksport av analytics data', error);
      throw error;
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async lagreEventLokalt(event: AnalyticsEvent): Promise<void> {
    // I en ekte implementasjon ville dette lagres i en separat analytics database
    // For nå logger vi bare eventet
    logger.debug('Lokalt analytics event lagret', event);
  }

  private async beregnActiveUsers(startDate: Date, endDate: Date): Promise<number> {
    const activeUsers = await this.prisma.user.count({
      where: {
        isDeleted: false,
        // I virkeligheten ville vi sjekke siste aktivitetsdato
      }
    });
    return activeUsers;
  }

  private async beregnNewSignups(startDate: Date, endDate: Date): Promise<number> {
    const newUsers = await this.prisma.user.count({
      where: {
        isDeleted: false,
        // Mangler opprettet felt i User model - ville brukt det her
      }
    });
    
    // Mock beregning basert på eksisterende data
    return Math.floor(newUsers * 0.1); // 10% av total users som "nye" i perioden
  }

  private async beregnContractStats(startDate: Date, endDate: Date): Promise<{
    total: number;
    completed: number;
  }> {
    const [total, completed] = await Promise.all([
      this.prisma.kontrakt.count({
        where: {
          opprettet: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      this.prisma.kontrakt.count({
        where: {
          opprettet: {
            gte: startDate,
            lte: endDate
          },
          status: 'AVSLUTTET'
        }
      })
    ]);

    return { total, completed };
  }

  private async beregnRevenueStats(startDate: Date, endDate: Date): Promise<{ total: number }> {
    const contracts = await this.prisma.kontrakt.findMany({
      where: {
        opprettet: {
          gte: startDate,
          lte: endDate
        },
        status: 'AVSLUTTET'
      },
      select: {
        totalBelop: true
      }
    });

    const total = contracts.reduce((sum, contract) => sum + (contract.totalBelop || 0), 0);
    return { total };
  }

  private async beregnCustomerRetention(startDate: Date, endDate: Date): Promise<number> {
    // Mock beregning - ville kreve mer kompleks analyse
    return 85.5; // 85.5% retention rate
  }

  private async beregnFeatureAdoption(startDate: Date, endDate: Date): Promise<Record<string, number>> {
    // Mock data - i virkeligheten ville dette komme fra event tracking
    return {
      'kontrakter': 95,
      'elever': 87,
      'sikkerhetskontroll': 78,
      'quiz': 65,
      'rapporter': 45,
      'integrasjoner': 32
    };
  }

  private async beregnOverview(): Promise<DashboardData['overview']> {
    const [totalUsers, totalContracts, completedContracts] = await Promise.all([
      this.prisma.user.count({ where: { isDeleted: false } }),
      this.prisma.kontrakt.count(),
      this.prisma.kontrakt.count({ where: { status: 'AVSLUTTET' } })
    ]);

    const contracts = await this.prisma.kontrakt.findMany({
      where: { status: 'AVSLUTTET' },
      select: { totalBelop: true }
    });

    const totalRevenue = contracts.reduce((sum, c) => sum + (c.totalBelop || 0), 0);

    return {
      totalUsers,
      activeUsers24h: Math.floor(totalUsers * 0.3), // Mock: 30% of users active in 24h
      totalContracts,
      completedContracts,
      totalRevenue,
      conversionRate: totalContracts > 0 ? (completedContracts / totalContracts) * 100 : 0
    };
  }

  private async beregnTrends(startDate: Date, endDate: Date): Promise<DashboardData['trends']> {
    // Mock trend data - i virkeligheten ville dette komme fra historiske data
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const userGrowth = Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return {
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 10) + 5
      };
    });

    const contractTrends = Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const contracts = Math.floor(Math.random() * 8) + 2;
      return {
        date: date.toISOString().split('T')[0],
        contracts,
        completed: Math.floor(contracts * 0.7)
      };
    });

    const revenueTrends = contractTrends.map(ct => ({
      date: ct.date,
      revenue: ct.completed * (Math.random() * 5000 + 15000) // 15k-20k per completed contract
    }));

    const featureUsage = [
      { feature: 'Kontrakter', usage: 95, growth: 5.2 },
      { feature: 'Elever', usage: 87, growth: 3.1 },
      { feature: 'Sikkerhetskontroll', usage: 78, growth: 8.5 },
      { feature: 'Quiz', usage: 65, growth: 12.3 },
      { feature: 'Rapporter', usage: 45, growth: -2.1 }
    ];

    return {
      userGrowth,
      contractTrends,
      revenueTrends,
      featureUsage
    };
  }

  private async beregnSegments(): Promise<DashboardData['segments']> {
    // Mock segmenteringsdata
    return {
      usersByType: [
        { type: 'Admin', count: 12 },
        { type: 'Lærer', count: 45 },
        { type: 'Instruktør', count: 78 },
        { type: 'Elev', count: 234 }
      ],
      contractsByStatus: [
        { status: 'Aktiv', count: 156 },
        { status: 'Fullført', count: 89 },
        { status: 'Pausert', count: 23 },
        { status: 'Kansellert', count: 12 }
      ],
      revenueBySource: [
        { source: 'Førerkort B', revenue: 1250000 },
        { source: 'Mc-kurs', revenue: 450000 },
        { source: 'Sikkerhetskurs', revenue: 320000 },
        { source: 'Bedriftskurs', revenue: 180000 }
      ]
    };
  }

  private async beregnAlerts(): Promise<DashboardData['alerts']> {
    return [
      {
        type: 'warning',
        message: 'Konverteringsrate under treshold',
        metric: 'conversionRate',
        threshold: 75,
        current: 68.5
      },
      {
        type: 'info',
        message: 'Ny rekord i brukeraktivitet',
        metric: 'activeUsers',
        threshold: 200,
        current: 245
      }
    ];
  }

  private async predikterChurn(): Promise<PredictiveAnalysis['churnPrediction']> {
    // Mock churn prediction - i virkeligheten ville dette bruke ML-algoritmer
    return [
      {
        userId: 123,
        churnProbability: 0.75,
        riskFactors: ['Lav aktivitet siste 14 dager', 'Ikke fullført siste modul'],
        recommendedActions: ['Send personlig oppfølging', 'Tilby ekstra støtte']
      },
      {
        userId: 456,
        churnProbability: 0.65,
        riskFactors: ['Mange feilbesvarelser i quiz', 'Lange pauser mellom økter'],
        recommendedActions: ['Tilby ekstra teori-timer', 'Justere kursets hastighet']
      }
    ];
  }

  private async predikterRevenue(): Promise<PredictiveAnalysis['revenueForecast']> {
    return [
      {
        period: 'Neste måned',
        predictedRevenue: 185000,
        confidence: 0.85,
        factors: ['Historisk trend', 'Sesongvariasjoner', 'Markedsforhold']
      },
      {
        period: 'Neste kvartal',
        predictedRevenue: 550000,
        confidence: 0.72,
        factors: ['Veksttrend', 'Nye produkter', 'Konkurransesituasjon']
      }
    ];
  }

  private async predikterGrowth(): Promise<PredictiveAnalysis['growthProjection']> {
    return [
      {
        metric: 'Aktive brukere',
        currentValue: 245,
        projectedValue: 320,
        timeframe: '6 måneder',
        confidence: 0.78
      },
      {
        metric: 'Månedlig omsetning',
        currentValue: 155000,
        projectedValue: 225000,
        timeframe: '12 måneder',
        confidence: 0.65
      }
    ];
  }

  private async samleAnalyticsData(
    startDate: Date,
    endDate: Date,
    metrics: string[]
  ): Promise<any> {
    // Samle relevant data basert på valgte metrics
    const data: any = {};

    for (const metric of metrics) {
      switch (metric) {
        case 'users':
          data.users = await this.hentUserData(startDate, endDate);
          break;
        case 'contracts':
          data.contracts = await this.hentContractData(startDate, endDate);
          break;
        case 'revenue':
          data.revenue = await this.hentRevenueData(startDate, endDate);
          break;
        // Legg til flere metrics etter behov
      }
    }

    return data;
  }

  private async hentUserData(startDate: Date, endDate: Date): Promise<any[]> {
    return await this.prisma.user.findMany({
      where: {
        isDeleted: false
      },
      select: {
        id: true,
        navn: true,
        epost: true,
        rolle: true
      }
    });
  }

  private async hentContractData(startDate: Date, endDate: Date): Promise<any[]> {
    return await this.prisma.kontrakt.findMany({
      where: {
        opprettet: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        id: true,
        status: true,
        totalBelop: true,
        opprettet: true
      }
    });
  }

  private async hentRevenueData(startDate: Date, endDate: Date): Promise<any[]> {
    const contracts = await this.prisma.kontrakt.findMany({
      where: {
        opprettet: {
          gte: startDate,
          lte: endDate
        },
        status: 'AVSLUTTET'
      },
      select: {
        id: true,
        totalBelop: true,
        opprettet: true,
        bedrift: {
          select: {
            navn: true
          }
        }
      }
    });

    return contracts.map(c => ({
      kontraktId: c.id,
      beløp: c.totalBelop,
      dato: c.opprettet,
      bedrift: c.bedrift.navn
    }));
  }

  private konverterTilCSV(data: any): Buffer {
    // Mock CSV-konvertering
    const csv = 'id,navn,verdi\n1,Test,123\n2,Test2,456';
    return Buffer.from(csv, 'utf-8');
  }

  private konverterTilExcel(data: any): Buffer {
    // Mock Excel-konvertering - ville bruke bibliotek som exceljs
    return Buffer.from('Mock Excel data', 'utf-8');
  }
} 