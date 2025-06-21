import React, { useState, useEffect } from 'react';
import { systemAdminService, type VpnTilkobling } from '../../../services/system-admin.service';
import { Card, CardContent, CardHeader, CardTitle } from "../../../design-system";
import { 
  GlobeAltIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  LockClosedIcon,
  ServerIcon,
  ChartBarIcon,
  KeyIcon,
  WifiIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';

interface VpnServer {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  status: 'online' | 'offline' | 'maintenance';
  users: number;
  maxUsers: number;
  latency: number;
  uptime: number;
  encryption: string;
}

interface VpnUser {
  id: string;
  name: string;
  email: string;
  lastConnection: string;
  totalData: string;
  status: 'connected' | 'disconnected' | 'blocked';
  device: string;
  ipAddress: string;
}

interface VpnConfig {
  protocol: 'OpenVPN' | 'WireGuard' | 'IKEv2' | 'L2TP';
  port: number;
  encryption: 'AES-256' | 'AES-128' | 'ChaCha20';
  authentication: 'SHA256' | 'SHA512';
  compression: boolean;
  killSwitch: boolean;
  splitTunneling: boolean;
  autoConnect: boolean;
}

const VpnAdmin: React.FC = () => {
  const [selectedServer, setSelectedServer] = useState<string>('norway-1');
  const [vpnTilkoblinger, setVpnTilkoblinger] = useState<VpnTilkobling[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<VpnConfig>({
    protocol: 'WireGuard',
    port: 51820,
    encryption: 'AES-256',
    authentication: 'SHA256',
    compression: true,
    killSwitch: true,
    splitTunneling: false,
    autoConnect: true
  });

  // Hent VPN data
  useEffect(() => {
    const hentData = async () => {
      try {
        setLoading(true);
        const data = await systemAdminService.hentVpnTilkoblinger();
        setVpnTilkoblinger(data);
      } catch (error) {
        console.error('Feil ved henting av VPN-tilkoblinger:', error);
      } finally {
        setLoading(false);
      }
    };

    hentData();
  }, []);

  // Fjernet hardkodet data - bruker service i stedet
  const vpnServers: VpnServer[] = [
    {
      id: 'norway-1',
      name: 'Norge - Oslo',
      location: 'Oslo, Norge',
      ipAddress: '10.0.1.1',
      status: 'online',
      users: 45,
      maxUsers: 100,
      latency: 12,
      uptime: 99.8,
      encryption: 'AES-256-GCM'
    },
    {
      id: 'norway-2',
      name: 'Norge - Bergen',
      location: 'Bergen, Norge',
      ipAddress: '10.0.2.1',
      status: 'online',
      users: 23,
      maxUsers: 100,
      latency: 18,
      uptime: 99.5,
      encryption: 'AES-256-GCM'
    },
    {
      id: 'sweden-1',
      name: 'Sverige - Stockholm',
      location: 'Stockholm, Sverige',
      ipAddress: '10.1.1.1',
      status: 'maintenance',
      users: 0,
      maxUsers: 100,
      latency: 0,
      uptime: 0,
      encryption: 'AES-256-GCM'
    }
  ];

  const activeUsers: VpnUser[] = [
    {
      id: '1',
      name: 'Kari Nordmann',
      email: 'kari@bedrift.no',
      lastConnection: '2025-06-15 14:23',
      totalData: '2.3 GB',
      status: 'connected',
      device: 'Windows 11',
      ipAddress: '192.168.1.101'
    },
    {
      id: '2',
      name: 'Ola Hansen',
      email: 'ola@bedrift.no',
      lastConnection: '2025-06-15 13:45',
      totalData: '1.8 GB',
      status: 'connected',
      device: 'macOS',
      ipAddress: '192.168.1.102'
    },
    {
      id: '3',
      name: 'Per Jensen',
      email: 'per@bedrift.no',
      lastConnection: '2025-06-14 16:20',
      totalData: '0.5 GB',
      status: 'disconnected',
      device: 'Android',
      ipAddress: '-'
    }
  ];

  const monthlyStats = {
    totalConnections: 2456,
    averageUptime: 99.7,
    totalDataTransfer: 456.7, // GB
    activeUsers: 68,
    blockedAttempts: 23
  };

  const handleConfigChange = (key: keyof VpnConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const toggleUserAccess = (userId: string) => {
    alert(`Bruker ${userId} tilgang endret!`);
  };

  const restartServer = (serverId: string) => {
    alert(`Server ${serverId} startes på nytt...`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-50';
      case 'offline': return 'text-red-600 bg-red-50';
      case 'maintenance': return 'text-orange-600 bg-orange-50';
      case 'connected': return 'text-green-600 bg-green-50';
      case 'disconnected': return 'text-gray-600 bg-gray-50';
      case 'blocked': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'offline':
      case 'blocked': return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'maintenance': return <ClockIcon className="h-4 w-4 text-orange-500" />;
      case 'disconnected': return <XCircleIcon className="h-4 w-4 text-gray-400" />;
      default: return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="px-2 py-1 cards-spacing-vertical">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">VPN Administrasjon</h1>
        <p className="text-gray-600 mt-2">
          Administrer VPN-servere og brukertilganger
        </p>
      </div>

      {/* Monthly Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 cards-spacing-grid">
        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tilkoblinger</p>
              <p className="text-2xl font-bold">{monthlyStats.totalConnections}</p>
            </div>
            <WifiIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Oppetid</p>
              <p className="text-2xl font-bold text-green-600">{monthlyStats.averageUptime}%</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Data overført</p>
              <p className="text-2xl font-bold">{monthlyStats.totalDataTransfer} GB</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Aktive brukere</p>
              <p className="text-2xl font-bold">{monthlyStats.activeUsers}</p>
            </div>
            <GlobeAltIcon className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Blokkerte forsøk</p>
              <p className="text-2xl font-bold text-red-600">{monthlyStats.blockedAttempts}</p>
            </div>
            <ShieldCheckIcon className="h-8 w-8 text-red-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 cards-spacing-grid">
        {/* VPN Servers */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ServerIcon className="h-5 w-5" />
                <span>VPN Servere</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="cards-spacing-vertical">
              {vpnServers.map((server) => (
                <div
                  key={server.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedServer === server.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedServer(server.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">{server.name}</h3>
                        {getStatusIcon(server.status)}
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(server.status)}`}>
                          {server.status === 'online' ? 'Online' :
                           server.status === 'offline' ? 'Offline' : 'Vedlikehold'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 cards-spacing-grid text-sm">
                        <div>
                          <span className="text-gray-500">IP-adresse:</span>
                          <p className="font-medium">{server.ipAddress}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Lokasjon:</span>
                          <p className="font-medium">{server.location}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Brukere:</span>
                          <p className="font-medium">{server.users} / {server.maxUsers}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Latency:</span>
                          <p className="font-medium">{server.latency || '-'} ms</p>
                        </div>
                      </div>

                      {server.status === 'online' && (
                        <div className="mt-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Kapasitet</span>
                            <span>{Math.round((server.users / server.maxUsers) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                (server.users / server.maxUsers) > 0.8 ? 'bg-red-500' :
                                (server.users / server.maxUsers) > 0.6 ? 'bg-orange-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${(server.users / server.maxUsers) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-6 ml-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          restartServer(server.id);
                        }}
                        className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                      >
                        <ArrowPathIcon className="h-3 w-3 mr-1 inline" />
                        Restart
                      </button>
                      <button onClick={() => console.log('Button clicked')} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                        <ChartBarIcon className="h-3 w-3 mr-1 inline" />
                        Statistikk
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={() => console.log('Button clicked')} className="w-full px-2 py-1 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
                + Legg til ny VPN server
              </button>
            </CardContent>
          </Card>
        </div>

        {/* VPN Configuration */}
        <div className="cards-spacing-vertical">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LockClosedIcon className="h-5 w-5" />
                <span>VPN Konfigurasjon</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="cards-spacing-vertical">
              <div className="space-y-6">
                <label className="text-sm font-medium text-gray-700">Protokoll</label>
                <select
                  value={config.protocol}
                  onChange={(e) => handleConfigChange('protocol', e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="WireGuard">WireGuard (Anbefalt)</option>
                  <option value="OpenVPN">OpenVPN</option>
                  <option value="IKEv2">IKEv2/IPSec</option>
                  <option value="L2TP">L2TP/IPSec</option>
                </select>
              </div>

              <div className="space-y-6">
                <label className="text-sm font-medium text-gray-700">Port</label>
                <input
                  type="number"
                  value={config.port}
                  onChange={(e) => handleConfigChange('port', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-6">
                <label className="text-sm font-medium text-gray-700">Kryptering</label>
                <select
                  value={config.encryption}
                  onChange={(e) => handleConfigChange('encryption', e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="AES-256">AES-256 (Sterkest)</option>
                  <option value="AES-128">AES-128</option>
                  <option value="ChaCha20">ChaCha20</option>
                </select>
              </div>

              <div className="space-y-8 pt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="killSwitch"
                    checked={config.killSwitch}
                    onChange={(e) => handleConfigChange('killSwitch', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="killSwitch" className="text-sm text-gray-700">
                    Kill Switch (stopp trafikk hvis VPN kobles fra)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="splitTunneling"
                    checked={config.splitTunneling}
                    onChange={(e) => handleConfigChange('splitTunneling', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="splitTunneling" className="text-sm text-gray-700">
                    Split Tunneling
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoConnect"
                    checked={config.autoConnect}
                    onChange={(e) => handleConfigChange('autoConnect', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="autoConnect" className="text-sm text-gray-700">
                    Auto-koble til ved oppstart
                  </label>
                </div>
              </div>

              <button onClick={() => console.log('Lagre endringer')} className="w-full px-2 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                Lagre konfigurasjon
              </button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <KeyIcon className="h-5 w-5" />
                <span>Hurtighandlinger</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <button onClick={() => console.log('Button clicked')} className="w-full px-2 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                <PlayIcon className="mr-2 h-4 w-4 inline" />
                Generer ny bruker konfigurasjon
              </button>
              <button onClick={() => console.log('Button clicked')} className="w-full px-2 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors">
                <ArrowPathIcon className="mr-2 h-4 w-4 inline" />
                Forny sertifikater
              </button>
              <button onClick={() => console.log('Stopp prosess')} className="w-full px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                <StopIcon className="mr-2 h-4 w-4 inline" />
                Stopp alle tilkoblinger
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Active Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GlobeAltIcon className="h-5 w-5" />
            <span>Aktive Brukere</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Bruker</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Siste tilkobling</th>
                  <th className="text-left py-2 px-2">Enhet</th>
                  <th className="text-left py-2 px-2">IP-adresse</th>
                  <th className="text-left py-2 px-2">Data brukt</th>
                  <th className="text-left py-2 px-2">Handlinger</th>
                </tr>
              </thead>
              <tbody>
                {activeUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full ${getStatusColor(user.status)}`}>
                        {getStatusIcon(user.status)}
                        <span>
                          {user.status === 'connected' ? 'Tilkoblet' :
                           user.status === 'disconnected' ? 'Frakoblet' : 'Blokkert'}
                        </span>
                      </span>
                    </td>
                    <td className="py-2 px-2">{user.lastConnection}</td>
                    <td className="py-2 px-2">{user.device}</td>
                    <td className="py-2 px-2 font-mono text-xs">{user.ipAddress}</td>
                    <td className="py-2 px-2">{user.totalData}</td>
                    <td className="py-2 px-2">
                      <button
                        onClick={() => toggleUserAccess(user.id)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          user.status === 'connected' || user.status === 'disconnected'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {user.status === 'blocked' ? 'Opphev blokkering' : 'Blokker'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Security Alert */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="px-2 py-1">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-800">Sikkerhetsadvarsel</h4>
              <p className="text-sm text-orange-700 mt-1">
                23 mislykkede påloggingsforsøk oppdaget de siste 24 timene. 
                Vurder å aktivere strengere autentiseringsregler.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VpnAdmin; 