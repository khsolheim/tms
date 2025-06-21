/**
 * Business Intelligence Dashboard
 * 
 * Avanserte analytics og business intelligence dashboards for TMS
 */

import React, { useEffect, useState } from 'react';
import { FiTrendingUp, FiUsers, FiDollarSign, FiTarget, FiFilter, FiDownload, FiRefreshCw } from 'react-icons/fi';
import analyticsService from '../../services/AnalyticsService';
import { MetricCard } from '../../components/charts/MetricCard';
import { ChartContainer } from '../../components/charts/ChartContainer';
import { FunnelChart } from '../../components/charts/FunnelChart';
import { InsightsPanel } from '../../components/analytics/InsightsPanel';
import { CustomReportBuilder } from '../../components/analytics/CustomReportBuilder';

interface BusinessMetrics {
  kpis: Record<string, { value: number; change: number; trend: 'up' | 'down' | 'stable' }>;
  conversionRates: Record<string, number>;
  userEngagement: {
    averageSessionDuration: number;
    pageViewsPerSession: number;
    bounceRate: number;
    returnVisitorRate: number;
  };
  revenueMetrics: {
    totalRevenue: number;
    averageOrderValue: number;
    revenuePerUser: number;
    growthRate: number;
  };
}

interface AnalyticsInsight {
  type: 'opportunity' | 'warning' | 'achievement' | 'trend';
  title: string;
  description: string;
  data: any;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
  recommendations?: string[];
}

const BusinessIntelligence: React.FC = () => {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'quarter'>('week');
  const [activeTab, setActiveTab] = useState<'overview' | 'funnel' | 'reports' | 'insights'>('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'day':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
      }

      const [businessMetrics, analyticsInsights] = await Promise.all([
        analyticsService.getBusinessMetrics({ start: startDate, end: endDate }),
        analyticsService.generateInsights({ start: startDate, end: endDate })
      ]);

      setMetrics(businessMetrics);
      setInsights(analyticsInsights);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = (format: 'json' | 'csv') => {
    const data = analyticsService.exportData(format);
    const blob = new Blob([data], { 
      type: format === 'csv' ? 'text/csv' : 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tms-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiRefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Laster analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-1">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Business Intelligence</h1>
              <p className="text-gray-600 mt-2">Avanserte analytics og innsikt i forretningsdata</p>
            </div>
            
            <div className="flex space-x-4">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="day">Siste dag</option>
                <option value="week">Siste uke</option>
                <option value="month">Siste måned</option>
                <option value="quarter">Siste kvartal</option>
              </select>

              {/* Export Buttons */}
              <button
                onClick={() => exportData('csv')}
                className="px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
              >
                <FiDownload className="h-4 w-4" />
                <span>CSV</span>
              </button>
              
              <button
                onClick={() => exportData('json')}
                className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <FiDownload className="h-4 w-4" />
                <span>JSON</span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={loadAnalyticsData}
                className="px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center space-x-2"
              >
                <FiRefreshCw className="h-4 w-4" />
                <span>Oppdater</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Oversikt', icon: FiTrendingUp },
                { id: 'funnel', label: 'Konverteringsløp', icon: FiTarget },
                { id: 'reports', label: 'Custom Reports', icon: FiFilter },
                { id: 'insights', label: 'Innsikt', icon: FiUsers }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="cards-spacing-vertical">
            {/* KPI Cards */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 cards-spacing-grid">
                <MetricCard
                  title="Aktive Brukere"
                  value={metrics.kpis.activeUsers?.value || 0}
                  change={metrics.kpis.activeUsers?.change || 0}
                  trend={metrics.kpis.activeUsers?.trend || 'stable'}
                  icon={FiUsers}
                  color="blue"
                />
                
                <MetricCard
                  title="Konverteringsrate"
                  value={`${(metrics.conversionRates.overall || 0).toFixed(1)}%`}
                  change={metrics.kpis.conversionRate?.change || 0}
                  trend={metrics.kpis.conversionRate?.trend || 'stable'}
                  icon={FiTarget}
                  color="green"
                />
                
                <MetricCard
                  title="Gjennomsnittlig Inntekt"
                  value={`${metrics.revenueMetrics.averageOrderValue.toLocaleString('nb-NO')} kr`}
                  change={metrics.revenueMetrics.growthRate}
                  trend={metrics.revenueMetrics.growthRate > 0 ? 'up' : 'down'}
                  icon={FiDollarSign}
                  color="purple"
                />
                
                <MetricCard
                  title="Bounce Rate"
                  value={`${metrics.userEngagement.bounceRate.toFixed(1)}%`}
                  change={-5.2} // Negative is good for bounce rate
                  trend="down"
                  icon={FiTrendingUp}
                  color="orange"
                  invertColors={true}
                />
              </div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
              <ChartContainer
                title="Brukerengasjement"
                subtitle="Session varighet og sidevisninger"
                data={metrics ? [
                  { name: 'Gjennomsnittlig session', value: Math.round(metrics.userEngagement.averageSessionDuration / 60000) },
                  { name: 'Sider per session', value: metrics.userEngagement.pageViewsPerSession },
                  { name: 'Gjenbesøkende (%)', value: metrics.userEngagement.returnVisitorRate }
                ] : []}
              />
              
              <ChartContainer
                title="Inntektsmetrikker"
                subtitle="Inntekt og vekst over tid"
                data={metrics ? [
                  { name: 'Total inntekt', value: metrics.revenueMetrics.totalRevenue },
                  { name: 'Inntekt per bruker', value: metrics.revenueMetrics.revenuePerUser },
                  { name: 'Vekstrate (%)', value: metrics.revenueMetrics.growthRate }
                ] : []}
              />
            </div>
          </div>
        )}

        {activeTab === 'funnel' && (
          <div className="cards-spacing-vertical">
            <div className="bg-white px-2 py-1 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Konverteringsløp Analyse</h2>
              <FunnelChart
                steps={[
                  { name: 'Landingsside', users: 1000, completionRate: 100 },
                  { name: 'Produktvisning', users: 750, completionRate: 75 },
                  { name: 'Startet registrering', users: 300, completionRate: 40 },
                  { name: 'Fullført registrering', users: 180, completionRate: 60 },
                  { name: 'Første kjøp', users: 90, completionRate: 50 }
                ]}
              />
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="cards-spacing-vertical">
            <CustomReportBuilder />
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="cards-spacing-vertical">
            <InsightsPanel insights={insights} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessIntelligence; 