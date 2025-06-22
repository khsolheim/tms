import React, { useState } from 'react';
import { 
  EyeIcon, 
  CalendarIcon, 
  UserIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { AuditLog } from '../../../types/admin';

interface AuditLogsProps {
  logs?: AuditLog[];
  loading?: boolean;
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ 
  logs = [], 
  loading = false 
}) => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');

  // Mock data if no logs provided
  const mockLogs: AuditLog[] = [
    {
      id: '1',
      userId: 'user123',
      userName: 'John Doe',
      action: 'LOGIN',
      resource: 'Authentication',
      timestamp: '2024-12-15T11:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      success: true,
      details: { method: '2FA', location: 'Oslo, Norway' }
    },
    {
      id: '2',
      userId: 'user456',
      userName: 'Jane Smith',
      action: 'UPDATE_USER',
      resource: 'User Management',
      timestamp: '2024-12-15T11:25:00Z',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      success: true,
      details: { targetUser: 'user789', changes: ['role', 'permissions'] }
    },
    {
      id: '3',
      userId: 'user789',
      userName: 'Ole Hansen',
      action: 'LOGIN_FAILED',
      resource: 'Authentication',
      timestamp: '2024-12-15T11:20:00Z',
      ipAddress: '203.0.113.45',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      success: false,
      details: { reason: 'Invalid password', attempts: 3 }
    }
  ];

  const displayLogs = logs.length > 0 ? logs : mockLogs;
  const filteredLogs = displayLogs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'success') return log.success;
    if (filter === 'failed') return !log.success;
    return true;
  });

  const getActionIcon = (action: string, success: boolean) => {
    if (!success) {
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    }
    return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
  };

  const getActionColor = (action: string, success: boolean) => {
    if (!success) return 'text-red-600 bg-red-50';
    return 'text-green-600 bg-green-50';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('nb-NO');
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
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
          <h3 className="text-lg font-medium text-gray-900">Audit Logger</h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'success' | 'failed')}
            className="border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Alle aktiviteter</option>
            <option value="success">Vellykkede</option>
            <option value="failed">Feilede</option>
          </select>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredLogs.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            Ingen audit logger funnet
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div 
              key={log.id} 
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedLog(log)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getActionIcon(log.action, log.success)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action, log.success)}`}>
                        {formatAction(log.action)}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {log.userName}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {log.resource} • {log.ipAddress}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatTimestamp(log.timestamp)}</span>
                  <EyeIcon className="w-4 h-4 ml-2" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for log details */}
      {selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Audit Log Detaljer</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bruker</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.userName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Handling</label>
                    <p className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(selectedLog.action, selectedLog.success)}`}>
                        {formatAction(selectedLog.action)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ressurs</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.resource}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1">
                      {selectedLog.success ? (
                        <span className="inline-flex items-center text-green-600">
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Vellykket
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-600">
                          <XCircleIcon className="w-4 h-4 mr-1" />
                          Feilet
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IP-adresse</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{selectedLog.ipAddress}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tidspunkt</label>
                    <p className="mt-1 text-sm text-gray-900">{formatTimestamp(selectedLog.timestamp)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">User Agent</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono break-all">{selectedLog.userAgent}</p>
                </div>

                {selectedLog.details && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Detaljer</label>
                    <pre className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md overflow-x-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Lukk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 