import React from 'react';

interface ChartWidgetProps {
  config: {
    type: 'line' | 'bar' | 'pie';
    data: any[];
    options?: any;
  };
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ config }) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500">Chart Widget</p>
        <p className="text-sm text-gray-400">Type: {config.type}</p>
        <p className="text-sm text-gray-400">Data points: {config.data?.length || 0}</p>
      </div>
    </div>
  );
};