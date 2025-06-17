import React, { useState } from 'react';
import {
  CogIcon,
  ServerIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  WrenchIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CloudIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatCard } from '../../components/common/StatCard';
import { usePaginatedApi } from '../../hooks/useApi';
import { servicesService } from '../../services/services';
import { Service } from '../../types/admin';

export const ServicesPage: React.FC = () => {
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'microservices' | 'monitoring' | 'logs'>('overview');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Fetch services
  const {
    data: services,
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
    (params) => servicesService.getServices(params).then(data => ({ success: true, data: data.data, pagination: data.pagination })),
    { immediate: true }
  );

  const handleServiceAction = async (service: Service, action: 'start' | 'stop' | 'restart' | 'maintenance') => {
    const actionText = {
      start: 'starte',
      stop: 'stoppe',
      restart: 'restarte',
      maintenance: 'sette i vedlikeholdsmodus'
    }[action];

    if (!window.confirm(`Er du sikker på at du vil ${actionText} tjenesten "${service.navn}"?`)) {
      return;
    }

    setActionInProgress(service.id.toString());
    try {
      await servicesService.performServiceAction(service.id, action);
      refresh();
      alert(`Tjeneste "${service.navn}" ${actionText} vellykket`);
    } catch (error: any) {
      alert(`Feil ved ${actionText} av tjeneste: ${error.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleBulkAction = async (action: string, services: Service[]) => {
    if (!window.confirm(`Er du sikker på at du vil ${action} ${services.length} tjenester?`)) {
      return;
    }

    try {
      for (const service of services) {
        await servicesService.performServiceAction(service.id, action as any);
      }
      setSelectedServices([]);
      refresh();
      alert(`${action} utført for ${services.length} tjenester`);
    } catch (error: any) {
      alert(`Feil ved bulk ${action}: ${error.message}`);
    }
  };

  const getStatusIcon = (status: Service['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'INACTIVE':
        return <XMarkIcon className="w-5 h-5 text-red-500" />;
      case 'MAINTENANCE':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <CogIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Service['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'microservice':
        return <ServerIcon className="w-5 h-5 text-blue-500" />;
      case 'api':
        return <CloudIcon className="w-5 h-5 text-purple-500" />;
      case 'security':
        return <ShieldCheckIcon className="w-5 h-5 text-red-500" />;
      case 'monitoring':
        return <ChartBarIcon className="w-5 h-5 text-green-500" />;
      default:
        return <CogIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const columns: Column<Service>[] = [
    {
      key: 'navn',
      title: 'Tjenestenavn',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          {getServiceTypeIcon(row.type)}
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">{row.type}</div>
          </div>
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
            {value === 'ACTIVE' ? 'Aktiv' : 
             value === 'INACTIVE' ? 'Inaktiv' : 'Vedlikehold'}
          </span>
        </div>
      )
    },
    {
      key: 'versjon',
      title: 'Versjon',
      render: (value) => (
        <span className="text-sm font-mono text-gray-600">{value}</span>
      )
    },
    {
      key: 'aktiveBedrifter',
      title: 'Aktive Bedrifter',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-900">{value.toLocaleString()}</span>
      )
    },
    {
      key: 'totalBrukere',
      title: 'Totale Brukere',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-900">{value.toLocaleString()}</span>
      )
    },
    {
      key: 'sistOppdatert',
      title: 'Sist Oppdatert',
      sortable: true,
      render: (value) => (
        <div>
          <div className="text-sm text-gray-900">
            {new Date(value).toLocaleDateString('nb-NO')}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(value).toLocaleTimeString('nb-NO')}
          </div>
        </div>
      )
    },
    {
      key: 'beskrivelse',
      title: 'Beskrivelse',
      render: (value) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-900 truncate" title={value}>
            {value}
          </p>
        </div>
      )
    }
  ];

  const actions = [
    {
      label: 'Detaljer',
      icon: <EyeIcon className="w-4 h-4" />,
      onClick: (service: Service) => {
        alert(`Detaljer for tjeneste: ${JSON.stringify(service, null, 2)}`);
      },
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      label: 'Start',
      icon: <PlayIcon className="w-4 h-4" />,
      onClick: (service: Service) => handleServiceAction(service, 'start'),
      show: (service: Service) => service.status !== 'ACTIVE',
      className: 'text-green-600 hover:text-green-900'
    },
    {
      label: 'Stopp',
      icon: <StopIcon className="w-4 h-4" />,
      onClick: (service: Service) => handleServiceAction(service, 'stop'),
      show: (service: Service) => service.status === 'ACTIVE',
      className: 'text-red-600 hover:text-red-900'
    },
    {
      label: 'Restart',
      icon: <ArrowPathIcon className="w-4 h-4" />,
      onClick: (service: Service) => handleServiceAction(service, 'restart'),
      show: (service: Service) => service.status === 'ACTIVE',
      className: 'text-orange-600 hover:text-orange-900'
    },
    {
      label: 'Vedlikehold',
      icon: <WrenchIcon className="w-4 h-4" />,
      onClick: (service: Service) => handleServiceAction(service, 'maintenance'),
      show: (service: Service) => service.status === 'ACTIVE',
      className: 'text-yellow-600 hover:text-yellow-900'
    },
    {
      label: 'Konfigurasjon',
      icon: <CogIcon className="w-4 h-4" />,
      onClick: (service: Service) => {
        alert(`Åpner konfigurasjon for ${service.navn}`);
      },
      className: 'text-purple-600 hover:text-purple-900'
    }
  ];

  const bulkActions = [
    {
      label: 'Start Valgte',
      icon: <PlayIcon className="w-4 h-4" />,
      onClick: (services: Service[]) => handleBulkAction('start', services),
      className: 'bg-green-600 text-white hover:bg-green-700'
    },
    {
      label: 'Stopp Valgte',
      icon: <StopIcon className="w-4 h-4" />,
      onClick: (services: Service[]) => handleBulkAction('stop', services),
      className: 'bg-red-600 text-white hover:bg-red-700'
    },
    {
      label: 'Restart Valgte',
      icon: <ArrowPathIcon className="w-4 h-4" />,
      onClick: (services: Service[]) => handleBulkAction('restart', services),
      className: 'bg-orange-600 text-white hover:bg-orange-700'
    }
  ];

  const tableFilters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'ACTIVE', label: 'Aktiv' },
        { value: 'INACTIVE', label: 'Inaktiv' },
        { value: 'MAINTENANCE', label: 'Vedlikehold' }
      ]
    },
    {
      key: 'type',
      label: 'Type',
      type: 'select' as const,
      options: [
        { value: 'microservice', label: 'Microservice' },
        { value: 'api', label: 'API' },
        { value: 'security', label: 'Sikkerhet' },
        { value: 'monitoring', label: 'Overvåking' }
      ]
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Oversikt', icon: ServerIcon },
    { id: 'microservices', name: 'Microservices', icon: CogIcon },
    { id: 'monitoring', name: 'Overvåking', icon: ChartBarIcon },
    { id: 'logs', name: 'Logger', icon: DocumentTextIcon }
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

  const activeServices = services?.filter(s => s.status === 'ACTIVE').length || 0;
  const inactiveServices = services?.filter(s => s.status === 'INACTIVE').length || 0;
  const maintenanceServices = services?.filter(s => s.status === 'MAINTENANCE').length || 0;
  const totalUsers = services?.reduce((sum, s) => sum + s.totalBrukere, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tjenester</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administrer og overvåk alle systemtjenester
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Oppdater
          </button>
          <button
            onClick={() => alert('Åpner tjeneste-konfigurasjon')}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <CogIcon className="w-4 h-4 mr-2" />
            Konfigurer
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {(loading) ? (
        <div className="flex justify-center items-center py-8">
          <span className="text-gray-500">Laster statistikk...</span>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-8">
          <span className="text-red-500">Feil ved lasting av statistikk: {error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Aktive Tjenester"
            value={activeServices}
            icon={<CheckCircleIcon className="w-6 h-6 text-green-400" />}
          />
          <StatCard
            title="Inaktive Tjenester"
            value={inactiveServices}
            icon={<XMarkIcon className="w-6 h-6 text-red-400" />}
          />
          <StatCard
            title="Vedlikehold"
            value={maintenanceServices}
            icon={<WrenchIcon className="w-6 h-6 text-yellow-400" />}
          />
          <StatCard
            title="Totale Brukere"
            value={totalUsers}
            icon={<ServerIcon className="w-6 h-6 text-blue-400" />}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Critical Services Alert */}
          {inactiveServices > 0 && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Kritiske tjenester er nede!
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      {inactiveServices} tjenester er for øyeblikket inaktive. 
                      Vennligst sjekk og start disse så snart som mulig.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Services Table */}
          <DataTable
            data={services || []}
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
            selectedRows={selectedServices}
            onSelectionChange={setSelectedServices}
            bulkActions={bulkActions}
            onPageChange={goToPage}
            onLimitChange={setLimit}
            emptyMessage="Ingen tjenester funnet"
            className="bg-white"
            rowClassName={(row) => 
              row.status === 'INACTIVE' ? 'bg-red-50 hover:bg-red-100' :
              row.status === 'MAINTENANCE' ? 'bg-yellow-50 hover:bg-yellow-100' : ''
            }
          />
        </div>
      )}

      {activeTab === 'microservices' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Microservices Arkitektur</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services?.filter(s => s.type === 'microservice').map((service) => (
              <div key={service.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{service.navn}</h4>
                  {getStatusIcon(service.status)}
                </div>
                <p className="text-sm text-gray-600 mb-3">{service.beskrivelse}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>v{service.versjon}</span>
                  <span>{service.aktiveBedrifter} bedrifter</span>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => handleServiceAction(service, 'restart')}
                    disabled={actionInProgress === service.id.toString()}
                    className="flex-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                  >
                    Restart
                  </button>
                  <button
                    onClick={() => alert(`Åpner logger for ${service.navn}`)}
                    className="flex-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Logger
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tjeneste Overvåking</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Ytelse Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">CPU Bruk</span>
                  {/* TODO: Hent fra backend/systemService.getSystemMetrics() */}
                  <span className="text-sm font-medium text-gray-900">-</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  {/* Placeholder for CPU bruk */}
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Minne Bruk</span>
                  {/* TODO: Hent fra backend/systemService.getSystemMetrics() */}
                  <span className="text-sm font-medium text-gray-900">-</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  {/* Placeholder for minne bruk */}
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Responstid</span>
                  {/* TODO: Hent fra backend/systemService.getSystemMetrics() */}
                  <span className="text-sm font-medium text-gray-900">-</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  {/* Placeholder for responstid */}
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Tjeneste Helse</h4>
              <div className="space-y-2">
                {services?.slice(0, 5).map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-900">{service.navn}</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(service.status)}
                      <span className="text-xs text-gray-500">
                        {Math.floor(Math.random() * 100)}% uptime
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tjeneste Logger</h3>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <select className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                <option>Alle tjenester</option>
                {services?.map((service) => (
                  <option key={service.id} value={service.id}>{service.navn}</option>
                ))}
              </select>
              <select className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                <option>Alle nivåer</option>
                <option>ERROR</option>
                <option>WARN</option>
                <option>INFO</option>
                <option>DEBUG</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Filtrer
              </button>
            </div>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              <div className="space-y-1">
                <div>[2024-01-15 10:30:15] INFO  - Auth Service: User login successful (user_id: 123)</div>
                <div>[2024-01-15 10:30:12] WARN  - Database Service: Connection pool at 80% capacity</div>
                <div>[2024-01-15 10:30:10] INFO  - API Gateway: Request processed in 145ms</div>
                <div>[2024-01-15 10:30:08] ERROR - Email Service: SMTP connection failed, retrying...</div>
                <div>[2024-01-15 10:30:05] INFO  - Quiz Service: New quiz created (quiz_id: 456)</div>
                <div>[2024-01-15 10:30:02] DEBUG - Cache Service: Cache hit ratio: 94.2%</div>
                <div>[2024-01-15 10:30:00] INFO  - Security Service: Threat scan completed, 0 issues found</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 