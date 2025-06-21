import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaArrowLeft, 
  FaPlus, 
  FaSearch, 
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaDownload,
  FaCheckSquare,
  FaSquare,
  FaCopy
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../lib/api';
import { log } from '../../../utils/logger';

interface Sjekkpunkt {
  id: number;
  tittel: string;
  beskrivelse: string;
  system: string;
  typeKontroll: 'FYSISK' | 'VISUELL';
  rettVerdi?: string;
  konsekvens: string[];
  intervallKm?: number;
  intervallTid?: number;
  forerkortklass: string[];
  unikForType: boolean;
  unikForMerke: boolean;
  unikForRegnr: boolean;
  kjoretoytype?: string;
  kjoretoymerke?: string;
  kjoretoyRegNr?: string;
  opprettet: string;
}

interface FilterState {
  search: string;
  system: string;
  typeKontroll: string;
  forerkortklass: string;
  harIntervallKm: boolean | null;
  harIntervallTid: boolean | null;
  erKjoretoySpesifikk: boolean | null;
}

interface SortState {
  field: keyof Sjekkpunkt | 'none';
  direction: 'asc' | 'desc';
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_ITEMS_PER_PAGE = 25;

export default function SjekkpunktBibliotek() {
  const navigate = useNavigate();
  
  // Data state
  const [alleSjekkpunkter, setAlleSjekkpunkter] = useState<Sjekkpunkt[]>([]);
  const [laster, setLaster] = useState(true);
  const [feil, setFeil] = useState<string | null>(null);
  
  // UI state
  const [visDetaljer, setVisDetaljer] = useState<number | null>(null);
  const [slettBekreftelse, setSlettBekreftelse] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    system: '',
    typeKontroll: '',
    forerkortklass: '',
    harIntervallKm: null,
    harIntervallTid: null,
    erKjoretoySpesifikk: null
  });
  
  // Sort state
  const [sort, setSort] = useState<SortState>({ field: 'none', direction: 'desc' });

  // Bulk actions state
  const [valgteSjekkpunkter, setValgteSjekkpunkter] = useState<Set<number>>(new Set());
  const [visBulkModal, setVisBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<'copy' | 'delete' | 'export' | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  useEffect(() => {
    hentSjekkpunkter();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sort]);

  const hentSjekkpunkter = async () => {
    try {
      setLaster(true);
      setFeil(null);
      const res = await api.get('/sjekkpunkt');
      setAlleSjekkpunkter(res.data);
    } catch (error: any) {
      log.apiError('/sjekkpunkt', error);
      setFeil(error.response?.data?.error || 'Kunne ikke hente sjekkpunkter');
    } finally {
      setLaster(false);
    }
  };

  // Memoized filtered and sorted data
  const filteredAndSortedSjekkpunkter = useMemo(() => {
    let result = [...alleSjekkpunkter];

    // Apply filters
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(s => 
        s.tittel.toLowerCase().includes(searchTerm) ||
        s.beskrivelse.toLowerCase().includes(searchTerm) ||
        s.system.toLowerCase().includes(searchTerm) ||
        s.id.toString().includes(searchTerm)
      );
    }

    if (filters.system) {
      result = result.filter(s => s.system === filters.system);
    }

    if (filters.typeKontroll) {
      result = result.filter(s => s.typeKontroll === filters.typeKontroll);
    }

    if (filters.forerkortklass) {
      result = result.filter(s => s.forerkortklass.includes(filters.forerkortklass));
    }

    if (filters.harIntervallKm !== null) {
      result = result.filter(s => filters.harIntervallKm ? !!s.intervallKm : !s.intervallKm);
    }

    if (filters.harIntervallTid !== null) {
      result = result.filter(s => filters.harIntervallTid ? !!s.intervallTid : !s.intervallTid);
    }

    if (filters.erKjoretoySpesifikk !== null) {
      result = result.filter(s => {
        const erSpesifikk = s.unikForType || s.unikForMerke || s.unikForRegnr;
        return filters.erKjoretoySpesifikk ? erSpesifikk : !erSpesifikk;
      });
    }

    // Apply sorting
    if (sort.field !== 'none') {
      result.sort((a, b) => {
        let aVal = a[sort.field as keyof Sjekkpunkt];
        let bVal = b[sort.field as keyof Sjekkpunkt];

        if (sort.field === 'opprettet') {
          aVal = new Date(aVal as string).getTime();
          bVal = new Date(bVal as string).getTime();
        }

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sort.direction === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        return 0;
      });
    }

    return result;
  }, [alleSjekkpunkter, filters, sort]);

  // Memoized pagination data
  const paginationData = useMemo(() => {
    const totalItems = filteredAndSortedSjekkpunkter.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredAndSortedSjekkpunkter.slice(startIndex, endIndex);

    return {
      totalItems,
      totalPages,
      currentItems,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, totalItems)
    };
  }, [filteredAndSortedSjekkpunkter, currentPage, itemsPerPage]);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const systems = Array.from(new Set(alleSjekkpunkter.map(s => s.system))).sort();
    const typeKontroller = Array.from(new Set(alleSjekkpunkter.map(s => s.typeKontroll))).sort();
    const forerkortklass = Array.from(new Set(alleSjekkpunkter.flatMap(s => s.forerkortklass))).sort();

    return { systems, typeKontroller, forerkortklass };
  }, [alleSjekkpunkter]);

  const handleFilterChange = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      system: '',
      typeKontroll: '',
      forerkortklass: '',
      harIntervallKm: null,
      harIntervallTid: null,
      erKjoretoySpesifikk: null
    });
    setSort({ field: 'none', direction: 'desc' });
  }, []);

  const handleSort = useCallback((field: keyof Sjekkpunkt) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const slettSjekkpunkt = async (id: number) => {
    try {
      await api.delete(`/sjekkpunkt/${id}`);
      setAlleSjekkpunkter(prev => prev.filter(s => s.id !== id));
      setSlettBekreftelse(null);
    } catch (error: any) {
      log.apiError(`/sjekkpunkt/${id}`, error);
      alert(error.response?.data?.error || 'Kunne ikke slette sjekkpunkt');
    }
  };

  // Bulk action functions
  const toggleSjekkpunkt = useCallback((id: number) => {
    setValgteSjekkpunkter(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleAlleSjekkpunkter = useCallback(() => {
    const currentPageIds = paginationData.currentItems.map(s => s.id);
    const alleValgt = currentPageIds.every(id => valgteSjekkpunkter.has(id));
    
    setValgteSjekkpunkter(prev => {
      const newSet = new Set(prev);
      if (alleValgt) {
        // Fjern alle fra current page
        currentPageIds.forEach(id => newSet.delete(id));
      } else {
        // Legg til alle fra current page
        currentPageIds.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  }, [paginationData.currentItems, valgteSjekkpunkter]);

  const handleBulkAction = useCallback((action: 'copy' | 'delete' | 'export') => {
    setBulkAction(action);
    setVisBulkModal(true);
  }, []);

  const executeBulkAction = useCallback(async () => {
    if (!bulkAction || valgteSjekkpunkter.size === 0) return;

    setBulkProcessing(true);
    try {
      const valgteSjekkpunkterArray = Array.from(valgteSjekkpunkter);
      
      switch (bulkAction) {
        case 'delete':
          for (const id of valgteSjekkpunkterArray) {
            await api.delete(`/sjekkpunkt/${id}`);
          }
          setAlleSjekkpunkter(prev => prev.filter(s => !valgteSjekkpunkter.has(s.id)));
          alert(`${valgteSjekkpunkterArray.length} sjekkpunkter slettet`);
          break;
          
        case 'copy':
          const kopierteSjekkpunkter: Sjekkpunkt[] = [];
          for (const id of valgteSjekkpunkterArray) {
            const original = alleSjekkpunkter.find(s => s.id === id);
            if (original) {
              const kopiData = {
                tittel: `${original.tittel} (kopi)`,
                beskrivelse: original.beskrivelse,
                system: original.system,
                typeKontroll: original.typeKontroll,
                rettVerdi: original.rettVerdi,
                konsekvens: original.konsekvens,
                intervallKm: original.intervallKm,
                intervallTid: original.intervallTid,
                forerkortklass: original.forerkortklass,
                unikForType: original.unikForType,
                unikForMerke: original.unikForMerke,
                unikForRegnr: original.unikForRegnr,
                kjoretoytype: original.kjoretoytype,
                kjoretoymerke: original.kjoretoymerke,
                kjoretoyRegNr: original.kjoretoyRegNr
              };
              
              const response = await api.post('/sjekkpunkt', kopiData);
              kopierteSjekkpunkter.push(response.data);
            }
          }
          setAlleSjekkpunkter(prev => [...kopierteSjekkpunkter, ...prev]);
          alert(`${kopierteSjekkpunkter.length} sjekkpunkter kopiert`);
          break;
          
        case 'export':
          const exportData = alleSjekkpunkter.filter(s => valgteSjekkpunkter.has(s.id));
          const dataStr = JSON.stringify(exportData, null, 2);
          const blob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `sjekkpunkter_${new Date().toISOString().split('T')[0]}.json`;
          link.click();
          URL.revokeObjectURL(url);
          alert(`${exportData.length} sjekkpunkter eksportert`);
          break;
      }
      
      setValgteSjekkpunkter(new Set());
    } catch (error: any) {
      log.error('Feil ved bulk action', { action: bulkAction, count: valgteSjekkpunkter.size, error });
      alert(error.response?.data?.error || `Feil ved ${bulkAction}`);
    } finally {
      setBulkProcessing(false);
      setVisBulkModal(false);
      setBulkAction(null);
    }
  }, [bulkAction, valgteSjekkpunkter, alleSjekkpunkter]);

  const SortableHeader = ({ field, children }: { field: keyof Sjekkpunkt; children: React.ReactNode }) => (
    <th 
      className="px-2 py-1.5 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sort.field === field && (
          sort.direction === 'asc' ? <FaSortAmountUp className="text-blue-600" /> : <FaSortAmountDown className="text-blue-600" />
        )}
      </div>
    </th>
  );

  // Rest of components (modals) remain the same but I'll abbreviate here due to length
  const SlettBekreftelseModal = ({ sjekkpunkt, onConfirm, onCancel }: {
    sjekkpunkt: Sjekkpunkt;
    onConfirm: () => void;
    onCancel: () => void;
  }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-2 py-1 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="px-2 py-1">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Bekreft sletting</h3>
          <p className="text-gray-600 mb-6">
            Er du sikker på at du vil slette sjekkpunktet "<strong>{sjekkpunkt.tittel}</strong>"? 
            Denne handlingen kan ikke angres.
          </p>
          <div className="flex cards-spacing-grid justify-end">
            <button onClick={onCancel} className="px-2 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
              Avbryt
            </button>
            <button onClick={onConfirm} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">
              Slett
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const DetaljerModal = ({ sjekkpunkt, onClose }: { sjekkpunkt: Sjekkpunkt; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-2 py-1 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-2 py-1 flex justify-between items-center">
          <h3 className="text-xl font-bold text-[#003366]">Sjekkpunkt detaljer</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center">
            ×
          </button>
        </div>
        <div className="px-2 py-1">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 mb-4">
            <h4 className="text-lg font-bold text-[#003366] mb-2">{sjekkpunkt.tittel}</h4>
            <p className="text-sm text-gray-600">ID: {sjekkpunkt.id}</p>
          </div>
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sjekkpunkt.beskrivelse }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white px-2 py-1 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Link to="/sikkerhetskontroll" className="inline-flex items-center gap-2 text-[#003366] hover:underline font-semibold">
          <FaArrowLeft /> Tilbake til sikkerhetskontroll
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between cards-spacing-grid mt-4">
          <h1 className="text-2xl font-bold text-[#003366]">Sjekkpunkt-bibliotek</h1>
          <Link to="/sikkerhetskontroll/opprett-sjekkpunkt" className="inline-flex items-center gap-2 bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
            <FaPlus /> Opprett nytt sjekkpunkt
          </Link>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-600 mt-1">
            {laster ? 'Laster...' : `${alleSjekkpunkter.length} sjekkpunkter totalt`}
            {filteredAndSortedSjekkpunkter.length !== alleSjekkpunkter.length && !laster && (
              <span> • {filteredAndSortedSjekkpunkter.length} vises etter filtrering</span>
            )}
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-gray-50 rounded-lg px-2 py-1 mb-6">
        <div className="flex cards-spacing-grid items-center mb-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Søk etter tittel, beskrivelse, system eller ID..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              showFilters ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            <FaFilter /> Avanserte filtre
          </button>
          {(Object.values(filters).some(v => v !== '' && v !== null) || sort.field !== 'none') && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
            >
              <FaTimes /> Fjern filtre
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">System</label>
              <select
                value={filters.system}
                onChange={(e) => handleFilterChange('system', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle systemer</option>
                {filterOptions.systems.map(system => (
                  <option key={system} value={system}>{system}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type kontroll</label>
              <select
                value={filters.typeKontroll}
                onChange={(e) => handleFilterChange('typeKontroll', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle typer</option>
                {filterOptions.typeKontroller.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Førerkortklasse</label>
              <select
                value={filters.forerkortklass}
                onChange={(e) => handleFilterChange('forerkortklass', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle klasser</option>
                {filterOptions.forerkortklass.map(klasse => (
                  <option key={klasse} value={klasse}>{klasse}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Km-intervall</label>
              <select
                value={filters.harIntervallKm === null ? '' : filters.harIntervallKm.toString()}
                onChange={(e) => handleFilterChange('harIntervallKm', e.target.value === '' ? null : e.target.value === 'true')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle</option>
                <option value="true">Har km-intervall</option>
                <option value="false">Ingen km-intervall</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tidsintervall</label>
              <select
                value={filters.harIntervallTid === null ? '' : filters.harIntervallTid.toString()}
                onChange={(e) => handleFilterChange('harIntervallTid', e.target.value === '' ? null : e.target.value === 'true')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle</option>
                <option value="true">Har tidsintervall</option>
                <option value="false">Ingen tidsintervall</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kjøretøy-spesifikk</label>
              <select
                value={filters.erKjoretoySpesifikk === null ? '' : filters.erKjoretoySpesifikk.toString()}
                onChange={(e) => handleFilterChange('erKjoretoySpesifikk', e.target.value === '' ? null : e.target.value === 'true')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle</option>
                <option value="true">Kjøretøy-spesifikk</option>
                <option value="false">Generell</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {feil && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-2 py-1 mb-6 text-red-700">
          <p>{feil}</p>
          <button onClick={hentSjekkpunkter} className="mt-2 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">
            Prøv på nytt
          </button>
        </div>
      )}

      {/* Results Info and Pagination Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center cards-spacing-grid">
          <span className="text-sm text-gray-600">
            Viser {paginationData.startIndex}-{paginationData.endIndex} av {paginationData.totalItems}
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            {ITEMS_PER_PAGE_OPTIONS.map(option => (
              <option key={option} value={option}>{option} per side</option>
            ))}
          </select>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Første
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <FaChevronLeft />
          </button>
          
          <span className="px-2 py-1 text-sm">
            Side {currentPage} av {paginationData.totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= paginationData.totalPages}
            className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <FaChevronRight />
          </button>
          <button
            onClick={() => setCurrentPage(paginationData.totalPages)}
            disabled={currentPage >= paginationData.totalPages}
            className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Siste
          </button>
        </div>
      </div>

      {/* Bulk actions bar */}
      {valgteSjekkpunkter.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-800">
              {valgteSjekkpunkter.size} sjekkpunkter valgt
            </span>
            <div className="flex gap-4">
              <button
                onClick={() => handleBulkAction('copy')}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
              >
                <FaCopy size={12} />
                Kopier
              </button>
              <button
                onClick={() => handleBulkAction('export')}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <FaDownload size={12} />
                Eksporter
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              >
                <FaTrash size={12} />
                Slett
              </button>
              <button
                onClick={() => setValgteSjekkpunkter(new Set())}
                className="text-xs text-blue-600 hover:text-blue-800 px-2"
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {laster ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Laster sjekkpunkter...</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="w-8 px-2 py-1.5">
                    <button onClick={toggleAlleSjekkpunkter}>
                      {paginationData.currentItems.every(s => valgteSjekkpunkter.has(s.id)) && paginationData.currentItems.length > 0 ? 
                        <FaCheckSquare className="text-blue-600" /> : 
                        <FaSquare className="text-gray-400" />
                      }
                    </button>
                  </th>
                  <SortableHeader field="id">ID</SortableHeader>
                  <SortableHeader field="tittel">Hva skal sjekkes</SortableHeader>
                  <SortableHeader field="system">System</SortableHeader>
                  <SortableHeader field="typeKontroll">Type</SortableHeader>
                  <th className="px-2 py-1.5 font-semibold text-gray-700">Klasser</th>
                  <th className="px-2 py-1.5 font-semibold text-gray-700">Intervall</th>
                  <SortableHeader field="opprettet">Opprettet</SortableHeader>
                  <th className="px-2 py-1.5 font-semibold text-gray-700 text-center">Handlinger</th>
                </tr>
              </thead>
              <tbody>
                {paginationData.currentItems.map(sjekkpunkt => (
                  <tr key={sjekkpunkt.id} className="border-b hover:bg-gray-50">
                    <td className="px-2 py-1">
                      <button onClick={() => toggleSjekkpunkt(sjekkpunkt.id)}>
                        {valgteSjekkpunkter.has(sjekkpunkt.id) ? 
                          <FaCheckSquare className="text-blue-600" /> : 
                          <FaSquare className="text-gray-400" />
                        }
                      </button>
                    </td>
                    <td className="px-2 py-1 text-sm text-gray-500">#{sjekkpunkt.id}</td>
                    <td className="px-2 py-1">
                      <div className="font-semibold text-gray-900">{sjekkpunkt.tittel}</div>
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {sjekkpunkt.beskrivelse.replace(/<[^>]*>/g, '')}
                      </div>
                    </td>
                    <td className="px-2 py-1">
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm">
                        {sjekkpunkt.system}
                      </span>
                    </td>
                    <td className="px-2 py-1">
                      <span className={`px-2 py-0.5 rounded text-sm ${
                        sjekkpunkt.typeKontroll === 'FYSISK' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {sjekkpunkt.typeKontroll}
                      </span>
                    </td>
                    <td className="px-2 py-1">
                      <div className="flex flex-wrap gap-1">
                        {sjekkpunkt.forerkortklass.slice(0, 2).map(klasse => (
                          <span key={klasse} className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded text-xs">
                            {klasse}
                          </span>
                        ))}
                        {sjekkpunkt.forerkortklass.length > 2 && (
                          <span className="text-gray-500 text-xs">+{sjekkpunkt.forerkortklass.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-1 text-sm text-gray-600">
                      {sjekkpunkt.intervallKm && `${sjekkpunkt.intervallKm} km`}
                      {sjekkpunkt.intervallKm && sjekkpunkt.intervallTid && ' / '}
                      {sjekkpunkt.intervallTid && `${sjekkpunkt.intervallTid}d`}
                      {!sjekkpunkt.intervallKm && !sjekkpunkt.intervallTid && '-'}
                    </td>
                    <td className="px-2 py-1 text-sm text-gray-600">
                      {new Date(sjekkpunkt.opprettet).toLocaleDateString('nb-NO')}
                    </td>
                    <td className="px-2 py-1">
                      <div className="flex justify-center gap-1">
                        <button 
                          onClick={() => setVisDetaljer(sjekkpunkt.id)}
                          className="bg-blue-100 text-blue-600 p-1 rounded hover:bg-blue-200" 
                          title="Se detaljer"
                        >
                          <FaEye size={12} />
                        </button>
                        <button 
                          onClick={() => navigate(`/sikkerhetskontroll/sjekkpunkt/${sjekkpunkt.id}`)}
                          className="bg-yellow-100 text-yellow-600 p-1 rounded hover:bg-yellow-200" 
                          title="Rediger"
                        >
                          <FaEdit size={12} />
                        </button>
                        <button 
                          onClick={() => setSlettBekreftelse(sjekkpunkt.id)}
                          className="bg-red-100 text-red-600 p-1 rounded hover:bg-red-200" 
                          title="Slett"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginationData.currentItems.length === 0 && !laster && (
                  <tr>
                    <td colSpan={9} className="px-2 py-1 text-center text-gray-500">
                      <div>
                        <p className="mb-2">
                          {filteredAndSortedSjekkpunkter.length === 0 && alleSjekkpunkter.length > 0
                            ? 'Ingen sjekkpunkter matcher dine filtre'
                            : 'Ingen sjekkpunkter funnet'
                          }
                        </p>
                        {filteredAndSortedSjekkpunkter.length === 0 && alleSjekkpunkter.length > 0 ? (
                          <button onClick={clearFilters} className="text-blue-600 hover:text-blue-800">
                            Fjern filtre
                          </button>
                        ) : (
                          <Link to="/sikkerhetskontroll/opprett-sjekkpunkt" className="inline-flex items-center gap-2 bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
                            <FaPlus /> Opprett ditt første sjekkpunkt
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bottom Pagination */}
      {paginationData.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Første
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Forrige
            </button>
            
            <span className="px-2 py-1 text-sm bg-blue-50 border border-blue-200 rounded">
              Side {currentPage} av {paginationData.totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= paginationData.totalPages}
              className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Neste
            </button>
            <button
              onClick={() => setCurrentPage(paginationData.totalPages)}
              disabled={currentPage >= paginationData.totalPages}
              className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Siste
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {slettBekreftelse && (
        <SlettBekreftelseModal
          sjekkpunkt={alleSjekkpunkter.find(s => s.id === slettBekreftelse)!}
          onConfirm={() => slettSjekkpunkt(slettBekreftelse)}
          onCancel={() => setSlettBekreftelse(null)}
        />
      )}

      {visDetaljer && (
        <DetaljerModal 
          sjekkpunkt={alleSjekkpunkter.find(s => s.id === visDetaljer)!}
          onClose={() => setVisDetaljer(null)}
        />
      )}

      {/* Bulk action modal */}
      {visBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg px-2 py-1 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Bekreft {bulkAction === 'copy' ? 'kopiering' : bulkAction === 'export' ? 'eksport' : 'sletting'}
            </h3>
            <p className="text-gray-600 mb-6">
              Er du sikker på at du vil {bulkAction === 'copy' ? 'kopiere' : bulkAction === 'export' ? 'eksportere' : 'slette'} {valgteSjekkpunkter.size} sjekkpunkter?
            </p>
            <div className="flex justify-end cards-spacing-grid">
              <button
                onClick={() => setVisBulkModal(false)}
                disabled={bulkProcessing}
                className="px-2 py-1 text-gray-600 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Avbryt
              </button>
              <button 
                onClick={executeBulkAction}
                disabled={bulkProcessing}
                className={`px-4 py-2 text-white rounded disabled:opacity-50 ${
                  bulkAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : 
                  bulkAction === 'copy' ? 'bg-green-600 hover:bg-green-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {bulkProcessing ? 'Behandler...' : 
                  bulkAction === 'copy' ? 'Kopier' : 
                  bulkAction === 'export' ? 'Eksporter' : 'Slett'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 