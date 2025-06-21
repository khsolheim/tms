import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ClockIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  ArrowLeftIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  UserIcon,
  TrophyIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import {
  ClockIcon as ClockSolidIcon,
  CalendarDaysIcon as CalendarSolidIcon
} from '@heroicons/react/24/solid';
import { timerService, Timer as ServiceTimer, TimerStatistikk as ServiceTimerStatistikk } from '../../services/timer.service';

// Typer - bruker service interfaces
type Timer = ServiceTimer;
type TimerStatistikk = ServiceTimerStatistikk;

interface FilterState {
  type: string;
  status: string;
  instruktør: string;
  søk: string;
}

export default function ElevTimer() {
  const { elevId } = useParams<{ elevId: string }>();
  const [activeTab, setActiveTab] = useState<'oversikt' | 'timeplan' | 'historikk' | 'statistikk'>('oversikt');
  const [timer, setTimer] = useState<Timer[]>([]);
  const [statistikk, setStatistikk] = useState<TimerStatistikk | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    type: '',
    status: '',
    instruktør: '',
    søk: ''
  });
  const [visNyTimeModal, setVisNyTimeModal] = useState(false);
  const [visDetaljer, setVisDetaljer] = useState<string | null>(null);

  // State for error handling
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    lastTimer();
  }, [elevId]);

  const lastTimer = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Bruker mock data for utvikling
      const data = await timerService.hentMockData();
      setTimer(data.timer);
      setStatistikk(data.statistikk);
    } catch (err) {
      setError('Kunne ikke laste timer');
      console.error('Feil ved lasting av timer:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Timer['status']) => {
    switch (status) {
      case 'PLANLAGT':
        return 'bg-blue-100 text-blue-800';
      case 'GJENNOMFØRT':
        return 'bg-green-100 text-green-800';
      case 'AVLYST':
        return 'bg-red-100 text-red-800';
      case 'IKKE_MØTT':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Timer['status']) => {
    switch (status) {
      case 'PLANLAGT':
        return <ClockIcon className="w-4 h-4" />;
      case 'GJENNOMFØRT':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'AVLYST':
      case 'IKKE_MØTT':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ExclamationTriangleIcon className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Timer['type']) => {
    switch (type) {
      case 'PRAKSIS':
        return 'bg-purple-100 text-purple-800';
      case 'TEORI':
        return 'bg-yellow-100 text-yellow-800';
      case 'SIMULATOR':
        return 'bg-indigo-100 text-indigo-800';
      case 'OPPKJØRING':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTid = (minutter: number) => {
    const timer = Math.floor(minutter / 60);
    const min = minutter % 60;
    return `${timer}t ${min}m`;
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('no-NO', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const filteredTimer = timer.filter(time => {
    const matchesType = !filters.type || time.type === filters.type;
    const matchesStatus = !filters.status || time.status === filters.status;
    const matchesInstruktør = !filters.instruktør || time.instruktør.navn.includes(filters.instruktør);
    const matchesSøk = !filters.søk || 
      time.beskrivelse?.toLowerCase().includes(filters.søk.toLowerCase()) ||
      time.instruktør.navn.toLowerCase().includes(filters.søk.toLowerCase());
    
    return matchesType && matchesStatus && matchesInstruktør && matchesSøk;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <ClockSolidIcon className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Laster timer...</p>
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
                <ClockSolidIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Timer og Timeplan</h1>
                  <p className="text-gray-600">Oversikt over alle kjøretimer og teoretimer</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setVisNyTimeModal(true)}
                className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Ny time
              </button>
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
              { id: 'oversikt', name: 'Oversikt', icon: ClockIcon },
              { id: 'timeplan', name: 'Timeplan', icon: CalendarDaysIcon },
              { id: 'historikk', name: 'Historikk', icon: DocumentTextIcon },
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
                  <ClockIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Totale timer</p>
                  <p className="text-2xl font-bold text-gray-900">{statistikk.totaleTimer}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
              <div className="flex items-center">
                <div className="px-2 py-1 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Gjennomført</p>
                  <p className="text-2xl font-bold text-green-600">{statistikk.gjennomførteTimer}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
              <div className="flex items-center">
                <div className="px-2 py-1 bg-yellow-100 rounded-lg">
                  <CalendarDaysIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Planlagte</p>
                  <p className="text-2xl font-bold text-yellow-600">{statistikk.planlagteTimer}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
              <div className="flex items-center">
                <div className="px-2 py-1 bg-purple-100 rounded-lg">
                  <TrophyIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Snitt score</p>
                  <p className="text-2xl font-bold text-purple-600">{statistikk.gjennomsnittVurdering.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Neste planlagte time - kommer når interface er oppdatert */}
          {timer.filter(t => t.status === 'PLANLAGT').length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Neste planlagte time</h3>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center cards-spacing-grid mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(timer.filter(t => t.status === 'PLANLAGT')[0].type)}`}>
                      {timer.filter(t => t.status === 'PLANLAGT')[0].type}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDate(timer.filter(t => t.status === 'PLANLAGT')[0].dato)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {timer.filter(t => t.status === 'PLANLAGT')[0].starttid} - {timer.filter(t => t.status === 'PLANLAGT')[0].sluttid}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900">{timer.filter(t => t.status === 'PLANLAGT')[0].beskrivelse}</h4>
                  <div className="flex items-center cards-spacing-grid mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <UserIcon className="w-4 h-4" />
                      {timer.filter(t => t.status === 'PLANLAGT')[0].instruktør.navn}
                    </div>
                    {timer.filter(t => t.status === 'PLANLAGT')[0].kjøretøy && (
                      <div>
                        {timer.filter(t => t.status === 'PLANLAGT')[0].kjøretøy?.merke} {timer.filter(t => t.status === 'PLANLAGT')[0].kjøretøy?.modell} 
                        ({timer.filter(t => t.status === 'PLANLAGT')[0].kjøretøy?.registreringsnummer})
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setVisDetaljer(timer.filter(t => t.status === 'PLANLAGT')[0].id)}
                  className="px-2 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                >
                  Se detaljer
                </button>
              </div>
            </div>
          )}

          {/* Siste gjennomførte timer */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Siste gjennomførte timer</h3>
            <div className="cards-spacing-vertical">
              {timer.filter(t => t.status === 'GJENNOMFØRT').slice(0, 3).map((time) => (
                <div key={time.id} className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center cards-spacing-grid mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(time.type)}`}>
                        {time.type}
                      </span>
                      <span className="text-sm text-gray-600">{formatDate(time.dato)}</span>
                      {time.vurdering && (
                        <div className="flex items-center gap-1">
                          <TrophyIcon className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium text-yellow-600">
                            {time.vurdering.score.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900">{time.beskrivelse}</h4>
                    {time.tema && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {time.tema}
                        </span>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setVisDetaljer(time.id)}
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

      {/* Andre tabs ville være implementert på lignende måte */}
      {activeTab === 'timeplan' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <div className="text-center py-12">
            <CalendarSolidIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Kalendervisning</h3>
            <p className="text-gray-600">Kalendervisning av timeplan kommer snart</p>
          </div>
        </div>
      )}

      {activeTab === 'historikk' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-2 py-1 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Timehistorikk</h3>
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-4 h-4 text-gray-400" />
                <select 
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="">Alle statuser</option>
                  <option value="gjennomført">Gjennomført</option>
                  <option value="planlagt">Planlagt</option>
                  <option value="avlyst">Avlyst</option>
                  <option value="uteblitt">Uteblitt</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredTimer.map((time) => (
              <div key={time.id} className="px-2 py-1 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center cards-spacing-grid mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(time.status)}`}>
                        {getStatusIcon(time.status)}
                        {time.status}
                      </span>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(time.type)}`}>
                        {time.type}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatDate(time.dato)} • {time.starttid}-{time.sluttid}
                      </span>
                      <span className="text-sm text-gray-600">
                        ({formatTid(time.varighet)})
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{time.beskrivelse}</h4>
                    <div className="flex items-center cards-spacing-grid text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-4 h-4" />
                        {time.instruktør.navn}
                      </div>
                      {time.kjøretøy && (
                        <div>
                          {time.kjøretøy.merke} ({time.kjøretøy.registreringsnummer})
                        </div>
                      )}
                      {time.vurdering && (
                        <div className="flex items-center gap-1">
                          <TrophyIcon className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium text-yellow-600">
                            {time.vurdering.score.toFixed(1)}/6
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setVisDetaljer(time.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    {time.status === 'PLANLAGT' && (
                      <button onClick={() => console.log('Button clicked')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'statistikk' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <div className="text-center py-12">
            <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Detaljert statistikk</h3>
            <p className="text-gray-600">Avansert statistikk og analyser kommer snart</p>
          </div>
        </div>
      )}
    </div>
  );
} 