import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
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

interface FilterState {
  sok: string;
  status: string[];
  prioritet: string[];
  kategori: string[];
  tildeltTil: string[];
  forfallsdatoFra?: string;
  forfallsdatoTil?: string;
}

type SortField = 'tittel' | 'status' | 'prioritet' | 'forfallsdato' | 'opprettet' | 'estimertTid';
type SortDirection = 'asc' | 'desc';

const statusConfig = {
  IKKE_PAABEGYNT: { label: 'Ikke påbegynt', color: 'bg-gray-100 text-gray-800', icon: PauseIcon },
  PAABEGYNT: { label: 'Påbegynt', color: 'bg-blue-100 text-blue-800', icon: PlayIcon },
  I_PROGRESJON: { label: 'I progresjon', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
  FERDIG: { label: 'Ferdig', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
  AVBRUTT: { label: 'Avbrutt', color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon }
};

const prioritetConfig = {
  LAV: { label: 'Lav', color: 'bg-green-100 text-green-800' },
  MEDIUM: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  HOY: { label: 'Høy', color: 'bg-orange-100 text-orange-800' },
  KRITISK: { label: 'Kritisk', color: 'bg-red-100 text-red-800' }
};

const FilterPanel: React.FC<{
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  kategorier: string[];
  brukere: Array<{ id: number; navn: string }>;
  isOpen: boolean;
  onClose: () => void;
}> = ({ filter, onFilterChange, kategorier, brukere, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked 
      ? [...filter.status, status]
      : filter.status.filter(s => s !== status);
    onFilterChange({ ...filter, status: newStatus });
  };

  const handlePrioritetChange = (prioritet: string, checked: boolean) => {
    const newPrioritet = checked 
      ? [...filter.prioritet, prioritet]
      : filter.prioritet.filter(p => p !== prioritet);
    onFilterChange({ ...filter, prioritet: newPrioritet });
  };

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-6 z-10 mt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Status filter */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Status</h3>
          <div className="space-y-2">
            {Object.entries(statusConfig).map(([key, config]) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filter.status.includes(key)}
                  onChange={(e) => handleStatusChange(key, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{config.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Prioritet filter */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Prioritet</h3>
          <div className="space-y-2">
            {Object.entries(prioritetConfig).map(([key, config]) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filter.prioritet.includes(key)}
                  onChange={(e) => handlePrioritetChange(key, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{config.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Kategori filter */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Kategori</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {kategorier.map(kategori => (
              <label key={kategori} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filter.kategori.includes(kategori)}
                  onChange={(e) => {
                    const newKategori = e.target.checked 
                      ? [...filter.kategori, kategori]
                      : filter.kategori.filter(k => k !== kategori);
                    onFilterChange({ ...filter, kategori: newKategori });
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{kategori}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Dato filter */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Forfallsdato</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fra</label>
              <input
                type="date"
                value={filter.forfallsdatoFra || ''}
                onChange={(e) => onFilterChange({ ...filter, forfallsdatoFra: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Til</label>
              <input
                type="date"
                value={filter.forfallsdatoTil || ''}
                onChange={(e) => onFilterChange({ ...filter, forfallsdatoTil: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={() => onFilterChange({
            sok: '',
            status: [],
            prioritet: [],
            kategori: [],
            tildeltTil: [],
            forfallsdatoFra: undefined,
            forfallsdatoTil: undefined
          })}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Nullstill
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
        >
          Lukk
        </button>
      </div>
    </div>
  );
};

const OppgaveRad: React.FC<{ oppgave: Oppgave; onEdit: (oppgave: Oppgave) => void; onDelete: (id: number) => void }> = ({ 
  oppgave, 
  onEdit, 
  onDelete 
}) => {
  const StatusIcon = statusConfig[oppgave.status].icon;
  const erForsinket = oppgave.forfallsdato && new Date(oppgave.forfallsdato) < new Date();

  const formatDato = (dato: string) => {
    return new Date(dato).toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  return (
    <tr className="hover:bg-gray-50 border-b border-gray-200">
      <td className="px-6 py-4">
        <div className="flex items-start space-x-3">
          <StatusIcon className="h-5 w-5 text-gray-400 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{oppgave.tittel}</p>
            {oppgave.beskrivelse && (
              <p className="text-sm text-gray-500 truncate mt-1">{oppgave.beskrivelse}</p>
            )}
            {oppgave.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {oppgave.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    {tag}
                  </span>
                ))}
                {oppgave.tags.length > 2 && (
                  <span className="text-xs text-gray-500">+{oppgave.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[oppgave.status].color}`}>
          {statusConfig[oppgave.status].label}
        </span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${prioritetConfig[oppgave.prioritet].color}`}>
          {prioritetConfig[oppgave.prioritet].label}
        </span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {oppgave.kategori}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {oppgave.forfallsdato ? (
          <div className={`flex items-center ${erForsinket ? 'text-red-600' : ''}`}>
            <CalendarDaysIcon className="h-4 w-4 mr-1" />
            {formatDato(oppgave.forfallsdato)}
          </div>
        ) : (
          '-'
        )}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {oppgave.estimertTid ? `${Math.round(oppgave.estimertTid / 60)}t` : '-'}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {oppgave.tildelt ? (
          <div className="flex items-center">
            <UserIcon className="h-4 w-4 mr-1" />
            {oppgave.tildelt.navn.split(' ')[0]}
          </div>
        ) : (
          'Ikke tildelt'
        )}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onEdit(oppgave)}
            className="text-blue-600 hover:text-blue-900"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button className="text-gray-400 hover:text-gray-600">
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(oppgave.id)}
            className="text-red-600 hover:text-red-900"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default function OppgaverListe() {
  const [oppgaver, setOppgaver] = useState<Oppgave[]>([]);
  const [filtrerteOppgaver, setFiltrerteOppgaver] = useState<Oppgave[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterState>({
    sok: '',
    status: [],
    prioritet: [],
    kategori: [],
    tildeltTil: []
  });
  const [sortField, setSortField] = useState<SortField>('opprettet');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    fetchOppgaver();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [oppgaver, filter, sortField, sortDirection]);

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
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...oppgaver];

    // Søkefilter
    if (filter.sok) {
      result = result.filter(oppgave => 
        oppgave.tittel.toLowerCase().includes(filter.sok.toLowerCase()) ||
        oppgave.beskrivelse?.toLowerCase().includes(filter.sok.toLowerCase()) ||
        oppgave.kategori.toLowerCase().includes(filter.sok.toLowerCase())
      );
    }

    // Status filter
    if (filter.status.length > 0) {
      result = result.filter(oppgave => filter.status.includes(oppgave.status));
    }

    // Prioritet filter
    if (filter.prioritet.length > 0) {
      result = result.filter(oppgave => filter.prioritet.includes(oppgave.prioritet));
    }

    // Kategori filter
    if (filter.kategori.length > 0) {
      result = result.filter(oppgave => filter.kategori.includes(oppgave.kategori));
    }

    // Dato filter
    if (filter.forfallsdatoFra) {
      result = result.filter(oppgave => 
        oppgave.forfallsdato && oppgave.forfallsdato >= filter.forfallsdatoFra!
      );
    }
    if (filter.forfallsdatoTil) {
      result = result.filter(oppgave => 
        oppgave.forfallsdato && oppgave.forfallsdato <= filter.forfallsdatoTil!
      );
    }

    // Sortering
    result.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'forfallsdato' && (!aValue || !bValue)) {
        if (!aValue && !bValue) return 0;
        if (!aValue) return sortDirection === 'asc' ? 1 : -1;
        if (!bValue) return sortDirection === 'asc' ? -1 : 1;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFiltrerteOppgaver(result);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUpIcon className="h-4 w-4" /> : 
      <ChevronDownIcon className="h-4 w-4" />;
  };

  const getUniqueKategorier = () => {
    return Array.from(new Set(oppgaver.map(o => o.kategori)));
  };

  const getBrukere = () => {
    const brukere = oppgaver
      .filter(o => o.tildelt)
      .map(o => ({ id: o.tildeltTil!, navn: o.tildelt!.navn }));
    return Array.from(new Map(brukere.map(b => [b.id, b])).values());
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
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
          <p className="text-gray-600">{filtrerteOppgaver.length} av {oppgaver.length} oppgaver</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <PlusIcon className="h-5 w-5" />
          <span>Ny oppgave</span>
        </button>
      </div>

      {/* Søk og filter */}
      <div className="relative mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Søk i oppgaver..."
              value={filter.sok}
              onChange={(e) => setFilter({ ...filter, sok: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-lg ${
              showFilter ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700'
            }`}
          >
            <FunnelIcon className="h-5 w-5" />
            <span>Filter</span>
          </button>
        </div>

        <FilterPanel
          filter={filter}
          onFilterChange={setFilter}
          kategorier={getUniqueKategorier()}
          brukere={getBrukere()}
          isOpen={showFilter}
          onClose={() => setShowFilter(false)}
        />
      </div>

      {/* Tabell */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                onClick={() => handleSort('tittel')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>Oppgave</span>
                  <SortIcon field="tittel" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('status')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <SortIcon field="status" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('prioritet')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>Prioritet</span>
                  <SortIcon field="prioritet" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kategori
              </th>
              <th 
                onClick={() => handleSort('forfallsdato')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>Forfallsdato</span>
                  <SortIcon field="forfallsdato" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('estimertTid')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>Estimert tid</span>
                  <SortIcon field="estimertTid" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tildelt
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Handlinger
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtrerteOppgaver.map((oppgave) => (
              <OppgaveRad
                key={oppgave.id}
                oppgave={oppgave}
                onEdit={(oppgave) => console.log('Rediger:', oppgave)}
                onDelete={(id) => console.log('Slett:', id)}
              />
            ))}
          </tbody>
        </table>

        {filtrerteOppgaver.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Ingen oppgaver funnet</p>
          </div>
        )}
      </div>
    </div>
  );
} 