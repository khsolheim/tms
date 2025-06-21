import api from '../lib/api';

// Interfaces
export interface ApiKey {
  id: string;
  navn: string;
  nøkkel: string;
  type: 'READ_ONLY' | 'READ_WRITE' | 'ADMIN';
  status: 'AKTIV' | 'SUSPENDERT' | 'UTLØPT';
  opprettet: string;
  sistBrukt?: string;
  utløper?: string | null;
  tilganger: string[];
  bruktAntall?: number;
  maksAntall?: number;
  ipRestriksjon?: string[];
  beskrivelse?: string;
}

export interface ApiStatistikk {
  totaleKeys: number;
  aktiveKeys: number;
  totaleKall: number;
  kallSisteDøgn: number;
  gjennomsnittRespons: number;
  feilrate: number;
}

export interface Integration {
  id: string;
  navn: string;
  type: 'EXTERNAL_API' | 'OAUTH' | 'WEBHOOK' | 'DATABASE';
  status: 'TILKOBLET' | 'FRAKOBLET' | 'FEIL' | 'VEDLIKEHOLD';
  endepunkt: string;
  sistSynkronisert?: string;
  feilmelding?: string;
  konfiguration: Record<string, any>;
  statistikk: {
    totaleKall: number;
    vellykkede: number;
    feilede: number;
    gjennomsnittRespenstid: number;
  };
}

export interface SmsProvider {
  id: string;
  name: string;
  type: 'twilio' | 'telenor' | 'telia' | 'custom';
  status: 'active' | 'inactive' | 'error';
  fromNumber: string;
  monthlyLimit: number;
  usedThisMonth: number;
  costPerSms: number;
}

export interface SmsTemplate {
  id: string;
  name: string;
  message: string;
  category: 'reminder' | 'alert' | 'notification' | 'marketing';
  variables: string[];
  active: boolean;
}

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'push' | 'email' | 'sms' | 'webhook';
  enabled: boolean;
  description: string;
  config: Record<string, any>;
  lastUsed?: string;
  sentToday: number;
  monthlyLimit: number;
}

export interface VpnServer {
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

export interface VpnUser {
  id: string;
  name: string;
  email: string;
  lastConnection: string;
  totalData: string;
  status: 'connected' | 'disconnected';
  device: string;
  ipAddress: string;
}

export interface VpnConfig {
  protocol: string;
  port: number;
  encryption: string;
  authentication: string;
  compression: boolean;
  killSwitch: boolean;
  splitTunneling: boolean;
  autoConnect: boolean;
}

class IntegrasjonsService {
  // API Keys
  async hentApiKeys(): Promise<ApiKey[]> {
    const response = await api.get('/admin/api-keys');
    return response.data;
  }

  async opprettApiKey(data: Partial<ApiKey>): Promise<ApiKey> {
    const response = await api.post('/admin/api-keys', data);
    return response.data;
  }

  async oppdaterApiKey(id: string, data: Partial<ApiKey>): Promise<ApiKey> {
    const response = await api.put(`/admin/api-keys/${id}`, data);
    return response.data;
  }

  async slettApiKey(id: string): Promise<void> {
    await api.delete(`/admin/api-keys/${id}`);
  }

  // API Statistikk
  async hentApiStatistikk(): Promise<ApiStatistikk> {
    const response = await api.get('/admin/api-statistikk');
    return response.data;
  }

  // Integrasjoner
  async hentIntegrasjoner(): Promise<Integration[]> {
    const response = await api.get('/admin/integrasjoner');
    return response.data;
  }

  async testIntegrasjon(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/admin/integrasjoner/${id}/test`);
    return response.data;
  }

  async oppdaterIntegrasjon(id: string, data: Partial<Integration>): Promise<Integration> {
    const response = await api.put(`/admin/integrasjoner/${id}`, data);
    return response.data;
  }

  // SMS Tjenester
  async hentSmsProviders(): Promise<SmsProvider[]> {
    const response = await api.get('/admin/sms/providers');
    return response.data;
  }

  async hentSmsTemplates(): Promise<SmsTemplate[]> {
    const response = await api.get('/admin/sms/templates');
    return response.data;
  }

  async sendTestSms(provider: string, number: string, message: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/admin/sms/test', { provider, number, message });
    return response.data;
  }

  // Notifikasjoner
  async hentNotificationChannels(): Promise<NotificationChannel[]> {
    const response = await api.get('/admin/notifications/channels');
    return response.data;
  }

  async testNotification(channel: string, recipient: string, message: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/admin/notifications/test', { channel, recipient, message });
    return response.data;
  }

  // VPN
  async hentVpnServers(): Promise<VpnServer[]> {
    const response = await api.get('/admin/vpn/servers');
    return response.data;
  }

  async hentVpnUsers(): Promise<VpnUser[]> {
    const response = await api.get('/admin/vpn/users');
    return response.data;
  }

  async hentVpnConfig(): Promise<VpnConfig> {
    const response = await api.get('/admin/vpn/config');
    return response.data;
  }

  async oppdaterVpnConfig(config: VpnConfig): Promise<VpnConfig> {
    const response = await api.put('/admin/vpn/config', config);
    return response.data;
  }

  // Mock data for utvikling
  async hentApiMockData(): Promise<{
    apiKeys: ApiKey[];
    statistikk: ApiStatistikk;
    integrations: Integration[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const apiKeys: ApiKey[] = [
      {
        id: '1',
        navn: 'Mobile App Integration',
        nøkkel: 'tms_api_key_mobile_2025_abc123def456',
        type: 'READ_WRITE',
        status: 'AKTIV',
        opprettet: '2025-01-15T10:00:00Z',
        sistBrukt: '2025-06-14T14:30:00Z',
        utløper: '2025-12-31T23:59:59Z',
        tilganger: ['bedrifter.read', 'bedrifter.write', 'elever.read', 'kontrakter.read'],
        bruktAntall: 15430,
        maksAntall: 100000,
        ipRestriksjon: ['192.168.1.0/24', '10.0.0.0/8'],
        beskrivelse: 'API-tilgang for mobil applikasjon'
      },
      {
        id: '2',
        navn: 'External Analytics',
        nøkkel: 'tms_api_key_analytics_2025_xyz789ghi012',
        type: 'READ_ONLY',
        status: 'AKTIV',
        opprettet: '2025-03-01T08:00:00Z',
        sistBrukt: '2025-06-14T12:15:00Z',
        utløper: null,
        tilganger: ['statistikk.read', 'rapporter.read'],
        bruktAntall: 8945,
        beskrivelse: 'Tilgang for eksternt analyseverktøy'
      },
      {
        id: '3',
        navn: 'Legacy System Bridge',
        nøkkel: 'tms_api_key_legacy_2025_old456new789',
        type: 'ADMIN',
        status: 'SUSPENDERT',
        opprettet: '2024-12-01T12:00:00Z',
        sistBrukt: '2025-05-20T16:45:00Z',
        utløper: '2025-06-30T23:59:59Z',
        tilganger: ['*'],
        bruktAntall: 2345,
        maksAntall: 50000,
        beskrivelse: 'Midlertidig tilgang for legacy system migrering'
      }
    ];

    const statistikk: ApiStatistikk = {
      totaleKeys: 12,
      aktiveKeys: 8,
      totaleKall: 45672,
      kallSisteDøgn: 1247,
      gjennomsnittRespons: 234,
      feilrate: 2.3
    };

    const integrations: Integration[] = [
      {
        id: '1',
        navn: 'Norwegian Public Roads Administration',
        type: 'EXTERNAL_API',
        status: 'TILKOBLET',
        endepunkt: 'https://api.vegvesen.no/v1',
        sistSynkronisert: '2025-06-14T14:00:00Z',
        konfiguration: {
          apiKey: '*********************',
          timeout: 30000,
          retries: 3
        },
        statistikk: {
          totaleKall: 12450,
          vellykkede: 12201,
          feilede: 249,
          gjennomsnittRespenstid: 450
        }
      },
      {
        id: '2',
        navn: 'Bank Integration (AutoPay)',
        type: 'OAUTH',
        status: 'TILKOBLET',
        endepunkt: 'https://api.bank.no/oauth2',
        sistSynkronisert: '2025-06-14T13:45:00Z',
        konfiguration: {
          clientId: 'tms_banking_client',
          scopes: ['payments.read', 'accounts.read'],
          refreshToken: '*********************'
        },
        statistikk: {
          totaleKall: 3421,
          vellykkede: 3398,
          feilede: 23,
          gjennomsnittRespenstid: 1200
        }
      },
      {
        id: '3',
        navn: 'SMS Provider (Telenor)',
        type: 'EXTERNAL_API',
        status: 'FEIL',
        endepunkt: 'https://api.telenor.no/sms/v2',
        sistSynkronisert: '2025-06-14T10:30:00Z',
        feilmelding: 'HTTP 401: Invalid API credentials',
        konfiguration: {
          apiKey: '*********************',
          sender: 'TMS-System'
        },
        statistikk: {
          totaleKall: 1567,
          vellykkede: 1234,
          feilede: 333,
          gjennomsnittRespenstid: 800
        }
      }
    ];

    return { apiKeys, statistikk, integrations };
  }

  async hentSmsMockData(): Promise<{
    providers: SmsProvider[];
    templates: SmsTemplate[];
    monthlyStats: any;
  }> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const providers: SmsProvider[] = [
      {
        id: 'twilio',
        name: 'Twilio',
        type: 'twilio',
        status: 'active',
        fromNumber: '+4791234567',
        monthlyLimit: 1000,
        usedThisMonth: 342,
        costPerSms: 0.85
      },
      {
        id: 'telenor',
        name: 'Telenor SMS API',
        type: 'telenor',
        status: 'inactive',
        fromNumber: '+4798765432',
        monthlyLimit: 2000,
        usedThisMonth: 0,
        costPerSms: 0.75
      },
      {
        id: 'telia',
        name: 'Telia SMS Gateway',
        type: 'telia',
        status: 'error',
        fromNumber: '+4787654321',
        monthlyLimit: 1500,
        usedThisMonth: 156,
        costPerSms: 0.80
      }
    ];

    const templates: SmsTemplate[] = [
      {
        id: '1',
        name: 'Quiz påminnelse',
        message: 'Hei {navn}, du har en quiz som forfaller om {dager} dager. Logg inn på TMS for å fullføre.',
        category: 'reminder',
        variables: ['navn', 'dager'],
        active: true
      },
      {
        id: '2',
        name: 'Sikkerhetskontroll alert',
        message: 'VIKTIG: Sikkerhetskontroll {kontroll} har avvik som krever umiddelbar oppmerksomhet.',
        category: 'alert',
        variables: ['kontroll'],
        active: true
      },
      {
        id: '3',
        name: 'Ny kontrakt',
        message: 'Din nye kontrakt er klar for signering. Se TMS for detaljer.',
        category: 'notification',
        variables: [],
        active: false
      }
    ];

    const monthlyStats = {
      totalSent: 342,
      successRate: 98.2,
      failedMessages: 6,
      averageDeliveryTime: 2.3,
      totalCost: 290.70
    };

    return { providers, templates, monthlyStats };
  }

  async hentNotificationMockData(): Promise<{
    channels: NotificationChannel[];
    monthlyStats: any;
  }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const channels: NotificationChannel[] = [
      {
        id: 'push',
        name: 'Push Notifications',
        type: 'push',
        enabled: true,
        description: 'Instant push-varsler til mobile enheter og nettlesere',
        config: {
          fcmServerKey: '••••••••',
          vapidKey: '••••••••'
        },
        lastUsed: '2025-06-15 14:30',
        sentToday: 234,
        monthlyLimit: 10000
      },
      {
        id: 'email',
        name: 'E-post',
        type: 'email',
        enabled: true,
        description: 'E-postvarsler via SMTP',
        config: {
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          fromEmail: 'noreply@tms.no'
        },
        lastUsed: '2025-06-15 13:45',
        sentToday: 156,
        monthlyLimit: 5000
      },
      {
        id: 'sms',
        name: 'SMS',
        type: 'sms',
        enabled: false,
        description: 'SMS-varsler via Twilio',
        config: {
          provider: 'Twilio',
          fromNumber: '+4791234567'
        },
        lastUsed: '2025-06-14 16:20',
        sentToday: 45,
        monthlyLimit: 1000
      },
      {
        id: 'webhook',
        name: 'Webhook',
        type: 'webhook',
        enabled: true,
        description: 'HTTP POST til eksterne systemer',
        config: {
          endpoints: ['https://api.example.com/notifications']
        },
        lastUsed: '2025-06-15 12:00',
        sentToday: 89,
        monthlyLimit: 50000
      }
    ];

    const monthlyStats = {
      totalSent: 2456,
      successRate: 97.8,
      failedNotifications: 54,
      averageDeliveryTime: 1.8,
      topChannel: 'push'
    };

    return { channels, monthlyStats };
  }

  async hentVpnMockData(): Promise<{
    servers: VpnServer[];
    users: VpnUser[];
    config: VpnConfig;
  }> {
    await new Promise(resolve => setTimeout(resolve, 350));

    const servers: VpnServer[] = [
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

    const users: VpnUser[] = [
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

    const config: VpnConfig = {
      protocol: 'WireGuard',
      port: 51820,
      encryption: 'AES-256',
      authentication: 'SHA256',
      compression: true,
      killSwitch: true,
      splitTunneling: false,
      autoConnect: true
    };

    return { servers, users, config };
  }
}

export const integrasjonsService = new IntegrasjonsService();
export default integrasjonsService; 