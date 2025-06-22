import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  EllipsisVerticalIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon
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
  tildeltTil?: number;
  kategori: string;
  tags: string[];
  opprettet: string;
  tildelt?: {
    navn: string;
    epost: string;
  };
}

const statusColumns = [
  { key: 'IKKE_PAABEGYNT', title: 'Ikke påbegynt', color: 'bg-gray-100', icon: PauseIcon },
  { key: 'PAABEGYNT', title: 'Påbegynt', color: 'bg-blue-100', icon: PlayIcon },
  { key: 'I_PROGRESJON', title: 'I progresjon', color: 'bg-yellow-100', icon: ClockIcon },
  { key: 'FERDIG', title: 'Ferdig', color: 'bg-green-100', icon: CheckCircleIcon },
  { key: 'AVBRUTT', title: 'Avbrutt', color: 'bg-red-100', icon: ExclamationTriangleIcon }
];

const prioritetColors = {
  LAV: 'bg-green-500',
  MEDIUM: 'bg-yellow-500',
  HOY: 'bg-orange-500',
  KRITISK: 'bg-red-500'
};

const OppgaveKort: React.FC<{ oppgave: Oppgave; onDragStart: (e: React.DragEvent, oppgave: Oppgave) => void }> = ({ 
  oppgave, 
  onDragStart 
}) => {
  const formatDato = (dato: string) => {
    return new Date(dato).toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const erForsinket = oppgave.forfallsdato && new Date(oppgave.forfallsdato) < new Date();

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, oppgave)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${prioritetColors[oppgave.prioritet]}`}></div>
          <span className="text-xs text-gray-500 uppercase tracking-wide">{oppgave.kategori}</span>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <EllipsisVerticalIcon className="h-4 w-4" />
        </button>
      </div>
      
      <h3 className="font-medium text-gray-900 mb-2 leading-tight">{oppgave.tittel}</h3>
      
      {oppgave.beskrivelse && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{oppgave.beskrivelse}</p>
      )}
      
      {oppgave.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {oppgave.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
              <TagIcon className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
          {oppgave.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{oppgave.tags.length - 3}</span>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          {oppgave.forfallsdato && (
            <div className={`flex items-center space-x-1 ${erForsinket ? 'text-red-600' : ''}`}>
              <CalendarDaysIcon className="h-3 w-3" />
              <span>{formatDato(oppgave.forfallsdato)}</span>
            </div>
          )}
          {oppgave.estimertTid && (
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-3 w-3" />
              <span>{Math.round(oppgave.estimertTid / 60)}t</span>
            </div>
          )}
        </div>
        
        {oppgave.tildelt && (
          <div className="flex items-center space-x-1">
            <UserIcon className="h-3 w-3" />
            <span className="truncate max-w-20">{oppgave.tildelt.navn.split(' ')[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const KanbanKolonne: React.FC<{
  status: typeof statusColumns[0];
  oppgaver: Oppgave[];
  onDrop: (e: React.DragEvent, status: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, oppgave: Oppgave) => void;
}> = ({ status, oppgaver, onDrop, onDragOver, onDragStart }) => {
  const Icon = status.icon;
  
  return (
    <div className="flex-1 min-w-80">
      <div className={`${status.color} rounded-lg p-4 mb-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900">{status.title}</h2>
            <span className="bg-white text-gray-600 text-sm px-2 py-1 rounded-full">
              {oppgaver.length}
            </span>
          </div>
          <button className="text-gray-600 hover:text-gray-800">
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div
        className="min-h-96 p-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50"
        onDrop={(e) => onDrop(e, status.key)}
        onDragOver={onDragOver}
      >
        {oppgaver.map((oppgave) => (
          <OppgaveKort
            key={oppgave.id}
            oppgave={oppgave}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </div>
  );
};

export default function OppgaverKanban() {
  const [oppgaver, setOppgaver] = useState<Oppgave[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedOppgave, setDraggedOppgave] = useState<Oppgave | null>(null);

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
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, oppgave: Oppgave) => {
    setDraggedOppgave(oppgave);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    
    if (!draggedOppgave) return;

    try {
      // Oppdater oppgave status i backend
      await api.put(`/oppgaver/${draggedOppgave.id}`, {
        status: newStatus
      });

      // Oppdater lokal state
      setOppgaver(prev => 
        prev.map(oppgave => 
          oppgave.id === draggedOppgave.id 
            ? { ...oppgave, status: newStatus as any }
            : oppgave
        )
      );
    } catch (error) {
      console.error('Feil ved oppdatering av oppgave:', error);
    }

    setDraggedOppgave(null);
  };

  const getOppgaverByStatus = (status: string) => {
    return oppgaver.filter(oppgave => oppgave.status === status);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="flex space-x-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex-1">
                <div className="h-16 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-32 bg-gray-100 rounded"></div>
                  <div className="h-24 bg-gray-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mine Oppgaver</h1>
          <p className="text-gray-600">Kanban board - dra og slipp for å endre status</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <PlusIcon className="h-5 w-5" />
          <span>Ny oppgave</span>
        </button>
      </div>

      <div className="flex space-x-6 overflow-x-auto pb-6">
        {statusColumns.map(status => (
          <KanbanKolonne
            key={status.key}
            status={status}
            oppgaver={getOppgaverByStatus(status.key)}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
          />
        ))}
      </div>
    </div>
  );
} 