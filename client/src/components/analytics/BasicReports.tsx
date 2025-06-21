import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import {
  ChartBarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { rapporterService, type AnalyticsMetric } from '../../services/rapporter.service';
import { analyticsService } from '../../services/analytics.service';

interface ReportData {
  id: string;
  name: string;
  description: string;
  type: 'chart' | 'table' | 'summary';
  data: any;
  lastUpdated: string;
  status: 'ready' | 'generating' | 'error';
}

const BasicReports: React.FC = () => {
  const { actualTheme } = useTheme();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hentAnalyticsData();
  }, [selectedPeriod]);

  const hentAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [analyticsMetrics] = await Promise.all([
        rapporterService.hentAnalyticsMetrics()
      ]);
      
      setMetrics(analyticsMetrics);
      
      // Henter rapportdata fra service
      const reportsData = await analyticsService.hentBasicReports();
      setReports(reportsData);
    } catch (error) {
      console.error('Feil ved henting av analytics data:', error);
      setError('Kunne ikke laste analytics data. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getChangeColor = (change?: number) => {
    if (!change) return 'text-gray-500';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return actualTheme === 'dark' ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-800';
      case 'medium':
        return actualTheme === 'dark' ? 'bg-yellow-800 text-yellow-200' : 'bg-yellow-100 text-yellow-800';
      case 'low':
        return actualTheme === 'dark' ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800';
      default:
        return actualTheme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="cards-spacing-vertical">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-semibold ${
            actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
          }`}>
            Grunnleggende rapporter
          </h2>
          <p className={`text-sm mt-1 ${
            actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Oversikt over nøkkeltall og trender
          </p>
        </div>

        {/* Period selector */}
        <div className="flex items-center space-x-2">
          <CalendarDaysIcon className={`h-5 w-5 ${
            actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className={`rounded-md border px-3 py-1 text-sm ${
              actualTheme === 'dark'
                ? 'border-gray-600 bg-gray-800 text-gray-200'
                : 'border-gray-300 bg-white text-gray-900'
            }`}
          >
            <option value="week">Siste uke</option>
            <option value="month">Siste måned</option>
            <option value="quarter">Siste kvartal</option>
            <option value="year">Siste år</option>
          </select>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <metric.icon className={`h-6 w-6 ${metric.color}`} />
              {getTrendIcon(metric.trend)}
            </div>
            
            <div>
              <p className={`text-2xl font-bold ${
                actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}>
                {metric.value}
              </p>
              <p className={`text-sm ${
                actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {metric.label}
              </p>
              {metric.change !== undefined && (
                <p className={`text-xs mt-1 ${getChangeColor(metric.change)}`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}% fra forrige periode
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
        {reports.map((report) => (
          <div
            key={report.id}
            className={`border rounded-lg p-6 ${
              actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-lg font-medium ${
                  actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {report.name}
                </h3>
                <p className={`text-sm ${
                  actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {report.description}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => console.log('Eksporter rapport:', report.id)}
                  className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                  title="Eksporter rapport"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Report Content */}
            {report.type === 'chart' && (
              <div className={`h-48 rounded-md border-2 border-dashed flex items-center justify-center ${
                actualTheme === 'dark' ? 'border-gray-600' : 'border-gray-300'
              }`}>
                <div className="text-center">
                  <ChartBarIcon className={`h-12 w-12 mx-auto mb-2 ${
                    actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm ${
                    actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Graf vil vises her
                  </p>
                  <p className={`text-xs mt-1 ${
                    actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    (Chart.js integrasjon påkrevd)
                  </p>
                </div>
              </div>
            )}

            {report.type === 'table' && report.data && (
              <div className="overflow-hidden">
                <table className="min-w-full">
                  <thead>
                    <tr className={actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}>
                      <th className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                        actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Kategori
                      </th>
                      <th className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                        actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Antall
                      </th>
                      <th className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                        actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Alvorlighet
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${actualTheme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {report.data.map((row: any, index: number) => (
                      <tr key={index}>
                        <td className={`px-4 py-2 text-sm ${
                          actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          {row.category}
                        </td>
                        <td className={`px-4 py-2 text-sm font-medium ${
                          actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          {row.count}
                        </td>
                        <td className="px-2 py-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            getSeverityColor(row.severity)
                          }`}>
                            {row.severity === 'high' ? 'Høy' : row.severity === 'medium' ? 'Medium' : 'Lav'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Last updated */}
            <div className={`text-xs mt-4 pt-4 border-t ${
              actualTheme === 'dark' ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-500'
            }`}>
              Sist oppdatert: {report.lastUpdated}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={`border rounded-lg p-4 ${
        actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <h3 className={`text-lg font-medium mb-3 ${
          actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
        }`}>
          Hurtighandlinger
        </h3>
        
        <div className="flex flex-wrap cards-spacing-grid">
          <button
            onClick={() => console.log('Generer månedlig rapport')}
            className="flex items-center px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Månedlig rapport
          </button>
          
          <button
            onClick={() => console.log('Eksporter alle data')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              actualTheme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Eksporter alle
          </button>
          
          <button
            onClick={() => console.log('Opprett tilpasset rapport')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              actualTheme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Tilpasset rapport
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasicReports; 