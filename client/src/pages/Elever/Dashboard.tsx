import React, { useEffect, useState } from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  TrophyIcon,
  BookOpenIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  StarIcon,
  FireIcon,
  AcademicCapIcon,
  PlayIcon,
  PauseIcon,
  UserIcon,
  ArrowTrendingUpIcon,
  BellIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import api from '../../lib/api';

interface ElevDashboardStats {
  totalSikkerhetskontroller: number;
  fullforteSikkerhetskontroller: number;
  progresjonProsent: number;
  aktiveKurs: number;
  fullforteKurs: number;
  plannedeLektioner: number;
  fullforteLektioner: number;
  achievements: number;
  totalXP: number;
  streak: number;
  kontrakterAktive: number;
  sisteAktivitet: string;
}

interface Achievement {
  id: string;
  navn: string;
  beskrivelse: string;
  ikonUrl?: string;
  oppnaddDato: string;
  xpBelonning: number;
  sjelden: boolean;
}

interface UpcomingLesson {
  id: string;
  tittel: string;
  dato: string;
  instruktor: string;
  lokasjon?: string;
  type: 'kjøretime' | 'teoritime' | 'eksamen';
}

interface RecentActivity {
  id: string;
  type: 'sikkerhetskontroll' | 'kurs' | 'achievement' | 'lesson';
  beskrivelse: string;
  tidspunkt: string;
  status: 'success' | 'warning' | 'error';
  xpGain?: number;
}

interface SikkerhetskontrollProgress {
  kategori: string;
  totalSporsmal: number;
  besvartSporsmal: number;
  korrekteSvar: number;
  progresjonProsent: number;
  status: 'ikke_sett' | 'sett' | 'vanskelig' | 'mestret';
}

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ComponentType<any>;
  color?: string;
  trend?: number;
  onClick?: () => void;
}> = ({ title, value, icon: Icon, color = 'blue', trend, onClick }) => {
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

const ProgressBar: React.FC<{ progress: number; color?: string }> = ({ progress, color = 'blue' }) => {
  const getProgressColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full ${getProgressColor(color)}`}
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
};

const AchievementBadge: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  return (
    <div className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
      <div className="flex-shrink-0">
        <TrophyIcon className="h-8 w-8 text-yellow-600" />
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-yellow-800">{achievement.navn}</p>
        <p className="text-xs text-yellow-600">{achievement.beskrivelse}</p>
        <p className="text-xs text-yellow-500 mt-1">
          +{achievement.xpBelonning} XP • {new Date(achievement.oppnaddDato).toLocaleDateString('nb-NO')}
        </p>
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
      kurs: BookOpenIcon,
      achievement: TrophyIcon,
      lesson: AcademicCapIcon
    };
    return icons[type as keyof typeof icons] || CheckCircleIcon;
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
        {activity.xpGain && (
          <p className="text-xs text-green-600">+{activity.xpGain} XP</p>
        )}
      </div>
    </div>
  );
};

const UpcomingLessonItem: React.FC<{ lesson: UpcomingLesson }> = ({ lesson }) => {
  const getTypeColor = (type: string) => {
    const colors = {
      kjøretime: 'text-blue-600 bg-blue-100',
      teoritime: 'text-green-600 bg-green-100',
      eksamen: 'text-red-600 bg-red-100'
    };
    return colors[type as keyof typeof colors] || colors.kjøretime;
  };

  return (
    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
      <div className={`p-2 rounded-full ${getTypeColor(lesson.type)}`}>
        <CalendarDaysIcon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {lesson.tittel}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(lesson.dato).toLocaleString('nb-NO')}
        </p>
        <p className="text-xs text-gray-400">
          Instruktør: {lesson.instruktor}
        </p>
        {lesson.lokasjon && (
          <p className="text-xs text-gray-400">Lokasjon: {lesson.lokasjon}</p>
        )}
      </div>
    </div>
  );
};

const SikkerhetskontrollCard: React.FC<{ progress: SikkerhetskontrollProgress }> = ({ progress }) => {
  const getStatusColor = (status: string) => {
    const colors = {
      ikke_sett: 'gray',
      sett: 'blue',
      vanskelig: 'yellow',
      mestret: 'green'
    };
    return colors[status as keyof typeof colors] || 'gray';
  };

  const getStatusText = (status: string) => {
    const texts = {
      ikke_sett: 'Ikke sett',
      sett: 'Sett',
      vanskelig: 'Vanskelig',
      mestret: 'Mestret'
    };
    return texts[status as keyof typeof texts] || 'Ukjent';
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">{progress.kategori}</h3>
        <span className={`text-xs px-2 py-1 rounded-full bg-${getStatusColor(progress.status)}-100 text-${getStatusColor(progress.status)}-800`}>
          {getStatusText(progress.status)}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progresjon</span>
          <span className="font-medium">{progress.progresjonProsent}%</span>
        </div>
        <ProgressBar progress={progress.progresjonProsent} color={getStatusColor(progress.status)} />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{progress.besvartSporsmal} av {progress.totalSporsmal} spørsmål</span>
          <span>{progress.korrekteSvar} korrekte</span>
        </div>
      </div>
    </div>
  );
};

export default function ElevDashboard() {
  const [stats, setStats] = useState<ElevDashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [upcomingLessons, setUpcomingLessons] = useState<UpcomingLesson[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [sikkerhetskontrollProgress, setSikkerhetskontrollProgress] = useState<SikkerhetskontrollProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Hent elev dashboard statistikk
        const statsResponse = await api.get('/elev/dashboard/stats');
        setStats(statsResponse.data);

        // Hent siste aktivitet
        const activitiesResponse = await api.get('/elev/dashboard/activities');
        setActivities(activitiesResponse.data);

        // Hent kommende lektioner
        const lessonsResponse = await api.get('/elev/dashboard/upcoming-lessons');
        setUpcomingLessons(lessonsResponse.data);

        // Hent achievements
        const achievementsResponse = await api.get('/elev/dashboard/achievements');
        setRecentAchievements(achievementsResponse.data);

        // Hent sikkerhetskontroll progresjon
        const progressResponse = await api.get('/elev/dashboard/sikkerhetskontroll-progress');
        setSikkerhetskontrollProgress(progressResponse.data);

      } catch (err) {
        console.error('Feil ved henting av elev dashboard data:', err);
        setError('Kunne ikke laste dashboard data');
        
        // Fallback til mock data
        setStats({
          totalSikkerhetskontroller: 150,
          fullforteSikkerhetskontroller: 89,
          progresjonProsent: 59,
          aktiveKurs: 2,
          fullforteKurs: 8,
          plannedeLektioner: 25,
          fullforteLektioner: 18,
          achievements: 12,
          totalXP: 2450,
          streak: 7,
          kontrakterAktive: 1,
          sisteAktivitet: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        });

        setActivities([
          {
            id: '1',
            type: 'sikkerhetskontroll',
            beskrivelse: 'Fullført sikkerhetskontroll: Bremser',
            tidspunkt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            status: 'success',
            xpGain: 50
          },
          {
            id: '2',
            type: 'achievement',
            beskrivelse: 'Ny prestasjon oppnådd: Bremsemester',
            tidspunkt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            status: 'success',
            xpGain: 100
          },
          {
            id: '3',
            type: 'lesson',
            beskrivelse: 'Kjøretime fullført med Lars Olsen',
            tidspunkt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            status: 'success'
          }
        ]);

        setUpcomingLessons([
          {
            id: '1',
            tittel: 'Kjøretime - Motorvei',
            dato: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
            instruktor: 'Lars Olsen',
            lokasjon: 'Trafikkskole AS',
            type: 'kjøretime'
          },
          {
            id: '2',
            tittel: 'Teoritime - Trafikkregler',
            dato: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
            instruktor: 'Anne Hansen',
            type: 'teoritime'
          }
        ]);

        setRecentAchievements([
          {
            id: '1',
            navn: 'Bremsemester',
            beskrivelse: 'Fullført alle spørsmål om bremser',
            oppnaddDato: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            xpBelonning: 100,
            sjelden: false
          },
          {
            id: '2',
            navn: 'Streak Master',
            beskrivelse: '7 dager på rad med aktivitet',
            oppnaddDato: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            xpBelonning: 150,
            sjelden: true
          }
        ]);

        setSikkerhetskontrollProgress([
          {
            kategori: 'Bremser',
            totalSporsmal: 25,
            besvartSporsmal: 25,
            korrekteSvar: 23,
            progresjonProsent: 100,
            status: 'mestret'
          },
          {
            kategori: 'Lys',
            totalSporsmal: 20,
            besvartSporsmal: 15,
            korrekteSvar: 12,
            progresjonProsent: 75,
            status: 'sett'
          },
          {
            kategori: 'Motor',
            totalSporsmal: 30,
            besvartSporsmal: 8,
            korrekteSvar: 6,
            progresjonProsent: 27,
            status: 'vanskelig'
          },
          {
            kategori: 'Dekk',
            totalSporsmal: 15,
            besvartSporsmal: 0,
            korrekteSvar: 0,
            progresjonProsent: 0,
            status: 'ikke_sett'
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mitt Dashboard</h1>
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
        <h1 className="text-2xl font-bold text-gray-900">Mitt Dashboard</h1>
        <p className="text-gray-600">Oversikt over din progresjon og aktivitet</p>
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
            title="Total Progresjon"
            value={`${stats.progresjonProsent}%`}
            icon={ChartBarIcon}
            color="blue"
          />
          <StatCard
            title="Fullførte Kontroller"
            value={`${stats.fullforteSikkerhetskontroller}/${stats.totalSikkerhetskontroller}`}
            icon={CheckCircleIcon}
            color="green"
          />
          <StatCard
            title="Total XP"
            value={stats.totalXP}
            icon={StarIcon}
            color="purple"
          />
          <StatCard
            title="Daglig Streak"
            value={`${stats.streak} dager`}
            icon={FireIcon}
            color="orange"
          />
          <StatCard
            title="Fullførte Lektioner"
            value={`${stats.fullforteLektioner}/${stats.plannedeLektioner}`}
            icon={AcademicCapIcon}
            color="blue"
          />
          <StatCard
            title="Aktive Kurs"
            value={stats.aktiveKurs}
            icon={BookOpenIcon}
            color="green"
          />
          <StatCard
            title="Prestasjonssmerker"
            value={stats.achievements}
            icon={TrophyIcon}
            color="yellow"
          />
          <StatCard
            title="Kontrakter"
            value={stats.kontrakterAktive}
            icon={DocumentTextIcon}
            color="blue"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Sikkerhetskontroll Progresjon</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sikkerhetskontrollProgress.map((progress, index) => (
                  <SikkerhetskontrollCard key={index} progress={progress} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Siste Prestasjonssmerker</h2>
          </div>
          <div className="p-6">
            {recentAchievements.length > 0 ? (
              <div className="space-y-3">
                {recentAchievements.map((achievement) => (
                  <AchievementBadge key={achievement.id} achievement={achievement} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Ingen prestasjonssmerker ennå</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Kommende Lektioner</h2>
          </div>
          <div className="p-6">
            {upcomingLessons.length > 0 ? (
              <div className="space-y-1">
                {upcomingLessons.map((lesson) => (
                  <UpcomingLessonItem key={lesson.id} lesson={lesson} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Ingen planlagte lektioner</p>
            )}
          </div>
        </div>

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

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Hurtighandlinger</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => window.location.href = '/sikkerhetskontroll'}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CheckCircleIcon className="h-8 w-8 text-blue-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">Start Kontroll</span>
              </button>
              <button 
                onClick={() => window.location.href = '/kurs'}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BookOpenIcon className="h-8 w-8 text-green-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">Mine Kurs</span>
              </button>
              <button 
                onClick={() => window.location.href = '/kalender'}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CalendarDaysIcon className="h-8 w-8 text-purple-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">Kalender</span>
              </button>
              <button 
                onClick={() => window.location.href = '/prestasjonssmerker'}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <TrophyIcon className="h-8 w-8 text-yellow-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">Prestasjonssmerker</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Statistikk</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Fullførte kurs</span>
                <span className="text-sm text-gray-500">{stats?.fullforteKurs || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Aktive kurs</span>
                <span className="text-sm text-gray-500">{stats?.aktiveKurs || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Siste aktivitet</span>
                <span className="text-sm text-gray-500">
                  {stats?.sisteAktivitet ? new Date(stats.sisteAktivitet).toLocaleDateString('nb-NO') : 'Aldri'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Streak rekord</span>
                <span className="text-sm text-gray-500 flex items-center">
                  <FireIcon className="h-4 w-4 mr-1 text-orange-500" />
                  {stats?.streak || 0} dager
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}