import React from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  ServerIcon,
  CircleStackIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { SystemHealth as SystemHealthType } from '../../types/admin';

interface SystemHealthProps {
  data?: SystemHealthType;
  loading?: boolean;
  onRefresh?: () => void;
}

export const SystemHealth: React.FC<SystemHealthProps> = ({
  data,
  loading = false,
  onRefresh
}) => {
  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 bg-gray-300 rounded-full animate-pulse" />;
    }
  };

  const getStatusText = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return 'Operasjonell';
      case 'warning':
        return 'Advarsel';
      case 'error':
        return 'Feil';
      default:
        return 'Ukjent';
    }
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / (24 * 60 * 60));
    const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((uptime % (60 * 60)) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}t ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}t ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Map 'ok' til 'healthy' for status-funksjoner
  const mapServiceStatus = (status: 'ok' | 'warning' | 'error'): 'healthy' | 'warning' | 'error' =>
    status === 'ok' ? 'healthy' : status;

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">System Helse</h3>
          <div className="animate-pulse">
            <div className="w-20 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">System Helse</h3>
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowPathIcon className="w-4 h-4 mr-1" />
            Oppdater
          </button>
        </div>
      </div>

      <div className="p-6">
        {!data ? (
          <div className="text-center py-8">
            <ServerIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen data tilgjengelig</h3>
            <p className="mt-1 text-sm text-gray-500">
              Kunne ikke hente systemhelse data
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Core Services */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Kjernetjenester</h4>
              <div className="space-y-3">
                {/* Database */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CircleStackIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(data.database.status)}
                        <span className="text-sm font-medium text-gray-900">Database</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {data.database.connections}/{data.database.maxConnections} tilkoblinger
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getStatusColor(data.database.status)}`}>
                      {getStatusText(data.database.status)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {data.database.responseTime}ms
                    </div>
                  </div>
                </div>

                {/* API Server */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <GlobeAltIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(data.api.status)}
                        <span className="text-sm font-medium text-gray-900">API Server</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {data.api.requestsPerMinute} req/min
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getStatusColor(data.api.status)}`}>
                      {getStatusText(data.api.status)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {data.api.responseTime}ms
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Microservices */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Mikrotjenester</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.services.map((service: { name: string; status: 'healthy' | 'warning' | 'error'; uptime: number; lastCheck: string }, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ServerIcon className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(service.status)}
                          <span className="text-sm font-medium text-gray-900">{service.name}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Oppetid: {formatUptime(service.uptime)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-medium ${getStatusColor(service.status)}`}>
                        {getStatusText(service.status)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(service.lastCheck).toLocaleTimeString('nb-NO')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Usage */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Ressursbruk</h4>
              <div className="space-y-3">
                {/* Memory */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Minne</span>
                    <span className="font-medium">
                      {(data.memory.used / (1024 * 1024 * 1024)).toFixed(1)} GB / {(data.memory.total / (1024 * 1024 * 1024)).toFixed(1)} GB
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        data.memory.percentage > 80 ? 'bg-red-500' :
                        data.memory.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${data.memory.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{data.memory.percentage}% brukt</div>
                </div>

                {/* CPU */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">CPU</span>
                    <span className="font-medium">{data.cpu.usage}% ({data.cpu.cores} kjerner)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        data.cpu.usage > 80 ? 'bg-red-500' :
                        data.cpu.usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${data.cpu.usage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 