import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { elevService, type ElevKontrakt } from '../../services/elev.service';

const ElevKontrakter: React.FC = () => {
  const { elevId } = useParams<{ elevId: string }>();
  const [kontrakter, setKontrakter] = useState<ElevKontrakt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('alle');
  const [filterType, setFilterType] = useState<string>('alle');
  const [søketerm, setSøketerm] = useState('');
  const [selectedKontrakt, setSelectedKontrakt] = useState<ElevKontrakt | null>(null);
  const [activeTab, setActiveTab] = useState('oversikt');

  useEffect(() => {
    if (elevId) {
      hentKontrakter();
    }
  }, [elevId]);

  const hentKontrakter = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await elevService.hentMockElevKontrakter(); // Bruker mock data for nå
      setKontrakter(data);
    } catch (error) {
      console.error('Feil ved henting av kontrakter:', error);
      setError('Kunne ikke laste kontrakter. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  // Statistikk
  const statistikk = useMemo(() => {
    const aktive = kontrakter.filter(k => k.status === 'AKTIV').length;
    const fullførte = kontrakter.filter(k => k.status === 'FULLFØRT').length;
    const totalSum = kontrakter.reduce((sum, k) => sum + k.totalSum, 0);
    const betaltSum = kontrakter.reduce((sum, k) => sum + k.betaltSum, 0);
    const utestående = totalSum - betaltSum;
    const timerTotalt = kontrakter.reduce((sum, k) => sum + k.timerTotalt, 0);
    const timerFullført = kontrakter.reduce((sum, k) => sum + k.timerFullført, 0);
    
    return { aktive, fullførte, totalSum, betaltSum, utestående, timerTotalt, timerFullført };
  }, [kontrakter]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      AKTIV: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Aktiv' },
      FULLFØRT: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Fullført' },
      PLANLAGT: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Planlagt' },
      IKKE_STARTET: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Ikke startet' },
      KANSELLERT: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Kansellert' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getMilepælStatus = (status: string) => {
    const statusConfig = {
      FULLFØRT: { color: 'text-green-600', icon: '✓' },
      PLANLAGT: { color: 'text-blue-600', icon: '○' },
      VENTER: { color: 'text-gray-400', icon: '◯' },
      IKKE_STARTET: { color: 'text-gray-300', icon: '◯' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`${config.color} font-medium`}>
        {config.icon}
      </span>
    );
  };

  return (
    <div className="px-2 py-1 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mine Kontrakter
          </h1>
          <p className="text-gray-600">
            Oversikt over alle dine kjørekontrakter og fremgang
          </p>
        </div>

        {/* Statistikk Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 cards-spacing-grid mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border px-2 py-1"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktive Kontrakter</p>
                <p className="text-2xl font-bold text-gray-900">{statistikk.aktive}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border px-2 py-1"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Timer Fullført</p>
                <p className="text-2xl font-bold text-gray-900">{statistikk.timerFullført}/{statistikk.timerTotalt}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border px-2 py-1"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Betalt</p>
                <p className="text-2xl font-bold text-gray-900">{statistikk.betaltSum.toLocaleString()} kr</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border px-2 py-1"
          >
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Utestående</p>
                <p className="text-2xl font-bold text-gray-900">{statistikk.utestående.toLocaleString()} kr</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-2">
              {[
                { id: 'oversikt', label: 'Oversikt', icon: '📋' },
                { id: 'aktive', label: 'Aktive kontrakter', icon: '🟢' },
                { id: 'fremgang', label: 'Fremgang', icon: '📈' },
                { id: 'økonomi', label: 'Økonomi', icon: '💰' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="px-2 py-1">
            {activeTab === 'oversikt' && (
              <div className="cards-spacing-vertical">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Alle Kontrakter</h3>
                
                <div className="cards-spacing-vertical">
                  {kontrakter.map((kontrakt, index) => (
                    <motion.div
                      key={kontrakt.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg px-2 py-1 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{kontrakt.tittel}</h4>
                          <p className="text-sm text-gray-600">{kontrakt.beskrivelse}</p>
                          <div className="flex items-center cards-spacing-grid mt-2 text-sm text-gray-500">
                            <span>📍 {kontrakt.bedrift}</span>
                            <span>👨‍🏫 {kontrakt.instruktør}</span>
                            <span>🏷️ {kontrakt.kategori}</span>
                          </div>
                        </div>
                        {getStatusBadge(kontrakt.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 cards-spacing-grid mb-4">
                        <div className="bg-gray-50 rounded-lg px-2 py-1">
                          <div className="text-sm text-gray-600">Fremgang</div>
                          <div className="flex items-center mt-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${kontrakt.fremgang}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-900">{kontrakt.fremgang}%</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {kontrakt.timerFullført} av {kontrakt.timerTotalt} timer
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg px-2 py-1">
                          <div className="text-sm text-gray-600">Periode</div>
                          <div className="text-sm font-medium text-gray-900 mt-1">
                            {kontrakt.startdato} - {kontrakt.sluttdato}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {kontrakt.timerIgjen} timer igjen
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg px-2 py-1">
                          <div className="text-sm text-gray-600">Økonomi</div>
                          <div className="text-sm font-medium text-gray-900 mt-1">
                            {kontrakt.betaltSum.toLocaleString()} kr betalt
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            av {kontrakt.totalSum.toLocaleString()} kr totalt
                          </div>
                        </div>
                      </div>

                      {/* Milepæler */}
                      <div className="border-t pt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">Milepæler</h5>
                        <div className="space-y-6">
                          {kontrakt.milepæler.map((milepæl, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <div className="flex items-center cards-spacing-grid">
                                {getMilepælStatus(milepæl.status)}
                                <span className={milepæl.status === 'FULLFØRT' ? 'text-gray-900 font-medium' : 'text-gray-600'}>
                                  {milepæl.navn}
                                </span>
                              </div>
                              <span className="text-gray-500">
                                {milepæl.dato || '-'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-4 mt-4 pt-4 border-t">
                        <button onClick={() => console.log('Vis dokument')} className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded-md text-sm font-medium">
                          Vis detaljer
                        </button>
                        <button onClick={() => console.log('Button clicked')} className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 px-2 py-1 rounded-md text-sm font-medium">
                          Book timer
                        </button>
                        <button onClick={() => console.log('Button clicked')} className="flex-1 bg-purple-50 text-purple-600 hover:bg-purple-100 px-2 py-1 rounded-md text-sm font-medium">
                          Betal
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'aktive' && (
              <div className="cards-spacing-vertical">
                <h3 className="text-lg font-medium text-gray-900">Aktive Kontrakter</h3>
                <div className="cards-spacing-vertical">
                  {kontrakter.filter(k => k.status === 'AKTIV').map((kontrakt, index) => (
                    <div key={kontrakt.id} className="border border-green-200 rounded-lg px-2 py-1 bg-green-50">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{kontrakt.tittel}</h4>
                          <p className="text-sm text-gray-600">{kontrakt.beskrivelse}</p>
                        </div>
                        {getStatusBadge(kontrakt.status)}
                      </div>

                      <div className="bg-white rounded-lg px-2 py-1 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Fremgang: {kontrakt.fremgang}%</span>
                          <span className="text-sm text-gray-500">{kontrakt.timerFullført}/{kontrakt.timerTotalt} timer</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-green-600 h-3 rounded-full"
                            style={{ width: `${kontrakt.fremgang}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button onClick={() => console.log('Button clicked')} className="bg-blue-600 text-white px-2 py-1 rounded-md text-sm hover:bg-blue-700">
                          Book neste time
                        </button>
                        <button onClick={() => console.log('Button clicked')} className="bg-green-600 text-white px-2 py-1 rounded-md text-sm hover:bg-green-700">
                          Se timeplan
                        </button>
                        <button onClick={() => console.log('Button clicked')} className="bg-purple-600 text-white px-2 py-1 rounded-md text-sm hover:bg-purple-700">
                          Kontakt instruktør
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'fremgang' && (
              <div className="cards-spacing-vertical">
                <h3 className="text-lg font-medium text-gray-900">Fremgang Oversikt</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
                  <div className="bg-blue-50 rounded-lg px-2 py-1">
                    <h4 className="text-lg font-medium text-blue-900 mb-4">Total Fremgang</h4>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {Math.round((statistikk.timerFullført / statistikk.timerTotalt) * 100)}%
                    </div>
                    <div className="text-sm text-blue-700">
                      {statistikk.timerFullført} av {statistikk.timerTotalt} timer fullført
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg px-2 py-1">
                    <h4 className="text-lg font-medium text-green-900 mb-4">Neste Milepæl</h4>
                    <div className="text-lg font-medium text-green-700">
                      Praktisk prøve
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      Planlagt: 01.07.2025
                    </div>
                    <div className="text-sm text-green-600">
                      Om ~20 timer kjøring
                    </div>
                  </div>
                </div>

                <div className="cards-spacing-vertical">
                  {kontrakter.map((kontrakt) => (
                    <div key={kontrakt.id} className="border border-gray-200 rounded-lg px-2 py-1">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900">{kontrakt.tittel}</h5>
                        <span className="text-sm text-gray-500">{kontrakt.fremgang}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${kontrakt.fremgang}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {kontrakt.timerFullført} av {kontrakt.timerTotalt} timer • {kontrakt.timerIgjen} timer igjen
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'økonomi' && (
              <div className="cards-spacing-vertical">
                <h3 className="text-lg font-medium text-gray-900">Økonomi Oversikt</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 cards-spacing-grid">
                  <div className="bg-green-50 rounded-lg px-2 py-1">
                    <h4 className="text-sm font-medium text-green-900 mb-2">Totalt Betalt</h4>
                    <div className="text-2xl font-bold text-green-700">
                      {statistikk.betaltSum.toLocaleString()} kr
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg px-2 py-1">
                    <h4 className="text-sm font-medium text-orange-900 mb-2">Utestående</h4>
                    <div className="text-2xl font-bold text-orange-700">
                      {statistikk.utestående.toLocaleString()} kr
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg px-2 py-1">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Total Sum</h4>
                    <div className="text-2xl font-bold text-blue-700">
                      {statistikk.totalSum.toLocaleString()} kr
                    </div>
                  </div>
                </div>

                <div className="cards-spacing-vertical">
                  {kontrakter.map((kontrakt) => (
                    <div key={kontrakt.id} className="border border-gray-200 rounded-lg px-2 py-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="font-medium text-gray-900">{kontrakt.tittel}</h5>
                          <div className="text-sm text-gray-600">ID: {kontrakt.id}</div>
                        </div>
                        {getStatusBadge(kontrakt.status)}
                      </div>
                      
                      <div className="grid grid-cols-3 cards-spacing-grid text-sm">
                        <div>
                          <div className="text-gray-600">Total sum</div>
                          <div className="font-medium">{kontrakt.totalSum.toLocaleString()} kr</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Betalt</div>
                          <div className="font-medium text-green-600">{kontrakt.betaltSum.toLocaleString()} kr</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Utestående</div>
                          <div className="font-medium text-orange-600">
                            {(kontrakt.totalSum - kontrakt.betaltSum).toLocaleString()} kr
                          </div>
                        </div>
                      </div>

                      {kontrakt.totalSum > kontrakt.betaltSum && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <button onClick={() => console.log('Button clicked')} className="bg-green-600 text-white px-2 py-1 rounded-md text-sm hover:bg-green-700">
                            Betal utestående
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ElevKontrakter; 