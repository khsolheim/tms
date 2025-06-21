import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCar, FaChevronRight, FaTrophy, FaBullseye, FaClock, FaPlay, FaArrowLeft } from 'react-icons/fa';
import BilBuilder from '../../../components/sikkerhetskontroll/BilBuilder';

interface SikkerhetskontrollKategori {
  id: number;
  navn: string;
  beskrivelse?: string;
  ikonUrl?: string;
  farge?: string;
  rekkefolge: number;
  sporsmal: Array<{
    id: number;
    sporsmalTekst: string;
    vanskelighetsgrad: string;
    rekkefolge: number;
  }>;
}

interface SikkerhetskontrollKlasse {
  id: number;
  navn: string;
  beskrivelse: string;
  ikonUrl?: string;
  kategorier: SikkerhetskontrollKategori[];
}

interface ElevProgresjon {
  elevBil: {
    id: number;
    bilNavn?: string;
    totalProgresjon: number;
    monterdeDeler: any[];
  };
  totalProgresjon: number;
  kategorier: {
    kategori: {
      id: number;
      navn: string;
      beskrivelse?: string;
      ikonUrl?: string;
      farge?: string;
    };
    totaleSporšmal: number;
    seTteSporšmal: number;
    mestredeSporšmal: number;
    progresjonsProsentSett: number;
    progresjonsProsentMestret: number;
  }[];
}

const KlasseOversikt: React.FC = () => {
  const { klasseId } = useParams<{ klasseId: string }>();
  const [klasse, setKlasse] = useState<SikkerhetskontrollKlasse | null>(null);
  const [bilStatus, setBilStatus] = useState<any>(null);
  const [progresjon, setProgresjon] = useState<ElevProgresjon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (klasseId) {
      fetchKlasseData();
      fetchProgresjon();
      fetchBilStatus();
    }
  }, [klasseId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchKlasseData = async () => {
    try {
      const response = await fetch(`/api/sikkerhetskontroll-laering/klasser/${klasseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Kunne ikke hente klassedata');
      }

      const data = await response.json();
      setKlasse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ukjent feil');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgresjon = async () => {
    try {
      const response = await fetch(`/api/sikkerhetskontroll-laering/progresjon/klasse/${klasseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Kunne ikke hente progresjon');
      }

      const data = await response.json();
      setProgresjon(data);
    } catch (err) {
      console.error('Feil ved henting av progresjon:', err);
    }
  };

  const fetchBilStatus = async () => {
    try {
      const response = await fetch(`/api/sikkerhetskontroll-laering/klasser/${klasseId}/bil-status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        console.warn('Kunne ikke hente bil-status - fortsetter uten denne data');
        return;
      }

      const data = await response.json();
      setBilStatus(data);
    } catch (err) {
      console.warn('Feil ved henting av bil-status:', err);
    }
  };

  const getKategoriFarge = (farge?: string) => {
    if (!farge) return 'bg-gray-100 text-gray-600';
    
    const fargeMap: { [key: string]: string } = {
      '#ef4444': 'bg-red-100 text-red-600 border-red-200',
      '#f59e0b': 'bg-yellow-100 text-yellow-600 border-yellow-200',
      '#10b981': 'bg-green-100 text-green-600 border-green-200',
      '#3b82f6': 'bg-blue-100 text-blue-600 border-blue-200',
      '#8b5cf6': 'bg-purple-100 text-purple-600 border-purple-200'
    };
    
    return fargeMap[farge] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getProgresjonsInfo = (kategoriId: number) => {
    if (!progresjon) return null;
    return progresjon.kategorier.find(k => k.kategori.id === kategoriId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !klasse) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg px-2 py-1">
        <p className="text-red-800">Feil: {error || 'Klasse ikke funnet'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 py-1 cards-spacing-vertical">
      {/* Tilbake-knapp og Header */}
      <div className="cards-spacing-vertical">
        <Link 
          to="/sikkerhetskontroll-laering"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Tilbake til oversikt</span>
        </Link>

        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
            <FaCar className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{klasse.navn}</h1>
            <p className="text-lg text-gray-600">{klasse.beskrivelse}</p>
          </div>
        </div>
      </div>

      {/* Bil-progresjon (visuell metafor) */}
      {progresjon && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-2 py-1 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Din Bil</h2>
            <span className="text-2xl font-bold text-blue-600">
              {Math.round(progresjon.totalProgresjon)}% ferdig
            </span>
          </div>
          
          {/* Progresjonsbalk */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progresjon.totalProgresjon}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Bygg bilen din ved å mestre kategoriene!</span>
            <span>
              {progresjon.kategorier.reduce((sum, k) => sum + k.mestredeSporšmal, 0)} / {progresjon.kategorier.reduce((sum, k) => sum + k.totaleSporšmal, 0)} spørsmål mestret
            </span>
          </div>
        </div>
      )}

      {/* Statistikk kort */}
      {progresjon && (
        <div className="grid grid-cols-1 md:grid-cols-3 cards-spacing-grid">
          <div className="bg-white border border-gray-200 rounded-lg px-2 py-1">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaBullseye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Progresjon</p>
                <p className="text-xl font-bold text-gray-900">{Math.round(progresjon.totalProgresjon)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg px-2 py-1">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaTrophy className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Kategorier Mestret</p>
                <p className="text-xl font-bold text-gray-900">
                  {progresjon.kategorier.filter(k => k.progresjonsProsentMestret === 100).length} / {progresjon.kategorier.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg px-2 py-1">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaClock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Øvetid i dag</p>
                <p className="text-xl font-bold text-gray-900">0 min</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kategorier Grid */}
      <div className="cards-spacing-vertical">
        <h2 className="text-2xl font-bold text-gray-900">Kategorier</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
          {klasse.kategorier.map((kategori) => {
            const progresjonsInfo = getProgresjonsInfo(kategori.id);
            
            return (
              <Link
                key={kategori.id}
                to={`/sikkerhetskontroll-laering/kategori/${kategori.id}`}
                className="group bg-white border border-gray-200 rounded-xl px-2 py-1 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
              >
                <div className="cards-spacing-vertical">
                  {/* Kategori Header */}
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getKategoriFarge(kategori.farge)}`}>
                      <FaCar className="w-6 h-6" />
                    </div>
                    <FaChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {kategori.navn}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{kategori.beskrivelse}</p>
                  </div>

                  {/* Progresjon for denne kategorien */}
                  {progresjonsInfo && (
                    <div className="space-y-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progresjon</span>
                        <span className="font-medium text-gray-900">
                          {Math.round(progresjonsInfo.progresjonsProsentMestret)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progresjonsInfo.progresjonsProsentMestret}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Statistikk */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{kategori.sporsmal.length} spørsmål</span>
                    {progresjonsInfo && (
                      <span>{progresjonsInfo.mestredeSporšmal} mestret</span>
                    )}
                  </div>

                  {/* Status badge */}
                  {progresjonsInfo && (
                    <div className="pt-2">
                      {progresjonsInfo.progresjonsProsentMestret === 100 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Fullført
                        </span>
                      ) : progresjonsInfo.progresjonsProsentSett > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          📚 Pågående
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          ⭐ Ny
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row cards-spacing-grid">
        <button onClick={() => console.log('Kjør test')} className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 transition-colors">
          <FaPlay className="w-4 h-4" />
          <span>Start Smart Test</span>
        </button>
        
        <button onClick={() => console.log('Button clicked')} className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-200 transition-colors">
          <FaTrophy className="w-4 h-4" />
          <span>Se Achievements</span>
        </button>
      </div>

      {/* Bil Builder */}
      {bilStatus ? (
        <BilBuilder 
          klasse={bilStatus.klasse}
          kategorier={bilStatus.kategorier}
          compact={false}
        />
      ) : (
        <BilBuilder 
          klasse={klasse || { id: 0, navn: 'Ukjent klasse' }}
          kategorier={klasse?.kategorier?.map(k => ({ ...k, mestret: false })) || []}
          compact={false}
        />
      )}
    </div>
  );
};

export default KlasseOversikt; 