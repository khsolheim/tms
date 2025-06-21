import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { rapporterService, type SikkerhetsRapport } from '../../services/rapporter.service';

const SikkerhetskontrollRapporter: React.FC = () => {
  const [sikkerhetsRapporter, setSikkerhetsRapporter] = useState<SikkerhetsRapport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALLE');
  const [statusFilter, setStatusFilter] = useState('ALLE');
  const [sortField, setSortField] = useState('generert');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedRapport, setSelectedRapport] = useState<string | null>(null);

  // Hent sikkerhetskontroll rapporter når komponenten laster
  useEffect(() => {
    hentSikkerhetsRapporter();
  }, []);

  const hentSikkerhetsRapporter = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await rapporterService.hentSikkerhetsRapporter();
      setSikkerhetsRapporter(data);
    } catch (error) {
      console.error('Feil ved henting av sikkerhetskontroll-rapporter:', error);
      setError('Kunne ikke laste sikkerhetskontroll-rapporter. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (rapportId: string, tittel: string) => {
    try {
      const blob = await rapporterService.lastNedRapport(rapportId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tittel}.pdf`;
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
    let filtered = sikkerhetsRapporter.filter(rapport => {
      const matchesSearch = rapport.tittel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rapport.periode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'ALLE' || rapport.type === typeFilter;
      const matchesStatus = statusFilter === 'ALLE' || rapport.status === statusFilter;
      
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
  }, [sikkerhetsRapporter, searchTerm, typeFilter, statusFilter, sortField, sortDirection]);

  // Statistikk
  const statistikk = useMemo(() => {
    const totalt = sikkerhetsRapporter.filter(r => r.status === 'FERDIG').length;
    const kritiskeAvvik = sikkerhetsRapporter
      .filter(r => r.status === 'FERDIG')
      .reduce((sum, r) => sum + r.kritiskeAvvik, 0);
    const gjennomsnittBestått = sikkerhetsRapporter
      .filter(r => r.status === 'FERDIG' && r.beståtteProsent > 0)
      .reduce((sum, r) => sum + r.beståtteProsent, 0) / 
      sikkerhetsRapporter.filter(r => r.status === 'FERDIG' && r.beståtteProsent > 0).length;
    const høyRisiko = sikkerhetsRapporter.filter(r => 
      r.risikoscore === 'KRITISK' || r.risikoscore === 'HØY'
    ).length;
    
    return { 
      totalt, 
      kritiskeAvvik, 
      gjennomsnittBestått: Math.round(gjennomsnittBestått) || 0, 
      høyRisiko 
    };
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      FERDIG: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Ferdig' },
      UNDER_GENERERING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Genereres' },
      FEILET: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Feilet' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getRisikoBadge = (risiko: string) => {
    const risikoConfig = {
      LAV: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Lav risiko' },
      MODERAT: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Moderat risiko' },
      HØY: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Høy risiko' },
      KRITISK: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Kritisk risiko' },
      UKJENT: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Ukjent' }
    };
    
    const config = risikoConfig[risiko as keyof typeof risikoConfig];
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
            Sikkerhetskontroll Rapporter
          </h1>
          <p className="text-gray-600">
            Oversikt over alle sikkerhetsrapporter og analyser
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
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Kritiske Avvik</p>
                <p className="text-2xl font-bold text-gray-900">{statistikk.kritiskeAvvik}</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gjennomsnitt Bestått</p>
                <p className="text-2xl font-bold text-gray-900">{statistikk.gjennomsnittBestått}%</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Høy/Kritisk Risiko</p>
                <p className="text-2xl font-bold text-gray-900">{statistikk.høyRisiko}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border px-2 py-1 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 cards-spacing-grid">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Søk</label>
              <input
                type="text"
                placeholder="Søk i rapporter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALLE">Alle typer</option>
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALLE">Alle statuser</option>
                <option value="FERDIG">Ferdig</option>
                <option value="UNDER_GENERERING">Genereres</option>
                <option value="FEILET">Feilet</option>
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
                <option value="kritiskeAvvik-desc">Kritiske avvik (flest først)</option>
                <option value="beståtteProsent-asc">Bestått % (lavest først)</option>
                <option value="beståtteProsent-desc">Bestått % (høyest først)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rapporter Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
          {filteredRapporter.map((rapport, index) => (
            <motion.div
              key={rapport.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow px-2 py-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {rapport.tittel}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{getTypeLabel(rapport.type)}</span>
                    <span>•</span>
                    <span>{rapport.periode}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {getStatusBadge(rapport.status)}
                  {getRisikoBadge(rapport.risikoscore)}
                </div>
              </div>

              {rapport.status === 'FERDIG' && (
                <>
                  {/* Nøkkeltall */}
                  <div className="grid grid-cols-3 cards-spacing-grid mb-4">
                    <div className="text-center bg-gray-50 rounded-lg px-2 py-1">
                      <div className="text-lg font-bold text-gray-900">{rapport.totaleKontroller}</div>
                      <div className="text-xs text-gray-600">Kontroller</div>
                    </div>
                    <div className="text-center bg-green-50 rounded-lg px-2 py-1">
                      <div className="text-lg font-bold text-green-600">{rapport.beståtteProsent}%</div>
                      <div className="text-xs text-gray-600">Bestått</div>
                    </div>
                    <div className="text-center bg-red-50 rounded-lg px-2 py-1">
                      <div className="text-lg font-bold text-red-600">{rapport.kritiskeAvvik}</div>
                      <div className="text-xs text-gray-600">Kritiske avvik</div>
                    </div>
                  </div>

                  {/* Kategorier */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Kontroller per kategori:</h4>
                    <div className="space-y-6">
                      {Object.entries(rapport.kategorier).map(([kategori, data]) => (
                        <div key={kategori} className="flex items-center justify-between text-sm">
                          <span className="capitalize text-gray-600">{kategori}:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">{data.bestått} bestått</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-red-600">{data.avvik} avvik</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hovedfunn */}
                  {rapport.hovedfunn.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Hovedfunn:</h4>
                      <ul className="space-y-1">
                        {rapport.hovedfunn.slice(0, 3).map((funn, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{funn}</span>
                          </li>
                        ))}
                      </ul>
                      {rapport.hovedfunn.length > 3 && (
                        <div className="text-xs text-gray-500 mt-1">
                          +{rapport.hovedfunn.length - 3} flere funn...
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {rapport.status === 'UNDER_GENERERING' && (
                <div className="text-center py-1">
                  <svg className="animate-spin w-8 h-8 text-yellow-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <div className="text-sm text-gray-600">Rapport genereres...</div>
                </div>
              )}

              <div className="text-xs text-gray-500 mb-4">
                Generert: {rapport.generert}
              </div>

              <div className="flex gap-4">
                {rapport.status === 'FERDIG' ? (
                  <>
                    <button onClick={() => console.log('Vis dokument')} className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded-md text-sm font-medium flex items-center justify-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Vis detaljer
                    </button>
                    <button onClick={() => handleDownload(rapport.id, rapport.tittel)} className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 px-2 py-1 rounded-md text-sm font-medium flex items-center justify-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Last ned
                    </button>
                  </>
                ) : (
                  <button disabled className="w-full bg-gray-50 text-gray-400 px-2 py-1 rounded-md text-sm">
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

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end cards-spacing-grid">
          <button onClick={() => console.log('Button clicked')} className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Generer ny rapport
          </button>
          <button onClick={() => console.log('Eksporter data')} className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Eksporter alle
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SikkerhetskontrollRapporter; 