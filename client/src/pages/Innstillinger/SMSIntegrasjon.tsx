/**
 * SMS Integrasjon Innstillinger
 * 
 * Konfigurasjon av SMS-tjenester for varsler og kommunikasjon
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  FiMessageSquare,
  FiSettings,
  FiBarChart,
  FiSend,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiDollarSign,
  FiClock,
  FiUsers,
  FiTrendingUp
} from 'react-icons/fi';
import { 
  integrasjonsService
} from '../../services/integrasjoner.service';
import { SMSService, type SMSKonfigurasjon } from '../../services/SMSIntegrasjon';
import { Button } from '../../design-system/components/Button';
import { LoadingButton } from '../../components/ui/LoadingStates';
import { useTranslation } from '../../contexts/I18nContext';
import { logger } from '../../utils/logger';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const smsSchema = z.object({
  leverandor: z.enum(['TWILIO', 'SMS_NO', 'CUSTOM'], {
    required_error: 'SMS-leverandør må velges'
  }),
  // Twilio felter
  accountSid: z.string().optional(),
  authToken: z.string().optional(),
  fromNumber: z.string().optional(),
  // SMS.no felter
  brukernavn: z.string().optional(),
  passord: z.string().optional(),
  avsender: z.string().optional(),
  // Custom felter
  customApiUrl: z.string().url().optional(),
  customApiKey: z.string().optional(),
  // Generelle innstillinger
  testModus: z.boolean().default(false),
  dailyLimit: z.number().min(1).default(1000),
  costPerSMS: z.number().min(0).default(0.50)
});

type SMSFormData = z.infer<typeof smsSchema>;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SMSIntegrasjon: React.FC = () => {
  const { t } = useTranslation(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    message: string;
    responseTime?: number;
  } | null>(null);
  const [savedKonfigurasjon, setSavedKonfigurasjon] = useState<any | null>(null);
  const [statistikk, setStatistikk] = useState<any | null>(null);
  const [aktivTab, setAktivTab] = useState<'oversikt' | 'konfigurasjon' | 'test'>('oversikt');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Test melding fra TMS');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue, // eslint-disable-line @typescript-eslint/no-unused-vars
    formState: { errors }
  } = useForm<SMSFormData>({
    resolver: zodResolver(smsSchema),
    defaultValues: {
      leverandor: 'SMS_NO',
      testModus: true,
      dailyLimit: 1000,
      costPerSMS: 0.50,
      avsender: 'TMS'
    }
  });

  const watchedLeverandor = watch('leverandor');

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    hentData();
  }, []);

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  const hentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For utvikling bruker vi mock data til API er implementert
      const mockData = await integrasjonsService.hentApiMockData();
      
      // Mock konfigurasjon data siden det ikke finnes i mockData ennå
      setSavedKonfigurasjon({
        leverandor: 'TWILIO',
        accountSid: '',
        authToken: '',
        fromNumber: '',
        aktiv: false
      });
      setStatistikk(mockData.statistikk);
      
      // TODO: Erstatt med ekte API-kall når backend er klar
      /*
      const [configResponse, statsResponse] = await Promise.all([
        integrasjonsService.hentSMSKonfigurasjon(),
        integrasjonsService.hentSMSStatistikk()
      ]);
      
      setSavedKonfigurasjon(configResponse);
      setStatistikk(statsResponse);
      */
    } catch (error) {
      console.error('Feil ved henting av SMS-data:', error);
      setError('Kunne ikke laste SMS-konfigurasjon. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKonfigurasjon = async (newConfig: SMSKonfigurasjon) => {
    try {
      setSaving(true);
      
      // TODO: Implementer oppdaterSMSKonfigurasjon metode i integrasjonsService
      // await integrasjonsService.oppdaterSMSKonfigurasjon(newConfig);
      console.log('Lagrer konfigurasjon:', newConfig);
      setSavedKonfigurasjon(newConfig);
      
      // Vis suksessmelding
      alert('SMS-konfigurasjon lagret!');
    } catch (error) {
      console.error('Feil ved lagring av SMS-konfigurasjon:', error);
      alert('Feil ved lagring av konfigurasjon');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestSMS = async () => {
    if (!testPhone || !testMessage) {
      alert('Vennligst fyll ut telefonnummer og melding');
      return;
    }

    try {
      setTestSending(true);
      setTestResult(null);
      
      await integrasjonsService.sendTestSms('twilio', testPhone, testMessage);
      
      setTestResult({
        success: true,
        message: 'Test-SMS sendt vellykket!'
      });
    } catch (error) {
      console.error('Feil ved sending av test-SMS:', error);
      setTestResult({
        success: false,
        message: 'Feil ved sending av test-SMS'
      });
    } finally {
      setTestSending(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK'
    }).format(amount);
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return ((value / total) * 100).toFixed(1) + '%';
  };

  const testForbindelse = async () => {
    if (!savedKonfigurasjon) {
      setConnectionStatus({
        connected: false,
        message: 'Ingen konfigurasjon å teste'
      });
      return;
    }

    setTestingConnection(true);
    const startTime = Date.now();

    try {
      const smsService = new SMSService(savedKonfigurasjon);
      const connected = await smsService.testForbindelse();
      const responseTime = Date.now() - startTime;

      setConnectionStatus({
        connected,
        message: connected 
          ? `Forbindelse til ${savedKonfigurasjon.leverandor} OK`
          : `Kunne ikke koble til ${savedKonfigurasjon.leverandor}`,
        responseTime
      });

      logger.info('SMS forbindelsestest fullført', {
        leverandor: savedKonfigurasjon.leverandor,
        connected,
        responseTime
      });

    } catch (error) {
      setConnectionStatus({
        connected: false,
        message: `Feil ved testing: ${error}`
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const sendTestSMS = async () => {
    if (!savedKonfigurasjon) return;

    try {
      const smsService = new SMSService(savedKonfigurasjon);
      const testMelding = {
        til: '90123456', // Test nummer
        melding: 'Test SMS fra TMS - integrasjon fungerer! 📱',
        type: 'INFO' as const,
        prioritet: 'NORMAL' as const
      };

      const resultat = await smsService.sendSMS(testMelding);
      
      if (resultat.suksess) {
        logger.info('Test SMS sendt', { 
          meldingsId: resultat.meldingsId,
          kostnad: resultat.kostnad 
        });
      } else {
        logger.error('Test SMS feilet', { feil: resultat.feilmelding });
      }
    } catch (error) {
      logger.error('Feil ved sending av test SMS', error);
    }
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderLeverandorSpesifikkeInnstillinger = () => {
    switch (watchedLeverandor) {
      case 'TWILIO':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account SID
              </label>
              <input
                type="text"
                {...register('accountSid')}
                className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
              {errors.accountSid && (
                <p className="mt-1 text-sm text-red-600">{errors.accountSid.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auth Token
              </label>
              <input
                type="password"
                {...register('authToken')}
                className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Skriv inn Auth Token"
              />
              {errors.authToken && (
                <p className="mt-1 text-sm text-red-600">{errors.authToken.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fra-nummer
              </label>
              <input
                type="tel"
                {...register('fromNumber')}
                className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="+1234567890"
              />
              {errors.fromNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.fromNumber.message}</p>
              )}
            </div>
          </div>
        );

      case 'SMS_NO':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brukernavn
              </label>
              <input
                type="text"
                {...register('brukernavn')}
                className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ditt-brukernavn"
              />
              {errors.brukernavn && (
                <p className="mt-1 text-sm text-red-600">{errors.brukernavn.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passord
              </label>
              <input
                type="password"
                {...register('passord')}
                className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Skriv inn passord"
              />
              {errors.passord && (
                <p className="mt-1 text-sm text-red-600">{errors.passord.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avsender
              </label>
              <input
                type="text"
                {...register('avsender')}
                className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="TMS"
                maxLength={11}
              />
              <p className="mt-1 text-sm text-gray-500">Maks 11 tegn</p>
            </div>
          </div>
        );

      case 'CUSTOM':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API URL
              </label>
              <input
                type="url"
                {...register('customApiUrl')}
                className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://api.example.com/sms"
              />
              {errors.customApiUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.customApiUrl.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API-nøkkel
              </label>
              <input
                type="password"
                {...register('customApiKey')}
                className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Skriv inn API-nøkkel"
              />
              {errors.customApiKey && (
                <p className="mt-1 text-sm text-red-600">{errors.customApiKey.message}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderStatistikk = () => {
    if (!statistikk) return null;

    return (
      <div className="bg-white shadow rounded-lg px-2 py-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">SMS Statistikk</h3>
          <FiTrendingUp className="h-5 w-5 text-green-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 cards-spacing-grid">
          <div className="bg-blue-50 rounded-lg px-2 py-1">
            <div className="flex items-center">
              <FiMessageSquare className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">I dag</p>
                <p className="text-2xl font-bold text-blue-600">{statistikk.sendtIdag}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg px-2 py-1">
            <div className="flex items-center">
              <FiSend className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">Denne måneden</p>
                <p className="text-2xl font-bold text-green-600">{statistikk.sendtDenneMåneden}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg px-2 py-1">
            <div className="flex items-center">
              <FiDollarSign className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-900">Kostnad</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(statistikk.kostnaderDenneMåneden)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg px-2 py-1">
            <div className="flex items-center">
              <FiCheck className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-900">Leveringsrate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatPercentage(statistikk.leveringsrate, 100)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Populære SMS-typer</h4>
          <div className="space-y-6">
            {statistikk.populæreSmsTyper.map((type: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{type.type}</span>
                <span className="text-sm font-medium text-gray-900">{type.antall}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="cards-spacing-vertical">
      {/* Header */}
      <div className="bg-white shadow rounded-lg px-2 py-1">
        <div className="flex items-center">
          <FiMessageSquare className="h-8 w-8 text-indigo-600 mr-3" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">SMS Integrasjon</h2>
            <p className="text-gray-600">
              Konfigurer SMS-tjenester for varsler og kommunikasjon med elever og bedrifter
            </p>
          </div>
        </div>
      </div>

      {/* Statistikk */}
      {renderStatistikk()}

      {/* Konfigurasjon */}
      <form onSubmit={handleSubmit(handleSaveKonfigurasjon)} className="cards-spacing-vertical">
        {/* Leverandør valg */}
        <div className="bg-white shadow rounded-lg px-2 py-1">
          <h3 className="text-lg font-medium text-gray-900 mb-4">SMS Leverandør</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 cards-spacing-grid">
            {[
              { value: 'TWILIO', label: 'Twilio', description: 'Internasjonal SMS-tjeneste' },
              { value: 'SMS_NO', label: 'SMS.no', description: 'Norsk SMS-leverandør' },
              { value: 'CUSTOM', label: 'Custom', description: 'Egendefinert API' }
            ].map((option) => (
              <label key={option.value} className="relative">
                <input
                  type="radio"
                  value={option.value}
                  {...register('leverandor')}
                  className="sr-only"
                />
                <div className={`
                  border-2 rounded-lg p-4 cursor-pointer transition-colors
                  ${watchedLeverandor === option.value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{option.label}</h4>
                    {watchedLeverandor === option.value && (
                      <FiCheck className="h-5 w-5 text-indigo-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
          {errors.leverandor && (
            <p className="mt-1 text-sm text-red-600">{errors.leverandor.message}</p>
          )}
        </div>

        {/* Leverandør-spesifikke innstillinger */}
        <div className="bg-white shadow rounded-lg px-2 py-1">
          <h3 className="text-lg font-medium text-gray-900 mb-4">API Konfigurasjon</h3>
          {renderLeverandorSpesifikkeInnstillinger()}
        </div>

        {/* Generelle innstillinger */}
        <div className="bg-white shadow rounded-lg px-2 py-1">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Generelle Innstillinger</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 cards-spacing-grid">
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('testModus')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Test modus
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                SMS blir ikke sendt, kun logget
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daglig grense
              </label>
              <input
                type="number"
                {...register('dailyLimit', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="1000"
              />
              {errors.dailyLimit && (
                <p className="mt-1 text-sm text-red-600">{errors.dailyLimit.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kostnad per SMS (kr)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('costPerSMS', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.50"
              />
              {errors.costPerSMS && (
                <p className="mt-1 text-sm text-red-600">{errors.costPerSMS.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white shadow rounded-lg px-2 py-1">
          <div className="flex flex-col sm:flex-row cards-spacing-grid">
            <LoadingButton
              loading={saving}
              type="submit"
              className="flex-1"
            >
              <FiCheck className="h-5 w-5 mr-2" />
              Lagre konfigurasjon
            </LoadingButton>

            <LoadingButton
              loading={testingConnection}
              type="button"
              onClick={testForbindelse}
              variant="secondary"
              disabled={!savedKonfigurasjon}
              className="flex-1"
            >
              <FiRefreshCw className="h-5 w-5 mr-2" />
              Test forbindelse
            </LoadingButton>

            <Button
              type="button"
              onClick={sendTestSMS}
              variant="outline"
              disabled={!savedKonfigurasjon}
              className="flex-1"
            >
              <FiSend className="h-5 w-5 mr-2" />
              Send test SMS
            </Button>
          </div>

          {/* Connection Status */}
          {connectionStatus && (
            <div className={`
              mt-4 p-4 rounded-md flex items-center
              ${connectionStatus.connected
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
              }
            `}>
              {connectionStatus.connected ? (
                <FiCheck className="h-5 w-5 mr-2" />
              ) : (
                <FiX className="h-5 w-5 mr-2" />
              )}
              <span>{connectionStatus.message}</span>
              {connectionStatus.responseTime && (
                <span className="ml-2 text-sm">
                  ({connectionStatus.responseTime}ms)
                </span>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default SMSIntegrasjon; 