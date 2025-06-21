import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt,
  FaPlus,
  FaCar,
  FaUsers,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaMapMarkerAlt,
  FaFilter,
  FaDownload,
  FaShare,
  FaCalendarDay,
  FaCalendarWeek,
  FaBell
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { referenceService } from '../../services/reference.service';
import { kalenderService, type KalenderEvent, type KalenderStatistikk } from '../../services/kalender.service';

// Typer
interface Ressurs {
  id: string;
  navn: string;
  type: 'kjøretøy' | 'rom' | 'utstyr';
  status: 'ledig' | 'opptatt' | 'vedlikehold';
}

const EVENT_TYPER = {
  KJØRETIME: { navn: 'Kjøretime', farge: 'bg-blue-100 text-blue-800 border-blue-500', icon: FaCar },
  TEORITIME: { navn: 'Teoritime', farge: 'bg-green-100 text-green-800 border-green-500', icon: FaUsers },
  PRØVE: { navn: 'Prøve', farge: 'bg-purple-100 text-purple-800 border-purple-500', icon: FaClock },
  MØTE: { navn: 'Møte', farge: 'bg-orange-100 text-orange-800 border-orange-500', icon: FaCalendarAlt },
  VEDLIKEHOLD: { navn: 'Vedlikehold', farge: 'bg-yellow-100 text-yellow-800 border-yellow-500', icon: FaCalendarDay },
  ANNET: { navn: 'Annet', farge: 'bg-gray-100 text-gray-800 border-gray-500', icon: FaCalendarAlt }
};

const STATUS_FARGER = {
  PLANLAGT: 'bg-gray-100 text-gray-800',
  BEKREFTET: 'bg-green-100 text-green-800',
  AVLYST: 'bg-red-100 text-red-800',
  FULLFØRT: 'bg-blue-100 text-blue-800'
};

type ViewMode = 'måneder' | 'uke' | 'dag' | 'ressurser';

export default function Kalender() {
  const [events, setEvents] = useState<KalenderEvent[]>([]);
  const [ressurser, setRessurser] = useState<Ressurs[]>([]);
  const [statistikk, setStatistikk] = useState<KalenderStatistikk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [filterType, setFilterType] = useState<string>('alle');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<KalenderEvent | null>(null);
  const [filteredTypes, setFilteredTypes] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [monthNames, setMonthNames] = useState<string[]>(['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember']); // Fallback
  const [dayNames, setDayNames] = useState<string[]>(['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn']); // Fallback - starter på mandag

  useEffect(() => {
    hentKalenderData();
  }, [selectedDate, viewMode, filterType]);

  const hentKalenderData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Beregn dato-range basert på viewMode
      const dateFrom = getDateRangeStart(selectedDate, viewMode);
      const dateTo = getDateRangeEnd(selectedDate, viewMode);
      
      const data = await kalenderService.hentMockData();
      
      setEvents(data.events);
      setStatistikk(data.statistikk);
    } catch (error) {
      console.error('Feil ved henting av kalender-data:', error);
      setError('Kunne ikke laste kalender-data. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeStart = (date: Date, mode: 'day' | 'week' | 'month'): string => {
    const d = new Date(date);
    switch (mode) {
      case 'day':
        return d.toISOString().split('T')[0];
      case 'week':
        const startOfWeek = new Date(d);
        startOfWeek.setDate(d.getDate() - d.getDay() + 1); // Mandag
        return startOfWeek.toISOString().split('T')[0];
      case 'month':
        return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
      default:
        return d.toISOString().split('T')[0];
    }
  };

  const getDateRangeEnd = (date: Date, mode: 'day' | 'week' | 'month'): string => {
    const d = new Date(date);
    switch (mode) {
      case 'day':
        return d.toISOString().split('T')[0];
      case 'week':
        const endOfWeek = new Date(d);
        endOfWeek.setDate(d.getDate() - d.getDay() + 7); // Søndag
        return endOfWeek.toISOString().split('T')[0];
      case 'month':
        return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
      default:
        return d.toISOString().split('T')[0];
    }
  };

  const getTodaysEvents = () => {
    const today = new Date().toDateString();
    return events.filter(event => 
      new Date(event.startTid).toDateString() === today
    );
  };

  const getWeekEvents = () => {
    const startOfWeek = new Date(selectedDate);
    const dayOfWeek = startOfWeek.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(selectedDate.getDate() - daysToSubtract);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return events.filter(event => {
      const eventDate = new Date(event.startTid);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });
  };

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayEvents = events.filter(event => 
        new Date(event.startTid).toDateString() === currentDay.toDateString() &&
        (filteredTypes.length === 0 || filteredTypes.includes(event.type))
      );
      
      days.push({
        date: new Date(currentDay),
        events: dayEvents,
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: currentDay.toDateString() === new Date().toDateString()
      });
      
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const toggleTypeFilter = (type: string) => {
    setFilteredTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const todaysEvents = getTodaysEvents();
  const weekEvents = getWeekEvents();
  const calendarDays = generateCalendarDays();

  // Hent kalender-data fra API
  useEffect(() => {
    const hentKalenderData = async () => {
      try {
        const [maaneder, ukedager] = await Promise.all([
          referenceService.getMaaneder('lang'),
          referenceService.getUkedager('kort')
        ]);
        setMonthNames(maaneder);
        setDayNames(ukedager);
      } catch (error) {
        console.error('Feil ved henting av kalender-data:', error);
        // Beholder fallback-verdier ved feil
      }
    };

    hentKalenderData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-2 py-1">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-3 mb-4 lg:mb-0">
            <FaCalendarAlt className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kalender & Tidsplan</h1>
              <p className="text-gray-600">Planlegg og administrer aktiviteter</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-2 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPlus className="mr-2 h-4 w-4" />
              Ny aktivitet
            </button>
            
            <div className="flex space-x-2">
              <button onClick={() => console.log('Eksporter data')} className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FaDownload className="mr-2 h-4 w-4" />
                Eksporter
              </button>
              <button onClick={() => console.log('Del innhold')} className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FaShare className="mr-2 h-4 w-4" />
                Del
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 cards-spacing-grid mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-2 py-1">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaCalendarDay className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">I dag</dt>
                  <dd className="text-lg font-medium text-gray-900">{todaysEvents.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-2 py-1">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaCalendarWeek className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Denne uke</dt>
                  <dd className="text-lg font-medium text-gray-900">{weekEvents.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-2 py-1">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaCar className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Kjøretøy ledig</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {ressurser.filter(r => r.type === 'kjøretøy' && r.status === 'ledig').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-2 py-1">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaBell className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Påminnelser</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {events.filter(e => new Date(e.startTid) <= new Date(Date.now() + 24*60*60*1000)).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 cards-spacing-grid">
        {/* Hovedkalender */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow rounded-lg">
            {/* Kalender header */}
            <div className="px-2 py-1 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <FaChevronLeft className="h-4 w-4" />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                    </h2>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <FaChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                  >
                    I dag
                  </button>
                </div>

                {/* View mode selector */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {(['day', 'week', 'month'] as ('day' | 'week' | 'month')[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                        viewMode === mode
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Event type filters */}
              <div className="flex flex-wrap gap-2 mt-4">
                {Object.entries(EVENT_TYPER).map(([type, config]) => {
                  const IconComponent = config.icon;
                  const isActive = filteredTypes.length === 0 || filteredTypes.includes(type);
                  
                  return (
                    <button
                      key={type}
                      onClick={() => toggleTypeFilter(type)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        isActive 
                          ? config.farge
                          : 'bg-gray-100 text-gray-500 border-gray-300'
                      }`}
                    >
                      <IconComponent className="mr-1 h-3 w-3" />
                      {config.navn}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kalender grid */}
            <div className="px-2 py-1">
              {viewMode === 'month' && (
                <div className="grid grid-cols-7 gap-1">
                  {/* Dag headers */}
                  {dayNames.map(day => (
                    <div key={day} className="p-2 text-center text-xs font-semibold text-gray-500 uppercase">
                      {day}
                    </div>
                  ))}
                  
                  {/* Kalender dager */}
                  {calendarDays.map((day, index) => (
                    <div
                      key={index}
                      className={`min-h-24 p-1 border border-gray-100 ${
                        !day.isCurrentMonth ? 'bg-gray-50' : ''
                      } ${day.isToday ? 'bg-blue-50 ring-2 ring-blue-200' : ''}`}
                    >
                      <div className={`text-sm font-medium ${
                        !day.isCurrentMonth ? 'text-gray-400' : 
                        day.isToday ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {day.date.getDate()}
                      </div>
                      
                      <div className="mt-1 space-y-1">
                        {day.events.slice(0, 2).map(event => {
                          const eventType = EVENT_TYPER[event.type];
                          return (
                            <div
                              key={event.id}
                              onClick={() => setSelectedEvent(event)}
                              className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${eventType.farge} truncate`}
                              title={event.tittel}
                            >
                              {event.tittel}
                            </div>
                          );
                        })}
                        {day.events.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{day.events.length - 2} mer
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="cards-spacing-vertical">
          {/* Dagens agenda */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-2 py-1 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Dagens agenda</h3>
            </div>
            <div className="px-2 py-1">
              {todaysEvents.length > 0 ? (
                <div className="space-y-8">
                  {todaysEvents.map(event => {
                    const eventType = EVENT_TYPER[event.type];
                    const IconComponent = eventType.icon;
                    
                    return (
                      <div
                        key={event.id}
                        className="flex items-start space-x-3 px-2 py-1 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <IconComponent className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {event.tittel}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.startTid).toLocaleTimeString('nb-NO', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })} - {new Date(event.sluttTid).toLocaleTimeString('nb-NO', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                          {event.lokasjon && (
                            <p className="text-xs text-gray-500 flex items-center mt-1">
                              <FaMapMarkerAlt className="h-3 w-3 mr-1" />
                              {event.lokasjon}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Ingen aktiviteter i dag</p>
              )}
            </div>
          </div>

          {/* Ressursstatus */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-2 py-1 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Ressursstatus</h3>
            </div>
            <div className="px-2 py-1">
              <div className="space-y-8">
                {ressurser.map(ressurs => (
                  <div key={ressurs.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {ressurs.type === 'kjøretøy' ? (
                        <FaCar className="h-4 w-4 text-gray-400" />
                      ) : (
                        <FaUsers className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        {ressurs.navn}
                      </span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      ressurs.status === 'ledig' ? 'bg-green-100 text-green-800' :
                      ressurs.status === 'opptatt' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ressurs.status === 'ledig' ? 'Ledig' :
                       ressurs.status === 'opptatt' ? 'Opptatt' : 'Vedlikehold'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event details modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-2 py-1 z-50"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="px-2 py-1 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedEvent.tittel}
                </h3>
              </div>
              <div className="px-2 py-1 cards-spacing-vertical">
                <p className="text-gray-600">{selectedEvent.beskrivelse}</p>
                
                <div className="grid grid-cols-2 cards-spacing-grid text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Start:</span>
                    <p className="text-gray-600">
                      {new Date(selectedEvent.startTid).toLocaleString('nb-NO')}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Slutt:</span>
                    <p className="text-gray-600">
                      {new Date(selectedEvent.sluttTid).toLocaleString('nb-NO')}
                    </p>
                  </div>
                </div>
                
                {selectedEvent.lokasjon && (
                  <div>
                    <span className="font-medium text-gray-900">Sted:</span>
                    <p className="text-gray-600">{selectedEvent.lokasjon}</p>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    EVENT_TYPER[selectedEvent.type].farge
                  }`}>
                    {EVENT_TYPER[selectedEvent.type].navn}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    STATUS_FARGER[selectedEvent.status]
                  }`}>
                    {selectedEvent.status}
                  </span>
                </div>
              </div>
              <div className="px-2 py-1 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Lukk
                </button>
                <button onClick={() => console.log('Rediger')} className="px-2 py-1 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
                  Rediger
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 