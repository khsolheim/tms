import React, { useState } from 'react';
import { 
  ShieldCheckIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CogIcon,
  EyeIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { AccessControl } from '../../components/security/AccessControl';
import { AuditLogs } from '../../components/security/AuditLogs';
import { ThreatMonitoring } from '../../components/security/ThreatMonitoring';
import { SecuritySettings } from '../../components/security/SecuritySettings';
import { useApi } from '../../hooks/useApi';
import { securityService } from '../../services/security';

type SecurityTab = 'access-control' | 'audit-logs' | 'threat-monitoring' | 'settings';

const SecurityPage = () => {
  const [activeTab, setActiveTab] = useState<SecurityTab>('access-control');

  // Fetch security overview data
  const {
    data: securityOverview,
    loading: overviewLoading,
    refresh: refreshOverview
  } = useApi(
    () => securityService.getSecurityReport('7d'),
    { immediate: true }
  );

  const tabs = [
    {
      id: 'access-control' as SecurityTab,
      name: 'Tilgangskontroll',
      icon: UserGroupIcon,
      description: 'Administrer bruker tilganger og roller',
      count: securityOverview?.data?.totalUsers || 0
    },
    {
      id: 'audit-logs' as SecurityTab,
      name: 'Audit Logs',
      icon: DocumentTextIcon,
      description: 'Sikkerhetslogs og aktivitet',
      count: securityOverview?.data?.auditLogsToday || 0
    },
    {
      id: 'threat-monitoring' as SecurityTab,
      name: 'Trusselovervåking',
      icon: ExclamationTriangleIcon,
      description: 'Sikkerhetstrusler og blokkering',
      count: securityOverview?.data?.activeThreats || 0
    },
    {
      id: 'settings' as SecurityTab,
      name: 'Innstillinger',
      icon: CogIcon,
      description: 'Sikkerhetskonfigurasjon',
      count: 0
    }
  ];

  const getSecurityScore = () => {
    if (!securityOverview?.data) return 85;
    
    const { 
      passwordCompliance = 90,
      twoFactorAdoption = 75,
      threatsMitigated = 95,
      auditCompliance = 88
    } = securityOverview.data;
    
    return Math.round((passwordCompliance + twoFactorAdoption + threatsMitigated + auditCompliance) / 4);
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'access-control':
        return <AccessControl />;
      case 'audit-logs':
        return <AuditLogs />;
      case 'threat-monitoring':
        return <ThreatMonitoring />;
      case 'settings':
        return <SecuritySettings />;
      default:
        return <AccessControl />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sikkerhet</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administrer systemsikkerhet og tilgangskontroll
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">Sikkerhetsscore</div>
            <div className={`text-2xl font-bold ${getSecurityScoreColor(getSecurityScore())}`}>
              {getSecurityScore()}%
            </div>
          </div>
          <div className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full">
            <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <LockClosedIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Aktive Brukere
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {overviewLoading ? '...' : securityOverview?.data?.activeUsers || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium">
                {overviewLoading ? '...' : securityOverview?.data?.newUsersToday || 0}
              </span>
              <span className="text-gray-500"> nye i dag</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Sikkerhetstrusler
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {overviewLoading ? '...' : securityOverview?.data?.activeThreats || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-red-600 font-medium">
                {overviewLoading ? '...' : securityOverview?.data?.threatsToday || 0}
              </span>
              <span className="text-gray-500"> i dag</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Audit Events
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {overviewLoading ? '...' : securityOverview?.data?.auditEventsToday || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-blue-600 font-medium">
                {overviewLoading ? '...' : securityOverview?.data?.criticalEvents || 0}
              </span>
              <span className="text-gray-500"> kritiske</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EyeIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    2FA Aktivering
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {overviewLoading ? '...' : `${securityOverview?.data?.twoFactorAdoption || 0}%`}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium">
                +{overviewLoading ? '...' : securityOverview?.data?.twoFactorGrowth || 0}%
              </span>
              <span className="text-gray-500"> denne uken</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon
                    className={`-ml-0.5 mr-2 h-5 w-5 ${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  <span>{tab.name}</span>
                  {tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium ${
                      isActive 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}; export default SecurityPage;
