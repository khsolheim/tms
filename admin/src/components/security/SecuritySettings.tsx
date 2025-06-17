import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  KeyIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CogIcon,
  LockClosedIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../../hooks/useApi';
import { securityService } from '../../services/security';
import { SecuritySettings as SecuritySettingsType } from '../../types/admin';

export const SecuritySettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'password' | 'session' | 'ip' | 'rate' | 'twofa' | 'audit'>('password');
  const [saving, setSaving] = useState(false);

  // Fetch security settings
  const {
    data: settings,
    loading,
    error,
    refresh
  } = useApi(
    () => securityService.getSecuritySettings(),
    { immediate: true }
  );

  const [formData, setFormData] = useState<Partial<SecuritySettingsType>>({});

  React.useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await securityService.updateSecuritySettings(formData);
      refresh();
      alert('Sikkerhetsinnstillinger oppdatert');
    } catch (error: any) {
      alert(`Feil ved lagring: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const updatePasswordPolicy = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      passwordPolicy: {
        ...(prev.passwordPolicy || {}),
        [field]: value
      } as SecuritySettingsType['passwordPolicy']
    }));
  };

  const updateSessionSettings = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      sessionSettings: {
        ...(prev.sessionSettings || {}),
        [field]: value
      } as SecuritySettingsType['sessionSettings']
    }));
  };

  const updateIpSecurity = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      ipSecurity: {
        ...(prev.ipSecurity || {}),
        [field]: value
      } as SecuritySettingsType['ipSecurity']
    }));
  };

  const updateRateLimiting = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      rateLimiting: {
        ...(prev.rateLimiting || {}),
        [field]: value
      } as SecuritySettingsType['rateLimiting']
    }));
  };

  const updateTwoFactorAuth = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      twoFactorAuth: {
        ...(prev.twoFactorAuth || {}),
        [field]: value
      } as SecuritySettingsType['twoFactorAuth']
    }));
  };

  const updateAuditLogging = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      auditLogging: {
        ...(prev.auditLogging || {}),
        [field]: value
      } as SecuritySettingsType['auditLogging']
    }));
  };

  const tabs = [
    { id: 'password', name: 'Passord', icon: KeyIcon },
    { id: 'session', name: 'Sesjoner', icon: ClockIcon },
    { id: 'ip', name: 'IP-sikkerhet', icon: ShieldCheckIcon },
    { id: 'rate', name: 'Rate Limiting', icon: CogIcon },
    { id: 'twofa', name: '2FA', icon: LockClosedIcon },
    { id: 'audit', name: 'Revisjon', icon: ExclamationTriangleIcon }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Laster sikkerhetsinnstillinger...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Feil ved lasting</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <div className="mt-6">
          <button
            onClick={refresh}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Prøv igjen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Sikkerhetsinnstillinger</h2>
          <p className="mt-1 text-sm text-gray-500">
            Konfigurer sikkerhetspolicyer og innstillinger for systemet
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? (
            <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircleIcon className="w-4 h-4 mr-2" />
          )}
          Lagre Endringer
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg">
        {activeTab === 'password' && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Passordpolicyer</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Minimum passordlengde
                </label>
                <input
                  type="number"
                  value={formData.passwordPolicy?.minLength || 8}
                  onChange={(e) => updatePasswordPolicy('minLength', parseInt(e.target.value))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  min="6"
                  max="32"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Passord utløpstid (dager)
                </label>
                <input
                  type="number"
                  value={formData.passwordPolicy?.maxAge || 90}
                  onChange={(e) => updatePasswordPolicy('maxAge', parseInt(e.target.value))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  min="30"
                  max="365"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Passordhistorikk (antall)
                </label>
                <input
                  type="number"
                  value={formData.passwordPolicy?.preventReuse || 5}
                  onChange={(e) => updatePasswordPolicy('preventReuse', parseInt(e.target.value))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="24"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.passwordPolicy?.requireUppercase || false}
                  onChange={(e) => updatePasswordPolicy('requireUppercase', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Krev store bokstaver
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.passwordPolicy?.requireLowercase || false}
                  onChange={(e) => updatePasswordPolicy('requireLowercase', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Krev små bokstaver
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.passwordPolicy?.requireNumbers || false}
                  onChange={(e) => updatePasswordPolicy('requireNumbers', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Krev tall
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.passwordPolicy?.requireSpecialChars || false}
                  onChange={(e) => updatePasswordPolicy('requireSpecialChars', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Krev spesialtegn
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'session' && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Sesjonsinnstillinger</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sesjonstimeout (minutter)
                </label>
                <input
                  type="number"
                  value={formData.sessionSettings?.timeout || 30}
                  onChange={(e) => updateSessionSettings('timeout', parseInt(e.target.value))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  min="5"
                  max="480"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maksimalt antall samtidige sesjoner
                </label>
                <input
                  type="number"
                  value={formData.sessionSettings?.maxConcurrentSessions || 3}
                  onChange={(e) => updateSessionSettings('maxConcurrentSessions', parseInt(e.target.value))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="10"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.sessionSettings?.requireReauth || false}
                  onChange={(e) => updateSessionSettings('requireReauth', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Krev re-autentisering for sensitive operasjoner
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.sessionSettings?.rememberMe || false}
                  onChange={(e) => updateSessionSettings('rememberMe', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Tillat "Husk meg" funksjonalitet
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ip' && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">IP-sikkerhet</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maksimalt antall mislykkede forsøk
                </label>
                <input
                  type="number"
                  value={formData.ipSecurity?.maxFailedAttempts || 5}
                  onChange={(e) => updateIpSecurity('maxFailedAttempts', parseInt(e.target.value))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Blokkeringsvarighet (minutter)
                </label>
                <input
                  type="number"
                  value={formData.ipSecurity?.blockDuration || 30}
                  onChange={(e) => updateIpSecurity('blockDuration', parseInt(e.target.value))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  min="5"
                  max="1440"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.ipSecurity?.enableWhitelist || false}
                  onChange={(e) => updateIpSecurity('enableWhitelist', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Aktiver IP-hvitelisting
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.ipSecurity?.enableBlacklist || false}
                  onChange={(e) => updateIpSecurity('enableBlacklist', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Aktiver IP-svartelisting
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.ipSecurity?.autoBlockSuspicious || false}
                  onChange={(e) => updateIpSecurity('autoBlockSuspicious', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Automatisk blokkering av mistenkelige IP-er
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'twofa' && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Tofaktorautentisering</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.twoFactorAuth?.required || false}
                  onChange={(e) => updateTwoFactorAuth('required', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Påkrev tofaktorautentisering for alle brukere
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.twoFactorAuth?.backupCodes || false}
                  onChange={(e) => updateTwoFactorAuth('backupCodes', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Tillat backup-koder
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tillatte metoder
              </label>
              <div className="space-y-2">
                {['sms', 'email', 'app'].map((method) => (
                  <div key={method} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.twoFactorAuth?.methods?.includes(method as any) || false}
                      onChange={(e) => {
                        const currentMethods = formData.twoFactorAuth?.methods || [];
                        const newMethods = e.target.checked
                          ? [...currentMethods, method]
                          : currentMethods.filter(m => m !== method);
                        updateTwoFactorAuth('methods', newMethods);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900 capitalize">
                      {method === 'sms' ? 'SMS' : method === 'email' ? 'E-post' : 'Autentiseringsapp'}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Revisjonsinnstillinger</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Loggoppbevaringstid (dager)
                </label>
                <input
                  type="number"
                  value={formData.auditLogging?.retentionDays || 365}
                  onChange={(e) => updateAuditLogging('retentionDays', parseInt(e.target.value))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  min="30"
                  max="2555"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Loggnivå
                </label>
                <select
                  value={formData.auditLogging?.logLevel || 'basic'}
                  onChange={(e) => updateAuditLogging('logLevel', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="basic">Grunnleggende</option>
                  <option value="detailed">Detaljert</option>
                  <option value="verbose">Utførlig</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.auditLogging?.enabled || false}
                  onChange={(e) => updateAuditLogging('enabled', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Aktiver revisjonslogging
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 