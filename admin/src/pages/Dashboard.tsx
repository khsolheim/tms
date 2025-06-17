import React, { useState } from 'react';
import { 
  UsersIcon, 
  BuildingOfficeIcon, 
  CogIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { StatCard, MetricCard, StatCardGrid } from '../components/common/StatCard';
import { usePollingApi } from '../hooks/useApi';
import { dashboardService } from '../services/dashboard';
import { SystemHealth } from '../components/dashboard/SystemHealth';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { QuickActions } from '../components/dashboard/QuickActions';
import { AlertsPanel } from '../components/dashboard/AlertsPanel';

export const Dashboard = () => {
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data with polling
  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
    refresh: refreshStats
  } = usePollingApi(
    () => dashboardService.getOverview(),
    { interval: 30000 }
  );

  const {
    data: systemHealth,
    loading: healthLoading,
    refresh: refreshHealth
  } = usePollingApi(
    () => dashboardService.getSystemHealth(),
    { interval: 10000 }
  );

  const {
    data: recentActivity,
    loading: activityLoading,
    refresh: refreshActivity
  } = usePollingApi(
    () => dashboardService.getRecentActivity(10),
    { interval: 15000 }
  );

  const {
    data: alerts,
    loading: alertsLoading,
    refresh: refreshAlerts
  } = usePollingApi(
    () => dashboardService.getActiveAlerts(),
    { interval: 20000 }
  );

  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshStats(),
        refreshHealth(),
        refreshActivity(),
        refreshAlerts()
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const getSystemHealthStatus = () => {
    if (!systemHealth) return 'unknown';
    
    const { database, api, services } = systemHealth;
    
    if (database.status === 'error' || api.status === 'error' || 
        services.some((s: any) => s.status === 'error')) {
      return 'critical';
    }
    
    if (database.status === 'warning' || api.status === 'warning' || 
        services.some((s: any) => s.status === 'warning')) {
      return 'warning';
    }
    
    return 'healthy';
  };

  const getUptimePercentage = () => {
    if (!systemHealth) return '99.9%';
    
    const services = systemHealth.services;
    const healthyServices = services.filter((s: any) => s.status === 'healthy').length;
    const uptime = (healthyServices / services.length) * 100;
    
    return `${uptime.toFixed(1)}%`;
  };

  const getResponseTime = () => {
    if (!systemHealth) return 0;
    return systemHealth.api.responseTime;
  };

  if (statsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Feil ved lasting av dashboard</h3>
          <p className="mt-1 text-sm text-gray-500">{statsError}</p>
          <div className="mt-6">
            <button
              onClick={handleRefreshAll}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowPathIcon className="mr-2 h-4 w-4" />
              Prøv igjen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Oversikt over TMS systemet og aktivitet
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="w-4 h-4 mr-1" />
            Sist oppdatert: {new Date().toLocaleTimeString('nb-NO')}
          </div>
          <button
            onClick={handleRefreshAll}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Oppdater
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <StatCardGrid columns={4} gap="md">
        <MetricCard
          metric="companies"
          title="Aktive Bedrifter"
          value={stats?.activeBedrifter || 0}
          change={stats?.totalBedrifter ? `${stats.totalBedrifter} totalt` : undefined}
          changeType="neutral"
          loading={statsLoading}
          description="Bedrifter med aktive tjenester"
        />
        
        <MetricCard
          metric="users"
          title="Totale Brukere"
          value={stats?.totalBrukere || 0}
          change="+12%"
          changeType="increase"
          loading={statsLoading}
          description="Registrerte brukere i systemet"
        />
        
        <MetricCard
          metric="services"
          title="Aktive Tjenester"
          value={stats?.activeServices || 0}
          change="0"
          changeType="neutral"
          loading={statsLoading}
          description="Tjenester i drift"
        />
        
        <MetricCard
          metric="uptime"
          title="System Oppetid"
          value={getUptimePercentage()}
          change={getSystemHealthStatus() === 'healthy' ? '+0.1%' : 'Problemer'}
          changeType={getSystemHealthStatus() === 'healthy' ? 'increase' : 'decrease'}
          loading={healthLoading}
          description={`Responstid: ${getResponseTime()}ms`}
          valueColor={
            getSystemHealthStatus() === 'healthy' ? 'text-green-600' :
            getSystemHealthStatus() === 'warning' ? 'text-yellow-600' : 'text-red-600'
          }
        />
      </StatCardGrid>

      {/* Alerts Panel */}
      {alerts && alerts.length > 0 && (
        <AlertsPanel 
          alerts={alerts} 
          loading={alertsLoading}
          onRefresh={refreshAlerts}
        />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health - Takes 2 columns */}
        <div className="lg:col-span-2">
          <SystemHealth 
            data={systemHealth || undefined} 
            loading={healthLoading}
            onRefresh={refreshHealth}
          />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions onRefresh={handleRefreshAll} />
        </div>
      </div>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed 
            activities={recentActivity || []} 
            loading={activityLoading}
            onRefresh={refreshActivity}
          />
        </div>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Database Tilkoblinger"
          value={systemHealth?.database?.connections || 0}
          description={`Maks: ${systemHealth?.database?.maxConnections || 0}`}
          loading={healthLoading}
          icon={<ChartBarIcon className="w-6 h-6" />}
        />
        
        <StatCard
          title="API Forespørsler/min"
          value={systemHealth?.api?.requestsPerMinute || 0}
          change={`${((systemHealth?.api?.errorRate || 0) * 100).toFixed(1)}% feil`}
          changeType={systemHealth?.api?.errorRate && systemHealth.api.errorRate > 0.05 ? 'decrease' : 'neutral'}
          loading={healthLoading}
          icon={<ArrowPathIcon className="w-6 h-6" />}
        />
        
        <StatCard
          title="Minnebruk"
          value={`${((systemHealth?.memory?.used || 0) / (1024 * 1024 * 1024)).toFixed(1)} GB`}
          description={`${systemHealth?.memory?.percentage || 0}% av total`}
          loading={healthLoading}
          icon={<CogIcon className="w-6 h-6" />}
          valueColor={
            (systemHealth?.memory?.percentage || 0) > 80 ? 'text-red-600' :
            (systemHealth?.memory?.percentage || 0) > 60 ? 'text-yellow-600' : 'text-green-600'
          }
        />
        
        <StatCard
          title="CPU Bruk"
          value={`${systemHealth?.cpu?.usage || 0}%`}
          description={`${systemHealth?.cpu?.cores || 0} kjerner`}
          loading={healthLoading}
          icon={<ChartBarIcon className="w-6 h-6" />}
          valueColor={
            (systemHealth?.cpu?.usage || 0) > 80 ? 'text-red-600' :
            (systemHealth?.cpu?.usage || 0) > 60 ? 'text-yellow-600' : 'text-green-600'
          }
        />
      </div>
    </div>
  );
}; 