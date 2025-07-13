import React, { useState, useEffect } from 'react';

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

interface EventModalProps {
  event: CalendarEvent | null;
  onSave: (eventData: CalendarEvent) => void;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onSave, onClose }) => {
  const [formData, setFormData] = useState<CalendarEvent>({
    id: '',
    title: '',
    start: '',
    end: '',
    color: '#3B82F6',
    extendedProps: {}
  });

  useEffect(() => {
    if (event) {
      setFormData(event);
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExtendedPropsChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      extendedProps: {
        ...prev.extendedProps,
        [field]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {event?.id ? 'Rediger hendelse' : 'Ny hendelse'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tittel
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beskrivelse
            </label>
            <textarea
              value={formData.extendedProps.description || ''}
              onChange={(e) => handleExtendedPropsChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start
              </label>
              <input
                type="datetime-local"
                value={formData.start.slice(0, 16)}
                onChange={(e) => handleChange('start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slutt
              </label>
              <input
                type="datetime-local"
                value={formData.end.slice(0, 16)}
                onChange={(e) => handleChange('end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Farge
            </label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hendelsestype
            </label>
            <select
              value={formData.extendedProps.eventType || ''}
              onChange={(e) => handleExtendedPropsChange('eventType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Velg type</option>
              <option value="sikkerhetskontroll">Sikkerhetskontroll</option>
              <option value="mote">Møte</option>
              <option value="oppgave">Oppgave</option>
              <option value="annet">Annet</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {event?.id ? 'Oppdater' : 'Opprett'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};