import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CloudIcon,
  Cog6ToothIcon,
  KeyIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ServerIcon,
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface Integration {
  id: string;
  navn: string;
  type: 'LMS' | 'SSO' | 'Analytics' | 'Storage' | 'API';
  status: 'Active' | 'Inactive' | 'Error';
  beskrivelse: string;
  lastSync: string;
  requests: number;
  konfigurert: string;
}

interface APIKey {
  id: string;
  navn: string;
  key: string;
  permissions: string[];
  created: string;
  lastUsed: string;
  requests: number;
  status: 'Active' | 'Inactive' | 'Expired';
}

interface WebhookEndpoint {
  id: string;
  navn: string;
  url: string;
  events: string[];
  status: 'Active' | 'Failed' | 'Disabled';
  lastTriggered: string;
  successRate: number;
}

export default function AdminForslag3_Platform() {
  const [activeTab, setActiveTab] = useState('integrations');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const [integrations] = useState<Integration[]>([
    {
      id: '1',
      navn: 'Canvas LMS',
      type: 'LMS',
      status: 'Active',
      beskrivelse: 'Synkroniserer quiz-resultater med Canvas gradebook',
      lastSync: '2024-01-16 15:30',
      requests: 1247,
      konfigurert: '2023-12-01'
    },
    {
      id: '2',
      navn: 'Microsoft Azure AD',
      type: 'SSO',
      status: 'Active',
      beskrivelse: 'Single Sign-On for alle brukere',
      lastSync: '2024-01-16 16:15',
      requests: 3456,
      konfigurert: '2023-11-15'
    },
    {
      id: '3',
      navn: 'Google Analytics',
      type: 'Analytics',
      status: 'Active',
      beskrivelse: 'Sporer brukeradferd og quiz-ytelse',
      lastSync: '2024-01-16 16:00',
      requests: 892,
      konfigurert: '2024-01-01'
    },
    {
      id: '4',
      navn: 'AWS S3',
      type: 'Storage',
      status: 'Error',
      beskrivelse: 'Lagring av bilder og mediefiler',
      lastSync: '2024-01-16 12:30',
      requests: 234,
      konfigurert: '2023-10-20'
    },
    {
      id: '5',
      navn: 'Slack Notifications',
      type: 'API',
      status: 'Inactive',
      beskrivelse: 'Sender varsler til Slack-kanaler',
      lastSync: '2024-01-15 09:20',
      requests: 67,
      konfigurert: '2024-01-10'
    }
  ]);

  const [apiKeys] = useState<APIKey[]>([
    {
      id: '1',
      navn: 'Mobile App',
      key: 'qz_live_***************xyz',
      permissions: ['quiz:read', 'user:read', 'results:write'],
      created: '2024-01-01',
      lastUsed: '2024-01-16 15:45',
      requests: 12456,
      status: 'Active'
    },
    {
      id: '2',
      navn: 'Analytics Dashboard',
      key: 'qz_live_***************abc',
      permissions: ['quiz:read', 'analytics:read', 'reports:read'],
      created: '2023-12-15',
      lastUsed: '2024-01-16 14:20',
      requests: 8934,
      status: 'Active'
    },
    {
      id: '3',
      navn: 'Legacy Integration',
      key: 'qz_test_***************old',
      permissions: ['quiz:read'],
      created: '2023-10-01',
      lastUsed: '2024-01-10 11:30',
      requests: 234,
      status: 'Expired'
    }
  ]);

  const [webhooks] = useState<WebhookEndpoint[]>([
    {
      id: '1',
      navn: 'Quiz Completion Webhook',
      url: 'https://api.trafikkskole.no/webhooks/quiz-complete',
      events: ['quiz.completed', 'quiz.passed', 'quiz.failed'],
      status: 'Active',
      lastTriggered: '2024-01-16 15:30',
      successRate: 98.5
    },
    {
      id: '2',
      navn: 'User Registration Hook',
      url: 'https://crm.trafikkskole.no/api/users',
      events: ['user.created', 'user.updated'],
      status: 'Active',
      lastTriggered: '2024-01-16 12:15',
      successRate: 100
    },
    {
      id: '3',
      navn: 'Error Notification',
      url: 'https://alerts.trafikkskole.no/webhook',
      events: ['system.error', 'quiz.error'],
      status: 'Failed',
      lastTriggered: '2024-01-15 18:45',
      successRate: 67.2
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 border-green-200';
      case 'Inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Error': case 'Failed': return 'bg-red-100 text-red-700 border-red-200';
      case 'Expired': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Disabled': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'LMS': return 'bg-blue-100 text-blue-700';
      case 'SSO': return 'bg-purple-100 text-purple-700';
      case 'Analytics': return 'bg-green-100 text-green-700';
      case 'Storage': return 'bg-orange-100 text-orange-700';
      case 'API': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'Error': case 'Failed': return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default: return <div className="w-5 h-5 bg-gray-400 rounded-full" />;
    }
  };

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      {/* Integration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-600">Aktive integrasjoner</div>
            </div>
            <CloudIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">98.7%</div>
              <div className="text-sm text-gray-600">Oppetid</div>
            </div>
            <ShieldCheckIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">45.2K</div>
              <div className="text-sm text-gray-600">API kall i dag</div>
            </div>
            <BoltIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">2</div>
              <div className="text-sm text-gray-600">Trenger oppmerksomhet</div>
            </div>
            <Cog6ToothIcon className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Integrations List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Integrasjoner</h2>
            <div className="flex space-x-2">
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">
                <PlusIcon className="w-4 h-4" />
                <span>Ny integrasjon</span>
              </button>
              <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                Marketplace
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(integration.status)}
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{integration.navn}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(integration.type)}`}>
                            {integration.type}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(integration.status)}`}>
                            {integration.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setSelectedIntegration(integration)}
                      className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center space-x-1"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span>Detaljer</span>
                    </button>
                    <button className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm">
                      Konfigurer
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{integration.beskrivelse}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Siste synk</div>
                    <div className="font-semibold text-gray-800">{integration.lastSync}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Forespørsler</div>
                    <div className="font-semibold text-gray-800">{integration.requests.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Konfigurert</div>
                    <div className="font-semibold text-gray-800">{integration.konfigurert}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Handlinger</div>
                    <div className="flex space-x-2">
                      <button className="text-blue-500 hover:text-blue-700">Test</button>
                      <button className="text-orange-500 hover:text-orange-700">Restart</button>
                      <button className="text-red-500 hover:text-red-700">Disable</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAPITab = () => (
    <div className="space-y-6">
      {/* API Keys */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">API Nøkler</h2>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">
              <PlusIcon className="w-4 h-4" />
              <span>Ny API nøkkel</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Navn</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Nøkkel</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tillatelser</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Sist brukt</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Forespørsler</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Handlinger</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((apiKey) => (
                  <tr key={apiKey.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <KeyIcon className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-800">{apiKey.navn}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {apiKey.key}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {apiKey.permissions.map((permission, index) => (
                          <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                            {permission}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{apiKey.lastUsed}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{apiKey.requests.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(apiKey.status)}`}>
                        {apiKey.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-blue-500 hover:bg-blue-50 rounded">
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

      {/* Webhooks */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Webhook Endpoints</h2>
            <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2">
              <PlusIcon className="w-4 h-4" />
              <span>Ny webhook</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(webhook.status)}
                    <div>
                      <h3 className="font-bold text-gray-800">{webhook.navn}</h3>
                      <div className="text-sm text-gray-600 font-mono">{webhook.url}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-800">{webhook.successRate}%</div>
                      <div className="text-xs text-gray-600">Success rate</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(webhook.status)}`}>
                      {webhook.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 mb-2">Events:</div>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map((event, index) => (
                        <span key={index} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Sist utløst:</div>
                    <div className="font-semibold text-gray-800">{webhook.lastTriggered}</div>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors">
                    Test
                  </button>
                  <button className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors">
                    Logs
                  </button>
                  <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
                    Rediger
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocsTab = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20 text-center">
      <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">API Dokumentasjon</h2>
      <p className="text-gray-600 mb-6">Komplett API-dokumentasjon og utviklerguider kommer snart...</p>
      <div className="flex justify-center space-x-4">
        <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
          Se API Docs
        </button>
        <button className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors">
          SDK Downloads
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/quiz" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Platform Management
              </h1>
              <p className="text-gray-600 mt-1">Administrer integrasjoner, API-er og eksterne tjenester</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/50 rounded-2xl p-2">
          <button
            onClick={() => setActiveTab('integrations')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === 'integrations'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/70'
            }`}
          >
            <CloudIcon className="w-5 h-5" />
            <span>Integrasjoner</span>
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === 'api'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/70'
            }`}
          >
            <KeyIcon className="w-5 h-5" />
            <span>API & Webhooks</span>
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === 'docs'
                ? 'bg-gray-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/70'
            }`}
          >
            <DocumentTextIcon className="w-5 h-5" />
            <span>Dokumentasjon</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'integrations' && renderIntegrationsTab()}
        {activeTab === 'api' && renderAPITab()}
        {activeTab === 'docs' && renderDocsTab()}

        {/* Integration Detail Modal */}
        {selectedIntegration && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">Integrasjonsdetaljer</h2>
                  <button 
                    onClick={() => setSelectedIntegration(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  {getStatusIcon(selectedIntegration.status)}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{selectedIntegration.navn}</h3>
                    <p className="text-gray-600">{selectedIntegration.beskrivelse}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedIntegration.type)}`}>
                        {selectedIntegration.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedIntegration.status)}`}>
                        {selectedIntegration.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Siste synkronisering</label>
                    <div className="text-gray-800">{selectedIntegration.lastSync}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Totale forespørsler</label>
                    <div className="text-gray-800">{selectedIntegration.requests.toLocaleString()}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Konfigurert dato</label>
                    <div className="text-gray-800">{selectedIntegration.konfigurert}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <div className="text-gray-800">{selectedIntegration.type}</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Konfigurasjon</h4>
                  <div className="text-sm text-gray-600">
                    Detaljerte konfigurasjonsinnstillinger vises her...
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    Rediger konfigurasjon
                  </button>
                  <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                    Test tilkobling
                  </button>
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                    Restart
                  </button>
                  <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                    Deaktiver
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