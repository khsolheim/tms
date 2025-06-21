/**
 * MetricCard - Viser KPI metrics med trender og endringer
 */

import React from 'react';
import { IconType } from 'react-icons';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: IconType;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  invertColors?: boolean; // For metrics where lower is better (e.g., bounce rate)
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-500',
    accent: 'text-blue-600'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-500',
    accent: 'text-green-600'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-500',
    accent: 'text-purple-600'
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-500',
    accent: 'text-orange-600'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-500',
    accent: 'text-red-600'
  }
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
  invertColors = false
}) => {
  const colors = colorClasses[color];
  
  const getTrendIcon = () => {
    if (trend === 'up') return FiTrendingUp;
    if (trend === 'down') return FiTrendingDown;
    return FiMinus;
  };

  const getTrendColor = () => {
    const isPositive = trend === 'up';
    const isNegative = trend === 'down';
    
    if (invertColors) {
      // For metrics where lower is better (e.g., bounce rate)
      if (isPositive) return 'text-red-600';
      if (isNegative) return 'text-green-600';
    } else {
      // For metrics where higher is better
      if (isPositive) return 'text-green-600';
      if (isNegative) return 'text-red-600';
    }
    
    return 'text-gray-500';
  };

  const TrendIcon = getTrendIcon();

  return (
    <div className="bg-white rounded-lg shadow px-2 py-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-md ${colors.bg}`}>
            <Icon className={`h-6 w-6 ${colors.icon}`} />
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${colors.accent}`}>
              {typeof value === 'number' ? value.toLocaleString('nb-NO') : value}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-sm font-medium">
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">vs forrige periode</p>
        </div>
      </div>
    </div>
  );
}; 