import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/outline';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  description?: string;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  valueColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  description,
  loading = false,
  onClick,
  className = '',
  valueColor,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6'
  };

  const valueSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const titleSizeClasses = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base'
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return <ArrowUpIcon className="w-4 h-4" />;
      case 'decrease':
        return <ArrowDownIcon className="w-4 h-4" />;
      default:
        return <MinusIcon className="w-4 h-4" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'bg-green-100 text-green-800';
      case 'decrease':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const cardClasses = `
    bg-white overflow-hidden shadow rounded-lg transition-all duration-200
    ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''}
    ${className}
  `;

  if (loading) {
    return (
      <div className={cardClasses}>
        <div className={sizeClasses[size]}>
          <div className="animate-pulse">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {icon ? (
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                ) : (
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            {change && (
              <div className="mt-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className={sizeClasses[size]}>
        <div className="flex items-center">
          {icon && (
            <div className="flex-shrink-0">
              <div className="w-8 h-8 flex items-center justify-center text-gray-400">
                {icon}
              </div>
            </div>
          )}
          <div className={`${icon ? 'ml-3' : ''} flex-1 min-w-0`}>
            <div className={`${titleSizeClasses[size]} font-medium text-gray-500 truncate`}>
              {title}
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <div className={`${valueSizeClasses[size]} font-semibold ${
                valueColor || 'text-gray-900'
              }`}>
                {typeof value === 'number' ? value.toLocaleString('nb-NO') : value}
              </div>
              {change && (
                <div className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium ${getChangeColor()}`}>
                  {getChangeIcon()}
                  <span className="ml-1">{change}</span>
                </div>
              )}
            </div>
            {description && (
              <div className="mt-1 text-xs text-gray-500 truncate">
                {description}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Specialized stat cards
export interface MetricCardProps extends Omit<StatCardProps, 'icon'> {
  metric: 'users' | 'companies' | 'services' | 'uptime' | 'performance' | 'security';
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric, ...props }) => {
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

  return <StatCard {...props} icon={getMetricIcon()} />;
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