import React, { useState, useEffect } from 'react';
import { 
  CogIcon, 
  ShieldCheckIcon, 
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { middlewareService, MiddlewareStatus, MiddlewareConfig, BlockedIP, MiddlewareLog } from '../../services/middleware';
import { useApi } from '../../hooks/useApi';
import { DataTable } from '../../components/common/DataTable';
import { StatCard } from '../../components/common/StatCard';

interface TabProps {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: TabProps[] = [
  { id: 'overview', name: 'Oversikt', icon: CogIcon },
  { id: 'config', name: 'Konfigurasjon', icon: ShieldCheckIcon },
  { id: 'security', name: 'Sikkerhet', icon: ExclamationTriangleIcon },
  { id: 'logs', name: 'Logger', icon: DocumentTextIcon },
];

export default function MiddlewarePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [config, setConfig] = useState<MiddlewareConfig | null>(null);
  const [status, setStatus] = useState<MiddlewareStatus | null>(null);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [logs, setLogs] = useState<MiddlewareLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { execute: loadData } = useApi(
    () => middlewareService.getStatus(),
    { immediate: false }
  );

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [configRes, statusRes, blockedIPsRes, logsRes] = await Promise.all([
        middlewareService.getConfig(),
        middlewareService.getStatus(),
        middlewareService.getBlockedIPs(),
        middlewareService.getLogs('info', 50)
      ]);

      setConfig(configRes.data);
      setStatus(statusRes.data);
      setBlockedIPs(blockedIPsRes.data);
      setLogs(logsRes.data);
    } catch (err: any) {
      setError(err.message || 'Feil ved lasting av data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSecurity = async (enabled: boolean) => {
    try {
      await middlewareService.toggleSecurity(enabled);
      await loadInitialData(); // Reload data
    } catch (err: any) {
      setError(err.message || 'Feil ved endring av sikkerhetsmiddleware');
    }
  };

  const handleClearBlocks = async () => {
    if (!confirm('Er du sikker på at du vil fjerne alle IP-blokkeringer?')) return;
    
    try {
      await middlewareService.clearSecurityBlocks();
      await loadInitialData(); // Reload data
    } catch (err: any) {
      setError(err.message || 'Feil ved fjerning av blokkeringer');
    }
  };

  const handleUnblockIP = async (ip: string) => {
    try {
      await middlewareService.unblockIP(ip);
      await loadInitialData(); // Reload data
    } catch (err: any) {
      setError(err.message || 'Feil ved fjerning av IP-blokkering');
    }
  };

  const handleRestartServices = async () => {
    if (!confirm('Er du sikker på at du vil starte alle middleware-tjenester på nytt?')) return;
    
    try {
      await middlewareService.restartServices();
      await loadInitialData(); // Reload data
    } catch (err: any) {
      setError(err.message || 'Feil ved omstart av tjenester');
    }
  };

  const handleConfigUpdate = async (newConfig: Partial<MiddlewareConfig>) => {
    try {
      const response = await middlewareService.updateConfig(newConfig);
      setConfig(response.data);
      await loadInitialData(); // Reload status
    } catch (err: any) {
      setError(err.message || 'Feil ved oppdatering av konfigurasjon');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Middleware-administrasjon</h1>
          <p className="text-gray-600">Administrer og overvåk alle middleware-tjenester</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadInitialData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Oppdater
          </button>
          <button
            onClick={handleRestartServices}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Restart tjenester
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Feil</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
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
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <OverviewTab status={status} onToggleSecurity={handleToggleSecurity} />
        )}
        {activeTab === 'config' && (
          <ConfigTab config={config} onUpdate={handleConfigUpdate} />
        )}
        {activeTab === 'security' && (
          <SecurityTab 
            blockedIPs={blockedIPs} 
            onUnblockIP={handleUnblockIP}
            onClearBlocks={handleClearBlocks}
          />
        )}
        {activeTab === 'logs' && (
          <LogsTab logs={logs} onRefresh={loadInitialData} />
        )}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ 
  status, 
  onToggleSecurity 
}: { 
  status: MiddlewareStatus | null;
  onToggleSecurity: (enabled: boolean) => void;
}) {
  if (!status) return <div>Ingen data tilgjengelig</div>;

  const services = Object.values(status);
  const activeServices = services.filter(s => s.status === 'active').length;
  const disabledServices = services.filter(s => s.status === 'disabled').length;
  const errorServices = services.filter(s => s.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Totale tjenester"
          value={services.length}
          icon={<CogIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Aktive tjenester"
          value={activeServices}
          icon={<CheckCircleIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Deaktiverte tjenester"
          value={disabledServices}
          icon={<XCircleIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Tjenester med feil"
          value={errorServices}
          icon={<ExclamationTriangleIcon className="w-6 h-6" />}
        />
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(status).map(([key, service]) => (
          <div key={key} className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    service.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : service.status === 'disabled'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {service.status === 'active' ? 'Aktiv' : service.status === 'disabled' ? 'Deaktivert' : 'Feil'}
                </span>
                {key === 'security' && (
                  <button
                    onClick={() => onToggleSecurity(!service.config.enabled)}
                    className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                      service.config.enabled
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {service.config.enabled ? 'Deaktiver' : 'Aktiver'}
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{service.description}</p>
            
            {/* Metrics */}
            <div className="space-y-2">
              {Object.entries(service.metrics).map(([metricKey, metricValue]) => (
                <div key={metricKey} className="flex justify-between text-sm">
                  <span className="text-gray-500 capitalize">{metricKey.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                  <span className="text-gray-900 font-medium">
                    {typeof metricValue === 'object' ? JSON.stringify(metricValue) : String(metricValue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Config Tab Component
function ConfigTab({ 
  config, 
  onUpdate 
}: { 
  config: MiddlewareConfig | null;
  onUpdate: (config: Partial<MiddlewareConfig>) => void;
}) {
  const [localConfig, setLocalConfig] = useState<MiddlewareConfig | null>(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  if (!localConfig) return <div>Ingen konfigurasjon tilgjengelig</div>;

  const handleSave = () => {
    onUpdate(localConfig);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Middleware-konfigurasjon</h2>
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Lagre endringer
        </button>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sikkerhet</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localConfig.security.enabled}
              onChange={(e) => setLocalConfig({
                ...localConfig,
                security: { ...localConfig.security, enabled: e.target.checked }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Sikkerhetsmiddleware aktivert</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localConfig.security.ipBlocking}
              onChange={(e) => setLocalConfig({
                ...localConfig,
                security: { ...localConfig.security, ipBlocking: e.target.checked }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">IP-blokkering</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localConfig.security.threatDetection}
              onChange={(e) => setLocalConfig({
                ...localConfig,
                security: { ...localConfig.security, threatDetection: e.target.checked }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Trusseldeteksjon</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localConfig.security.rateLimiting}
              onChange={(e) => setLocalConfig({
                ...localConfig,
                security: { ...localConfig.security, rateLimiting: e.target.checked }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Rate limiting</span>
          </label>
        </div>
      </div>

      {/* Authentication Settings */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Autentisering</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sesjon timeout (ms)</label>
            <input
              type="number"
              value={localConfig.authentication.sessionTimeout}
              onChange={(e) => setLocalConfig({
                ...localConfig,
                authentication: { ...localConfig.authentication, sessionTimeout: parseInt(e.target.value) }
              })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Maks innloggingsforsøk</label>
            <input
              type="number"
              value={localConfig.authentication.maxLoginAttempts}
              onChange={(e) => setLocalConfig({
                ...localConfig,
                authentication: { ...localConfig.authentication, maxLoginAttempts: parseInt(e.target.value) }
              })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Logging Settings */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Logging</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Log-nivå</label>
            <select
              value={localConfig.logging.level}
              onChange={(e) => setLocalConfig({
                ...localConfig,
                logging: { ...localConfig.logging, level: e.target.value }
              })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localConfig.logging.requestLogging}
                onChange={(e) => setLocalConfig({
                  ...localConfig,
                  logging: { ...localConfig.logging, requestLogging: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Request logging</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localConfig.logging.auditLogging}
                onChange={(e) => setLocalConfig({
                  ...localConfig,
                  logging: { ...localConfig.logging, auditLogging: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Audit logging</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// Security Tab Component
function SecurityTab({ 
  blockedIPs, 
  onUnblockIP, 
  onClearBlocks 
}: { 
  blockedIPs: BlockedIP[];
  onUnblockIP: (ip: string) => void;
  onClearBlocks: () => void;
}) {
  const blockedIPColumns = [
    { key: 'ip', title: 'IP-adresse', label: 'IP-adresse' },
    { key: 'reason', title: 'Årsak', label: 'Årsak' },
    { 
      key: 'blockedAt', 
      title: 'Blokkert', 
      label: 'Blokkert',
      render: (value: string) => new Date(value).toLocaleString('nb-NO')
    },
    { 
      key: 'permanent', 
      title: 'Permanent', 
      label: 'Permanent',
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value ? 'Ja' : 'Nei'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Sikkerhetshendelser</h2>
        {blockedIPs.length > 0 && (
          <button
            onClick={onClearBlocks}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Fjern alle blokkeringer
          </button>
        )}
      </div>

      {blockedIPs.length === 0 ? (
        <div className="text-center py-12">
          <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen blokkerte IP-adresser</h3>
          <p className="mt-1 text-sm text-gray-500">Alle IP-adresser har tilgang til systemet.</p>
        </div>
      ) : (
        <DataTable
          data={blockedIPs}
          columns={blockedIPColumns}
          loading={false}
        />
      )}
    </div>
  );
}

// Logs Tab Component
function LogsTab({ 
  logs, 
  onRefresh 
}: { 
  logs: MiddlewareLog[];
  onRefresh: () => void;
}) {
  const [selectedLevel, setSelectedLevel] = useState('all');

  const filteredLogs = selectedLevel === 'all' 
    ? logs 
    : logs.filter(log => log.level === selectedLevel);

  const logColumns = [
    { 
      key: 'timestamp', 
      title: 'Tidspunkt', 
      label: 'Tidspunkt',
      render: (value: string) => new Date(value).toLocaleString('nb-NO')
    },
    { 
      key: 'level', 
      title: 'Nivå', 
      label: 'Nivå',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'error' ? 'bg-red-100 text-red-800' :
          value === 'warn' ? 'bg-yellow-100 text-yellow-800' :
          value === 'info' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value.toUpperCase()}
        </span>
      )
    },
    { key: 'service', title: 'Tjeneste', label: 'Tjeneste' },
    { key: 'message', title: 'Melding', label: 'Melding' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Middleware-logger</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">Alle nivåer</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
          </select>
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Oppdater
          </button>
        </div>
      </div>

      <DataTable
        data={filteredLogs}
        columns={logColumns}
        loading={false}
      />
    </div>
  );
} 