import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEye, FiSearch, FiCheck, FiClock, FiX } from 'react-icons/fi';
import { useKontrakter, useDeleteKontrakt, KontraktFilters, KontraktersResponse } from '../../hooks/useKontrakter';
import { TableSkeleton, LoadingButton } from '../../components/ui/LoadingStates';
import { NoContractsEmptyState } from '../../components/ui/EmptyStates';
// import { useUIStore } from '../../stores/ui.store'; // Unused import - commented out
import { toast } from 'react-hot-toast';
import { referenceService } from '../../services/reference.service';

// ============================================================================
// ACCESSIBILITY HELPERS (placeholder implementations)
// ============================================================================

const announceSuccess = (message: string) => {
  // For now, use console.log but could be replaced with screen reader announcements
  console.log(`[A11Y Success]: ${message}`);
};

const announceError = (context: string, message: string) => {
  console.log(`[A11Y Error] ${context}: ${message}`);
};

const announceSort = (column: string, direction: 'asc' | 'desc') => {
  console.log(`[A11Y Sort]: Sorted by ${column} in ${direction}ending order`);
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Local type definitions for this component
interface Kontrakt {
  id: number;
  bedriftId: number;
  beskrivelse: string;
  startDato: string;
  sluttDato: string;
  status: 'KLADD' | 'AKTIV' | 'AVSLUTTET';
  totalPris: number;
  elevNavn?: string;
  elevFornavn?: string;
  elvEtternavn?: string;
  bedriftNavn?: string;
}

// Hardkodede konstanter erstattet med API-kall

const KontraktOversikt: React.FC = () => {
  const [filters, setFilters] = useState<KontraktFilters>({
    page: 1,
    limit: 20
  });
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [kontraktStatuser, setKontraktStatuser] = useState<any[]>([]);
  
  // React Query hooks
  const { 
    data,
    isLoading, 
    error,
    refetch 
  } = useKontrakter(filters);
  
  const deleteKontraktMutation = useDeleteKontrakt();

  // Extract data from API response
  const kontrakter = data?.kontrakter || [];
  const totalCount = data?.totalAntall || 0;
  const currentPage = data?.side || 1;
  const totalPages = data?.antallSider || 0;

  // Hent kontrakt-statuser fra API
  useEffect(() => {
    const hentKontraktStatuser = async () => {
      try {
        const statuser = await referenceService.getKontraktStatuser();
        setKontraktStatuser(statuser);
      } catch (error) {
        console.error('Feil ved henting av kontrakt-statuser:', error);
        // Beholder fallback-verdier ved feil
      }
    };

    hentKontraktStatuser();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const searchQuery = formData.get('search') as string;
    
    setFilters((prev: KontraktFilters) => ({
      ...prev,
      search: searchQuery || undefined,
      page: 1
    }));

    // Accessibility: Announce search results
    setTimeout(() => {
      if (searchQuery) {
        // announceSuccess(`Søket returnerte ${totalCount} kontrakter for "${searchQuery}"`);
        console.log(`Søket returnerte ${totalCount} kontrakter for "${searchQuery}"`);
      } else {
        // announceSuccess(`Viser alle ${totalCount} kontrakter`);
        console.log(`Viser alle ${totalCount} kontrakter`);
      }
    }, 1000);
  };

  const handleFilterChange = (newStatus: string) => {
    setFilters((prev: KontraktFilters) => ({
      ...prev,
      status: newStatus === 'alle' ? undefined : newStatus,
      page: 1
    }));

    // Accessibility: Announce filter change
    setTimeout(() => {
      const statusObj = kontraktStatuser.find(s => s.verdi === newStatus);
      const statusText = newStatus === 'alle' ? 'alle statuser' : (statusObj?.navn || newStatus);
      announceSuccess(`Filtrert til ${statusText}. Viser ${totalCount} kontrakter.`);
    }, 1000);
  };

  const handleSort = (column: string) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    
    // Update filters for backend sorting
    setFilters((prev: KontraktFilters) => ({
      ...prev,
      sortBy: column,
      sortOrder: newDirection
    }));

    // Accessibility: Announce sort change
    announceSort(column, newDirection);
  };

  const handleDeleteKontrakt = async (id: number) => {
    const kontrakt = kontrakter.find((k: Kontrakt) => k.id === id);
    const kontraktName = kontrakt ? kontrakt.elevNavn || `kontrakt ${id}` : `kontrakt ${id}`;
    
    if (!window.confirm(`Er du sikker på at du vil slette kontrakten for ${kontraktName}?`)) {
      return;
    }

    try {
      await deleteKontraktMutation.mutateAsync(id);
      toast.success('Kontrakt slettet');
      announceSuccess(`Kontrakt for ${kontraktName} er slettet`);
      refetch();
    } catch (error) {
      toast.error('Kunne ikke slette kontrakt');
      announceError('Sletting', 'Kunne ikke slette kontrakt');
    }
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-2 py-1">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md px-2 py-1">
            <div className="flex">
              <FiX className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Kunne ikke laste inn kontrakter
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Det oppsto en feil ved lasting av data. Prøv å laste siden på nytt.</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => refetch()}
                    className="bg-red-100 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Prøv igjen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-1">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Kontrakter</h1>
            <p className="mt-2 text-sm text-gray-700">
              Oversikt over alle kontrakter i systemet
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => window.location.href = '/kontrakter/ny'}
              className="inline-flex items-center px-2 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiPlus className="-ml-1 mr-2 h-5 w-5" />
              Ny kontrakt
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-2 py-1">
            <form onSubmit={handleSearch} className="flex cards-spacing-grid items-end">
              <div className="flex-1">
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                    Søk i kontrakter
                  </label>
                  <input
                    id="search"
                    name="search"
                    type="text"
                    placeholder="Søk etter elev, beskrivelse..."
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex-shrink-0">
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select 
                  id="status-filter"
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="block w-full bg-white text-gray-900 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="alle">Alle statuser</option>
                  {kontraktStatuser.map((status) => (
                    <option key={status.verdi} value={status.verdi}>{status.navn}</option>
                  ))}
                </select>
              </div>
              <div className="flex-shrink-0">
                <LoadingButton
                  type="submit"
                  variant="primary"
                  className="px-2 py-1"
                  loading={false}
                >
                  <FiSearch className="-ml-0.5 mr-2 h-4 w-4" />
                  Søk
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>

        {/* Kontrakter Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {kontrakter.length === 0 ? (
            <NoContractsEmptyState 
              onAction={() => window.location.href = '/kontrakter/ny'}
              actionLabel="Opprett første kontrakt"
              className="py-12"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('id')}
                    >
                      ID
                      {sortColumn === 'id' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('elevNavn')}
                    >
                      Elev
                      {sortColumn === 'elevNavn' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beskrivelse
                    </th>
                    <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th 
                      scope="col" 
                      className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('totalPris')}
                    >
                      Pris
                      {sortColumn === 'totalPris' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th scope="col" className="relative px-2 py-1">
                      <span className="sr-only">Handlinger</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {kontrakter.map((kontrakt: Kontrakt) => {
                    const statusObj = kontraktStatuser.find(s => s.verdi === kontrakt.status) || { 
                      navn: kontrakt.status, 
                      farge: 'bg-gray-100 text-gray-800', 
                      icon: 'FiSearch' 
                    };
                    
                    // Fallback til hardkodede ikoner for nå
                    const getIconComponent = (iconName: string) => {
                      switch(iconName) {
                        case 'FiSearch': return FiSearch;
                        case 'FiClock': return FiClock;
                        case 'FiCheck': return FiCheck;
                        default: return FiSearch;
                      }
                    };
                    const StatusIcon = getIconComponent(statusObj.icon);
                    
                    return (
                      <tr key={kontrakt.id} className="hover:bg-gray-50">
                        <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900">
                          {kontrakt.id}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{kontrakt.elevNavn || 'Ikke angitt'}</div>
                          <div className="text-sm text-gray-500">{kontrakt.bedriftNavn || 'Ikke angitt'}</div>
                        </td>
                        <td className="px-2 py-1">
                          <div className="text-sm text-gray-900">{kontrakt.beskrivelse}</div>
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap">
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusObj.farge}`}
                            aria-label={`Status: ${statusObj.navn}`}
                          >
                            <StatusIcon className="mr-1.5 h-3 w-3" aria-hidden="true" />
                            {statusObj.navn}
                          </span>
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                          {new Intl.NumberFormat('no-NO', { 
                            style: 'currency', 
                            currency: 'NOK' 
                          }).format(kontrakt.totalPris)}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center cards-spacing-grid">
                            <Link
                              to={`/kontrakter/${kontrakt.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                              aria-label={`Vis detaljer for kontrakt ${kontrakt.id}`}
                            >
                              <FiEye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/kontrakter/${kontrakt.id}/rediger`}
                              className="text-blue-600 hover:text-blue-900"
                              aria-label={`Rediger kontrakt ${kontrakt.id}`}
                            >
                              <FiSearch className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteKontrakt(kontrakt.id)}
                              className="text-red-600 hover:text-red-900"
                              aria-label={`Slett kontrakt ${kontrakt.id}`}
                            >
                              <FiX className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-2 py-1 flex items-center justify-between border-t border-gray-200 sm:px-2">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setFilters((prev: KontraktFilters) => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                disabled={filters.page === 1}
                className="btn btn-secondary"
                aria-label="Forrige side"
              >
                Forrige
              </button>
              <button
                onClick={() => setFilters((prev: KontraktFilters) => ({ ...prev, page: Math.min(totalPages, (prev.page || 1) + 1) }))}
                disabled={filters.page === totalPages}
                className="btn btn-secondary"
                aria-label="Neste side"
              >
                Neste
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Viser <span className="font-medium">{((filters.page || 1) - 1) * (filters.limit || 20) + 1}</span> til{' '}
                  <span className="font-medium">
                    {Math.min((filters.page || 1) * (filters.limit || 20), totalCount)}
                  </span>{' '}
                  av <span className="font-medium">{totalCount}</span> resultater
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Paginering">
                  <button
                    onClick={() => setFilters((prev: KontraktFilters) => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                    disabled={filters.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Forrige side"
                  >
                    Forrige
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    const isCurrentPage = pageNum === filters.page;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setFilters((prev: KontraktFilters) => ({ ...prev, page: pageNum }))}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          isCurrentPage
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                        aria-label={`Side ${pageNum}`}
                        aria-current={isCurrentPage ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setFilters((prev: KontraktFilters) => ({ ...prev, page: Math.min(totalPages, (prev.page || 1) + 1) }))}
                    disabled={filters.page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Neste side"
                  >
                    Neste
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KontraktOversikt; 