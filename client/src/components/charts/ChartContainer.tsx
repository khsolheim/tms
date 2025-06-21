/**
 * ChartContainer - Container for data visualization uten external dependencies
 */

import React from 'react';

interface ChartData {
  name: string;
  value: number;
}

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  data: ChartData[];
  type?: 'bar' | 'pie';
  height?: number;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  data,
  type = 'bar',
  height = 300
}) => {
  const maxValue = Math.max(...data.map(item => item.value));
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const renderBarChart = () => (
    <div className="space-y-8" style={{ height }}>
      {data.map((item, index) => {
        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        const barColor = `hsl(${(index * 60) % 360}, 70%, 50%)`;
        
        return (
          <div key={item.name} className="flex items-center space-x-3">
            <div className="w-20 text-sm text-gray-600 truncate">
              {item.name}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div
                className="h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium"
                style={{
                  width: `${Math.max(percentage, 5)}%`,
                  backgroundColor: barColor
                }}
              >
                {item.value.toLocaleString('nb-NO')}
              </div>
            </div>
            <div className="w-12 text-xs text-gray-500 text-right">
              {((item.value / total) * 100).toFixed(1)}%
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderPieChart = () => (
    <div className="flex items-center justify-center" style={{ height }}>
      <div className="relative">
        {/* Simple pie chart visualization */}
        <div className="w-48 h-48 rounded-full border-8 border-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{total.toLocaleString('nb-NO')}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 space-y-6">
          {data.map((item, index) => {
            const barColor = `hsl(${(index * 60) % 360}, 70%, 50%)`;
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
            
            return (
              <div key={item.name} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: barColor }}
                ></div>
                <span className="text-sm text-gray-700">
                  {item.name}: {item.value.toLocaleString('nb-NO')} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow px-2 py-1">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      
      <div className="mt-4">
        {type === 'bar' ? renderBarChart() : renderPieChart()}
      </div>
      
      {/* Data Summary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 cards-spacing-grid text-sm text-gray-600">
          <div>
            <span className="font-medium">Total datapunkter:</span>
            <span className="ml-2">{data.length}</span>
          </div>
          <div>
            <span className="font-medium">Sum:</span>
            <span className="ml-2">{total.toLocaleString('nb-NO')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 