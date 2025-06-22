import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  EyeIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  Cog6ToothIcon,
  BellIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface SecurityEvent {
  id: string;
  type: 'login' | 'failed_login' | 'data_access' | 'config_change' | 'suspicious';
  user: string;
  description: string;
  timestamp: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  ip: string;
  resolved: boolean;
}

interface ComplianceCheck {
  id: string;
  navn: string;
  beskrivelse: string;
  status: 'Compliant' | 'Non-Compliant' | 'Warning';
  lastChecked: string;
  framework: 'GDPR' | 'ISO27001' | 'SOC2' | 'FERPA';
  score: number;
}

interface User {
  id: string;
  navn: string;
  email: string;
  rolle: string;
  lastLogin: string;
  failedAttempts: number;
  status: 'Active' | 'Locked' | 'Suspended';
  permissions: string[];
}

export default function AdminForslag4_Security() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  const [securityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      type: 'failed_login',
      user: 'unknown',
      description: 'Multiple failed login attempts from suspicious IP',
      timestamp: '2024-01-16 15:45:23',
      severity: 'High',
      ip: '192.168.1.100',
      resolved: false
    },
    {
      id: '2',
      type: 'config_change',
      user: 'admin@trafikkskole.no',
      description: 'Quiz security settings modified',
      timestamp: '2024-01-16 14:20:15',
      severity: 'Medium',
      ip: '10.0.0.5',
      resolved: true
    },
    {
      id: '3',
      type: 'data_access',
      user: 'laerer@trafikkskole.no',
      description: 'Bulk student data export',
      timestamp: '2024-01-16 13:10:45',
      severity: 'Low',
      ip: '10.0.0.12',
      resolved: true
    },
    {
      id: '4',
      type: 'suspicious',
      user: 'elev@trafikkskole.no',
      description: 'Unusual quiz completion pattern detected',
      timestamp: '2024-01-16 12:30:20',
      severity: 'Medium',
      ip: '192.168.2.45',
      resolved: false
    }
  ]);

  const [complianceChecks] = useState<ComplianceCheck[]>([
    {
      id: '1',
      navn: 'Data Encryption',
      beskrivelse: 'All sensitive data must be encrypted at rest and in transit',
      status: 'Compliant',
      lastChecked: '2024-01-16 10:00:00',
      framework: 'GDPR',
      score: 100
    },
    {
      id: '2',
      navn: 'Access Controls',
      beskrivelse: 'Role-based access control implementation',
      status: 'Compliant',
      lastChecked: '2024-01-16 09:30:00',
      framework: 'ISO27001',
      score: 95
    },
    {
      id: '3',
      navn: 'Audit Logging',
      beskrivelse: 'Comprehensive audit trail for all system activities',
      status: 'Warning',
      lastChecked: '2024-01-16 08:45:00',
      framework: 'SOC2',
      score: 85
    },
    {
      id: '4',
      navn: 'Student Privacy',
      beskrivelse: 'Protection of student educational records',
      status: 'Non-Compliant',
      lastChecked: '2024-01-16 08:00:00',
      framework: 'FERPA',
      score: 70
    }
  ]);

  const [users] = useState<User[]>([
    {
      id: '1',
      navn: 'Admin Bruker',
      email: 'admin@trafikkskole.no',
      rolle: 'Super Admin',
      lastLogin: '2024-01-16 15:30:00',
      failedAttempts: 0,
      status: 'Active',
      permissions: ['all']
    },
    {
      id: '2',
      navn: 'Lars Hansen',
      email: 'lars@trafikkskole.no',
      rolle: 'Lærer',
      lastLogin: '2024-01-16 14:15:00',
      failedAttempts: 1,
      status: 'Active',
      permissions: ['quiz:create', 'quiz:edit', 'students:view']
    },
    {
      id: '3',
      navn: 'Kari Nordmann',
      email: 'kari@example.com',
      rolle: 'Elev',
      lastLogin: '2024-01-15 20:30:00',
      failedAttempts: 3,
      status: 'Locked',
      permissions: ['quiz:take']
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'Compliant': return 'bg-green-100 text-green-700 border-green-200';
      case 'Warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Non-Compliant': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 border-green-200';
      case 'Locked': return 'bg-red-100 text-red-700 border-red-200';
      case 'Suspended': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">98.5%</div>
              <div className="text-sm text-gray-600">Security Score</div>
            </div>
            <ShieldCheckIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">4</div>
              <div className="text-sm text-gray-600">Active Threats</div>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">156</div>
              <div className="text-sm text-gray-600">Active Sessions</div>
            </div>
            <UserIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">23</div>
              <div className="text-sm text-gray-600">Failed Logins (24h)</div>
            </div>
            <LockClosedIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Recent Security Events */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Siste Sikkerhetshendelser</h2>
            <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm">
              Se alle varsler
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {securityEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      event.resolved ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <h3 className="font-semibold text-gray-800">{event.description}</h3>
                      <div className="text-sm text-gray-600">
                        {event.user} • {event.ip} • {event.timestamp}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(event.severity)}`}>
                      {event.severity}
                    </span>
                    <button 
                      onClick={() => setSelectedEvent(event)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      Detaljer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Status */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Compliance Status</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complianceChecks.map((check) => (
              <div key={check.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{check.navn}</h3>
                    <div className="text-sm text-gray-600">{check.framework}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">{check.score}%</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getComplianceColor(check.status)}`}>
                      {check.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{check.beskrivelse}</p>
                <div className="text-xs text-gray-500">
                  Sist sjekket: {check.lastChecked}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Brukersikkerhet</h2>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Bruker</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rolle</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Sist innlogget</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Mislykkede forsøk</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Handlinger</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-800">{user.navn}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.rolle}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{user.lastLogin}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${
                      user.failedAttempts > 2 ? 'text-red-600' :
                      user.failedAttempts > 0 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {user.failedAttempts}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
                        Detaljer
                      </button>
                      {user.status === 'Locked' && (
                        <button className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600 transition-colors">
                          Lås opp
                        </button>
                      )}
                      <button className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-colors">
                        Suspender
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
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* Security Policies */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Sikkerhetspolicyer</h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passordkompleksitet
              </label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white">
                <option>Høy (12+ tegn, spesialtegn)</option>
                <option>Medium (8+ tegn, tall)</option>
                <option>Lav (6+ tegn)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sesjon timeout (minutter)
              </label>
              <input 
                type="number" 
                defaultValue="30"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maksimalt mislykkede forsøk
              </label>
              <input 
                type="number" 
                defaultValue="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konto låsing (minutter)
              </label>
              <input 
                type="number" 
                defaultValue="15"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-800">To-faktor autentisering</div>
                <div className="text-sm text-gray-600">Krev 2FA for alle admin-brukere</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-800">IP-adresse begrensning</div>
                <div className="text-sm text-gray-600">Begrens tilgang basert på IP-adresse</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-800">Automatisk backup</div>
                <div className="text-sm text-gray-600">Daglig sikkerhetskopi av alle data</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="flex space-x-4">
            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Lagre innstillinger
            </button>
            <button className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors">
              Tilbakestill
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Audit Logs</h2>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <div className="text-gray-600">Detaljerte audit logs kommer her...</div>
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Vis audit log
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/quiz" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Security & Compliance
              </h1>
              <p className="text-gray-600 mt-1">Sikkerhetsstyring, overvåking og compliance-rapportering</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/50 rounded-2xl p-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === 'overview'
                ? 'bg-red-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/70'
            }`}
          >
            <ShieldCheckIcon className="w-5 h-5" />
            <span>Oversikt</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === 'users'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/70'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span>Brukere</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === 'settings'
                ? 'bg-yellow-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/70'
            }`}
          >
            <Cog6ToothIcon className="w-5 h-5" />
            <span>Innstillinger</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'settings' && renderSettingsTab()}

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">Sikkerhetshendelse</h2>
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <div className="text-gray-800 capitalize">{selectedEvent.type.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Beskrivelse</label>
                    <div className="text-gray-800">{selectedEvent.description}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bruker</label>
                      <div className="text-gray-800">{selectedEvent.user}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">IP-adresse</label>
                      <div className="text-gray-800 font-mono">{selectedEvent.ip}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tidspunkt</label>
                      <div className="text-gray-800">{selectedEvent.timestamp}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Alvorlighetsgrad</label>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(selectedEvent.severity)}`}>
                        {selectedEvent.severity}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 pt-4">
                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                      Merk som løst
                    </button>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                      Undersøk videre
                    </button>
                    <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                      Blokker IP
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 