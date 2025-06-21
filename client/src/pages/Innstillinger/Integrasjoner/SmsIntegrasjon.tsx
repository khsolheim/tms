import React, { useState, useEffect } from 'react';
import { smsIntegrasjonsService, type SmsProvider, type SmsStatistikk } from '../../../services/sms-integrasjon.service';
import { type SmsTemplate } from '../../../services/integrasjoner.service';
import { Card, CardContent, CardHeader, CardTitle } from "../../../design-system";
import { 
  DevicePhoneMobileIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BellIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowPathIcon,
  PlayIcon,
  StopIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';



const SmsIntegrasjon: React.FC = () => {
  const [activeProvider, setActiveProvider] = useState<string>('twilio');
  const [testNumber, setTestNumber] = useState('');
  const [testMessage, setTestMessage] = useState('Test melding fra TMS system');
  const [isSending, setIsSending] = useState(false);
  const [smsProviders, setSmsProviders] = useState<SmsProvider[]>([]);
  const [smsTemplatesState, setSmsTemplatesState] = useState<any[]>([]);
  const [monthlyStatsState, setMonthlyStatsState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    lastData();
  }, []);

  const lastData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Bruker fallback data for utvikling siden service ikke er implementert enda
      setSmsProviders(fallbackProviders);
      setMonthlyStatsState(monthlyStats);
    } catch (err) {
      setError('Kunne ikke laste SMS-data');
      console.error('Feil ved lasting av data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fallback data for utvikling
  const fallbackProviders: SmsProvider[] = [
    {
      id: 'twilio',
      navn: 'Twilio',
      type: 'twilio',
      status: 'aktiv',
      konfigurert: true,
      kostnadPerSms: 0.85,
      månedligGrense: 1000,
      brukteDenneMåned: 342,
      suksessrate: 98.5,
      beskrivelse: 'Global SMS-tjeneste med høy leveringsrate'
    },
    {
      id: 'telenor',
      navn: 'Telenor SMS API',
      type: 'telenor',
      status: 'inaktiv',
      konfigurert: false,
      kostnadPerSms: 0.75,
      månedligGrense: 2000,
      brukteDenneMåned: 0,
      suksessrate: 99.2,
      beskrivelse: 'Norsk SMS-tjeneste med god dekning'
    },
    {
      id: 'telia',
      navn: 'Telia SMS Gateway',
      type: 'telia',
      status: 'feil',
      konfigurert: true,
      kostnadPerSms: 0.80,
      månedligGrense: 1500,
      brukteDenneMåned: 156,
      suksessrate: 97.8,
      beskrivelse: 'Nordisk SMS-leverandør'
    }
  ];

  const smsTemplates: SmsTemplate[] = [
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
    averageDeliveryTime: 2.3, // seconds
    totalCost: 290.70
  };

  const handleProviderChange = (providerId: string) => {
    setActiveProvider(providerId);
  };

  const sendTestSms = async () => {
    if (!testNumber || !testMessage) {
      alert('Vennligst fyll ut telefonnummer og melding');
      return;
    }

    setIsSending(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Test SMS sendt!');
      setTestNumber('');
      setTestMessage('Test melding fra TMS system');
    } catch (error) {
      alert('Feil ved sending av SMS. Sjekk konfigurasjonen.');
    } finally {
      setIsSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'inactive': return <ClockIcon className="h-4 w-4 text-gray-500" />;
      case 'error': return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default: return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'emergency': return 'text-red-600 bg-red-50';
      case 'alert': return 'text-orange-600 bg-orange-50';
      case 'reminder': return 'text-blue-600 bg-blue-50';
      case 'notification': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="px-2 py-1 cards-spacing-vertical">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">SMS Integrasjon</h1>
        <p className="text-gray-600 mt-2">
          Konfigurer SMS-tjenester og meldingsmaler
        </p>
      </div>

      {/* Monthly Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 cards-spacing-grid">
        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Sendt denne måned</p>
              <p className="text-2xl font-bold">{monthlyStats.totalSent}</p>
            </div>
            <PaperAirplaneIcon className="h-8 w-8 text-blue-500" />
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
              <p className="text-sm text-gray-500">Feilede meldinger</p>
              <p className="text-2xl font-bold text-red-600">{monthlyStats.failedMessages}</p>
            </div>
            <XCircleIcon className="h-8 w-8 text-red-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Levering (sek)</p>
              <p className="text-2xl font-bold">{monthlyStats.averageDeliveryTime}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total kostnad</p>
              <p className="text-2xl font-bold">kr {monthlyStats.totalCost}</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
        {/* SMS Providers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DevicePhoneMobileIcon className="h-5 w-5" />
              <span>SMS Leverandører</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="cards-spacing-vertical">
            {smsProviders.map((provider) => (
              <div
                key={provider.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                  activeProvider === provider.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => handleProviderChange(provider.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{provider.navn}</h3>
                    {getStatusIcon(provider.status)}
                  </div>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(provider.status)}`}>
                    {provider.status === 'aktiv' ? 'Aktiv' : 
                     provider.status === 'inaktiv' ? 'Inaktiv' : 'Feil'}
                  </span>
                </div>

                <div className="grid grid-cols-2 cards-spacing-grid text-sm">
                  <div>
                    <span className="text-gray-500">Suksessrate:</span>
                    <p className="font-medium">{provider.suksessrate}%</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Kostnad per SMS:</span>
                    <p className="font-medium">kr {provider.kostnadPerSms}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Månedlig forbruk</span>
                    <span>{provider.brukteDenneMåned} / {provider.månedligGrense}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(provider.brukteDenneMåned / provider.månedligGrense) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Configuration & Test */}
        <div className="cards-spacing-vertical">
          {/* Provider Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cog6ToothIcon className="h-5 w-5" />
                <span>Konfigurering</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="cards-spacing-vertical">
              <div className="space-y-6">
                <label className="text-sm font-medium text-gray-700">API Nøkkel</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-6">
                <label className="text-sm font-medium text-gray-700">Account SID</label>
                <input
                  type="text"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-6">
                <label className="text-sm font-medium text-gray-700">Fra telefonnummer</label>
                <input
                  type="tel"
                  placeholder="+47xxxxxxxx"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button onClick={() => window.location.reload()} className="w-full px-2 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                <ArrowPathIcon className="mr-2 h-4 w-4" />
                Oppdater konfigurering
              </button>
            </CardContent>
          </Card>

          {/* Test SMS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PlayIcon className="h-5 w-5" />
                <span>Test SMS</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="cards-spacing-vertical">
              <div className="space-y-6">
                <label className="text-sm font-medium text-gray-700">Telefonnummer</label>
                <input
                  type="tel"
                  placeholder="+47xxxxxxxx"
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-6">
                <label className="text-sm font-medium text-gray-700">Melding</label>
                <textarea
                  rows={3}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  maxLength={160}
                />
                <p className="text-xs text-gray-500">{testMessage.length}/160 tegn</p>
              </div>

              <button
                onClick={sendTestSms}
                disabled={isSending}
                className="w-full px-2 py-1 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSending ? (
                  <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PaperAirplaneIcon className="mr-2 h-4 w-4" />
                )}
                {isSending ? 'Sender...' : 'Send test SMS'}
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SMS Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BellIcon className="h-5 w-5" />
            <span>SMS Maler</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="cards-spacing-vertical">
            {smsTemplates.map((template) => (
              <div key={template.id} className="px-2 py-1 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryColor(template.category)}`}>
                        {template.category === 'reminder' ? 'Påminnelse' :
                         template.category === 'alert' ? 'Alarm' :
                         template.category === 'notification' ? 'Notifikasjon' : 'Nødmelding'}
                      </span>
                      {template.active ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{template.message}</p>
                    {template.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-gray-500">Variabler:</span>
                        {template.variables.map((variable) => (
                          <span key={variable} className="inline-block px-2 py-1 text-xs bg-gray-100 rounded">
                            {variable}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button onClick={() => console.log('Rediger')} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                      Rediger
                    </button>
                    <button onClick={() => console.log('Button clicked')} className={`px-3 py-1 text-xs rounded transition-colors ${
                      template.active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}>
                      {template.active ? 'Deaktiver' : 'Aktiver'}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button onClick={() => console.log('Button clicked')} className="w-full px-2 py-1 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
              + Legg til ny SMS mal
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmsIntegrasjon; 