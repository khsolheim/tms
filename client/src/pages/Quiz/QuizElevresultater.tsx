import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon, 
  ArrowDownTrayIcon,
  FunnelIcon,
  ChartBarIcon,
  ClockIcon,
  TrophyIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import quizService, { ElevResultat, ElevResultatStatistikk, ElevResultatFilter } from '../../services/quiz.service';

interface FilterState {
  søk: string;
  bedrift: string;
  klasse: string;
  kategori: string;
  status: 'alle' | 'bestått' | 'strøket';
  tidsperiode: '7d' | '30d' | '90d' | 'custom';
  fradato: string;
  tildato: string;
}

export default function QuizElevresultater() {
  const [elevResultater, setElevResultater] = useState<ElevResultat[]>([]);
  const [statistikk, setStatistikk] = useState<ElevResultatStatistikk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterState>({
    søk: '',
    bedrift: '',
    klasse: '',
    kategori: '',
    status: 'alle',
    tidsperiode: '30d',
    fradato: '',
    tildato: ''
  });
  const [visDetaljer, setVisDetaljer] = useState<string | null>(null);
  const [sortering, setSortering] = useState<{ felt: string; retning: 'asc' | 'desc' }>({
    felt: 'dato',
    retning: 'desc'
  });

  useEffect(() => {
    hentElevResultater();
  }, [filter]);

  const hentElevResultater = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filterData: ElevResultatFilter = {
        søk: filter.søk || undefined,
        bedrift: filter.bedrift || undefined,
        klasse: filter.klasse || undefined,
        kategori: filter.kategori || undefined,
        status: filter.status !== 'alle' ? filter.status : undefined,
        tidsperiode: filter.tidsperiode,
        fradato: filter.fradato || undefined,
        tildato: filter.tildato || undefined
      };
      
      const [resultater, stats] = await Promise.all([
        quizService.hentElevResultater(filterData),
        quizService.hentElevResultatStatistikk(filterData)
      ]);
      
      setElevResultater(resultater);
      setStatistikk(stats);
    } catch (error) {
      console.error('Feil ved henting av elevresultater:', error);
      setError('Kunne ikke laste elevresultater. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (bestått: boolean) => {
    return bestått ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (bestått: boolean) => {
    return bestått ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />;
  };

  const getScoreColor = (prosent: number) => {
    if (prosent >= 90) return 'text-green-600';
    if (prosent >= 80) return 'text-blue-600';
    if (prosent >= 70) return 'text-yellow-600';
    if (prosent >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatTid = (sekunder: number) => {
    const minutter = Math.floor(sekunder / 60);
    const sek = sekunder % 60;
    return `${minutter}:${sek.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('no-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const getPercentilColor = (percentil: number) => {
    if (percentil >= 90) return 'text-green-600';
    if (percentil >= 75) return 'text-blue-600';
    if (percentil >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (elevScore: number, gjennomsnitt: number) => {
    if (elevScore > gjennomsnitt) return '↗️';
    if (elevScore < gjennomsnitt) return '↘️';
    return '➡️';
  };

  const sorterResultater = (resultater: ElevResultat[]) => {
    return [...resultater].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortering.felt) {
        case 'dato':
          aValue = new Date(a.forsøk.dato);
          bValue = new Date(b.forsøk.dato);
          break;
        case 'elev':
          aValue = a.elev.navn;
          bValue = b.elev.navn;
          break;
        case 'quiz':
          aValue = a.quiz.tittel;
          bValue = b.quiz.tittel;
          break;
        case 'score':
          aValue = a.forsøk.prosent;
          bValue = b.forsøk.prosent;
          break;
        case 'tid':
          aValue = a.forsøk.varighet;
          bValue = b.forsøk.varighet;
          break;
        default:
          return 0;
      }
      
      if (sortering.retning === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const filtrerteResultater = sorterResultater(elevResultater.filter(resultat => {
    if (filter.søk && !resultat.elev.navn.toLowerCase().includes(filter.søk.toLowerCase()) &&
        !resultat.quiz.tittel.toLowerCase().includes(filter.søk.toLowerCase())) {
      return false;
    }
    if (filter.bedrift && resultat.elev.bedrift !== filter.bedrift) return false;
    if (filter.klasse && resultat.elev.klasse !== filter.klasse) return false;
    if (filter.kategori && resultat.quiz.kategori !== filter.kategori) return false;
    if (filter.status !== 'alle') {
      if (filter.status === 'bestått' && !resultat.forsøk.bestått) return false;
      if (filter.status === 'strøket' && resultat.forsøk.bestått) return false;
    }
    return true;
  }));

  const eksporterResultater = async () => {
    try {
      const blob = await quizService.eksporterRapport('xlsx', filter.tidsperiode);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quiz-elevresultater-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Feil ved eksport:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Laster elevresultater...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">{error}</div>
      </div>
    );
  }

  return (
    <div className="cards-spacing-vertical">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quiz Elevresultater</h1>
              <p className="text-sm text-gray-600 mt-1">
                Detaljert oversikt over alle elevresultater på quizer
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={eksporterResultater}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Eksporter
              </button>
            </div>
          </div>
        </div>

        {/* Statistikk Cards */}
        {statistikk && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <UserGroupIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600">Totale resultater</p>
                    <p className="text-2xl font-bold text-blue-900">{statistikk.totaleResultater}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600">Bestått rate</p>
                    <p className="text-2xl font-bold text-green-900">{statistikk.beståttRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-600">Gjennomsnitt</p>
                    <p className="text-2xl font-bold text-purple-900">{statistikk.gjennomsnittScore.toFixed(1)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center">
                  <TrophyIcon className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-600">Beste score</p>
                    <p className="text-2xl font-bold text-yellow-900">{statistikk.besteScore}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Søk</label>
              <input
                type="text"
                value={filter.søk}
                onChange={(e) => setFilter({ ...filter, søk: e.target.value })}
                placeholder="Søk etter elev eller quiz..."
                className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}
                className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="alle">Alle</option>
                <option value="bestått">Bestått</option>
                <option value="strøket">Strøket</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tidsperiode</label>
              <select
                value={filter.tidsperiode}
                onChange={(e) => setFilter({ ...filter, tidsperiode: e.target.value as any })}
                className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Siste 7 dager</option>
                <option value="30d">Siste 30 dager</option>
                <option value="90d">Siste 90 dager</option>
                <option value="custom">Egendefinert</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sortering</label>
              <select
                value={`${sortering.felt}-${sortering.retning}`}
                onChange={(e) => {
                  const [felt, retning] = e.target.value.split('-');
                  setSortering({ felt, retning: retning as 'asc' | 'desc' });
                }}
                className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="dato-desc">Nyeste først</option>
                <option value="dato-asc">Eldste først</option>
                <option value="score-desc">Høyeste score</option>
                <option value="score-asc">Laveste score</option>
                <option value="elev-asc">Elev A-Å</option>
                <option value="elev-desc">Elev Å-A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Elev
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quiz
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resultat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtrerteResultater.map((resultat) => (
                <React.Fragment key={resultat.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{resultat.elev.navn}</div>
                        <div className="text-sm text-gray-500">{resultat.elev.bedrift}</div>
                        <div className="text-xs text-gray-400">Klasse {resultat.elev.klasse}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{resultat.quiz.tittel}</div>
                        <div className="text-sm text-gray-500">{resultat.quiz.kategori}</div>
                        <div className="text-xs text-gray-400">{resultat.quiz.vanskelighetsgrad}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{formatDate(resultat.forsøk.dato)}</div>
                      <div className="text-xs text-gray-500">
                        {resultat.forsøk.starttid} - {resultat.forsøk.sluttid}
                      </div>
                      <div className="text-xs text-gray-400">
                        Forsøk #{resultat.forsøk.forsøkNummer}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-2xl font-bold ${getScoreColor(resultat.forsøk.prosent)}`}>
                          {resultat.forsøk.prosent}%
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({resultat.forsøk.antallRiktige}/{resultat.forsøk.antallSpørsmål})
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {getTrendIcon(resultat.forsøk.prosent, resultat.sammenligning.gjennomsnitt)} 
                        Snitt: {resultat.sammenligning.gjennomsnitt.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                        {formatTid(resultat.forsøk.varighet)}
                      </div>
                      <div className={`text-xs mt-1 ${getPercentilColor(resultat.sammenligning.percentil)}`}>
                        {resultat.sammenligning.percentil}. percentil
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(resultat.forsøk.bestått)}`}>
                        {getStatusIcon(resultat.forsøk.bestått)}
                        <span className="ml-1">{resultat.forsøk.bestått ? 'Bestått' : 'Strøket'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => setVisDetaljer(visDetaljer === resultat.id ? null : resultat.id)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {visDetaljer === resultat.id ? 'Skjul' : 'Vis'} detaljer
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Details Row */}
                  {visDetaljer === resultat.id && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Svake punkter</h4>
                            <div className="space-y-1">
                              {resultat.detaljer.svakePunkter.map((punkt, index) => (
                                <span key={index} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-2 mb-1">
                                  {punkt}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Sterke punkter</h4>
                            <div className="space-y-1">
                              {resultat.detaljer.sterkePunkter.map((punkt, index) => (
                                <span key={index} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2 mb-1">
                                  {punkt}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Sammenligning</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>Rangering: #{resultat.sammenligning.rangering} av {resultat.sammenligning.totalDeltagere}</div>
                              <div>Percentil: {resultat.sammenligning.percentil}</div>
                              <div>Gjennomsnitt: {resultat.sammenligning.gjennomsnitt.toFixed(1)}%</div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Quiz informasjon</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>Maks poeng: {resultat.quiz.maksPoeng}</div>
                              <div>Vanskelighetsgrad: {resultat.quiz.vanskelighetsgrad}</div>
                              <div>Kategori: {resultat.quiz.kategori}</div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          
          {filtrerteResultater.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500">Ingen resultater funnet med gjeldende filter</div>
            </div>
          )}
        </div>
      </div>

      {/* Weak Points Summary */}
      {statistikk && statistikk.svakestePunkter.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Svakeste punkter på tvers</h2>
            <p className="text-sm text-gray-600 mt-1">
              Områder som trenger mest oppmerksomhet basert på alle resultater
            </p>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-3">
              {statistikk.svakestePunkter.map((punkt, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{punkt.område}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${punkt.feilprosent}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-red-600 font-medium">{punkt.feilprosent.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 