/**
 * InsightsPanel - AI-drevne innsikter og anbefalinger basert på analytics data
 */

import React from 'react';
import { FiAlertTriangle, FiTrendingUp, FiCheckCircle, FiTarget, FiInfo } from 'react-icons/fi';

interface AnalyticsInsight {
  type: 'opportunity' | 'warning' | 'achievement' | 'trend';
  title: string;
  description: string;
  data: any;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
  recommendations?: string[];
}

interface InsightsPanelProps {
  insights: AnalyticsInsight[];
}

const getInsightIcon = (type: AnalyticsInsight['type']) => {
  switch (type) {
    case 'opportunity':
      return FiTarget;
    case 'warning':
      return FiAlertTriangle;
    case 'achievement':
      return FiCheckCircle;
    case 'trend':
      return FiTrendingUp;
    default:
      return FiInfo;
  }
};

const getInsightColor = (type: AnalyticsInsight['type'], priority: AnalyticsInsight['priority']) => {
  const baseColors = {
    opportunity: 'blue',
    warning: 'red',
    achievement: 'green',
    trend: 'purple'
  };

  const color = baseColors[type];
  const intensity = priority === 'high' ? '600' : priority === 'medium' ? '500' : '400';

  return {
    bg: `bg-${color}-50`,
    border: `border-${color}-200`,
    icon: `text-${color}-${intensity}`,
    text: `text-${color}-800`,
    badge: `bg-${color}-100 text-${color}-800`
  };
};

const getPriorityBadge = (priority: AnalyticsInsight['priority']) => {
  const badges = {
    high: { text: 'Høy prioritet', className: 'bg-red-100 text-red-800' },
    medium: { text: 'Medium prioritet', className: 'bg-yellow-100 text-yellow-800' },
    low: { text: 'Lav prioritet', className: 'bg-gray-100 text-gray-800' }
  };
  
  return badges[priority];
};

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights }) => {
  const prioritizedInsights = insights.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  const insightCounts = insights.reduce((acc, insight) => {
    acc[insight.type] = (acc[insight.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (insights.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow px-2 py-1 text-center">
        <FiInfo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen innsikter tilgjengelig</h3>
        <p className="text-gray-600">
          Det er ikke nok data for å generere innsikter ennå. Kom tilbake når du har mer aktivitet å analysere.
        </p>
      </div>
    );
  }

  return (
    <div className="cards-spacing-vertical">
      {/* Insights Summary */}
      <div className="bg-white rounded-lg shadow px-2 py-1">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Innsikter Oversikt</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 cards-spacing-grid">
          <div className="text-center px-2 py-1 bg-blue-50 rounded-lg">
            <FiTarget className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{insightCounts.opportunity || 0}</div>
            <div className="text-sm text-blue-800">Muligheter</div>
          </div>
          <div className="text-center px-2 py-1 bg-red-50 rounded-lg">
            <FiAlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{insightCounts.warning || 0}</div>
            <div className="text-sm text-red-800">Advarsler</div>
          </div>
          <div className="text-center px-2 py-1 bg-green-50 rounded-lg">
            <FiCheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{insightCounts.achievement || 0}</div>
            <div className="text-sm text-green-800">Prestasjoner</div>
          </div>
          <div className="text-center px-2 py-1 bg-purple-50 rounded-lg">
            <FiTrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{insightCounts.trend || 0}</div>
            <div className="text-sm text-purple-800">Trender</div>
          </div>
        </div>
      </div>

      {/* Individual Insights */}
      <div className="cards-spacing-vertical">
        {prioritizedInsights.map((insight, index) => {
          const Icon = getInsightIcon(insight.type);
          const colors = getInsightColor(insight.type, insight.priority);
          const priorityBadge = getPriorityBadge(insight.priority);

          return (
            <div key={index} className={`bg-white border rounded-lg shadow p-6 ${colors.border}`}>
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${colors.bg}`}>
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-lg font-semibold ${colors.text}`}>
                      {insight.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityBadge.className}`}>
                      {priorityBadge.text}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{insight.description}</p>
                  
                  {/* Data Visualization */}
                  {insight.data && (
                    <div className="mb-4 px-2 py-1 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Relaterte data:</h4>
                      <div className="text-sm text-gray-600">
                        {Object.entries(insight.data).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                            <span className="font-medium">
                              {typeof value === 'number' 
                                ? value.toLocaleString('nb-NO') 
                                : String(value)
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Recommendations */}
                  {insight.actionable && insight.recommendations && insight.recommendations.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Anbefalte tiltak:</h4>
                      <ul className="space-y-1">
                        {insight.recommendations.map((recommendation, recIndex) => (
                          <li key={recIndex} className="flex items-start space-x-2 text-sm text-gray-700">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Action Button */}
                  {insight.actionable && (
                    <div className="mt-4">
                      <button onClick={() => console.log('Button clicked')} className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors ${
                        insight.priority === 'high' 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : insight.priority === 'medium'
                          ? 'bg-yellow-600 hover:bg-yellow-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}>
                        Undersøk nærmere
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Summary */}
      <div className="bg-white rounded-lg shadow px-2 py-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Neste steg</h3>
        <div className="space-y-8">
          {prioritizedInsights.filter(insight => insight.actionable).slice(0, 3).map((insight, index) => (
            <div key={index} className="flex items-center space-x-3 px-2 py-1 bg-gray-50 rounded-lg">
              <div className={`w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{insight.title}</div>
                <div className="text-sm text-gray-600">
                  {insight.recommendations?.[0] || 'Krever nærmere undersøkelse'}
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadge(insight.priority).className}`}>
                {getPriorityBadge(insight.priority).text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 