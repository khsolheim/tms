import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpenIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  CalendarDaysIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  FunnelIcon,
  AcademicCapIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import {
  BookOpenIcon as BookSolidIcon,
  TrophyIcon as TrophySolidIcon
} from '@heroicons/react/24/solid';
import { prøverService, Prøve as ServicePrøve, PrøveStatistikk as ServicePrøveStatistikk } from '../../services/prover.service';

// Typer - bruker service interfaces
type Prøve = ServicePrøve;
type ProverStatistikk = ServicePrøveStatistikk;

interface FilterState {
  type: string;
  status: string;
  kategori: string;
}

export default function ElevProver() {
  const { elevId } = useParams<{ elevId: string }>();
  const [activeTab, setActiveTab] = useState<'oversikt' | 'prøver' | 'resultater' | 'statistikk'>('oversikt');
  const [prøver, setPrøver] = useState<Prøve[]>([]);
  const [statistikk, setStatistikk] = useState<ProverStatistikk | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    type: '',
    status: '',
    kategori: '',
  });
  const [visDetaljer, setVisDetaljer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    lastPrøver();
  }, [elevId]);

  const lastPrøver = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Bruker mock data for utvikling
      const data = await prøverService.hentMockData();
      setPrøver(data.prøver);
      setStatistikk(data.statistikk);
    } catch (err) {
      setError('Kunne ikke laste prøver');
      console.error('Feil ved lasting av prøver:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Prøve['status']) => {
    switch (status) {
      case 'BESTÅTT':
        return 'bg-green-100 text-green-800';
      case 'IKKE_BESTÅTT':
        return 'bg-red-100 text-red-800';
      case 'PLANLAGT':
        return 'bg-blue-100 text-blue-800';
      case 'GJENNOMFØRT':
        return 'bg-orange-100 text-orange-800';
      case 'AVLYST':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Prøve['status']) => {
    switch (status) {
      case 'BESTÅTT':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'IKKE_BESTÅTT':
        return <XCircleIcon className="w-4 h-4" />;
      case 'PLANLAGT':
        return <ClockIcon className="w-4 h-4" />;
      case 'GJENNOMFØRT':
      case 'AVLYST':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Prøve['type']) => {
    switch (type) {
      case 'TEORIPRØVE':
        return 'bg-yellow-100 text-yellow-800';
      case 'PRAKTISK_PRØVE':
        return 'bg-purple-100 text-purple-800';
      case 'OPPKJØRING':
        return 'bg-blue-100 text-blue-800';
      case 'KONTROLLKJØRING':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getKarakterColor = (karakter: number) => {
    if (karakter >= 5) return 'text-green-600';
    if (karakter >= 4) return 'text-yellow-600';
    if (karakter >= 3) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('no-NO', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const filteredPrøver = prøver.filter(prøve => {
    const matchesType = !filters.type || prøve.type === filters.type;
    const matchesStatus = !filters.status || prøve.status === filters.status;
    
    return matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <BookSolidIcon className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Laster prøveresultater...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cards-spacing-vertical">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-2 py-1 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to={`/elever/${elevId}`} className="mr-4 text-gray-400 hover:text-gray-600">
                <ArrowLeftIcon className="w-6 h-6" />
              </Link>
              <div className="flex items-center">
                <BookSolidIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Prøver og Resultater</h1>
                  <p className="text-gray-600">Oversikt over alle prøver og resultater</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => console.log('Eksporter data')} className="px-2 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <ArrowDownTrayIcon className="h-5 w-5" />
                Eksporter
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-2">
            {[
              { id: 'oversikt', name: 'Oversikt', icon: AcademicCapIcon },
              { id: 'prøver', name: 'Prøveoversikt', icon: BookOpenIcon },
              { id: 'resultater', name: 'Detaljerte resultater', icon: DocumentTextIcon },
              { id: 'statistikk', name: 'Statistikk', icon: ChartBarIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Oversikt Tab */}
      {activeTab === 'oversikt' && statistikk && (
        <div className="cards-spacing-vertical">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 cards-spacing-grid">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
              <div className="flex items-center">
                <div className="px-2 py-1 bg-blue-100 rounded-lg">
                  <BookOpenIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Totale prøver</p>
                  <p className="text-2xl font-bold text-gray-900">{statistikk.totalePrøver}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
              <div className="flex items-center">
                <div className="px-2 py-1 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bestått</p>
                  <p className="text-2xl font-bold text-green-600">{statistikk.beståttePrøver}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
              <div className="flex items-center">
                <div className="px-2 py-1 bg-purple-100 rounded-lg">
                  <TrophyIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Snitt karakter</p>
                  <p className="text-2xl font-bold text-purple-600">{statistikk.gjennomsnittPoeng?.toFixed(1) || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
              <div className="flex items-center">
                <div className="px-2 py-1 bg-yellow-100 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bestått rate</p>
                  <p className="text-2xl font-bold text-yellow-600">{statistikk.beståttprosent?.toFixed(1) || 0}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Neste planlagte prøve */}
          {statistikk.nestePrøve && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Neste planlagte prøve</h3>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center cards-spacing-grid mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(statistikk.nestePrøve.type)}`}>
                      {statistikk.nestePrøve.type}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDate(statistikk.nestePrøve.dato)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {statistikk.nestePrøve.tidspunkt}
                    </span>
                    <span className="text-sm text-gray-600">
                      Ved {statistikk.nestePrøve.sted}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900">{statistikk.nestePrøve.navn}</h4>
                  <div className="flex items-center cards-spacing-grid mt-2 text-sm text-gray-600">
                    <div>📍 {statistikk.nestePrøve.sted}</div>
                    {statistikk.nestePrøve.sensor && (
                      <div>👨‍🏫 {statistikk.nestePrøve.sensor.navn}</div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setVisDetaljer(statistikk.nestePrøve!.id)}
                  className="px-2 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                >
                  Se detaljer
                </button>
              </div>
            </div>
          )}

          {/* Siste resultater */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Siste prøveresultater</h3>
            <div className="cards-spacing-vertical">
              {prøver.filter(p => p.status === 'BESTÅTT' || p.status === 'IKKE_BESTÅTT').slice(0, 3).map((prøve) => (
                <div key={prøve.id} className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center cards-spacing-grid mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prøve.status)}`}>
                        {getStatusIcon(prøve.status)}
                        {prøve.status}
                      </span>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(prøve.type)}`}>
                        {prøve.type}
                      </span>
                      <span className="text-sm text-gray-600">{formatDate(prøve.dato)}</span>
                      {prøve.resultat?.karakter && (
                        <div className="flex items-center gap-1">
                          <TrophySolidIcon className="w-4 h-4 text-yellow-500" />
                          <span className={`text-sm font-medium ${getKarakterColor(5)}`}>
                            {prøve.resultat.karakter}
                          </span>
                        </div>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900">{prøve.navn}</h4>
                    {prøve.resultat?.prosent && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Resultat</span>
                          <span className={`font-medium ${prøve.resultat.prosent >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                            {prøve.resultat.prosent.toFixed(1)}% ({prøve.resultat.poeng}/{prøve.resultat.maksPoeng})
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${prøve.resultat.prosent >= 70 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(prøve.resultat.prosent, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setVisDetaljer(prøve.id)}
                    className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Prøveoversikt Tab */}
      {activeTab === 'prøver' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-2 py-1 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Alle prøver</h3>
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-4 h-4 text-gray-400" />
                <select 
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="">Alle statuser</option>
                  <option value="bestått">Bestått</option>
                  <option value="strøket">Strøket</option>
                  <option value="planlagt">Planlagt</option>
                  <option value="avlyst">Avlyst</option>
                </select>
                <select 
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="">Alle typer</option>
                  <option value="teoriprøve">Teoriprøve</option>
                  <option value="kjøreprøve">Kjøreprøve</option>
                  <option value="internprøve">Internprøve</option>
                  <option value="simulator">Simulator</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredPrøver.map((prøve) => (
              <div key={prøve.id} className="px-2 py-1 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center cards-spacing-grid mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prøve.status)}`}>
                        {getStatusIcon(prøve.status)}
                        {prøve.status}
                      </span>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(prøve.type)}`}>
                        {prøve.type}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatDate(prøve.dato)} • {prøve.tidspunkt}
                      </span>
                      <span className="text-sm text-gray-600">
                        {prøve.sted}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{prøve.navn}</h4>
                    <div className="flex items-center cards-spacing-grid text-sm text-gray-600">
                      <div>📍 {prøve.sted}</div>
                      {prøve.sensor && <div>👨‍🏫 {prøve.sensor.navn}</div>}
                      {prøve.resultat?.prosent && (
                        <div className={`font-medium ${prøve.resultat.prosent >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                          {prøve.resultat.prosent.toFixed(1)}%
                        </div>
                      )}
                      {prøve.resultat?.karakter && (
                        <div className="flex items-center gap-1">
                          <TrophySolidIcon className="w-4 h-4 text-yellow-500" />
                          <span className={`font-medium ${getKarakterColor(5)}`}>
                            {prøve.resultat.karakter}
                          </span>
                        </div>
                      )}
                    </div>
                    {prøve.resultat?.kommentar && (
                      <p className="text-sm text-gray-600 mt-2 italic">"{prøve.resultat.kommentar}"</p>
                    )}
                  </div>
                  <button 
                    onClick={() => setVisDetaljer(prøve.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Andre tabs med placeholder innhold */}
      {activeTab === 'resultater' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Detaljerte resultater</h3>
            <p className="text-gray-600">Detaljert analyse av prøveresultater kommer snart</p>
          </div>
        </div>
      )}

      {activeTab === 'statistikk' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <div className="text-center py-12">
            <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Statistikk og analyse</h3>
            <p className="text-gray-600">Avansert statistikk og trendanalyser kommer snart</p>
          </div>
        </div>
      )}
    </div>
  );
} 