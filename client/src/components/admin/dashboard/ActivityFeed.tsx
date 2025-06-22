import React, { useState } from 'react';
import { 
  UserIcon,
  BuildingOfficeIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { ActivityItem } from '../../../types/admin';

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
  onRefresh?: () => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  loading = false,
  onRefresh
}) => {
  const [filter, setFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'login':
      case 'logout':
        return <UserIcon className="w-5 h-5" />;
      case 'create':
        return <PlusIcon className="w-5 h-5" />;
      case 'update':
        return <PencilIcon className="w-5 h-5" />;
      case 'delete':
        return <TrashIcon className="w-5 h-5" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'info':
        return <InformationCircleIcon className="w-5 h-5" />;
      default:
        return <InformationCircleIcon className="w-5 h-5" />;
    }
  };

  const getSeverityIcon = (severity: ActivityItem['severity']) => {
    switch (severity) {
      case 'low':
        return <InformationCircleIcon className="w-4 h-4 text-blue-500" />;
      case 'medium':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />;
      case 'high':
        return <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />;
      case 'critical':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <InformationCircleIcon className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: ActivityItem['severity']) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-50 border-blue-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'critical':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getIconColor = (severity: ActivityItem['severity']) => {
    switch (severity) {
      case 'low':
        return 'text-blue-600 bg-blue-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-blue-600 bg-blue-100';
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

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.severity === filter
  );

  const filterOptions = [
    { value: 'all', label: 'Alle', count: activities.length },
    { value: 'low', label: 'Lav', count: activities.filter(a => a.severity === 'low').length },
    { value: 'medium', label: 'Medium', count: activities.filter(a => a.severity === 'medium').length },
    { value: 'high', label: 'Høy', count: activities.filter(a => a.severity === 'high').length },
    { value: 'critical', label: 'Kritisk', count: activities.filter(a => a.severity === 'critical').length }
  ];

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Nylig Aktivitet</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Nylig Aktivitet</h3>
          <div className="flex items-center space-x-3">
            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.count})
                  </option>
                ))}
              </select>
              <FunnelIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            <button
              onClick={onRefresh}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowPathIcon className="w-4 h-4 mr-1" />
              Oppdater
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <InformationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen aktivitet</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' ? 'Ingen aktivitet å vise' : `Ingen ${filter} aktivitet å vise`}
            </p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {filteredActivities.map((activity: ActivityItem, index: number) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {index !== filteredActivities.length - 1 && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getIconColor(activity.severity)}`}>
                          {getActivityIcon(activity.type)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`border rounded-lg p-3 ${getSeverityColor(activity.severity)}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                {getSeverityIcon(activity.severity)}
                                <p className="text-sm font-medium text-gray-900">
                                  {activity.user} - {activity.action}
                                </p>
                              </div>
                              {activity.details && (
                                <p className="mt-1 text-sm text-gray-600">
                                  {activity.details}
                                </p>
                              )}
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500 ml-4">
                              <time dateTime={activity.timestamp}>
                                {formatTimeAgo(activity.timestamp)}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {filteredActivities.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Viser {filteredActivities.length} av {activities.length} aktiviteter</span>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Vis alle aktiviteter →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 