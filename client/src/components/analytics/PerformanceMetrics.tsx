import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
  ServerIcon,
  CloudIcon,
  ClockIcon,
  BoltIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import analyticsService, { PerformanceMetric, SystemHealth } from '../../services/analytics.service';

const PerformanceMetrics: React.FC = () => {
  const { theme } = useTheme();
  const actualTheme = theme === 'system' ? 'light' : theme;
  
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    hentPerformanceData();
  }, []);

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      hentPerformanceData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const hentPerformanceData = async () => {
    try {
      setError(null);
      
      const [metricsData, healthData] = await Promise.all([
        analyticsService.hentPerformanceMetrics(),
        analyticsService.hentSystemHealth()
      ]);
      
      setMetrics(metricsData);
      setSystemHealth(healthData);
    } catch (error) {
      console.error('Feil ved henting av performance data:', error);
      setError('Kunne ikke laste performance data. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return actualTheme === 'dark' ? 'text-green-400' : 'text-green-600';
      case 'warning':
        return actualTheme === 'dark' ? 'text-yellow-400' : 'text-yellow-600';
      case 'critical':
        return actualTheme === 'dark' ? 'text-red-400' : 'text-red-600';
      default:
        return actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getMetricIcon = (id: string) => {
    switch (id) {
      case 'cpu':
        return <CpuChipIcon className="h-6 w-6" />;
      case 'memory':
        return <ServerIcon className="h-6 w-6" />;
      case 'disk':
        return <CloudIcon className="h-6 w-6" />;
      case 'response':
        return <ClockIcon className="h-6 w-6" />;
      case 'throughput':
        return <BoltIcon className="h-6 w-6" />;
      case 'errors':
        return <ExclamationTriangleIcon className="h-6 w-6" />;
      default:
        return <ChartBarIcon className="h-6 w-6" />;
    }
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return '↗';
    if (trend < 0) return '↘';
    return '→';
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return actualTheme === 'dark' ? 'text-green-400' : 'text-green-600';
      case 'warning':
        return actualTheme === 'dark' ? 'text-yellow-400' : 'text-yellow-600';
      case 'critical':
        return actualTheme === 'dark' ? 'text-red-400' : 'text-red-600';
      default:
        return actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">{error}</div>
        <button
          onClick={hentPerformanceData}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Prøv igjen
        </button>
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
            Systemytelse
          </h2>
          <p className={`text-sm mt-1 ${
            actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Sanntidsovervåkning av systemets ytelse
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2"
            />
            <span className={`text-sm ${
              actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Auto-oppdater
            </span>
          </label>
          
          <button
            onClick={hentPerformanceData}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              actualTheme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            Oppdater nå
          </button>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <div className={`rounded-lg border p-4 ${
          actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-lg font-medium ${
              actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>
              Systemhelse
            </h3>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                systemHealth.overall === 'healthy' ? 'bg-green-500' :
                systemHealth.overall === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className={`text-sm font-medium ${getHealthColor(systemHealth.overall)}`}>
                {systemHealth.overall === 'healthy' ? 'Sunn' :
                 systemHealth.overall === 'warning' ? 'Advarsel' : 'Kritisk'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${
                actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Oppetid: <span className="font-medium">{systemHealth.uptime}</span>
              </p>
            </div>
            <div>
              <p className={`text-sm ${
                actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Siste sjekk: <span className="font-medium">{systemHealth.lastCheck}</span>
              </p>
            </div>
          </div>
          
          {systemHealth.issues.length > 0 && (
            <div className="mt-3">
              <p className={`text-sm font-medium mb-2 ${
                actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Aktive problemer:
              </p>
              <ul className="space-y-1">
                {systemHealth.issues.map((issue, index) => (
                  <li key={index} className={`text-sm ${
                    actualTheme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`}>
                    • {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className={`p-6 rounded-lg border ${
              actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${
                metric.status === 'good' ? 'bg-green-100' :
                metric.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <div className={getStatusColor(metric.status)}>
                  {getMetricIcon(metric.id)}
                </div>
              </div>
              {getStatusIcon(metric.status)}
            </div>
            
            <div className="mb-3">
              <h3 className={`text-sm font-medium ${
                actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {metric.name}
              </h3>
              <div className="flex items-baseline space-x-2">
                <span className={`text-2xl font-bold ${
                  actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {metric.value.toFixed(1)}
                </span>
                <span className={`text-sm ${
                  actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {metric.unit}
                </span>
              </div>
            </div>
            
            {/* Trend */}
            <div className="flex items-center justify-between">
              <div className={`flex items-center text-sm ${getTrendColor(metric.trend)}`}>
                <span className="mr-1">{getTrendIcon(metric.trend)}</span>
                <span>{Math.abs(metric.trend).toFixed(1)}%</span>
              </div>
              
              {/* Threshold indicator */}
              <div className="flex items-center space-x-1">
                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${
                      metric.status === 'good' ? 'bg-green-500' :
                      metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min((metric.value / metric.threshold.critical) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Mini chart */}
            <div className="mt-3">
              <div className="flex items-end space-x-1 h-8">
                {metric.history.map((value, index) => (
                  <div
                    key={index}
                    className={`flex-1 rounded-sm ${
                      metric.status === 'good' ? 'bg-green-200' :
                      metric.status === 'warning' ? 'bg-yellow-200' : 'bg-red-200'
                    }`}
                    style={{ 
                      height: `${(value / Math.max(...metric.history)) * 100}%`,
                      minHeight: '2px'
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Thresholds Legend */}
      <div className={`rounded-lg border p-4 ${
        actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <h3 className={`text-sm font-medium mb-3 ${
          actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Terskelverdier
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              Normal drift
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              Advarsel - overvåk nøye
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              Kritisk - krever handling
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics; 