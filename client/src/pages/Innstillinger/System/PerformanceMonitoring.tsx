import React, { useState, useEffect } from 'react';
import { 
  CpuChipIcon,
  ClockIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  EyeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BoltIcon,
  SignalIcon,
  CloudIcon
} from '@heroicons/react/24/outline';
import { 
  CpuChipIcon as CpuChipSolidIcon,
  ClockIcon as ClockSolidIcon,
  GlobeAltIcon as GlobeAltSolidIcon,
  ChartBarIcon as ChartBarSolidIcon
} from '@heroicons/react/24/solid';

interface PerformanceMetric {
  name: string;
  value: string;
  change: string;
  changeType: 'good' | 'warning' | 'critical';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface MonitoringConfig {
  id: string;
  name: string;
  enabled: boolean;
  endpoint?: string;
  threshold?: number;
  description: string;
}

export default function PerformanceMonitoring() {
  const [activeTab, setActiveTab] = useState<'overview' | 'rum' | 'vitals' | 'config'>('overview');
  const [monitoring, setMonitoring] = useState<Record<string, boolean>>({
    rum: true,
    vitals: true,
    errors: true,
    api: true
  });

  const performanceMetrics: PerformanceMetric[] = [
    {
      name: 'First Contentful Paint (FCP)',
      value: '1.2s',
      change: '-0.3s',
      changeType: 'good',
      icon: BoltIcon,
      description: 'Tiden det tar før første innhold vises'
    },
    {
      name: 'Largest Contentful Paint (LCP)',
      value: '2.1s',
      change: '+0.1s',
      changeType: 'warning',
      icon: EyeIcon,
      description: 'Tiden for største synlige element'
    },
    {
      name: 'Cumulative Layout Shift (CLS)',
      value: '0.08',
      change: '-0.02',
      changeType: 'good',
      icon: DevicePhoneMobileIcon,
      description: 'Måler visuell stabilitet'
    },
    {
      name: 'Time to Interactive (TTI)',
      value: '3.4s',
      change: '+0.2s',
      changeType: 'critical',
      icon: ClockIcon,
      description: 'Tid før siden er fullt interaktiv'
    }
  ];

  const rumConfigurations: MonitoringConfig[] = [
    {
      id: 'page-views',
      name: 'Sidevisninger',
      enabled: true,
      description: 'Spor alle sidevisninger og navigasjon'
    },
    {
      id: 'user-interactions',
      name: 'Brukerinteraksjoner',
      enabled: true,
      description: 'Spor klikk, skroll og andre brukerhandlinger'
    },
    {
      id: 'performance-timing',
      name: 'Performance Timing',
      enabled: true,
      description: 'Detaljerte lastingstider og performance metrics'
    },
    {
      id: 'error-tracking',
      name: 'Feilsporing',
      enabled: true,
      description: 'Automatisk feilrapportering og stack traces'
    },
    {
      id: 'api-monitoring',
      name: 'API Overvåkning',
      enabled: false,
      endpoint: '/api/v1/*',
      description: 'Overvåk API-kall og responsetider'
    }
  ];

  const getChangeColor = (type: 'good' | 'warning' | 'critical') => {
    switch (type) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (type: 'good' | 'warning' | 'critical') => {
    switch (type) {
      case 'good': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    }
  };

  const handleToggleMonitoring = (configId: string) => {
    setMonitoring(prev => ({
      ...prev,
      [configId]: !prev[configId]
    }));
  };

  return (
    <div className="cards-spacing-vertical">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-2 py-1 border-b border-gray-200">
          <div className="flex items-center">
            <CpuChipSolidIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Performance Monitoring</h1>
              <p className="text-sm text-gray-600">
                Real User Monitoring (RUM) og performance metrics
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-2">
            {[
              { id: 'overview', name: 'Oversikt', icon: ChartBarIcon },
              { id: 'rum', name: 'RUM Data', icon: GlobeAltIcon },
              { id: 'vitals', name: 'Core Web Vitals', icon: BoltIcon },
              { id: 'config', name: 'Konfigurasjon', icon: Cog6ToothIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Oversikt Tab */}
      {activeTab === 'overview' && (
        <div className="cards-spacing-vertical">
          {/* Performance Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 cards-spacing-grid">
            {performanceMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.name} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-2 py-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Icon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {metric.name}
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {metric.value}
                            </div>
                            <div className={`ml-2 flex items-baseline text-sm font-semibold ${getChangeColor(metric.changeType)}`}>
                              {getStatusIcon(metric.changeType)}
                              <span className="ml-1">{metric.change}</span>
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">{metric.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Performance Chart Placeholder */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-2 py-1 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Performance Trends</h3>
            </div>
            <div className="px-2 py-1">
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ChartBarSolidIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Performance charts vil vises her</p>
                  <p className="text-sm text-gray-400">Integrert med Google Analytics 4</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RUM Data Tab */}
      {activeTab === 'rum' && (
        <div className="cards-spacing-vertical">
          <div className="bg-white shadow rounded-lg">
            <div className="px-2 py-1 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Real User Monitoring Data</h3>
            </div>
            <div className="px-2 py-1">
              <div className="grid grid-cols-1 md:grid-cols-3 cards-spacing-grid">
                <div className="text-center">
                  <GlobeAltSolidIcon className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                  <h4 className="text-lg font-semibold text-gray-900">1,247</h4>
                  <p className="text-sm text-gray-600">Aktive brukere (24t)</p>
                </div>
                <div className="text-center">
                  <DevicePhoneMobileIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <h4 className="text-lg font-semibold text-gray-900">68%</h4>
                  <p className="text-sm text-gray-600">Mobile brukere</p>
                </div>
                <div className="text-center">
                  <CloudIcon className="h-12 w-12 text-purple-500 mx-auto mb-2" />
                  <h4 className="text-lg font-semibold text-gray-900">99.8%</h4>
                  <p className="text-sm text-gray-600">Oppetid</p>
                </div>
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-2 py-1 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Sesjonsinformasjon</h3>
            </div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bruker
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Side
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lastetid
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enhetstype
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { user: 'Anonym#1234', page: '/oversikt', loadTime: '1.2s', device: 'Desktop' },
                    { user: 'Anonym#5678', page: '/bedrifter', loadTime: '2.1s', device: 'Mobile' },
                    { user: 'Anonym#9012', page: '/rapportering', loadTime: '1.8s', device: 'Tablet' }
                  ].map((session, index) => (
                    <tr key={index}>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                        {session.user}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                        {session.page}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                        {session.loadTime}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                        {session.device}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Core Web Vitals Tab */}
      {activeTab === 'vitals' && (
        <div className="cards-spacing-vertical">
          <div className="bg-white shadow rounded-lg">
            <div className="px-2 py-1 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Core Web Vitals</h3>
              <p className="text-sm text-gray-600">
                Googles viktigste ytelsesmålinger for brukeropplevelse
              </p>
            </div>
            <div className="px-2 py-1">
              <div className="cards-spacing-vertical">
                {performanceMetrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div key={metric.name} className="flex items-center justify-between px-2 py-1 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <Icon className="h-8 w-8 text-gray-400 mr-4" />
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{metric.name}</h4>
                          <p className="text-sm text-gray-600">{metric.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                        <div className={`flex items-center ${getChangeColor(metric.changeType)}`}>
                          {getStatusIcon(metric.changeType)}
                          <span className="ml-1 text-sm font-medium">{metric.change}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Konfigurasjon Tab */}
      {activeTab === 'config' && (
        <div className="cards-spacing-vertical">
          <div className="bg-white shadow rounded-lg">
            <div className="px-2 py-1 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Monitoring Konfigurasjon</h3>
            </div>
            <div className="px-2 py-1">
              <div className="cards-spacing-vertical">
                {rumConfigurations.map((config) => (
                  <div key={config.id} className="flex items-center justify-between px-2 py-1 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">{config.name}</h4>
                      <p className="text-sm text-gray-600">{config.description}</p>
                      {config.endpoint && (
                        <p className="text-xs text-gray-500 mt-1">Endpoint: {config.endpoint}</p>
                      )}
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => handleToggleMonitoring(config.id)}
                        className={`${
                          config.enabled
                            ? 'bg-blue-600 focus:ring-blue-500'
                            : 'bg-gray-200 focus:ring-gray-500'
                        } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2`}
                      >
                        <span
                          className={`${
                            config.enabled ? 'translate-x-5' : 'translate-x-0'
                          } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <button onClick={() => console.log('Avbryt handling')} className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Avbryt
                  </button>
                  <button onClick={() => console.log('Lagre endringer')} className="px-2 py-1 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">
                    Lagre endringer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 