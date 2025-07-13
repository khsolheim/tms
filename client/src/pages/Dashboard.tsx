import React, { useState, useEffect } from 'react';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { MetricsCard } from '@/components/dashboard/MetricsCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardData {
  metrics: {
    bedrifter: { value: number; change: number };
    elever: { value: number; change: number };
    kontrakter: { value: number; change: number };
    oppgaver: { value: number; change: number };
  };
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }>;
  widgets: Array<{
    id: string;
    type: string;
    title: string;
    config: any;
    position: { x: number; y: number };
    size: { width: number; height: number };
  }>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulerer API-kall med mock-data
        const mockData: DashboardData = {
          metrics: {
            bedrifter: { value: 45, change: 12 },
            elever: { value: 234, change: 8 },
            kontrakter: { value: 67, change: -3 },
            oppgaver: { value: 89, change: 15 }
          },
          recentActivity: [
            {
              id: '1',
              type: 'task',
              message: 'Ny oppgave opprettet: Sikkerhetskontroll Bedrift AS',
              timestamp: new Date().toISOString()
            },
            {
              id: '2',
              type: 'user',
              message: 'Ny elev registrert: Ola Nordmann',
              timestamp: new Date(Date.now() - 3600000).toISOString()
            },
            {
              id: '3',
              type: 'contract',
              message: 'Kontrakt signert: Bedrift XYZ',
              timestamp: new Date(Date.now() - 7200000).toISOString()
            }
          ],
          widgets: [
            {
              id: '1',
              type: 'chart',
              title: 'Aktiviteter denne måneden',
              config: { type: 'bar', data: [] },
              position: { x: 0, y: 0 },
              size: { width: 400, height: 300 }
            }
          ]
        };
        
        setDashboardData(mockData);
      } catch (error) {
        console.error('Feil ved henting av dashboard-data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laster dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Kunne ikke laste dashboard-data</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Prøv igjen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Velkommen tilbake, {user?.name || 'Bruker'}!
        </h1>
        <QuickActions />
      </div>

      {/* Nøkkeltall */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard config={{ type: 'bedrifter', ...dashboardData.metrics.bedrifter, period: 'denne måneden' }} />
        <MetricsCard config={{ type: 'elever', ...dashboardData.metrics.elever, period: 'denne måneden' }} />
        <MetricsCard config={{ type: 'kontrakter', ...dashboardData.metrics.kontrakter, period: 'denne måneden' }} />
        <MetricsCard config={{ type: 'oppgaver', ...dashboardData.metrics.oppgaver, period: 'denne måneden' }} />
      </div>

      {/* Widgets og aktiviteter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widgets */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard Widgets</h2>
            <div className="relative min-h-[400px] bg-gray-50 rounded-lg p-4">
              {dashboardData.widgets.map((widget) => (
                <DashboardWidget
                  key={widget.id}
                  type={widget.type as any}
                  title={widget.title}
                  config={widget.config}
                  position={widget.position}
                  size={widget.size}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Aktivitetsfeed */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <ActivityFeed activities={dashboardData.recentActivity} />
          </div>
        </div>
      </div>
    </div>
  );
} 