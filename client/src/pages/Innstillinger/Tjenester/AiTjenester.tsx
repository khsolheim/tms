import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../design-system";
import { aiTjenesterService, AiService as ServiceAiService, AiAutomation as ServiceAiAutomation, AiStatistikk } from '../../../services/ai-tjenester.service';
import { 
  SparklesIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ChartBarIcon,
  EyeIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

interface AiService {
  id: string;
  name: string;
  provider: 'openai' | 'azure' | 'google' | 'anthropic';
  type: 'text' | 'image' | 'analysis' | 'automation';
  status: 'active' | 'inactive' | 'error' | 'configured';
  description: string;
  monthlyUsage: number;
  monthlyLimit: number;
  costPerRequest: number;
  lastUsed: string;
}

interface AiAutomation {
  id: string;
  name: string;
  trigger: 'manual' | 'scheduled' | 'event';
  description: string;
  enabled: boolean;
  lastRun: string;
  successRate: number;
  runsThisMonth: number;
}

const AiTjenester: React.FC = () => {
  const [selectedService, setSelectedService] = useState<string>('openai-chat');
  const [testQuery, setTestQuery] = useState('Analyser denne sikkerhetskontroll rapporten');
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for service data
  const [aiServices, setAiServices] = useState<ServiceAiService[]>([]);
  const [aiAutomations, setAiAutomations] = useState<ServiceAiAutomation[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<AiStatistikk | null>(null);

  useEffect(() => {
    hentData();
  }, []);

  const hentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await aiTjenesterService.hentMockData();
      setAiServices(data.services);
      setAiAutomations(data.automations);
      setMonthlyStats(data.statistikk);
    } catch (err) {
      setError('Kunne ikke laste AI-tjenester data');
      console.error('Feil ved lasting av AI-tjenester:', err);
    } finally {
      setLoading(false);
    }
  };

  // Hardkodede data fjernet - bruker service i stedet

  const testAiService = async () => {
    if (!testQuery.trim()) {
      alert('Vennligst skriv inn en test spørring');
      return;
    }

    setIsTestingApi(true);
    try {
      const result = await aiTjenesterService.testMockService(selectedService, testQuery);
      
      if (result.success && result.response) {
        alert(result.response);
      } else {
        alert(result.error || 'Ukjent feil ved testing av AI-tjeneste');
      }
    } catch (error) {
      alert('Feil ved testing av AI-tjeneste. Sjekk API-nøkler og konfigurering.');
    } finally {
      setIsTestingApi(false);
    }
  };

  const toggleAutomation = (automationId: string) => {
    alert(`Automatisering ${automationId} endret!`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'configured': return 'text-blue-600 bg-blue-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai': return 'text-green-600 bg-green-50';
      case 'azure': return 'text-blue-600 bg-blue-50';
      case 'google': return 'text-red-600 bg-red-50';
      case 'anthropic': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
      case 'image': return <EyeIcon className="h-5 w-5" />;
      case 'analysis': return <ChartBarIcon className="h-5 w-5" />;
      case 'automation': return <BoltIcon className="h-5 w-5" />;
      default: return <CpuChipIcon className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="px-2 py-1 cards-spacing-vertical">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laster AI-tjenester...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-2 py-1 cards-spacing-vertical">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={hentData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Prøv igjen
          </button>
        </div>
      </div>
    );
  }

  if (!monthlyStats) {
    return (
      <div className="px-2 py-1 cards-spacing-vertical">
        <div className="text-center py-12">
          <p className="text-gray-600">Ingen data tilgjengelig</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 py-1 cards-spacing-vertical">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Tjenester</h1>
        <p className="text-gray-600 mt-2">
          Konfigurer AI-integrasjoner og automatisering
        </p>
      </div>

      {/* Monthly Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 cards-spacing-grid">
        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">AI forespørsler</p>
              <p className="text-2xl font-bold">{monthlyStats.totalRequests}</p>
            </div>
            <CpuChipIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total kostnad</p>
              <p className="text-2xl font-bold">kr {monthlyStats.totalCost}</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Responstid (sek)</p>
              <p className="text-2xl font-bold">{monthlyStats.averageResponseTime}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Suksessrate</p>
              <p className="text-2xl font-bold text-green-600">{monthlyStats.successRate}%</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Mest brukt</p>
              <p className="text-lg font-bold text-purple-600">{monthlyStats.topService}</p>
            </div>
            <SparklesIcon className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 cards-spacing-grid">
        {/* AI Services */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SparklesIcon className="h-5 w-5" />
                <span>AI Tjenester</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="cards-spacing-vertical">
              {aiServices.map((service) => (
                <div
                  key={service.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedService === service.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedService(service.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="text-blue-500 mt-1">
                        {getTypeIcon(service.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-900">{service.name}</h3>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getProviderColor(service.provider)}`}>
                            {service.provider.toUpperCase()}
                          </span>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(service.status)}`}>
                            {service.status === 'active' ? 'Aktiv' :
                             service.status === 'configured' ? 'Konfigurert' :
                             service.status === 'inactive' ? 'Inaktiv' : 'Feil'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                        
                        <div className="grid grid-cols-2 cards-spacing-grid text-sm">
                          <div>
                            <span className="text-gray-500">Månedlig bruk:</span>
                            <p className="font-medium">{service.monthlyUsage} / {service.monthlyLimit}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Kostnad per forespørsel:</span>
                            <p className="font-medium">kr {service.costPerRequest}</p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Forbruk</span>
                            <span>{Math.round((service.monthlyUsage / service.monthlyLimit) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                (service.monthlyUsage / service.monthlyLimit) > 0.8 ? 'bg-red-500' :
                                (service.monthlyUsage / service.monthlyLimit) > 0.6 ? 'bg-orange-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${(service.monthlyUsage / service.monthlyLimit) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-6 ml-4">
                      <button onClick={() => console.log('Button clicked')} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                        <Cog6ToothIcon className="h-3 w-3 mr-1 inline" />
                        Konfigurer
                      </button>
                      <button onClick={() => console.log('Kjør test')} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                        <PlayIcon className="h-3 w-3 mr-1 inline" />
                        Test
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Test Interface */}
        <div className="cards-spacing-vertical">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PlayIcon className="h-5 w-5" />
                <span>Test AI Tjeneste</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="cards-spacing-vertical">
              <div className="space-y-6">
                <label className="text-sm font-medium text-gray-700">Test spørring</label>
                <textarea
                  rows={4}
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder="Skriv inn din test spørring..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                onClick={testAiService}
                disabled={isTestingApi || !testQuery.trim()}
                className="w-full px-2 py-1 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isTestingApi ? (
                  <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <SparklesIcon className="mr-2 h-4 w-4" />
                )}
                {isTestingApi ? 'Tester AI...' : 'Test AI tjeneste'}
              </button>
              
              <p className="text-xs text-gray-500">
                Tester {aiServices.find(s => s.id === selectedService)?.name || 'valgt tjeneste'}
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BoltIcon className="h-5 w-5" />
                <span>Hurtighandlinger</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <button onClick={() => console.log('Button clicked')} className="w-full flex items-center justify-start px-2 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <DocumentTextIcon className="mr-2 h-4 w-4" />
                Generer rapport sammendrag
              </button>
              <button onClick={() => console.log('Button clicked')} className="w-full flex items-center justify-start px-2 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <ChatBubbleLeftRightIcon className="mr-2 h-4 w-4" />
                Forbedre quiz spørsmål
              </button>
              <button onClick={() => console.log('Button clicked')} className="w-full flex items-center justify-start px-2 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <ChartBarIcon className="mr-2 h-4 w-4" />
                Analyser trender
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Automations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BoltIcon className="h-5 w-5" />
            <span>AI Automatisering</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="cards-spacing-vertical">
            {aiAutomations.map((automation) => (
              <div key={automation.id} className="px-2 py-1 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">{automation.name}</h3>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        automation.trigger === 'manual' ? 'text-blue-600 bg-blue-50' :
                        automation.trigger === 'scheduled' ? 'text-green-600 bg-green-50' :
                        'text-orange-600 bg-orange-50'
                      }`}>
                        {automation.trigger === 'manual' ? 'Manuell' :
                         automation.trigger === 'scheduled' ? 'Planlagt' : 'Hendelse'}
                      </span>
                      {automation.enabled ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{automation.description}</p>
                    
                    <div className="grid grid-cols-3 cards-spacing-grid text-sm">
                      <div>
                        <span className="text-gray-500">Siste kjøring:</span>
                        <p className="font-medium">{automation.lastRun}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Suksessrate:</span>
                        <p className="font-medium text-green-600">{automation.successRate}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Kjøringer denne måned:</span>
                        <p className="font-medium">{automation.runsThisMonth}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => toggleAutomation(automation.id)}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        automation.enabled
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {automation.enabled ? (
                        <StopIcon className="h-3 w-3 mr-1 inline" />
                      ) : (
                        <PlayIcon className="h-3 w-3 mr-1 inline" />
                      )}
                      {automation.enabled ? 'Stopp' : 'Start'}
                    </button>
                    
                    <button onClick={() => console.log('Button clicked')} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                      <Cog6ToothIcon className="h-3 w-3 mr-1 inline" />
                      Innstillinger
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button onClick={() => console.log('Opprett ny')} className="w-full px-2 py-1 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
              + Opprett ny automatisering
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Warning */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="px-2 py-1">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-800">AI Kostnadsadvarsel</h4>
              <p className="text-sm text-orange-700 mt-1">
                Du nærmer deg 80% av månedlig budsjett for ChatGPT API (kr 200). 
                Vurder å øke budsjettet eller optimalisere bruk.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiTjenester; 