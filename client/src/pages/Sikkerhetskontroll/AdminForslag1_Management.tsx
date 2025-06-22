import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClipboardDocumentCheckIcon,
  AcademicCapIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
  TagIcon,
  FolderIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UsersIcon,
  BuildingOfficeIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid';

interface AdminStats {
  totalSporsmal: number;
  aktiveBibliotek: number;
  totaleKontroller: number;
  ventendeTilgang: number;
  aktiveBrukere: number;
  systemStatus: 'online' | 'maintenance' | 'error';
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  path: string;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'question' | 'library' | 'system';
  message: string;
  timestamp: string;
  user?: string;
}

const AdminForslag1Management: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [activeTab, setActiveTab] = useState<'oversikt' | 'sporsmal' | 'bibliotek' | 'brukere' | 'system'>('oversikt');

  useEffect(() => {
    // Mock data
    setStats({
      totalSporsmal: 247,
      aktiveBibliotek: 12,
      totaleKontroller: 1834,
      ventendeTilgang: 5,
      aktiveBrukere: 89,
      systemStatus: 'online'
    });

    setQuickActions([
      {
        id: '1',
        title: 'Nytt Spørsmål',
        description: 'Opprett et nytt spørsmål for tester',
        icon: QuestionMarkCircleIcon,
        color: 'blue',
        path: '/sikkerhetskontroll/sporsmal/opprett'
      },
      {
        id: '2',
        title: 'Nytt Bibliotek',
        description: 'Opprett et nytt spørsmålsbibliotek',
        icon: BookOpenIcon,
        color: 'green',
        path: '/sikkerhetskontroll/bibliotek/opprett'
      },
      {
        id: '3',
        title: 'Administrer Brukere',
        description: 'Håndter bruker-tilganger og roller',
        icon: UserGroupIcon,
        color: 'purple',
        path: '/sikkerhetskontroll/brukere'
      },
      {
        id: '4',
        title: 'System Innstillinger',
        description: 'Konfigurer systeminnstillinger',
        icon: Cog6ToothIcon,
        color: 'gray',
        path: '/sikkerhetskontroll/innstillinger'
      },
      {
        id: '5',
        title: 'Importer Data',
        description: 'Importer spørsmål fra Excel/CSV',
        icon: ArrowUpTrayIcon,
        color: 'orange',
        path: '/sikkerhetskontroll/import'
      },
      {
        id: '6',
        title: 'Eksporter Rapporter',
        description: 'Generer og eksporter rapporter',
        icon: ArrowDownTrayIcon,
        color: 'indigo',
        path: '/sikkerhetskontroll/eksport'
      }
    ]);

    setRecentActivity([
      {
        id: '1',
        type: 'user',
        message: 'Ny bruker registrert: Emma Andersen',
        timestamp: '2 minutter siden',
        user: 'System'
      },
      {
        id: '2',
        type: 'question',
        message: 'Spørsmål "Dekkmønster kontroll" ble oppdatert',
        timestamp: '15 minutter siden',
        user: 'Lars Hansen'
      },
      {
        id: '3',
        type: 'library',
        message: 'Nytt bibliotek "Belysning" ble opprettet',
        timestamp: '1 time siden',
        user: 'Maria Olsen'
      },
      {
        id: '4',
        type: 'system',
        message: 'Systembackup fullført',
        timestamp: '2 timer siden',
        user: 'System'
      },
      {
        id: '5',
        type: 'user',
        message: '5 nye tilgangsforespørsler venter på godkjenning',
        timestamp: '3 timer siden',
        user: 'System'
      }
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'maintenance': return 'Vedlikehold';
      case 'error': return 'Feil';
      default: return 'Ukjent';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return UsersIcon;
      case 'question': return QuestionMarkCircleIcon;
      case 'library': return BookOpenIcon;
      case 'system': return Cog6ToothIcon;
      default: return ClockIcon;
    }
  };

  const getActionColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 hover:bg-blue-600',
      green: 'bg-green-500 hover:bg-green-600',
      purple: 'bg-purple-500 hover:bg-purple-600',
      gray: 'bg-gray-500 hover:bg-gray-600',
      orange: 'bg-orange-500 hover:bg-orange-600',
      indigo: 'bg-indigo-500 hover:bg-indigo-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const renderOversikt = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Totale Spørsmål</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalSporsmal}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <QuestionMarkCircleIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <PlusIcon className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+12 denne uken</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktive Biblioteker</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.aktiveBibliotek}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <BookOpenIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">Alle aktive</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktive Brukere</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.aktiveBrukere}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ExclamationTriangleIcon className="w-4 h-4 text-orange-500 mr-1" />
            <span className="text-sm text-orange-600">{stats?.ventendeTilgang} venter godkjenning</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Status</p>
              <p className="text-xl font-bold text-gray-900">{getStatusText(stats?.systemStatus || 'online')}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Cog6ToothIcon className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stats?.systemStatus || 'online')}`}>
              {getStatusText(stats?.systemStatus || 'online')}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hurtighandlinger</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Link
                key={action.id}
                to={action.path}
                className={`flex items-center p-4 rounded-lg text-white transition-colors ${getActionColor(action.color)}`}
              >
                <IconComponent className="w-6 h-6 mr-3" />
                <div>
                  <h4 className="font-medium">{action.title}</h4>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Siste Aktivitet</h3>
        <div className="space-y-4">
          {recentActivity.map((activity) => {
            const IconComponent = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-white rounded-lg mr-3">
                  <IconComponent className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <span>{activity.timestamp}</span>
                    {activity.user && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{activity.user}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laster administrativt dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/sikkerhetskontroll"
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Tilbake til forslag
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Management Dashboard</h1>
                <p className="text-gray-600 mt-1">Sentralisert administrasjon og overstyring</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(stats.systemStatus)}`}>
                {getStatusText(stats.systemStatus)}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'oversikt', label: 'Oversikt', icon: ChartBarIcon },
              { key: 'sporsmal', label: 'Spørsmål', icon: QuestionMarkCircleIcon },
              { key: 'bibliotek', label: 'Biblioteker', icon: BookOpenIcon },
              { key: 'brukere', label: 'Brukere', icon: UserGroupIcon },
              { key: 'system', label: 'System', icon: Cog6ToothIcon }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className={`mr-2 w-5 h-5 ${
                  activeTab === key ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'oversikt' && renderOversikt()}
          {activeTab === 'sporsmal' && (
            <div className="text-center py-12">
              <QuestionMarkCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Spørsmål Administrasjon</h3>
              <p className="text-gray-600 mb-4">Administrer alle spørsmål og tester</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Opprett Nytt Spørsmål
              </button>
            </div>
          )}
          {activeTab === 'bibliotek' && (
            <div className="text-center py-12">
              <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Bibliotek Administrasjon</h3>
              <p className="text-gray-600 mb-4">Organiser spørsmål i biblioteker</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Opprett Nytt Bibliotek
              </button>
            </div>
          )}
          {activeTab === 'brukere' && (
            <div className="text-center py-12">
              <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Bruker Administrasjon</h3>
              <p className="text-gray-600 mb-4">Håndter brukere, roller og tilganger</p>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                Administrer Brukere
              </button>
            </div>
          )}
          {activeTab === 'system' && (
            <div className="text-center py-12">
              <Cog6ToothIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">System Administrasjon</h3>
              <p className="text-gray-600 mb-4">Konfigurer systeminnstillinger og vedlikehold</p>
              <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                Åpne Innstillinger
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminForslag1Management; 