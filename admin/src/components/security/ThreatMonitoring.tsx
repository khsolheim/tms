import React, { useState } from 'react';
import { 
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  MapPinIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { DataTable, Column } from '../common/DataTable';
import { usePaginatedApi } from '../../hooks/useApi';
import { securityService } from '../../services/security';
import { SecurityThreat } from '../../types/admin';

export const ThreatMonitoring: React.FC = () => {
  const [selectedThreats, setSelectedThreats] = useState<SecurityThreat[]>([]);
  const [mitigating, setMitigating] = useState<string | null>(null);

  // Fetch security threats
  const {
    data: threats,
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
    (params) => securityService.getSecurityThreats(params),
    { immediate: true }
  );

  const handleMitigateThreat = async (threat: SecurityThreat, action: string) => {
    if (!window.confirm(`Er du sikker på at du vil ${action} truslen "${threat.description}"?`)) {
      return;
    }

    setMitigating(threat.id);
    try {
      await securityService.mitigateThreat(threat.id, action);
      refresh();
    } catch (error: any) {
      alert(`Feil ved håndtering av trussel: ${error.message}`);
    } finally {
      setMitigating(null);
    }
  };

  const handleMarkFalsePositive = async (threat: SecurityThreat) => {
    if (!window.confirm(`Er du sikker på at du vil markere "${threat.description}" som falsk positiv?`)) {
      return;
    }

    try {
      await securityService.markThreatAsFalsePositive(threat.id);
      refresh();
    } catch (error: any) {
      alert(`Feil ved markering som falsk positiv: ${error.message}`);
    }
  };

  const handleBulkMitigation = async (action: string, threats: SecurityThreat[]) => {
    if (!window.confirm(`Er du sikker på at du vil ${action} ${threats.length} trusler?`)) {
      return;
    }

    try {
      for (const threat of threats) {
        await securityService.mitigateThreat(threat.id, action);
      }
      setSelectedThreats([]);
      refresh();
      alert(`${action} utført for ${threats.length} trusler`);
    } catch (error: any) {
      alert(`Feil ved bulk ${action}: ${error.message}`);
    }
  };

  const getSeverityIcon = (severity: SecurityThreat['severity']) => {
    switch (severity) {
      case 'critical':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      case 'high':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <ShieldExclamationIcon className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <ExclamationTriangleIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: SecurityThreat['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: SecurityThreat['status']) => {
    switch (status) {
      case 'active':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      case 'mitigated':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'false_positive':
        return <XMarkIcon className="w-4 h-4 text-gray-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: SecurityThreat['status']) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800';
      case 'mitigated':
        return 'bg-green-100 text-green-800';
      case 'false_positive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTypeIcon = (type: SecurityThreat['type']) => {
    switch (type) {
      case 'brute_force':
        return '🔨';
      case 'suspicious_activity':
        return '🕵️';
      case 'malware':
        return '🦠';
      case 'ddos':
        return '💥';
      case 'unauthorized_access':
        return '🚫';
      default:
        return '⚠️';
    }
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

  const columns: Column<SecurityThreat>[] = [
    {
      key: 'timestamp',
      title: 'Tidspunkt',
      sortable: true,
      width: '160px',
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
      key: 'type',
      title: 'Type',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getTypeIcon(value)}</span>
          <span className="text-sm font-medium text-gray-900 capitalize">
            {value.replace('_', ' ')}
          </span>
        </div>
      )
    },
    {
      key: 'severity',
      title: 'Alvorlighet',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          {getSeverityIcon(value)}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(value)}`}>
            {value === 'critical' ? 'Kritisk' : 
             value === 'high' ? 'Høy' :
             value === 'medium' ? 'Medium' : 'Lav'}
          </span>
        </div>
      )
    },
    {
      key: 'source',
      title: 'Kilde',
      render: (value) => (
        <div className="flex items-center space-x-1">
          <MapPinIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-mono text-gray-600">{value}</span>
        </div>
      )
    },
    {
      key: 'target',
      title: 'Mål',
      render: (value) => (
        <span className="text-sm text-gray-900">{value}</span>
      )
    },
    {
      key: 'description',
      title: 'Beskrivelse',
      render: (value) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-900 truncate" title={value}>
            {value}
          </p>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(value)}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
            {value === 'active' ? 'Aktiv' :
             value === 'mitigated' ? 'Håndtert' : 'Falsk positiv'}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Handlinger',
      render: (value, row) => (
        <div className="flex flex-wrap gap-1">
          {row.actions.slice(0, 2).map((action, index) => (
            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {action}
            </span>
          ))}
          {row.actions.length > 2 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              +{row.actions.length - 2}
            </span>
          )}
        </div>
      )
    }
  ];

  const actions = [
    {
      label: 'Detaljer',
      icon: <EyeIcon className="w-4 h-4" />,
      onClick: (threat: SecurityThreat) => {
        alert(`Detaljer for trussel: ${JSON.stringify(threat, null, 2)}`);
      },
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      label: 'Blokker IP',
      icon: <NoSymbolIcon className="w-4 h-4" />,
      onClick: (threat: SecurityThreat) => handleMitigateThreat(threat, 'block_ip'),
      show: (threat: SecurityThreat) => threat.status === 'active' && Boolean(threat.source),
      className: 'text-red-600 hover:text-red-900'
    },
    {
      label: 'Håndter',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      onClick: (threat: SecurityThreat) => handleMitigateThreat(threat, 'mitigate'),
      show: (threat: SecurityThreat) => threat.status === 'active',
      className: 'text-green-600 hover:text-green-900'
    },
    {
      label: 'Falsk Positiv',
      icon: <XMarkIcon className="w-4 h-4" />,
      onClick: handleMarkFalsePositive,
      show: (threat: SecurityThreat) => threat.status === 'active',
      className: 'text-gray-600 hover:text-gray-900'
    }
  ];

  const bulkActions = [
    {
      label: 'Håndter Valgte',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      onClick: (threats: SecurityThreat[]) => handleBulkMitigation('mitigate', threats),
      className: 'bg-green-600 text-white hover:bg-green-700'
    },
    {
      label: 'Blokker IP-er',
      icon: <NoSymbolIcon className="w-4 h-4" />,
      onClick: (threats: SecurityThreat[]) => handleBulkMitigation('block_ip', threats),
      className: 'bg-red-600 text-white hover:bg-red-700'
    },
    {
      label: 'Marker som Falsk Positiv',
      icon: <XMarkIcon className="w-4 h-4" />,
      onClick: (threats: SecurityThreat[]) => handleBulkMitigation('false_positive', threats),
      className: 'bg-gray-600 text-white hover:bg-gray-700'
    }
  ];

  const tableFilters = [
    {
      key: 'type',
      label: 'Type',
      type: 'select' as const,
      options: [
        { value: 'brute_force', label: 'Brute Force' },
        { value: 'suspicious_activity', label: 'Mistenkelig Aktivitet' },
        { value: 'malware', label: 'Malware' },
        { value: 'ddos', label: 'DDoS' },
        { value: 'unauthorized_access', label: 'Uautorisert Tilgang' }
      ]
    },
    {
      key: 'severity',
      label: 'Alvorlighet',
      type: 'select' as const,
      options: [
        { value: 'critical', label: 'Kritisk' },
        { value: 'high', label: 'Høy' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Lav' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Aktiv' },
        { value: 'mitigated', label: 'Håndtert' },
        { value: 'false_positive', label: 'Falsk Positiv' }
      ]
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

  const activeThreatCount = threats?.filter(t => t.status === 'active').length || 0;
  const criticalThreatCount = threats?.filter(t => t.severity === 'critical').length || 0;
  const mitigatedThreatCount = threats?.filter(t => t.status === 'mitigated').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Trusselovervåking</h2>
          <p className="mt-1 text-sm text-gray-500">
            Overvåk og håndter sikkerhetstrusler i sanntid
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Oppdater
        </button>
      </div>

      {/* Threat Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Aktive Trusler
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {activeThreatCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className={`px-5 py-3 ${activeThreatCount > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
            <div className="text-sm">
              <span className={`font-medium ${activeThreatCount > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {activeThreatCount > 0 ? 'Krever oppmerksomhet' : 'Ingen aktive trusler'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldExclamationIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Kritiske Trusler
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {criticalThreatCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className={`px-5 py-3 ${criticalThreatCount > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
            <div className="text-sm">
              <span className={`font-medium ${criticalThreatCount > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {criticalThreatCount > 0 ? 'Umiddelbar handling' : 'Ingen kritiske'}
              </span>
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
                    Håndterte Trusler
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mitigatedThreatCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium">
                Siste 24 timer
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Responstid
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    2.3 min
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-blue-600 font-medium">
                Gjennomsnitt
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Threats Alert */}
      {criticalThreatCount > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Kritiske trusler detektert!
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  {criticalThreatCount} kritiske trusler krever umiddelbar oppmerksomhet. 
                  Vennligst gjennomgå og håndter disse så snart som mulig.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Threats Table */}
      <DataTable
        data={threats || []}
        columns={columns}
        loading={loading}
        pagination={{
          page,
          limit,
          total,
          totalPages
        }}
        filters={tableFilters}
        actions={actions}
        selectable={true}
        selectedRows={selectedThreats}
        onSelectionChange={setSelectedThreats}
        bulkActions={bulkActions}
        onPageChange={goToPage}
        onLimitChange={setLimit}
        emptyMessage="Ingen trusler funnet"
        className="bg-white"
        rowClassName={(row) => 
          row.severity === 'critical' ? 'bg-red-50 hover:bg-red-100' :
          row.severity === 'high' ? 'bg-yellow-50 hover:bg-yellow-100' : ''
        }
      />
    </div>
  );
}; 