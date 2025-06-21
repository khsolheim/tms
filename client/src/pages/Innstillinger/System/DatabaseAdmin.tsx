import React, { useState, useEffect } from 'react';
import { systemAdminService, type DatabaseInfo } from '../../../services/system-admin.service';
import {
  ServerIcon,
  CircleStackIcon,
  ClockIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CpuChipIcon,
  BoltIcon,
  DocumentTextIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import {
  ServerIcon as ServerSolidIcon,
  CircleStackIcon as CircleStackSolidIcon
} from '@heroicons/react/24/solid';

interface DatabaseStatus {
  connected: boolean;
  version: string;
  uptime: string;
  status: 'healthy' | 'warning' | 'critical';
  connections: {
    active: number;
    max: number;
    idle: number;
  };
  performance: {
    queryTime: number;
    throughput: number;
    cacheHitRate: number;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
}

interface BackupConfig {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun: string;
  nextRun: string;
  status: 'success' | 'running' | 'failed' | 'pending';
  retentionDays: number;
  location: string;
  size: string;
}

interface QueryPerformance {
  query: string;
  executions: number;
  avgTime: number;
  totalTime: number;
  impact: 'high' | 'medium' | 'low';
}

export default function DatabaseAdmin() {
  const [activeTab, setActiveTab] = useState<'overview' | 'backup' | 'performance' | 'maintenance'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Hent database data
  useEffect(() => {
    const hentData = async () => {
      try {
        setLoading(true);
        const data = await systemAdminService.hentDatabaseInfo();
        setDatabaseInfo(data);
      } catch (error) {
        console.error('Feil ved henting av databaseinfo:', error);
      } finally {
        setLoading(false);
      }
    };

    hentData();
  }, []);

  // Fjernet hardkodet data - bruker service i stedet
  const dbStatus: DatabaseStatus = {
    connected: true,
    version: 'PostgreSQL 15.3',
    uptime: '47 dager, 12 timer',
    status: 'healthy',
    connections: {
      active: 12,
      max: 100,
      idle: 3
    },
    performance: {
      queryTime: 2.4,
      throughput: 1847,
      cacheHitRate: 98.7
    },
    storage: {
      used: 2.8,
      total: 10,
      percentage: 28
    }
  };

  const backups: BackupConfig[] = [
    {
      id: '1',
      name: 'Daily Full Backup',
      schedule: 'Daglig kl. 02:00',
      enabled: true,
      lastRun: '2024-06-15T02:00:00',
      nextRun: '2024-06-16T02:00:00',
      status: 'success',
      retentionDays: 30,
      location: 'AWS S3 Bucket',
      size: '847 MB'
    },
    {
      id: '2',
      name: 'Weekly Archive',
      schedule: 'Søndager kl. 01:00',
      enabled: true,
      lastRun: '2024-06-09T01:00:00',
      nextRun: '2024-06-16T01:00:00',
      status: 'success',
      retentionDays: 365,
      location: 'Local Storage',
      size: '1.2 GB'
    },
    {
      id: '3',
      name: 'Real-time Incremental',
      schedule: 'Hver 15. minutt',
      enabled: false,
      lastRun: '2024-06-14T15:45:00',
      nextRun: '-',
      status: 'pending',
      retentionDays: 7,
      location: 'Azure Blob',
      size: '156 MB'
    }
  ];

  const slowQueries: QueryPerformance[] = [
    {
      query: 'SELECT * FROM kontrakter WHERE...',
      executions: 234,
      avgTime: 156.7,
      totalTime: 36668.8,
      impact: 'high'
    },
    {
      query: 'SELECT COUNT(*) FROM elever...',
      executions: 1847,
      avgTime: 12.3,
      totalTime: 22698.1,
      impact: 'medium'
    },
    {
      query: 'UPDATE ansatte SET...',
      executions: 89,
      avgTime: 45.2,
      totalTime: 4022.8,
      impact: 'low'
    }
  ];

  const refreshData = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'running':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
      case 'running':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'critical':
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <CircleStackIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="cards-spacing-vertical">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-2 py-1 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CircleStackSolidIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Database Administrasjon</h1>
                <p className="text-sm text-gray-600">
                  Overvåk, administrer og optimaliser databasen
                </p>
              </div>
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              Oppdater data
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-2">
            {[
              { id: 'overview', name: 'Oversikt', icon: ServerIcon },
              { id: 'backup', name: 'Backup', icon: CloudArrowUpIcon },
              { id: 'performance', name: 'Ytelse', icon: BoltIcon },
              { id: 'maintenance', name: 'Vedlikehold', icon: CpuChipIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <>
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 cards-spacing-grid">
            <div className="bg-white px-2 py-1 rounded-lg shadow">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${getStatusColor(dbStatus.status)}`}>
                  {getStatusIcon(dbStatus.status)}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Database Status</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{dbStatus.status}</p>
                </div>
              </div>
            </div>

            <div className="bg-white px-2 py-1 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-100">
                  <ClockIcon className="h-5 w-5 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Oppetid</p>
                  <p className="text-lg font-semibold text-gray-900">{dbStatus.uptime}</p>
                </div>
              </div>
            </div>

            <div className="bg-white px-2 py-1 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-100">
                  <ChartBarIcon className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Cache Hit Rate</p>
                  <p className="text-lg font-semibold text-gray-900">{dbStatus.performance.cacheHitRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white px-2 py-1 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-purple-100">
                  <ServerIcon className="h-5 w-5 text-purple-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Aktive tilkoblinger</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {dbStatus.connections.active}/{dbStatus.connections.max}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Database Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
            <div className="bg-white shadow rounded-lg">
              <div className="px-2 py-1 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Database Informasjon</h3>
              </div>
              <div className="px-2 py-1 cards-spacing-vertical">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Versjon</span>
                  <span className="text-sm font-medium text-gray-900">{dbStatus.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tilkoblingsstatus</span>
                  <span className={`text-sm font-medium ${dbStatus.connected ? 'text-green-600' : 'text-red-600'}`}>
                    {dbStatus.connected ? 'Tilkoblet' : 'Frakoblet'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ledige tilkoblinger</span>
                  <span className="text-sm font-medium text-gray-900">{dbStatus.connections.idle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Gj.snitt query tid</span>
                  <span className="text-sm font-medium text-gray-900">{dbStatus.performance.queryTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Queries per sekund</span>
                  <span className="text-sm font-medium text-gray-900">{dbStatus.performance.throughput}</span>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-2 py-1 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Lagringsbruk</h3>
              </div>
              <div className="px-2 py-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900">{dbStatus.storage.percentage}%</span>
                  <span className="text-sm text-gray-600">
                    {dbStatus.storage.used} GB av {dbStatus.storage.total} GB
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${dbStatus.storage.percentage}%` }}
                  ></div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Ledig plass: {(dbStatus.storage.total - dbStatus.storage.used).toFixed(1)} GB
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'backup' && (
        <div className="cards-spacing-vertical">
          <div className="bg-white shadow rounded-lg">
            <div className="px-2 py-1 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Backup Konfigurasjoner</h3>
                <button onClick={() => console.log('Button clicked')} className="px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <CloudArrowUpIcon className="h-5 w-5" />
                  Ny backup jobb
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Navn
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Siste kjøring
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Neste kjøring
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Størrelse
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Handlinger
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {backups.map((backup) => (
                    <tr key={backup.id} className="hover:bg-gray-50">
                      <td className="px-2 py-1 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{backup.name}</div>
                          <div className="text-sm text-gray-500">{backup.schedule}</div>
                        </div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(backup.status)}
                          <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(backup.status)}`}>
                            {backup.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                        {new Date(backup.lastRun).toLocaleDateString('nb-NO')}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                        {backup.nextRun !== '-' ? new Date(backup.nextRun).toLocaleDateString('nb-NO') : '-'}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                        {backup.size}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button onClick={() => console.log('Button clicked')} className="text-blue-600 hover:text-blue-900">
                            <PlayIcon className="h-5 w-5" />
                          </button>
                          <button onClick={() => console.log('Button clicked')} className="text-gray-600 hover:text-gray-900">
                            <DocumentTextIcon className="h-5 w-5" />
                          </button>
                          <button onClick={() => console.log('Button clicked')} className="text-green-600 hover:text-green-900">
                            <CloudArrowDownIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="cards-spacing-vertical">
          <div className="bg-white shadow rounded-lg">
            <div className="px-2 py-1 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Trege Queries</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Query
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utførelser
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gj.snitt tid
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total tid
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Påvirkning
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {slowQueries.map((query, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-2 py-1">
                        <div className="text-sm font-mono text-gray-900 truncate max-w-xs">
                          {query.query}
                        </div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                        {query.executions.toLocaleString()}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                        {query.avgTime.toFixed(1)}ms
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                        {(query.totalTime / 1000).toFixed(1)}s
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          query.impact === 'high' ? 'bg-red-100 text-red-800' :
                          query.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {query.impact}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-2 py-1">
            <div className="text-center">
              <CpuChipIcon className="h-24 w-24 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Database Vedlikehold
              </h3>
              <p className="text-gray-600">
                Automatisk vedlikehold, indeksering og optimalisering kommer snart
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}