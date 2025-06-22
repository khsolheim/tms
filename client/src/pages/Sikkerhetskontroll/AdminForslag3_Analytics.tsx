import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ChartBarIcon,
  ChartPieIcon,
  DocumentChartBarIcon,
  CalendarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  Cog6ToothIcon,
  BoltIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  periode: string;
  totalKontroller: number;
  beståttRate: number;
  gjennomsnittPoeng: number;
  gjennomsnittTid: number;
  aktiveBrukere: number;
  trendData: { dato: string; kontroller: number; bestått: number }[];
  kategorier: { navn: string; antall: number; beståttRate: number; gjennomsnittPoeng: number }[];
  prestasjonsTrend: { måned: string; score: number; forbedring: number }[];
  risikoanalyse: { kategori: string; risiko: 'lav' | 'medium' | 'høy'; antallFeil: number; beskrivelse: string }[];
  topPerformers: { navn: string; score: number; antallKontroller: number }[];
  problemområder: { område: string; feilRate: number; anbefalinger: string[] }[];
}

interface FilterState {
  periode: '7d' | '30d' | '90d' | '1y';
  kategori: string;
  brukergruppe: string;
  datoFra: string;
  datoTil: string;
}

const AdminForslag3Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    periode: '30d',
    kategori: 'alle',
    brukergruppe: 'alle',
    datoFra: '',
    datoTil: ''
  });
  const [activeTab, setActiveTab] = useState<'oversikt' | 'ytelse' | 'trender' | 'risiko' | 'rapporter'>('oversikt');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [filters]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAnalyticsData({
        periode: filters.periode,
        totalKontroller: 2847,
        beståttRate: 87.3,
        gjennomsnittPoeng: 78.5,
        gjennomsnittTid: 12.4,
        aktiveBrukere: 156,
        trendData: [
          { dato: '2024-01-01', kontroller: 45, bestått: 39 },
          { dato: '2024-01-02', kontroller: 52, bestått: 47 },
          { dato: '2024-01-03', kontroller: 38, bestått: 32 },
          { dato: '2024-01-04', kontroller: 61, bestått: 55 },
          { dato: '2024-01-05', kontroller: 47, bestått: 43 },
          { dato: '2024-01-06', kontroller: 53, bestått: 48 },
          { dato: '2024-01-07', kontroller: 49, bestått: 44 }
        ],
        kategorier: [
          { navn: 'Bil Sikkerhet', antall: 1247, beståttRate: 89.2, gjennomsnittPoeng: 82.1 },
          { navn: 'Utstyr', antall: 687, beståttRate: 84.7, gjennomsnittPoeng: 76.3 },
          { navn: 'Miljø', antall: 523, beståttRate: 91.1, gjennomsnittPoeng: 85.7 },
          { navn: 'Sikkerhet', antall: 390, beståttRate: 82.3, gjennomsnittPoeng: 71.8 }
        ],
        prestasjonsTrend: [
          { måned: 'Jan', score: 75.2, forbedring: 2.3 },
          { måned: 'Feb', score: 77.8, forbedring: 3.5 },
          { måned: 'Mar', score: 79.1, forbedring: 1.7 },
          { måned: 'Apr', score: 78.5, forbedring: -0.8 },
          { måned: 'Mai', score: 81.2, forbedring: 3.4 }
        ],
        risikoanalyse: [
          {
            kategori: 'Dekk og Hjul',
            risiko: 'høy',
            antallFeil: 87,
            beskrivelse: 'Høy feilrate på dekkmønster og lufttrykk kontroller'
          },
          {
            kategori: 'Belysning',
            risiko: 'medium',
            antallFeil: 43,
            beskrivelse: 'Moderate problemer med lyktekontroll'
          },
          {
            kategori: 'Bremser',
            risiko: 'lav',
            antallFeil: 12,
            beskrivelse: 'Få feil registrert på bremsesystem'
          }
        ],
        topPerformers: [
          { navn: 'Lars Hansen', score: 94.2, antallKontroller: 45 },
          { navn: 'Maria Olsen', score: 91.8, antallKontroller: 38 },
          { navn: 'Erik Lie', score: 89.5, antallKontroller: 52 },
          { navn: 'Anna Berg', score: 87.9, antallKontroller: 41 },
          { navn: 'Jon Kvist', score: 86.3, antallKontroller: 47 }
        ],
        problemområder: [
          {
            område: 'Teknisk Kunnskap',
            feilRate: 23.4,
            anbefalinger: [
              'Øk fokus på teknisk opplæring',
              'Implementer praktiske øvelser',
              'Tilby supplerende kursmateriell'
            ]
          },
          {
            område: 'Tidspress',
            feilRate: 18.7,
            anbefalinger: [
              'Juster tidsrammer for kontroller',
              'Forbedre arbeidsflyt',
              'Reduser unødvendige steg'
            ]
          }
        ]
      });
      setLoading(false);
    }, 1000);
  };

  const getRisikoColor = (risiko: string) => {
    switch (risiko) {
      case 'høy': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'lav': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderOversikt = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Totale Kontroller</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData?.totalKontroller.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ClipboardDocumentCheckIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+12.3% fra forrige periode</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bestått Rate</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData?.beståttRate}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+3.2% forbedring</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gjennomsnitt Poeng</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData?.gjennomsnittPoeng}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-sm text-red-600">-1.2% fra forrige periode</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktive Brukere</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData?.aktiveBrukere}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+8 nye brukere</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontroller per Dag</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Interaktiv graf kommer her</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategori Fordeling</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ChartPieIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Pie chart kommer her</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategori Ytelse</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Antall
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bestått Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gjennomsnitt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData?.kategorier.map((kat, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {kat.navn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {kat.antall.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${kat.beståttRate}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-900">{kat.beståttRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {kat.gjennomsnittPoeng}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRisiko = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risikoanalyse</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {analyticsData?.risikoanalyse.map((risiko, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{risiko.kategori}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRisikoColor(risiko.risiko)}`}>
                  {risiko.risiko} risiko
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Antall feil:</span>
                  <span className="font-medium">{risiko.antallFeil}</span>
                </div>
                <p className="text-sm text-gray-600">{risiko.beskrivelse}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Problemområder & Anbefalinger</h3>
        <div className="space-y-4">
          {analyticsData?.problemområder.map((problem, index) => (
            <div key={index} className="border-l-4 border-orange-400 bg-orange-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{problem.område}</h4>
                <span className="text-sm font-medium text-orange-600">
                  {problem.feilRate}% feilrate
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-700 font-medium">Anbefalinger:</p>
                <ul className="list-disc list-inside space-y-1">
                  {problem.anbefalinger.map((anbefaling, i) => (
                    <li key={i} className="text-sm text-gray-600">{anbefaling}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderYtelse = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
        <div className="space-y-3">
          {analyticsData?.topPerformers.map((performer, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                }`}>
                  {index + 1}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{performer.navn}</p>
                  <p className="text-sm text-gray-600">{performer.antallKontroller} kontroller</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-gray-900">{performer.score}%</p>
                <p className="text-sm text-gray-600">gjennomsnitt</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prestasjonstrend</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <ArrowTrendingUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Trendgraf kommer her</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laster analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/sikkerhetskontroll"
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Tilbake til forslag
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
                <p className="text-gray-600 mt-1">Detaljerte rapporter og business intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-4 h-4 text-gray-400" />
                <select
                  value={filters.periode}
                  onChange={(e) => setFilters({...filters, periode: e.target.value as any})}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="7d">Siste 7 dager</option>
                  <option value="30d">Siste 30 dager</option>
                  <option value="90d">Siste 90 dager</option>
                  <option value="1y">Siste år</option>
                </select>
              </div>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Eksporter
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'oversikt', label: 'Oversikt', icon: ChartBarIcon },
              { key: 'ytelse', label: 'Ytelse', icon: ArrowTrendingUpIcon },
              { key: 'trender', label: 'Trender', icon: DocumentChartBarIcon },
              { key: 'risiko', label: 'Risiko', icon: ExclamationTriangleIcon },
              { key: 'rapporter', label: 'Rapporter', icon: DocumentChartBarIcon }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className={`mr-2 w-5 h-5 ${
                  activeTab === key ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'oversikt' && renderOversikt()}
          {activeTab === 'ytelse' && renderYtelse()}
          {activeTab === 'risiko' && renderRisiko()}
          {activeTab === 'trender' && (
            <div className="text-center py-12">
              <DocumentChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Trendanalyse</h3>
              <p className="text-gray-600">Detaljerte trender og prognoser</p>
            </div>
          )}
          {activeTab === 'rapporter' && (
            <div className="text-center py-12">
              <DocumentChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Rapportgenerator</h3>
              <p className="text-gray-600">Generer tilpassede rapporter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminForslag3Analytics; 