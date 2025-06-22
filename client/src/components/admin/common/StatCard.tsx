import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/outline';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
    label?: string;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  className?: string;
  onClick?: () => void;
  loading?: boolean;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  description?: string;
  valueColor?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
  className = '',
  onClick,
  loading = false,
  change,
  changeType,
  description,
  valueColor
}: StatCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      icon: 'text-blue-600',
      accent: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      icon: 'text-green-600',
      accent: 'text-green-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
      icon: 'text-yellow-600',
      accent: 'text-yellow-600'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      icon: 'text-red-600',
      accent: 'text-red-600'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900',
      icon: 'text-purple-600',
      accent: 'text-purple-600'
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-900',
      icon: 'text-gray-600',
      accent: 'text-gray-600'
    }
  };

  const colors = colorClasses[color];

  const getTrendIcon = () => {
    if (!finalTrend) return null;
    
    switch (finalTrend.direction) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l5-5 5 5" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-5 5-5-5" />
          </svg>
        );
      case 'stable':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    if (!finalTrend) return '';
    
    switch (finalTrend.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      // Format large numbers with appropriate suffixes
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M';
      } else if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K';
      }
      return val.toString();
    }
    return val;
  };

  // Convert change and changeType to trend if not already provided
  const finalTrend = trend || (change && changeType ? {
    value: parseFloat(change.replace(/[^-\d.]/g, '')) || 0,
    direction: changeType === 'increase' ? 'up' as const : 
               changeType === 'decrease' ? 'down' as const : 'stable' as const,
    label: change
  } : undefined);

  const finalSubtitle = subtitle || description;

  if (loading) {
    return (
      <div className={`
        ${colors.bg} ${colors.border} border rounded-lg p-6 
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : ''}
        ${className}
      `}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-16"></div>
            </div>
            {icon && (
              <div className="h-8 w-8 bg-gray-300 rounded"></div>
            )}
          </div>
          {finalSubtitle && (
            <div className="h-3 bg-gray-300 rounded w-32 mt-2"></div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`
        ${colors.bg} ${colors.border} border rounded-lg p-6 
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${colors.text}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${valueColor || colors.text}`}>
            {formatValue(value)}
          </p>
          
          {finalSubtitle && (
            <p className="text-sm text-gray-600 mt-1">
              {finalSubtitle}
            </p>
          )}
          
          {finalTrend && (
            <div className="flex items-center mt-2">
              {getTrendIcon()}
              <span className={`text-sm font-medium ml-1 ${getTrendColor()}`}>
                {finalTrend.value > 0 ? '+' : ''}{finalTrend.value}%
              </span>
              {finalTrend.label && (
                <span className="text-sm text-gray-500 ml-1">
                  {finalTrend.label}
                </span>
              )}
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`${colors.icon} ml-4`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// Convenience wrapper for metric cards
export interface MetricCardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  unit?: string;
  icon?: React.ReactNode;
  color?: StatCardProps['color'];
  className?: string;
  onClick?: () => void;
  loading?: boolean;
  metric: 'users' | 'companies' | 'services' | 'uptime' | 'performance' | 'security';
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  description?: string;
  valueColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric, title, value, change, changeType, description, valueColor, loading, ...props }) => {
  const getMetricIcon = () => {
    switch (metric) {
      case 'users':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        );
      case 'companies':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'services':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'uptime':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'performance':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'security':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Convert change and changeType to trend format
  const trend = change && changeType ? {
    value: parseFloat(change.replace(/[^-\d.]/g, '')) || 0,
    direction: changeType === 'increase' ? 'up' as const : 
               changeType === 'decrease' ? 'down' as const : 'stable' as const,
    label: change
  } : undefined;

  return (
    <StatCard
      title={title}
      value={value}
      subtitle={description}
      trend={trend}
      icon={getMetricIcon()}
      loading={loading}
      {...props}
    />
  );
};

// Grid layout for stat cards
export interface StatCardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatCardGrid: React.FC<StatCardGridProps> = ({
  children,
  columns = 4,
  gap = 'md',
  className = ''
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-5',
    lg: 'gap-6'
  };

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}; 