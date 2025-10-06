import React, { useEffect, useState } from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  CogIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  TruckIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import api from '../../lib/api';

interface BedriftDashboardStats {
  totalAnsatte: number;
  totalElever: number;
  aktiveSikkerhetskontroller: number;
  fullforteKontroller: number;
  ventendeSoknader: number;
  aktiverKontrakter: number;
  totalInntekter: number;
  aktivKjoretoy: number;
  planlagteTimer: number;
  fullforteTimer: number;
  ventendeTasks: number;
  systemNotifikasjoner: number;
}

interface RecentActivity {
  id: string;
  type: 'elev' | 'sikkerhetskontroll' | 'kontrakt' | 'kalender' | 'system';
  beskrivelse: string;
  tidspunkt: string;
  status: 'success' | 'warning' | 'error';
}

interface UpcomingEvent {
  id: string;
  tittel: string;
  dato: string;
  type: 'undervisning' | 'eksamen' | 'møte';
  instruktor?: string;
  elev?: string;
}

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ComponentType<any>;
  trend?: number;
  color?: string;
  onClick?: () => void;
}> = ({ title, value, icon: Icon, trend, color = 'blue', onClick }) => {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-100',
      green: 'bg-green-500 text-green-100',
      yellow: 'bg-yellow-500 text-yellow-100',
      red: 'bg-red-500 text-red-100',
      purple: 'bg-purple-500 text-purple-100',
      orange: 'bg-orange-500 text-orange-100'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-md ${getColorClasses(color)}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-center">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {trend !== undefined && (
              <div className={`ml-2 flex items-center text-sm ${
                trend >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <ArrowTrendingUpIcon className={`h-4 w-4 ${trend < 0 ? 'rotate-180' : ''}`} />
                <span className="ml-1">{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityItem: React.FC<{ activity: RecentActivity }> = ({ activity }) => {
  const getStatusColor = (status: string) => {
    const colors = {
      success: 'text-green-600 bg-green-100',
      warning: 'text-yellow-600 bg-yellow-100',
      error: 'text-red-600 bg-red-100'
    };
    return colors[status as keyof typeof colors] || colors.success;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      elev: AcademicCapIcon,
      sikkerhetskontroll: CheckCircleIcon,
      kontrakt: DocumentTextIcon,
      kalender: CalendarDaysIcon,
      system: CogIcon
    };
    return icons[type as keyof typeof icons] || CogIcon;
  };

  const Icon = getTypeIcon(activity.type);

  return (
    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
      <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {activity.beskrivelse}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(activity.tidspunkt).toLocaleString('nb-NO')}
        </p>
      </div>
    </div>
  );
};

const UpcomingEventItem: React.FC<{ event: UpcomingEvent }> = ({ event }) => {
  const getTypeColor = (type: string) => {
    const colors = {
      undervisning: 'text-blue-600 bg-blue-100',
      eksamen: 'text-red-600 bg-red-100',
      møte: 'text-green-600 bg-green-100'
    };
    return colors[type as keyof typeof colors] || colors.undervisning;
  };

  return (
    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
      <div className={`p-2 rounded-full ${getTypeColor(event.type)}`}>
        <CalendarDaysIcon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {event.tittel}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(event.dato).toLocaleString('nb-NO')}
        </p>
        {event.instruktor && (
          <p className="text-xs text-gray-400">Instruktør: {event.instruktor}</p>
        )}
        {event.elev && (
          <p className="text-xs text-gray-400">Elev: {event.elev}</p>
        )}
      </div>
    </div>
  );
};

export default function BedriftDashboard() {
  const [stats, setStats] = useState<BedriftDashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Hent bedrift dashboard statistikk
        const statsResponse = await api.get('/bedrift/dashboard/stats');
        setStats(statsResponse.data);

        // Hent siste aktivitet
        const activitiesResponse = await api.get('/bedrift/dashboard/activities');
        setActivities(activitiesResponse.data);

        // Hent kommende hendelser
        const eventsResponse = await api.get('/bedrift/dashboard/upcoming-events');
        setUpcomingEvents(eventsResponse.data);

      } catch (err) {
        console.error('Feil ved henting av bedrift dashboard data:', err);
        setError('Kunne ikke laste dashboard data');
        
        // Fallback til mock data
        setStats({
          totalAnsatte: 8,
          totalElever: 45,
          aktiveSikkerhetskontroller: 12,
          fullforteKontroller: 89,
          ventendeSoknader: 3,
          aktiverKontrakter: 23,
          totalInntekter: 156800,
          aktivKjoretoy: 6,
          planlagteTimer: 120,
          fullforteTimer: 89,
          ventendeTasks: 5,
          systemNotifikasjoner: 2
        });

        setActivities([
          {
            id: '1',
            type: 'elev',
            beskrivelse: 'Ny elev registrert: Anne Hansen',
            tidspunkt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            status: 'success'
          },
          {
            id: '2',
            type: 'sikkerhetskontroll',
            beskrivelse: 'Sikkerhetskontroll fullført av Ola Nordmann',
            tidspunkt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
            status: 'success'
          },
          {
            id: '3',
            type: 'kontrakt',
            beskrivelse: 'Ny kontrakt signert med Kari Larsen',
            tidspunkt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            status: 'success'
          },
          {
            id: '4',
            type: 'kalender',
            beskrivelse: 'Undervisning kl. 14:00 avlyst',
            tidspunkt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
            status: 'warning'
          }
        ]);

        setUpcomingEvents([
          {
            id: '1',
            tittel: 'Kjøretime - Klasse B',
            dato: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
            type: 'undervisning',
            instruktor: 'Lars Olsen',
            elev: 'Maria Johansen'
          },
          {
            id: '2',
            tittel: 'Teorieksamen - Klasse B',
            dato: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
            type: 'eksamen',
            instruktor: 'Kari Andersen'
          },
          {
            id: '3',
            tittel: 'Månedlig instruktørmøte',
            dato: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
            type: 'møte'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Bedrift Dashboard</h1>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bedrift Dashboard</h1>
        <p className="text-gray-600">Oversikt over din bedrifts aktivitet og nøkkeltall</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
              <p className="text-xs text-yellow-600 mt-1">Viser demo-data</p>
            </div>
          </div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Ansatte"
            value={stats.totalAnsatte}
            icon={UserGroupIcon}
            color="blue"
            onClick={() => window.location.href = '/ansatte'}
          />
          <StatCard
            title="Elever"
            value={stats.totalElever}
            icon={AcademicCapIcon}
            trend={8}
            color="green"
            onClick={() => window.location.href = '/elever'}
          />
          <StatCard
            title="Aktive Sikkerhetskontroller"
            value={stats.aktiveSikkerhetskontroller}
            icon={CheckCircleIcon}
            color="purple"
            onClick={() => window.location.href = '/sikkerhetskontroll'}
          />
          <StatCard
            title="Fullførte Kontroller"
            value={stats.fullforteKontroller}
            icon={CheckCircleIcon}
            trend={12}
            color="green"
          />
          <StatCard
            title="Ventende Søknader"
            value={stats.ventendeSoknader}
            icon={ClockIcon}
            color="yellow"
            onClick={() => window.location.href = '/elever/soknader'}
          />
          <StatCard
            title="Aktive Kontrakter"
            value={stats.aktiverKontrakter}
            icon={DocumentTextIcon}
            color="blue"
            onClick={() => window.location.href = '/kontrakter'}
          />
          <StatCard
            title="Inntekter (denne måned)"
            value={`${(stats.totalInntekter / 1000).toFixed(0)}k`}
            icon={CurrencyDollarIcon}
            trend={5}
            color="green"
            onClick={() => window.location.href = '/okonomi'}
          />
          <StatCard
            title="Kjøretøy"
            value={stats.aktivKjoretoy}
            icon={TruckIcon}
            color="orange"
            onClick={() => window.location.href = '/kjoretoy'}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Siste Aktivitet</h2>
            </div>
            <div className="p-6">
              {activities.length > 0 ? (
                <div className="space-y-1">
                  {activities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Ingen nylig aktivitet</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Kommende Hendelser</h2>
          </div>
          <div className="p-6">
            {upcomingEvents.length > 0 ? (
              <div className="space-y-1">
                {upcomingEvents.map((event) => (
                  <UpcomingEventItem key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Ingen kommende hendelser</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Hurtighandlinger</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => window.location.href = '/elever/ny'}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <AcademicCapIcon className="h-8 w-8 text-blue-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">Ny Elev</span>
              </button>
              <button 
                onClick={() => window.location.href = '/ansatte/ny'}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <UserGroupIcon className="h-8 w-8 text-green-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">Ny Ansatt</span>
              </button>
              <button 
                onClick={() => window.location.href = '/sikkerhetskontroll/ny'}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CheckCircleIcon className="h-8 w-8 text-purple-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">Ny Kontroll</span>
              </button>
              <button 
                onClick={() => window.location.href = '/kalender/ny'}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CalendarDaysIcon className="h-8 w-8 text-orange-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">Ny Hendelse</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Ytelsesstatistikk</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Timer planlagt</span>
                <span className="text-sm text-gray-500">{stats?.planlagteTimer || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Timer fullført</span>
                <span className="text-sm text-gray-500">{stats?.fullforteTimer || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Ventende oppgaver</span>
                <span className="text-sm text-gray-500">{stats?.ventendeTasks || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Notifikasjoner</span>
                <span className="text-sm text-gray-500 flex items-center">
                  <BellIcon className="h-4 w-4 mr-1" />
                  {stats?.systemNotifikasjoner || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}