import React, { useState } from 'react';
import { 
  CogIcon,
  ShieldCheckIcon,
  KeyIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { SecuritySettings as SecuritySettingsType } from '../../../types/admin';

interface SecuritySettingsProps {
  settings?: SecuritySettingsType;
  loading?: boolean;
  onUpdateSettings?: (settings: SecuritySettingsType) => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ 
  settings, 
  loading = false,
  onUpdateSettings 
}) => {
  const [localSettings, setLocalSettings] = useState<SecuritySettingsType>(
    settings || {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90,
        preventReuse: 5
      },
      sessionSettings: {
        timeout: 30,
        maxConcurrentSessions: 3,
        requireReauth: true,
        maxDuration: 480,
        idleTimeout: 30
      },
      twoFactorAuth: {
        enabled: true,
        required: false,
        methods: ['totp', 'sms']
      },
      ipSecurity: {
        whitelist: [],
        blacklist: [],
        enabled: true
      },
      rateLimiting: {
        enabled: true,
        maxRequests: 100,
        windowMinutes: 15
      },
      auditLogging: {
        enabled: true,
        retention: 365,
        logFailedAttempts: true
      },
      auditSettings: {
        logLevel: 'basic',
        retentionDays: 365,
        realTimeAlerts: true,
        exportEnabled: true
      }
    }
  );

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('password');

  const handleSave = async () => {
    setSaving(true);
    try {
      if (onUpdateSettings) {
        await onUpdateSettings(localSettings);
      }
      // Show success message
      alert('Sikkerhetsinnstillinger oppdatert');
    } catch (error) {
      alert('Feil ved oppdatering av innstillinger');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category: keyof SecuritySettingsType, key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: 'password', name: 'Passord Policy', icon: KeyIcon },
    { id: 'session', name: 'Sesjon', icon: LockClosedIcon },
    { id: 'twofa', name: '2FA', icon: ShieldCheckIcon },
    { id: 'ip', name: 'IP Sikkerhet', icon: CogIcon },
    { id: 'rate', name: 'Rate Limiting', icon: LockClosedIcon },
    { id: 'audit', name: 'Audit', icon: ExclamationTriangleIcon }
  ];

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Sikkerhetsinnstillinger</h3>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200">
          <nav className="space-y-1 p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {activeTab === 'password' && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Passord Policy</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Min lengde</label>
                  <input
                    type="number"
                    value={localSettings.passwordPolicy.minLength}
                    onChange={(e) => updateSetting('passwordPolicy', 'minLength', parseInt(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max alder (dager)</label>
                  <input
                    type="number"
                    value={localSettings.passwordPolicy.maxAge}
                    onChange={(e) => updateSetting('passwordPolicy', 'maxAge', parseInt(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'requireUppercase', label: 'Krev store bokstaver' },
                  { key: 'requireLowercase', label: 'Krev små bokstaver' },
                  { key: 'requireNumbers', label: 'Krev tall' },
                  { key: 'requireSpecialChars', label: 'Krev spesialtegn' }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localSettings.passwordPolicy[key as keyof typeof localSettings.passwordPolicy] as boolean}
                      onChange={(e) => updateSetting('passwordPolicy', key, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'session' && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Sesjonsinnstillinger</h4>
              
                             <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700">Max sesjonslengde (minutter)</label>
                   <input
                     type="number"
                     value={localSettings.sessionSettings.maxDuration || 480}
                     onChange={(e) => updateSetting('sessionSettings', 'maxDuration', parseInt(e.target.value))}
                     className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                   />
                 </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Idle timeout (minutter)</label>
                  <input
                    type="number"
                    value={localSettings.sessionSettings.idleTimeout}
                    onChange={(e) => updateSetting('sessionSettings', 'idleTimeout', parseInt(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max samtidige sesjoner</label>
                  <input
                    type="number"
                    value={localSettings.sessionSettings.maxConcurrentSessions}
                    onChange={(e) => updateSetting('sessionSettings', 'maxConcurrentSessions', parseInt(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.sessionSettings.requireReauth}
                  onChange={(e) => updateSetting('sessionSettings', 'requireReauth', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Krev re-autentisering for sensitive operasjoner</span>
              </label>
            </div>
          )}

          {activeTab === 'twofa' && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">To-faktor autentisering</h4>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localSettings.twoFactorAuth.enabled}
                    onChange={(e) => updateSetting('twoFactorAuth', 'enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Aktiver 2FA</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localSettings.twoFactorAuth.required}
                    onChange={(e) => updateSetting('twoFactorAuth', 'required', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Krev 2FA for alle brukere</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tillatte metoder</label>
                <div className="space-y-2">
                  {[
                    { key: 'totp', label: 'TOTP (Google Authenticator, etc.)' },
                    { key: 'sms', label: 'SMS' },
                    { key: 'email', label: 'E-post' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localSettings.twoFactorAuth.methods.includes(key)}
                        onChange={(e) => {
                          const methods = e.target.checked
                            ? [...localSettings.twoFactorAuth.methods, key]
                            : localSettings.twoFactorAuth.methods.filter(m => m !== key);
                          updateSetting('twoFactorAuth', 'methods', methods);
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

                     {activeTab === 'ip' && (
             <div className="space-y-4">
               <h4 className="text-lg font-medium text-gray-900">IP Sikkerhet</h4>
               
               <label className="flex items-center">
                 <input
                   type="checkbox"
                   checked={localSettings.ipSecurity.enabled}
                   onChange={(e) => updateSetting('ipSecurity', 'enabled', e.target.checked)}
                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                 />
                 <span className="ml-2 text-sm text-gray-700">Aktiver IP sikkerhet</span>
               </label>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Tillatte IP-adresser (en per linje)</label>
                 <textarea
                   value={localSettings.ipSecurity.whitelist.join('\n')}
                   onChange={(e) => updateSetting('ipSecurity', 'whitelist', e.target.value.split('\n').filter(ip => ip.trim()))}
                   className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                   rows={4}
                   placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Blokkerte IP-adresser (en per linje)</label>
                 <textarea
                   value={localSettings.ipSecurity.blacklist.join('\n')}
                   onChange={(e) => updateSetting('ipSecurity', 'blacklist', e.target.value.split('\n').filter(ip => ip.trim()))}
                   className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                   rows={4}
                   placeholder="192.168.1.100&#10;10.0.0.50"
                 />
               </div>
             </div>
           )}

                     {activeTab === 'rate' && (
             <div className="space-y-4">
               <h4 className="text-lg font-medium text-gray-900">Rate Limiting</h4>
               
               <label className="flex items-center">
                 <input
                   type="checkbox"
                   checked={localSettings.rateLimiting.enabled}
                   onChange={(e) => updateSetting('rateLimiting', 'enabled', e.target.checked)}
                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                 />
                 <span className="ml-2 text-sm text-gray-700">Aktiver rate limiting</span>
               </label>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700">Max forespørsler</label>
                   <input
                     type="number"
                     value={localSettings.rateLimiting.maxRequests}
                     onChange={(e) => updateSetting('rateLimiting', 'maxRequests', parseInt(e.target.value))}
                     className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700">Tidsvindu (minutter)</label>
                   <input
                     type="number"
                     value={localSettings.rateLimiting.windowMinutes}
                     onChange={(e) => updateSetting('rateLimiting', 'windowMinutes', parseInt(e.target.value))}
                     className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                   />
                 </div>
               </div>
             </div>
           )}

          {activeTab === 'audit' && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Audit-innstillinger</h4>
              
                             <div>
                 <label className="block text-sm font-medium text-gray-700">Oppbevaringstid (dager)</label>
                 <input
                   type="number"
                   value={localSettings.auditSettings?.retentionDays || 365}
                   onChange={(e) => updateSetting('auditSettings', 'retentionDays', parseInt(e.target.value))}
                   className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700">Log nivå</label>
                 <select
                   value={localSettings.auditSettings?.logLevel || 'basic'}
                   onChange={(e) => updateSetting('auditSettings', 'logLevel', e.target.value)}
                   className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                 >
                   <option value="basic">Grunnleggende</option>
                   <option value="detailed">Detaljert</option>
                   <option value="verbose">Utførlig</option>
                 </select>
               </div>

               <div className="space-y-3">
                 {[
                   { key: 'realTimeAlerts', label: 'Sanntids varsler' },
                   { key: 'exportEnabled', label: 'Aktiver eksport av logger' }
                 ].map(({ key, label }) => (
                   <label key={key} className="flex items-center">
                     <input
                       type="checkbox"
                       checked={localSettings.auditSettings?.[key as keyof typeof localSettings.auditSettings] as boolean || false}
                       onChange={(e) => updateSetting('auditSettings', key, e.target.checked)}
                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                     />
                     <span className="ml-2 text-sm text-gray-700">{label}</span>
                   </label>
                 ))}
               </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setLocalSettings(settings || localSettings)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Tilbakestill
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? 'Lagrer...' : 'Lagre innstillinger'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 