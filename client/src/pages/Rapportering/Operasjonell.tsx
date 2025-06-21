import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import SearchAndFilter, { FilterConfig } from '../../components/ui/SearchAndFilter';
import DataExport from '../../components/ui/DataExport';
import { rapporteringService, OperationalData as ServiceOperationalData } from '../../services/rapportering.service';
import {
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  TruckIcon,
  ClipboardDocumentCheckIcon,
  StarIcon,
  BoltIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface OperationalData {
  id: string;
  periode: string;
  produktivitet: {
    timer_totalt: number;
    timer_fakturerbare: number;
    utnyttelsesgrad: number;
    timer_per_elev: number;
  };
  kvalitet: {
    gjennomført_prøver: number;
    bestått_prøver: number;
    bestått_prosent: number;
    gjennomsnitt_karakter: number;
  };
  kapasitet: {
    instruktører_aktive: number;
    kjøretøy_tilgjengelige: number;
    bookede_timer: number;
    ledig_kapasitet: number;
  };
  kundetilfredshet: {
    score: number;
    anmeldelser: number;
    klager: number;
    anbefaling_rate: number;
  };
}

interface OperationalKPI {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  target?: number;
  unit?: string;
}

const Operasjonell: React.FC = () => {
  const { actualTheme } = useTheme();
  const [operationalData, setOperationalData] = useState<OperationalData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  // Key Performance Indicators
  const kpis: OperationalKPI[] = [
    {
      label: 'Utnyttelsesgrad',
      value: 78.5,
      change: 5.2,
      trend: 'up',
      icon: ChartBarIcon,
      color: 'text-blue-600',
      target: 85,
      unit: '%'
    },
    {
      label: 'Bestått Rate',
      value: 92.3,
      change: 2.1,
      trend: 'up',
      icon: CheckCircleIcon,
      color: 'text-green-600',
      target: 90,
      unit: '%'
    },
    {
      label: 'Timer per Elev',
      value: 45.8,
      change: -3.2,
      trend: 'down',
      icon: ClockIcon,
      color: 'text-purple-600',
      target: 40,
      unit: 'timer'
    },
    {
      label: 'Kundetilfredshet',
      value: 4.6,
      change: 0.3,
      trend: 'up',
      icon: StarIcon,
      color: 'text-yellow-600',
      target: 4.5,
      unit: '/5'
    },
    {
      label: 'Aktive Instruktører',
      value: 24,
      change: 9.1,
      trend: 'up',
      icon: UserGroupIcon,
      color: 'text-indigo-600',
      target: 25,
      unit: 'personer'
    },
    {
      label: 'Operasjonell Effektivitet',
      value: 87.2,
      change: 4.7,
      trend: 'up',
      icon: BoltIcon,
      color: 'text-emerald-600',
      target: 90,
      unit: '%'
    }
  ];

  useEffect(() => {
    lastOperasjonelleData();
  }, [selectedPeriod]);

  const lastOperasjonelleData = async () => {
    try {
      setLoading(true);
      
      // Bruker mock data for utvikling
      const serviceData = await rapporteringService.hentOperasjonelleDataMock();
      
      // Konverter service data til lokal format
      const convertedData: OperationalData[] = serviceData.map(item => ({
        id: item.id,
        periode: item.periode,
        produktivitet: {
          timer_totalt: Math.round(item.gjennomsnittTimer * item.antallElever * 1.3),
          timer_fakturerbare: Math.round(item.gjennomsnittTimer * item.antallElever),
          utnyttelsesgrad: item.aktivitetsrate,
          timer_per_elev: item.gjennomsnittTimer
        },
        kvalitet: {
          gjennomført_prøver: Math.round(item.fullførteElever * 1.5),
          bestått_prøver: Math.round(item.fullførteElever * (item.beståttprosent / 100) * 1.5),
          bestått_prosent: item.beståttprosent,
          gjennomsnitt_karakter: 3.5 + (item.beståttprosent / 100)
        },
        kapasitet: {
          instruktører_aktive: Math.round(item.antallElever / 15),
          kjøretøy_tilgjengelige: Math.round(item.antallElever / 10),
          bookede_timer: Math.round(item.gjennomsnittTimer * item.antallElever),
          ledig_kapasitet: 100 - item.instruktørUtilisering
        },
        kundetilfredshet: {
          score: 4.0 + (item.aktivitetsrate / 100),
          anmeldelser: Math.round(item.antallElever * 0.4),
          klager: Math.round((100 - item.aktivitetsrate) / 30),
          anbefaling_rate: item.aktivitetsrate + 10
        }
      }));
      
      setOperationalData(convertedData);
    } catch (error) {
      console.error('Feil ved lasting av operasjonelle data:', error);
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
      id: 'kategori',
      label: 'Kategori',
      type: 'multiselect',
      icon: ChartBarIcon,
      options: [
        { id: 'produktivitet', label: 'Produktivitet', value: 'produktivitet' },
        { id: 'kvalitet', label: 'Kvalitet', value: 'kvalitet' },
        { id: 'kapasitet', label: 'Kapasitet', value: 'kapasitet' },
        { id: 'tilfredshet', label: 'Kundetilfredshet', value: 'tilfredshet' }
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

  const getProgressColor = (value: number, target?: number, reverse = false) => {
    if (!target) return 'bg-blue-500';
    const percentage = (value / target) * 100;
    
    if (reverse) {
      // For metrics where lower is better (like timer per elev)
      if (percentage <= 100) return 'bg-green-500';
      if (percentage <= 120) return 'bg-yellow-500';
      return 'bg-red-500';
    } else {
      // For metrics where higher is better
      if (percentage >= 100) return 'bg-green-500';
      if (percentage >= 80) return 'bg-yellow-500';
      return 'bg-red-500';
    }
  };

  const getStatusColor = (value: number, good: number, warning: number, reverse = false) => {
    if (reverse) {
      if (value <= good) return 'text-green-600';
      if (value <= warning) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (value >= good) return 'text-green-600';
      if (value >= warning) return 'text-yellow-600';
      return 'text-red-600';
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
          <h1 className={`text-2xl font-bold ${
            actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
          }`}>
            Operasjonell Rapportering
          </h1>
          <p className={`text-sm mt-1 ${
            actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Oversikt over produktivitet, kapasitet og kvalitet
          </p>
        </div>

        <DataExport
          data={operationalData}
          filename="operasjonell-rapport"
          selectedItems={[]}
          onExport={async (format, data) => {
            console.log('Eksporter operasjonell rapport:', format, data);
          }}
        />
      </div>

      {/* Filters */}
      <SearchAndFilter
        searchConfig={{
          placeholder: 'Søk i operasjonelle data...',
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
                {typeof kpi.value === 'number' ? kpi.value.toFixed(1) : kpi.value}{kpi.unit}
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
                      typeof kpi.value === 'number' ? kpi.value : parseFloat(kpi.value.toString()), 
                      kpi.target,
                      kpi.label === 'Timer per Elev' // Reverse for this metric
                    )}`}
                    style={{ 
                      width: `${Math.min(100, (
                        (typeof kpi.value === 'number' ? kpi.value : parseFloat(kpi.value.toString())) / kpi.target
                      ) * 100)}%` 
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
        {/* Productivity Metrics */}
        <div className={`border rounded-lg p-6 ${
          actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center mb-4">
            <BoltIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className={`text-lg font-medium ${
              actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>
              Produktivitet
            </h3>
          </div>
          
          {operationalData.length > 0 && (
            <div className="cards-spacing-vertical">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Utnyttelsesgrad
                </span>
                <span className={`font-medium ${getStatusColor(operationalData[0].produktivitet.utnyttelsesgrad, 80, 70)}`}>
                  {operationalData[0].produktivitet.utnyttelsesgrad.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Fakturerbare timer
                </span>
                <span className={`font-medium ${actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  {operationalData[0].produktivitet.timer_fakturerbare} / {operationalData[0].produktivitet.timer_totalt}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Timer per elev (snitt)
                </span>
                <span className={`font-medium ${getStatusColor(operationalData[0].produktivitet.timer_per_elev, 40, 50, true)}`}>
                  {operationalData[0].produktivitet.timer_per_elev.toFixed(1)} timer
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quality Metrics */}
        <div className={`border rounded-lg p-6 ${
          actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center mb-4">
            <AcademicCapIcon className="h-6 w-6 text-green-600 mr-2" />
            <h3 className={`text-lg font-medium ${
              actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>
              Kvalitet
            </h3>
          </div>
          
          {operationalData.length > 0 && (
            <div className="cards-spacing-vertical">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Bestått rate
                </span>
                <span className={`font-medium ${getStatusColor(operationalData[0].kvalitet.bestått_prosent, 90, 80)}`}>
                  {operationalData[0].kvalitet.bestått_prosent.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Gjennomført prøver
                </span>
                <span className={`font-medium ${actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  {operationalData[0].kvalitet.bestått_prøver} / {operationalData[0].kvalitet.gjennomført_prøver}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Snitt karakter
                </span>
                <span className={`font-medium ${getStatusColor(operationalData[0].kvalitet.gjennomsnitt_karakter, 4.0, 3.5)}`}>
                  {operationalData[0].kvalitet.gjennomsnitt_karakter.toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Capacity Metrics */}
        <div className={`border rounded-lg p-6 ${
          actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center mb-4">
            <TruckIcon className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className={`text-lg font-medium ${
              actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>
              Kapasitet
            </h3>
          </div>
          
          {operationalData.length > 0 && (
            <div className="cards-spacing-vertical">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Aktive instruktører
                </span>
                <span className={`font-medium ${actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  {operationalData[0].kapasitet.instruktører_aktive}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tilgjengelige kjøretøy
                </span>
                <span className={`font-medium ${actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  {operationalData[0].kapasitet.kjøretøy_tilgjengelige}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Ledig kapasitet
                </span>
                <span className={`font-medium ${getStatusColor(operationalData[0].kapasitet.ledig_kapasitet, 15, 25, true)}`}>
                  {operationalData[0].kapasitet.ledig_kapasitet.toFixed(1)}%
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
              Kundetilfredshet
            </h3>
          </div>
          
          {operationalData.length > 0 && (
            <div className="cards-spacing-vertical">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Kundescore
                </span>
                <span className={`font-medium ${getStatusColor(operationalData[0].kundetilfredshet.score, 4.5, 4.0)}`}>
                  {operationalData[0].kundetilfredshet.score.toFixed(1)} / 5
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Anbefalingsrate
                </span>
                <span className={`font-medium ${getStatusColor(operationalData[0].kundetilfredshet.anbefaling_rate, 85, 75)}`}>
                  {operationalData[0].kundetilfredshet.anbefaling_rate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Klager denne måneden
                </span>
                <span className={`font-medium ${
                  operationalData[0].kundetilfredshet.klager <= 2 ? 'text-green-600' : 
                  operationalData[0].kundetilfredshet.klager <= 5 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {operationalData[0].kundetilfredshet.klager}
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
            onClick={() => console.log('Generer månedsrapport')}
            className="flex items-center px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Månedsrapport
          </button>
          
          <button
            onClick={() => console.log('Vis kapasitetsanalyse')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              actualTheme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Kapasitetsanalyse
          </button>
          
          <button
            onClick={() => console.log('Kvalitetsgjennomgang')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              actualTheme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            <ClipboardDocumentCheckIcon className="h-4 w-4 mr-2" />
            Kvalitetsgjennomgang
          </button>
        </div>
      </div>
    </div>
  );
};

export default Operasjonell; 