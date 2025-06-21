import api from '../lib/api';

// Interfaces for Performance Metrics
export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  threshold: {
    warning: number;
    critical: number;
  };
  trend: number; // Percentage change
  history: number[];
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  uptime: string;
  lastCheck: string;
  issues: string[];
}

// Interfaces for Basic Reports
export interface ReportData {
  id: string;
  name: string;
  description: string;
  type: 'chart' | 'table' | 'summary';
  data: any;
  lastUpdated: string;
  status: 'ready' | 'generating' | 'error';
}

export interface AnalyticsMetric {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: any;
  color: string;
}

class AnalyticsService {
  // Performance Metrics
  async hentPerformanceMetrics(): Promise<PerformanceMetric[]> {
    try {
      const response = await api.get('/analytics/performance');
      return response.data;
    } catch (error) {
      console.warn('API ikke tilgjengelig, bruker fallback data');
      return this.getFallbackPerformanceMetrics();
    }
  }

  async hentSystemHealth(): Promise<SystemHealth> {
    try {
      const response = await api.get('/analytics/system-health');
      return response.data;
    } catch (error) {
      console.warn('API ikke tilgjengelig, bruker fallback data');
      return this.getFallbackSystemHealth();
    }
  }

  // Basic Reports
  async hentAnalyticsMetrics(): Promise<AnalyticsMetric[]> {
    try {
      const response = await api.get('/analytics/metrics');
      return response.data;
    } catch (error) {
      console.warn('API ikke tilgjengelig, bruker fallback data');
      return this.getFallbackAnalyticsMetrics();
    }
  }

  async hentBasicReports(): Promise<ReportData[]> {
    try {
      const response = await api.get('/analytics/reports');
      return response.data;
    } catch (error) {
      console.warn('API ikke tilgjengelig, bruker fallback data');
      return this.getFallbackBasicReports();
    }
  }

  // Export functionality
  async eksporterAnalyticsRapport(format: 'xlsx' | 'pdf', type: 'performance' | 'reports'): Promise<Blob> {
    try {
      const response = await api.get(`/analytics/export?format=${format}&type=${type}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.warn('Eksport ikke tilgjengelig');
      throw new Error('Kunne ikke eksportere rapport');
    }
  }

  // Private fallback methods
  private getFallbackPerformanceMetrics(): PerformanceMetric[] {
    return [
      {
        id: 'cpu',
        name: 'CPU Bruk',
        value: 45.2,
        unit: '%',
        status: 'good',
        threshold: { warning: 70, critical: 85 },
        trend: -2.1,
        history: [42, 48, 51, 47, 45]
      },
      {
        id: 'memory',
        name: 'Minnebruk',
        value: 67.8,
        unit: '%',
        status: 'good',
        threshold: { warning: 80, critical: 90 },
        trend: 1.5,
        history: [65, 66, 68, 69, 68]
      },
      {
        id: 'disk',
        name: 'Diskbruk',
        value: 78.3,
        unit: '%',
        status: 'warning',
        threshold: { warning: 75, critical: 90 },
        trend: 3.2,
        history: [72, 74, 76, 77, 78]
      },
      {
        id: 'response',
        name: 'Responstid',
        value: 245,
        unit: 'ms',
        status: 'good',
        threshold: { warning: 500, critical: 1000 },
        trend: -8.4,
        history: [280, 270, 260, 250, 245]
      },
      {
        id: 'throughput',
        name: 'Gjennomstrømning',
        value: 1250,
        unit: 'req/min',
        status: 'good',
        threshold: { warning: 800, critical: 500 },
        trend: 12.3,
        history: [1100, 1150, 1200, 1220, 1250]
      },
      {
        id: 'errors',
        name: 'Feilrate',
        value: 0.8,
        unit: '%',
        status: 'good',
        threshold: { warning: 2, critical: 5 },
        trend: -25.0,
        history: [1.2, 1.1, 0.9, 0.8, 0.8]
      }
    ];
  }

  private getFallbackSystemHealth(): SystemHealth {
    return {
      overall: 'healthy',
      uptime: '15 dager, 8 timer',
      lastCheck: '2024-06-14 12:45:23',
      issues: []
    };
  }

  private getFallbackAnalyticsMetrics(): AnalyticsMetric[] {
    return [
      {
        label: 'Totale brukere',
        value: 1247,
        change: 12.5,
        trend: 'up',
        icon: 'UserGroupIcon',
        color: 'text-blue-600'
      },
      {
        label: 'Aktive sesjoner',
        value: 89,
        change: -3.2,
        trend: 'down',
        icon: 'ChartBarIcon',
        color: 'text-green-600'
      },
      {
        label: 'Gjennomført quizer',
        value: 456,
        change: 8.7,
        trend: 'up',
        icon: 'AcademicCapIcon',
        color: 'text-purple-600'
      },
      {
        label: 'Systemytelse',
        value: '98.2%',
        change: 0.5,
        trend: 'stable',
        icon: 'CpuChipIcon',
        color: 'text-orange-600'
      }
    ];
  }

  private getFallbackBasicReports(): ReportData[] {
    return [
      {
        id: 'safety-overview',
        name: 'Sikkerhetsstatistikk',
        description: 'Oversikt over sikkerhetskontroller og avvik',
        type: 'chart',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun'],
          datasets: [
            {
              label: 'Kontroller',
              data: [45, 52, 48, 61, 55, 67],
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)'
            }
          ]
        },
        lastUpdated: '2024-06-14 10:30',
        status: 'ready'
      },
      {
        id: 'compliance-trend',
        name: 'Etterlevelsesutvikling',
        description: 'Utvikling i etterlevelse over tid',
        type: 'chart',
        data: {
          labels: ['Uke 1', 'Uke 2', 'Uke 3', 'Uke 4'],
          datasets: [
            {
              label: 'Etterlevelse %',
              data: [92.1, 93.8, 94.2, 95.1],
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)'
            }
          ]
        },
        lastUpdated: '2024-06-14 09:15',
        status: 'ready'
      },
      {
        id: 'top-issues',
        name: 'Hyppigste avvik',
        description: 'De mest vanlige avvikstypene',
        type: 'table',
        data: [
          { category: 'Utstyr mangler', count: 8, severity: 'medium' },
          { category: 'Dokumentasjon ufullstendig', count: 6, severity: 'low' },
          { category: 'Sikkerhetsrutiner ikke fulgt', count: 4, severity: 'high' },
          { category: 'Miljøavvik', count: 3, severity: 'medium' }
        ],
        lastUpdated: '2024-06-14 08:45',
        status: 'ready'
      }
    ];
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService; 