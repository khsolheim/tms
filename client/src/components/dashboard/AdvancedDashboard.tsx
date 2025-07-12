import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface DashboardData {
  user: {
    rolle: string;
    globalRole: string;
  };
  notifications: any[];
  activities: any[];
  systemStats?: {
    userCount: number;
    companyCount: number;
    activeQuizzes: number;
  };
  userProgress?: {
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    recentProgress: any[];
  };
}

interface WidgetConfig {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'table' | 'progress';
  size: 'small' | 'medium' | 'large';
  refreshInterval?: number;
}

const AdvancedDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [customWidgets, setCustomWidgets] = useState<WidgetConfig[]>([]);

  // Simulated dashboard data fetching
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockData: DashboardData = {
          user: {
            rolle: 'ELEV',
            globalRole: 'STANDARD_USER'
          },
          notifications: [
            { id: 1, tittel: 'Ny quiz tilgjengelig', type: 'INFO', opprettet: new Date() },
            { id: 2, tittel: 'Gratulerer med fremgang!', type: 'SUCCESS', opprettet: new Date() }
          ],
          activities: [
            { id: 1, action: 'quiz_completed', tableName: 'Quiz', timestamp: new Date() },
            { id: 2, action: 'module_started', tableName: 'Module', timestamp: new Date() }
          ],
          userProgress: {
            totalQuestions: 150,
            correctAnswers: 120,
            accuracy: 80,
            recentProgress: [
              { id: 1, antallRiktigeForsok: 1, opprettet: new Date(Date.now() - 86400000) },
              { id: 2, antallRiktigeForsok: 1, opprettet: new Date(Date.now() - 172800000) },
              { id: 3, antallRiktigeForsok: 0, opprettet: new Date(Date.now() - 259200000) }
            ]
          }
        };
        
        setDashboardData(mockData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedTimeRange]);

  // Real-time updates
  useEffect(() => {
    if (!realTimeEnabled) return;

    const interval = setInterval(() => {
      // Simulate real-time updates
      setDashboardData(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          userProgress: prev.userProgress ? {
            ...prev.userProgress,
            accuracy: Math.max(75, Math.min(95, prev.userProgress.accuracy + (Math.random() - 0.5) * 2))
          } : undefined
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [realTimeEnabled]);

  // Chart configurations with dark theme support
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#374151',
          font: {
            family: 'Inter, sans-serif',
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#4F46E5',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          color: '#6B7280',
          font: {
            family: 'Inter, sans-serif',
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          color: '#6B7280',
          font: {
            family: 'Inter, sans-serif',
            size: 11
          }
        }
      }
    }
  }), []);

  // Progress over time chart data
  const progressChartData = useMemo(() => {
    if (!dashboardData?.userProgress) return null;

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    return {
      labels: last7Days.map(date => 
        date.toLocaleDateString('no-NO', { weekday: 'short' })
      ),
      datasets: [
        {
          label: 'Riktige svar',
          data: [65, 72, 68, 78, 85, 82, 88],
          borderColor: '#4F46E5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          borderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.4,
          fill: true
        },
        {
          label: 'Tidsbruk (min)',
          data: [25, 22, 28, 20, 18, 24, 16],
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.4,
          fill: true,
          yAxisID: 'y1'
        }
      ]
    };
  }, [dashboardData]);

  // Skill distribution radar chart
  const skillRadarData = useMemo(() => ({
    labels: [
      'Sikkerhetskontroll',
      'Kjøretøy kunnskap',
      'Trafikkregler',
      'Førstehjelp',
      'Miljøhensyn',
      'Teknisk forståelse'
    ],
    datasets: [
      {
        label: 'Din ferdighet',
        data: [85, 78, 92, 65, 70, 88],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Gjennomsnitt',
        data: [75, 70, 80, 60, 65, 75],
        borderColor: '#6B7280',
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }), []);

  // Performance metrics
  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-dark-100 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden`}
    >
      <div className={`absolute top-0 right-0 w-20 h-20 ${color} opacity-10 rounded-bl-full`} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '↗' : '↘'} {Math.abs(change)}%
            </p>
          )}
        </div>
        <div className={`text-2xl ${color.replace('bg-', 'text-')}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  // Widget component
  const DashboardWidget: React.FC<{
    config: WidgetConfig;
    children: React.ReactNode;
  }> = ({ config, children }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`
        bg-white rounded-xl shadow-sm border border-gray-100 p-6
        ${config.size === 'small' ? 'col-span-1' : 
          config.size === 'medium' ? 'col-span-2' : 'col-span-3'}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
        <div className="flex items-center space-x-2">
          {realTimeEnabled && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500">Live</span>
            </div>
          )}
        </div>
      </div>
      {children}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Controls */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="7d">Siste 7 dager</option>
            <option value="30d">Siste 30 dager</option>
            <option value="90d">Siste 90 dager</option>
          </select>
          <button
            onClick={() => setRealTimeEnabled(!realTimeEnabled)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              realTimeEnabled
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Real-time {realTimeEnabled ? 'På' : 'Av'}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Score"
          value={`${dashboardData?.userProgress?.accuracy || 0}%`}
          change={5.2}
          icon="📊"
          color="bg-blue-500"
        />
        <MetricCard
          title="Spørsmål besvart"
          value={dashboardData?.userProgress?.totalQuestions || 0}
          change={12}
          icon="❓"
          color="bg-green-500"
        />
        <MetricCard
          title="Riktige svar"
          value={dashboardData?.userProgress?.correctAnswers || 0}
          change={8}
          icon="✅"
          color="bg-yellow-500"
        />
        <MetricCard
          title="Læringsstreak"
          value="7 dager"
          change={-2}
          icon="🔥"
          color="bg-red-500"
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Chart */}
        <DashboardWidget
          config={{
            id: 'progress-chart',
            title: 'Fremgang over tid',
            type: 'chart',
            size: 'large'
          }}
        >
          <div className="h-80">
            {progressChartData && (
              <Line 
                data={progressChartData} 
                options={{
                  ...chartOptions,
                  scales: {
                    ...chartOptions.scales,
                    y1: {
                      type: 'linear',
                      display: true,
                      position: 'right',
                      grid: {
                        drawOnChartArea: false
                      },
                      ticks: {
                        color: '#6B7280'
                      }
                    }
                  }
                }} 
              />
            )}
          </div>
        </DashboardWidget>

        {/* Skill Radar */}
        <DashboardWidget
          config={{
            id: 'skill-radar',
            title: 'Ferdighetsfordeling',
            type: 'chart',
            size: 'medium'
          }}
        >
          <div className="h-80">
            <Radar 
              data={skillRadarData} 
              options={{
                ...chartOptions,
                scales: {
                  r: {
                    angleLines: {
                      color: 'rgba(156, 163, 175, 0.3)'
                    },
                    grid: {
                      color: 'rgba(156, 163, 175, 0.3)'
                    },
                    pointLabels: {
                      color: '#374151',
                      font: {
                        size: 11
                      }
                    },
                    ticks: {
                      display: false
                    },
                    min: 0,
                    max: 100
                  }
                }
              }} 
            />
          </div>
        </DashboardWidget>

        {/* Recent Activity */}
        <DashboardWidget
          config={{
            id: 'recent-activity',
            title: 'Siste aktivitet',
            type: 'table',
            size: 'medium'
          }}
        >
          <div className="space-y-3 max-h-80 overflow-y-auto">
            <AnimatePresence>
              {dashboardData?.activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString('no-NO')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </DashboardWidget>
      </div>

      {/* Notifications */}
      {dashboardData?.notifications && dashboardData.notifications.length > 0 && (
        <DashboardWidget
          config={{
            id: 'notifications',
            title: 'Varsler',
            type: 'table',
            size: 'large'
          }}
        >
          <div className="space-y-3">
            {dashboardData.notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-l-4 ${
                  notification.type === 'SUCCESS' 
                    ? 'bg-green-50 border-green-400' 
                    : 'bg-blue-50 border-blue-400'
                }`}
              >
                <h4 className="font-medium text-gray-900">{notification.tittel}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(notification.opprettet).toLocaleString('no-NO')}
                </p>
              </motion.div>
            ))}
          </div>
        </DashboardWidget>
      )}
    </div>
  );
};

export default AdvancedDashboard;