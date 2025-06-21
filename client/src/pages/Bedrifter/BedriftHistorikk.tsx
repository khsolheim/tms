import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bedriftHistorikkService, BedriftDetaljer, HistorikkEntry as ServiceHistorikkEntry } from '../../services/bedrift-historikk.service';
import {
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import {
  ClockIcon as ClockSolidIcon,
  UserIcon as UserSolidIcon,
  DocumentTextIcon as DocumentTextSolidIcon
} from '@heroicons/react/24/solid';

// Typer
interface HistorikkEntry {
  id: string;
  timestamp: string;
  type: 'OPPRETTET' | 'OPPDATERT' | 'STATUSENDRET' | 'DOKUMENT' | 'KONTRAKT' | 'BRUKER' | 'SYSTEM';
  kategori: 'BEDRIFT' | 'ANSATT' | 'KONTRAKT' | 'KJØRETØY' | 'ØKONOMI' | 'SIKKERHET' | 'SYSTEM';
  tittel: string;
  beskrivelse: string;
  utførtAv: string;
  detaljer?: {
    før?: any;
    etter?: any;
    metadata?: Record<string, any>;
  };
  relaterteObjekter?: {
    type: string;
    id: string;
    navn: string;
  }[];
  alvorlighetsgrad: 'LAV' | 'NORMAL' | 'HØY' | 'KRITISK';
}

interface Bedrift {
  id: string;
  navn: string;
  organisasjonsnummer: string;
  status: string;
}

// Alle data hentes nå fra service - ingen hardkodet data

const typeConfig = {
  OPPRETTET: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
  OPPDATERT: { color: 'bg-blue-100 text-blue-800', icon: PencilIcon },
  STATUSENDRET: { color: 'bg-yellow-100 text-yellow-800', icon: ExclamationTriangleIcon },
  DOKUMENT: { color: 'bg-purple-100 text-purple-800', icon: DocumentTextIcon },
  KONTRAKT: { color: 'bg-indigo-100 text-indigo-800', icon: DocumentTextIcon },
  BRUKER: { color: 'bg-teal-100 text-teal-800', icon: UserIcon },
  SYSTEM: { color: 'bg-gray-100 text-gray-800', icon: ClockIcon }
};

const alvorlighetsConfig = {
  LAV: 'border-l-gray-400',
  NORMAL: 'border-l-blue-400',
  HØY: 'border-l-yellow-400',
  KRITISK: 'border-l-red-400'
};

export default function BedriftHistorikk() {
  const { bedriftId } = useParams<{ bedriftId: string }>();
  const navigate = useNavigate();
  const [bedrift, setBedrift] = useState<Bedrift | null>(null);
  const [historikk, setHistorikk] = useState<HistorikkEntry[]>([]);
  const [filteredHistorikk, setFilteredHistorikk] = useState<HistorikkEntry[]>([]);
  const [aktivTab, setAktivTab] = useState('alle');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [kategoriFilter, setKategoriFilter] = useState<string>('ALL');
  const [alvorlighetsFilter, setAlvorlighetsFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lastBedriftData();
  }, [bedriftId]);

  const lastBedriftData = async () => {
    try {
      setLoading(true);
      
      // Bruker mock data for utvikling
      const [bedriftData, historikkData] = await Promise.all([
        bedriftHistorikkService.hentMockBedriftDetaljer(),
        bedriftHistorikkService.hentMockBedriftHistorikk()
      ]);
      
      // Konverter service data til lokal format
      const convertedBedrift: Bedrift = {
        id: bedriftData.id,
        navn: bedriftData.navn,
        organisasjonsnummer: bedriftData.organisasjonsnummer,
        status: bedriftData.status
      };

      const convertedHistorikk: HistorikkEntry[] = historikkData.map(item => ({
        id: item.id,
        timestamp: item.dato,
        type: mapServiceTypeToLocal(item.type),
        kategori: mapServiceTypeToKategori(item.type),
        tittel: item.beskrivelse,
        beskrivelse: item.beskrivelse,
        utførtAv: item.bruker,
        detaljer: item.detaljer ? { metadata: item.detaljer } : undefined,
        alvorlighetsgrad: item.viktig ? 'HØY' : 'NORMAL'
      }));
      
      setBedrift(convertedBedrift);
      setHistorikk(convertedHistorikk);
      setFilteredHistorikk(convertedHistorikk);
    } catch (error) {
      console.error('Feil ved lasting av bedrift-data:', error);
    } finally {
      setLoading(false);
    }
  };

  const mapServiceTypeToLocal = (serviceType: ServiceHistorikkEntry['type']): HistorikkEntry['type'] => {
    switch (serviceType) {
      case 'OPPRETTET': return 'OPPRETTET';
      case 'OPPDATERT': return 'OPPDATERT';
      case 'ELEV_LAGT_TIL':
      case 'ELEV_FJERNET': return 'BRUKER';
      case 'KONTRAKT_SIGNERT': return 'KONTRAKT';
      case 'FAKTURA_SENDT':
      case 'BETALING_MOTTATT': return 'DOKUMENT';
      case 'NOTAT_LAGT_TIL': return 'SYSTEM';
      default: return 'SYSTEM';
    }
  };

  const mapServiceTypeToKategori = (serviceType: ServiceHistorikkEntry['type']): HistorikkEntry['kategori'] => {
    switch (serviceType) {
      case 'OPPRETTET':
      case 'OPPDATERT': return 'BEDRIFT';
      case 'ELEV_LAGT_TIL':
      case 'ELEV_FJERNET': return 'ANSATT';
      case 'KONTRAKT_SIGNERT': return 'KONTRAKT';
      case 'FAKTURA_SENDT':
      case 'BETALING_MOTTATT': return 'ØKONOMI';
      case 'NOTAT_LAGT_TIL': return 'SYSTEM';
      default: return 'SYSTEM';
    }
  };

  // Filter funksjoner
  useEffect(() => {
    let filtered = historikk;

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(entry => entry.type === typeFilter);
    }

    if (kategoriFilter !== 'ALL') {
      filtered = filtered.filter(entry => entry.kategori === kategoriFilter);
    }

    if (alvorlighetsFilter !== 'ALL') {
      filtered = filtered.filter(entry => entry.alvorlighetsgrad === alvorlighetsFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.tittel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.beskrivelse.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.utførtAv.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredHistorikk(filtered);
  }, [historikk, typeFilter, kategoriFilter, alvorlighetsFilter, searchTerm]);

  const formatTimestamp = (timestamp: string) => {
    return new Intl.DateTimeFormat('no-NO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const getTypeBadge = (type: HistorikkEntry['type']) => {
    const config = typeConfig[type];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {type}
      </span>
    );
  };

  const exportHistorikk = () => {
    if (!bedrift) return;
    
    const csvContent = [
      'Tidspunkt,Type,Kategori,Tittel,Beskrivelse,Utført av,Alvorlighetsgrad',
      ...filteredHistorikk.map(entry => 
        `${entry.timestamp},${entry.type},${entry.kategori},"${entry.tittel}","${entry.beskrivelse}",${entry.utførtAv},${entry.alvorlighetsgrad}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bedrift-historikk-${bedrift.navn}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!bedrift) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Kunne ikke laste bedrift-data</p>
      </div>
    );
  }

  return (
    <div className="cards-spacing-vertical">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center cards-spacing-grid">
              <button
                onClick={() => navigate(`/bedrifter/${bedriftId}`)}
                className="text-gray-400 hover:text-gray-600"
              >
                ← Tilbake til bedrift
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Historikk - {bedrift.navn}
            </h1>
            <div className="flex items-center cards-spacing-grid mt-2">
              <span className="text-gray-600">Org.nr: {bedrift.organisasjonsnummer}</span>
              <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                {bedrift.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="7d">Siste 7 dager</option>
              <option value="30d">Siste 30 dager</option>
              <option value="90d">Siste 3 måneder</option>
              <option value="1y">Siste år</option>
              <option value="all">Alle</option>
            </select>
            <button 
              onClick={exportHistorikk}
              className="inline-flex items-center gap-2 px-2 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Eksporter
            </button>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 cards-spacing-grid">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <div className="flex items-center">
            <div className="px-2 py-1 bg-blue-100 rounded-lg">
              <ClockSolidIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Totale Hendelser</p>
              <p className="text-2xl font-bold text-gray-900">{filteredHistorikk.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <div className="flex items-center">
            <div className="px-2 py-1 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Denne Uken</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredHistorikk.filter(h => 
                  new Date(h.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <div className="flex items-center">
            <div className="px-2 py-1 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Kritiske</p>
              <p className="text-2xl font-bold text-red-600">
                {filteredHistorikk.filter(h => h.alvorlighetsgrad === 'KRITISK').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <div className="flex items-center">
            <div className="px-2 py-1 bg-purple-100 rounded-lg">
              <UserSolidIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktive Brukere</p>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(filteredHistorikk.map(h => h.utførtAv)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-2" aria-label="Tabs">
            {[
              { id: 'alle', navn: 'Alle Hendelser', ikon: ClockIcon, activeIcon: ClockSolidIcon },
              { id: 'kontrakter', navn: 'Kontrakter', ikon: DocumentTextIcon, activeIcon: DocumentTextSolidIcon },
              { id: 'ansatte', navn: 'Ansatte', ikon: UserIcon, activeIcon: UserSolidIcon },
              { id: 'kritiske', navn: 'Kritiske', ikon: ExclamationTriangleIcon }
            ].map((tab) => {
              const Icon = aktivTab === tab.id && tab.activeIcon ? tab.activeIcon : tab.ikon;
              const count = tab.id === 'alle' ? filteredHistorikk.length :
                           tab.id === 'kontrakter' ? filteredHistorikk.filter(h => h.kategori === 'KONTRAKT').length :
                           tab.id === 'ansatte' ? filteredHistorikk.filter(h => h.kategori === 'ANSATT').length :
                           filteredHistorikk.filter(h => h.alvorlighetsgrad === 'KRITISK').length;
              
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
                  <span className="ml-1 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="px-2 py-1">
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-5 cards-spacing-grid">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Søk i historikk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm"
              />
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="ALL">Alle typer</option>
              <option value="OPPRETTET">Opprettet</option>
              <option value="OPPDATERT">Oppdatert</option>
              <option value="STATUSENDRET">Statusendret</option>
              <option value="DOKUMENT">Dokument</option>
              <option value="KONTRAKT">Kontrakt</option>
              <option value="BRUKER">Bruker</option>
              <option value="SYSTEM">System</option>
            </select>

            <select
              value={kategoriFilter}
              onChange={(e) => setKategoriFilter(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="ALL">Alle kategorier</option>
              <option value="BEDRIFT">Bedrift</option>
              <option value="ANSATT">Ansatt</option>
              <option value="KONTRAKT">Kontrakt</option>
              <option value="KJØRETØY">Kjøretøy</option>
              <option value="ØKONOMI">Økonomi</option>
              <option value="SIKKERHET">Sikkerhet</option>
              <option value="SYSTEM">System</option>
            </select>

            <select
              value={alvorlighetsFilter}
              onChange={(e) => setAlvorlighetsFilter(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="ALL">Alle alvorlighetsgrader</option>
              <option value="KRITISK">Kritisk</option>
              <option value="HØY">Høy</option>
              <option value="NORMAL">Normal</option>
              <option value="LAV">Lav</option>
            </select>

            <div className="text-sm text-gray-500 flex items-center">
              <FunnelIcon className="w-4 h-4 mr-1" />
              {filteredHistorikk.length} hendelser
            </div>
          </div>

          {/* Timeline */}
          <div className="flow-root">
            <ul className="-mb-8">
              {filteredHistorikk.map((entry, entryIndex) => (
                <li key={entry.id}>
                  <div className="relative pb-8">
                    {entryIndex !== filteredHistorikk.length - 1 ? (
                      <span className="absolute topx-2 py-1 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    ) : null}
                    <div className={`relative bg-white border-l-4 ${alvorlighetsConfig[entry.alvorlighetsgrad]} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`}>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            entry.alvorlighetsgrad === 'KRITISK' ? 'bg-red-500' : 
                            entry.alvorlighetsgrad === 'HØY' ? 'bg-yellow-500' : 
                            entry.alvorlighetsgrad === 'NORMAL' ? 'bg-blue-500' : 'bg-gray-500'
                          }`}>
                            <ClockIcon className="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getTypeBadge(entry.type)}
                              <span className="text-xs text-gray-500">{entry.kategori}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatTimestamp(entry.timestamp)}
                            </div>
                          </div>
                          <div className="mt-2">
                            <h4 className="text-base font-medium text-gray-900">{entry.tittel}</h4>
                            <p className="text-sm text-gray-600 mt-1">{entry.beskrivelse}</p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <UserIcon className="w-4 h-4 mr-1" />
                            <span>Utført av: {entry.utførtAv}</span>
                          </div>
                          
                          {entry.relaterteObjekter && entry.relaterteObjekter.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs text-gray-500 mb-1">Relaterte objekter:</p>
                              <div className="flex flex-wrap gap-1">
                                {entry.relaterteObjekter.map((obj, index) => (
                                  <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                    {obj.type}: {obj.navn}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {entry.detaljer && (
                            <div className="mt-3 bg-gray-50 rounded-lg px-2 py-1">
                              <button onClick={() => console.log('Vis dokument')} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                <EyeIcon className="w-4 h-4" />
                                Vis detaljer
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {filteredHistorikk.length === 0 && (
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen historikk funnet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Prøv å justere filtrene for å se flere resultater.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}