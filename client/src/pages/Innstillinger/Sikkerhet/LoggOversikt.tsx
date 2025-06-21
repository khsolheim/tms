import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiShield,
  FiAlertTriangle,
  FiUser,
  FiGlobe,
  FiEye,
  FiDownload,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiCalendar,
  FiClock,
  FiUsers,
  FiActivity
} from 'react-icons/fi';
import { securityService, type SecurityMetrics, type LogEntry, type SecurityLogFilters } from '../../../services/security.service';
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  UserIcon,
  GlobeAltIcon,
  ClockIcon,
  ComputerDesktopIcon,
  ServerIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import {
  ShieldCheckIcon as ShieldCheckSolidIcon,
  DocumentTextIcon as DocumentTextSolidIcon,
  ExclamationTriangleIcon as ExclamationTriangleSolidIcon
} from '@heroicons/react/24/solid';

// Fikser type-konflikter ved å ikke redefinere types lokalt

const levelConfig = {
  CRITICAL: { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon },
  ERROR: { color: 'bg-red-50 text-red-700', icon: ExclamationTriangleIcon },
  WARNING: { color: 'bg-yellow-100 text-yellow-800', icon: ExclamationTriangleIcon },
  INFO: { color: 'bg-blue-100 text-blue-800', icon: DocumentTextIcon },
  DEBUG: { color: 'bg-gray-100 text-gray-800', icon: DocumentTextIcon }
};

const categoryConfig = {
  AUTHENTICATION: { color: 'bg-green-100 text-green-800', icon: UserIcon },
  AUTHORIZATION: { color: 'bg-purple-100 text-purple-800', icon: ShieldCheckIcon },
  SYSTEM: { color: 'bg-gray-100 text-gray-800', icon: ServerIcon },
  DATA: { color: 'bg-orange-100 text-orange-800', icon: DocumentTextIcon },
  API: { color: 'bg-indigo-100 text-indigo-800', icon: GlobeAltIcon }
};

export default function LoggOversikt() {
  const [aktivTab, setAktivTab] = useState<'oversikt' | 'logger' | 'trusler'>('oversikt');
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [filters, setFilters] = useState<SecurityLogFilters>({
    level: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    user: '',
    ipAddress: '',
    page: 1,
    limit: 20
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('24h');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Hent data når komponenten laster
  useEffect(() => {
    hentData();
  }, [filters.page, filters.limit]);

  // Filtrer logger lokalt når filters endres
  useEffect(() => {
    let filtered = logs;

    if (filters.level) {
      filtered = filtered.filter(log => log.level === filters.level);
    }
    if (filters.category) {
      filtered = filtered.filter(log => log.category === filters.category);
    }
    if (filters.user) {
      filtered = filtered.filter(log => 
        log.user?.toLowerCase().includes(filters.user!.toLowerCase())
      );
    }
    if (filters.ipAddress) {
      filtered = filtered.filter(log => 
        log.ipAddress.includes(filters.ipAddress!)
      );
    }
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user && log.user.toLowerCase().includes(searchTerm.toLowerCase())) ||
        log.ipAddress.includes(searchTerm)
      );
    }

    setFilteredLogs(filtered);
  }, [logs, filters.level, filters.category, filters.user, filters.ipAddress, searchTerm]);

  const hentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For utvikling bruker vi mock data til API er implementert
      const mockData = await securityService.hentMockData();
      
      setMetrics(mockData.metrics);
      setLogs(mockData.logs);
      
      // TODO: Erstatt med ekte API-kall når backend er klar
      /*
      const response = await securityService.hentSikkerhetslogs(filters);
      setMetrics(response.metrics);
      setLogs(response.logs);
      */
    } catch (error) {
      console.error('Feil ved henting av sikkerhetslogs:', error);
      setError('Kunne ikke laste sikkerhetslogs. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await hentData();
    setRefreshing(false);
  };

  const handleExport = async () => {
    try {
      const blob = await securityService.eksporterLogs(filters, 'xlsx');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'sikkerhetslogs.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Feil ved eksport av logs:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Intl.DateTimeFormat('no-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(timestamp));
  };

  const getLevelIcon = (level: string) => {
    const config = levelConfig[level as keyof typeof levelConfig];
    if (!config) return null;
    const Icon = config.icon;
    return <Icon className="w-4 h-4 text-gray-500" />;
  };

  const getCategoryIcon = (category: string) => {
    const config = categoryConfig[category as keyof typeof categoryConfig];
    if (!config) return null;
    const Icon = config.icon;
    return <Icon className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="cards-spacing-vertical">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center cards-spacing-grid">
            <div className="px-2 py-1 bg-red-100 rounded-xl">
              <ShieldCheckSolidIcon className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sikkerhet & Logger</h1>
              <p className="text-gray-600 mt-1">
                Overvåkning av sikkerhetshendelser og systemaktivitet
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="1h">Siste time</option>
              <option value="24h">Siste 24 timer</option>
              <option value="7d">Siste 7 dager</option>
              <option value="30d">Siste 30 dager</option>
            </select>
            <button 
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-2 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Eksporter logger
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 cards-spacing-grid">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <div className="flex items-center">
            <div className="px-2 py-1 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Totale Hendelser</p>
              <p className="text-2xl font-bold text-gray-900">{metrics?.totalEvents.toLocaleString() || ''}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <div className="flex items-center">
            <div className="px-2 py-1 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Kritiske Hendelser</p>
              <p className="text-2xl font-bold text-red-600">{metrics?.criticalEvents || ''}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <div className="flex items-center">
            <div className="px-2 py-1 bg-green-100 rounded-lg">
              <ShieldCheckIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vellykket Innlogging</p>
              <p className="text-2xl font-bold text-green-600">{metrics?.successfulLogins || ''}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <div className="flex items-center">
            <div className="px-2 py-1 bg-yellow-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Mislykket Innlogging</p>
              <p className="text-2xl font-bold text-yellow-600">{metrics?.failedLogins || ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-2" aria-label="Tabs">
            {[
              { id: 'oversikt', navn: 'Oversikt', ikon: DocumentTextIcon, activeIcon: DocumentTextSolidIcon },
              { id: 'sikkerhet', navn: 'Sikkerhetshendelser', ikon: ShieldCheckIcon, activeIcon: ShieldCheckSolidIcon },
              { id: 'innlogginger', navn: 'Innlogginger', ikon: UserIcon },
              { id: 'system', navn: 'Systemhendelser', ikon: ComputerDesktopIcon }
            ].map((tab) => {
              const Icon = aktivTab === tab.id && tab.activeIcon ? tab.activeIcon : tab.ikon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setAktivTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    aktivTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.navn}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="px-2 py-1">
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 cards-spacing-grid">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Søk i logger..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm"
              />
            </div>
            
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="ALL">Alle nivå</option>
              <option value="CRITICAL">Kritisk</option>
              <option value="ERROR">Feil</option>
              <option value="WARNING">Advarsel</option>
              <option value="INFO">Info</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="ALL">Alle kategorier</option>
              <option value="AUTHENTICATION">Autentisering</option>
              <option value="AUTHORIZATION">Autorisering</option>
              <option value="SYSTEM">System</option>
              <option value="DATA">Data</option>
              <option value="SECURITY">Sikkerhet</option>
            </select>

            <div className="text-sm text-gray-500 flex items-center">
              <FunnelIcon className="w-4 h-4 mr-1" />
              {filteredLogs.length} av {logs.length} hendelser
            </div>
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tidspunkt
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nivå
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bruker
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP-adresse
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Handling
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detaljer
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      {getLevelIcon(log.level)}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(log.category)}
                        <span className="text-sm text-gray-900">{log.category}</span>
                      </div>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                      {log.user || '-'}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm font-mono text-gray-900">
                      {log.ipAddress}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.action}
                    </td>
                    <td className="px-2 py-1 text-sm text-gray-900 max-w-xs truncate">
                      <span title={log.details}>{log.details}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen logger funnet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Prøv å justere filtrene for å se flere resultater.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 