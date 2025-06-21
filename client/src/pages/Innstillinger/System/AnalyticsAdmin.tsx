import React, { useState } from 'react';
import { 
  ChartBarIcon,
  CogIcon,
  EyeIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface AnalyticsMetric {
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface AnalyticsConfig {
  id: string;
  name: string;
  enabled: boolean;
  status: 'active' | 'inactive' | 'error';
  lastSync: string;
  description: string;
}

export default function AnalyticsAdmin() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  const [googleAnalyticsConfig, setGoogleAnalyticsConfig] = useState({
    measurementId: 'G-XXXXXXXXXX',
    enabled: true,
    privacyMode: true,
    cookieConsent: true,
    dataRetention: '26 months',
    anonymizeIP: true
  });

  const [customTrackingConfig, setCustomTrackingConfig] = useState({
    userInteractions: true,
    pagePerformance: true,
    errorTracking: true,
    conversionTracking: true,
    customEvents: true
  });

  const analyticsMetrics: AnalyticsMetric[] = [
    {
      name: 'Daglige brukere',
      value: '1,247',
      change: '+8.3%',
      changeType: 'increase',
      icon: UserGroupIcon,
      description: 'Unike brukere siste 24 timer'
    },
    {
      name: 'Sidevisninger',
      value: '4,892',
      change: '+12.1%',
      changeType: 'increase', 
      icon: EyeIcon,
      description: 'Total sidevisninger i dag'
    },
    {
      name: 'Gjennomsnittlig økt',
      value: '5m 23s',
      change: '-2.4%',
      changeType: 'decrease',
      icon: ClockIcon,
      description: 'Tid brukt på siden'
    },
    {
      name: 'Avspringsrate',
      value: '32.1%',
      change: '-5.8%',
      changeType: 'decrease',
      icon: ArrowDownIcon,
      description: 'Brukere som forlater etter én side'
    }
  ];

  const analyticsServices: AnalyticsConfig[] = [
    {
      id: 'google-analytics',
      name: 'Google Analytics 4',
      enabled: googleAnalyticsConfig.enabled,
      status: 'active',
      lastSync: '2 minutter siden',
      description: 'Hovedanalysetjeneste for brukerdata og trafikk'
    },
    {
      id: 'custom-events',
      name: 'Custom Event Tracking',
      enabled: customTrackingConfig.customEvents,
      status: 'active',
      lastSync: '1 minutt siden',
      description: 'Sporing av spesielle brukerhandlinger og konverteringer'
    },
    {
      id: 'performance-monitoring',
      name: 'Performance Monitoring',
      enabled: customTrackingConfig.pagePerformance,
      status: 'active',
      lastSync: '30 sekunder siden',
      description: 'Overvåkning av sideytelse og laste tider'
    },
    {
      id: 'error-tracking',
      name: 'Error Tracking',
      enabled: customTrackingConfig.errorTracking,
      status: 'active',
      lastSync: '1 minutt siden',
      description: 'Automatisk registrering av JavaScript-feil'
    }
  ];

  const getChangeColor = (changeType: 'increase' | 'decrease' | 'neutral') => {
    if (changeType === 'increase') return 'text-green-600';
    if (changeType === 'decrease') return 'text-red-600';
    return 'text-gray-500';
  };

  const getChangeIcon = (changeType: 'increase' | 'decrease' | 'neutral') => {
    if (changeType === 'increase') return ArrowUpIcon;
    if (changeType === 'decrease') return ArrowDownIcon;
    return null;
  };

  const getStatusColor = (status: 'active' | 'inactive' | 'error') => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: 'active' | 'inactive' | 'error') => {
    switch (status) {
      case 'active':
        return CheckCircleIcon;
      case 'inactive':
        return InformationCircleIcon;
      case 'error':
        return ExclamationTriangleIcon;
      default:
        return InformationCircleIcon;
    }
  };

  const getStatusText = (status: 'active' | 'inactive' | 'error') => {
    switch (status) {
      case 'active':
        return 'Aktiv';
      case 'inactive':
        return 'Inaktiv';
      case 'error':
        return 'Feil';
      default:
        return 'Ukjent';
    }
  };

  return (
    <div className="cards-spacing-vertical">
      {/* Header */}
      <div className="border-b border-gray-200 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics Administrasjon
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Administrer Google Analytics, custom tracking og datainnsamling
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => console.log('Eksporter data')} className="inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Eksporter rapport
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 cards-spacing-grid">
        {analyticsMetrics.map((metric) => {
          const ChangeIcon = getChangeIcon(metric.changeType);
          
          return (
            <div
              key={metric.name}
              className="bg-white rounded-xl border-2 border-gray-200 px-2 py-1 hover:border-blue-300 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <metric.icon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-medium text-gray-600 mb-1">
                    {metric.name}
                  </h3>
                  
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {metric.value}
                  </div>

                  <p className="text-xs text-gray-500 mb-2">
                    {metric.description}
                  </p>

                  <div className="flex items-center space-x-1">
                    {ChangeIcon && (
                      <ChangeIcon className={`w-4 h-4 ${getChangeColor(metric.changeType)}`} />
                    )}
                    <span className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                      {metric.change}
                    </span>
                    <span className="text-xs text-gray-500">
                      vs forrige periode
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
        {/* Google Analytics Configuration */}
        <div className="bg-white rounded-xl border border-gray-200 px-2 py-1">
          <div className="flex items-center mb-6">
            <div className="p-2 rounded-lg bg-orange-100 mr-3">
              <GlobeAltIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Google Analytics 4
              </h2>
              <p className="text-sm text-gray-600">
                Hovedkonfigurasjon for Google Analytics
              </p>
            </div>
          </div>

          <div className="cards-spacing-vertical">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Measurement ID
              </label>
              <input
                type="text"
                value={googleAnalyticsConfig.measurementId}
                onChange={(e) => setGoogleAnalyticsConfig({
                  ...googleAnalyticsConfig,
                  measurementId: e.target.value
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="G-XXXXXXXXXX"
              />
            </div>

            <div className="grid grid-cols-2 cards-spacing-grid">
              <div className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Aktiver sporing</h4>
                  <p className="text-sm text-gray-600">Hovedbryter for GA4</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={googleAnalyticsConfig.enabled}
                    onChange={(e) => setGoogleAnalyticsConfig({
                      ...googleAnalyticsConfig,
                      enabled: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Personvernmodus</h4>
                  <p className="text-sm text-gray-600">GDPR-kompatibel</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={googleAnalyticsConfig.privacyMode}
                    onChange={(e) => setGoogleAnalyticsConfig({
                      ...googleAnalyticsConfig,
                      privacyMode: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Cookie-samtykke</h4>
                  <p className="text-sm text-gray-600">Krever samtykke</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={googleAnalyticsConfig.cookieConsent}
                    onChange={(e) => setGoogleAnalyticsConfig({
                      ...googleAnalyticsConfig,
                      cookieConsent: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Anonymiser IP</h4>
                  <p className="text-sm text-gray-600">Personvern</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={googleAnalyticsConfig.anonymizeIP}
                    onChange={(e) => setGoogleAnalyticsConfig({
                      ...googleAnalyticsConfig,
                      anonymizeIP: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dataoppbevaring
              </label>
              <select
                value={googleAnalyticsConfig.dataRetention}
                onChange={(e) => setGoogleAnalyticsConfig({
                  ...googleAnalyticsConfig,
                  dataRetention: e.target.value
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="2 months">2 måneder</option>
                <option value="14 months">14 måneder</option>
                <option value="26 months">26 måneder</option>
                <option value="38 months">38 måneder</option>
                <option value="50 months">50 måneder</option>
              </select>
            </div>
          </div>
        </div>

        {/* Custom Tracking Configuration */}
        <div className="bg-white rounded-xl border border-gray-200 px-2 py-1">
          <div className="flex items-center mb-6">
            <div className="p-2 rounded-lg bg-purple-100 mr-3">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Custom Tracking
              </h2>
              <p className="text-sm text-gray-600">
                Avanserte sporingsfunksjoner
              </p>
            </div>
          </div>

          <div className="cards-spacing-vertical">
            {[
              {
                key: 'userInteractions',
                title: 'Brukerinteraksjoner',
                description: 'Klikk, scrolling og hover-events'
              },
              {
                key: 'pagePerformance',
                title: 'Sideytelse',
                description: 'Laste tider og Core Web Vitals'
              },
              {
                key: 'errorTracking',
                title: 'Feilsporing',
                description: 'JavaScript-feil og crashes'
              },
              {
                key: 'conversionTracking',
                title: 'Konverteringssporing',
                description: 'Mål og hendelser'
              },
              {
                key: 'customEvents',
                title: 'Custom Events',
                description: 'Spesialtilpassede hendelser'
              }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customTrackingConfig[item.key as keyof typeof customTrackingConfig]}
                    onChange={(e) => setCustomTrackingConfig({
                      ...customTrackingConfig,
                      [item.key]: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Services Status */}
      <div className="bg-white rounded-xl border border-gray-200 px-2 py-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Tjenestestatus
          </h2>
          <button onClick={() => window.location.reload()} className="text-blue-600 hover:text-blue-700 font-medium">
            Oppdater alle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
          {analyticsServices.map((service) => {
            const StatusIcon = getStatusIcon(service.status);
            
            return (
              <div
                key={service.id}
                className="px-2 py-1 bg-gray-50 rounded-lg border-l-4 border-blue-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {service.name}
                      </h3>
                      <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {getStatusText(service.status)}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{service.description}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Sist synkronisert: {service.lastSync}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => console.log('Button clicked')} className="text-blue-600 hover:text-blue-700 font-medium">
                          Konfigurer
                        </button>
                        <button onClick={() => console.log('Button clicked')} className="text-gray-600 hover:text-gray-700">
                          <CogIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Actions */}
      <div className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-200">
        <button onClick={() => console.log('Avbryt handling')} className="px-2 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          Avbryt
        </button>
        <button onClick={() => console.log('Lagre endringer')} className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Lagre endringer
        </button>
      </div>
    </div>
  );
} 