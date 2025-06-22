import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  DocumentChartBarIcon,
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface AnalyseData {
  period: string;
  totalKontroller: number;
  beståttRate: number;
  gjennomsnittPoeng: number;
  trendData: { date: string; value: number }[];
  kategorier: { navn: string; antall: number; beståttRate: number }[];
  risikoanalyse: { kategori: string; risiko: 'lav' | 'medium' | 'høy'; beskrivelse: string }[];
}

interface FilterOptions {
  periode: '7d' | '30d' | '90d' | '1y';
  kategori: string;
  instruktør: string;
  bedrift: string;
}

const Forslag3Analyse: React.FC = () => {
  const [analyseData, setAnalyseData] = useState<AnalyseData | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    periode: '30d',
    kategori: 'alle',
    instruktør: 'alle',
    bedrift: 'alle'
  });
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState<'trend' | 'kategori' | 'risiko'>('trend');

  useEffect(() => {
    // Mock data basert på filtre
    const mockData: AnalyseData = {
      period: filters.periode,
      totalKontroller: 1247,
      beståttRate: 87.3,
      gjennomsnittPoeng: 78.5,
      trendData: [
        { date: '2025-01-01', value: 85.2 },
        { date: '2025-01-02', value: 87.1 },
        { date: '2025-01-03', value: 84.8 },
        { date: '2025-01-04', value: 89.2 },
        { date: '2025-01-05', value: 88.7 },
        { date: '2025-01-06', value: 86.4 },
        { date: '2025-01-07', value: 90.1 },
        { date: '2025-01-08', value: 87.8 },
        { date: '2025-01-09', value: 85.9 },
        { date: '2025-01-10', value: 88.3 },
        { date: '2025-01-11', value: 89.6 },
        { date: '2025-01-12', value: 87.2 },
        { date: '2025-01-13', value: 91.4 },
        { date: '2025-01-14', value: 88.9 },
        { date: '2025-01-15', value: 87.3 }
      ],
      kategorier: [
        { navn: 'Bil', antall: 456, beståttRate: 89.2 },
        { navn: 'Utstyr', antall: 287, beståttRate: 82.1 },
        { navn: 'Medisinsk', antall: 198, beståttRate: 94.4 },
        { navn: 'Teknisk', antall: 156, beståttRate: 78.8 },
        { navn: 'Miljø', antall: 150, beståttRate: 85.3 }
      ],
      risikoanalyse: [
        {
          kategori: 'Teknisk kontroll',
          risiko: 'høy',
          beskrivelse: 'Lav bestått-rate (78.8%) indikerer behov for forbedret opplæring'
        },
        {
          kategori: 'Utstyr',
          risiko: 'medium',
          beskrivelse: 'Moderat bestått-rate (82.1%) med rom for forbedring'
        },
        {
          kategori: 'Bil',
          risiko: 'lav',
          beskrivelse: 'Høy bestått-rate (89.2%) indikerer god kompetanse'
        },
        {
          kategori: 'Medisinsk',
          risiko: 'lav',
          beskrivelse: 'Svært høy bestått-rate (94.4%) viser excellent kunnskap'
        }
      ]
    };

    setAnalyseData(mockData);
    setLoading(false);
  }, [filters]);

  const getRisikoColor = (risiko: string) => {
    switch (risiko) {
      case 'lav': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'høy': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRisikoIcon = (risiko: string) => {
    switch (risiko) {
      case 'lav': return CheckCircleIcon;
      case 'medium': return ClockIcon;
      case 'høy': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  const exportData = (format: 'pdf' | 'excel' | 'csv') => {
    // Mock export functionality
    alert(`Eksporterer data som ${format.toUpperCase()}...`);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/sikkerhetskontroll"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Tilbake til forslag
            </Link>
            <div className="w-px h-6 bg-gray-300"></div>
            <h1 className="text-3xl font-bold text-gray-900">
              Avansert Analyse
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
              <FunnelIcon className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtre aktive</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportData('pdf')}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                PDF
              </button>
              <button
                onClick={() => exportData('excel')}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtre og innstillinger</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Periode</label>
              <select
                value={filters.periode}
                onChange={(e) => setFilters({...filters, periode: e.target.value as any})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Siste 7 dager</option>
                <option value="30d">Siste 30 dager</option>
                <option value="90d">Siste 90 dager</option>
                <option value="1y">Siste år</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select
                value={filters.kategori}
                onChange={(e) => setFilters({...filters, kategori: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="alle">Alle kategorier</option>
                <option value="bil">Bil</option>
                <option value="utstyr">Utstyr</option>
                <option value="medisinsk">Medisinsk</option>
                <option value="teknisk">Teknisk</option>
                <option value="miljø">Miljø</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instruktør</label>
              <select
                value={filters.instruktør}
                onChange={(e) => setFilters({...filters, instruktør: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="alle">Alle instruktører</option>
                <option value="lars">Lars Hansen</option>
                <option value="maria">Maria Olsen</option>
                <option value="erik">Erik Lie</option>
                <option value="anne">Anne Knutsen</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bedrift</label>
              <select
                value={filters.bedrift}
                onChange={(e) => setFilters({...filters, bedrift: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="alle">Alle bedrifter</option>
                <option value="bedrift1">Bedrift A</option>
                <option value="bedrift2">Bedrift B</option>
                <option value="bedrift3">Bedrift C</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                <span className="font-medium text-green-600">+5.2%</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {analyseData?.totalKontroller.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Totale kontroller</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                <span className="font-medium text-green-600">+2.1%</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {analyseData?.beståttRate}%
            </div>
            <div className="text-sm text-gray-600">Bestått rate</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <DocumentChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                <span className="font-medium text-red-600">-1.3%</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {analyseData?.gjennomsnittPoeng}
            </div>
            <div className="text-sm text-gray-600">Gjennomsnitt poeng</div>
          </div>
        </div>

        {/* Chart Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Detaljert analyse</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedChart('trend')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedChart === 'trend'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Trendanalyse
                </button>
                <button
                  onClick={() => setSelectedChart('kategori')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedChart === 'kategori'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Kategorianalyse
                </button>
                <button
                  onClick={() => setSelectedChart('risiko')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedChart === 'risiko'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Risikoanalyse
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {selectedChart === 'trend' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bestått rate over tid</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Interaktiv trendgraf vil vises her</p>
                    <p className="text-sm text-gray-500">Viser bestått rate: {analyseData?.beståttRate}% (siste 15 dager)</p>
                  </div>
                </div>
              </div>
            )}
            
            {selectedChart === 'kategori' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyse per kategori</h3>
                <div className="space-y-4">
                  {analyseData?.kategorier.map((kategori) => (
                    <div key={kategori.navn} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{kategori.navn[0]}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{kategori.navn}</div>
                          <div className="text-sm text-gray-600">{kategori.antall} kontroller</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{kategori.beståttRate}%</div>
                        <div className="text-sm text-gray-600">Bestått rate</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedChart === 'risiko' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risikoanalyse</h3>
                <div className="space-y-4">
                  {analyseData?.risikoanalyse.map((risiko, index) => {
                    const RisikoIcon = getRisikoIcon(risiko.risiko);
                    return (
                      <div key={index} className={`p-4 rounded-lg border ${getRisikoColor(risiko.risiko)}`}>
                        <div className="flex items-start gap-3">
                          <RisikoIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{risiko.kategori}</h4>
                              <span className="text-xs font-medium uppercase tracking-wide">
                                {risiko.risiko} risiko
                              </span>
                            </div>
                            <p className="text-sm">{risiko.beskrivelse}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Advanced Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tidsserieanalyse</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Beste dag</span>
                <span className="font-medium text-gray-900">Fredag (91.4%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Verste dag</span>
                <span className="font-medium text-gray-900">Mandag (84.8%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Beste måned</span>
                <span className="font-medium text-gray-900">Desember (89.2%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sesongvariasjoner</span>
                <span className="font-medium text-gray-900">±3.2%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prediktiv analyse</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Forventet bestått rate neste måned</span>
                <span className="font-medium text-green-600">88.7%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Antall kontroller neste måned</span>
                <span className="font-medium text-gray-900">1,340</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Risiko for nedgang</span>
                <span className="font-medium text-yellow-600">Lav (12%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Anbefalt handling</span>
                <span className="font-medium text-blue-600">Fokus på teknisk</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forslag3Analyse; 