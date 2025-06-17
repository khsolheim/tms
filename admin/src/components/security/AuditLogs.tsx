import React, { useState } from 'react';
import { 
  DocumentTextIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { DataTable, Column } from '../common/DataTable';
import { usePaginatedApi } from '../../hooks/useApi';
import { securityService } from '../../services/security';
import { AuditLog } from '../../types/admin';

export const AuditLogs: React.FC = () => {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    userId: '',
    action: '',
    success: ''
  });
  const [exporting, setExporting] = useState(false);

  // Fetch audit logs
  const {
    data: logs,
    loading,
    error,
    page,
    limit,
    total,
    totalPages,
    goToPage,
    setLimit,
    refresh
  } = usePaginatedApi(
    (params) => securityService.getAuditLogs({ ...params, ...filters }),
    { 
      immediate: true,
      dependencies: [filters]
    }
  );

  const handleExport = async () => {
    if (!filters.dateFrom || !filters.dateTo) {
      alert('Velg datoperiode for eksport');
      return;
    }

    setExporting(true);
    try {
      await securityService.exportAuditLogs({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        format: 'csv'
      });
      // TODO: Handle file download
      alert('Audit logs eksportert');
    } catch (error: any) {
      alert(`Feil ved eksport: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
      case 'logout':
        return '🔐';
      case 'create':
      case 'add':
        return '➕';
      case 'update':
      case 'edit':
        return '✏️';
      case 'delete':
      case 'remove':
        return '🗑️';
      case 'view':
      case 'read':
        return '👁️';
      case 'export':
      case 'download':
        return '📥';
      case 'import':
      case 'upload':
        return '📤';
      default:
        return '📋';
    }
  };

  const getSuccessIcon = (success: boolean) => {
    return success ? (
      <CheckCircleIcon className="w-4 h-4 text-green-500" />
    ) : (
      <XCircleIcon className="w-4 h-4 text-red-500" />
    );
  };

  const getSuccessColor = (success: boolean) => {
    return success 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Akkurat nå';
    if (diffInMinutes < 60) return `${diffInMinutes} min siden`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} timer siden`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} dager siden`;
    
    return time.toLocaleDateString('nb-NO');
  };

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      title: 'Tidspunkt',
      sortable: true,
      width: '180px',
      render: (value) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {new Date(value).toLocaleDateString('nb-NO')}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(value).toLocaleTimeString('nb-NO')}
          </div>
          <div className="text-xs text-gray-400">
            {formatTimeAgo(value)}
          </div>
        </div>
      )
    },
    {
      key: 'userName',
      title: 'Bruker',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">ID: {row.userId}</div>
        </div>
      )
    },
    {
      key: 'action',
      title: 'Handling',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getActionIcon(value)}</span>
          <span className="text-sm font-medium text-gray-900">{value}</span>
        </div>
      )
    },
    {
      key: 'resource',
      title: 'Ressurs',
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'success',
      title: 'Status',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          {getSuccessIcon(value)}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSuccessColor(value)}`}>
            {value ? 'Suksess' : 'Feil'}
          </span>
        </div>
      )
    },
    {
      key: 'ipAddress',
      title: 'IP Adresse',
      render: (value) => (
        <span className="text-sm font-mono text-gray-600">{value}</span>
      )
    },
    {
      key: 'details',
      title: 'Detaljer',
      render: (value) => {
        if (!value || Object.keys(value).length === 0) {
          return <span className="text-gray-400">-</span>;
        }
        
        return (
          <details className="text-xs">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
              Vis detaljer
            </summary>
            <div className="mt-1 p-2 bg-gray-50 rounded border max-w-xs">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          </details>
        );
      }
    }
  ];

  const tableFilters = [
    {
      key: 'action',
      label: 'Handling',
      type: 'select' as const,
      options: [
        { value: 'LOGIN', label: 'Innlogging' },
        { value: 'LOGOUT', label: 'Utlogging' },
        { value: 'CREATE', label: 'Opprett' },
        { value: 'UPDATE', label: 'Oppdater' },
        { value: 'DELETE', label: 'Slett' },
        { value: 'VIEW', label: 'Vis' },
        { value: 'EXPORT', label: 'Eksporter' }
      ]
    },
    {
      key: 'success',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'true', label: 'Suksess' },
        { value: 'false', label: 'Feil' }
      ]
    },
    {
      key: 'search',
      label: 'Søk',
      type: 'text' as const,
      placeholder: 'Søk i brukernavn, handling eller ressurs...'
    }
  ];

  if (error) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Feil ved lasting</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <div className="mt-6">
          <button
            onClick={refresh}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Prøv igjen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Audit Logs</h2>
          <p className="mt-1 text-sm text-gray-500">
            Detaljert logg over alle sikkerhetshendelser og brukeraktivitet
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            {exporting ? 'Eksporterer...' : 'Eksporter'}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Totale Events
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {total || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Vellykkede
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {logs?.filter(log => log.success).length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Feilede
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {logs?.filter(log => !log.success).length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <InformationCircleIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Unike Brukere
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {new Set(logs?.map(log => log.userId)).size || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Filtrer etter dato</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fra dato
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Til dato
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ dateFrom: '', dateTo: '', userId: '', action: '', success: '' })}
              className="w-full px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Nullstill filter
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <DataTable
        data={logs || []}
        columns={columns}
        loading={loading}
        pagination={{
          page,
          limit,
          total,
          totalPages
        }}
        filters={tableFilters}
        onPageChange={goToPage}
        onLimitChange={setLimit}
        emptyMessage="Ingen audit logs funnet"
        className="bg-white"
        rowClassName={(row) => 
          !row.success ? 'bg-red-50 hover:bg-red-100' : ''
        }
      />

      {/* Export Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <InformationCircleIcon className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Eksport informasjon
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Audit logs kan eksporteres i CSV eller JSON format. 
                Velg datoperiode for å eksportere spesifikke tidsrom.
                Eksporterte filer inneholder alle tilgjengelige detaljer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 