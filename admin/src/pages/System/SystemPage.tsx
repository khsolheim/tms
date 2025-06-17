import React, { useState } from 'react';
import {
  CogIcon,
  ServerIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  PlayIcon,
  StopIcon,
  PauseIcon,
  TrashIcon,
  CloudArrowDownIcon,
  CloudArrowUpIcon,
  FolderIcon,
  ClockIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  BoltIcon,
  EnvelopeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { StatCard } from '../../components/common/StatCard';
import { DataTable, Column } from '../../components/common/DataTable';
import { useApi, usePaginatedApi } from '../../hooks/useApi';
import { systemService } from '../../services/system';
import { SystemConfiguration, BackupInfo, SystemLog } from '../../types/admin';

export const SystemPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'configuration' | 'backups' | 'logs' | 'maintenance'>('configuration');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Fetch system configuration
  const {
    data: systemConfig,
    loading: configLoading,
    error: configError,
    refresh: refreshConfig
  } = useApi(() => systemService.getSystemConfiguration().then(data => ({ success: true, data })), { immediate: true });

  // Fetch backups
  const {
    data: backups,
    loading: backupsLoading,
    error: backupsError,
    refresh: refreshBackups
  } = useApi(() => systemService.getBackups().then(data => ({ success: true, data })), { immediate: true });

  // Fetch logs with pagination
  const {
    data: logs,
    loading: logsLoading,
    error: logsError,
    page,
    limit,
    total,
    totalPages,
    goToPage,
    setLimit,
    refresh: refreshLogs
  } = usePaginatedApi(
    (params) => systemService.getLogs(params).then(data => ({ success: true, data: data.data, pagination: data.pagination })),
    { immediate: true }
  );

  const handleSystemAction = async (action: 'restart' | 'maintenance' | 'backup' | 'clearCache') => {
    const actionText = {
      restart: 'starte systemet på nytt',
      maintenance: 'aktivere vedlikeholdsmodus',
      backup: 'opprette backup',
      clearCache: 'tømme cache'
    }[action];

    if (!window.confirm(`Er du sikker på at du vil ${actionText}?`)) {
      return;
    }

    setActionInProgress(action);
    try {
      await systemService.performSystemAction(action);
      alert(`${actionText} utført vellykket`);
      refreshConfig();
    } catch (error: any) {
      alert(`Feil ved ${actionText}: ${error.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const tabs = [
    { id: 'configuration', name: 'Konfigurasjon', icon: CogIcon },
    { id: 'backups', name: 'Backup', icon: ServerIcon },
    { id: 'logs', name: 'Logger', icon: DocumentTextIcon },
    { id: 'maintenance', name: 'Vedlikehold', icon: WrenchScrewdriverIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administrer systemkonfigurasjon, backup og vedlikehold
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleSystemAction('clearCache')}
            disabled={actionInProgress === 'clearCache'}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <BoltIcon className="w-4 h-4 mr-2" />
            Tøm Cache
          </button>
          <button
            onClick={() => handleSystemAction('backup')}
            disabled={actionInProgress === 'backup'}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <CloudArrowUpIcon className="w-4 h-4 mr-2" />
            Opprett Backup
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {(configLoading || backupsLoading || logsLoading) ? (
        <div className="flex justify-center items-center py-8">
          <span className="text-gray-500">Laster statistikk...</span>
        </div>
      ) : (configError || backupsError || logsError) ? (
        <div className="flex justify-center items-center py-8">
          <span className="text-red-500">Feil ved lasting av statistikk: {configError || backupsError || logsError}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Vellykkede Backups"
            value={Array.isArray(backups) ? backups.filter((b: BackupInfo) => b.status === 'completed').length : '-'}
            icon={<CheckCircleIcon className="w-6 h-6 text-green-400" />}
          />
          <StatCard
            title="Feilede Backups"
            value={Array.isArray(backups) ? backups.filter((b: BackupInfo) => b.status === 'failed').length : '-'}
            icon={<XMarkIcon className="w-6 h-6 text-red-400" />}
          />
          <StatCard
            title="Feil i Logger"
            value={Array.isArray(logs) ? logs.filter((l: SystemLog) => l.level === 'error').length : '-'}
            icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-400" />}
          />
          <StatCard
            title="Advarsler"
            value={Array.isArray(logs) ? logs.filter((l: SystemLog) => l.level === 'warn').length : '-'}
            icon={<ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />}
          />
          <StatCard
            title="App-navn"
            value={systemConfig?.application?.name ?? '-'}
            icon={<ServerIcon className="w-6 h-6 text-blue-400" />}
          />
          <StatCard
            title="Miljø"
            value={systemConfig?.application?.environment ?? '-'}
            icon={<ServerIcon className="w-6 h-6 text-green-400" />}
          />
          <StatCard
            title="Database"
            value={systemConfig?.database?.name ?? '-'}
            icon={<ServerIcon className="w-6 h-6 text-yellow-400" />}
          />
          <StatCard
            title="Maks tilkoblinger"
            value={systemConfig?.database?.maxConnections ?? '-'}
            icon={<ServerIcon className="w-6 h-6 text-red-400" />}
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
      {activeTab === 'configuration' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Systemkonfigurasjon</h3>
            <p className="text-gray-500">Konfigurasjon kommer snart...</p>
          </div>
        </div>
      )}

      {activeTab === 'backups' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Backup Administrasjon</h3>
            <p className="text-gray-500">Backup administrasjon kommer snart...</p>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Systemlogger</h3>
            <p className="text-gray-500">Logger kommer snart...</p>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Systemhandlinger</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleSystemAction('restart')}
                  disabled={actionInProgress === 'restart'}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Start System på Nytt
                </button>
                <button
                  onClick={() => handleSystemAction('maintenance')}
                  disabled={actionInProgress === 'maintenance'}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
                >
                  <PauseIcon className="w-4 h-4 mr-2" />
                  Aktiver Vedlikeholdsmodus
                </button>
                <button
                  onClick={() => handleSystemAction('clearCache')}
                  disabled={actionInProgress === 'clearCache'}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  <BoltIcon className="w-4 h-4 mr-2" />
                  Tøm Cache
                </button>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Systemstatus</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-800">Server</span>
                  </div>
                  <span className="text-sm text-green-600">Tilkoblet</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-800">E-post Tjeneste</span>
                  </div>
                  <span className="text-sm text-green-600">Aktiv</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-800">Backup Tjeneste</span>
                  </div>
                  <span className="text-sm text-green-600">Aktiv</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="text-sm font-medium text-yellow-800">Diskplass</span>
                  </div>
                  <span className="text-sm text-yellow-600">85% brukt</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 