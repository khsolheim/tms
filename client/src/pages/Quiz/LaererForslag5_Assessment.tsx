import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
  ArrowLeftIcon,
  EyeIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface Assessment {
  id: string;
  tittel: string;
  type: 'Adaptive' | 'Timed' | 'Competency' | 'Diagnostic';
  status: 'Draft' | 'Active' | 'Completed' | 'Scheduled';
  elever: number;
  fullfort: number;
  gjennomsnitt: number;
  startDato: string;
  sluttDato: string;
  varighet: string;
  kategorier: string[];
}

interface StudentResult {
  navn: string;
  score: number;
  tid: string;
  status: 'Completed' | 'In Progress' | 'Not Started';
  styrker: string[];
  svakheter: string[];
  anbefaling: string;
}

export default function LaererForslag5_Assessment() {
  const [activeView, setActiveView] = useState('overview');
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  const [assessments] = useState<Assessment[]>([
    {
      id: '1',
      tittel: 'Midtveiseksamen Trafikk',
      type: 'Adaptive',
      status: 'Active',
      elever: 28,
      fullfort: 23,
      gjennomsnitt: 82,
      startDato: '2024-01-15',
      sluttDato: '2024-01-22',
      varighet: '45 min',
      kategorier: ['Trafikkregler', 'Sikkerhet', 'Kjøreteknikk']
    },
    {
      id: '2',
      tittel: 'Diagnostisk Test - Motorvei',
      type: 'Diagnostic',
      status: 'Completed',
      elever: 32,
      fullfort: 32,
      gjennomsnitt: 76,
      startDato: '2024-01-08',
      sluttDato: '2024-01-10',
      varighet: '30 min',
      kategorier: ['Motorveikjøring', 'Sikkerhet']
    },
    {
      id: '3',
      tittel: 'Kompetansetest Førstehjelp',
      type: 'Competency',
      status: 'Scheduled',
      elever: 25,
      fullfort: 0,
      gjennomsnitt: 0,
      startDato: '2024-01-25',
      sluttDato: '2024-01-27',
      varighet: '60 min',
      kategorier: ['Førstehjelp', 'Sikkerhet']
    }
  ]);

  const [studentResults] = useState<StudentResult[]>([
    {
      navn: 'Emma Andersen',
      score: 94,
      tid: '38 min',
      status: 'Completed',
      styrker: ['Trafikkregler', 'Sikkerhet'],
      svakheter: ['Kjøreteknikk'],
      anbefaling: 'Fokuser på praktisk kjøretrening'
    },
    {
      navn: 'Noah Hansen',
      score: 78,
      tid: '42 min',
      status: 'Completed',
      styrker: ['Kjøreteknikk'],
      svakheter: ['Trafikkregler', 'Sikkerhet'],
      anbefaling: 'Gjennomgå regelverket grundig'
    },
    {
      navn: 'Olivia Berg',
      score: 0,
      tid: '-',
      status: 'In Progress',
      styrker: [],
      svakheter: [],
      anbefaling: 'Ikke tilgjengelig ennå'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 border-green-200';
      case 'Completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Scheduled': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Adaptive': return 'bg-purple-100 text-purple-700';
      case 'Timed': return 'bg-orange-100 text-orange-700';
      case 'Competency': return 'bg-indigo-100 text-indigo-700';
      case 'Diagnostic': return 'bg-teal-100 text-teal-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-600">Aktive tester</div>
            </div>
            <ClipboardDocumentCheckIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">89%</div>
              <div className="text-sm text-gray-600">Fullføringsrate</div>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">78</div>
              <div className="text-sm text-gray-600">Gjennomsnittsscore</div>
            </div>
            <ChartBarIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">156</div>
              <div className="text-sm text-gray-600">Totale elever</div>
            </div>
            <UserGroupIcon className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Assessments List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Mine Vurderinger</h2>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Ny vurdering
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{assessment.tittel}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(assessment.type)}`}>
                          {assessment.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(assessment.status)}`}>
                          {assessment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedAssessment(assessment);
                        setActiveView('results');
                      }}
                      className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center space-x-1"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span>Se resultater</span>
                    </button>
                    <button className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm">
                      Rediger
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Elever</div>
                    <div className="font-semibold text-gray-800">{assessment.elever}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Fullført</div>
                    <div className="font-semibold text-gray-800">{assessment.fullfort}/{assessment.elever}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Gjennomsnitt</div>
                    <div className="font-semibold text-gray-800">{assessment.gjennomsnitt}%</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Varighet</div>
                    <div className="font-semibold text-gray-800">{assessment.varighet}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-gray-600 text-sm mb-2">Kategorier:</div>
                  <div className="flex flex-wrap gap-2">
                    {assessment.kategorier.map((kategori, index) => (
                      <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                        {kategori}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <div>Start: {assessment.startDato}</div>
                  <div>Slutt: {assessment.sluttDato}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!selectedAssessment) return null;

    return (
      <div className="space-y-6">
        {/* Assessment Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{selectedAssessment.tittel}</h2>
              <p className="text-gray-600">Detaljerte resultater og analyser</p>
            </div>
            <button 
              onClick={() => setActiveView('overview')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Tilbake
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{selectedAssessment.fullfort}/{selectedAssessment.elever}</div>
              <div className="text-sm text-blue-700">Fullført</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{selectedAssessment.gjennomsnitt}%</div>
              <div className="text-sm text-green-700">Gjennomsnitt</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">42 min</div>
              <div className="text-sm text-purple-700">Gj.snitt tid</div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">3</div>
              <div className="text-sm text-orange-700">Trenger oppfølging</div>
            </div>
          </div>
        </div>

        {/* Student Results */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">Elevresultater</h3>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Elev</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Score</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tid</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Styrker</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Anbefaling</th>
                  </tr>
                </thead>
                <tbody>
                  {studentResults.map((result, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {result.navn.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800">{result.navn}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${
                            result.score >= 80 ? 'text-green-600' :
                            result.score >= 60 ? 'text-yellow-600' :
                            result.score > 0 ? 'text-red-600' : 'text-gray-400'
                          }`}>
                            {result.score > 0 ? `${result.score}%` : '-'}
                          </span>
                          {result.score > 0 && (
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  result.score >= 80 ? 'bg-green-500' :
                                  result.score >= 60 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${result.score}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{result.tid}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          result.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          result.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {result.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {result.styrker.map((styrke, i) => (
                            <span key={i} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                              {styrke}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 max-w-xs">
                        {result.anbefaling}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Kategoriprestasjon</h3>
            <div className="space-y-4">
              {selectedAssessment.kategorier.map((kategori, index) => {
                const scores = [85, 72, 91]; // Mock data
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{kategori}</span>
                      <span className="text-sm font-bold text-gray-800">{scores[index]}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          scores[index] >= 80 ? 'bg-green-500' :
                          scores[index] >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${scores[index]}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <h3 className="text-lg font-bold text-gray-800 mb-4">AI Anbefalinger</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <AcademicCapIcon className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <div className="font-semibold text-blue-800 text-sm">Fokusområde</div>
                    <div className="text-blue-700 text-sm">Øk fokus på kjøreteknikk - 40% av elevene scorer lavt</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <div className="font-semibold text-green-800 text-sm">Styrke</div>
                    <div className="text-green-700 text-sm">Trafikkregler mestres godt av 85% av elevene</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-1" />
                  <div>
                    <div className="font-semibold text-yellow-800 text-sm">Oppfølging</div>
                    <div className="text-yellow-700 text-sm">3 elever trenger ekstra støtte og veiledning</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
                Advanced Assessment
              </h1>
              <p className="text-gray-600 mt-1">Adaptiv testing og detaljert elevvurdering</p>
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
            <ClipboardDocumentCheckIcon className="w-5 h-5" />
            <span>Oversikt</span>
          </button>
          <button
            onClick={() => setActiveView('create')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeView === 'create'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/70'
            }`}
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            <span>Opprett Test</span>
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeView === 'analytics'
                ? 'bg-green-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/70'
            }`}
          >
            <ChartBarIcon className="w-5 h-5" />
            <span>Analyser</span>
          </button>
        </div>

        {/* Content */}
        {activeView === 'overview' && renderOverview()}
        {activeView === 'results' && renderResults()}
        {activeView === 'create' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20 text-center">
            <AdjustmentsHorizontalIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Opprett Ny Test</h2>
            <p className="text-gray-600 mb-6">Avansert testbygger kommer snart...</p>
            <button className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors">
              Kom i gang
            </button>
          </div>
        )}
        {activeView === 'analytics' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20 text-center">
            <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Avanserte Analyser</h2>
            <p className="text-gray-600 mb-6">Detaljerte rapporter og prediktive analyser kommer snart...</p>
            <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors">
              Se analyser
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 