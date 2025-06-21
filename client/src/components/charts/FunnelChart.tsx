/**
 * FunnelChart - Visualiserer konverteringsløp og drop-off punkter
 */

import React from 'react';
import { FiArrowDown, FiTrendingDown } from 'react-icons/fi';

interface FunnelStep {
  name: string;
  users: number;
  completionRate: number;
  avgTimeToNext?: number;
}

interface FunnelChartProps {
  steps: FunnelStep[];
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ steps }) => {
  const maxUsers = Math.max(...steps.map(step => step.users));

  return (
    <div className="cards-spacing-vertical">
      {steps.map((step, index) => {
        const widthPercentage = (step.users / maxUsers) * 100;
        const dropOffRate = index > 0 ? 100 - step.completionRate : 0;
        const isSignificantDropOff = dropOffRate > 20;
        
        return (
          <div key={step.name} className="relative">
            {/* Step Container */}
            <div className="flex items-center space-x-4">
              {/* Step Number */}
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              
              {/* Funnel Bar */}
              <div className="flex-1">
                <div className="mb-2 flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-900">{step.name}</h4>
                  <div className="text-sm text-gray-600">
                    {step.users.toLocaleString('nb-NO')} brukere
                  </div>
                </div>
                
                {/* Progress Bar with Funnel Shape */}
                <div className="relative">
                  <div className="h-12 bg-gray-200 rounded-lg overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 flex items-center justify-center text-white text-sm font-medium ${
                        isSignificantDropOff ? 'bg-red-500' : 'bg-blue-600'
                      }`}
                      style={{
                        width: `${Math.max(widthPercentage, 10)}%`,
                        clipPath: index === 0 ? 'none' : 'polygon(0 0, 95% 0, 100% 100%, 5% 100%)'
                      }}
                    >
                      {step.completionRate.toFixed(1)}%
                    </div>
                  </div>
                  
                  {/* Completion Rate Badge */}
                  <div className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full px-2 py-1 text-xs font-medium text-gray-700">
                    {step.completionRate.toFixed(1)}%
                  </div>
                </div>
                
                {/* Metrics Row */}
                <div className="mt-2 flex space-x-4 text-xs text-gray-500">
                  <span>
                    Brukere: {step.users.toLocaleString('nb-NO')}
                  </span>
                  {step.avgTimeToNext && (
                    <span>
                      Avg. tid til neste: {Math.round(step.avgTimeToNext / 1000)}s
                    </span>
                  )}
                  {index > 0 && (
                    <span className={dropOffRate > 20 ? 'text-red-600 font-medium' : ''}>
                      Drop-off: {dropOffRate.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Drop-off Warning */}
            {isSignificantDropOff && (
              <div className="mt-2 ml-12 px-2 py-1 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 text-red-800">
                  <FiTrendingDown className="h-4 w-4" />
                  <span className="text-sm font-medium">Høy drop-off rate oppdaget</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  {dropOffRate.toFixed(1)}% av brukerne forlater prosessen her. Vurder optimalisering av dette steget.
                </p>
              </div>
            )}
            
            {/* Arrow to Next Step */}
            {index < steps.length - 1 && (
              <div className="flex justify-center my-2">
                <FiArrowDown className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>
        );
      })}
      
      {/* Summary Stats */}
      <div className="mt-6 px-2 py-1 bg-gray-50 rounded-lg">
        <h5 className="text-sm font-medium text-gray-900 mb-3">Konverteringsløp Sammendrag</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 cards-spacing-grid text-sm">
          <div>
            <span className="text-gray-600">Total konverteringsrate:</span>
            <div className="font-semibold text-blue-600">
              {steps.length > 0 ? ((steps[steps.length - 1].users / steps[0].users) * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div>
            <span className="text-gray-600">Startende brukere:</span>
            <div className="font-semibold">
              {steps.length > 0 ? steps[0].users.toLocaleString('nb-NO') : 0}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Fullførte brukere:</span>
            <div className="font-semibold">
              {steps.length > 0 ? steps[steps.length - 1].users.toLocaleString('nb-NO') : 0}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Steg med høy drop-off:</span>
            <div className="font-semibold text-red-600">
              {steps.filter((_, index) => index > 0 && (100 - steps[index].completionRate) > 20).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 