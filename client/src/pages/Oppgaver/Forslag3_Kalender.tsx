import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import api from '../../lib/api';

interface Oppgave {
  id: number;
  tittel: string;
  beskrivelse?: string;
  status: 'IKKE_PAABEGYNT' | 'PAABEGYNT' | 'I_PROGRESJON' | 'FERDIG' | 'AVBRUTT';
  prioritet: 'LAV' | 'MEDIUM' | 'HOY' | 'KRITISK';
  forfallsdato?: string;
  estimertTid?: number;
  faktiskTid?: number;
  tildeltTil?: number;
  kategori: string;
  tags: string[];
  opprettet: string;
  tildelt?: {
    navn: string;
    epost: string;
  };
}

type ViewMode = 'month' | 'week' | 'timeline';

const statusConfig = {
  IKKE_PAABEGYNT: { label: 'Ikke påbegynt', color: 'bg-gray-100 text-gray-800 border-gray-300', icon: PauseIcon },
  PAABEGYNT: { label: 'Påbegynt', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: PlayIcon },
  I_PROGRESJON: { label: 'I progresjon', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: ClockIcon },
  FERDIG: { label: 'Ferdig', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircleIcon },
  AVBRUTT: { label: 'Avbrutt', color: 'bg-red-100 text-red-800 border-red-300', icon: ExclamationTriangleIcon }
};

const prioritetConfig = {
  LAV: { label: 'Lav', color: 'bg-green-50 border-l-green-400' },
  MEDIUM: { label: 'Medium', color: 'bg-yellow-50 border-l-yellow-400' },
  HOY: { label: 'Høy', color: 'bg-orange-50 border-l-orange-400' },
  KRITISK: { label: 'Kritisk', color: 'bg-red-50 border-l-red-400' }
};

const OppgaveKort: React.FC<{ oppgave: Oppgave; compact?: boolean }> = ({ oppgave, compact = false }) => {
  const StatusIcon = statusConfig[oppgave.status].icon;
  const erForsinket = oppgave.forfallsdato && new Date(oppgave.forfallsdato) < new Date();

  return (
    <div className={`${prioritetConfig[oppgave.prioritet].color} border-l-4 bg-white rounded-lg shadow-sm p-3 mb-2 hover:shadow-md transition-shadow cursor-pointer`}>
      <div className={`flex items-start justify-between ${compact ? 'flex-col space-y-1' : 'space-x-3'}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <StatusIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <h3 className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-900 truncate`}>
              {oppgave.tittel}
            </h3>
          </div>
          
          {!compact && oppgave.beskrivelse && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{oppgave.beskrivelse}</p>
          )}
          
          <div className={`flex items-center space-x-3 mt-2 ${compact ? 'text-xs' : 'text-sm'} text-gray-500`}>
            {oppgave.estimertTid && (
              <div className="flex items-center space-x-1">
                <ClockIcon className="h-3 w-3" />
                <span>{Math.round(oppgave.estimertTid / 60)}t</span>
              </div>
            )}
            
            {oppgave.tildelt && (
              <div className="flex items-center space-x-1">
                <UserIcon className="h-3 w-3" />
                <span>{oppgave.tildelt.navn.split(' ')[0]}</span>
              </div>
            )}
            
            <span className={`px-2 py-1 rounded-full text-xs ${statusConfig[oppgave.status].color}`}>
              {statusConfig[oppgave.status].label}
            </span>
          </div>
          
          {!compact && oppgave.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {oppgave.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  {tag}
                </span>
              ))}
              {oppgave.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{oppgave.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
        
        {erForsinket && (
          <ExclamationTriangleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
        )}
      </div>
    </div>
  );
};

const MånedKalender: React.FC<{ 
  currentDate: Date; 
  oppgaver: Oppgave[]; 
  onDateClick: (date: Date) => void;
  selectedDate?: Date;
}> = ({ currentDate, oppgaver, onDateClick, selectedDate }) => {
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startOfCalendar = new Date(startOfMonth);
  startOfCalendar.setDate(startOfCalendar.getDate() - startOfMonth.getDay());
  
  const days = [];
  const current = new Date(startOfCalendar);
  
  // Generer 42 dager (6 uker)
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const getOppgaverForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return oppgaver.filter(oppgave => oppgave.forfallsdato === dateStr);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isSelectedDate = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'].map(day => (
          <div key={day} className="bg-gray-50 py-2 text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {days.map((date, index) => {
          const oppgaverForDate = getOppgaverForDate(date);
          const isCurrentMonthDate = isCurrentMonth(date);
          const isTodayDate = isToday(date);
          const isSelected = isSelectedDate(date);
          
          return (
            <div
              key={index}
              onClick={() => onDateClick(date)}
              className={`
                min-h-[100px] bg-white p-1 cursor-pointer hover:bg-gray-50
                ${!isCurrentMonthDate ? 'text-gray-300' : ''}
                ${isTodayDate ? 'bg-blue-50' : ''}
                ${isSelected ? 'ring-2 ring-blue-500' : ''}
              `}
            >
              <div className={`
                text-sm mb-1 
                ${isTodayDate ? 'font-bold text-blue-600' : ''}
                ${!isCurrentMonthDate ? 'text-gray-400' : 'text-gray-900'}
              `}>
                {date.getDate()}
              </div>
              
              <div className="space-y-1">
                {oppgaverForDate.slice(0, 3).map(oppgave => (
                  <div
                    key={oppgave.id}
                    className={`text-xs p-1 rounded ${statusConfig[oppgave.status].color} truncate`}
                  >
                    {oppgave.tittel}
                  </div>
                ))}
                {oppgaverForDate.length > 3 && (
                  <div className="text-xs text-gray-500 px-1">
                    +{oppgaverForDate.length - 3} mer
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const UkeVisning: React.FC<{ 
  currentDate: Date; 
  oppgaver: Oppgave[]; 
}> = ({ currentDate, oppgaver }) => {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }

  const getOppgaverForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return oppgaver.filter(oppgave => oppgave.forfallsdato === dateStr);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {days.map((date, index) => {
          const oppgaverForDate = getOppgaverForDate(date);
          const isTodayDate = isToday(date);
          
          return (
            <div key={index} className="bg-white">
              <div className={`p-3 border-b ${isTodayDate ? 'bg-blue-50' : ''}`}>
                <div className={`text-sm font-medium ${isTodayDate ? 'text-blue-600' : 'text-gray-900'}`}>
                  {date.toLocaleDateString('nb-NO', { weekday: 'short' })}
                </div>
                <div className={`text-lg ${isTodayDate ? 'text-blue-600 font-bold' : 'text-gray-900'}`}>
                  {date.getDate()}
                </div>
              </div>
              
              <div className="p-2 min-h-[400px]">
                {oppgaverForDate.map(oppgave => (
                  <OppgaveKort key={oppgave.id} oppgave={oppgave} compact />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TidslinjeVisning: React.FC<{ oppgaver: Oppgave[] }> = ({ oppgaver }) => {
  const sortedOppgaver = [...oppgaver]
    .filter(o => o.forfallsdato)
    .sort((a, b) => (a.forfallsdato! < b.forfallsdato! ? -1 : 1));

  const grupperteOppgaver = sortedOppgaver.reduce((acc, oppgave) => {
    const dato = oppgave.forfallsdato!;
    if (!acc[dato]) acc[dato] = [];
    acc[dato].push(oppgave);
    return acc;
  }, {} as Record<string, Oppgave[]>);

  const formatDato = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'I dag';
    if (date.toDateString() === tomorrow.toDateString()) return 'I morgen';
    
    return date.toLocaleDateString('nb-NO', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const erForsinket = (dateStr: string) => {
    return new Date(dateStr) < new Date();
  };

  return (
    <div className="space-y-6">
      {Object.entries(grupperteOppgaver).map(([dato, oppgaver]) => (
        <div key={dato} className="bg-white rounded-lg shadow">
          <div className={`p-4 border-b ${erForsinket(dato) ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-medium ${erForsinket(dato) ? 'text-red-900' : 'text-gray-900'}`}>
                {formatDato(dato)}
              </h3>
              <div className="flex items-center space-x-2">
                {erForsinket(dato) && (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                )}
                <span className="text-sm text-gray-500">
                  {oppgaver.length} oppgave{oppgaver.length !== 1 ? 'r' : ''}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            {oppgaver.map(oppgave => (
              <OppgaveKort key={oppgave.id} oppgave={oppgave} />
            ))}
          </div>
        </div>
      ))}
      
      {Object.keys(grupperteOppgaver).length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Ingen oppgaver med forfallsdato</p>
        </div>
      )}
    </div>
  );
};

export default function OppgaverKalender() {
  const [oppgaver, setOppgaver] = useState<Oppgave[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  useEffect(() => {
    fetchOppgaver();
  }, []);

  const fetchOppgaver = async () => {
    try {
      const response = await api.get('/oppgaver');
      setOppgaver(response.data);
    } catch (error) {
      console.error('Feil ved henting av oppgaver:', error);
      // Mock data for demo
      setOppgaver([
        {
          id: 1,
          tittel: 'Gjennomgå sikkerhetskontroll for Bedrift AS',
          beskrivelse: 'Kontroller alle sikkerhetspunkter og dokumenter rapport',
          status: 'IKKE_PAABEGYNT',
          prioritet: 'HOY',
          forfallsdato: '2025-06-25',
          estimertTid: 120,
          kategori: 'SIKKERHET',
          tags: ['sikkerhet', 'kontroll', 'rapport'],
          opprettet: '2025-06-20',
          tildelt: { navn: 'Ola Nordmann', epost: 'ola@test.no' }
        },
        {
          id: 2,
          tittel: 'Oppdater elevregister',
          beskrivelse: 'Legg til nye elever og oppdater eksisterende informasjon',
          status: 'PAABEGYNT',
          prioritet: 'MEDIUM',
          forfallsdato: '2025-06-30',
          estimertTid: 60,
          kategori: 'ADMINISTRASJON',
          tags: ['elever', 'register'],
          opprettet: '2025-06-19',
          tildelt: { navn: 'Kari Hansen', epost: 'kari@test.no' }
        },
        {
          id: 3,
          tittel: 'Forberede kursmateriell',
          beskrivelse: 'Lag presentasjoner og øvelser for neste kurs',
          status: 'I_PROGRESJON',
          prioritet: 'MEDIUM',
          forfallsdato: '2025-06-28',
          estimertTid: 180,
          kategori: 'UNDERVISNING',
          tags: ['kurs', 'materiell', 'presentasjon'],
          opprettet: '2025-06-18',
          tildelt: { navn: 'Per Olsen', epost: 'per@test.no' }
        },
        {
          id: 4,
          tittel: 'Månedlig rapportering',
          beskrivelse: 'Sammenstill månedlige tall og send rapport til ledelsen',
          status: 'FERDIG',
          prioritet: 'HOY',
          forfallsdato: '2025-06-15',
          estimertTid: 90,
          kategori: 'RAPPORTERING',
          tags: ['rapport', 'månedlig', 'ledelse'],
          opprettet: '2025-06-10',
          tildelt: { navn: 'Lisa Berg', epost: 'lisa@test.no' }
        },
        {
          id: 5,
          tittel: 'Oppfølging av elev søknader',
          beskrivelse: 'Gjennomgå og behandle nye søknader fra elever',
          status: 'IKKE_PAABEGYNT',
          prioritet: 'LAV',
          forfallsdato: '2025-07-01',
          estimertTid: 45,
          kategori: 'ADMINISTRASJON',
          tags: ['søknader', 'elever'],
          opprettet: '2025-06-21',
          tildelt: { navn: 'Kari Hansen', epost: 'kari@test.no' }
        },
        {
          id: 6,
          tittel: 'Planlegge team møte',
          beskrivelse: 'Organisere ukentlig teammøte og forberede agenda',
          status: 'IKKE_PAABEGYNT',
          prioritet: 'MEDIUM',
          forfallsdato: '2025-06-25',
          estimertTid: 30,
          kategori: 'ADMINISTRASJON',
          tags: ['møte', 'team'],
          opprettet: '2025-06-22',
          tildelt: { navn: 'Per Olsen', epost: 'per@test.no' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 7);
      } else {
        newDate.setDate(prev.getDate() + 7);
      }
      return newDate;
    });
  };

  const getSelectedDateOppgaver = () => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toISOString().split('T')[0];
    return oppgaver.filter(oppgave => oppgave.forfallsdato === dateStr);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Oppgaver Kalender</h1>
          <p className="text-gray-600">
            {viewMode === 'month' && currentDate.toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' })}
            {viewMode === 'week' && `Uke ${Math.ceil(currentDate.getDate() / 7)}, ${currentDate.toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' })}`}
            {viewMode === 'timeline' && 'Tidslinje visning'}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View mode buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === 'month' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Måned
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === 'week' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ViewColumnsIcon className="h-4 w-4 inline mr-1" />
              Uke
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === 'timeline' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ListBulletIcon className="h-4 w-4 inline mr-1" />
              Tidslinje
            </button>
          </div>
          
          {/* Navigation */}
          {viewMode !== 'timeline' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => viewMode === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                I dag
              </button>
              <button
                onClick={() => viewMode === 'month' ? navigateMonth('next') : navigateWeek('next')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          )}
          
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <PlusIcon className="h-5 w-5" />
            <span>Ny oppgave</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {viewMode === 'month' && (
            <MånedKalender
              currentDate={currentDate}
              oppgaver={oppgaver}
              onDateClick={setSelectedDate}
              selectedDate={selectedDate}
            />
          )}
          
          {viewMode === 'week' && (
            <UkeVisning
              currentDate={currentDate}
              oppgaver={oppgaver}
            />
          )}
          
          {viewMode === 'timeline' && (
            <TidslinjeVisning oppgaver={oppgaver} />
          )}
        </div>
        
        {/* Sidebar for selected date (only in month view) */}
        {viewMode === 'month' && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedDate ? 
                  selectedDate.toLocaleDateString('nb-NO', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  }) : 
                  'Velg en dato'
                }
              </h3>
              
              {selectedDate ? (
                <div className="space-y-3">
                  {getSelectedDateOppgaver().length > 0 ? (
                    getSelectedDateOppgaver().map(oppgave => (
                      <OppgaveKort key={oppgave.id} oppgave={oppgave} />
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Ingen oppgaver denne dagen</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Klikk på en dato for å se oppgaver</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 