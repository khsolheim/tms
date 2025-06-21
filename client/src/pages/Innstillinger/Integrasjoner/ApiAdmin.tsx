import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiKey,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiActivity,
  FiRefreshCw,
  FiShield,
  FiCheck,
  FiX,
  FiSettings
} from 'react-icons/fi';
import { integrasjonsService } from '../../../services/integrasjoner.service';
import type { ApiKey, ApiStatistikk, Integration } from '../../../services/integrasjoner.service';
import {
  KeyIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import {
  KeyIcon as KeySolidIcon,
  CogIcon as CogSolidIcon,
  ShieldCheckIcon as ShieldCheckSolidIcon
} from '@heroicons/react/24/solid';
import { referenceService } from '../../../services/reference.service';

// Bruker typer fra service

// Mock data fjernet - bruker service i stedet

export default function ApiAdmin() {
  const [aktivTab, setAktivTab] = useState<'oversikt' | 'keys' | 'integrations' | 'integrasjoner' | 'sikkerhet' | 'dokumentasjon'>('oversikt');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [statistikk, setStatistikk] = useState<ApiStatistikk | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [apiStatuser, setApiStatuser] = useState<any[]>([]);
  const [apiTyper, setApiTyper] = useState<any[]>([]);

  // Hent data når komponenten laster
  useEffect(() => {
    hentData();
  }, []);

  const hentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Bruker mock data for utvikling
      const mockData = await integrasjonsService.hentApiMockData();
      
      setApiKeys(mockData.apiKeys);
      setStatistikk(mockData.statistikk);
      setIntegrations(mockData.integrations);
      
    } catch (error) {
      console.error('Feil ved henting av API-data:', error);
      setError('Kunne ikke laste API-data. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  // Hent referanse-data fra API
  useEffect(() => {
    const hentReferanseData = async () => {
      try {
        const [statuser, typer] = await Promise.all([
          referenceService.getApiStatuser(),
          referenceService.getApiTyper()
        ]);
        setApiStatuser(statuser);
        setApiTyper(typer);
      } catch (error) {
        console.error('Feil ved henting av referanse-data:', error);
        // Beholder fallback-verdier ved feil
      }
    };

    hentReferanseData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('no-NO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('no-NO').format(num);
  };

  const getStatusBadge = (status: string) => {
    const statusObj = apiStatuser.find(s => s.verdi === status) || { 
      navn: status, 
      farge: 'bg-gray-100 text-gray-800', 
      icon: 'XCircleIcon' 
    };
    
    // Fallback til hardkodede ikoner for nå
    const getIconComponent = (iconName: string) => {
      switch(iconName) {
        case 'CheckCircleIcon': return CheckCircleIcon;
        case 'XCircleIcon': return XCircleIcon;
        case 'ExclamationTriangleIcon': return ExclamationTriangleIcon;
        case 'CogIcon': return CogIcon;
        default: return XCircleIcon;
      }
    };
    const Icon = getIconComponent(statusObj.icon);
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusObj.farge}`}>
        <Icon className="w-3 h-3" />
        {statusObj.navn}
      </span>
    );
  };

  const getTypeBadge = (type: ApiKey['type']) => {
    const typeObj = apiTyper.find(t => t.verdi === type) || { 
      navn: type, 
      farge: 'bg-gray-100 text-gray-800' 
    };
    
    return (
      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${typeObj.farge}`}>
        {typeObj.navn}
      </span>
    );
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(keyId);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (error) {
      console.error('Feil ved kopiering:', error);
    }
  };

  const handleToggleKey = async (keyId: string) => {
    try {
      const key = apiKeys.find(k => k.id === keyId);
      if (!key) return;
      
      await integrasjonsService.oppdaterApiKey(keyId, { status: key.status === 'AKTIV' ? 'SUSPENDERT' : 'AKTIV' });
      await hentData(); // Refresh data
    } catch (error) {
      console.error('Feil ved oppdatering av API-nøkkel:', error);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!window.confirm('Er du sikker på at du vil slette denne API-nøkkelen?')) return;
    
    try {
      await integrasjonsService.slettApiKey(keyId);
      await hentData(); // Refresh data
    } catch (error) {
      console.error('Feil ved sletting av API-nøkkel:', error);
    }
  };

  const handleTestIntegration = async (integrationId: string) => {
    try {
      const result = await integrasjonsService.testIntegrasjon(integrationId);
      alert(result.message);
    } catch (error) {
      console.error('Feil ved testing av integrasjon:', error);
      alert('Feil ved testing av integrasjon');
    }
  };

  return (
    <div className="cards-spacing-vertical">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center cards-spacing-grid">
            <div className="px-2 py-1 bg-blue-100 rounded-xl">
              <KeySolidIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">API Administrasjon</h1>
              <p className="text-gray-600 mt-1">
                Administrer API-nøkler, integrasjoner og tredjepartstjenester
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => console.log('Button clicked')} className="inline-flex items-center gap-2 px-2 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <DocumentTextIcon className="w-4 h-4" />
              API Dokumentasjon
            </button>
            <button onClick={() => console.log('Button clicked')} className="inline-flex items-center gap-2 px-2 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
              <PlusIcon className="w-4 h-4" />
              Ny API-nøkkel
            </button>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 cards-spacing-grid">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <div className="flex items-center">
            <div className="px-2 py-1 bg-blue-100 rounded-lg">
              <KeyIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">API-nøkler</p>
              <p className="text-2xl font-bold text-gray-900">{statistikk?.totaleKeys}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <div className="flex items-center">
            <div className="px-2 py-1 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktive</p>
              <p className="text-2xl font-bold text-green-600">{statistikk?.aktiveKeys}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <div className="flex items-center">
            <div className="px-2 py-1 bg-purple-100 rounded-lg">
              <GlobeAltIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Totale Kall</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(statistikk?.totaleKall || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <div className="flex items-center">
            <div className="px-2 py-1 bg-yellow-100 rounded-lg">
              <ArrowPathIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Siste døgn</p>
              <p className="text-2xl font-bold text-yellow-600">{formatNumber(statistikk?.kallSisteDøgn || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <div className="flex items-center">
            <div className="px-2 py-1 bg-indigo-100 rounded-lg">
              <CogIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Respons</p>
              <p className="text-2xl font-bold text-gray-900">{statistikk?.gjennomsnittRespons}ms</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <div className="flex items-center">
            <div className="px-2 py-1 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Feilrate</p>
              <p className="text-2xl font-bold text-red-600">{statistikk?.feilrate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-2" aria-label="Tabs">
            {[
              { id: 'oversikt', navn: 'API-nøkler', ikon: KeyIcon, activeIcon: KeySolidIcon },
              { id: 'integrasjoner', navn: 'Integrasjoner', ikon: GlobeAltIcon },
              { id: 'sikkerhet', navn: 'Sikkerhet', ikon: ShieldCheckIcon, activeIcon: ShieldCheckSolidIcon },
              { id: 'dokumentasjon', navn: 'Dokumentasjon', ikon: DocumentTextIcon }
            ].map((tab) => {
              const Icon = aktivTab === tab.id && tab.activeIcon ? tab.activeIcon : tab.ikon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setAktivTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    aktivTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.navn}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="px-2 py-1">
          {aktivTab === 'oversikt' && (
            <div className="cards-spacing-vertical">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">API-nøkler</h3>
                <button onClick={() => console.log('Button clicked')} className="inline-flex items-center gap-2 px-2 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                  <PlusIcon className="w-4 h-4" />
                  Generer ny nøkkel
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Navn
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        API-nøkkel
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bruk
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sist brukt
                      </th>
                      <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Handlinger
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {apiKeys.map((key) => (
                      <tr key={key.id} className="hover:bg-gray-50">
                        <td className="px-2 py-1 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{key.navn}</div>
                            {key.beskrivelse && (
                              <div className="text-sm text-gray-500">{key.beskrivelse}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-gray-600">
                              {visibleKeys.has(key.id) ? key.nøkkel : '***'}
                            </span>
                            <button
                              onClick={() => toggleKeyVisibility(key.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {visibleKeys.has(key.id) ? 
                                <EyeSlashIcon className="w-4 h-4" /> : 
                                <EyeIcon className="w-4 h-4" />
                              }
                            </button>
                            <button
                              onClick={() => copyToClipboard(key.nøkkel, key.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <ClipboardDocumentIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap">
                          {getTypeBadge(key.type)}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap">
                          {getStatusBadge(key.status)}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div>{formatNumber(key.bruktAntall || 0)}</div>
                            {key.maksAntall && (
                              <div className="text-xs text-gray-500">
                                av {formatNumber(key.maksAntall)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                          {key.sistBrukt ? formatDate(key.sistBrukt) : 'Aldri'}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleToggleKey(key.id)} className="text-blue-600 hover:text-blue-900">
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteKey(key.id)} className="text-red-600 hover:text-red-900">
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {aktivTab === 'integrasjoner' && (
            <div className="cards-spacing-vertical">
              <h3 className="text-lg font-semibold text-gray-900">Eksterne Integrasjoner</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
                {integrations.map((integration) => (
                  <div key={integration.id} className="bg-white border border-gray-200 rounded-lg px-2 py-1 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          {integration.navn}
                        </h4>
                        <div className="space-y-6">
                          {getStatusBadge(integration.status)}
                          <div className="text-sm text-gray-500">
                            Type: {integration.type}
                          </div>
                          <div className="text-sm text-gray-500">
                            Endepunkt: {integration.endepunkt}
                          </div>
                          {integration.sistSynkronisert && (
                            <div className="text-sm text-gray-500">
                              Sist synkronisert: {formatDate(integration.sistSynkronisert)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {integration.feilmelding && (
                      <div className="mt-4 px-2 py-1 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-sm text-red-800">{integration.feilmelding}</div>
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-2 cards-spacing-grid text-sm">
                      <div>
                        <div className="text-gray-500">Totale kall</div>
                        <div className="font-medium">{formatNumber(integration.statistikk.totaleKall)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Suksessrate</div>
                        <div className="font-medium text-green-600">
                          {((integration.statistikk.vellykkede / integration.statistikk.totaleKall) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Gj.snitt respons</div>
                        <div className="font-medium">{integration.statistikk.gjennomsnittRespenstid}ms</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Feilede kall</div>
                        <div className="font-medium text-red-600">{integration.statistikk.feilede}</div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <button 
                        onClick={() => handleTestIntegration(integration.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-2 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        disabled={loading}
                      >
                        <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Test tilkobling
                      </button>
                      <button onClick={() => console.log('Button clicked')} className="inline-flex items-center justify-center px-2 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <CogIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {aktivTab === 'sikkerhet' && (
            <div className="cards-spacing-vertical">
              <h3 className="text-lg font-semibold text-gray-900">Sikkerhet & Tilgangskontroll</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
                <div className="bg-white border border-gray-200 rounded-lg px-2 py-1">
                  <h4 className="text-base font-medium text-gray-900 mb-4">IP-restriksjoner</h4>
                  <div className="space-y-8">
                    <div className="text-sm text-gray-600">
                      Tillatte IP-adresser og subnett for API-tilgang
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-sm">192.168.1.0/24</span>
                        <button onClick={() => console.log('Button clicked')} className="text-red-600 hover:text-red-800">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-sm">10.0.0.0/8</span>
                        <button onClick={() => console.log('Button clicked')} className="text-red-600 hover:text-red-800">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button onClick={() => console.log('Button clicked')} className="inline-flex items-center gap-2 px-2 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <PlusIcon className="w-4 h-4" />
                      Legg til IP-restriksjon
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg px-2 py-1">
                  <h4 className="text-base font-medium text-gray-900 mb-4">Rate Limiting</h4>
                  <div className="cards-spacing-vertical">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maks kall per minutt
                      </label>
                      <input
                        type="number"
                        defaultValue="1000"
                        className="block w-full px-2 py-1 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maks kall per dag
                      </label>
                      <input
                        type="number"
                        defaultValue="100000"
                        className="block w-full px-2 py-1 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 px-2 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                      Oppdater grenser
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {aktivTab === 'dokumentasjon' && (
            <div className="cards-spacing-vertical">
              <h3 className="text-lg font-semibold text-gray-900">API Dokumentasjon</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
                <div className="flex items-start cards-spacing-grid">
                  <DocumentTextIcon className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="text-lg font-medium text-blue-900 mb-2">
                      Kom i gang med TMS API
                    </h4>
                    <p className="text-blue-800 mb-4">
                      Vår REST API gir deg tilgang til alle TMS-funksjoner. 
                      Bruk API-dokumentasjonen for å komme i gang raskt.
                    </p>
                    <div className="space-y-6">
                      <a href="#" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                        <DocumentTextIcon className="w-4 h-4" />
                        Se full API-dokumentasjon
                      </a>
                      <br />
                      <a href="#" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                        <GlobeAltIcon className="w-4 h-4" />
                        Prøv API-et i nettleseren
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
                <div className="bg-white border border-gray-200 rounded-lg px-2 py-1">
                  <h4 className="text-base font-medium text-gray-900 mb-4">Populære endepunkter</h4>
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">GET /api/bedrifter</code>
                      <span className="text-xs text-gray-500">Hent bedrifter</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">GET /api/elever</code>
                      <span className="text-xs text-gray-500">Hent elever</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">POST /api/kontrakter</code>
                      <span className="text-xs text-gray-500">Opprett kontrakt</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg px-2 py-1">
                  <h4 className="text-base font-medium text-gray-900 mb-4">Status koder</h4>
                  <div className="space-y-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">200</span>
                      <span>OK - Forespørsel vellykket</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">401</span>
                      <span>Unauthorized - Ugyldig API-nøkkel</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">429</span>
                      <span>Too Many Requests - Rate limit overskredet</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}