import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Cog6ToothIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ServerIcon,
  CircleStackIcon,
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  navn: string;
  email: string;
  rolle: 'Admin' | 'Lærer' | 'Elev';
  status: 'Aktiv' | 'Inaktiv' | 'Suspendert';
  sistInnlogget: string;
  quizerOpprettet?: number;
  quizerFullfort?: number;
}

interface SystemConfig {
  kategori: string;
  innstillinger: {
    navn: string;
    verdi: string | number | boolean;
    beskrivelse: string;
    type: 'text' | 'number' | 'boolean' | 'select';
    options?: string[];
  }[];
}

export default function AdminForslag1_System() {
  const [activeTab, setActiveTab] = useState('users');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [users] = useState<User[]>([
    {
      id: '1',
      navn: 'Lars Andersen',
      email: 'lars@trafikkskole.no',
      rolle: 'Lærer',
      status: 'Aktiv',
      sistInnlogget: '2024-01-16 14:30',
      quizerOpprettet: 23,
      quizerFullfort: 156
    },
    {
      id: '2',
      navn: 'Emma Andersen',
      email: 'emma@student.no',
      rolle: 'Elev',
      status: 'Aktiv',
      sistInnlogget: '2024-01-16 09:15',
      quizerFullfort: 45
    },
    {
      id: '3',
      navn: 'Admin Bruker',
      email: 'admin@system.no',
      rolle: 'Admin',
      status: 'Aktiv',
      sistInnlogget: '2024-01-16 16:20'
    },
    {
      id: '4',
      navn: 'Inaktiv Bruker',
      email: 'inaktiv@test.no',
      rolle: 'Elev',
      status: 'Suspendert',
      sistInnlogget: '2024-01-10 12:00',
      quizerFullfort: 12
    }
  ]);

  const [systemConfigs] = useState<SystemConfig[]>([
    {
      kategori: 'Quiz Innstillinger',
      innstillinger: [
        {
          navn: 'Standard Quiz Varighet',
          verdi: 30,
          beskrivelse: 'Standard tid i minutter for nye quizer',
          type: 'number'
        },
        {
          navn: 'Maksimum Forsøk',
          verdi: 3,
          beskrivelse: 'Maksimalt antall forsøk per quiz',
          type: 'number'
        },
        {
          navn: 'Automatisk Lagring',
          verdi: true,
          beskrivelse: 'Lagre svar automatisk under quiz',
          type: 'boolean'
        },
        {
          navn: 'Tilfeldig Rekkefølge',
          verdi: 'Spørsmål',
          beskrivelse: 'Hva som skal randomiseres',
          type: 'select',
          options: ['Ingen', 'Spørsmål', 'Svar', 'Begge']
        }
      ]
    },
    {
      kategori: 'Sikkerhet',
      innstillinger: [
        {
          navn: 'Passord Kompleksitet',
          verdi: 'Høy',
          beskrivelse: 'Krav til passordstyrke',
          type: 'select',
          options: ['Lav', 'Medium', 'Høy']
        },
        {
          navn: 'Session Timeout',
          verdi: 120,
          beskrivelse: 'Minutter før automatisk utlogging',
          type: 'number'
        },
        {
          navn: 'To-faktor autentisering',
          verdi: false,
          beskrivelse: 'Påkreve 2FA for alle brukere',
          type: 'boolean'
        }
      ]
    },
    {
      kategori: 'System',
      innstillinger: [
        {
          navn: 'Backup Frekvens',
          verdi: 'Daglig',
          beskrivelse: 'Hvor ofte systemet skal sikkerhetskopiere',
          type: 'select',
          options: ['Hver time', 'Daglig', 'Ukentlig']
        },
        {
          navn: 'Log Retention',
          verdi: 90,
          beskrivelse: 'Dager å beholde systemlogger',
          type: 'number'
        },
        {
          navn: 'Maintenance Mode',
          verdi: false,
          beskrivelse: 'Aktiver vedlikeholdsmodus',
          type: 'boolean'
        }
      ]
    }
  ]);

  const getRoleColor = (rolle: string) => {
    switch (rolle) {
      case 'Admin': return 'bg-red-100 text-red-700';
      case 'Lærer': return 'bg-blue-100 text-blue-700';
      case 'Elev': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aktiv': return 'bg-green-100 text-green-700 border-green-200';
      case 'Inaktiv': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Suspendert': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const renderUsersTab = () => (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">156</div>
              <div className="text-sm text-gray-600">Totale brukere</div>
            </div>
            <UserGroupIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">142</div>
              <div className="text-sm text-gray-600">Aktive brukere</div>
            </div>
            <ShieldCheckIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">23</div>
              <div className="text-sm text-gray-600">Lærere</div>
            </div>
            <ClipboardDocumentCheckIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">89%</div>
              <div className="text-sm text-gray-600">Innloggingsrate</div>
            </div>
            <ChartBarIcon className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Brukerstyring</h2>
            <div className="flex space-x-2">
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">
                <PlusIcon className="w-4 h-4" />
                <span>Ny bruker</span>
              </button>
              <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                Import CSV
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Bruker</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Rolle</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Sist innlogget</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Aktivitet</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Handlinger</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {user.navn.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{user.navn}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.rolle)}`}>
                        {user.rolle}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{user.sistInnlogget}</td>
                    <td className="py-3 px-4 text-sm">
                      {user.rolle === 'Lærer' && (
                        <div className="text-gray-600">
                          {user.quizerOpprettet} quizer opprettet
                        </div>
                      )}
                      {user.rolle === 'Elev' && (
                        <div className="text-gray-600">
                          {user.quizerFullfort} quizer fullført
                        </div>
                      )}
                      {user.rolle === 'Admin' && (
                        <div className="text-gray-600">
                          Systemadministrator
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setSelectedUser(user)}
                          className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-500 hover:bg-gray-50 rounded">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-red-500 hover:bg-red-50 rounded">
                          <TrashIcon className="w-4 h-4" />
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
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <div className="text-sm text-gray-600">Oppetid</div>
            </div>
            <ServerIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">2.3 GB</div>
              <div className="text-sm text-gray-600">Database størrelse</div>
            </div>
                            <CircleStackIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">1,234</div>
              <div className="text-sm text-gray-600">API kall i dag</div>
            </div>
            <ChartBarIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">45ms</div>
              <div className="text-sm text-gray-600">Gj.snitt responstid</div>
            </div>
            <ServerIcon className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Configuration Sections */}
      <div className="space-y-6">
        {systemConfigs.map((config, index) => (
          <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">{config.kategori}</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {config.innstillinger.map((innstilling, settingIndex) => (
                  <div key={settingIndex} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {innstilling.navn}
                    </label>
                    <div className="space-y-1">
                      {innstilling.type === 'boolean' ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={innstilling.verdi as boolean}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">
                            {innstilling.verdi ? 'Aktivert' : 'Deaktivert'}
                          </span>
                        </div>
                      ) : innstilling.type === 'select' ? (
                        <select 
                          value={innstilling.verdi as string}
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                        >
                          {innstilling.options?.map((option, optionIndex) => (
                            <option key={optionIndex} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={innstilling.type}
                          value={innstilling.verdi as string | number}
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                        />
                      )}
                      <p className="text-xs text-gray-500">{innstilling.beskrivelse}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  Lagre endringer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLogsTab = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20 text-center">
      <ServerIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Systemlogger</h2>
      <p className="text-gray-600 mb-6">Detaljerte systemlogger og feilsøking kommer snart...</p>
      <button className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors">
        Se logger
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/quiz" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-blue-600 bg-clip-text text-transparent">
                System Management
              </h1>
              <p className="text-gray-600 mt-1">Administrer brukere, innstillinger og systemkonfigurasjon</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/50 rounded-2xl p-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === 'users'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/70'
            }`}
          >
            <UserGroupIcon className="w-5 h-5" />
            <span>Brukere</span>
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === 'system'
                ? 'bg-indigo-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/70'
            }`}
          >
            <Cog6ToothIcon className="w-5 h-5" />
            <span>Innstillinger</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === 'logs'
                ? 'bg-gray-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/70'
            }`}
          >
            <ServerIcon className="w-5 h-5" />
            <span>Logger</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'system' && renderSystemTab()}
        {activeTab === 'logs' && renderLogsTab()}

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">Brukerdetaljer</h2>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {selectedUser.navn.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{selectedUser.navn}</h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.rolle)}`}>
                        {selectedUser.rolle}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedUser.status)}`}>
                        {selectedUser.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sist innlogget</label>
                    <div className="text-gray-800">{selectedUser.sistInnlogget}</div>
                  </div>
                  {selectedUser.quizerOpprettet && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quizer opprettet</label>
                      <div className="text-gray-800">{selectedUser.quizerOpprettet}</div>
                    </div>
                  )}
                  {selectedUser.quizerFullfort && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quizer fullført</label>
                      <div className="text-gray-800">{selectedUser.quizerFullfort}</div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    Rediger bruker
                  </button>
                  <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
                    Tilbakestill passord
                  </button>
                  <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                    Suspender
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 