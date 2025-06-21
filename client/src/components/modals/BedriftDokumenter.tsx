import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { bedriftDokumenterService, BedriftDokument, DokumentStatistikk } from '../../services/bedrift-dokumenter.service';

const BedriftDokumenter: React.FC = () => {
  const { bedriftId } = useParams<{ bedriftId: string }>();
  const [dokumenter, setDokumenter] = useState<BedriftDokument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('ALLE');
  const [statusFilter, setStatusFilter] = useState('ALLE');
  const [sortField, setSortField] = useState('opplastet');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    if (bedriftId) {
      lastDokumenter();
    }
  }, [bedriftId]);

  const lastDokumenter = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dokumenterData = await bedriftDokumenterService.hentDokumenter(bedriftId!);
      setDokumenter(dokumenterData);
    } catch (err) {
      setError('Kunne ikke laste dokumenter');
      console.error('Feil ved lasting av dokumenter:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter og sorter dokumenter
  const filteredDokumenter = useMemo(() => {
    let filtered = dokumenter.filter((dokument: BedriftDokument) => {
      const matchesSearch = dokument.navn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dokument.beskrivelse.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dokument.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesKategori = kategoriFilter === 'ALLE' || dokument.kategori === kategoriFilter;
      const matchesStatus = statusFilter === 'ALLE' || dokument.status === statusFilter;
      
      return matchesSearch && matchesKategori && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortField as keyof typeof a];
      let bValue = b[sortField as keyof typeof b];
      
      // Håndter undefined-verdier
      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';
      
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
  }, [dokumenter, searchTerm, kategoriFilter, statusFilter, sortField, sortDirection]);

  // Statistikk
  const statistikk = useMemo(() => {
    const totalt = dokumenter.length;
    const godkjente = dokumenter.filter((d: BedriftDokument) => d.status === 'GODKJENT').length;
    const underReview = dokumenter.filter((d: BedriftDokument) => d.status === 'UNDER_REVIEW').length;
    const totalStørrelse = dokumenter.reduce((sum: number, d: BedriftDokument) => {
      if (!d.størrelse) return sum;
      const størrelseNum = parseFloat(d.størrelse.split(' ')[0]);
      const enhet = d.størrelse.split(' ')[1];
      return sum + (enhet === 'MB' ? størrelseNum : størrelseNum / 1024);
    }, 0);
    
    return { totalt, godkjente, underReview, totalStørrelse: totalStørrelse.toFixed(1) };
  }, [dokumenter]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      GODKJENT: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Godkjent' },
      AKTIV: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Aktiv' },
      UNDER_REVIEW: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Under review' },
      ARKIVERT: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Arkivert' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getKategoriLabel = (kategori: string) => {
    const kategoriLabels = {
      REGISTRERING: 'Registrering',
      FORSIKRING: 'Forsikring',
      KONTRAKT: 'Kontrakt',
      HMS: 'HMS',
      REGNSKAP: 'Regnskap',
      UTDANNING: 'Utdanning'
    };
    return kategoriLabels[kategori as keyof typeof kategoriLabels] || kategori;
  };

  const getFileIcon = (type: string) => {
    const iconMap = {
      PDF: (
        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      ),
      DOCX: (
        <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      ),
      XLSX: (
        <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      )
    };
    return iconMap[type as keyof typeof iconMap] || iconMap.PDF;
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
            Bedrift Dokumenter
          </h1>
          <p className="text-gray-600">
            Dokumentarkiv for bedrift #{bedriftId}
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
                <p className="text-sm font-medium text-gray-600">Totale Dokumenter</p>
                <p className="text-2xl font-bold text-gray-900">{statistikk.totalt}</p>
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
                <p className="text-sm font-medium text-gray-600">Godkjente</p>
                <p className="text-2xl font-bold text-gray-900">{statistikk.godkjente}</p>
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
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-gray-900">{statistikk.underReview}</p>
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Størrelse</p>
                <p className="text-2xl font-bold text-gray-900">{statistikk.totalStørrelse} MB</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border px-2 py-1 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between cards-spacing-grid">
            <div className="grid grid-cols-1 md:grid-cols-4 cards-spacing-grid flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Søk</label>
                <input
                  type="text"
                  placeholder="Søk i dokumenter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <select
                  value={kategoriFilter}
                  onChange={(e) => setKategoriFilter(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALLE">Alle kategorier</option>
                  <option value="REGISTRERING">Registrering</option>
                  <option value="FORSIKRING">Forsikring</option>
                  <option value="KONTRAKT">Kontrakt</option>
                  <option value="HMS">HMS</option>
                  <option value="REGNSKAP">Regnskap</option>
                  <option value="UTDANNING">Utdanning</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALLE">Alle statuser</option>
                  <option value="GODKJENT">Godkjent</option>
                  <option value="AKTIV">Aktiv</option>
                  <option value="UNDER_REVIEW">Under review</option>
                  <option value="ARKIVERT">Arkivert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sorter etter</label>
                <select
                  value={`${sortField}-${sortDirection}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-');
                    setSortField(field);
                    setSortDirection(direction as 'asc' | 'desc');
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="opplastet-desc">Opplastet (nyest først)</option>
                  <option value="opplastet-asc">Opplastet (eldst først)</option>
                  <option value="navn-asc">Navn (A-Z)</option>
                  <option value="navn-desc">Navn (Z-A)</option>
                  <option value="størrelse-desc">Størrelse (største først)</option>
                  <option value="størrelse-asc">Størrelse (minste først)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm font-medium border ${
                    viewMode === 'list'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm font-medium border-t border-r border-b ${
                    viewMode === 'grid'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>

              <button onClick={() => console.log('Last opp fil')} className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Last opp
              </button>
            </div>
          </div>
        </div>

        {/* Dokumenter Visning */}
        {viewMode === 'list' ? (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-2 py-1 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Dokumenter ({filteredDokumenter.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dokument
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Størrelse
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opplastet
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
                  {filteredDokumenter.map((dokument, index) => (
                    <motion.tr
                      key={dokument.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-2 py-1 whitespace-nowrap">
                        <div className="flex items-center">
                          {getFileIcon(dokument.type)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{dokument.navn}</div>
                            <div className="text-sm text-gray-500">{dokument.beskrivelse}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getKategoriLabel(dokument.kategori)}</div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{dokument.størrelse}</div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{dokument.opplastet}</div>
                        <div className="text-sm text-gray-500">av {dokument.opplastetAv}</div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        {getStatusBadge(dokument.status)}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => console.log('Last ned dokument')} className="text-blue-600 hover:text-blue-900 mr-3">
                          Last ned
                        </button>
                        <button onClick={() => console.log('Vis dokument')} className="text-green-600 hover:text-green-900 mr-3">
                          Vis
                        </button>
                        <button onClick={() => window.confirm('Er du sikker på at du vil slette?') && console.log('Slett')} className="text-red-600 hover:text-red-900">
                          Slett
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 cards-spacing-grid">
            {filteredDokumenter.map((dokument, index) => (
              <motion.div
                key={dokument.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow px-2 py-1"
              >
                <div className="flex items-center justify-between mb-4">
                  {getFileIcon(dokument.type)}
                  {getStatusBadge(dokument.status)}
                </div>
                
                <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                  {dokument.navn}
                </h3>
                
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  {dokument.beskrivelse}
                </p>
                
                <div className="space-y-6 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Kategori:</span>
                    <span>{getKategoriLabel(dokument.kategori)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Størrelse:</span>
                    <span>{dokument.størrelse}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Opplastet:</span>
                    <span>{dokument.opplastet}</span>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-4">
                  <button onClick={() => console.log('Last ned dokument')} className="flex-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded">
                    Last ned
                  </button>
                  <button onClick={() => console.log('Vis dokument')} className="flex-1 text-xs bg-green-50 text-green-600 hover:bg-green-100 px-2 py-1 rounded">
                    Vis
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BedriftDokumenter; 