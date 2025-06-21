import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import SearchAndFilter, { FilterConfig } from '../../components/ui/SearchAndFilter';
import DataExport from '../../components/ui/DataExport';
import { rapporteringService, FinancialData as ServiceFinancialData } from '../../services/rapportering.service';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  CreditCardIcon,
  CalculatorIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface FinancialData {
  id: string;
  periode: string;
  inntekter: {
    kursavgifter: number;
    eksamensavgifter: number;
    utstyrsleie: number;
    andre: number;
    total: number;
  };
  utgifter: {
    lønn: number;
    drivstoff: number;
    vedlikehold: number;
    forsikring: number;
    andre: number;
    total: number;
  };
  resultat: number;
  margin: number;
  trend: 'up' | 'down' | 'stable';
}

interface KPI {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  target?: number;
}

const Finansiell: React.FC = () => {
  const { actualTheme } = useTheme();
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  // Key Performance Indicators
  const kpis: KPI[] = [
    {
      label: 'Total Omsetning',
      value: '2,450,000',
      change: 12.3,
      trend: 'up',
      icon: CurrencyDollarIcon,
      color: 'text-green-600',
      target: 2500000
    },
    {
      label: 'Total Utgifter',
      value: '1,890,000',
      change: 5.7,
      trend: 'up',
      icon: CreditCardIcon,
      color: 'text-red-600',
      target: 1800000
    },
    {
      label: 'Netto Resultat',
      value: '560,000',
      change: 24.8,
      trend: 'up',
      icon: CalculatorIcon,
      color: 'text-blue-600',
      target: 600000
    },
    {
      label: 'Margin %',
      value: '22.9%',
      change: 3.2,
      trend: 'up',
      icon: ReceiptPercentIcon,
      color: 'text-purple-600',
      target: 25
    },
    {
      label: 'Kontantstrøm',
      value: '425,000',
      change: 8.9,
      trend: 'up',
      icon: BanknotesIcon,
      color: 'text-emerald-600'
    },
    {
      label: 'ROI %',
      value: '18.4%',
      change: 2.1,
      trend: 'up',
      icon: ArrowTrendingUpIcon,
      color: 'text-indigo-600',
      target: 20
    }
  ];

  useEffect(() => {
    lastFinansielleData();
  }, [selectedPeriod]);

  const lastFinansielleData = async () => {
    try {
      setLoading(true);
      
      // Bruker mock data for utvikling
      const serviceData = await rapporteringService.hentFinansielleDataMock();
      
      // Konverter service data til lokal format
      const convertedData: FinancialData[] = serviceData.map(item => ({
        id: item.id,
        periode: item.periode,
        inntekter: {
          kursavgifter: item.detaljer.kjøretimer,
          eksamensavgifter: item.detaljer.prøveavgifter,
          utstyrsleie: item.detaljer.teoriundervisning,
          andre: item.detaljer.andre,
          total: item.inntekter
        },
        utgifter: {
          lønn: Math.round(item.utgifter * 0.6),
          drivstoff: Math.round(item.utgifter * 0.15),
          vedlikehold: Math.round(item.utgifter * 0.12),
          forsikring: Math.round(item.utgifter * 0.08),
          andre: Math.round(item.utgifter * 0.05),
          total: item.utgifter
        },
        resultat: item.resultat,
        margin: item.margin,
        trend: item.resultat > 0 ? 'up' : 'down'
      }));
      
      setFinancialData(convertedData);
    } catch (error) {
      console.error('Feil ved lasting av finansielle data:', error);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getProgressColor = (value: number, target?: number) => {
    if (!target) return 'bg-blue-500';
    const percentage = (value / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
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
            Finansiell Rapportering
          </h1>
          <p className={`text-sm mt-1 ${
            actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Oversikt over inntekter, utgifter og lønnsomhet
          </p>
        </div>

        <DataExport
          data={financialData}
          filename="finansiell-rapport"
          selectedItems={[]}
          onExport={async (format, data) => {
            console.log('Eksporter finansiell rapport:', format, data);
          }}
        />
      </div>

      {/* Filters */}
      <SearchAndFilter
        searchConfig={{
          placeholder: 'Søk i finansielle data...',
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
                {typeof kpi.value === 'string' ? kpi.value : formatCurrency(kpi.value)}
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
                    Mål: {typeof kpi.target === 'string' ? kpi.target : formatCurrency(kpi.target)}
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

      {/* Financial Data Table */}
      <div className={`border rounded-lg overflow-hidden ${
        actualTheme === 'dark' ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <div className={`px-6 py-4 border-b ${
          actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          <h3 className={`text-lg font-medium ${
            actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
          }`}>
            Detaljert Finansiell Oversikt
          </h3>
        </div>

        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={actualTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Periode
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Inntekter
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Utgifter
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Resultat
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Margin
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Trend
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Handlinger
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${actualTheme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
            {financialData.map((data) => (
              <tr key={data.id} className={actualTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                <td className="px-2 py-1 whitespace-nowrap">
                  <div className={`text-sm font-medium ${
                    actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    {data.periode}
                  </div>
                </td>
                <td className="px-2 py-1 whitespace-nowrap">
                  <div className={`text-sm font-medium text-green-600`}>
                    {formatCurrency(data.inntekter.total)}
                  </div>
                  <div className={`text-xs ${
                    actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Kurs: {formatCurrency(data.inntekter.kursavgifter)}
                  </div>
                </td>
                <td className="px-2 py-1 whitespace-nowrap">
                  <div className={`text-sm font-medium text-red-600`}>
                    {formatCurrency(data.utgifter.total)}
                  </div>
                  <div className={`text-xs ${
                    actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Lønn: {formatCurrency(data.utgifter.lønn)}
                  </div>
                </td>
                <td className="px-2 py-1 whitespace-nowrap">
                  <div className={`text-sm font-bold ${
                    data.resultat > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(data.resultat)}
                  </div>
                </td>
                <td className="px-2 py-1 whitespace-nowrap">
                  <div className={`text-sm font-medium ${
                    data.margin > 20 ? 'text-green-600' : data.margin > 15 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {data.margin.toFixed(1)}%
                  </div>
                </td>
                <td className="px-2 py-1 whitespace-nowrap">
                  {getTrendIcon(data.trend)}
                </td>
                <td className="px-2 py-1 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => console.log('Vis detaljer:', data.id)}
                      className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 ${
                        actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                      title="Vis detaljer"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => console.log('Eksporter:', data.id)}
                      className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 ${
                        actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                      title="Eksporter"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
            onClick={() => console.log('Generer månedlig rapport')}
            className="flex items-center px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Månedlig rapport
          </button>
          
          <button
            onClick={() => console.log('Vis prognoser')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              actualTheme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Prognoser
          </button>
          
          <button
            onClick={() => console.log('Budsjett sammenligning')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              actualTheme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            <CalculatorIcon className="h-4 w-4 mr-2" />
            Budsjett
          </button>
        </div>
      </div>
    </div>
  );
};

export default Finansiell; 