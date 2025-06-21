import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import SearchAndFilter, { FilterConfig } from '../../components/ui/SearchAndFilter';
import DataExport from '../../components/ui/DataExport';
import {
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  TrophyIcon,
  ClipboardDocumentCheckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  BanknotesIcon,
  StarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { rapporterService, type PersonalData } from '../../services/rapporter.service';

interface KPI {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
  target?: number;
}

const PersonalAnalyse: React.FC = () => {
  const { actualTheme } = useTheme();
  const [personalData, setPersonalData] = useState<PersonalData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterConfigs: FilterConfig[] = [
    {
      id: 'periode',
      label: 'Periode',
      type: 'select',
      options: [
        { id: 'month', value: 'month', label: 'Månedlig' },
        { id: 'quarter', value: 'quarter', label: 'Kvartalsvis' },
        { id: 'year', value: 'year', label: 'Årlig' }
      ]
    },
    {
      id: 'avdeling',
      label: 'Avdeling',
      type: 'select',
      options: [
        { id: 'alle', value: 'alle', label: 'Alle avdelinger' },
        { id: 'teori', value: 'teori', label: 'Teoriavdeling' },
        { id: 'praksis', value: 'praksis', label: 'Praksisavdeling' },
        { id: 'admin', value: 'admin', label: 'Administrasjon' }
      ]
    },
    {
      id: 'stilling',
      label: 'Stillingskategori',
      type: 'select',
      options: [
        { id: 'alle', value: 'alle', label: 'Alle stillinger' },
        { id: 'instruktor', value: 'instruktor', label: 'Instruktører' },
        { id: 'admin', value: 'admin', label: 'Administrativt' },
        { id: 'ledelse', value: 'ledelse', label: 'Ledelse' }
      ]
    }
  ];

  // Key Performance Indicators
  const kpis: KPI[] = [
    {
      label: 'Total Ansatte',
      value: '47',
      change: 8.5,
      trend: 'up',
      icon: UserGroupIcon,
      color: 'text-blue-600',
      target: 50
    },
    {
      label: 'Utnyttelsesgrad',
      value: '84.2%',
      change: 5.7,
      trend: 'up',
      icon: ChartBarIcon,
      color: 'text-green-600',
      target: 85
    },
    {
      label: 'Turnover Rate',
      value: '12.8%',
      change: -2.3,
      trend: 'down',
      icon: ArrowTrendingDownIcon,
      color: 'text-red-600',
      target: 10
    },
    {
      label: 'Tilfredshetsscore',
      value: '4.6/5',
      change: 4.2,
      trend: 'up',
      icon: StarIcon,
      color: 'text-purple-600',
      target: 4.5
    },
    {
      label: 'Sertifiseringer',
      value: '156',
      change: 12.8,
      trend: 'up',
      icon: TrophyIcon,
      color: 'text-yellow-600',
      target: 160
    },
    {
      label: 'Lønnskostnad',
      value: '3.2M',
      change: 6.4,
      trend: 'up',
      icon: CurrencyDollarIcon,
      color: 'text-indigo-600'
    }
  ];

  useEffect(() => {
    hentPersonalData();
  }, [selectedPeriod]);

  const hentPersonalData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await rapporterService.hentPersonalData(selectedPeriod);
      setPersonalData(data);
    } catch (error) {
      console.error('Feil ved henting av personal-data:', error);
      setError('Kunne ikke laste personal-data. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return ArrowTrendingUpIcon;
      case 'down':
        return ArrowTrendingDownIcon;
      default:
        return () => null;
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
            Personal Analyse
          </h1>
          <p className={`text-sm mt-1 ${
            actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Innsikt i personalforvaltning, produktivitet og kompetanseutvikling
          </p>
        </div>

        <DataExport
          data={personalData}
          filename="personal-analyse"
          selectedItems={[]}
          onExport={async (format, data) => {
            console.log('Eksporter personal analyse:', format, data);
          }}
        />
      </div>

      {/* Filters */}
      <SearchAndFilter
        searchConfig={{
          placeholder: 'Søk i personaldata...',
          fields: ['periode']
        }}
        filterConfigs={filterConfigs}
        onSearch={(query) => console.log('Søk:', query)}
        onFilter={(filters) => console.log('Filtrer:', filters)}
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          const TrendIcon = getTrendIcon(kpi.trend);
          
          return (
            <div key={index} className={`border rounded-lg p-6 ${
              actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon className={`h-8 w-8 ${kpi.color}`} />
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${
                      actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {kpi.label}
                    </p>
                    <p className={`text-2xl font-bold ${
                      actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      {kpi.value}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <TrendIcon className={`h-4 w-4 ${getTrendColor(kpi.trend)}`} />
                  <span className={`text-sm font-medium ml-1 ${getTrendColor(kpi.trend)}`}>
                    {kpi.change > 0 ? '+' : ''}{kpi.change}%
                  </span>
                </div>
              </div>
              {kpi.target && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Mål: {kpi.target}
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${
                    actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div 
                      className={`h-2 rounded-full ${kpi.color.replace('text-', 'bg-')}`}
                      style={{ 
                        width: `${Math.min((parseFloat(kpi.value) / kpi.target) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detaljert tabell */}
      <div className="border rounded-lg overflow-hidden mt-6">
        <div className={`px-6 py-4 border-b ${
          actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          <h3 className={`text-lg font-medium ${
            actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
          }`}>
            Detaljert Personalstatistikk
          </h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={actualTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
            <tr>
              <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider">Periode</th>
              <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider">Totalt ansatte</th>
              <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider">Aktive</th>
              <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider">Nye</th>
              <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider">Sluttet</th>
              <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider">Turnover %</th>
              <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider">Timer totalt</th>
              <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider">Fakturerbare</th>
              <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider">Utnyttelsesgrad</th>
              <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider">Overtid</th>
              <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider">Sertifiseringer</th>
              <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider">Kurs</th>
              <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider">Tilfredshet</th>
              <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider">Lønnskostnad</th>
            </tr>
          </thead>
          <tbody className={actualTheme === 'dark' ? 'divide-y divide-gray-700 bg-gray-800' : 'divide-y divide-gray-200 bg-white'}>
            {personalData.map((data) => (
              <tr key={data.id} className={actualTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                <td className="px-2 py-1 whitespace-nowrap font-medium">{data.periode}</td>
                <td className="px-2 py-1 whitespace-nowrap">{data.ansatte.totalt}</td>
                <td className="px-2 py-1 whitespace-nowrap">{data.ansatte.aktive}</td>
                <td className="px-2 py-1 whitespace-nowrap">+{data.ansatte.nye}</td>
                <td className="px-2 py-1 whitespace-nowrap">-{data.ansatte.sluttet}</td>
                <td className="px-2 py-1 whitespace-nowrap">{data.ansatte.turnover_rate}%</td>
                <td className="px-2 py-1 whitespace-nowrap">{data.produktivitet.timer_totalt}</td>
                <td className="px-2 py-1 whitespace-nowrap">{data.produktivitet.timer_fakturerbare}</td>
                <td className="px-2 py-1 whitespace-nowrap">{data.produktivitet.utnyttelsesgrad}%</td>
                <td className="px-2 py-1 whitespace-nowrap">{data.produktivitet.overtime_timer}</td>
                <td className="px-2 py-1 whitespace-nowrap">{data.kompetanse.sertifiseringer}</td>
                <td className="px-2 py-1 whitespace-nowrap">{data.kompetanse.kurs_fullført}</td>
                <td className="px-2 py-1 whitespace-nowrap">{data.tilfredshet.score}/5</td>
                <td className="px-2 py-1 whitespace-nowrap">{formatCurrency(data.kostnad.lønn_totalt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PersonalAnalyse; 