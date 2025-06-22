import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ClockIcon,
  TrophyIcon,
  ArrowLeftIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

interface AnalyticsMetric {
  navn: string;
  verdi: number;
  endring: number;
  periode: string;
  trend: 'up' | 'down' | 'stable';
}

interface CategoryPerformance {
  kategori: string;
  totalQuizer: number;
  gjennomsnitt: number;
  fullforinger: number;
  forbedring: number;
}

interface PredictiveInsight {
  type: 'warning' | 'opportunity' | 'info';
  tittel: string;
  beskrivelse: string;
  anbefaling: string;
  sannsynlighet: number;
}

export default function AdminForslag2_Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [activeView, setActiveView] = useState('overview');

  const [metrics] = useState<AnalyticsMetric[]>([
    {
      navn: 'Totale Quiz Fullføringer',
      verdi: 2847,
      endring: 12.3,
      periode: 'Siste 30 dager',
      trend: 'up'
    },
    {
      navn: 'Gjennomsnittlig Score',
      verdi: 78.5,
      endring: 3.2,
      periode: 'Siste 30 dager',
      trend: 'up'
    },
    {
      navn: 'Aktive Brukere',
      verdi: 156,
      endring: -2.1,
      periode: 'Siste 30 dager',
      trend: 'down'
    },
    {
      navn: 'Quiz Opprettelser',
      verdi: 23,
      endring: 8.7,
      periode: 'Siste 30 dager',
      trend: 'up'
    }
  ]);

  const [categoryPerformance] = useState<CategoryPerformance[]>([
    {
      kategori: 'Trafikkregler',
      totalQuizer: 45,
      gjennomsnitt: 82.3,
      fullforinger: 1234,
      forbedring: 5.2
    },
    {
      kategori: 'Sikkerhet',
      totalQuizer: 32,
      gjennomsnitt: 76.8,
      fullforinger: 987,
      forbedring: -1.3
    },
    {
      kategori: 'Kjøreteknikk',
      totalQuizer: 28,
      gjennomsnitt: 71.5,
      fullforinger: 756,
      forbedring: 2.8
    },
    {
      kategori: 'Førstehjelp',
      totalQuizer: 18,
      gjennomsnitt: 85.1,
      fullforinger: 543,
      forbedring: 7.9
    }
  ]);

  const [predictiveInsights] = useState<PredictiveInsight[]>([
    {
      type: 'warning',
      tittel: 'Fallende Engasjement',
      beskrivelse: 'Brukeraktivitet har falt 15% de siste to ukene',
      anbefaling: 'Implementer gamification eller belønningssystem',
      sannsynlighet: 87
    },
    {
      type: 'opportunity',
      tittel: 'Høy Etterspørsel - Motorveikjøring',
      beskrivelse: 'Søk etter motorvei-relaterte quizer har økt 45%',
      anbefaling: 'Opprett flere quizer innen motorveikjøring',
      sannsynlighet: 92
    },
    {
      type: 'info',
      tittel: 'Optimal Quiz-lengde',
      beskrivelse: 'Quizer med 15-20 spørsmål har høyest fullføringsrate',
      anbefaling: 'Anbefal lærere å holde quizer innenfor dette området',
      sannsynlighet: 78
    }
  ]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-red-200 bg-red-50';
      case 'opportunity': return 'border-green-200 bg-green-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'opportunity': return '🚀';
      case 'info': return 'ℹ️';
      default: return '📊';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getTrendIcon(metric.trend)}
                <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                  {metric.endring > 0 ? '+' : ''}{metric.endring}%
                </span>
              </div>
              <div className="text-xs text-gray-500">{metric.periode}</div>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">{metric.verdi.toLocaleString()}</div>
            <div className="text-sm text-gray-600">{metric.navn}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Quiz Aktivitet</h3>
            <div className="flex items-center space-x-2">
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="7d">Siste 7 dager</option>
                <option value="30d">Siste 30 dager</option>
                <option value="90d">Siste 90 dager</option>
              </select>
            </div>
          </div>
          
          {/* Mock Chart */}
          <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <div className="text-gray-600">Interaktivt diagram kommer her</div>
              <div className="text-sm text-gray-500 mt-2">Viser quiz-aktivitet over tid</div>
            </div>
          </div>
        </div>

        {/* Performance Distribution */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Score Fordeling</h3>
          
          {/* Mock Pie Chart */}
          <div className="h-64 bg-gradient-to-br from-green-50 to-teal-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <div className="text-white font-bold text-lg">78.5%</div>
              </div>
              <div className="text-gray-600">Gjennomsnittlig score</div>
              <div className="text-sm text-gray-500 mt-2">Basert på alle fullførte quizer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">Kategori Ytelse</h3>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center space-x-2">
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>Eksporter</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Kategori</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Antall Quizer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Gjennomsnitt</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Fullføringer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Forbedring</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Handling</th>
                </tr>
              </thead>
              <tbody>
                {categoryPerformance.map((category, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          {category.kategori.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800">{category.kategori}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{category.totalQuizer}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`font-semibold ${
                          category.gjennomsnitt >= 80 ? 'text-green-600' :
                          category.gjennomsnitt >= 70 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {category.gjennomsnitt}%
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              category.gjennomsnitt >= 80 ? 'bg-green-500' :
                              category.gjennomsnitt >= 70 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${category.gjennomsnitt}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{category.fullforinger.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        {category.forbedring > 0 ? (
                          <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          category.forbedring > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {category.forbedring > 0 ? '+' : ''}{category.forbedring}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button className="bg-indigo-500 text-white px-3 py-1 rounded-lg hover:bg-indigo-600 transition-colors text-sm flex items-center space-x-1">
                        <EyeIcon className="w-4 h-4" />
                        <span>Detaljer</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPredictive = () => (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <CpuChipIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">AI-Drevne Innsikter</h2>
            <p className="text-gray-600">Prediktive analyser og anbefalinger basert på maskinlæring</p>
          </div>
        </div>
      </div>

      {/* Predictive Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {predictiveInsights.map((insight, index) => (
          <div key={index} className={`rounded-2xl shadow-lg p-6 border-2 ${getInsightColor(insight.type)}`}>
            <div className="flex items-start space-x-4">
              <div className="text-2xl">{getInsightIcon(insight.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800">{insight.tittel}</h3>
                  <span className="text-sm font-medium text-gray-600">{insight.sannsynlighet}%</span>
                </div>
                <p className="text-gray-700 mb-3">{insight.beskrivelse}</p>
                <div className="bg-white/50 rounded-lg p-3 mb-4">
                  <div className="text-sm font-medium text-gray-800 mb-1">Anbefaling:</div>
                  <div className="text-sm text-gray-700">{insight.anbefaling}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                    <div 
                      className={`h-2 rounded-full ${
                        insight.type === 'warning' ? 'bg-red-500' :
                        insight.type === 'opportunity' ? 'bg-green-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${insight.sannsynlighet}%` }}
                    />
                  </div>
                  <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors text-sm">
                    Handle
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trend Predictions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Trendprediksjoner</h3>
          <p className="text-gray-600 text-sm mt-1">Forventet utvikling de neste 30 dagene</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">+18%</div>
              <div className="text-sm text-gray-600">Forventet økning i quiz-fullføringer</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <UserGroupIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">+12</div>
              <div className="text-sm text-gray-600">Nye aktive brukere</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <TrophyIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">+3.2%</div>
              <div className="text-sm text-gray-600">Forbedring i gjennomsnittsscore</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">AI Anbefalinger</h3>
          <p className="text-gray-600 text-sm mt-1">Handlingsrettede forslag for å forbedre systemet</p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
              <div>
                <div className="font-semibold text-blue-800">Optimaliser Quiz-timing</div>
                <div className="text-blue-700 text-sm mt-1">Publiser nye quizer på tirsdager kl. 14:00 for maksimal engasjement</div>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
              <div>
                <div className="font-semibold text-green-800">Fokuser på Svake Områder</div>
                <div className="text-green-700 text-sm mt-1">Opprett flere quizer innen "Kjøreteknikk" - lavest score (71.5%)</div>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
              <div>
                <div className="font-semibold text-purple-800">Implementer Adaptiv Læring</div>
                <div className="text-purple-700 text-sm mt-1">Brukere som scorer under 70% bør få enklere oppfølgingsspørsmål</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/quiz" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Advanced Analytics
              </h1>
              <p className="text-gray-600 mt-1">BI dashboard med prediktive analyser og AI-innsikter</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-1 mb-8 bg-white/50 rounded-2xl p-2">
          <button
            onClick={() => setActiveView('overview')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeView === 'overview'
                ? 'bg-indigo-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/70'
            }`}
          >
            <ChartBarIcon className="w-5 h-5" />
            <span>Oversikt</span>
          </button>
          <button
            onClick={() => setActiveView('predictive')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeView === 'predictive'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/70'
            }`}
          >
            <CpuChipIcon className="w-5 h-5" />
            <span>AI Innsikter</span>
          </button>
          <button
            onClick={() => setActiveView('reports')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeView === 'reports'
                ? 'bg-green-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/70'
            }`}
          >
            <DocumentChartBarIcon className="w-5 h-5" />
            <span>Rapporter</span>
          </button>
        </div>

        {/* Content */}
        {activeView === 'overview' && renderOverview()}
        {activeView === 'predictive' && renderPredictive()}
        {activeView === 'reports' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20 text-center">
            <DocumentChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Avanserte Rapporter</h2>
            <p className="text-gray-600 mb-6">Detaljerte rapporter og eksportfunksjoner kommer snart...</p>
            <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors">
              Generer rapport
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 