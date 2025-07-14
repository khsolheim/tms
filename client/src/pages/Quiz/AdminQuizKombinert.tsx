import React, { useState, useEffect } from 'react';
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
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import {
  PlusIcon as PlusSolid,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/solid';

// Interfaces optimalisert for skalering
interface Sporsmal {
  id: string;
  tekst: string;
  kategoriId: string;
  vanskelighetsgrad: 'lett' | 'medium' | 'vanskelig';
  type: 'multiple_choice' | 'sant_usant' | 'fyllfinn';
  alternativer: string[];
  riktigSvar: string | number;
  forklaring: string;
  mediaIds: string[];
  tags: string[];
  opprettetAv: string;
  opprettetDato: string;
  sistEndret: string;
  status: 'aktiv' | 'utkast' | 'arkivert';
  antallBruk: number;
  gjennomsnittScore: number;
}

interface MediaFil {
  id: string;
  navn: string;
  type: 'bilde' | 'video' | 'lyd' | 'dokument';
  url: string;
  storrelse: string;
  opprettetDato: string;
  kategorier: string[];
  bruktISporsmal: number;
  beskrivelse?: string;
  tags: string[];
  alt_tekst?: string;
  thumbnail?: string;
}

interface Kategori {
  id: string;
  navn: string;
  beskrivelse: string;
  farge: string;
  ikon: string;
  antallSporsmal: number;
  vanskelighetsgrad: 'blandet' | 'lett' | 'medium' | 'vanskelig';
  sistOppdatert: string;
  aktiv: boolean;
  parent?: string;
}

interface FilterState {
  sok: string;
  kategori: string;
  vanskelighet: string;
  status: string;
  type: string;
  dateRange: { from: string; to: string };
}

export default function AdminQuizKombinert() {
  const [aktivTab, setAktivTab] = useState<'sporsmal' | 'media' | 'kategorier' | 'statistikk'>('sporsmal');
  const [visning, setVisning] = useState<'grid' | 'list'>('grid');
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [filter, setFilter] = useState<FilterState>({
    sok: '',
    kategori: '',
    vanskelighet: '',
    status: '',
    type: '',
    dateRange: { from: '', to: '' }
  });

  // Mock data - optimalisert for demonstrasjon av skalering
  const [sporsmal] = useState<Sporsmal[]>([
    {
      id: '1',
      tekst: 'Hva er hovedformålet med verneombud på arbeidsplassen?',
      kategoriId: 'hms',
      vanskelighetsgrad: 'lett',
      type: 'multiple_choice',
      alternativer: ['Kontrollere ansatte', 'Ivareta sikkerhet og helse', 'Øke produktiviteten', 'Redusere kostnader'],
      riktigSvar: 1,
      forklaring: 'Verneombud har ansvar for å ivareta de ansattes sikkerhet og helse.',
      mediaIds: ['img1'],
      tags: ['verneombud', 'hms', 'sikkerhet'],
      opprettetAv: 'admin',
      opprettetDato: '2024-01-15',
      sistEndret: '2024-01-20',
      status: 'aktiv',
      antallBruk: 245,
      gjennomsnittScore: 87
    },
    {
      id: '2',
      tekst: 'Hvor ofte skal risikovurdering gjennomføres?',
      kategoriId: 'risikovurdering',
      vanskelighetsgrad: 'medium',
      type: 'multiple_choice',
      alternativer: ['Månedlig', 'Årlig', 'Ved endringer eller jevnlig', 'Aldri'],
      riktigSvar: 2,
      forklaring: 'Risikovurdering skal gjennomføres ved endringer i arbeidsmiljøet og jevnlig.',
      mediaIds: [],
      tags: ['risikovurdering', 'systematisk'],
      opprettetAv: 'admin',
      opprettetDato: '2024-01-16',
      sistEndret: '2024-01-22',
      status: 'aktiv',
      antallBruk: 189,
      gjennomsnittScore: 73
    }
  ]);

  const [mediaFiler] = useState<MediaFil[]>([
    {
      id: 'img1',
      navn: 'verneombud_illustrasjon.jpg',
      type: 'bilde',
      url: '/media/verneombud.jpg',
      storrelse: '2.3 MB',
      opprettetDato: '2024-01-15',
      kategorier: ['hms'],
      bruktISporsmal: 5,
      beskrivelse: 'Illustrasjon av verneombud på arbeidsplassen',
      tags: ['verneombud', 'illustrasjon'],
      alt_tekst: 'Verneombud i gul hjelm på byggeplass',
      thumbnail: '/media/thumbnails/verneombud_thumb.jpg'
    },
    {
      id: 'video1',
      navn: 'sikkerhetsprosedyrer.mp4',
      type: 'video',
      url: '/media/sikkerhet.mp4',
      storrelse: '15.7 MB',
      opprettetDato: '2024-01-18',
      kategorier: ['sikkerhet'],
      bruktISporsmal: 3,
      beskrivelse: 'Video om grunnleggende sikkerhetsprosedyrer',
      tags: ['video', 'opplæring'],
      alt_tekst: 'Sikkerhetsvideo',
      thumbnail: '/media/thumbnails/sikkerhet_thumb.jpg'
    }
  ]);

  const [kategorier] = useState<Kategori[]>([
    {
      id: 'hms',
      navn: 'HMS og Sikkerhet',
      beskrivelse: 'Helse, miljø og sikkerhet på arbeidsplassen',
      farge: 'red',
      ikon: 'shield',
      antallSporsmal: 156,
      vanskelighetsgrad: 'blandet',
      sistOppdatert: '2024-01-22',
      aktiv: true
    },
    {
      id: 'risikovurdering',
      navn: 'Risikovurdering',
      beskrivelse: 'Systematisk risikovurdering og tiltak',
      farge: 'orange',
      ikon: 'exclamation',
      antallSporsmal: 89,
      vanskelighetsgrad: 'medium',
      sistOppdatert: '2024-01-20',
      aktiv: true
    },
    {
      id: 'ergonomi',
      navn: 'Ergonomi',
      beskrivelse: 'Ergonomiske prinsipper og arbeidsplassutforming',
      farge: 'blue',
      ikon: 'user',
      antallSporsmal: 67,
      vanskelighetsgrad: 'lett',
      sistOppdatert: '2024-01-19',
      aktiv: true
    }
  ]);

  const [statistikk] = useState({
    totalSporsmal: 3247,
    aktivSporsmal: 2891,
    totalMedia: 486,
    mediaStorrelse: 1247.5,
    totalKategorier: 23,
    gjennomsnittScore: 78.4
  });

  // Filtrering optimalisert for store datasett
  const filtrerData = (data: any[], type: string) => {
    if (!filter.sok && !filter.kategori && !filter.vanskelighet && !filter.status && !filter.type) {
      return data;
    }

    return data.filter(item => {
      const matchSok = !filter.sok || 
        item.tekst?.toLowerCase().includes(filter.sok.toLowerCase()) ||
        item.navn?.toLowerCase().includes(filter.sok.toLowerCase()) ||
        item.beskrivelse?.toLowerCase().includes(filter.sok.toLowerCase());
      
      const matchKategori = !filter.kategori || 
        item.kategoriId === filter.kategori ||
        item.kategorier?.includes(filter.kategori);
      
      const matchVanskelighet = !filter.vanskelighet || 
        item.vanskelighetsgrad === filter.vanskelighet;
      
      const matchStatus = !filter.status || 
        item.status === filter.status ||
        (filter.status === 'aktiv' && item.aktiv === true);
      
      const matchType = !filter.type || item.type === filter.type;

      return matchSok && matchKategori && matchVanskelighet && matchStatus && matchType;
    });
  };

  // Bulk actions for skalering
  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) return;
    
    setLoading(true);
    try {
      switch (action) {
        case 'delete':
          console.log('Sletter elementer:', selectedItems);
          break;
        case 'archive':
          console.log('Arkiverer elementer:', selectedItems);
          break;
        case 'activate':
          console.log('Aktiverer elementer:', selectedItems);
          break;
        case 'export':
          console.log('Eksporterer elementer:', selectedItems);
          break;
      }
      setSelectedItems([]);
      setBulkMode(false);
    } catch (error) {
      console.error('Feil ved bulk-operasjon:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Header med optimaliserte kontroller
  const HeaderComponent = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/quiz" className="text-gray-500 hover:text-gray-700">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Quiz Administrasjon</h1>
          <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {aktivTab === 'sporsmal' && `${sporsmal.length} spørsmål`}
            {aktivTab === 'media' && `${mediaFiler.length} filer`}
            {aktivTab === 'kategorier' && `${kategorier.length} kategorier`}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Bulk mode toggle */}
          <button
            onClick={() => setBulkMode(!bulkMode)}
            className={`px-3 py-2 text-sm rounded ${
              bulkMode 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            } hover:bg-blue-50 transition-colors`}
          >
            Bulk-modus
          </button>

          {/* View toggle */}
          <div className="flex border border-gray-300 rounded">
            <button
              onClick={() => setVisning('grid')}
              className={`p-2 ${
                visning === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-white text-gray-400'
              } hover:bg-blue-50 transition-colors`}
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVisning('list')}
              className={`p-2 ${
                visning === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-white text-gray-400'
              } hover:bg-blue-50 transition-colors`}
            >
              <ListBulletIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <PlusIcon className="w-4 h-4" />
            <span>Ny {aktivTab === 'sporsmal' ? 'Spørsmål' : aktivTab === 'media' ? 'Media' : 'Kategori'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mt-4">
        {[
          { key: 'sporsmal', label: 'Spørsmål', icon: BookOpenIcon },
          { key: 'media', label: 'Media', icon: PhotoIcon },
          { key: 'kategorier', label: 'Kategorier', icon: TagIcon },
          { key: 'statistikk', label: 'Statistikk', icon: ChartBarIcon }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setAktivTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded ${
                aktivTab === tab.key
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              } transition-colors`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Filter component med avanserte søkefiltre
  const FilterComponent = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center space-x-4">
        {/* Søk */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Søk i ${aktivTab}...`}
            value={filter.sok}
            onChange={(e) => setFilter(prev => ({ ...prev, sok: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Kategori filter */}
        {aktivTab !== 'kategorier' && (
          <select
            value={filter.kategori}
            onChange={(e) => setFilter(prev => ({ ...prev, kategori: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle kategorier</option>
            {kategorier.map(kat => (
              <option key={kat.id} value={kat.id}>{kat.navn}</option>
            ))}
          </select>
        )}

        {/* Vanskelighetsgrad filter */}
        {aktivTab === 'sporsmal' && (
          <select
            value={filter.vanskelighet}
            onChange={(e) => setFilter(prev => ({ ...prev, vanskelighet: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle nivåer</option>
            <option value="lett">Lett</option>
            <option value="medium">Medium</option>
            <option value="vanskelig">Vanskelig</option>
          </select>
        )}

        {/* Status filter */}
        <select
          value={filter.status}
          onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Alle statuser</option>
          <option value="aktiv">Aktiv</option>
          <option value="utkast">Utkast</option>
          <option value="arkivert">Arkivert</option>
        </select>

        {/* Type filter for media */}
        {aktivTab === 'media' && (
          <select
            value={filter.type}
            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle typer</option>
            <option value="bilde">Bilder</option>
            <option value="video">Videoer</option>
            <option value="lyd">Lyd</option>
            <option value="dokument">Dokumenter</option>
          </select>
        )}

        {/* Bulk actions */}
        {bulkMode && selectedItems.length > 0 && (
          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded border border-blue-200">
            <span className="text-sm text-blue-700">{selectedItems.length} valgt</span>
            <button
              onClick={() => handleBulkAction('activate')}
              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
            >
              Aktiver
            </button>
            <button
              onClick={() => handleBulkAction('archive')}
              className="text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700"
            >
              Arkiver
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
            >
              Slett
            </button>
          </div>
        )}

        {/* Clear filters */}
        {(filter.sok || filter.kategori || filter.vanskelighet || filter.status || filter.type) && (
          <button
            onClick={() => setFilter({ sok: '', kategori: '', vanskelighet: '', status: '', type: '', dateRange: { from: '', to: '' } })}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Nullstill filtre
          </button>
        )}
      </div>
    </div>
  );

  // Spørsmål-innhold med grid/list visning
  const SporsmalContent = () => {
    const filtrertSporsmal = filtrerData(sporsmal, 'sporsmal');
    
    if (visning === 'list') {
      return (
        <div className="p-4">
          <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {bulkMode && <th className="px-4 py-3 text-left w-8"></th>}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spørsmål</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nivå</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statistikk</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Handlinger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtrertSporsmal.map(sp => (
                  <tr key={sp.id} className="hover:bg-gray-50">
                    {bulkMode && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(sp.id)}
                          onChange={() => handleItemSelect(sp.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 max-w-md truncate">
                        {sp.tekst}
                      </div>
                      <div className="text-xs text-gray-500">{sp.type}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {kategorier.find(k => k.id === sp.kategoriId)?.navn}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded ${
                        sp.vanskelighetsgrad === 'lett' ? 'bg-green-100 text-green-800' :
                        sp.vanskelighetsgrad === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {sp.vanskelighetsgrad}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded ${
                        sp.status === 'aktiv' ? 'bg-green-100 text-green-800' :
                        sp.status === 'utkast' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {sp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <div>{sp.antallBruk} bruk</div>
                      <div>{sp.gjennomsnittScore}% score</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button className="text-gray-400 hover:text-blue-600 transition-colors">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-green-600 transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600 transition-colors">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {filtrertSporsmal.map(sp => (
            <div
              key={sp.id}
              className="bg-white border border-gray-200 rounded p-3 hover:shadow-sm transition-shadow"
            >
              {bulkMode && (
                <div className="mb-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(sp.id)}
                    onChange={() => handleItemSelect(sp.id)}
                    className="rounded border-gray-300"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 text-xs rounded ${
                  sp.vanskelighetsgrad === 'lett' ? 'bg-green-100 text-green-800' :
                  sp.vanskelighetsgrad === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {sp.vanskelighetsgrad}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded ${
                  sp.status === 'aktiv' ? 'bg-green-100 text-green-800' :
                  sp.status === 'utkast' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {sp.status}
                </span>
              </div>
              
              <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-3">
                {sp.tekst}
              </h3>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>{sp.type}</span>
                <span>{sp.antallBruk} bruk</span>
              </div>
              
              <div className="flex space-x-1">
                <button className="flex-1 text-xs text-gray-400 hover:text-blue-600 transition-colors py-1">
                  <EyeIcon className="w-3 h-3 mx-auto" />
                </button>
                <button className="flex-1 text-xs text-gray-400 hover:text-green-600 transition-colors py-1">
                  <PencilIcon className="w-3 h-3 mx-auto" />
                </button>
                <button className="flex-1 text-xs text-gray-400 hover:text-red-600 transition-colors py-1">
                  <TrashIcon className="w-3 h-3 mx-auto" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Media-innhold med optimalisert thumbnail-visning
  const MediaContent = () => {
    const filtrertMedia = filtrerData(mediaFiler, 'media');
    
    return (
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3">
          {filtrertMedia.map(media => (
            <div
              key={media.id}
              className="bg-white border border-gray-200 rounded p-2 hover:shadow-sm transition-shadow"
            >
              {bulkMode && (
                <div className="mb-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(media.id)}
                    onChange={() => handleItemSelect(media.id)}
                    className="rounded border-gray-300"
                  />
                </div>
              )}
              
              <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center">
                {media.type === 'bilde' ? (
                  <img
                    src={media.thumbnail || media.url}
                    alt={media.alt_tekst}
                    className="w-full h-full object-cover rounded"
                    loading="lazy"
                  />
                ) : (
                  <PhotoIcon className="w-6 h-6 text-gray-400" />
                )}
              </div>
              
              <div className="text-xs font-medium text-gray-900 truncate mb-1">
                {media.navn}
              </div>
              
              <div className="text-xs text-gray-500 mb-1">
                {media.storrelse}
              </div>
              
              <div className="text-xs text-gray-500">
                {media.bruktISporsmal} bruk
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Minimalistisk kategori-innhold
  const KategoriContent = () => {
    const filtrertKategorier = filtrerData(kategorier, 'kategorier');
    
    return (
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {filtrertKategorier.map(kategori => (
            <div
              key={kategori.id}
              className="bg-white border border-gray-200 rounded p-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-3 h-3 rounded-full bg-${kategori.farge}-500`}></div>
                <span className={`px-2 py-0.5 text-xs rounded ${
                  kategori.aktiv ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {kategori.aktiv ? 'Aktiv' : 'Inaktiv'}
                </span>
              </div>
              
              <h3 className="font-medium text-gray-900 text-sm mb-1">
                {kategori.navn}
              </h3>
              
              <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                {kategori.beskrivelse}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{kategori.antallSporsmal} spørsmål</span>
                <span>{kategori.sistOppdatert}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Statistikk med fokus på skalering og performance
  const StatistikkContent = () => (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded p-4">
          <div className="text-2xl font-bold text-gray-900">{statistikk.totalSporsmal}</div>
          <div className="text-sm text-gray-500">Totalt spørsmål</div>
          <div className="text-xs text-green-600 mt-1">+12% denne måneden</div>
        </div>
        <div className="bg-white border border-gray-200 rounded p-4">
          <div className="text-2xl font-bold text-green-600">{statistikk.aktivSporsmal}</div>
          <div className="text-sm text-gray-500">Aktive spørsmål</div>
          <div className="text-xs text-blue-600 mt-1">{Math.round((statistikk.aktivSporsmal / statistikk.totalSporsmal) * 100)}% av totalt</div>
        </div>
        <div className="bg-white border border-gray-200 rounded p-4">
          <div className="text-2xl font-bold text-purple-600">{statistikk.totalMedia}</div>
          <div className="text-sm text-gray-500">Media filer</div>
          <div className="text-xs text-gray-600 mt-1">{Math.round(statistikk.mediaStorrelse)} MB total</div>
        </div>
        <div className="bg-white border border-gray-200 rounded p-4">
          <div className="text-2xl font-bold text-blue-600">{statistikk.totalKategorier}</div>
          <div className="text-sm text-gray-500">Aktive kategorier</div>
          <div className="text-xs text-orange-600 mt-1">{Math.round(statistikk.gjennomsnittScore)}% avg score</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Systemytelse</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database responstid</span>
              <span className="text-sm font-medium text-green-600">&lt; 50ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Media loading</span>
              <span className="text-sm font-medium text-blue-600">Optimalisert</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cache hit rate</span>
              <span className="text-sm font-medium text-green-600">94%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Skaleringsmetrikker</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Kapasitet brukt</span>
              <span className="text-sm font-medium text-blue-600">23%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Max spørsmål støttet</span>
              <span className="text-sm font-medium text-gray-600">50,000+</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Backup status</span>
              <span className="text-sm font-medium text-green-600">Aktiv</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent />
      <FilterComponent />
      
      {aktivTab === 'sporsmal' && <SporsmalContent />}
      {aktivTab === 'media' && <MediaContent />}
      {aktivTab === 'kategorier' && <KategoriContent />}
      {aktivTab === 'statistikk' && <StatistikkContent />}
    </div>
  );
} 