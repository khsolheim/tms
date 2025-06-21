import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBell, 
  FaPlus, 
  FaEye, 
  FaEyeSlash, 
  FaCalendarAlt, 
  FaUser, 
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaBullhorn,
  FaSearch
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { referenceService } from '../../services/reference.service';
import { nyheterService, type Nyhet } from '../../services/nyheter.service';

export default function Nyheter() {
  const [nyheter, setNyheter] = useState<Nyhet[]>([]);
  const [filteredNyheter, setFilteredNyheter] = useState<Nyhet[]>([]);
  const [selectedKategori, setSelectedKategori] = useState<string>('alle');
  const [visKunUleste, setVisKunUleste] = useState(false);
  const [søketerm, setSøketerm] = useState('');
  const [kategorier, setKategorier] = useState<any[]>([]);
  const [prioriteter, setPrioriteter] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hent nyheter og referanse-data fra API
  useEffect(() => {
    const hentData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [nyheterResponse, nyhetKategorier, nyhetPrioriteringer] = await Promise.all([
          nyheterService.hentPubliserteNyheter({ page: 1, limit: 50, sortBy: 'opprettet', sortOrder: 'desc' }),
          referenceService.getNyhetKategorier().catch(() => []),
          referenceService.getNyhetPrioriteringer().catch(() => [])
        ]);
        
        setNyheter(nyheterResponse.data || []);
        setKategorier(nyhetKategorier);
        setPrioriteter(nyhetPrioriteringer);
      } catch (error) {
        console.error('Feil ved henting av nyheter:', error);
        setError('Kunne ikke laste nyheter. Prøv igjen senere.');
        // Fallback til tom liste ved feil
        setNyheter([]);
      } finally {
        setLoading(false);
      }
    };

    hentData();
  }, []);

  // Filtrer nyheter
  useEffect(() => {
    let filtered = nyheter;

    if (selectedKategori !== 'alle') {
      filtered = filtered.filter(nyhet => nyhet.kategori === selectedKategori);
    }

    if (visKunUleste) {
      filtered = filtered.filter(nyhet => !nyhet.lest);
    }

    if (søketerm) {
      filtered = filtered.filter(nyhet => 
        nyhet.tittel.toLowerCase().includes(søketerm.toLowerCase()) ||
        nyhet.innhold.toLowerCase().includes(søketerm.toLowerCase())
      );
    }

    setFilteredNyheter(filtered);
  }, [nyheter, selectedKategori, visKunUleste, søketerm]);

  const markerSomLest = (id: string) => {
    setNyheter(prev => prev.map(nyhet => 
      nyhet.id === id ? { ...nyhet, lest: true } : nyhet
    ));
  };

  const antallUleste = nyheter.filter(nyhet => !nyhet.lest).length;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-2 py-1">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <div className="relative">
              <FaBell className="h-8 w-8 text-blue-600" />
              {antallUleste > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {antallUleste}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nyheter & Kunngjøringer</h1>
              <p className="text-gray-600">Hold deg oppdatert på det siste</p>
            </div>
          </div>
          
          <button
            onClick={() => console.log('Opprett ny kunngjøring')}
            className="inline-flex items-center px-2 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaPlus className="mr-2 h-4 w-4" />
            Ny kunngjøring
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Laster nyheter...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <FaExclamationTriangle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Statistikk cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 cards-spacing-grid mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-2 py-1">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaBell className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Totalt
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {nyheter.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-2 py-1">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaEyeSlash className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Uleste
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {antallUleste}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-2 py-1">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaExclamationTriangle className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Viktige
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {nyheter.filter(n => n.viktig).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-2 py-1">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaCalendarAlt className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Denne uken
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {nyheter.filter(n => {
                          const nyhetDato = new Date(n.opprettetDato);
                          const enUkeSiden = new Date();
                          enUkeSiden.setDate(enUkeSiden.getDate() - 7);
                          return nyhetDato >= enUkeSiden;
                        }).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtre og søk */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-2 py-1">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between cards-spacing-vertical lg:space-y-0">
                {/* Søk */}
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={søketerm}
                    onChange={(e) => setSøketerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Søk i nyheter..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-4">
                  {/* Kategorifilter */}
                  <select
                    value={selectedKategori}
                    onChange={(e) => setSelectedKategori(e.target.value)}
                    className="block w-full sm:w-auto px-2 py-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="alle">Alle kategorier</option>
                    {kategorier.map((kategori) => (
                      <option key={kategori.verdi} value={kategori.verdi}>{kategori.navn}</option>
                    ))}
                  </select>

                  {/* Vis kun uleste */}
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={visKunUleste}
                      onChange={(e) => setVisKunUleste(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Kun uleste</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Nyhetsliste */}
          <div className="cards-spacing-vertical">
            <AnimatePresence>
              {filteredNyheter.map((nyhet) => {
                const kategori = kategorier.find(k => k.verdi === nyhet.kategori) || { navn: nyhet.kategori, farge: 'bg-gray-100 text-gray-800', icon: 'FaBullhorn' };
                const prioritet = prioriteter.find(p => p.verdi === nyhet.prioritet) || { navn: nyhet.prioritet, farge: 'bg-gray-100 text-gray-600' };
                
                // Fallback til hardkodede ikoner for nå
                const getIconComponent = (iconName: string) => {
                  switch(iconName) {
                    case 'FaShieldAlt': return FaExclamationTriangle;
                    case 'FaCog': return FaInfoCircle;
                    case 'FaBuilding': return FaCheckCircle;
                    case 'FaBullhorn': return FaBullhorn;
                    default: return FaBullhorn;
                  }
                };
                const IconComponent = getIconComponent(kategori.icon);

                return (
                  <motion.div
                    key={nyhet.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`bg-white shadow rounded-lg hover:shadow-md transition-shadow ${
                      !nyhet.lest ? 'border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="px-2 py-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <IconComponent className="h-5 w-5 text-gray-400" />
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${kategori.farge}`}>
                              {kategori.navn}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${prioritet.farge}`}>
                              {prioritet.navn}
                            </span>
                            {nyhet.viktig && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Viktig
                              </span>
                            )}
                          </div>
                          
                          <h3 className={`text-lg font-semibold ${!nyhet.lest ? 'text-gray-900' : 'text-gray-700'}`}>
                            {nyhet.tittel}
                          </h3>
                          
                          <p className="text-gray-600 mt-2 line-clamp-2">
                            {nyhet.innhold}
                          </p>
                          
                          <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <FaUser className="h-4 w-4" />
                              <span>{nyhet.opprettetAv}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FaCalendarAlt className="h-4 w-4" />
                              <span>{new Date(nyhet.opprettetDato).toLocaleDateString('nb-NO')}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {!nyhet.lest && (
                            <button
                              onClick={() => markerSomLest(nyhet.id)}
                              className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <FaEye className="h-4 w-4 mr-1" />
                              Marker som lest
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredNyheter.length === 0 && (
              <div className="text-center py-12">
                <FaSearch className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen nyheter funnet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Prøv å endre filtrene eller søkekriteriene.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
} 