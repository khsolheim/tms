import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  UserGroupIcon,
  TrophyIcon,
  ArrowLeftIcon,
  DocumentChartBarIcon,
  CalendarIcon,
  FunnelIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  periode: string;
  verdi: number;
  endring: number;
}

interface StudentPerformance {
  navn: string;
  klasse: string;
  gjennomsnitt: number;
  forbedring: number;
  risikoNiva: 'Lav' | 'Medium' | 'Høy';
  aktivitetsNiva: number;
}

export default function LaererForslag3_Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('Siste 30 dager');
  const [selectedMetric, setSelectedMetric] = useState('Gjennomsnittsscore');
  const [selectedClass, setSelectedClass] = useState('Alle klasser');

  const [performanceData] = useState<AnalyticsData[]>([
    { periode: 'Uke 1', verdi: 72, endring: 0 },
    { periode: 'Uke 2', verdi: 75, endring: 4.2 },
    { periode: 'Uke 3', verdi: 78, endring: 4.0 },
    { periode: 'Uke 4', verdi: 82, endring: 5.1 },
    { periode: 'Uke 5', verdi: 79, endring: -3.7 },
    { periode: 'Uke 6', verdi: 85, endring: 7.6 }
  ]);

  const [studentPerformance] = useState<StudentPerformance[]>([
    { navn: 'Emma Andersen', klasse: '10A', gjennomsnitt: 92, forbedring: 12, risikoNiva: 'Lav', aktivitetsNiva: 95 },
    { navn: 'Noah Hansen', klasse: '10A', gjennomsnitt: 78, forbedring: 8, risikoNiva: 'Lav', aktivitetsNiva: 82 },
    { navn: 'Olivia Berg', klasse: '10B', gjennomsnitt: 45, forbedring: -5, risikoNiva: 'Høy', aktivitetsNiva: 23 },
    { navn: 'William Olsen', klasse: '10A', gjennomsnitt: 88, forbedring: 15, risikoNiva: 'Lav', aktivitetsNiva: 88 },
    { navn: 'Ella Johansen', klasse: '10B', gjennomsnitt: 67, forbedring: 3, risikoNiva: 'Medium', aktivitetsNiva: 45 }
  ]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Lav': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Høy': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const generateInsights = () => [
    {
      type: 'positive',
      tittel: 'Forbedret ytelse',
      beskrivelse: '85% av elevene har forbedret sine score denne måneden',
      ikon: ArrowTrendingUpIcon,
      verdi: '+12%'
    },
    {
      type: 'warning',
      tittel: 'Elever som trenger oppfølging',
      beskrivelse: '8 elever har ikke vært aktive på over en uke',
      ikon: ClockIcon,
      verdi: '8'
    },
    {
      type: 'info',
      tittel: 'Mest utfordrende emne',
      beskrivelse: 'Motorveikjøring har lavest gjennomsnittsscore',
      ikon: DocumentChartBarIcon,
      verdi: '62%'
    },
    {
      type: 'positive',
      tittel: 'Høyest engasjement',
      beskrivelse: 'Klasse 10A viser best aktivitetsnivå',
      ikon: TrophyIcon,
      verdi: '10A'
    }
  ];

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
              <p className="text-gray-600 mt-1">Detaljerte rapporter og prediktive insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option>Siste 7 dager</option>
              <option>Siste 30 dager</option>
              <option>Siste 3 måneder</option>
              <option>Dette året</option>
            </select>
            <button className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors flex items-center space-x-2">
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>Eksporter</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-indigo-600">82%</div>
                <div className="text-sm text-gray-600">Gjennomsnittsscore</div>
              </div>
              <ChartBarIcon className="w-8 h-8 text-indigo-500" />
            </div>
            <div className="mt-4 flex items-center">
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+5.2% fra forrige periode</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">94%</div>
                <div className="text-sm text-gray-600">Fullføringsrate</div>
              </div>
              <TrophyIcon className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-4 flex items-center">
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+2.1% forbedring</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-pink-600">12.5</div>
                <div className="text-sm text-gray-600">Gj.snitt tid (min)</div>
              </div>
              <ClockIcon className="w-8 h-8 text-pink-500" />
            </div>
            <div className="mt-4 flex items-center">
              <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-sm text-red-600">-8% fra forrige periode</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">127</div>
                <div className="text-sm text-gray-600">Aktive elever</div>
              </div>
              <UserGroupIcon className="w-8 h-8 text-orange-500" />
            </div>
            <div className="mt-4 flex items-center">
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12 nye denne uken</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Chart */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <ChartBarIcon className="w-6 h-6 text-indigo-500 mr-2" />
                  Ytelsesutvikling
                </h2>
                <select 
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option>Gjennomsnittsscore</option>
                  <option>Fullføringsrate</option>
                  <option>Aktivitetsnivå</option>
                  <option>Tidsbruk</option>
                </select>
              </div>
              
              {/* Simplified Chart */}
              <div className="h-64 bg-gradient-to-t from-indigo-50 to-transparent rounded-lg p-4">
                <div className="h-full flex items-end space-x-2">
                  {performanceData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all duration-500"
                        style={{ height: `${(data.verdi / 100) * 100}%` }}
                      />
                      <div className="text-xs text-gray-600 mt-2">{data.periode}</div>
                      <div className="text-xs font-semibold text-gray-800">{data.verdi}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Student Performance Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <UserGroupIcon className="w-6 h-6 text-purple-500 mr-2" />
                  Elevanalyse
                </h2>
                <div className="flex items-center space-x-2">
                  <select 
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option>Alle klasser</option>
                    <option>10A</option>
                    <option>10B</option>
                    <option>10C</option>
                  </select>
                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                    <FunnelIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Elev</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Klasse</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Gjennomsnitt</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Forbedring</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Aktivitet</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Risiko</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentPerformance.map((student, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {student.navn.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-800">{student.navn}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{student.klasse}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-800">{student.gjennomsnitt}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                                style={{ width: `${student.gjennomsnitt}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className={`flex items-center space-x-1 ${
                            student.forbedring >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {student.forbedring >= 0 ? (
                              <ArrowTrendingUpIcon className="w-4 h-4" />
                            ) : (
                              <ArrowTrendingDownIcon className="w-4 h-4" />
                            )}
                            <span className="font-medium">{Math.abs(student.forbedring)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-12 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  student.aktivitetsNiva >= 80 ? 'bg-green-500' :
                                  student.aktivitetsNiva >= 50 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${student.aktivitetsNiva}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{student.aktivitetsNiva}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(student.risikoNiva)}`}>
                            {student.risikoNiva}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <EyeIcon className="w-6 h-6 text-indigo-500 mr-2" />
                AI Insights
              </h2>
              
              <div className="space-y-4">
                {generateInsights().map((insight, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        insight.type === 'positive' ? 'bg-green-100 text-green-600' :
                        insight.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <insight.ikon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 text-sm">{insight.tittel}</div>
                        <div className="text-xs text-gray-600 mt-1">{insight.beskrivelse}</div>
                        <div className="text-lg font-bold text-indigo-600 mt-2">{insight.verdi}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Predictive Analytics */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl shadow-lg p-6 border border-purple-200">
              <h2 className="text-xl font-bold text-purple-800 mb-4">Prediktive Analyser</h2>
              
              <div className="space-y-4">
                <div className="bg-white/50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-purple-800">Neste ukes prognose</div>
                  <div className="text-xs text-purple-600 mt-1">Basert på historiske data</div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm">
                      <span>Gjennomsnittsscore</span>
                      <span className="font-bold">84% (+2%)</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span>Fullføringsrate</span>
                      <span className="font-bold">96% (+2%)</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span>Risiko elever</span>
                      <span className="font-bold">6 (-2)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-purple-800">Anbefalte tiltak</div>
                  <div className="text-xs text-purple-600 mt-1">AI-genererte forslag</div>
                  <div className="mt-3 space-y-2">
                    <div className="text-xs text-purple-700">• Gi Olivia B. ekstra støtte</div>
                    <div className="text-xs text-purple-700">• Øk vanskelighetsgrad for 10A</div>
                    <div className="text-xs text-purple-700">• Fokuser på motorveikjøring</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Eksporter Rapporter</h2>
              
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-3 rounded-lg hover:shadow-lg transition-all duration-300 text-sm">
                  Månedlig rapport (PDF)
                </button>
                <button className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white p-3 rounded-lg hover:shadow-lg transition-all duration-300 text-sm">
                  Elevdata (Excel)
                </button>
                <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-lg hover:shadow-lg transition-all duration-300 text-sm">
                  Ytelsesanalyse (PowerPoint)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 