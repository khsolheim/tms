import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  UsersIcon,
  DocumentChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  ClockIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import {
  ChartBarIcon as ChartBarSolidIcon,
  DocumentChartBarIcon as DocumentChartBarSolidIcon
} from '@heroicons/react/24/solid';
import rapporteringService, { RapporteringDashboardData, ReportCard, QuickAction } from '../../services/rapportering.service';

// Ikon-mapping for å konvertere string til React-komponenter
const ikonMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  UsersIcon,
  DocumentChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  ClockIcon,
  Cog6ToothIcon,
  ChartBarSolidIcon,
  DocumentChartBarSolidIcon
};

export default function RapporteringIndex() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<RapporteringDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hentDashboardData();
  }, []);

  const hentDashboardData = async () => {
    try {
      const data = await rapporteringService.hentDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Feil ved henting av rapportering dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Laster...</div>;
  }

  if (!dashboardData) {
    return <div className="p-6">Kunne ikke laste rapporteringsdata</div>;
  }

  const { reportSections, quickActions } = dashboardData;

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
      indigo: isHovered 
        ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
        : 'bg-white border-indigo-200 text-gray-900 hover:border-indigo-300'
    };
    return baseClasses[color as keyof typeof baseClasses] || baseClasses.blue;
  };

  const getStatColor = (changeType: 'increase' | 'decrease' | 'neutral', isHovered: boolean) => {
    if (isHovered) return 'text-white/90';
    
    const colors = {
      increase: 'text-green-600',
      decrease: 'text-red-600',
      neutral: 'text-gray-500'
    };
    return colors[changeType];
  };

  return (
    <div className="cards-spacing-vertical">
      {/* Header */}
      <div className="border-b border-gray-200 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Rapportering & Analyse
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Få innsikt i virksomheten din med kraftige analyser og rapporter
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/rapportering/generer"
              className="inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
              Ny rapport
            </Link>
          </div>
        </div>
      </div>

      {/* Main Report Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 cards-spacing-grid">
        {reportSections.map((section) => {
          const isHovered = hoveredCard === section.title;
          const IconComponent = ikonMap[isHovered ? section.solidIcon : section.icon];
          
          return (
            <Link
              key={section.title}
              to={section.href}
              className={`
                relative block rounded-xl border-2 p-6 transition-all duration-300 transform
                ${getColorClasses(section.color, isHovered)}
                ${isHovered ? 'scale-105 -translate-y-1' : 'hover:scale-102'}
              `}
              onMouseEnter={() => setHoveredCard(section.title)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <IconComponent 
                      className={`w-8 h-8 ${isHovered ? 'text-white' : `text-${section.color}-500`}`} 
                    />
                    <h3 className={`ml-3 text-xl font-semibold ${isHovered ? 'text-white' : 'text-gray-900'}`}>
                      {section.title}
                    </h3>
                  </div>
                  
                  <p className={`text-sm mb-4 leading-relaxed ${isHovered ? 'text-white/90' : 'text-gray-600'}`}>
                    {section.description}
                  </p>

                  {section.stats && (
                    <div className="space-y-6 mb-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-2xl font-bold ${isHovered ? 'text-white' : 'text-gray-900'}`}>
                          {section.stats.total}
                        </span>
                        <span className={`text-sm font-medium ${getStatColor(section.stats.changeType, isHovered)}`}>
                          {section.stats.change}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className={`text-xs ${isHovered ? 'text-white/75' : 'text-gray-500'}`}>
                    Sist oppdatert: {section.lastUpdated}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Hurtighandlinger</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const IconComponent = ikonMap[action.icon];
            return (
              <Link
                key={action.name}
                to={action.href}
                className={`
                  flex items-center p-4 rounded-lg border border-gray-200 transition-colors
                  ${action.color}
                `}
              >
                <IconComponent className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium">{action.name}</div>
                  <div className="text-sm opacity-75">{action.description}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
} 