import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ChartPieIcon,
  UsersIcon,
  AcademicCapIcon,
  TrophyIcon,
  ClockIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  ChartBarIcon as ChartBarSolidIcon,
  ChartPieIcon as ChartPieSolidIcon,
  TrophyIcon as TrophySolidIcon
} from '@heroicons/react/24/solid';
import { quizService, type QuizStatistikk, type KategoriStatistikk, type ElevYtelse, type QuizYtelse } from '../../services/quiz.service';

export default function QuizStatistikk() {
  const [aktivTab, setAktivTab] = useState('oversikt');
  const [tidsfilter, setTidsfilter] = useState('7d');
  const [statistikk, setStatistikk] = useState<QuizStatistikk | null>(null);
  const [kategorier, setKategorier] = useState<KategoriStatistikk[]>([]);
  const [elevYtelse, setElevYtelse] = useState<ElevYtelse[]>([]);
  const [quizYtelse, setQuizYtelse] = useState<QuizYtelse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hent data når komponenten laster eller tidsfilter endres
  useEffect(() => {
    const hentData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For utvikling bruker vi mock data til API er implementert
        const mockData = await quizService.hentMockData();
        
        setStatistikk(mockData.statistikk);
        setKategorier(mockData.kategorier);
        setElevYtelse(mockData.elevYtelse);
        setQuizYtelse(mockData.quizYtelse);
        
        // TODO: Erstatt med ekte API-kall når backend er klar
        /*
        const [statistikkResponse, kategoriResponse, elevResponse, quizResponse] = await Promise.all([
          quizService.hentQuizStatistikk(tidsfilter),
          quizService.hentKategoriStatistikk(tidsfilter),
          quizService.hentElevYtelse(tidsfilter),
          quizService.hentQuizYtelse(tidsfilter)
        ]);
        
        setStatistikk(statistikkResponse.data);
        setKategorier(kategoriResponse.data);
        setElevYtelse(elevResponse.data);
        setQuizYtelse(quizResponse.data);
        */
      } catch (error) {
        console.error('Feil ved henting av quiz-statistikk:', error);
        setError('Kunne ikke laste quiz-statistikk. Prøv igjen senere.');
      } finally {
        setLoading(false);
      }
    };

    hentData();
  }, [tidsfilter]);

  const handleEksporterRapport = async () => {
    try {
      const blob = await quizService.eksporterRapport('xlsx', tidsfilter);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `quiz-rapport-${tidsfilter}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Feil ved eksport av rapport:', error);
      // TODO: Vis feilmelding til bruker
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('no-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const formatTid = (minutter: number) => {
    if (minutter < 60) {
      return `${minutter.toFixed(1)} min`;
    }
    const timer = Math.floor(minutter / 60);
    const restMinutter = minutter % 60;
    return `${timer}t ${restMinutter.toFixed(0)}m`;
  };

  const getForbedringsfarger = (forbedring: number) => {
    if (forbedring > 0) {
      return 'text-green-600';
    } else if (forbedring < 0) {
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  const getForbedringsikon = (forbedring: number) => {
    if (forbedring > 0) {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />;
    } else if (forbedring < 0) {
      return <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  return (
    <div className="cards-spacing-vertical">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center cards-spacing-grid">
            <div className="px-2 py-1 bg-blue-100 rounded-xl">
              <ChartBarSolidIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quiz Statistikk</h1>
              <p className="text-gray-600 mt-1">
                Detaljert analyse av quiz-ytelse og elevresultater
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={tidsfilter}
              onChange={(e) => setTidsfilter(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
              disabled={loading}
            >
              <option value="24h">Siste 24 timer</option>
              <option value="7d">Siste 7 dager</option>
              <option value="30d">Siste 30 dager</option>
              <option value="90d">Siste 3 måneder</option>
            </select>
            <button 
              onClick={handleEksporterRapport} 
              className="inline-flex items-center gap-2 px-2 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Eksporter rapport
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Laster quiz-statistikk...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && statistikk && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 cards-spacing-grid">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
              <div className="flex items-center">
                <div className="px-2 py-1 bg-blue-100 rounded-lg">
                  <AcademicCapIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Totale Quiz</p>
                  <p className="text-2xl font-bold text-gray-900">{statistikk?.totaleQuizer || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
              <div className="flex items-center">
                <div className="px-2 py-1 bg-green-100 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Totale Deltagere</p>
                  <p className="text-2xl font-bold text-gray-900">{statistikk?.totaleDeltagere || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
              <div className="flex items-center">
                <div className="px-2 py-1 bg-purple-100 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Gj.snitt Score</p>
                  <p className="text-2xl font-bold text-gray-900">{statistikk?.gjennomsnittScore.toFixed(1) || 0}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
              <div className="flex items-center">
                <div className="px-2 py-1 bg-orange-100 rounded-lg">
                  <TrophySolidIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bestått %</p>
                  <p className="text-2xl font-bold text-gray-900">{statistikk?.beståttProsent.toFixed(1) || 0}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-2" aria-label="Tabs">
                {[
                  { id: 'oversikt', navn: 'Oversikt', ikon: ChartBarIcon, activeIcon: ChartBarSolidIcon },
                  { id: 'kategorier', navn: 'Kategorier', ikon: ChartPieIcon, activeIcon: ChartPieSolidIcon },
                  { id: 'elever', navn: 'Elevytelse', ikon: UsersIcon },
                  { id: 'quiz', navn: 'Quiz Ytelse', ikon: AcademicCapIcon }
                ].map((tab) => {
                  const Icon = aktivTab === tab.id && tab.activeIcon ? tab.activeIcon : tab.ikon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setAktivTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                        aktivTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.navn}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="px-2 py-1">
              {aktivTab === 'oversikt' && (
                <div className="cards-spacing-vertical">
                  {/* Aktivitetstrend Chart */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitetstrend</h3>
                    <div className="bg-gray-50 rounded-lg px-2 py-1">
                      <div className="grid grid-cols-4 cards-spacing-grid">
                        {statistikk?.aktivitetstrender.map((dag: any, index: number) => (
                          <div key={index} className="text-center">
                            <div className="text-sm text-gray-500 mb-2">{formatDate(dag.dato)}</div>
                            <div className="space-y-6">
                              <div className="text-lg font-semibold text-blue-600">{dag.antallQuizer}</div>
                              <div className="text-xs text-gray-500">Quiz</div>
                              <div className="text-sm font-medium text-gray-900">{dag.antallDeltagere}</div>
                              <div className="text-xs text-gray-500">Deltagere</div>
                              <div className="text-sm text-green-600">{dag.gjennomsnittScore.toFixed(1)}%</div>
                              <div className="text-xs text-gray-500">Score</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sammendrag */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ytelsessammendrag</h3>
                      <div className="cards-spacing-vertical">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Høyeste score (elev):</span>
                          <span className="font-semibold text-green-600">96.4% (Erik Sunde)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Mest populære kategori:</span>
                          <span className="font-semibold">Trafikkregler</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Gjennomsnittlig tid per quiz:</span>
                          <span className="font-semibold">12.2 minutter</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Mest aktive bedrift:</span>
                          <span className="font-semibold">Transport AS</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Dagens høydepunkter</h3>
                      <div className="space-y-8">
                        <div className="bg-green-50 border border-green-200 rounded-lg px-2 py-1">
                          <div className="flex items-center gap-2 text-green-800">
                            <TrophyIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">Ny rekord!</span>
                          </div>
                          <p className="text-sm text-green-700 mt-1">
                            Erik Sunde oppnådde 100% på "Trafikkregler quiz #3"
                          </p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
                          <div className="flex items-center gap-2 text-blue-800">
                            <ChartBarIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">Forbedring</span>
                          </div>
                          <p className="text-sm text-blue-700 mt-1">
                            Gjennomsnittlig score økte med 3.2% denne uken
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {aktivTab === 'kategorier' && (
                <div className="cards-spacing-vertical">
                  <h3 className="text-lg font-semibold text-gray-900">Ytelse per kategori</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kategori
                          </th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Antall Quiz
                          </th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gj.snitt Score
                          </th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bestått %
                          </th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Popularitet
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {kategorier.map((kategori, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-2 py-1 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {kategori.kategori}
                              </div>
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                              {kategori.antallQuizer}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                              <span className={`font-medium ${
                                kategori.gjennomsnittScore >= 80 ? 'text-green-600' : 
                                kategori.gjennomsnittScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {kategori.gjennomsnittScore.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                              <span className={`font-medium ${
                                kategori.beståttProsent >= 85 ? 'text-green-600' : 
                                kategori.beståttProsent >= 75 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {kategori.beståttProsent.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${kategori.popularitet}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600">{kategori.popularitet}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {aktivTab === 'elever' && (
                <div className="cards-spacing-vertical">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Elevytelse</h3>
                    <div className="flex items-center gap-2">
                      <FunnelIcon className="w-4 h-4 text-gray-400" />
                      <select className="px-2 py-1 border border-gray-300 rounded text-sm">
                        <option>Alle bedrifter</option>
                        <option>Transport AS</option>
                        <option>Frakt Norge</option>
                        <option>Grønn Logistikk</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Elev
                          </th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bedrift
                          </th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quiz Tatt
                          </th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gj.snitt Score
                          </th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bestått
                          </th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Forbedring
                          </th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Siste Aktivitet
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {elevYtelse.map((elev) => (
                          <tr key={elev.elevId} className="hover:bg-gray-50">
                            <td className="px-2 py-1 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {elev.elevNavn}
                              </div>
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                              {elev.bedrift}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                              {elev.totaleQuizer}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap">
                              <span className={`text-sm font-medium ${
                                elev.gjennomsnittScore >= 85 ? 'text-green-600' : 
                                elev.gjennomsnittScore >= 75 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {elev.gjennomsnittScore.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                              {elev.beståttQuizer}/{elev.totaleQuizer}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap">
                              <div className={`flex items-center gap-1 text-sm ${getForbedringsfarger(elev.forbedring)}`}>
                                {getForbedringsikon(elev.forbedring)}
                                <span>{elev.forbedring > 0 ? '+' : ''}{elev.forbedring.toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(elev.sisteAktivitet)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {aktivTab === 'quiz' && (
                <div className="cards-spacing-vertical">
                  <h3 className="text-lg font-semibold text-gray-900">Quiz Ytelse</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quiz
                          </th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kategori
                          </th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Forsøk
                          </th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gj.snitt Score
                          </th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bestått %
                          </th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gj.snitt Tid
                          </th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sist Oppdatert
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {quizYtelse.map((quiz) => (
                          <tr key={quiz.quizId} className="hover:bg-gray-50">
                            <td className="px-2 py-1 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {quiz.quizTittel}
                              </div>
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {quiz.kategori}
                              </span>
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                              {quiz.antallForsøk}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap">
                              <span className={`text-sm font-medium ${
                                quiz.gjennomsnittScore >= 80 ? 'text-green-600' : 
                                quiz.gjennomsnittScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {quiz.gjennomsnittScore.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap">
                              <span className={`text-sm font-medium ${
                                quiz.beståttProsent >= 85 ? 'text-green-600' : 
                                quiz.beståttProsent >= 75 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {quiz.beståttProsent.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                              {formatTid(quiz.gjennomsnittTid)}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(quiz.sisteOppdatering)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 