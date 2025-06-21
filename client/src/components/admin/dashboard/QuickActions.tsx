import React, { useState } from 'react';
import { 
  ArrowPathIcon,
  TrashIcon,
  WrenchIcon,
  PauseIcon,
  PlayIcon,
  DocumentArrowDownIcon,
  ShieldCheckIcon,
  ServerIcon
} from '@heroicons/react/24/outline';
import { dashboardService } from '../../services/dashboard';

interface QuickActionsProps {
  onRefresh?: () => void;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => Promise<void>;
  dangerous?: boolean;
  confirmMessage?: string;
  disabled?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onRefresh }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const executeAction = async (action: QuickAction) => {
    if (action.confirmMessage && !window.confirm(action.confirmMessage)) {
      return;
    }

    setLoading(action.id);
    try {
      await action.action();
      onRefresh?.();
      
      // Show success notification
      // TODO: Implement notification system
      console.log(`Action ${action.title} completed successfully`);
    } catch (error: any) {
      console.error(`Action ${action.title} failed:`, error);
      alert(`Feil: ${error.message || 'Ukjent feil'}`);
    } finally {
      setLoading(null);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'restart-services',
      title: 'Restart Tjenester',
      description: 'Restart alle mikrotjenester',
      icon: <ArrowPathIcon className="w-5 h-5" />,
      action: async () => {
        await dashboardService.restartService('all');
      },
      dangerous: true,
      confirmMessage: 'Er du sikker på at du vil restarte alle tjenester? Dette kan påvirke aktive brukere.'
    },
    {
      id: 'clear-cache',
      title: 'Tøm Cache',
      description: 'Tøm all system cache',
      icon: <TrashIcon className="w-5 h-5" />,
      action: async () => {
        await dashboardService.clearCache('all');
      },
      confirmMessage: 'Er du sikker på at du vil tømme all cache?'
    },
    {
      id: 'maintenance-mode',
      title: maintenanceMode ? 'Deaktiver Vedlikehold' : 'Aktiver Vedlikehold',
      description: maintenanceMode ? 'Deaktiver vedlikeholdsmodus' : 'Aktiver vedlikeholdsmodus',
      icon: maintenanceMode ? <PlayIcon className="w-5 h-5" /> : <PauseIcon className="w-5 h-5" />,
      action: async () => {
        if (maintenanceMode) {
          await dashboardService.disableMaintenanceMode();
          setMaintenanceMode(false);
        } else {
          await dashboardService.enableMaintenanceMode();
          setMaintenanceMode(true);
        }
      },
      dangerous: !maintenanceMode,
      confirmMessage: maintenanceMode 
        ? 'Er du sikker på at du vil deaktivere vedlikeholdsmodus?'
        : 'Er du sikker på at du vil aktivere vedlikeholdsmodus? Dette vil blokkere tilgang for alle brukere.'
    },
    {
      id: 'system-report',
      title: 'Generer Rapport',
      description: 'Last ned systemrapport',
      icon: <DocumentArrowDownIcon className="w-5 h-5" />,
      action: async () => {
        const response = await dashboardService.exportSystemReport('pdf');
        // TODO: Handle file download
        console.log('System report generated:', response);
      }
    },
    {
      id: 'security-scan',
      title: 'Sikkerhetsskanning',
      description: 'Kjør sikkerhetsskanning',
      icon: <ShieldCheckIcon className="w-5 h-5" />,
      action: async () => {
        // TODO: Implement security scan
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    },
    {
      id: 'optimize-database',
      title: 'Optimaliser Database',
      description: 'Kjør database optimalisering',
      icon: <WrenchIcon className="w-5 h-5" />,
      action: async () => {
        // TODO: Implement database optimization
        await new Promise(resolve => setTimeout(resolve, 3000));
      },
      confirmMessage: 'Er du sikker på at du vil optimalisere databasen? Dette kan ta noen minutter.'
    }
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Hurtighandlinger</h3>
        <p className="mt-1 text-sm text-gray-500">
          Vanlige administrative oppgaver
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => executeAction(action)}
              disabled={loading === action.id || action.disabled}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                action.dangerous
                  ? 'border-red-200 bg-red-50 hover:bg-red-100 text-red-700'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
              } ${
                loading === action.id || action.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`flex-shrink-0 ${
                  loading === action.id ? 'animate-spin' : ''
                }`}>
                  {loading === action.id ? (
                    <ArrowPathIcon className="w-5 h-5" />
                  ) : (
                    action.icon
                  )}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">
                    {action.title}
                  </div>
                  <div className="text-xs opacity-75">
                    {action.description}
                  </div>
                </div>
              </div>
              
              {loading === action.id && (
                <div className="text-xs">
                  Utfører...
                </div>
              )}
            </button>
          ))}
        </div>

        {/* System Status Indicators */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">System Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Vedlikeholdsmodus</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                maintenanceMode 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {maintenanceMode ? 'Aktivert' : 'Deaktivert'}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Backup Status</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Oppdatert
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Siste Restart</span>
              <span className="text-gray-500 text-xs">
                {new Date().toLocaleDateString('nb-NO')} 02:00
              </span>
            </div>
          </div>
        </div>

        {/* Emergency Actions */}
        <div className="mt-6 pt-6 border-t border-red-200">
          <h4 className="text-sm font-medium text-red-900 mb-3">Nødhandlinger</h4>
          <div className="space-y-2">
            <button
              onClick={() => executeAction({
                id: 'emergency-shutdown',
                title: 'Nødstopp',
                description: 'Stopp alle tjenester umiddelbart',
                icon: <ServerIcon className="w-5 h-5" />,
                action: async () => {
                  // TODO: Implement emergency shutdown
                  await new Promise(resolve => setTimeout(resolve, 1000));
                },
                dangerous: true,
                confirmMessage: 'ADVARSEL: Dette vil stoppe alle tjenester umiddelbart og kan føre til datatap. Er du sikker?'
              })}
              disabled={loading !== null}
              className="w-full flex items-center justify-center p-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ServerIcon className="w-4 h-4 mr-2" />
              Nødstopp System
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 