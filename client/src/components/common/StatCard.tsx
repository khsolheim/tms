import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ComponentType<any> | React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  className = ''
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderIcon = () => {
    if (!icon) return null;
    
    // If icon is a React component (function/class)
    if (typeof icon === 'function') {
      const IconComponent = icon as React.ComponentType<any>;
      return <IconComponent className="h-8 w-8 text-gray-400" />;
    }
    
    // If icon is already a JSX element
    return <div className="h-8 w-8 text-gray-400">{icon}</div>;
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${getChangeColor()} mt-1`}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0">
            {renderIcon()}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard; 