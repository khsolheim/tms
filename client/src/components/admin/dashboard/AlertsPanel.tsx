import React, { useState } from 'react';
import { 
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Alert } from '../../../types/admin';
import { dashboardService } from '../../../services/admin/dashboard';

interface AlertsPanelProps {
  alerts: Alert[];
  loading?: boolean;
  onRefresh?: () => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  loading = false,
  onRefresh
}) => {
  const [dismissing, setDismissing] = useState<string | null>(null);
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'high':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />;
      case 'medium':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: Alert['type']) => {
    switch (type) {
      case 'security':
        return '🔒';
      case 'system':
        return '⚙️';
      case 'performance':
        return '⚡';
      case 'business':
        return '📊';
      default:
        return 'ℹ️';
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
    return `${diffInDays} dager siden`;
  };

  const handleAcknowledge = async (alertId: string) => {
    setAcknowledging(alertId);
    try {
      await dashboardService.acknowledgeAlert(alertId);
      onRefresh?.();
    } catch (error: any) {
      console.error('Failed to acknowledge alert:', error);
      alert(`Feil ved bekreftelse: ${error.message}`);
    } finally {
      setAcknowledging(null);
    }
  };

  const handleDismiss = async (alertId: string) => {
    setDismissing(alertId);
    try {
      await dashboardService.dismissAlert(alertId);
      onRefresh?.();
    } catch (error: any) {
      console.error('Failed to dismiss alert:', error);
      alert(`Feil ved avvisning: ${error.message}`);
    } finally {
      setDismissing(null);
    }
  };

  const criticalAlerts = alerts.filter((alert: Alert) => alert.severity === 'critical');
  const highAlerts = alerts.filter((alert: Alert) => alert.severity === 'high');
  const otherAlerts = alerts.filter((alert: Alert) => alert.severity && !['critical', 'high'].includes(alert.severity));

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg border-l-4 border-yellow-400">
        <div className="p-4">
          <div className="animate-pulse">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-gray-200 rounded mr-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="mt-2 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 rounded-lg">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                <h3 className="text-sm font-medium text-red-800">
                  Kritiske Varsler ({criticalAlerts.length})
                </h3>
              </div>
              <button
                onClick={onRefresh}
                className="text-red-600 hover:text-red-800"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {criticalAlerts.map((alert: Alert, index: number) => (
                <div key={alert.id} className="bg-white rounded-md p-3 border border-red-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getTypeIcon(alert.type)}</span>
                        <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                        {alert.actionRequired && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Handling påkrevd
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatTimeAgo(alert.timestamp)}</span>
                        <span className="capitalize">{alert.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {!alert.acknowledged && (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={acknowledging === alert.id}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 disabled:opacity-50"
                        >
                          {acknowledging === alert.id ? (
                            <ArrowPathIcon className="w-3 h-3 animate-spin" />
                          ) : (
                            <EyeIcon className="w-3 h-3" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleDismiss(alert.id)}
                        disabled={dismissing === alert.id}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50"
                      >
                        {dismissing === alert.id ? (
                          <ArrowPathIcon className="w-3 h-3 animate-spin" />
                        ) : (
                          <XMarkIcon className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* High Priority Alerts */}
      {highAlerts.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                <h3 className="text-sm font-medium text-yellow-800">
                  Høy Prioritet ({highAlerts.length})
                </h3>
              </div>
              <button
                onClick={onRefresh}
                className="text-yellow-600 hover:text-yellow-800"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {highAlerts.map((alert: Alert, index: number) => (
                <div key={alert.id} className="bg-white rounded-md p-3 border border-yellow-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getTypeIcon(alert.type)}</span>
                        <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatTimeAgo(alert.timestamp)}</span>
                        <span className="capitalize">{alert.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {!alert.acknowledged && (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={acknowledging === alert.id}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 disabled:opacity-50"
                        >
                          {acknowledging === alert.id ? (
                            <ArrowPathIcon className="w-3 h-3 animate-spin" />
                          ) : (
                            <EyeIcon className="w-3 h-3" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleDismiss(alert.id)}
                        disabled={dismissing === alert.id}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                      >
                        {dismissing === alert.id ? (
                          <ArrowPathIcon className="w-3 h-3 animate-spin" />
                        ) : (
                          <XMarkIcon className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {highAlerts.length > 3 && (
                <div className="text-center">
                  <button className="text-sm text-yellow-700 hover:text-yellow-900 font-medium">
                    Vis {highAlerts.length - 3} flere varsler →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Other Alerts Summary */}
      {otherAlerts.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <InformationCircleIcon className="w-5 h-5 text-blue-500 mr-2" />
                <h3 className="text-sm font-medium text-blue-800">
                  Andre Varsler ({otherAlerts.length})
                </h3>
              </div>
              <button className="text-sm text-blue-700 hover:text-blue-900 font-medium">
                Vis alle →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 