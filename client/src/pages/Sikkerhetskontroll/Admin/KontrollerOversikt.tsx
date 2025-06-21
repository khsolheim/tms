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
  // FaCopy, // Currently unused
  // FaClipboardList, // Currently unused
  FaUser,
  FaBuilding
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../lib/api';
import { toast } from 'react-hot-toast';
import { FiCopy } from 'react-icons/fi';
import { log } from '../../../utils/logger';

interface SjekkpunktIKontroll {
  id: number;
  sjekkpunkt: {
    id: number;
    tittel: string;
    system: string;
    typeKontroll: 'FYSISK' | 'VISUELL';
  };
  rekkefølge: number;
  kanGodkjennesAv: string;
  påkrevd: boolean;
}

interface Sikkerhetskontroll {
  id: number;
  navn: string;
  beskrivelse?: string;
  bedrift: {
    id: number;
    navn: string;
  };
  opprettetAv: {
    id: number;
    fornavn: string;
    etternavn: string;
  };
  punkter: SjekkpunktIKontroll[];
  opprettet: string;
}

interface FilterState {
  search: string;
  bedrift: string;
  opprettetAv: string;
  antallSjekkpunkter: string;
}

interface SortState {
  field: keyof Sikkerhetskontroll | 'antallSjekkpunkter' | 'none';
  direction: 'asc' | 'desc';
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_ITEMS_PER_PAGE = 25;

export default function KontrollerOversikt() {
  const navigate = useNavigate();
  
  // Data state
  const [alleKontroller, setAlleKontroller] = useState<Sikkerhetskontroll[]>([]);
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
    bedrift: '',
    opprettetAv: '',
    antallSjekkpunkter: ''
  });
  
  // Sort state
  const [sort, setSort] = useState<SortState>({ field: 'opprettet', direction: 'desc' });

  // Bulk actions state
  const [valgteKontroller, setValgteKontroller] = useState<Set<number>>(new Set());
  const [visBulkModal, setVisBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<'copy' | 'delete' | 'export' | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  useEffect(() => {
    hentKontroller();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sort]);

  const hentKontroller = async () => {
    try {
      setLaster(true);
      setFeil(null);
      const res = await api.get('/sikkerhetskontroll');
      setAlleKontroller(res.data);
    } catch (error: any) {
      log.apiError('sikkerhetskontroller', error);
      log.error('Feil ved henting av sikkerhetskontroller');
      setFeil(error.response?.data?.error || 'Kunne ikke hente sikkerhetskontroller');
    } finally {
      setLaster(false);
    }
  };

  // Memoized filtered and sorted data
  const filteredAndSortedKontroller = useMemo(() => {
    let result = [...alleKontroller];

    // Apply filters
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(k => 
        k.navn.toLowerCase().includes(searchTerm) ||
        (k.beskrivelse && k.beskrivelse.toLowerCase().includes(searchTerm)) ||
        k.bedrift.navn.toLowerCase().includes(searchTerm) ||
        `${k.opprettetAv.fornavn} ${k.opprettetAv.etternavn}`.toLowerCase().includes(searchTerm) ||
        k.id.toString().includes(searchTerm)
      );
    }

    if (filters.bedrift) {
      result = result.filter(k => k.bedrift.navn === filters.bedrift);
    }

    if (filters.opprettetAv) {
      result = result.filter(k => `${k.opprettetAv.fornavn} ${k.opprettetAv.etternavn}` === filters.opprettetAv);
    }

    if (filters.antallSjekkpunkter) {
      const antall = parseInt(filters.antallSjekkpunkter);
      if (!isNaN(antall)) {
        result = result.filter(k => k.punkter.length === antall);
      }
    }

    // Apply sorting
    if (sort.field !== 'none') {
      result.sort((a, b) => {
        let aVal: any = a[sort.field as keyof Sikkerhetskontroll];
        let bVal: any = b[sort.field as keyof Sikkerhetskontroll];

        if (sort.field === 'antallSjekkpunkter') {
          aVal = a.punkter.length;
          bVal = b.punkter.length;
        } else if (sort.field === 'opprettet') {
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
  }, [alleKontroller, filters, sort]);

  // Memoized pagination data
  const paginationData = useMemo(() => {
    const totalItems = filteredAndSortedKontroller.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredAndSortedKontroller.slice(startIndex, endIndex);

    return {
      totalItems,
      totalPages,
      currentItems,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, totalItems)
    };
  }, [filteredAndSortedKontroller, currentPage, itemsPerPage]);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const bedrifter = Array.from(new Set(alleKontroller.map(k => k.bedrift.navn))).sort();
    const opprettetAv = Array.from(new Set(alleKontroller.map(k => `${k.opprettetAv.fornavn} ${k.opprettetAv.etternavn}`))).sort();
    const antallSjekkpunkter = Array.from(new Set(alleKontroller.map(k => k.punkter.length))).sort((a, b) => a - b);

    return { bedrifter, opprettetAv, antallSjekkpunkter };
  }, [alleKontroller]);

  const handleFilterChange = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      bedrift: '',
      opprettetAv: '',
      antallSjekkpunkter: ''
    });
    setSort({ field: 'opprettet', direction: 'desc' });
  }, []);

  const handleSort = useCallback((field: keyof Sikkerhetskontroll | 'antallSjekkpunkter') => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const slettKontroll = async (id: number) => {
    try {
      await api.delete(`/sikkerhetskontroll/${id}`);
      setAlleKontroller(prev => prev.filter(k => k.id !== id));
      setSlettBekreftelse(null);
    } catch (error: any) {
      log.apiError('sikkerhetskontroller/delete', error);
      log.error('Feil ved sletting av sikkerhetskontroll');
      alert(error.response?.data?.error || 'Kunne ikke slette sikkerhetskontroll');
    }
  };

  // Bulk action functions
  const toggleKontroll = useCallback((id: number) => {
    setValgteKontroller(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleAlleKontroller = useCallback(() => {
    const currentPageIds = paginationData.currentItems.map(k => k.id);
    const alleValgt = currentPageIds.every(id => valgteKontroller.has(id));
    
    setValgteKontroller(prev => {
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
  }, [paginationData.currentItems, valgteKontroller]);

  const handleBulkAction = useCallback((action: 'copy' | 'delete' | 'export') => {
    setBulkAction(action);
    setVisBulkModal(true);
  }, []);

  const executeBulkAction = useCallback(async () => {
    if (!bulkAction || valgteKontroller.size === 0) return;

    setBulkProcessing(true);
    try {
      const valgteKontrollerArray = Array.from(valgteKontroller);
      
      switch (bulkAction) {
        case 'delete':
          for (const id of valgteKontrollerArray) {
            await api.delete(`/sikkerhetskontroll/${id}`);
          }
          setAlleKontroller(prev => prev.filter(k => !valgteKontroller.has(k.id)));
          alert(`${valgteKontrollerArray.length} kontroller slettet`);
          break;
          
        case 'copy':
          // Kopiering av kontroller implementeres når det er behov for dette
          alert('Kopiering av kontroller er ikke tilgjengelig ennå');
          break;
          
        case 'export':
          const exportData = alleKontroller.filter(k => valgteKontroller.has(k.id));
          const dataStr = JSON.stringify(exportData, null, 2);
          const blob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `sikkerhetskontroller_${new Date().toISOString().split('T')[0]}.json`;
          link.click();
          URL.revokeObjectURL(url);
          alert(`${exportData.length} kontroller eksportert`);
          break;
      }
      
      setValgteKontroller(new Set());
    } catch (error: any) {
      log.apiError('sikkerhetskontroller/bulk-action', error);
      log.error('Feil ved bulk action');
      alert(error.response?.data?.error || `Feil ved ${bulkAction}`);
    } finally {
      setBulkProcessing(false);
      setVisBulkModal(false);
      setBulkAction(null);
    }
  }, [bulkAction, valgteKontroller, alleKontroller]);

  const SortableHeader = ({ field, children }: { field: keyof Sikkerhetskontroll | 'antallSjekkpunkter'; children: React.ReactNode }) => (
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

  const SlettBekreftelseModal = ({ kontroll, onConfirm, onCancel }: {
    kontroll: Sikkerhetskontroll;
    onConfirm: () => void;
    onCancel: () => void;
  }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-2 py-1 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="px-2 py-1">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Bekreft sletting</h3>
          <p className="text-gray-600 mb-6">
            Er du sikker på at du vil slette sikkerhetskontroll "<strong>{kontroll.navn}</strong>"? 
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

  const DetaljerModal = ({ kontroll, onClose }: { kontroll: Sikkerhetskontroll; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-2 py-1 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-2 py-1 flex justify-between items-center">
          <h3 className="text-xl font-bold text-[#003366]">Kontroll detaljer</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center">
            ×
          </button>
        </div>
        <div className="px-2 py-1">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 mb-6">
            <h4 className="text-lg font-bold text-[#003366] mb-2">{kontroll.navn}</h4>
            <div className="grid grid-cols-2 cards-spacing-grid text-sm">
              <div>
                <span className="text-gray-600">ID:</span> {kontroll.id}
              </div>
              <div>
                <span className="text-gray-600">Bedrift:</span> {kontroll.bedrift.navn}
              </div>
              <div>
                <span className="text-gray-600">Opprettet av:</span> {kontroll.opprettetAv.fornavn} {kontroll.opprettetAv.etternavn}
              </div>
              <div>
                <span className="text-gray-600">Opprettet:</span> {new Date(kontroll.opprettet).toLocaleDateString('nb-NO')}
              </div>
            </div>
            {kontroll.beskrivelse && (
              <div className="mt-3">
                <span className="text-gray-600">Beskrivelse:</span>
                <p className="text-gray-800 mt-1">{kontroll.beskrivelse}</p>
              </div>
            )}
          </div>

          <div>
            <h5 className="text-lg font-semibold text-gray-900 mb-4">Sjekkpunkter ({kontroll.punkter.length})</h5>
            <div className="space-y-8">
              {kontroll.punkter.map((punkt, index) => (
                <div key={punkt.id} className="border border-gray-200 rounded-lg px-2 py-1">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          #{punkt.rekkefølge}
                        </span>
                        <h6 className="font-medium text-gray-900">{punkt.sjekkpunkt.tittel}</h6>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {punkt.sjekkpunkt.system}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          punkt.sjekkpunkt.typeKontroll === 'FYSISK' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {punkt.sjekkpunkt.typeKontroll}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          punkt.påkrevd ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {punkt.påkrevd ? 'Påkrevd' : 'Valgfri'}
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          Godkjennes av: {punkt.kanGodkjennesAv}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
          <h1 className="text-2xl font-bold text-[#003366]">Kontroller-oversikt</h1>
          <Link to="/sikkerhetskontroll/opprett-kontroll" className="inline-flex items-center gap-2 bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
            <FaPlus /> Opprett ny kontroll
          </Link>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-600 mt-1">
            {laster ? 'Laster...' : `${alleKontroller.length} kontroller totalt`}
            {filteredAndSortedKontroller.length !== alleKontroller.length && !laster && (
              <span> • {filteredAndSortedKontroller.length} vises etter filtrering</span>
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
              placeholder="Søk etter navn, beskrivelse, bedrift eller opprettet av..."
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
          {(Object.values(filters).some(v => v !== '') || sort.field !== 'opprettet' || sort.direction !== 'desc') && (
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
          <div className="grid grid-cols-1 md:grid-cols-3 cards-spacing-grid pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrift</label>
              <select
                value={filters.bedrift}
                onChange={(e) => handleFilterChange('bedrift', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle bedrifter</option>
                {filterOptions.bedrifter.map(bedrift => (
                  <option key={bedrift} value={bedrift}>{bedrift}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opprettet av</label>
              <select
                value={filters.opprettetAv}
                onChange={(e) => handleFilterChange('opprettetAv', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle</option>
                {filterOptions.opprettetAv.map(person => (
                  <option key={person} value={person}>{person}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Antall sjekkpunkter</label>
              <select
                value={filters.antallSjekkpunkter}
                onChange={(e) => handleFilterChange('antallSjekkpunkter', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle</option>
                {filterOptions.antallSjekkpunkter.map(antall => (
                  <option key={antall} value={antall.toString()}>{antall} sjekkpunkter</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {feil && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-2 py-1 mb-6 text-red-700">
          <p>{feil}</p>
          <button onClick={hentKontroller} className="mt-2 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">
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
      {valgteKontroller.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-800">
              {valgteKontroller.size} kontroller valgt
            </span>
            <div className="flex gap-4">
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
                onClick={() => setValgteKontroller(new Set())}
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
          <p className="text-gray-500">Laster kontroller...</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="w-8 px-2 py-1.5">
                    <button onClick={toggleAlleKontroller}>
                      {paginationData.currentItems.every(k => valgteKontroller.has(k.id)) && paginationData.currentItems.length > 0 ? 
                        <FaCheckSquare className="text-blue-600" /> : 
                        <FaSquare className="text-gray-400" />
                      }
                    </button>
                  </th>
                  <SortableHeader field="id">ID</SortableHeader>
                  <SortableHeader field="navn">Navn</SortableHeader>
                  <th className="px-2 py-1.5 font-semibold text-gray-700">Bedrift</th>
                  <SortableHeader field="antallSjekkpunkter">Sjekkpunkter</SortableHeader>
                  <th className="px-2 py-1.5 font-semibold text-gray-700">Opprettet av</th>
                  <SortableHeader field="opprettet">Opprettet</SortableHeader>
                  <th className="px-2 py-1.5 font-semibold text-gray-700 text-center">Handlinger</th>
                </tr>
              </thead>
              <tbody>
                {paginationData.currentItems.map(kontroll => (
                  <tr key={kontroll.id} className="border-b hover:bg-gray-50">
                    <td className="px-2 py-1">
                      <button onClick={() => toggleKontroll(kontroll.id)}>
                        {valgteKontroller.has(kontroll.id) ? 
                          <FaCheckSquare className="text-blue-600" /> : 
                          <FaSquare className="text-gray-400" />
                        }
                      </button>
                    </td>
                    <td className="px-2 py-1 text-sm text-gray-500">#{kontroll.id}</td>
                    <td className="px-2 py-1">
                      <div className="font-semibold text-gray-900">{kontroll.navn}</div>
                      {kontroll.beskrivelse && (
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {kontroll.beskrivelse}
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-1">
                      <div className="flex items-center gap-1">
                        <FaBuilding className="text-gray-400" size={12} />
                        <span className="text-sm text-gray-700">{kontroll.bedrift.navn}</span>
                      </div>
                    </td>
                    <td className="px-2 py-1">
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm">
                        {kontroll.punkter.length} punkter
                      </span>
                    </td>
                    <td className="px-2 py-1">
                      <div className="flex items-center gap-1">
                        <FaUser className="text-gray-400" size={12} />
                        <span className="text-sm text-gray-700">
                          {kontroll.opprettetAv.fornavn} {kontroll.opprettetAv.etternavn}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-1 text-sm text-gray-600">
                      {new Date(kontroll.opprettet).toLocaleDateString('nb-NO')}
                    </td>
                    <td className="px-2 py-1">
                      <div className="flex justify-center gap-1">
                        <button 
                          onClick={() => setVisDetaljer(kontroll.id)}
                          className="bg-blue-100 text-blue-600 p-1 rounded hover:bg-blue-200" 
                          title="Se detaljer"
                        >
                          <FaEye size={12} />
                        </button>
                        <button 
                          onClick={() => navigate(`/sikkerhetskontroll/kontroll/${kontroll.id}/rediger`)}
                          className="bg-yellow-100 text-yellow-600 p-1 rounded hover:bg-yellow-200" 
                          title="Rediger"
                        >
                          <FaEdit size={12} />
                        </button>
                        <button 
                          onClick={() => setSlettBekreftelse(kontroll.id)}
                          className="bg-red-100 text-red-600 p-1 rounded hover:bg-red-200" 
                          title="Slett"
                        >
                          <FaTrash size={12} />
                        </button>
                        <FiCopy 
                          className="w-4 h-4 text-blue-600 hover:text-blue-800 cursor-pointer"
                          title="Kopier kontroll"
                          onClick={() => {
                            if (window.confirm('Er du sikker på at du vil kopiere denne kontrollen?')) {
                              // Opprett en kopi av kontrollen med ny tittel
                                                             const kopiTittel = `${kontroll.navn} (Kopi)`;
                              
                              // Her ville vi kalle API for å opprette en ny kontroll
                              toast.promise(
                                fetch('/api/sikkerhetskontroller', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    ...kontroll,
                                    id: undefined, // Fjern ID så API oppretter ny
                                                                         navn: kopiTittel,
                                    opprettet: new Date().toISOString(),
                                    oppdatert: new Date().toISOString()
                                  })
                                }).then(res => res.json()),
                                {
                                  loading: 'Kopierer kontroll...',
                                  success: 'Kontroll kopiert successfully!',
                                  error: 'Feil ved kopiering av kontroll'
                                }
                              ).then(() => {
                                // Refresh data
                                window.location.reload();
                              });
                            }
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {paginationData.currentItems.length === 0 && !laster && (
                  <tr>
                    <td colSpan={8} className="px-2 py-1 text-center text-gray-500">
                      <div>
                        <p className="mb-2">
                          {filteredAndSortedKontroller.length === 0 && alleKontroller.length > 0
                            ? 'Ingen kontroller matcher dine filtre'
                            : 'Ingen kontroller funnet'
                          }
                        </p>
                        {filteredAndSortedKontroller.length === 0 && alleKontroller.length > 0 ? (
                          <button onClick={clearFilters} className="text-blue-600 hover:text-blue-800">
                            Fjern filtre
                          </button>
                        ) : (
                          <Link to="/sikkerhetskontroll/opprett-kontroll" className="inline-flex items-center gap-2 bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
                            <FaPlus /> Opprett din første kontroll
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
          kontroll={alleKontroller.find(k => k.id === slettBekreftelse)!}
          onConfirm={() => slettKontroll(slettBekreftelse)}
          onCancel={() => setSlettBekreftelse(null)}
        />
      )}

      {visDetaljer && (
        <DetaljerModal 
          kontroll={alleKontroller.find(k => k.id === visDetaljer)!}
          onClose={() => setVisDetaljer(null)}
        />
      )}

      {/* Bulk action modal */}
      {visBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg px-2 py-1 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Bekreft {bulkAction === 'export' ? 'eksport' : 'sletting'}
            </h3>
            <p className="text-gray-600 mb-6">
              Er du sikker på at du vil {bulkAction === 'export' ? 'eksportere' : 'slette'} {valgteKontroller.size} kontroller?
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
                  bulkAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {bulkProcessing ? 'Behandler...' : 
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