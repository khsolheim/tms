import React, { useState, useEffect } from 'react';
import { Search, Filter, Tag, ExternalLink, Gift, Star, Clock, Users } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface Fordel {
  id: number;
  tittel: string;
  beskrivelse: string;
  rabattKode?: string;
  rabattProsent?: number;
  rabattBelop?: number;
  gyldigFra?: string;
  gyldigTil?: string;
  maksAntallBruk?: number;
  antallBrukt: number;
  vilkar?: string;
  bildeUrl?: string;
  linkUrl?: string;
}

interface FordelItem {
  id: number;
  type: 'annonsor' | 'sponsor';
  navn: string;
  beskrivelse?: string;
  logoUrl?: string;
  hjemmeside?: string;
  kategori: string;
  prioritet: number;
  fordeler: Fordel[];
  bedrift?: {
    id: number;
    navn: string;
    organisasjonsnummer: string;
  };
}

interface FordelResponse {
  fordeler: FordelItem[];
  total: number;
  limit: number;
  offset: number;
}

const Fordeler: React.FC = () => {
  const [fordeler, setFordeler] = useState<FordelItem[]>([]);
  const [kategorier, setKategorier] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  const [selectedType, setSelectedType] = useState<'alle' | 'annonsor' | 'sponsor'>('alle');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    fetchFordeler();
    fetchKategorier();
  }, [searchTerm, selectedKategori, selectedType, offset]);

  const fetchFordeler = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
      
      if (searchTerm) params.append('soek', searchTerm);
      if (selectedKategori) params.append('kategori', selectedKategori);
      if (selectedType !== 'alle') params.append('type', selectedType);
      
      const response = await fetch(`${API_BASE_URL}/fordeler?${params}`);
      
      if (!response.ok) {
        throw new Error('Feil ved henting av fordeler');
      }
      
      const data: FordelResponse = await response.json();
      setFordeler(data.fordeler);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ukjent feil');
    } finally {
      setLoading(false);
    }
  };

  const fetchKategorier = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/fordeler/kategorier`);
      
      if (!response.ok) {
        throw new Error('Feil ved henting av kategorier');
      }
      
      const data: string[] = await response.json();
      setKategorier(data);
    } catch (err) {
      console.error('Feil ved henting av kategorier:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    fetchFordeler();
  };

  const handleKlikkPaFordel = async (type: 'annonsor' | 'sponsor', id: number, linkUrl?: string) => {
    try {
      // Registrer klikk
      await fetch(`${API_BASE_URL}/fordeler/klikk/${type}/${id}`, {
        method: 'POST',
      });
      
      // Åpne lenke hvis den finnes
      if (linkUrl) {
        window.open(linkUrl, '_blank');
      }
    } catch (err) {
      console.error('Feil ved registrering av klikk:', err);
    }
  };

  const formatRabatt = (fordel: Fordel): string => {
    if (fordel.rabattProsent) {
      return `${fordel.rabattProsent}% rabatt`;
    }
    if (fordel.rabattBelop) {
      return `${fordel.rabattBelop} kr rabatt`;
    }
    return 'Spesialtilbud';
  };

  const isFordelGyldig = (fordel: Fordel): boolean => {
    if (!fordel.gyldigTil) return true;
    
    const now = new Date();
    const gyldigTil = new Date(fordel.gyldigTil);
    return gyldigTil >= now;
  };

  const isFordelTilgjengelig = (fordel: Fordel): boolean => {
    if (!fordel.maksAntallBruk) return true;
    
    return fordel.antallBrukt < fordel.maksAntallBruk;
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedKategori('');
    setSelectedType('alle');
    setOffset(0);
  };

  if (loading && fordeler.length === 0) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border h-64">
                  <div className="h-32 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Fordeler for Elever
          </h1>
          <p className="text-gray-600">
            Få rabatter og spesialtilbud fra våre annonsører og sponsorer
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Søk etter fordeler..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-5 w-5" />
              Filtrer
            </button>
          </form>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  value={selectedKategori}
                  onChange={(e) => setSelectedKategori(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Alle kategorier</option>
                  {kategorier.map(kategori => (
                    <option key={kategori} value={kategori}>
                      {kategori}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as 'alle' | 'annonsor' | 'sponsor')}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="alle">Alle</option>
                  <option value="annonsor">Annonsører</option>
                  <option value="sponsor">Sponsorer</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Tilbakestill
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {fordeler.length === 0 && !loading ? (
          <div className="text-center py-12">
            <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ingen fordeler funnet
            </h3>
            <p className="text-gray-500">
              Prøv å endre søkekriteriene dine
            </p>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Viser {fordeler.length} av {total} fordeler
              </p>
            </div>

            {/* Fordeler Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {fordeler.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  {/* Logo/Image */}
                  <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg flex items-center justify-center">
                    {item.logoUrl ? (
                      <img
                        src={item.logoUrl}
                        alt={item.navn}
                        className="max-h-20 max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-white font-bold text-xl">
                            {item.navn.charAt(0)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-700">{item.navn}</p>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.navn}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.type === 'sponsor' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {item.type === 'sponsor' ? 'Sponsor' : 'Annonsør'}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          {item.kategori}
                        </span>
                      </div>
                    </div>

                    {item.beskrivelse && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {item.beskrivelse}
                      </p>
                    )}

                    {/* Fordeler */}
                    <div className="space-y-3">
                      {item.fordeler.slice(0, 2).map((fordel) => (
                        <div
                          key={fordel.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            isFordelGyldig(fordel) && isFordelTilgjengelig(fordel)
                              ? 'bg-green-50 border-green-200 hover:bg-green-100'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                          onClick={() => handleKlikkPaFordel(item.type, item.id, fordel.linkUrl)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">
                                {fordel.tittel}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {fordel.beskrivelse}
                              </p>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-green-600 font-medium">
                                  {formatRabatt(fordel)}
                                </span>
                                {fordel.rabattKode && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">
                                    {fordel.rabattKode}
                                  </span>
                                )}
                              </div>
                            </div>
                            {fordel.linkUrl && (
                              <ExternalLink className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          
                          {/* Tilgjengelighet */}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            {fordel.gyldigTil && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Gyldig til {new Date(fordel.gyldigTil).toLocaleDateString()}
                              </div>
                            )}
                            {fordel.maksAntallBruk && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {fordel.maksAntallBruk - fordel.antallBrukt} igjen
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {item.fordeler.length > 2 && (
                        <p className="text-sm text-gray-500 text-center">
                          +{item.fordeler.length - 2} flere fordeler
                        </p>
                      )}
                    </div>

                    {/* Footer */}
                    {item.hjemmeside && (
                      <div className="mt-4 pt-4 border-t">
                        <a
                          href={item.hjemmeside}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                        >
                          Besøk nettside
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {total > limit && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Forrige
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Side {Math.floor(offset / limit) + 1} av {Math.ceil(total / limit)}
                </span>
                <button
                  onClick={() => setOffset(offset + limit)}
                  disabled={offset + limit >= total}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Neste
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Fordeler;