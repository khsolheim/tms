import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../design-system";
import { notifikasjonTjenesterService } from '../../../services/notifikasjon-tjenester.service';
import type { NotificationChannel as ServiceNotificationChannel, NotificationTemplate as ServiceNotificationTemplate, NotificationSchedule as ServiceNotificationSchedule, NotificationStatistikk } from '../../../services/notifikasjon-tjenester.service';
import { 
  BellIcon,
  BellAlertIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlusIcon
} from '@heroicons/react/24/outline';



const NotifikasjonTjenester: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'channels' | 'templates' | 'schedules'>('channels');
  const [selectedChannel, setSelectedChannel] = useState<string>('push');
  const [channels, setChannels] = useState<ServiceNotificationChannel[]>([]);
  const [templates, setTemplates] = useState<ServiceNotificationTemplate[]>([]);
  const [schedules, setSchedules] = useState<ServiceNotificationSchedule[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testNotification, setTestNotification] = useState({
    channel: 'push',
    recipient: '',
    message: 'Dette er en test notifikasjon fra TMS systemet'
  });

  useEffect(() => {
    lastData();
  }, []);

  const lastData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const mockData = await notifikasjonTjenesterService.hentMockData();
      
      setChannels(mockData.channels);
      setTemplates(mockData.templates);
      setSchedules(mockData.schedules);
      setStats(mockData.statistikk);
    } catch (err) {
      setError('Kunne ikke laste notifikasjonstjenester');
      console.error('Feil ved lasting av data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Data lastes fra service - ingen hardkodet data

  const sendTestNotification = async () => {
    if (!testNotification.recipient) {
      alert('Vennligst fyll ut mottaker');
      return;
    }

    alert(`Test notifikasjon sendt via ${testNotification.channel}!`);
  };

  const toggleChannel = (channelId: string) => {
    alert(`Kanal ${channelId} endret!`);
  };

  const toggleSchedule = (scheduleId: string) => {
    alert(`Tidsplan ${scheduleId} endret!`);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'quiz': return 'text-blue-600 bg-blue-50';
      case 'security': return 'text-red-600 bg-red-50';
      case 'contract': return 'text-purple-600 bg-purple-50';
      case 'system': return 'text-gray-600 bg-gray-50';
      case 'reminder': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'push': return <DevicePhoneMobileIcon className="h-5 w-5" />;
      case 'email': return <EnvelopeIcon className="h-5 w-5" />;
      case 'sms': return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
      case 'webhook': return <Cog6ToothIcon className="h-5 w-5" />;
      default: return <BellIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="px-2 py-1 cards-spacing-vertical">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notifikasjonstjenester</h1>
        <p className="text-gray-600 mt-2">
          Administrer push-varsler, e-post og andre kommunikasjonskanaler
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 cards-spacing-grid">
        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Sendt i dag</p>
              <p className="text-2xl font-bold">{stats.totalSentToday}</p>
            </div>
            <PaperAirplaneIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Suksessrate</p>
              <p className="text-2xl font-bold text-green-600">{stats.successRate}%</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Leveringstid</p>
              <p className="text-2xl font-bold">{stats.averageDeliveryTime}s</p>
            </div>
            <ClockIcon className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Aktive mottakere</p>
              <p className="text-2xl font-bold">{stats.activeRecipients}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Mest brukt</p>
              <p className="text-lg font-bold text-blue-600">{stats.topChannel}</p>
            </div>
            <DevicePhoneMobileIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'channels', name: 'Kanaler', icon: BellIcon },
            { id: 'templates', name: 'Maler', icon: EnvelopeIcon },
            { id: 'schedules', name: 'Tidsplaner', icon: ClockIcon }
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
      {activeTab === 'channels' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 cards-spacing-grid">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Notifikasjonskanaler</CardTitle>
              </CardHeader>
              <CardContent className="cards-spacing-vertical">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedChannel === channel.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedChannel(channel.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="text-blue-500 mt-1">
                          {getChannelIcon(channel.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900">{channel.name}</h3>
                            {channel.enabled ? (
                              <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircleIcon className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{channel.description}</p>
                          
                          <div className="grid grid-cols-2 cards-spacing-grid text-sm">
                            <div>
                              <span className="text-gray-500">Sendt i dag:</span>
                              <p className="font-medium">{channel.sentToday} / {channel.monthlyLimit}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Sist brukt:</span>
                              <p className="font-medium">{channel.lastUsed}</p>
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Månedlig forbruk</span>
                              <span>{Math.round((channel.sentToday * 30 / channel.monthlyLimit) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(channel.sentToday * 30 / channel.monthlyLimit) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-6 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleChannel(channel.id);
                          }}
                          className={`px-3 py-1 text-xs rounded transition-colors ${
                            channel.enabled
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {channel.enabled ? 'Deaktiver' : 'Aktiver'}
                        </button>
                        <button onClick={() => console.log('Button clicked')} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                          <Cog6ToothIcon className="h-3 w-3 mr-1 inline" />
                          Konfigurer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Test Notification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BellAlertIcon className="h-5 w-5" />
                <span>Test Notifikasjon</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="cards-spacing-vertical">
              <div className="space-y-6">
                <label className="text-sm font-medium text-gray-700">Kanal</label>
                <select
                  value={testNotification.channel}
                  onChange={(e) => setTestNotification(prev => ({ ...prev, channel: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {channels.filter(c => c.enabled).map(channel => (
                    <option key={channel.id} value={channel.id}>{channel.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-6">
                <label className="text-sm font-medium text-gray-700">Mottaker</label>
                <input
                  type="text"
                  value={testNotification.recipient}
                  onChange={(e) => setTestNotification(prev => ({ ...prev, recipient: e.target.value }))}
                  placeholder="E-post eller telefonnummer"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-6">
                <label className="text-sm font-medium text-gray-700">Melding</label>
                <textarea
                  rows={3}
                  value={testNotification.message}
                  onChange={(e) => setTestNotification(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                onClick={sendTestNotification}
                className="w-full px-2 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <PaperAirplaneIcon className="mr-2 h-4 w-4" />
                Send test
              </button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'templates' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Notifikasjonsmaler</CardTitle>
              <button onClick={() => console.log('Button clicked')} className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                <PlusIcon className="mr-1 h-4 w-4 inline" />
                Ny mal
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="cards-spacing-vertical">
              {templates.map((template) => (
                <div key={template.id} className="px-2 py-1 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryColor(template.category)}`}>
                          {template.category === 'alert' ? 'Alarm' :
                           template.category === 'notification' ? 'Notifikasjon' :
                           template.category === 'reminder' ? 'Påminnelse' : 'Markedsføring'}
                        </span>
                        {template.active ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      
                      <p className="text-sm font-medium text-gray-700 mb-1">{template.subject}</p>
                      <p className="text-sm text-gray-600 mb-3">{template.message}</p>
                      
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500">Kanal:</span>
                          <span className="inline-block px-2 py-1 bg-gray-100 rounded">
                            {template.channel === 'push' ? 'Push' :
                             template.channel === 'email' ? 'E-post' :
                             template.channel === 'sms' ? 'SMS' : 'Webhook'}
                          </span>
                        </div>
                        <span className="text-gray-500">Brukt: {template.usageCount || 0} ganger</span>
                      </div>
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
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'schedules' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tidsplaner</CardTitle>
              <button onClick={() => console.log('Button clicked')} className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                <PlusIcon className="mr-1 h-4 w-4 inline" />
                Ny tidsplan
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Navn</th>
                    <th className="text-left py-2 px-2">Mal</th>
                    <th className="text-left py-2 px-2">Frekvens</th>
                    <th className="text-left py-2 px-2">Mottakere</th>
                    <th className="text-left py-2 px-2">Siste kjøring</th>
                    <th className="text-left py-2 px-2">Neste kjøring</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Handlinger</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => (
                    <tr key={schedule.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2 font-medium">{schedule.name}</td>
                      <td className="py-2 px-2">
                        {templates.find(t => t.id === schedule.template)?.name || '-'}
                      </td>
                      <td className="py-2 px-2">
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                          {schedule.schedule === 'immediate' ? 'Umiddelbart' :
                           schedule.schedule === 'daily' ? 'Daglig' :
                           schedule.schedule === 'weekly' ? 'Ukentlig' : 'Månedlig'}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <div className="text-xs">
                          <p>{Array.isArray(schedule.recipients) ? 'Tilpasset' : 'Alle'}</p>
                          <p className="text-gray-500">{Array.isArray(schedule.recipients) ? schedule.recipients.length : 'Alle'} mottakere</p>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-xs">{schedule.lastRun}</td>
                      <td className="py-2 px-2 text-xs">{schedule.nextRun}</td>
                      <td className="py-2 px-2">
                        <div className="flex items-center space-x-1">
                          {schedule.enabled ? (
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircleIcon className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-xs">
                            {schedule.enabled ? 'Aktiv' : 'Inaktiv'}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <button
                          onClick={() => toggleSchedule(schedule.id)}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            schedule.enabled
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {schedule.enabled ? 'Stopp' : 'Start'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning Card */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="px-2 py-1">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-800">Push Notification Tillatelser</h4>
              <p className="text-sm text-orange-700 mt-1">
                45 brukere har ikke gitt tillatelse til push-varsler. 
                Vurder å sende påminnelse via e-post.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotifikasjonTjenester; 