import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import SearchAndFilter, { FilterConfig } from '../../components/ui/SearchAndFilter';
import DataExport from '../../components/ui/DataExport';
import {
  UserGroupIcon,
  StarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CakeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  TrophyIcon,
  HeartIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FaceSmileIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { rapporterService, type CustomerData } from '../../services/rapporter.service';

interface CustomerKPI {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  target?: number;
  unit?: string;
}

const Kundeanalyse: React.FC = () => {
  const { actualTheme } = useTheme();
  const [customerData, setCustomerData] = useState<CustomerData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Key Performance Indicators
  const kpis: CustomerKPI[] = [
    {
      label: 'Total Kunder',
      value: 1284,
      change: 8.3,
      trend: 'up',
      icon: UserGroupIcon,
      color: 'text-blue-600',
      target: 1500,
      unit: ''
    },
    {
      label: 'Nye Kunder',
      value: 156,
      change: 12.7,
      trend: 'up',
      icon: FaceSmileIcon,
      color: 'text-green-600',
      target: 200,
      unit: ''
    },
    {
      label: 'Kundetilfredshet',
      value: 4.6,
      change: 0.2,
      trend: 'up',
      icon: StarIcon,
      color: 'text-yellow-600',
      target: 4.5,
      unit: '/5'
    },
    {
      label: 'NPS Score',
      value: 67,
      change: 5.1,
      trend: 'up',
      icon: TrophyIcon,
      color: 'text-purple-600',
      target: 70,
      unit: ''
    },
    {
      label: 'Gjennomsnitt Verdi',
      value: '15,750',
      change: 3.8,
      trend: 'up',
      icon: CurrencyDollarIcon,
      color: 'text-emerald-600',
      unit: ' kr'
    },
    {
      label: 'Gjentakende Kunder',
      value: 23.4,
      change: -1.2,
      trend: 'down',
      icon: HeartIcon,
      color: 'text-red-600',
      target: 25,
      unit: '%'
    }
  ];

  useEffect(() => {
    hentCustomerData();
  }, [selectedPeriod]);

  const hentCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await rapporterService.hentCustomerData(selectedPeriod);
      setCustomerData(data);
    } catch (error) {
      console.error('Feil ved henting av kunde-data:', error);
      setError('Kunne ikke laste kunde-data. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  const filterConfigs: FilterConfig[] = [
    {
      id: 'periode',
      label: 'Periode',
      type: 'select',
      icon: CalendarDaysIcon,
      options: [
        { id: 'month', label: 'Månedlig', value: 'month' },
        { id: 'quarter', label: 'Kvartalsvis', value: 'quarter' },
        { id: 'year', label: 'Årlig', value: 'year' }
      ]
    },
    {
      id: 'geografi',
      label: 'Geografi',
      type: 'multiselect',
      icon: MapPinIcon,
      options: [
        { id: 'oslo', label: 'Oslo', value: 'oslo' },
        { id: 'bergen', label: 'Bergen', value: 'bergen' },
        { id: 'trondheim', label: 'Trondheim', value: 'trondheim' },
        { id: 'stavanger', label: 'Stavanger', value: 'stavanger' }
      ]
    },
    {
      id: 'segment',
      label: 'Kundesegment',
      type: 'select',
      icon: UserGroupIcon,
      options: [
        { id: 'alle', label: 'Alle kunder', value: 'alle' },
        { id: 'nye', label: 'Nye kunder', value: 'nye' },
        { id: 'aktive', label: 'Aktive kunder', value: 'aktive' },
        { id: 'gjentakende', label: 'Gjentakende kunder', value: 'gjentakende' }
      ]
    }
  ];

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getChangeColor = (change: number) => {
    return change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500';
  };

  const getProgressColor = (value: number, target?: number) => {
    if (!target) return 'bg-blue-500';
    const percentage = (value / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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
          <h1 className={`text-2xl font-bold ${
            actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
          }`}>
            Kundeanalyse
          </h1>
          <p className={`text-sm mt-1 ${
            actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Innsikt i kundedemografi, atferd og tilfredshet
          </p>
        </div>

        <DataExport
          data={customerData}
          filename="kundeanalyse-rapport"
          selectedItems={[]}
          onExport={async (format, data) => {
            console.log('Eksporter kundeanalyse:', format, data);
          }}
        />
      </div>

      {/* Filters */}
      <SearchAndFilter
        searchConfig={{
          placeholder: 'Søk i kundedata...',
          fields: ['periode']
        }}
        filterConfigs={filterConfigs}
        onSearch={(query) => console.log('Søk:', query)}
        onFilter={(filters) => console.log('Filtrer:', filters)}
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
              {getTrendIcon(kpi.trend)}
            </div>
            
            <div>
              <p className={`text-2xl font-bold ${
                actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}>
                {typeof kpi.value === 'string' ? kpi.value : kpi.value.toFixed(kpi.label.includes('score') || kpi.label.includes('tilfredshet') ? 1 : 0)}{kpi.unit}
              </p>
              <p className={`text-sm ${
                actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {kpi.label}
              </p>
              <div className="flex items-center justify-between mt-2">
                <p className={`text-xs ${getChangeColor(kpi.change)}`}>
                  {kpi.change > 0 ? '+' : ''}{kpi.change}% siden sist
                </p>
                {kpi.target && (
                  <p className={`text-xs ${
                    actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    Mål: {kpi.target}{kpi.unit}
                  </p>
                )}
              </div>
              
              {/* Progress bar for targets */}
              {kpi.target && (
                <div className={`mt-2 h-2 rounded-full ${
                  actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div
                    className={`h-2 rounded-full ${getProgressColor(
                      typeof kpi.value === 'string' 
                        ? parseFloat(kpi.value.replace(/[^0-9.-]+/g, '')) 
                        : kpi.value, 
                      kpi.target
                    )}`}
                    style={{ 
                      width: `${Math.min(100, (
                        (typeof kpi.value === 'string' 
                          ? parseFloat(kpi.value.replace(/[^0-9.-]+/g, '')) 
                          : kpi.value) / kpi.target
                      ) * 100)}%` 
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
        {/* Demographics */}
        <div className={`border rounded-lg p-6 ${
          actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center mb-4">
            <UserGroupIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className={`text-lg font-medium ${
              actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>
              Demografi
            </h3>
          </div>
          
          {customerData.length > 0 && (
            <div className="cards-spacing-vertical">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total kunder
                </span>
                <span className={`font-medium ${actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  {customerData[0].demografi.total_kunder.toLocaleString('no-NO')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Nye kunder (denne periode)
                </span>
                <span className="font-medium text-green-600">
                  {customerData[0].demografi.nye_kunder.toLocaleString('no-NO')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Aktive kunder
                </span>
                <span className={`font-medium ${actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  {customerData[0].demografi.aktive_kunder.toLocaleString('no-NO')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Gjennomsnitt alder
                </span>
                <span className={`font-medium ${actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  {customerData[0].demografi.gjennomsnitt_alder.toFixed(1)} år
                </span>
              </div>
              
              {/* Gender distribution */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className={`text-sm font-medium mb-2 ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Kjønnsfordeling
                </p>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Menn</span>
                      <span>{customerData[0].demografi.kjønnsfordeling.menn}</span>
                    </div>
                    <div className={`h-2 rounded-full ${actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ 
                          width: `${(customerData[0].demografi.kjønnsfordeling.menn / customerData[0].demografi.total_kunder) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Kvinner</span>
                      <span>{customerData[0].demografi.kjønnsfordeling.kvinner}</span>
                    </div>
                    <div className={`h-2 rounded-full ${actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className="h-2 bg-pink-500 rounded-full"
                        style={{ 
                          width: `${(customerData[0].demografi.kjønnsfordeling.kvinner / customerData[0].demografi.total_kunder) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Geographic Distribution */}
        <div className={`border rounded-lg p-6 ${
          actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center mb-4">
            <MapPinIcon className="h-6 w-6 text-green-600 mr-2" />
            <h3 className={`text-lg font-medium ${
              actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>
              Geografisk Fordeling
            </h3>
          </div>
          
          {customerData.length > 0 && (
            <div className="space-y-8">
              {Object.entries(customerData[0].geografi).map(([city, count]) => (
                <div key={city} className="flex justify-between items-center">
                  <span className={`text-sm capitalize ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {city}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                      {count}
                    </span>
                    <div className={`w-20 h-2 rounded-full ${actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className="h-2 bg-green-500 rounded-full"
                        style={{ 
                          width: `${(count / customerData[0].demografi.total_kunder) * 100}%` 
                        }}
                      />
                    </div>
                    <span className={`text-xs ${actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      {((count / customerData[0].demografi.total_kunder) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Behavior */}
        <div className={`border rounded-lg p-6 ${
          actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center mb-4">
            <ChartBarIcon className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className={`text-lg font-medium ${
              actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>
              Kundeatferd
            </h3>
          </div>
          
          {customerData.length > 0 && (
            <div className="cards-spacing-vertical">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Gjennomsnitt verdi per kunde
                </span>
                <span className="font-medium text-green-600">
                  {formatCurrency(customerData[0].atferd.gjennomsnitt_verdi)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Timer booket totalt
                </span>
                <span className={`font-medium ${actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  {customerData[0].atferd.antall_timer_booket.toLocaleString('no-NO')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Timer per kunde (snitt)
                </span>
                <span className={`font-medium ${actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  {customerData[0].atferd.gjennomsnitt_timer_per_kunde.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Fullførte kurs
                </span>
                <span className="font-medium text-green-600">
                  {customerData[0].atferd.fullført_kurs}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Avbrutte kurs
                </span>
                <span className="font-medium text-red-600">
                  {customerData[0].atferd.avbrutt_kurs}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Customer Satisfaction */}
        <div className={`border rounded-lg p-6 ${
          actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center mb-4">
            <StarIcon className="h-6 w-6 text-yellow-600 mr-2" />
            <h3 className={`text-lg font-medium ${
              actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>
              Tilfredshet & Lojalitet
            </h3>
          </div>
          
          {customerData.length > 0 && (
            <div className="cards-spacing-vertical">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  NPS Score
                </span>
                <span className={`font-medium ${
                  customerData[0].tilfredshet.nps_score >= 70 ? 'text-green-600' :
                  customerData[0].tilfredshet.nps_score >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {customerData[0].tilfredshet.nps_score}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Kundetilfredshet
                </span>
                <span className={`font-medium ${
                  customerData[0].tilfredshet.kundescore >= 4.5 ? 'text-green-600' :
                  customerData[0].tilfredshet.kundescore >= 4.0 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {customerData[0].tilfredshet.kundescore.toFixed(1)} / 5
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Anbefalinger mottatt
                </span>
                <span className="font-medium text-green-600">
                  {customerData[0].tilfredshet.anbefalinger}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Klager
                </span>
                <span className={`font-medium ${
                  customerData[0].tilfredshet.klager <= 5 ? 'text-green-600' :
                  customerData[0].tilfredshet.klager <= 10 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {customerData[0].tilfredshet.klager}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Gjentakende kunder
                </span>
                <span className="font-medium text-blue-600">
                  {customerData[0].tilfredshet.gjentakende_kunder}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`border rounded-lg p-4 ${
        actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <h3 className={`text-lg font-medium mb-3 ${
          actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
        }`}>
          Handlinger
        </h3>
        
        <div className="flex flex-wrap cards-spacing-grid">
          <button
            onClick={() => console.log('Generer kunderapport')}
            className="flex items-center px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Kunderapport
          </button>
          
          <button
            onClick={() => console.log('Segmentanalyse')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              actualTheme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Segmentanalyse
          </button>
          
          <button
            onClick={() => console.log('NPS undersøkelse')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              actualTheme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            <TrophyIcon className="h-4 w-4 mr-2" />
            NPS Undersøkelse
          </button>
        </div>
      </div>
    </div>
  );
};

export default Kundeanalyse; 