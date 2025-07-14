import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChartBarIcon,
  CogIcon,
  PhotoIcon,
  BookOpenIcon,
  TagIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  CloudArrowUpIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  AdjustmentsHorizontalIcon,
  BoltIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

// =====================================================================
// INTERFACES - Optimalisert for skalering
// =====================================================================

interface BaseEntity {
  id: string;
  opprettetDato: string;
  sistEndret: string;
  opprettetAv: string;
  status: 'aktiv' | 'utkast' | 'arkivert';
}

interface Sporsmal extends BaseEntity {
  tekst: string;
  kategoriId: string;
  vanskelighetsgrad: 'lett' | 'medium' | 'vanskelig';
  type: 'multiple_choice' | 'sant_usant' | 'fyllfinn';
  alternativer: string[];
  riktigSvar: string | number;
  forklaring: string;
  mediaId?: string;
  tags: string[];
  antallBruk: number;
  gjennomsnittScore: number;
  estimertTid: number; // sekunder
}

interface MediaFil extends BaseEntity {
  navn: string;
  type: 'bilde' | 'video' | 'lyd' | 'dokument';
  url: string;
  storrelse: number; // bytes
  kategoriId?: string;
  bruktISporsmal: number;
  beskrivelse?: string;
  tags: string[];
  altTekst?: string;
  thumbnailUrl?: string;
  komprimertUrl?: string;
}

interface Kategori extends BaseEntity {
  navn: string;
  beskrivelse: string;
  farge: string;
  ikon: string;
  antallSporsmal: number;
  vanskelighetsgrad: 'blandet' | 'lett' | 'medium' | 'vanskelig';
  parentId?: string;
  sortering: number;
  anbefaltTid: number; // minutter
}

interface PaginationConfig {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface FilterConfig {
  sokeTerm: string;
  kategoriId: string;
  status: string;
  vanskelighetsgrad: string;
  type: string;
  mediaType: string;
  dateRange: { from: string; to: string };
  tags: string[];
}

// =====================================================================
// MAIN COMPONENT
// =====================================================================

export default function AdminQuizUltimate() {
  // =====================================================================
  // STATE MANAGEMENT - Optimalisert for performance
  // =====================================================================
  
  const [aktivTab, setAktivTab] = useState<'dashboard' | 'sporsmal' | 'media' | 'kategorier' | 'bulk'>('dashboard');
  const [visningsModus, setVisningsModus] = useState<'rutenett' | 'liste' | 'kompakt'>('kompakt');
  const [lasterData, setLasterData] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Pagination for skalering
  const [sporsmalPagination, setSporsmalPagination] = useState<PaginationConfig>({
    page: 1, pageSize: 50, totalItems: 0, totalPages: 0
  });
  const [mediaPagination, setMediaPagination] = useState<PaginationConfig>({
    page: 1, pageSize: 25, totalItems: 0, totalPages: 0
  });
  
  // Avanserte filtre
  const [filter, setFilter] = useState<FilterConfig>({
    sokeTerm: '',
    kategoriId: 'alle',
    status: 'alle',
    vanskelighetsgrad: 'alle',
    type: 'alle',
    mediaType: 'alle',
    dateRange: { from: '', to: '' },
    tags: []
  });
  
  // Data - Mockdata for demo (ville blitt hentet fra API)
  const [sporsmal, setSporsmal] = useState<Sporsmal[]>([]);
  const [mediaFiler, setMediaFiler] = useState<MediaFil[]>([]);
  const [kategorier, setKategorier] = useState<Kategori[]>([
    {
      id: '1',
      navn: 'Trafikkregler',
      beskrivelse: 'Grunnleggende trafikkregler og bestemmelser',
      farge: 'blue',
      ikon: 'BookOpenIcon',
      antallSporsmal: 450,
      vanskelighetsgrad: 'blandet',
      sortering: 1,
      anbefaltTid: 15,
      opprettetDato: '2024-01-01',
      sistEndret: '2024-01-15',
      opprettetAv: 'System',
      status: 'aktiv'
    },
    {
      id: '2',
      navn: 'Sikkerhet',
      beskrivelse: 'Trafikksikkerhet og førstehjelp',
      farge: 'red',
      ikon: 'ExclamationTriangleIcon',
      antallSporsmal: 320,
      vanskelighetsgrad: 'medium',
      sortering: 2,
      anbefaltTid: 12,
      opprettetDato: '2024-01-01',
      sistEndret: '2024-01-12',
      opprettetAv: 'System',
      status: 'aktiv'
    },
    {
      id: '3',
      navn: 'Kjøreteknikk',
      beskrivelse: 'Avanserte kjøreteknikker og kjøretøyskunnskap',
      farge: 'green',
      ikon: 'CpuChipIcon',
      antallSporsmal: 280,
      vanskelighetsgrad: 'vanskelig',
      sortering: 3,
      anbefaltTid: 20,
      opprettetDato: '2024-01-01',
      sistEndret: '2024-01-10',
      opprettetAv: 'System',
      status: 'aktiv'
    }
  ]);
  
  const [modaler, setModaler] = useState({
    nyttSporsmal: false,
    nyMedia: false,
    nyKategori: false,
    bulkHandlinger: false,
    avansertSok: false
  });

  // =====================================================================
  // COMPUTED VALUES - Optimalisert med useMemo
  // =====================================================================
  
  const statistikk = useMemo(() => ({
    totalSporsmal: 2850, // Ville blitt beregnet fra faktiske data
    totalMedia: 1200,
    totalKategorier: kategorier.length,
    aktivSporsmal: 2640,
    arkivertSporsmal: 210,
    gjennomsnittScore: 87.5,
    popularesteKategori: 'Trafikkregler',
    lagringsPlassBrukt: '4.2 GB',
    lagringsPlassTilgjengelig: '15.8 GB'
  }), [kategorier]);
  
  const filtrertData = useMemo(() => {
    // I produksjon ville dette vært server-side filtrering og paginering
    return {
      sporsmal: sporsmal.slice(0, sporsmalPagination.pageSize),
      media: mediaFiler.slice(0, mediaPagination.pageSize)
    };
  }, [sporsmal, mediaFiler, sporsmalPagination, mediaPagination, filter]);

  // =====================================================================
  // EVENT HANDLERS
  // =====================================================================
  
  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} på ${selectedItems.length} elementer`);
    if (action === 'slett') {
      // Bulk sletting
      setSporsmal(prev => prev.filter(s => !selectedItems.includes(s.id)));
      setMediaFiler(prev => prev.filter(m => !selectedItems.includes(m.id)));
    }
    setSelectedItems([]);
  };
  
  const handleItemSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };
  
  const handleSelectAll = () => {
    if (aktivTab === 'sporsmal') {
      setSelectedItems(filtrertData.sporsmal.map(s => s.id));
    } else if (aktivTab === 'media') {
      setSelectedItems(filtrertData.media.map(m => m.id));
    }
  };

  // =====================================================================
  // UTILITY FUNCTIONS
  // =====================================================================
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aktiv': return 'bg-green-100 text-green-800';
      case 'utkast': return 'bg-yellow-100 text-yellow-800';
      case 'arkivert': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getVanskelighetsColor = (grad: string) => {
    switch (grad) {
      case 'lett': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'vanskelig': return 'bg-red-100 text-red-800';
      case 'blandet': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // =====================================================================
  // RENDER COMPONENTS
  // =====================================================================
  
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Totalt spørsmål</p>
              <p className="text-2xl font-bold">{statistikk.totalSporsmal.toLocaleString()}</p>
            </div>
            <BookOpenIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Media filer</p>
              <p className="text-2xl font-bold">{statistikk.totalMedia.toLocaleString()}</p>
            </div>
            <PhotoIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kategorier</p>
              <p className="text-2xl font-bold">{statistikk.totalKategorier}</p>
            </div>
            <TagIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Lagringsbruk</p>
              <p className="text-2xl font-bold">{statistikk.lagringsPlassBrukt}</p>
            </div>
            <CpuChipIcon className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Hurtighandlinger</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setModaler(prev => ({ ...prev, nyttSporsmal: true }))}
            className="flex items-center justify-center p-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2 text-blue-500" />
            <span className="text-blue-700">Nytt spørsmål</span>
          </button>
          
          <button
            onClick={() => setModaler(prev => ({ ...prev, nyMedia: true }))}
            className="flex items-center justify-center p-3 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <CloudArrowUpIcon className="w-5 h-5 mr-2 text-purple-500" />
            <span className="text-purple-700">Last opp media</span>
          </button>
          
          <button
            onClick={() => setModaler(prev => ({ ...prev, nyKategori: true }))}
            className="flex items-center justify-center p-3 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <TagIcon className="w-5 h-5 mr-2 text-green-500" />
            <span className="text-green-700">Ny kategori</span>
          </button>
          
          <button
            onClick={() => setModaler(prev => ({ ...prev, bulkHandlinger: true }))}
            className="flex items-center justify-center p-3 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
          >
            <BoltIcon className="w-5 h-5 mr-2 text-orange-500" />
            <span className="text-orange-700">Bulk-operasjoner</span>
          </button>
        </div>
      </div>

      {/* Kategorioversikt - Minimalistisk */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Kategorier</h3>
          <button 
            onClick={() => setAktivTab('kategorier')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Administrer alle →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kategorier.slice(0, 6).map(kategori => (
            <div key={kategori.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-3 h-3 rounded-full bg-${kategori.farge}-500`}></div>
                <span className={`px-2 py-1 text-xs rounded-full ${getVanskelighetsColor(kategori.vanskelighetsgrad)}`}>
                  {kategori.vanskelighetsgrad}
                </span>
              </div>
              <h4 className="font-medium text-sm mb-1">{kategori.navn}</h4>
              <p className="text-xs text-gray-600 mb-2">{kategori.beskrivelse}</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{kategori.antallSporsmal} spørsmål</span>
                <span>{kategori.anbefaltTid} min</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSporsmalTabell = () => (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Spørsmål ({statistikk.totalSporsmal.toLocaleString()})
          </h3>
          <div className="flex items-center space-x-2">
            {bulkMode && selectedItems.length > 0 && (
              <div className="flex items-center space-x-2 mr-4">
                <span className="text-sm text-gray-600">{selectedItems.length} valgt</span>
                <button
                  onClick={() => handleBulkAction('slett')}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                >
                  Slett valgte
                </button>
              </div>
            )}
            <button
              onClick={() => setBulkMode(!bulkMode)}
              className={`px-3 py-1 rounded text-sm ${bulkMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
            >
              {bulkMode ? 'Avbryt bulk' : 'Bulk-modus'}
            </button>
            <button
              onClick={() => setModaler(prev => ({ ...prev, nyttSporsmal: true }))}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Nytt
            </button>
          </div>
        </div>
        
        {/* Kompakt søk og filter */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Søk i spørsmål..."
              value={filter.sokeTerm}
              onChange={(e) => setFilter(prev => ({ ...prev, sokeTerm: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
          
          <select
            value={filter.kategoriId}
            onChange={(e) => setFilter(prev => ({ ...prev, kategoriId: e.target.value }))}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="alle">Alle kategorier</option>
            {kategorier.map(k => (
              <option key={k.id} value={k.id}>{k.navn}</option>
            ))}
          </select>
          
          <select
            value={filter.vanskelighetsgrad}
            onChange={(e) => setFilter(prev => ({ ...prev, vanskelighetsgrad: e.target.value }))}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="alle">Alle vanskelighetsgrader</option>
            <option value="lett">Lett</option>
            <option value="medium">Medium</option>
            <option value="vanskelig">Vanskelig</option>
          </select>
        </div>
      </div>

      {/* Tabellhode */}
      <div className="grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 text-sm font-medium text-gray-700">
        {bulkMode && (
          <div className="col-span-1">
            <input
              type="checkbox"
              onChange={handleSelectAll}
              className="rounded border-gray-300"
            />
          </div>
        )}
        <div className={bulkMode ? "col-span-5" : "col-span-6"}>Spørsmål</div>
        <div className="col-span-2">Kategori</div>
        <div className="col-span-2">Vanskelighet</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-1">Handlinger</div>
      </div>

      {/* Spørsmålsrader - Kompakte */}
      <div className="divide-y">
        {[...Array(10)].map((_, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors">
            {bulkMode && (
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(`sporsmal-${index}`)}
                  onChange={() => handleItemSelect(`sporsmal-${index}`)}
                  className="rounded border-gray-300"
                />
              </div>
            )}
            <div className={bulkMode ? "col-span-5" : "col-span-6"}>
              <div className="text-sm font-medium text-gray-900 line-clamp-2">
                Hva betyr et rødt trafikklys i et lyskryss? Dette er et eksempel på et lengre spørsmål som kan strekke seg over flere linjer.
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Brukt {Math.floor(Math.random() * 100) + 50} ganger • {Math.floor(Math.random() * 30) + 70}% score
              </div>
            </div>
            <div className="col-span-2">
              <span className="text-sm text-gray-900">Trafikkregler</span>
            </div>
            <div className="col-span-2">
              <span className={`px-2 py-1 text-xs rounded-full ${getVanskelighetsColor(['lett', 'medium', 'vanskelig'][Math.floor(Math.random() * 3)])}`}>
                {['lett', 'medium', 'vanskelig'][Math.floor(Math.random() * 3)]}
              </span>
            </div>
            <div className="col-span-1">
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor('aktiv')}`}>
                aktiv
              </span>
            </div>
            <div className="col-span-1">
              <div className="flex items-center space-x-1">
                <button className="p-1 hover:bg-gray-200 rounded">
                  <EyeIcon className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <PencilIcon className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <TrashIcon className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginering */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Viser 1-50 av {statistikk.totalSporsmal.toLocaleString()} spørsmål
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50" disabled>
              Forrige
            </button>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">1</span>
            <button className="px-3 py-1 border rounded text-sm hover:bg-gray-100">
              Neste
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMediaBibliotek = () => (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Mediabibliotek ({statistikk.totalMedia.toLocaleString()} filer)
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{statistikk.lagringsPlassBrukt} brukt</span>
            <button
              onClick={() => setModaler(prev => ({ ...prev, nyMedia: true }))}
              className="flex items-center px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
            >
              <CloudArrowUpIcon className="w-4 h-4 mr-1" />
              Last opp
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Søk i mediabiblioteket..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
          <select className="px-3 py-2 border rounded-lg text-sm">
            <option value="alle">Alle typer</option>
            <option value="bilde">Bilder</option>
            <option value="video">Videoer</option>
            <option value="lyd">Lyd</option>
            <option value="dokument">Dokumenter</option>
          </select>
        </div>
      </div>

      {/* Media grid - Kompakt */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {[...Array(24)].map((_, index) => (
            <div key={index} className="border rounded-lg p-2 hover:shadow-sm transition-shadow group">
              <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center">
                <PhotoIcon className="w-8 h-8 text-gray-400" />
              </div>
              <div className="text-xs">
                <div className="font-medium truncate">bilde_{index + 1}.jpg</div>
                <div className="text-gray-500">245 KB</div>
                <div className="text-gray-500">Brukt {Math.floor(Math.random() * 20)} ganger</div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                <div className="flex items-center justify-center space-x-1">
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <EyeIcon className="w-3 h-3 text-gray-600" />
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <PencilIcon className="w-3 h-3 text-gray-600" />
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <TrashIcon className="w-3 h-3 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderKategorierMinimalistisk = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Kategoristyring</h3>
          <button
            onClick={() => setModaler(prev => ({ ...prev, nyKategori: true }))}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Ny kategori
          </button>
        </div>
        
        {/* Kompakt søk */}
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Søk kategorier..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Minimalistisk kategoriliste */}
      <div className="bg-white rounded-lg border">
        <div className="divide-y">
          {kategorier.map(kategori => (
            <div key={kategori.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full bg-${kategori.farge}-500`}></div>
                  <div>
                    <h4 className="font-medium text-gray-900">{kategori.navn}</h4>
                    <p className="text-sm text-gray-600">{kategori.beskrivelse}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{kategori.antallSporsmal}</div>
                    <div className="text-xs text-gray-500">spørsmål</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{kategori.anbefaltTid}</div>
                    <div className="text-xs text-gray-500">min</div>
                  </div>
                  
                  <span className={`px-2 py-1 text-xs rounded-full ${getVanskelighetsColor(kategori.vanskelighetsgrad)}`}>
                    {kategori.vanskelighetsgrad}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <PencilIcon className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <TrashIcon className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // =====================================================================
  // MAIN RENDER
  // =====================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/quiz" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Tilbake til Quiz
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Quiz Admin</h1>
              <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                Ultimate Edition
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <CogIcon className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <ChartBarIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Navigation tabs */}
          <div className="flex items-center space-x-6 mt-4">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
              { id: 'sporsmal', label: 'Spørsmål', icon: BookOpenIcon },
              { id: 'media', label: 'Media', icon: PhotoIcon },
              { id: 'kategorier', label: 'Kategorier', icon: TagIcon },
              { id: 'bulk', label: 'Bulk-operasjoner', icon: BoltIcon }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setAktivTab(tab.id as any)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    aktivTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-6">
        {aktivTab === 'dashboard' && renderDashboard()}
        {aktivTab === 'sporsmal' && renderSporsmalTabell()}
        {aktivTab === 'media' && renderMediaBibliotek()}
        {aktivTab === 'kategorier' && renderKategorierMinimalistisk()}
        {aktivTab === 'bulk' && (
          <div className="text-center py-12">
            <BoltIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Bulk-operasjoner</h3>
            <p className="text-gray-600">Kraftige verktøy for massehåndtering kommer her</p>
          </div>
        )}
      </div>
    </div>
  );
} 