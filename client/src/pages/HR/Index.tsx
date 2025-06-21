import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  HeartIcon,
  ChartBarIcon,
  ClockIcon,
  TrophyIcon,
  UserPlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  BellIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { 
  UsersIcon as UsersSolidIcon,
  CurrencyDollarIcon as CurrencyDollarSolidIcon,
  AcademicCapIcon as AcademicCapSolidIcon,
  HeartIcon as HeartSolidIcon,
  ChartBarIcon as ChartBarSolidIcon,
  TrophyIcon as TrophySolidIcon
} from '@heroicons/react/24/solid';
import hrService, { HRDashboardData, HRMetric, HRModule, QuickAction } from '../../services/hr.service';

// Icon mapping for string-based icons
const ikonMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UsersIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  HeartIcon,
  TrophyIcon,
  ChartBarIcon,
  UserPlusIcon,
  ClockIcon,
  UsersSolidIcon,
  CurrencyDollarSolidIcon,
  AcademicCapSolidIcon,
  HeartSolidIcon,
  TrophySolidIcon,
  ChartBarSolidIcon
};

export default function HRIndex() {
  const [dashboardData, setDashboardData] = useState<HRDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  useEffect(() => {
    const hentDashboardData = async () => {
      try {
        const data = await hrService.hentDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Feil ved henting av HR dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    hentDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Kunne ikke laste HR dashboard data</p>
      </div>
    );
  }

  const { metrics: hrMetrics, modules: hrModules, quickActions } = dashboardData;

  const getColorClasses = (color: string, isHovered: boolean) => {
    const baseClasses = {
      blue: isHovered 
        ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/25' 
        : 'bg-white border-blue-200 text-gray-900 hover:border-blue-300',
      green: isHovered 
        ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/25' 
        : 'bg-white border-green-200 text-gray-900 hover:border-green-300',
      red: isHovered 
        ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/25' 
        : 'bg-white border-red-200 text-gray-900 hover:border-red-300',
      purple: isHovered 
        ? 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/25' 
        : 'bg-white border-purple-200 text-gray-900 hover:border-purple-300',
      yellow: isHovered 
        ? 'bg-yellow-500 border-yellow-500 text-white shadow-lg shadow-yellow-500/25' 
        : 'bg-white border-yellow-200 text-gray-900 hover:border-yellow-300',
      indigo: isHovered 
        ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
        : 'bg-white border-indigo-200 text-gray-900 hover:border-indigo-300'
    };
    return baseClasses[color as keyof typeof baseClasses] || baseClasses.blue;
  };

  const getMetricColorClasses = (color: string) => {
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200',
      green: 'bg-green-50 border-green-200',
      purple: 'bg-purple-50 border-purple-200',
      red: 'bg-red-50 border-red-200'
    };
    return colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;
  };

  const getChangeIcon = (changeType: 'increase' | 'decrease' | 'neutral') => {
    if (changeType === 'increase') return ArrowUpIcon;
    if (changeType === 'decrease') return ArrowDownIcon;
    return null;
  };

  const getChangeColor = (changeType: 'increase' | 'decrease' | 'neutral') => {
    if (changeType === 'increase') return 'text-green-600';
    if (changeType === 'decrease') return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className="cards-spacing-vertical">
      {/* Header */}
      <div className="border-b border-gray-200 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Personaladministrasjon
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Administrer ansatte, kompetanse og HR-prosesser på ett sted
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/hr/personalregister/ny"
              className="inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlusIcon className="w-5 h-5 mr-2" />
              Ny ansatt
            </Link>
            <Link
              to="/hr/analytics"
              className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ChartBarIcon className="w-5 h-5 mr-2" />
              Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* HR Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 cards-spacing-grid">
        {hrMetrics.map((metric) => {
          const ChangeIcon = getChangeIcon(metric.changeType);
          const IconComponent = ikonMap[metric.icon];
          
          return (
            <div
              key={metric.title}
              className={`p-6 rounded-xl border-2 transition-all duration-200 ${getMetricColorClasses(metric.color)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {metric.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {metric.value}
                  </p>
                  <div className="flex items-center space-x-2">
                    {ChangeIcon && (
                      <ChangeIcon className={`w-4 h-4 ${getChangeColor(metric.changeType)}`} />
                    )}
                    <span className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                      {metric.change}
                    </span>
                    <span className="text-sm text-gray-500">
                      {metric.subtitle}
                    </span>
                  </div>
                </div>
                {IconComponent && (
                  <IconComponent className="w-8 h-8 text-gray-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* HR Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 cards-spacing-grid">
        {hrModules.map((module) => {
          const isHovered = hoveredModule === module.title;
          const IconComponent = ikonMap[isHovered ? module.solidIcon : module.icon];
          const ChangeIcon = module.stats ? getChangeIcon(module.stats.changeType) : null;
          
          return (
            <Link
              key={module.title}
              to={module.href}
              className={`block p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${getColorClasses(module.color, isHovered)}`}
              onMouseEnter={() => setHoveredModule(module.title)}
              onMouseLeave={() => setHoveredModule(null)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    {module.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${isHovered ? 'text-white/90' : 'text-gray-600'}`}>
                    {module.description}
                  </p>
                </div>
                {IconComponent && (
                  <IconComponent className={`w-8 h-8 ml-4 flex-shrink-0 ${isHovered ? 'text-white' : 'text-gray-400'}`} />
                )}
              </div>
              
              {module.stats && (
                <div className={`pt-4 border-t ${isHovered ? 'border-white/20' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-lg font-semibold ${isHovered ? 'text-white' : 'text-gray-900'}`}>
                      {module.stats.total}
                    </span>
                    <div className="flex items-center space-x-1">
                      {ChangeIcon && (
                        <ChangeIcon className={`w-4 h-4 ${
                          isHovered 
                            ? 'text-white' 
                            : getChangeColor(module.stats.changeType)
                        }`} />
                      )}
                      <span className={`text-sm font-medium ${
                        isHovered 
                          ? 'text-white' 
                          : getChangeColor(module.stats.changeType)
                      }`}>
                        {module.stats.change}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Hurtighandlinger
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 cards-spacing-grid">
          {quickActions.map((action) => {
            const IconComponent = ikonMap[action.icon];
            
            return (
              <Link
                key={action.name}
                to={action.href}
                className={`flex items-center p-4 rounded-lg transition-colors ${action.color}`}
              >
                {IconComponent && (
                  <IconComponent className="w-6 h-6 mr-3 flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium">
                    {action.name}
                  </p>
                  <p className="text-sm opacity-75">
                    {action.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
        {/* Recent HR Activity */}
        <div className="bg-white rounded-xl border border-gray-200 px-2 py-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Nylig aktivitet
            </h2>
            <Link 
              to="/hr/aktivitet"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Se alle
            </Link>
          </div>
          
          <div className="cards-spacing-vertical">
            {[
              {
                title: 'Ny ansatt registrert',
                description: 'Kari Hansen - Trafikklærer',
                time: '2 timer siden',
                icon: UserPlusIcon,
                color: 'blue'
              },
              {
                title: 'Lønnsliste generert',
                description: 'Mars 2024 - 127 ansatte',
                time: '5 timer siden',
                icon: CurrencyDollarIcon,
                color: 'green'
              },
              {
                title: 'Kompetanseevaluering fullført',
                description: 'Per Johansen - Sertifisering oppdatert',
                time: '1 dag siden',
                icon: AcademicCapIcon,
                color: 'purple'
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-center px-2 py-1 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg bg-${activity.color}-100 mr-4`}>
                  <activity.icon className={`w-5 h-5 text-${activity.color}-600`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{activity.title}</h4>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl border border-gray-200 px-2 py-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Kommende hendelser
            </h2>
            <Link 
              to="/hr/kalender"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Se kalender
            </Link>
          </div>
          
          <div className="cards-spacing-vertical">
            {[
              {
                title: 'Prestasjonsevaluering',
                description: '15 ansatte til evaluering',
                date: 'I morgen',
                icon: TrophyIcon,
                color: 'yellow',
                priority: 'høy'
              },
              {
                title: 'Lønnsutbetaling',
                description: 'Månedlig lønn - alle ansatte',
                date: '25. mars',
                icon: CurrencyDollarIcon,
                color: 'green',
                priority: 'medium'
              },
              {
                title: 'Kompetanseoppdatering',
                description: 'Sertifisering utløper snart',
                date: '30. mars',
                icon: AcademicCapIcon,
                color: 'purple',
                priority: 'medium'
              }
            ].map((event, index) => (
              <div key={index} className="flex items-center px-2 py-1 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg bg-${event.color}-100 mr-4`}>
                  <event.icon className={`w-5 h-5 text-${event.color}-600`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      event.priority === 'høy' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {event.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{event.description}</p>
                  <p className="text-xs text-gray-400 flex items-center mt-1">
                    <CalendarDaysIcon className="w-3 h-3 mr-1" />
                    {event.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 