import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { rapporterService, type RapportData } from '../../services/rapporter.service';

const BedriftRapporter: React.FC = () => {
  const { bedriftId } = useParams<{ bedriftId: string }>();
  const [rapporter, setRapporter] = useState<RapportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('alle');
  const [filterStatus, setFilterStatus] = useState<string>('alle');
  const [søketerm, setSøketerm] = useState('');
  const [sortField, setSortField] = useState('generert');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedRapport, setSelectedRapport] = useState<string | null>(null);

  // Hent rapporter når komponenten laster
  useEffect(() => {
    hentRapporter();
  }, [bedriftId]);

  const hentRapporter = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await rapporterService.hentBedriftRapporter(bedriftId);
      setRapporter(data);
    } catch (error) {
      console.error('Feil ved henting av rapporter:', error);
      setError('Kunne ikke laste rapporter. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (rapportId: string, navn: string) => {
    try {
      const blob = await rapporterService.lastNedRapport(rapportId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = navn;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Feil ved nedlasting:', error);
      alert('Feil ved nedlasting av rapport');
    }
  };

  // Filter og sorter rapporter
  const filteredRapporter = useMemo(() => {
    let filtered = rapporter.filter(rapport => {
      const matchesSearch = rapport.navn.toLowerCase().includes(søketerm.toLowerCase()) ||
                           rapport.beskrivelse.toLowerCase().includes(søketerm.toLowerCase()) ||
                           rapport.periode.toLowerCase().includes(søketerm.toLowerCase());
      const matchesType = filterType === 'alle' || rapport.type === filterType;
      const matchesStatus = filterStatus === 'alle' || rapport.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortField as keyof typeof a];
      let bValue = b[sortField as keyof typeof b];
      
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
  }, [rapporter, søketerm, filterType, filterStatus, sortField, sortDirection]);

  // Statistikk
  const statistikk = useMemo(() => {
    const totalt = rapporter.length;
    const ferdig = rapporter.filter(r => r.status === 'FERDIG').length;
    const denneMåned = rapporter.filter(r => 
      r.generert.includes('2025-06') || r.periode.includes('Juni') || r.periode.includes('Uke 23')
    ).length;
    const totalStørrelse = rapporter
      .filter(r => r.status === 'FERDIG')
      .reduce((sum, r) => {
        const størrelseNum = parseFloat(r.størrelse.split(' ')[0]);
        const enhet = r.størrelse.split(' ')[1];
        return sum + (enhet === 'MB' ? størrelseNum : størrelseNum / 1024);
      }, 0);
    
    return { totalt, ferdig, denneMåned, totalStørrelse: totalStørrelse.toFixed(1) };
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      FERDIG: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Ferdig' },
      UNDER_GENERERING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Genereres' },
      FEILET: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Feilet' },
      PLANLAGT: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Planlagt' }
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
      UKENTLIG: 'Ukentlig',
      MÅNEDLIG: 'Månedlig',
      KVARTALSVIS: 'Kvartalsvis',
      ÅRLIG: 'Årlig',
      AD_HOC: 'Ad-hoc'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const getKategoriLabel = (kategori: string) => {
    const kategoriLabels = {
      AKTIVITET: 'Aktivitet',
      ØKONOMI: 'Økonomi',
      UTDANNING: 'Utdanning',
      SIKKERHET: 'Sikkerhet',
      RESSURSER: 'Ressurser',
      ÅRLIG: 'Årlig oversikt'
    };
    return kategoriLabels[kategori as keyof typeof kategoriLabels] || kategori;
  };

  const getFormatIcon = (format: string) => {
    const iconMap = {
      PDF: (
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      ),
      XLSX: (
        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      )
    };
    return iconMap[format as keyof typeof iconMap] || iconMap.PDF;
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
            Bedrift Rapporter
          </h1>
          <p className="text-gray-600">
            Rapporter og analyser for bedrift #{bedriftId}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Totale Rapporter</p>
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
                <p className="text-sm font-medium text-gray-600">Ferdigstilte</p>
                <p className="text-2xl font-bold text-gray-900">{statistikk.ferdig}</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Denne måneden</p>
                <p className="text-2xl font-bold text-gray-900">{statistikk.denneMåned}</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total størrelse</p>
                <p className="text-2xl font-bold text-gray-900">{statistikk.totalStørrelse} MB</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border px-2 py-1 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between cards-spacing-grid">
            <div className="grid grid-cols-1 md:grid-cols-5 cards-spacing-grid flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Søk</label>
                <input
                  type="text"
                  placeholder="Søk i rapporter..."
                  value={søketerm}
                  onChange={(e) => setSøketerm(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="alle">Alle kategorier</option>
                  <option value="AKTIVITET">Aktivitet</option>
                  <option value="ØKONOMI">Økonomi</option>
                  <option value="UTDANNING">Utdanning</option>
                  <option value="SIKKERHET">Sikkerhet</option>
                  <option value="RESSURSER">Ressurser</option>
                  <option value="ÅRLIG">Årlig oversikt</option>
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
                  <option value="UKENTLIG">Ukentlig</option>
                  <option value="MÅNEDLIG">Månedlig</option>
                  <option value="KVARTALSVIS">Kvartalsvis</option>
                  <option value="ÅRLIG">Årlig</option>
                  <option value="AD_HOC">Ad-hoc</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="alle">Alle statuser</option>
                  <option value="FERDIG">Ferdig</option>
                  <option value="UNDER_GENERERING">Under generering</option>
                  <option value="FEILET">Feilet</option>
                  <option value="PLANLAGT">Planlagt</option>
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
                  <option value="generert-desc">Generert (nyest først)</option>
                  <option value="generert-asc">Generert (eldst først)</option>
                  <option value="navn-asc">Navn (A-Z)</option>
                  <option value="navn-desc">Navn (Z-A)</option>
                  <option value="størrelse-desc">Størrelse (største først)</option>
                  <option value="størrelse-asc">Størrelse (minste først)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => console.log('Button clicked')} className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Ny rapport
              </button>
              <button onClick={() => console.log('Eksporter data')} className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Eksporter alle
              </button>
            </div>
          </div>
        </div>

        {/* Rapporter Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 cards-spacing-grid">
          {filteredRapporter.map((rapport, index) => (
            <motion.div
              key={rapport.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow px-2 py-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  {getFormatIcon(rapport.format)}
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                      {rapport.navn}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{getTypeLabel(rapport.type)}</span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-gray-500">{getKategoriLabel(rapport.kategori)}</span>
                    </div>
                  </div>
                </div>
                {getStatusBadge(rapport.status)}
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {rapport.beskrivelse}
              </p>
              
              <div className="space-y-6 text-sm text-gray-500 mb-4">
                <div className="flex justify-between">
                  <span>Periode:</span>
                  <span className="font-medium">{rapport.periode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Generert:</span>
                  <span>{rapport.generert}</span>
                </div>
                <div className="flex justify-between">
                  <span>Størrelse:</span>
                  <span>{rapport.størrelse}</span>
                </div>
              </div>

              {/* Nøkkeltall preview */}
              {rapport.parameters && (
                <div className="bg-gray-50 rounded-lg px-2 py-1 mb-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Nøkkeltall:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(rapport.parameters).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                        <span className="font-medium text-gray-900">
                          {typeof value === 'number' && value > 1000 
                            ? value.toLocaleString() 
                            : value}
                          {key.includes('margin') || key.includes('Utnyttelse') ? '%' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-4">
                {rapport.status === 'FERDIG' ? (
                  <>
                    <button onClick={() => console.log('Vis dokument')} className="flex-1 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded-md flex items-center justify-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Vis
                    </button>
                    <button onClick={() => handleDownload(rapport.id, rapport.navn)} className="flex-1 text-sm bg-green-50 text-green-600 hover:bg-green-100 px-2 py-1 rounded-md flex items-center justify-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Last ned
                    </button>
                  </>
                ) : rapport.status === 'UNDER_GENERERING' ? (
                  <button disabled className="w-full text-sm bg-yellow-50 text-yellow-600 px-2 py-1 rounded-md flex items-center justify-center">
                    <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Genereres...
                  </button>
                ) : (
                  <button onClick={() => console.log('Button clicked')} className="w-full text-sm bg-gray-50 text-gray-600 px-2 py-1 rounded-md">
                    Ikke tilgjengelig
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredRapporter.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen rapporter funnet</h3>
            <p className="mt-1 text-sm text-gray-500">Prøv å justere søke- og filtreringsparameterne.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BedriftRapporter; 