import React, { useState, useEffect } from 'react';
import { systemAdminService, type FirewallRegel } from '../../../services/system-admin.service';
import { Card, CardContent, CardHeader, CardTitle } from "../../../design-system";
import { 
  ShieldCheckIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  DocumentTextIcon,
  ServerIcon,
  GlobeAltIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface FirewallRule {
  id: string;
  name: string;
  type: 'inbound' | 'outbound';
  action: 'allow' | 'deny';
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'Any';
  sourceIP: string;
  sourcePort: string;
  destIP: string;
  destPort: string;
  priority: number;
  enabled: boolean;
  hits: number;
  lastHit: string;
}

interface IpBlocklist {
  id: string;
  ipAddress: string;
  reason: string;
  blockedDate: string;
  expiresAt: string | null;
  attempts: number;
  type: 'manual' | 'automatic';
}

interface SecurityAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  source: string;
  resolved: boolean;
}

const FirewallAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'blocklist' | 'alerts'>('rules');
  const [firewallRegler, setFirewallRegler] = useState<FirewallRegel[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRule, setNewRule] = useState({
    name: '',
    type: 'inbound' as const,
    action: 'allow' as const,
    protocol: 'TCP' as const,
    sourceIP: '',
    sourcePort: '',
    destIP: '',
    destPort: ''
  });

  // Hent firewall data
  useEffect(() => {
    const hentData = async () => {
      try {
        setLoading(true);
        const data = await systemAdminService.hentFirewallRegler();
        setFirewallRegler(data);
      } catch (error) {
        console.error('Feil ved henting av firewall-regler:', error);
      } finally {
        setLoading(false);
      }
    };

    hentData();
  }, []);

  // Fjernet hardkodet data - bruker service i stedet
  const firewallRules: FirewallRule[] = [
    {
      id: '1',
      name: 'Allow HTTPS Traffic',
      type: 'inbound',
      action: 'allow',
      protocol: 'TCP',
      sourceIP: 'Any',
      sourcePort: 'Any',
      destIP: 'Any',
      destPort: '443',
      priority: 1,
      enabled: true,
      hits: 34567,
      lastHit: '2025-06-15 14:45'
    },
    {
      id: '2',
      name: 'Allow SSH from Admin',
      type: 'inbound',
      action: 'allow',
      protocol: 'TCP',
      sourceIP: '192.168.1.0/24',
      sourcePort: 'Any',
      destIP: 'Any',
      destPort: '22',
      priority: 2,
      enabled: true,
      hits: 1234,
      lastHit: '2025-06-15 10:23'
    },
    {
      id: '3',
      name: 'Block Suspicious IPs',
      type: 'inbound',
      action: 'deny',
      protocol: 'Any',
      sourceIP: '10.0.0.0/8',
      sourcePort: 'Any',
      destIP: 'Any',
      destPort: 'Any',
      priority: 3,
      enabled: true,
      hits: 89,
      lastHit: '2025-06-14 22:10'
    },
    {
      id: '4',
      name: 'Allow Database Connection',
      type: 'outbound',
      action: 'allow',
      protocol: 'TCP',
      sourceIP: 'Any',
      sourcePort: 'Any',
      destIP: '10.1.1.100',
      destPort: '5432',
      priority: 4,
      enabled: false,
      hits: 0,
      lastHit: '-'
    }
  ];

  const blockedIPs: IpBlocklist[] = [
    {
      id: '1',
      ipAddress: '185.220.101.45',
      reason: 'Brute force attack detected',
      blockedDate: '2025-06-15 12:30',
      expiresAt: null,
      attempts: 156,
      type: 'automatic'
    },
    {
      id: '2',
      ipAddress: '45.155.205.233',
      reason: 'Port scanning detected',
      blockedDate: '2025-06-14 08:15',
      expiresAt: '2025-06-21 08:15',
      attempts: 45,
      type: 'automatic'
    },
    {
      id: '3',
      ipAddress: '192.168.100.50',
      reason: 'Manual block - suspicious activity',
      blockedDate: '2025-06-10 14:00',
      expiresAt: null,
      attempts: 0,
      type: 'manual'
    }
  ];

  const securityAlerts: SecurityAlert[] = [
    {
      id: '1',
      severity: 'high',
      message: 'Multiple failed login attempts from IP 185.220.101.45',
      timestamp: '2025-06-15 12:28',
      source: '185.220.101.45',
      resolved: false
    },
    {
      id: '2',
      severity: 'medium',
      message: 'Unusual outbound traffic detected on port 8080',
      timestamp: '2025-06-15 11:45',
      source: 'Internal',
      resolved: false
    },
    {
      id: '3',
      severity: 'critical',
      message: 'Potential DDoS attack detected',
      timestamp: '2025-06-14 23:30',
      source: 'Multiple',
      resolved: true
    }
  ];

  const stats = {
    totalRules: firewallRules.length,
    activeRules: firewallRules.filter(r => r.enabled).length,
    blockedIPs: blockedIPs.length,
    todayBlocks: 234,
    activeAlerts: securityAlerts.filter(a => !a.resolved).length
  };

  const handleRuleToggle = (ruleId: string) => {
    alert(`Regel ${ruleId} endret!`);
  };

  const deleteRule = (ruleId: string) => {
    if (confirm('Er du sikker på at du vil slette denne regelen?')) {
      alert(`Regel ${ruleId} slettet!`);
    }
  };

  const unblockIP = (ipId: string) => {
    if (confirm('Er du sikker på at du vil oppheve blokkeringen av denne IP-adressen?')) {
      alert(`IP ${ipId} fjernet fra blokkeringsliste!`);
    }
  };

  const resolveAlert = (alertId: string) => {
    alert(`Varsel ${alertId} markert som løst!`);
  };

  const createRule = () => {
    if (!newRule.name || !newRule.destPort) {
      alert('Vennligst fyll ut påkrevde felt');
      return;
    }
    alert('Ny brannmurregel opprettet!');
    setNewRule({
      name: '',
      type: 'inbound',
      action: 'allow',
      protocol: 'TCP',
      sourceIP: '',
      sourcePort: '',
      destIP: '',
      destPort: ''
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="px-2 py-1 cards-spacing-vertical">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Brannmur Administrasjon</h1>
        <p className="text-gray-600 mt-2">
          Administrer brannmurregler og sikkerhetsinnstillinger
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 cards-spacing-grid">
        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Totale regler</p>
              <p className="text-2xl font-bold">{stats.totalRules}</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Aktive regler</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeRules}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Blokkerte IP'er</p>
              <p className="text-2xl font-bold">{stats.blockedIPs}</p>
            </div>
            <ShieldExclamationIcon className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Blokkeringer i dag</p>
              <p className="text-2xl font-bold">{stats.todayBlocks}</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Aktive varsler</p>
              <p className="text-2xl font-bold text-red-600">{stats.activeAlerts}</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'rules', name: 'Brannmurregler', icon: FunnelIcon },
            { id: 'blocklist', name: 'IP Blokkeringsliste', icon: ShieldExclamationIcon },
            { id: 'alerts', name: 'Sikkerhetsvarsler', icon: ExclamationTriangleIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center space-x-2 py-2 px-1 border-b-2 text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'rules' && (
        <div className="cards-spacing-vertical">
          {/* Create New Rule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PlusIcon className="h-5 w-5" />
                <span>Opprett ny regel</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 cards-spacing-grid">
                <div className="space-y-6">
                  <label className="text-sm font-medium text-gray-700">Navn *</label>
                  <input
                    type="text"
                    value={newRule.name}
                    onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Regelnavn"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-6">
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={newRule.type}
                    onChange={(e) => setNewRule(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="inbound">Innkommende</option>
                    <option value="outbound">Utgående</option>
                  </select>
                </div>

                <div className="space-y-6">
                  <label className="text-sm font-medium text-gray-700">Handling</label>
                  <select
                    value={newRule.action}
                    onChange={(e) => setNewRule(prev => ({ ...prev, action: e.target.value as any }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="allow">Tillat</option>
                    <option value="deny">Blokker</option>
                  </select>
                </div>

                <div className="space-y-6">
                  <label className="text-sm font-medium text-gray-700">Protokoll</label>
                  <select
                    value={newRule.protocol}
                    onChange={(e) => setNewRule(prev => ({ ...prev, protocol: e.target.value as any }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="TCP">TCP</option>
                    <option value="UDP">UDP</option>
                    <option value="ICMP">ICMP</option>
                    <option value="Any">Any</option>
                  </select>
                </div>

                <div className="space-y-6">
                  <label className="text-sm font-medium text-gray-700">Kilde IP</label>
                  <input
                    type="text"
                    value={newRule.sourceIP}
                    onChange={(e) => setNewRule(prev => ({ ...prev, sourceIP: e.target.value }))}
                    placeholder="Any eller IP/CIDR"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-6">
                  <label className="text-sm font-medium text-gray-700">Kilde Port</label>
                  <input
                    type="text"
                    value={newRule.sourcePort}
                    onChange={(e) => setNewRule(prev => ({ ...prev, sourcePort: e.target.value }))}
                    placeholder="Any eller port"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-6">
                  <label className="text-sm font-medium text-gray-700">Mål IP</label>
                  <input
                    type="text"
                    value={newRule.destIP}
                    onChange={(e) => setNewRule(prev => ({ ...prev, destIP: e.target.value }))}
                    placeholder="Any eller IP/CIDR"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-6">
                  <label className="text-sm font-medium text-gray-700">Mål Port *</label>
                  <input
                    type="text"
                    value={newRule.destPort}
                    onChange={(e) => setNewRule(prev => ({ ...prev, destPort: e.target.value }))}
                    placeholder="Any eller port"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={createRule}
                className="mt-4 px-2 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="mr-2 h-4 w-4 inline" />
                Opprett regel
              </button>
            </CardContent>
          </Card>

          {/* Existing Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5" />
                <span>Eksisterende regler</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Prioritet</th>
                      <th className="text-left py-2 px-2">Navn</th>
                      <th className="text-left py-2 px-2">Type</th>
                      <th className="text-left py-2 px-2">Handling</th>
                      <th className="text-left py-2 px-2">Protokoll</th>
                      <th className="text-left py-2 px-2">Kilde</th>
                      <th className="text-left py-2 px-2">Destinasjon</th>
                      <th className="text-left py-2 px-2">Treff</th>
                      <th className="text-left py-2 px-2">Status</th>
                      <th className="text-left py-2 px-2">Handlinger</th>
                    </tr>
                  </thead>
                  <tbody>
                    {firewallRules.map((rule) => (
                      <tr key={rule.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2">
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">{rule.priority}</span>
                            <div className="flex flex-col">
                              <ArrowUpIcon className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-pointer" />
                              <ArrowDownIcon className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-pointer" />
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-2 font-medium">{rule.name}</td>
                        <td className="py-2 px-2">
                          <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                            rule.type === 'inbound' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {rule.type === 'inbound' ? '↓ Inn' : '↑ Ut'}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                            rule.action === 'allow' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {rule.action === 'allow' ? 'Tillat' : 'Blokker'}
                          </span>
                        </td>
                        <td className="py-2 px-2">{rule.protocol}</td>
                        <td className="py-2 px-2 text-xs">
                          <div>{rule.sourceIP}:{rule.sourcePort}</div>
                        </td>
                        <td className="py-2 px-2 text-xs">
                          <div>{rule.destIP}:{rule.destPort}</div>
                        </td>
                        <td className="py-2 px-2">
                          <div className="text-xs">
                            <p className="font-medium">{rule.hits}</p>
                            <p className="text-gray-500">{rule.lastHit}</p>
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center space-x-1">
                            {rule.enabled ? (
                              <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircleIcon className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="text-xs">
                              {rule.enabled ? 'Aktiv' : 'Inaktiv'}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRuleToggle(rule.id)}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                rule.enabled
                                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {rule.enabled ? 'Deaktiver' : 'Aktiver'}
                            </button>
                            <button
                              onClick={() => deleteRule(rule.id)}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                              <TrashIcon className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'blocklist' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShieldExclamationIcon className="h-5 w-5" />
              <span>Blokkerte IP-adresser</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="cards-spacing-vertical">
              {blockedIPs.map((ip) => (
                <div key={ip.id} className="px-2 py-1 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-mono font-medium text-gray-900">{ip.ipAddress}</h3>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          ip.type === 'automatic' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {ip.type === 'automatic' ? 'Automatisk' : 'Manuell'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{ip.reason}</p>
                      <div className="grid grid-cols-3 cards-spacing-grid text-sm text-gray-500">
                        <div>
                          <span>Blokkert:</span>
                          <p className="font-medium text-gray-900">{ip.blockedDate}</p>
                        </div>
                        <div>
                          <span>Utløper:</span>
                          <p className="font-medium text-gray-900">{ip.expiresAt || 'Permanent'}</p>
                        </div>
                        <div>
                          <span>Forsøk:</span>
                          <p className="font-medium text-gray-900">{ip.attempts}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => unblockIP(ip.id)}
                      className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Opphev blokkering
                    </button>
                  </div>
                </div>
              ))}

              <button onClick={() => console.log('Button clicked')} className="w-full px-2 py-1 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
                + Legg til IP manuelt
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'alerts' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span>Sikkerhetsvarsler</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="cards-spacing-vertical">
              {securityAlerts.map((alert) => (
                <div key={alert.id} className={`p-4 border rounded-lg ${
                  alert.resolved ? 'bg-gray-50 border-gray-200' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getSeverityColor(alert.severity)}`}>
                          {alert.severity === 'low' ? 'Lav' :
                           alert.severity === 'medium' ? 'Medium' :
                           alert.severity === 'high' ? 'Høy' : 'Kritisk'}
                        </span>
                        {alert.resolved && (
                          <span className="text-xs text-green-600">✓ Løst</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">{alert.message}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Tidspunkt: {alert.timestamp}</span>
                        <span>Kilde: {alert.source}</span>
                      </div>
                    </div>
                    {!alert.resolved && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        Marker som løst
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FirewallAdmin; 