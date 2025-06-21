/**
 * Regnskapsintegrasjon Innstillinger
 * 
 * Konfigurasjon av integrasjon med eksterne regnskapssystemer
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FiSettings, 
  FiCheck, 
  FiX, 
  FiRefreshCw, 
  FiAlertTriangle,
  FiServer
} from 'react-icons/fi';
import { 
  RegnskapsKonfigurasjon, 
  RegnskapsService,
  validerRegnskapsKonfigurasjon
} from '../../services/RegnskapsIntegrasjon';
import { Button } from '../../design-system/components/Button';
import { LoadingButton } from '../../components/ui/LoadingStates';
import { useTranslation } from '../../contexts/I18nContext';
import { logger } from '../../utils/logger';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const regnskapsSchema = z.object({
  system: z.enum(['TRIPLETEX', 'POWEROFFICE', 'FIKEN', 'CUSTOM'], {
    required_error: 'Regnskapssystem må velges'
  }),
  apiUrl: z.string().url('Ugyldig API URL'),
  apiKey: z.string().min(1, 'API-nøkkel er påkrevd'),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  autoSyncEnabled: z.boolean().default(false),
  syncInterval: z.number().min(5, 'Minimum 5 minutter').default(30),
  defaultMvaKode: z.string().default('25'),
  standardKontoer: z.object({
    salg: z.string().min(1, 'Salgskonto er påkrevd'),
    mva: z.string().min(1, 'MVA-konto er påkrevd'),
    kunde: z.string().min(1, 'Kundekonto er påkrevd'),
    bank: z.string().min(1, 'Bankkonto er påkrevd')
  })
});

type RegnskapsFormData = z.infer<typeof regnskapsSchema>;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const RegnskapsIntegrasjon: React.FC = () => {
  const { t } = useTranslation(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'UNKNOWN' | 'SUCCESS' | 'ERROR'>('UNKNOWN');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [savedKonfigurasjon, setSavedKonfigurasjon] = useState<RegnskapsKonfigurasjon | null>(null);
  const [selectedSystem, setSelectedSystem] = useState('TRIPLETEX');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<RegnskapsFormData>({
    resolver: zodResolver(regnskapsSchema),
    defaultValues: {
      system: 'TRIPLETEX',
      autoSyncEnabled: false,
      syncInterval: 30,
      defaultMvaKode: '25',
      standardKontoer: {
        salg: '3000',
        mva: '2700',
        kunde: '1500',
        bank: '1920'
      }
    }
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    lastEksisterendeKonfigurasjon();
  }, []);

  useEffect(() => {
    // Oppdater standard URLs basert på valgt system
    const standardUrls: Record<string, string> = {
      TRIPLETEX: 'https://tripletex.no/v2',
      POWEROFFICE: 'https://api.poweroffice.net',
      FIKEN: 'https://api.fiken.no/api/v2',
      CUSTOM: ''
    };

    setValue('apiUrl', standardUrls[selectedSystem] || '');
  }, [selectedSystem, setValue]);

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  const lastEksisterendeKonfigurasjon = async () => {
    try {
      // Implementer henting av eksisterende konfigurasjon fra backend
      // const konfigurasjon = await api.get('/api/regnskaps-integrasjon/konfigurasjon');
      // if (konfigurasjon.data) {
      //   setSavedKonfigurasjon(konfigurasjon.data);
      //   Object.entries(konfigurasjon.data).forEach(([key, value]) => {
      //     setValue(key as keyof RegnskapsFormData, value);
      //   });
      // }
    } catch (error) {
      logger.error('Feil ved lasting av regnskapskonfigurasjon', error);
    }
  };

  const lagreKonfigurasjon = async (data: RegnskapsFormData) => {
    setLoading(true);
    try {
      // Valider konfigurasjon
      const valideringsfeil = validerRegnskapsKonfigurasjon(data);
      if (valideringsfeil.length > 0) {
        throw new Error(valideringsfeil.join(', '));
      }

      // Lagre konfigurasjon til backend
      // await api.post('/api/regnskaps-integrasjon/konfigurasjon', data);
      
      setSavedKonfigurasjon(data as RegnskapsKonfigurasjon);
      logger.info('Regnskapskonfigurasjon lagret', { system: data.system });
      
      // Test forbindelse etter lagring
      await testForbindelse();
    } catch (error) {
      logger.error('Feil ved lagring av regnskapskonfigurasjon', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const testForbindelse = async () => {
    if (!savedKonfigurasjon) {
      setConnectionStatus('ERROR');
      return;
    }

    setTestingConnection(true);
    try {
      const service = new RegnskapsService(savedKonfigurasjon);
      const success = await service.testForbindelse();
      setConnectionStatus(success ? 'SUCCESS' : 'ERROR');
    } catch (error) {
      logger.error('Feil ved testing av regnskapsforbindelse', error);
      setConnectionStatus('ERROR');
    } finally {
      setTestingConnection(false);
    }
  };

  const startManuellSync = async () => {
    if (!savedKonfigurasjon) return;

    try {
      // Implementer manuell synkronisering
      // await api.post('/api/regnskaps-integrasjon/sync');
      setLastSync(new Date());
      logger.info('Manuell synkronisering startet');
    } catch (error) {
      logger.error('Feil ved manuell synkronisering', error);
    }
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getSystemDisplayName = (system: string): string => {
    const names: Record<string, string> = {
      TRIPLETEX: 'Tripletex',
      POWEROFFICE: 'PowerOffice Go',
      FIKEN: 'Fiken',
      CUSTOM: 'Tilpasset system'
    };
    return names[system] || system;
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'SUCCESS':
        return <FiCheck className="text-green-500" />;
      case 'ERROR':
        return <FiX className="text-red-500" />;
      default:
        return <FiAlertTriangle className="text-yellow-500" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'SUCCESS':
        return 'Forbindelse OK';
      case 'ERROR':
        return 'Forbindelse feilet';
      default:
        return 'Ukjent status';
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="max-w-4xl mx-auto py-1 px-2 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          <FiServer className="mr-3" />
          Regnskapsintegrasjon
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Konfigurer integrasjon med eksterne regnskapssystemer for automatisk synkronisering av fakturaer og kunder.
        </p>
      </div>

      {/* Connection Status */}
      {savedKonfigurasjon && (
        <div className="bg-white shadow rounded-lg px-2 py-1 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getConnectionStatusIcon()}
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">
                  {getSystemDisplayName(savedKonfigurasjon.system)}
                </h3>
                <p className="text-sm text-gray-500">{getConnectionStatusText()}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <LoadingButton
                onClick={testForbindelse}
                loading={testingConnection}
                variant="secondary"
                size="sm"
              >
                <FiRefreshCw className="mr-1 h-4 w-4" />
                Test forbindelse
              </LoadingButton>
              {savedKonfigurasjon.autoSyncEnabled && (
                <Button onClick={startManuellSync} variant="primary" size="sm">
                  Synkroniser nå
                </Button>
              )}
            </div>
          </div>
          {lastSync && (
            <p className="mt-2 text-xs text-gray-500">
              Sist synkronisert: {lastSync.toLocaleString('no-NO')}
            </p>
          )}
        </div>
      )}

      {/* Configuration Form */}
      <form onSubmit={handleSubmit(lagreKonfigurasjon)} className="cards-spacing-vertical">
        {/* System Selection */}
        <div className="bg-white shadow rounded-lg px-2 py-1">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Regnskapssystem</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
            {['TRIPLETEX', 'POWEROFFICE', 'FIKEN'].map((system) => (
              <label key={system} className="relative">
                <input
                  type="radio"
                  value={system}
                  checked={selectedSystem === system}
                  onChange={(e) => setSelectedSystem(e.target.value)}
                  className="sr-only"
                />
                <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedSystem === system 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <span className="font-medium">{system}</span>
                </div>
              </label>
            ))}
          </div>
          {errors.system && (
            <p className="mt-2 text-sm text-red-600">{errors.system.message}</p>
          )}
        </div>

        {/* API Configuration */}
        <div className="bg-white shadow rounded-lg px-2 py-1">
          <h3 className="text-lg font-medium text-gray-900 mb-4">API Konfigurasjon</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API URL
              </label>
              <input
                type="url"
                {...register('apiUrl')}
                className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://api.example.com"
              />
              {errors.apiUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.apiUrl.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API-nøkkel
              </label>
              <input
                type="password"
                {...register('apiKey')}
                className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Skriv inn API-nøkkel"
              />
              {errors.apiKey && (
                <p className="mt-1 text-sm text-red-600">{errors.apiKey.message}</p>
              )}
            </div>

            {selectedSystem === 'POWEROFFICE' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Klient ID
                  </label>
                  <input
                    type="text"
                    {...register('clientId')}
                    className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Klient Secret
                  </label>
                  <input
                    type="password"
                    {...register('clientSecret')}
                    className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sync Settings */}
        <div className="bg-white shadow rounded-lg px-2 py-1">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Synkroniseringsinnstillinger</h3>
          
          <div className="cards-spacing-vertical">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('autoSyncEnabled')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Aktiver automatisk synkronisering
              </label>
            </div>

            {watch('autoSyncEnabled') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Synkroniseringsintervall (minutter)
                </label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  {...register('syncInterval', { valueAsNumber: true })}
                  className="w-32 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.syncInterval && (
                  <p className="mt-1 text-sm text-red-600">{errors.syncInterval.message}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white shadow rounded-lg px-2 py-1">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Kontoplan</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salgskonto
              </label>
              <input
                type="text"
                {...register('standardKontoer.salg')}
                className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="3000"
              />
              {errors.standardKontoer?.salg && (
                <p className="mt-1 text-sm text-red-600">{errors.standardKontoer.salg.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MVA-konto
              </label>
              <input
                type="text"
                {...register('standardKontoer.mva')}
                className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="2700"
              />
              {errors.standardKontoer?.mva && (
                <p className="mt-1 text-sm text-red-600">{errors.standardKontoer.mva.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kundekonto
              </label>
              <input
                type="text"
                {...register('standardKontoer.kunde')}
                className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="1500"
              />
              {errors.standardKontoer?.kunde && (
                <p className="mt-1 text-sm text-red-600">{errors.standardKontoer.kunde.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bankkonto
              </label>
              <input
                type="text"
                {...register('standardKontoer.bank')}
                className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="1920"
              />
              {errors.standardKontoer?.bank && (
                <p className="mt-1 text-sm text-red-600">{errors.standardKontoer.bank.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Standard MVA-kode (%)
              </label>
              <select
                {...register('defaultMvaKode')}
                className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="25">25% - Alminnelig sats</option>
                <option value="15">15% - Redusert sats</option>
                <option value="0">0% - Fritak</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <LoadingButton
            type="submit"
            loading={loading}
            disabled={!isDirty}
            variant="primary"
          >
            <FiSettings className="mr-2 h-4 w-4" />
            Lagre konfigurasjon
          </LoadingButton>
        </div>
      </form>
    </div>
  );
};

export default RegnskapsIntegrasjon; 