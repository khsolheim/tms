import React, { useState, useEffect } from 'react';
import { EventModal } from './EventModal';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color?: string;
  extendedProps: {
    description?: string;
    eventType?: string;
    resourceId?: number;
  };
}

export const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // Simulerer API-kall med mock-data
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Sikkerhetskontroll Bedrift AS',
          start: new Date().toISOString(),
          end: new Date(Date.now() + 3600000).toISOString(),
          color: '#3B82F6',
          extendedProps: {
            description: 'Årlig sikkerhetskontroll',
            eventType: 'sikkerhetskontroll'
          }
        },
        {
          id: '2',
          title: 'Møte med kunde',
          start: new Date(Date.now() + 86400000).toISOString(),
          end: new Date(Date.now() + 86400000 + 1800000).toISOString(),
          color: '#10B981',
          extendedProps: {
            description: 'Oppfølgingsmøte',
            eventType: 'mote'
          }
        }
      ];
      
      setEvents(mockEvents);
    } catch (error) {
      console.error('Feil ved henting av kalenderhendelser:', error);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedEvent({
      id: '',
      title: '',
      start: date.toISOString(),
      end: new Date(date.getTime() + 3600000).toISOString(),
      extendedProps: {}
    });
    setIsModalOpen(true);
  };

  const handleEventSave = async (eventData: any) => {
    try {
      if (eventData.id) {
        // Oppdater eksisterende hendelse
        setEvents(prev => prev.map(e => e.id === eventData.id ? eventData : e));
      } else {
        // Opprett ny hendelse
        const newEvent = { ...eventData, id: Date.now().toString() };
        setEvents(prev => [...prev, newEvent]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Feil ved lagring av hendelse:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'];

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {weekDays.map(day => (
            <div key={day} className="bg-gray-50 p-3 text-center font-medium text-gray-700">
              {day}
            </div>
          ))}
          {days.map((day, index) => (
            <div
              key={index}
              className={`bg-white p-3 min-h-[100px] ${
                day ? 'hover:bg-gray-50 cursor-pointer' : ''
              }`}
              onClick={() => day && handleDateSelect(day)}
            >
              {day && (
                <>
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {getEventsForDate(day).map(event => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded text-white truncate"
                        style={{ backgroundColor: event.color }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Kalender</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('month')}
            className={`px-4 py-2 rounded ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Måned
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Uke
          </button>
          <button
            onClick={() => setView('day')}
            className={`px-4 py-2 rounded ${view === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Dag
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Forrige
        </button>
        <h3 className="text-lg font-medium">
          {currentDate.toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Neste
        </button>
      </div>

      {renderMonthView()}

      {isModalOpen && (
        <EventModal
          event={selectedEvent}
          onSave={handleEventSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};