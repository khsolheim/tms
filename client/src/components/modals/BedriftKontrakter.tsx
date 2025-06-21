import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { elevService, type ElevKontrakt } from '../../services/elev.service';

const BedriftKontrakter: React.FC = () => {
  const { bedriftId } = useParams<{ bedriftId: string }>();
  const [kontrakter, setKontrakter] = useState<ElevKontrakt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('alle');
  const [filterType, setFilterType] = useState<string>('alle');
  const [søketerm, setSøketerm] = useState('');
  const [sortBy, setSortBy] = useState<'tittel' | 'startdato' | 'fremgang' | 'totalSum'>('startdato');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (bedriftId) {
      hentKontrakter();
    }
  }, [bedriftId]);

  const hentKontrakter = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await elevService.hentMockElevKontrakter();
      setKontrakter(data);
    } catch (error) {
      console.error('Feil ved henting av kontrakter:', error);
      setError('Kunne ikke laste kontrakter. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  // Filter og sorter kontrakter
  const filteredKontrakter = useMemo(() => {
         let filtered = kontrakter.filter(kontrakt => {
       const matchesSearch = kontrakt.tittel.toLowerCase().includes(søketerm.toLowerCase()) ||
                            kontrakt.instruktør.toLowerCase().includes(søketerm.toLowerCase()) ||
                            kontrakt.id.toLowerCase().includes(søketerm.toLowerCase());
      const matchesStatus = filterStatus === 'alle' || kontrakt.status === filterStatus;
      const matchesType = filterType === 'alle' || kontrakt.type === filterType;
      
      return matchesSearch && matchesStatus && matchesType;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a];
      let bValue = b[sortBy as keyof typeof b];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [kontrakter, søketerm, filterStatus, filterType, sortBy, sortDirection]);

  // Statistikk
  const statistikk = useMemo(() => {
    const aktive = kontrakter.filter(k => k.status === 'AKTIV').length;
    const fullførte = kontrakter.filter(k => k.status === 'FULLFØRT').length;
    const totalInntekt = kontrakter.reduce((sum, k) => sum + k.betaltSum, 0);
    const utestående = kontrakter.reduce((sum, k) => sum + (k.totalSum - k.betaltSum), 0);
    
    return { aktive, fullførte, totalInntekt, utestående };
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      AKTIV: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Aktiv' },
      FULLFØRT: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Fullført' },
      PLANLAGT: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Planlagt' },
      KANSELLERT: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Kansellert' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getTypeLabel = (type: string) => {
    const typeLabels = {
      KJØREOPPLÆRING: 'Kjøreopplæring',
      INTENSIVKURS: 'Intensivkurs',
      KOMPLETT_PAKKE: 'Komplett Pakke',
      OPPFRISKNING: 'Oppfriskning',
      MOTORSYKKEL: 'Motorsykkel'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
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
            Bedrift Kontrakter
          </h1>
          <p className="text-gray-600">
            Oversikt over alle kontrakter for bedrift #{bedriftId}
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
                <p className="text-sm font-medium text-gray-600">Totale Kontrakter</p>
                <p className="text-2xl font-bold text-gray-900">{kontrakter.length}</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border px-2 py-1"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Inntekt</p>
                <p className="text-2xl font-bold text-gray-900">{statistikk.totalInntekt.toLocaleString()} kr</p>
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border px-2 py-1 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 cards-spacing-grid">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Søk</label>
              <input
                type="text"
                placeholder="Søk etter kontrakt, elev eller ID..."
                value={søketerm}
                onChange={(e) => setSøketerm(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="alle">Alle statuser</option>
                <option value="AKTIV">Aktiv</option>
                <option value="FULLFØRT">Fullført</option>
                <option value="PLANLAGT">Planlagt</option>
                <option value="KANSELLERT">Kansellert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="alle">Alle typer</option>
                <option value="KJØREOPPLÆRING">Kjøreopplæring</option>
                <option value="INTENSIVKURS">Intensivkurs</option>
                <option value="KOMPLETT_PAKKE">Komplett Pakke</option>
                <option value="OPPFRISKNING">Oppfriskning</option>
                <option value="MOTORSYKKEL">Motorsykkel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sorter etter</label>
              <select
                value={`${sortBy}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setSortBy(field as 'tittel' | 'startdato' | 'fremgang' | 'totalSum');
                  setSortDirection(direction as 'asc' | 'desc');
                }}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="startdato-desc">Startdato (nyest først)</option>
                <option value="startdato-asc">Startdato (eldst først)</option>
                <option value="totalSum-desc">Totalsum (høyest først)</option>
                <option value="totalSum-asc">Totalsum (lavest først)</option>
                <option value="fremgang-desc">Fremgang (høyest først)</option>
                <option value="fremgang-asc">Fremgang (lavest først)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Kontrakter Tabell */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-2 py-1 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Kontrakter ({filteredKontrakter.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kontrakt
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Elev
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Periode
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fremgang
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Økonomi
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Handlinger
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredKontrakter.map((kontrakt, index) => (
                  <motion.tr
                    key={kontrakt.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-2 py-1 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{kontrakt.tittel}</div>
                        <div className="text-sm text-gray-500">#{kontrakt.id}</div>
                      </div>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                                              <div className="text-sm text-gray-900">{kontrakt.instruktør}</div>
                      <div className="text-sm text-gray-500">{kontrakt.kategori}</div>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getTypeLabel(kontrakt.type)}</div>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{kontrakt.startdato}</div>
                      <div className="text-sm text-gray-500">til {kontrakt.sluttdato}</div>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${kontrakt.fremgang}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-900">{kontrakt.fremgang}%</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {kontrakt.timerFullført}/{kontrakt.timerTotalt} timer
                      </div>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{kontrakt.betaltSum.toLocaleString()} kr</div>
                      <div className="text-sm text-gray-500">av {kontrakt.totalSum.toLocaleString()} kr</div>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      {getStatusBadge(kontrakt.status)}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => console.log('Vis dokument')} className="text-blue-600 hover:text-blue-900 mr-3">
                        Vis
                      </button>
                      <button onClick={() => console.log('Rediger')} className="text-green-600 hover:text-green-900 mr-3">
                        Rediger
                      </button>
                      <button onClick={() => console.log('Eksporter data')} className="text-gray-600 hover:text-gray-900">
                        Eksporter
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Eksport Button */}
        <div className="mt-6 flex justify-end">
          <button onClick={() => console.log('Eksporter data')} className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Eksporter alle kontrakter
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BedriftKontrakter; 