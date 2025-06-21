import React, { useState, useEffect } from 'react';
import { 
  FaEnvelope, 
  FaServer, 
  FaCheck, 
  FaTimes, 
  FaEye,
  FaEyeSlash,
  FaSave,
  FaSync,
  FaExclamationTriangle,
  FaChartLine,
  FaPaperPlane,
  FaInbox,
  FaCog,
  FaKey,
  FaShieldAlt
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import {
  FiMail,
  FiSettings,
  FiBarChart,
  FiSend,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiEye,
  FiCopy
} from 'react-icons/fi';
import { integrasjonsService } from '../../../services/integrasjoner.service';

// Typer
interface SMTPKonfigurasjon {
  id: string;
  navn: string;
  server: string;
  port: number;
  sikkerhet: 'none' | 'ssl' | 'tls';
  brukernavn: string;
  passord: string;
  fraAdresse: string;
  fraNavn: string;
  aktiv: boolean;
  sist_testet?: string;
  status: 'aktiv' | 'inaktiv' | 'feil';
}

interface EpostMal {
  id: string;
  navn: string;
  emne: string;
  innhold: string;
  type: 'velkomst' | 'påminnelse' | 'bekreftelse' | 'varsel';
  aktiv: boolean;
  opprettet: string;
  brukt: number;
}

interface EpostStatistikk {
  sendt_i_dag: number;
  sendt_denne_uke: number;
  sendt_denne_måned: number;
  leveringsrate: number;
  åpningsrate: number;
  feilrate: number;
}

export default function EpostIntegrasjon() {
  const [aktivTab, setAktivTab] = useState<'oversikt' | 'smtp' | 'maler' | 'test'>('oversikt');
  const [smtpKonfigurasjon, setSmtpKonfigurasjon] = useState<SMTPKonfigurasjon[]>([]);
  const [epostMaler, setEpostMaler] = useState<EpostMal[]>([]);
  const [statistikk, setStatistikk] = useState<EpostStatistikk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testEpost, setTestEpost] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [visPassord, setVisPassord] = useState<{[key: string]: boolean}>({});
  const [redigerKonfig, setRedigerKonfig] = useState<SMTPKonfigurasjon | null>(null);
  const [testResultat, setTestResultat] = useState<{sukses: boolean; melding: string} | null>(null);

  useEffect(() => {
    hentData();
  }, []);

  const hentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await integrasjonsService.hentApiMockData();
      // Bruker mock data for epost-specifike ting inntil API er implementert
      setSmtpKonfigurasjon([
        {
          id: '1',
          navn: 'Gmail SMTP',
          server: 'smtp.gmail.com',
          port: 587,
          sikkerhet: 'tls',
          brukernavn: 'noreply@tms.no',
          passord: '••••••••',
          fraAdresse: 'noreply@tms.no',
          fraNavn: 'TMS System',
          aktiv: true,
          status: 'aktiv',
          sist_testet: '2025-06-15T10:00:00Z'
        }
      ]);
      setEpostMaler([]);
      setStatistikk({
        sendt_i_dag: 45,
        sendt_denne_uke: 312,
        sendt_denne_måned: 1247,
        leveringsrate: 97.8,
        åpningsrate: 35.2,
        feilrate: 2.2
      });
    } catch (error) {
      console.error('Feil ved henting av e-post data:', error);
      setError('Kunne ikke laste e-post konfigurasjon. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  const togglePassordVisning = (id: string) => {
    setVisPassord(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const testSMTPTilkobling = async (konfig: SMTPKonfigurasjon) => {
    // Simuler test
    setTestResultat(null);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const erVellykket = Math.random() > 0.2; // 80% suksessrate
    setTestResultat({
      sukses: erVellykket,
      melding: erVellykket 
        ? 'SMTP-tilkobling testet vellykket!'
        : 'Kunne ikke koble til SMTP-server. Sjekk innstillingene.'
    });

    if (erVellykket) {
      setSmtpKonfigurasjon(prev => prev.map(s => 
        s.id === konfig.id 
          ? { ...s, status: 'aktiv', sist_testet: new Date().toISOString() }
          : s
      ));
    }
  };

  const tabs = [
    { id: 'smtp', navn: 'SMTP Konfigurasjon', icon: FaServer },
    { id: 'maler', navn: 'E-postmaler', icon: FaEnvelope },
    { id: 'test', navn: 'Test & Statistikk', icon: FaChartLine }
  ];

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-2 py-1">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <FaEnvelope className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">E-postintegrasjon</h1>
            <p className="text-gray-600">Administrer SMTP-innstillinger og e-postmaler</p>
          </div>
        </div>
      </div>

      {/* Status oversikt */}
      <div className="grid grid-cols-1 md:grid-cols-4 cards-spacing-grid mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-2 py-1">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaPaperPlane className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">I dag</dt>
                  <dd className="text-lg font-medium text-gray-900">{statistikk?.sendt_i_dag}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-2 py-1">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaInbox className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Leveringsrate</dt>
                  <dd className="text-lg font-medium text-gray-900">{statistikk?.leveringsrate}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-2 py-1">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaEye className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Åpningsrate</dt>
                  <dd className="text-lg font-medium text-gray-900">{statistikk?.åpningsrate}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-2 py-1">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Feilrate</dt>
                  <dd className="text-lg font-medium text-gray-900">{statistikk?.feilrate}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setAktivTab(tab.id as any)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  aktivTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className={`mr-2 h-5 w-5 ${
                  aktivTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {tab.navn}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <motion.div
        key={aktivTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {aktivTab === 'smtp' && (
          <div className="cards-spacing-vertical">
            {/* SMTP konfigurasjon */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-2 py-1 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">SMTP Servere</h3>
                <button onClick={() => console.log('Button clicked')} className="inline-flex items-center px-2 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  <FaServer className="mr-2 h-4 w-4" />
                  Legg til server
                </button>
              </div>
              
              <div className="px-2 py-1">
                {smtpKonfigurasjon.map((konfig) => (
                  <div key={konfig.id} className="border border-gray-200 rounded-lg px-2 py-1 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          konfig.status === 'aktiv' ? 'bg-green-400' : 
                          konfig.status === 'feil' ? 'bg-red-400' : 'bg-gray-400'
                        }`} />
                        <h4 className="text-lg font-medium text-gray-900">{konfig.navn}</h4>
                        {konfig.aktiv && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Aktiv
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => testSMTPTilkobling(konfig)}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <FaSync className="mr-1 h-3 w-3" />
                          Test
                        </button>
                        <button onClick={() => console.log('Rediger')} className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                          <FaCog className="mr-1 h-3 w-3" />
                          Rediger
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SMTP Server
                        </label>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900">{konfig.server}</span>
                          <span className="text-sm text-gray-500">:{konfig.port}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            konfig.sikkerhet === 'tls' ? 'bg-green-100 text-green-800' :
                            konfig.sikkerhet === 'ssl' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            <FaShieldAlt className="mr-1 h-3 w-3" />
                            {konfig.sikkerhet.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Brukernavn
                        </label>
                        <span className="text-sm text-gray-900">{konfig.brukernavn}</span>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Passord
                        </label>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900">
                            {visPassord[konfig.id] ? 'mitt-sikre-passord' : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePassordVisning(konfig.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {visPassord[konfig.id] ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fra adresse
                        </label>
                        <span className="text-sm text-gray-900">{konfig.fraAdresse}</span>
                      </div>
                    </div>

                    {konfig.sist_testet && (
                      <div className="mt-4 text-sm text-gray-500">
                        Sist testet: {new Date(konfig.sist_testet).toLocaleString('nb-NO')}
                      </div>
                    )}

                    {testResultat && (
                      <div className={`mt-4 p-4 rounded-md ${
                        testResultat.sukses 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center">
                          {testResultat.sukses ? (
                            <FaCheck className="h-5 w-5 text-green-400 mr-2" />
                          ) : (
                            <FaTimes className="h-5 w-5 text-red-400 mr-2" />
                          )}
                          <span className={`text-sm font-medium ${
                            testResultat.sukses ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {testResultat.melding}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {aktivTab === 'maler' && (
          <div className="cards-spacing-vertical">
            {/* E-postmaler */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-2 py-1 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">E-postmaler</h3>
                <button onClick={() => console.log('Opprett ny')} className="inline-flex items-center px-2 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  <FaEnvelope className="mr-2 h-4 w-4" />
                  Opprett mal
                </button>
              </div>
              
              <div className="px-2 py-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
                  {epostMaler.map((mal) => (
                    <div key={mal.id} className="border border-gray-200 rounded-lg px-2 py-1 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-medium text-gray-900">{mal.navn}</h4>
                        <div className="flex items-center space-x-2">
                          {mal.aktiv ? (
                            <FaCheck className="h-4 w-4 text-green-400" />
                          ) : (
                            <FaTimes className="h-4 w-4 text-red-400" />
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">Emne: {mal.emne}</p>
                      <p className="text-sm text-gray-500 mb-4 line-clampx-2 py-1">{mal.innhold}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          mal.type === 'velkomst' ? 'bg-blue-100 text-blue-800' :
                          mal.type === 'påminnelse' ? 'bg-yellow-100 text-yellow-800' :
                          mal.type === 'bekreftelse' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {mal.type}
                        </span>
                        <span>Brukt {mal.brukt} ganger</span>
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-4">
                        <button onClick={() => console.log('Rediger')} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Rediger
                        </button>
                        <button onClick={() => window.confirm('Er du sikker på at du vil slette?') && console.log('Slett')} className="text-red-600 hover:text-red-800 text-sm font-medium">
                          Slett
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {aktivTab === 'test' && (
          <div className="cards-spacing-vertical">
            {/* Detaljert statistikk */}
            <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
              <div className="bg-white shadow rounded-lg px-2 py-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sendte e-poster</h3>
                <div className="cards-spacing-vertical">
                  <div className="flex justify-between">
                    <span className="text-gray-600">I dag</span>
                    <span className="font-medium">{statistikk?.sendt_i_dag}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Denne uken</span>
                    <span className="font-medium">{statistikk?.sendt_denne_uke}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Denne måneden</span>
                    <span className="font-medium">{statistikk?.sendt_denne_måned}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg px-2 py-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ytelse</h3>
                <div className="cards-spacing-vertical">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Leveringsrate</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${statistikk?.leveringsrate}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-sm">{statistikk?.leveringsrate}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Åpningsrate</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${statistikk?.åpningsrate}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-sm">{statistikk?.åpningsrate}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Feilrate</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${statistikk?.feilrate}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-sm">{statistikk?.feilrate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
} 