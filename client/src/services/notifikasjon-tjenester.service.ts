import api from '../lib/api';

// Interfaces
export interface NotificationChannel {
  id: string;
  name: string;
  type: 'push' | 'email' | 'sms' | 'webhook';
  enabled: boolean;
  description: string;
  config: Record<string, any>;
  lastUsed: string;
  sentToday: number;
  monthlyLimit: number;
  deliveryRate?: number;
  errorRate?: number;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: string;
  subject?: string;
  message: string;
  variables: string[];
  category: 'reminder' | 'alert' | 'notification' | 'marketing';
  active: boolean;
  lastUsed?: string;
  usageCount?: number;
}

export interface NotificationSchedule {
  id: string;
  name: string;
  template: string;
  channel: string;
  recipients: string[];
  schedule: string; // cron expression
  enabled: boolean;
  lastRun?: string;
  nextRun: string;
  successRate: number;
  totalRuns: number;
}

export interface NotificationStatistikk {
  totalSent: number;
  successRate: number;
  failedMessages: number;
  averageDeliveryTime: number;
  totalCost: number;
  channelBreakdown: Array<{
    channel: string;
    sent: number;
    success: number;
    failed: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    sent: number;
    delivered: number;
    failed: number;
  }>;
}

export interface TestNotification {
  channel: string;
  recipient: string;
  message: string;
  template?: string;
}

export interface TestResult {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryTime: number;
  timestamp: string;
}

class NotifikasjonTjenesterService {
  // Channels
  async hentChannels(): Promise<NotificationChannel[]> {
    const response = await api.get('/notifikasjoner/channels');
    return response.data;
  }

  async oppdaterChannel(channelId: string, config: Partial<NotificationChannel>): Promise<void> {
    await api.put(`/notifikasjoner/channels/${channelId}`, config);
  }

  async testChannel(channelId: string, testData: TestNotification): Promise<TestResult> {
    const response = await api.post(`/notifikasjoner/channels/${channelId}/test`, testData);
    return response.data;
  }

  // Templates
  async hentTemplates(): Promise<NotificationTemplate[]> {
    const response = await api.get('/notifikasjoner/templates');
    return response.data;
  }

  async opprettTemplate(template: Omit<NotificationTemplate, 'id'>): Promise<NotificationTemplate> {
    const response = await api.post('/notifikasjoner/templates', template);
    return response.data;
  }

  async oppdaterTemplate(templateId: string, updates: Partial<NotificationTemplate>): Promise<void> {
    await api.put(`/notifikasjoner/templates/${templateId}`, updates);
  }

  async slettTemplate(templateId: string): Promise<void> {
    await api.delete(`/notifikasjoner/templates/${templateId}`);
  }

  // Schedules
  async hentSchedules(): Promise<NotificationSchedule[]> {
    const response = await api.get('/notifikasjoner/schedules');
    return response.data;
  }

  async opprettSchedule(schedule: Omit<NotificationSchedule, 'id'>): Promise<NotificationSchedule> {
    const response = await api.post('/notifikasjoner/schedules', schedule);
    return response.data;
  }

  async oppdaterSchedule(scheduleId: string, updates: Partial<NotificationSchedule>): Promise<void> {
    await api.put(`/notifikasjoner/schedules/${scheduleId}`, updates);
  }

  async slettSchedule(scheduleId: string): Promise<void> {
    await api.delete(`/notifikasjoner/schedules/${scheduleId}`);
  }

  // Statistikk
  async hentStatistikk(): Promise<NotificationStatistikk> {
    const response = await api.get('/notifikasjoner/statistikk');
    return response.data;
  }

  // Send notification
  async sendNotification(notification: {
    channel: string;
    recipients: string[];
    template?: string;
    message?: string;
    subject?: string;
    variables?: Record<string, any>;
  }): Promise<{ messageId: string; status: string }> {
    const response = await api.post('/notifikasjoner/send', notification);
    return response.data;
  }

  // Mock data for utvikling
  async hentMockData(): Promise<{
    channels: NotificationChannel[];
    templates: NotificationTemplate[];
    schedules: NotificationSchedule[];
    statistikk: NotificationStatistikk;
  }> {
    await new Promise(resolve => setTimeout(resolve, 500));

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
        monthlyLimit: 10000,
        deliveryRate: 94.2,
        errorRate: 2.1
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
        monthlyLimit: 5000,
        deliveryRate: 97.8,
        errorRate: 1.2
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
        monthlyLimit: 1000,
        deliveryRate: 89.5,
        errorRate: 8.2
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
        monthlyLimit: 50000,
        deliveryRate: 99.1,
        errorRate: 0.5
      }
    ];

    const templates: NotificationTemplate[] = [
      {
        id: '1',
        name: 'Quiz påminnelse',
        channel: 'push',
        subject: 'Quiz forfaller snart',
        message: 'Hei {navn}, du har en quiz som forfaller om {dager} dager. Logg inn på TMS for å fullføre.',
        category: 'reminder',
        variables: ['navn', 'dager'],
        active: true,
        lastUsed: '2025-06-14',
        usageCount: 45
      },
      {
        id: '2',
        name: 'Sikkerhetskontroll alert',
        channel: 'email',
        subject: 'VIKTIG: Sikkerhetskontroll avvik',
        message: 'VIKTIG: Sikkerhetskontroll {kontroll} har avvik som krever umiddelbar oppmerksomhet.',
        category: 'alert',
        variables: ['kontroll'],
        active: true,
        lastUsed: '2025-06-15',
        usageCount: 12
      },
      {
        id: '3',
        name: 'Ny kontrakt',
        channel: 'sms',
        message: 'Din nye kontrakt er klar for signering. Se TMS for detaljer.',
        category: 'notification',
        variables: [],
        active: false,
        lastUsed: '2025-06-10',
        usageCount: 8
      }
    ];

    const schedules: NotificationSchedule[] = [
      {
        id: '1',
        name: 'Daglig quiz påminnelse',
        template: '1',
        channel: 'push',
        recipients: ['alle_elever'],
        schedule: '0 9 * * *', // Hver dag kl 09:00
        enabled: true,
        lastRun: '2025-06-15 09:00',
        nextRun: '2025-06-16 09:00',
        successRate: 94.2,
        totalRuns: 156
      },
      {
        id: '2',
        name: 'Ukentlig sikkerhetskontroll',
        template: '2',
        channel: 'email',
        recipients: ['hms_ansvarlige'],
        schedule: '0 8 * * 1', // Hver mandag kl 08:00
        enabled: true,
        lastRun: '2025-06-10 08:00',
        nextRun: '2025-06-17 08:00',
        successRate: 100,
        totalRuns: 24
      }
    ];

    const statistikk: NotificationStatistikk = {
      totalSent: 2456,
      successRate: 94.8,
      failedMessages: 128,
      averageDeliveryTime: 2.3,
      totalCost: 145.67,
      channelBreakdown: [
        { channel: 'push', sent: 1234, success: 1165, failed: 69 },
        { channel: 'email', sent: 890, success: 871, failed: 19 },
        { channel: 'sms', sent: 234, success: 209, failed: 25 },
        { channel: 'webhook', sent: 98, success: 83, failed: 15 }
      ],
      monthlyTrend: [
        { month: 'Jan', sent: 1890, delivered: 1789, failed: 101 },
        { month: 'Feb', sent: 2134, delivered: 2023, failed: 111 },
        { month: 'Mar', sent: 2456, delivered: 2328, failed: 128 },
        { month: 'Apr', sent: 2298, delivered: 2187, failed: 111 },
        { month: 'Mai', sent: 2567, delivered: 2434, failed: 133 },
        { month: 'Jun', sent: 2456, delivered: 2328, failed: 128 }
      ]
    };

    return { channels, templates, schedules, statistikk };
  }

  async testMockNotification(testData: TestNotification): Promise<TestResult> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      success: true,
      messageId: `msg_${Date.now()}`,
      deliveryTime: 1.5,
      timestamp: new Date().toISOString()
    };
  }
}

export const notifikasjonTjenesterService = new NotifikasjonTjenesterService();
export default notifikasjonTjenesterService; 