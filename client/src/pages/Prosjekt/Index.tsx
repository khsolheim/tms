import React, { useState, useEffect, createElement } from 'react';
import { Link } from 'react-router-dom';
import {
  BriefcaseIcon,
  ClockIcon,
  CalendarDaysIcon,
  UsersIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyDollarIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { 
  BriefcaseIcon as BriefcaseSolidIcon,
  ClockIcon as ClockSolidIcon,
  CalendarDaysIcon as CalendarDaysSolidIcon,
  UsersIcon as UsersSolidIcon,
  ChartBarIcon as ChartBarSolidIcon,
  DocumentTextIcon as DocumentTextSolidIcon
} from '@heroicons/react/24/solid';
import prosjektService, { ProsjektDashboardData, ProjectMetric, ProjectModule, Project, QuickAction } from '../../services/prosjekt.service';

// Ikon-mapping for å konvertere string til React-komponenter
const ikonMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  BriefcaseIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CalendarDaysIcon,
  FlagIcon,
  ClockIcon,
  DocumentTextIcon,
  PlusIcon,
  BriefcaseSolidIcon,
  ChartBarSolidIcon,
  UsersSolidIcon,
  CalendarDaysSolidIcon,
  DocumentTextSolidIcon,
  ClockSolidIcon
};

export default function ProsjektIndex() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<ProsjektDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hentDashboardData();
  }, []);

  const hentDashboardData = async () => {
    try {
      const data = await prosjektService.hentDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Feil ved henting av prosjekt dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Laster...</div>;
  }

  if (!dashboardData) {
    return <div className="p-6">Kunne ikke laste prosjektdata</div>;
  }

  const { metrics: projectMetrics, modules: projectModules, recentProjects, quickActions } = dashboardData;

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
      indigo: 'bg-indigo-50 border-indigo-200'
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

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return PlayIcon;
      case 'paused':
        return PauseIcon;
      case 'completed':
        return CheckCircleIcon;
      case 'overdue':
        return ExclamationTriangleIcon;
      default:
        return PlayIcon;
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'Aktiv';
      case 'paused':
        return 'Pauset';
      case 'completed':
        return 'Fullført';
      case 'overdue':
        return 'Forsinket';
      default:
        return 'Ukjent';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getPriorityText = (priority: Project['priority']) => {
    switch (priority) {
      case 'critical':
        return 'Kritisk';
      case 'high':
        return 'Høy';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Lav';
      default:
        return 'Ukjent';
    }
  };

  return (
    <div className="cards-spacing-vertical">
      {/* Header */}
      <div className="border-b border-gray-200 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Prosjektstyring
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Administrer prosjekter, tidsplaner og ressurser effektivt
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/prosjekt/ny"
              className="inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Nytt prosjekt
            </Link>
            <Link
              to="/prosjekt/gantt"
              className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <CalendarDaysIcon className="w-5 h-5 mr-2" />
              Gantt-oversikt
            </Link>
          </div>
        </div>
      </div>

      {/* Project Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 cards-spacing-grid">
        {projectMetrics.map((metric) => {
          const ChangeIcon = getChangeIcon(metric.changeType);
          
          return (
            <div
              key={metric.title}
              className={`
                relative rounded-xl border-2 p-6 transition-all duration-200
                ${getMetricColorClasses(metric.color)}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-lg bg-${metric.color}-100`}>
                      {React.createElement(metric.icon, { className: `w-6 h-6 text-${metric.color}-600` })}
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-medium text-gray-600 mb-1">
                    {metric.title}
                  </h3>
                  
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {metric.value}
                  </div>

                  <p className="text-xs text-gray-500 mb-2">
                    {metric.subtitle}
                  </p>

                  <div className="flex items-center space-x-1">
                    {ChangeIcon && (
                      <ChangeIcon className={`w-4 h-4 ${getChangeColor(metric.changeType)}`} />
                    )}
                    <span className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                      {metric.change}
                    </span>
                    <span className="text-xs text-gray-500">
                      siste måned
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Project Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 cards-spacing-grid">
        {projectModules.map((module) => {
          const isHovered = hoveredCard === module.title;
          const IconComponent = isHovered ? module.solidIcon : module.icon;
          
          return (
            <Link
              key={module.title}
              to={module.href}
              className={`
                relative block rounded-xl border-2 p-6 transition-all duration-300 transform
                ${getColorClasses(module.color, isHovered)}
                ${isHovered ? 'scale-105 -translate-y-1' : 'hover:scale-102'}
              `}
              onMouseEnter={() => setHoveredCard(module.title)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    {React.createElement(IconComponent, { 
                      className: `w-8 h-8 ${isHovered ? 'text-white' : `text-${module.color}-500`}` 
                    })}
                    <h3 className={`ml-3 text-xl font-semibold ${isHovered ? 'text-white' : 'text-gray-900'}`}>
                      {module.title}
                    </h3>
                  </div>
                  
                  <p className={`text-sm mb-4 leading-relaxed ${isHovered ? 'text-white/90' : 'text-gray-600'}`}>
                    {module.description}
                  </p>

                  {module.stats && (
                    <div className="space-y-6">
                      <div className={`text-lg font-bold ${isHovered ? 'text-white' : 'text-gray-900'}`}>
                        {module.stats.total}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${
                          isHovered 
                            ? 'text-white/90' 
                            : module.stats.changeType === 'increase' 
                              ? 'text-green-600' 
                              : module.stats.changeType === 'decrease'
                                ? 'text-red-600'
                                : 'text-gray-500'
                        }`}>
                          {module.stats.change}
                        </span>
                        <span className={`text-xs ${isHovered ? 'text-white/70' : 'text-gray-500'}`}>
                          siste periode
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-xl px-2 py-1">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Hurtighandlinger
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 cards-spacing-grid">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className={`
                group flex items-center p-4 rounded-lg transition-all duration-200
                ${action.color}
              `}
            >
              {React.createElement(action.icon, { className: "w-8 h-8 mr-3 flex-shrink-0" })}
              <div>
                <h3 className="font-semibold">{action.name}</h3>
                <p className="text-sm opacity-75">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-xl border border-gray-200 px-2 py-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Aktive prosjekter
          </h2>
          <Link 
            to="/prosjekt/oversikt"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Se alle
          </Link>
        </div>
        
        <div className="cards-spacing-vertical">
          {recentProjects.map((project) => {
            const StatusIcon = getStatusIcon(project.status);
            
            return (
              <Link 
                key={project.id}
                to={`/prosjekt/${project.id}`}
                className="block px-2 py-1 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {project.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(project.priority)}`}>
                          {getPriorityText(project.priority)}
                        </span>
                        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {getStatusText(project.status)}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 cards-spacing-grid mb-4">
                      <div>
                        <span className="text-xs text-gray-500">Fremdrift</span>
                        <div className="flex items-center mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-xs text-gray-500">Budsjett</span>
                        <div className="text-sm font-medium text-gray-900">{project.budget}</div>
                      </div>
                      
                      <div>
                        <span className="text-xs text-gray-500">Team</span>
                        <div className="text-sm font-medium text-gray-900">{project.team} personer</div>
                      </div>
                      
                      <div>
                        <span className="text-xs text-gray-500">Deadline</span>
                        <div className="text-sm font-medium text-gray-900">{project.deadline}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
} 