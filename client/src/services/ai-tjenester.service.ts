import api from '../lib/api';

// Interfaces
export interface AiService {
  id: string;
  name: string;
  provider: 'openai' | 'azure' | 'google' | 'anthropic';
  type: 'text' | 'image' | 'analysis';
  status: 'active' | 'configured' | 'inactive' | 'error';
  description: string;
  monthlyUsage: number;
  monthlyLimit: number;
  costPerRequest: number;
  lastUsed: string;
  apiKey?: string;
  endpoint?: string;
  model?: string;
}

export interface AiAutomation {
  id: string;
  name: string;
  trigger: 'event' | 'manual' | 'scheduled';
  description: string;
  enabled: boolean;
  lastRun: string;
  successRate: number;
  runsThisMonth: number;
  schedule?: string;
  conditions?: Record<string, any>;
  actions?: Record<string, any>;
}

export interface AiStatistikk {
  totalRequests: number;
  totalCost: number;
  averageResponseTime: number;
  successRate: number;
  topService: string;
  monthlyTrend: Array<{
    month: string;
    requests: number;
    cost: number;
  }>;
}

export interface TestResult {
  success: boolean;
  response?: string;
  error?: string;
  responseTime: number;
  timestamp: string;
}

class AiTjenesterService {
  // AI Services
  async hentAiServices(): Promise<AiService[]> {
    const response = await api.get('/ai-tjenester/services');
    return response.data;
  }

  async oppdaterAiService(serviceId: string, config: Partial<AiService>): Promise<void> {
    await api.put(`/ai-tjenester/services/${serviceId}`, config);
  }

  async testAiService(serviceId: string, testQuery: string): Promise<TestResult> {
    const response = await api.post(`/ai-tjenester/services/${serviceId}/test`, { query: testQuery });
    return response.data;
  }

  // AI Automations
  async hentAiAutomations(): Promise<AiAutomation[]> {
    const response = await api.get('/ai-tjenester/automations');
    return response.data;
  }

  async opprettAutomation(automation: Omit<AiAutomation, 'id'>): Promise<AiAutomation> {
    const response = await api.post('/ai-tjenester/automations', automation);
    return response.data;
  }

  async oppdaterAutomation(automationId: string, updates: Partial<AiAutomation>): Promise<void> {
    await api.put(`/ai-tjenester/automations/${automationId}`, updates);
  }

  async slettAutomation(automationId: string): Promise<void> {
    await api.delete(`/ai-tjenester/automations/${automationId}`);
  }

  async kjørAutomation(automationId: string): Promise<void> {
    await api.post(`/ai-tjenester/automations/${automationId}/run`);
  }

  // Statistikk
  async hentAiStatistikk(): Promise<AiStatistikk> {
    const response = await api.get('/ai-tjenester/statistikk');
    return response.data;
  }

  // Mock data for utvikling
  async hentMockData(): Promise<{
    services: AiService[];
    automations: AiAutomation[];
    statistikk: AiStatistikk;
  }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const services: AiService[] = [
      {
        id: 'openai-chat',
        name: 'ChatGPT API',
        provider: 'openai',
        type: 'text',
        status: 'active',
        description: 'Tekstgenerering og analyse for rapporter og kommunikasjon',
        monthlyUsage: 2450,
        monthlyLimit: 10000,
        costPerRequest: 0.02,
        lastUsed: '2025-06-15',
        model: 'gpt-4',
        endpoint: 'https://api.openai.com/v1/chat/completions'
      },
      {
        id: 'azure-cognitive',
        name: 'Azure Cognitive Services',
        provider: 'azure',
        type: 'analysis',
        status: 'configured',
        description: 'Dokumentanalyse og form-gjenkjenning',
        monthlyUsage: 156,
        monthlyLimit: 5000,
        costPerRequest: 0.05,
        lastUsed: '2025-06-12',
        endpoint: 'https://westeurope.api.cognitive.microsoft.com'
      },
      {
        id: 'google-vision',
        name: 'Google Vision API',
        provider: 'google',
        type: 'image',
        status: 'inactive',
        description: 'Bildegjenkjenning for sikkerhetskontroller',
        monthlyUsage: 0,
        monthlyLimit: 2000,
        costPerRequest: 0.03,
        lastUsed: '2025-05-28',
        endpoint: 'https://vision.googleapis.com/v1'
      },
      {
        id: 'anthropic-claude',
        name: 'Claude API',
        provider: 'anthropic',
        type: 'text',
        status: 'error',
        description: 'Avansert tekstanalyse og sammendrag',
        monthlyUsage: 89,
        monthlyLimit: 3000,
        costPerRequest: 0.04,
        lastUsed: '2025-06-14',
        model: 'claude-3-sonnet',
        endpoint: 'https://api.anthropic.com/v1/messages'
      }
    ];

    const automations: AiAutomation[] = [
      {
        id: '1',
        name: 'Automatisk rapport sammendrag',
        trigger: 'event',
        description: 'Generer sammendrag av sikkerhetskontroll rapporter automatisk',
        enabled: true,
        lastRun: '2025-06-15 14:30',
        successRate: 94.2,
        runsThisMonth: 67,
        conditions: {
          eventType: 'report_created',
          reportType: 'safety_check'
        },
        actions: {
          aiService: 'openai-chat',
          prompt: 'Lag et sammendrag av denne sikkerhetskontroll rapporten',
          outputFormat: 'markdown'
        }
      },
      {
        id: '2',
        name: 'Quiz spørsmål generering',
        trigger: 'manual',
        description: 'Opprett nye quiz spørsmål basert på HMS-dokumenter',
        enabled: true,
        lastRun: '2025-06-12 09:15',
        successRate: 87.5,
        runsThisMonth: 23,
        actions: {
          aiService: 'openai-chat',
          prompt: 'Generer quiz spørsmål basert på dette HMS-dokumentet',
          outputFormat: 'json'
        }
      },
      {
        id: '3',
        name: 'Risiko analyse',
        trigger: 'scheduled',
        description: 'Ukentlig analyse av potensielle risikoer basert på data',
        enabled: false,
        lastRun: '2025-06-08 00:00',
        successRate: 78.3,
        runsThisMonth: 4,
        schedule: '0 0 * * 1', // Hver mandag kl 00:00
        actions: {
          aiService: 'anthropic-claude',
          prompt: 'Analyser sikkerhetsdataene og identifiser potensielle risikoer',
          outputFormat: 'report'
        }
      }
    ];

    const statistikk: AiStatistikk = {
      totalRequests: 2695,
      totalCost: 142.85,
      averageResponseTime: 1.8,
      successRate: 96.7,
      topService: 'ChatGPT API',
      monthlyTrend: [
        { month: 'Jan', requests: 1890, cost: 89.45 },
        { month: 'Feb', requests: 2134, cost: 98.23 },
        { month: 'Mar', requests: 2456, cost: 112.67 },
        { month: 'Apr', requests: 2298, cost: 105.89 },
        { month: 'Mai', requests: 2567, cost: 125.34 },
        { month: 'Jun', requests: 2695, cost: 142.85 }
      ]
    };

    return { services, automations, statistikk };
  }

  async testMockService(serviceId: string, testQuery: string): Promise<TestResult> {
    await new Promise(resolve => setTimeout(resolve, 2500));

    const mockResponse = `AI Respons:
      
Basert på analysen av sikkerhetskontroll rapporten kan jeg identifisere følgende hovedpunkter:

1. **Kritiske avvik**: 2 alvorlige sikkerhetshull funnet
2. **Anbefalinger**: Umiddelbar oppfølging kreves for brannslukningsapparater
3. **Compliance**: 87% samsvar med HMS-standarder
4. **Neste steg**: Planlegg oppfølgingskontroll innen 30 dager

Ønsker du en mer detaljert analyse av spesifikke områder?`;

    return {
      success: true,
      response: mockResponse,
      responseTime: 2.5,
      timestamp: new Date().toISOString()
    };
  }
}

export const aiTjenesterService = new AiTjenesterService();
export default aiTjenesterService; 