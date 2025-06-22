import React, { useEffect, useState } from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import api from '../../lib/api';

interface DashboardStats {
  totalBedrifter: number;
  totalAnsatte: number;
  totalElever: number;
  aktiveSikkerhetskontroller: number;
  fullforteKurs: number;
  ventendeSikkerhetskontroller: number;
  kritiskeVarsler: number;
  systemYtelse: number;
}

interface RecentActivity {
  id: string;
  type: 'sikkerhetskontroll' | 'kurs' | 'bruker' | 'system';
  beskrivelse: string;
  tidspunkt: string;
  status: 'success' | 'warning' | 'error';
}

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trend?: number;
  color?: string;
}> = ({ title, value, icon: Icon, trend, color = 'blue' }) => {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-100',
      green: 'bg-green-500 text-green-100',
      yellow: 'bg-yellow-500 text-yellow-100',
      red: 'bg-red-500 text-red-100',
      purple: 'bg-purple-500 text-purple-100'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
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
      sikkerhetskontroll: CheckCircleIcon,
      kurs: AcademicCapIcon,
      bruker: UserGroupIcon,
      system: ChartBarIcon
    };
    return icons[type as keyof typeof icons] || ChartBarIcon;
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

export default function Oversikt() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Hent dashboard statistikk
        const statsResponse = await api.get('/dashboard/stats');
        setStats(statsResponse.data);

        // Hent siste aktivitet
        const activitiesResponse = await api.get('/dashboard/activities');
        setActivities(activitiesResponse.data);

      } catch (err) {
        console.error('Feil ved henting av dashboard data:', err);
        setError('Kunne ikke laste dashboard data');
        
        // Fallback til mock data
        setStats({
          totalBedrifter: 12,
          totalAnsatte: 156,
          totalElever: 89,
          aktiveSikkerhetskontroller: 23,
          fullforteKurs: 45,
          ventendeSikkerhetskontroller: 8,
          kritiskeVarsler: 3,
          systemYtelse: 98
        });

        setActivities([
          {
            id: '1',
            type: 'sikkerhetskontroll',
            beskrivelse: 'Ny sikkerhetskontroll opprettet for Bedrift AS',
            tidspunkt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            status: 'success'
          },
          {
            id: '2',
            type: 'kurs',
            beskrivelse: 'Kurs "Sikkerhet på arbeidsplassen" fullført av 5 elever',
            tidspunkt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            status: 'success'
          },
          {
            id: '3',
            type: 'bruker',
            beskrivelse: 'Ny instruktør registrert: Ola Nordmann',
            tidspunkt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            status: 'success'
          },
          {
            id: '4',
            type: 'system',
            beskrivelse: 'System backup fullført',
            tidspunkt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            status: 'success'
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Oversikt</h1>
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Oversikt</h1>
        <p className="text-gray-600">Velkommen til TMS dashboard</p>
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
            title="Totalt Bedrifter"
            value={stats.totalBedrifter}
            icon={BuildingOfficeIcon}
            trend={8}
            color="blue"
          />
          <StatCard
            title="Totalt Ansatte"
            value={stats.totalAnsatte}
            icon={UserGroupIcon}
            trend={12}
            color="green"
          />
          <StatCard
            title="Totalt Elever"
            value={stats.totalElever}
            icon={AcademicCapIcon}
            trend={-3}
            color="purple"
          />
          <StatCard
            title="Aktive Sikkerhetskontroller"
            value={stats.aktiveSikkerhetskontroller}
            icon={CheckCircleIcon}
            trend={5}
            color="green"
          />
          <StatCard
            title="Fullførte Kurs"
            value={stats.fullforteKurs}
            icon={AcademicCapIcon}
            trend={15}
            color="blue"
          />
          <StatCard
            title="Ventende Kontroller"
            value={stats.ventendeSikkerhetskontroller}
            icon={ClockIcon}
            color="yellow"
          />
          <StatCard
            title="Kritiske Varsler"
            value={stats.kritiskeVarsler}
            icon={ExclamationTriangleIcon}
            color="red"
          />
          <StatCard
            title="System Ytelse"
            value={`${stats.systemYtelse}%`}
            icon={ChartBarIcon}
            trend={2}
            color="green"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Hurtighandlinger</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">Ny Bedrift</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <UserGroupIcon className="h-8 w-8 text-green-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">Ny Ansatt</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <CheckCircleIcon className="h-8 w-8 text-purple-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">Sikkerhetskontroll</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <AcademicCapIcon className="h-8 w-8 text-orange-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">Nytt Kurs</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 