import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  CreditCardIcon,
  CalculatorIcon,
  ReceiptPercentIcon,
  ChartBarIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  DocumentTextIcon as DocumentTextSolidIcon,
  CreditCardIcon as CreditCardSolidIcon,
  CalculatorIcon as CalculatorSolidIcon,
  ChartBarIcon as ChartBarSolidIcon
} from '@heroicons/react/24/solid';
import okonomService, { OkonomiDashboardData, FinanceCard, KPICard } from '../../services/okonomi.service';

// Ikon-mapping for å konvertere string til React-komponenter
const ikonMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  CurrencyDollarIcon,
  DocumentTextIcon,
  CreditCardIcon,
  CalculatorIcon,
  ReceiptPercentIcon,
  ChartBarIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextSolidIcon,
  CreditCardSolidIcon,
  CalculatorSolidIcon,
  ChartBarSolidIcon
};

export default function OkonomiIndex() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<OkonomiDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hentDashboardData();
  }, []);

  const hentDashboardData = async () => {
    try {
      const data = await okonomService.hentDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Feil ved henting av økonomi dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Laster...</div>;
  }

  if (!dashboardData) {
    return <div className="p-6">Kunne ikke laste økonomidata</div>;
  }

  const { kpiData, financeModules, quickActions } = dashboardData;

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

  const getKPIColorClasses = (color: string) => {
    const colorClasses = {
      green: 'bg-green-50 border-green-200',
      blue: 'bg-blue-50 border-blue-200', 
      purple: 'bg-purple-50 border-purple-200',
      indigo: 'bg-indigo-50 border-indigo-200'
    };
    return colorClasses[color as keyof typeof colorClasses] || colorClasses.green;
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
              Økonomi & Finans
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Administrer virksomhetens økonomi, fakturering og finansielle rapporter
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/okonomi/fakturering/ny"
              className="inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Ny faktura
            </Link>
            <Link
              to="/okonomi/rapporter/generer"
              className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
              Generer rapport
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 cards-spacing-grid">
        {kpiData.map((kpi) => {
          const ChangeIcon = getChangeIcon(kpi.changeType);
          const IconComponent = ikonMap[kpi.icon];
          
          return (
            <div
              key={kpi.title}
              className={`
                relative rounded-xl border-2 p-6 transition-all duration-200
                ${getKPIColorClasses(kpi.color)}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-lg bg-${kpi.color}-100`}>
                      <IconComponent className={`w-6 h-6 text-${kpi.color}-600`} />
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-medium text-gray-600 mb-1">
                    {kpi.title}
                  </h3>
                  
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {kpi.value}
                    </span>
                    {ChangeIcon && (
                      <div className={`flex items-center ${getChangeColor(kpi.changeType)}`}>
                        <ChangeIcon className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">
                          {kpi.change}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Finance Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 cards-spacing-grid">
        {financeModules.map((module) => {
          const isHovered = hoveredCard === module.title;
          const IconComponent = ikonMap[isHovered ? module.solidIcon : module.icon];
          
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
                    <IconComponent 
                      className={`w-8 h-8 ${isHovered ? 'text-white' : `text-${module.color}-500`}`} 
                    />
                    <h3 className={`ml-3 text-xl font-semibold ${isHovered ? 'text-white' : 'text-gray-900'}`}>
                      {module.title}
                    </h3>
                  </div>
                  
                  <p className={`text-sm mb-4 leading-relaxed ${isHovered ? 'text-white/90' : 'text-gray-600'}`}>
                    {module.description}
                  </p>

                  {module.stats && (
                    <div className="space-y-6 mb-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-2xl font-bold ${isHovered ? 'text-white' : 'text-gray-900'}`}>
                          {module.stats.total}
                        </span>
                        <span className={`text-sm font-medium ${isHovered ? 'text-white/90' : getChangeColor(module.stats.changeType)}`}>
                          {module.stats.change}
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