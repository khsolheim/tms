import React, { useState, useEffect, useCallback } from 'react';
// import { Link } from 'react-router-dom'; // ikke brukt
import { FaChevronDown, FaChevronRight, FaPlus, FaEdit, FaTrash, FaSearch, FaCar, FaMotorcycle, FaTruck, FaBus, FaTractor } from 'react-icons/fa';
import api from '../../lib/api';
import { log } from '../../utils/logger';
import { referenceService } from '../../services/reference.service';

interface Kategori {
  id: number;
  navn: string;
  klasse: string;
  underkategorier: Kategori[];
}

interface KlasseKategorier {
  klasse: string;
  beskrivelse: string;
  kategorier: Kategori[];
}

export default function Kategorier() {
  const [nyHovedkategori, setNyHovedkategori] = useState('');
  const [nyUnderkategori, setNyUnderkategori] = useState('');
  const [valgtHovedkategori, setValgtHovedkategori] = useState<number | null>(null);
  const [valgtKlasse, setValgtKlasse] = useState<string | null>(null);
  const [utvidetKategorier, setUtvidetKategorier] = useState<number[]>([]);
  const [utvidetKlasser, setUtvidetKlasser] = useState<string[]>(['B']);
  const [klasseKategorier, setKlasseKategorier] = useState<KlasseKategorier[]>([]);
  const [filtrerTekst, setFiltrerTekst] = useState('');
  const [redigerKategori, setRedigerKategori] = useState<number | null>(null);
  const [redigerTekst, setRedigerTekst] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | { message?: string } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [foererkortKlasser, setFoererkortKlasser] = useState<any[]>([]);

  // Fallback klasser med beskrivelser og ikoner
  const klasseInfoFallback = {
    'B': { beskrivelse: 'Personbil', ikon: FaCar, farge: 'blue' },
    'A1': { beskrivelse: 'Lett motorsykkel', ikon: FaMotorcycle, farge: 'green' },
    'A2': { beskrivelse: 'Mellomklasse motorsykkel', ikon: FaMotorcycle, farge: 'green' }, 
    'A': { beskrivelse: 'Motorsykkel', ikon: FaMotorcycle, farge: 'green' },
    'C1': { beskrivelse: 'Lett lastebil', ikon: FaTruck, farge: 'orange' },
    'C': { beskrivelse: 'Lastebil', ikon: FaTruck, farge: 'orange' },
    'CE': { beskrivelse: 'Vogntog', ikon: FaTruck, farge: 'orange' },
    'D1': { beskrivelse: 'Minibuss', ikon: FaBus, farge: 'purple' },
    'D': { beskrivelse: 'Buss', ikon: FaBus, farge: 'purple' },
    'T': { beskrivelse: 'Traktor', ikon: FaTractor, farge: 'green' },
    'S': { beskrivelse: 'Beltemotorsykkel', ikon: FaMotorcycle, farge: 'gray' },
    'AM146': { beskrivelse: 'Moped', ikon: FaMotorcycle, farge: 'cyan' },
    'AM147': { beskrivelse: 'Tre- og firehjuls moped', ikon: FaMotorcycle, farge: 'cyan' },
    'DROSJE': { beskrivelse: 'Drosje', ikon: FaCar, farge: 'yellow' }
  };

  // Dynamisk klasseInfo basert på API data eller fallback
  const klasseInfo = foererkortKlasser.length > 0 
    ? foererkortKlasser.reduce((acc, klasse) => {
        acc[klasse.kode] = {
          beskrivelse: klasse.beskrivelse,
          ikon: getIkonForKlasse(klasse.kode),
          farge: getFargeForKlasse(klasse.kode)
        };
        return acc;
      }, {} as any)
    : klasseInfoFallback;

  // Hjelpefunksjoner for ikoner og farger
  function getIkonForKlasse(kode: string) {
    if (kode.startsWith('A') || kode.startsWith('AM') || kode === 'S') return FaMotorcycle;
    if (kode.startsWith('C')) return FaTruck;
    if (kode.startsWith('D')) return FaBus;
    if (kode === 'T') return FaTractor;
    return FaCar;
  }

  function getFargeForKlasse(kode: string) {
    if (kode === 'B' || kode === 'BE') return 'blue';
    if (kode.startsWith('A') || kode === 'T') return 'green';
    if (kode.startsWith('C')) return 'orange';
    if (kode.startsWith('D')) return 'purple';
    if (kode.startsWith('AM')) return 'cyan';
    if (kode === 'DROSJE') return 'yellow';
    return 'gray';
  }

  const getFargeKlasser = (farge: string) => {
    const farger = {
      blue: 'bg-blue-500 text-white border-blue-200',
      green: 'bg-green-500 text-white border-green-200',
      orange: 'bg-orange-500 text-white border-orange-200',
      purple: 'bg-purple-500 text-white border-purple-200',
      gray: 'bg-gray-500 text-white border-gray-200',
      cyan: 'bg-cyan-500 text-white border-cyan-200',
      yellow: 'bg-yellow-500 text-white border-yellow-200'
    };
    return farger[farge as keyof typeof farger] || 'bg-gray-500 text-white border-gray-200';
  };

  // Hent førerkortklasser fra API
  useEffect(() => {
    const hentFoererkortKlasser = async () => {
      try {
        const klasser = await referenceService.getFørerkortKlasser();
        // Flater ut grupperte klasser til en array
        const klasseArray = Array.isArray(klasser) ? klasser : Object.values(klasser).flat();
        setFoererkortKlasser(klasseArray);
      } catch (error) {
        log.apiError('reference/foererkort-klasser', error);
        log.error('Feil ved henting av førerkortklasser, bruker fallback data');
        // Beholder fallback klasseInfo
      }
    };

    hentFoererkortKlasser();
  }, []);

  const hentAlleKategorier = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const alleKategorier: KlasseKategorier[] = [];
      
      for (const [klasse, info] of Object.entries(klasseInfo)) {
        try {
          const respons = await api.get(`/quiz/kategorier?klasse=${klasse}`);
          if (respons.data && respons.data.length > 0) {
            alleKategorier.push({
              klasse,
              beskrivelse: (info as any).beskrivelse,
              kategorier: respons.data
            });
          }
        } catch (err) {
          log.apiError(`kategorier/${klasse}`, err);
          log.error(`Feil ved henting av kategorier for klasse ${klasse}`);
        }
      }
      
      setKlasseKategorier(alleKategorier);
    } catch (err) {
      log.apiError('kategorier', err);
      log.error('Feil ved henting av kategorier');
      setError('Kunne ikke hente kategorier');
    } finally {
      setLoading(false);
    }
  }, [klasseInfo]);

  useEffect(() => {
    hentAlleKategorier();
  }, [hentAlleKategorier]);

  const opprettHovedkategori = async () => {
    if (!nyHovedkategori.trim() || !valgtKlasse) return;

    try {
      await api.post('/quiz/kategorier', {
        navn: nyHovedkategori.trim(),
        klasse: valgtKlasse,
        hovedkategoriId: null
      });

      setNyHovedkategori('');
      setValgtKlasse(null);
      setShowAddForm(false);
      hentAlleKategorier();
    } catch (err) {
      log.apiError('kategorier/hovedkategori', err);
      log.error('Feil ved oppretting av hovedkategori');
      setError('Kunne ikke opprette kategori');
    }
  };

  const opprettUnderkategori = async () => {
    if (!nyUnderkategori.trim() || !valgtHovedkategori) return;

    try {
      await api.post('/quiz/kategorier', {
        navn: nyUnderkategori.trim(),
        klasse: klasseKategorier.find(k => 
          k.kategorier.some(kat => kat.id === valgtHovedkategori)
        )?.klasse,
        hovedkategoriId: valgtHovedkategori
      });

      setNyUnderkategori('');
      setValgtHovedkategori(null);
      hentAlleKategorier();
    } catch (err) {
      log.apiError('kategorier/underkategori', err);
      log.error('Feil ved oppretting av underkategori');
      setError('Kunne ikke opprette underkategori');
    }
  };

  const slettKategori = async (id: number) => {
    if (!window.confirm('Er du sikker på at du vil slette denne kategorien?')) return;

    try {
      await api.delete(`/quiz/kategorier/${id}`);
      hentAlleKategorier();
    } catch (err) {
      log.apiError('kategorier/delete', err);
      log.error('Feil ved sletting av kategori');
      setError('Kunne ikke slette kategori');
    }
  };

  const startRediger = (kategori: Kategori) => {
    setRedigerKategori(kategori.id);
    setRedigerTekst(kategori.navn);
  };

  const avbrytRediger = () => {
    setRedigerKategori(null);
    setRedigerTekst('');
  };

  const lagreEndring = async (id: number) => {
    if (!redigerTekst.trim()) return;

    try {
      await api.put(`/quiz/kategorier/${id}`, {
        navn: redigerTekst.trim()
      });

      setRedigerKategori(null);
      setRedigerTekst('');
      hentAlleKategorier();
    } catch (err) {
      log.apiError('kategorier/update', err);
      log.error('Feil ved oppdatering av kategori');
      setError('Kunne ikke oppdatere kategori');
    }
  };

  const toggleKategori = (id: number) => {
    setUtvidetKategorier(prev => 
      prev.includes(id) 
        ? prev.filter(katId => katId !== id)
        : [...prev, id]
    );
  };

  const toggleKlasse = (klasse: string) => {
    setUtvidetKlasser(prev => 
      prev.includes(klasse)
        ? prev.filter(k => k !== klasse)
        : [...prev, klasse]
    );
  };

  const filtrerteKategorier = klasseKategorier.map(klasseData => ({
    ...klasseData,
    kategorier: klasseData.kategorier.filter(kategori =>
      kategori.navn.toLowerCase().includes(filtrerTekst.toLowerCase()) ||
      kategori.underkategorier.some(under =>
        under.navn.toLowerCase().includes(filtrerTekst.toLowerCase())
      )
    )
  })).filter(klasseData => klasseData.kategorier.length > 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="cards-spacing-vertical">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quiz Kategorier</h1>
          <p className="text-gray-600 mt-1">Administrer kategorier for alle førerkortklasser</p>
        </div>
        <div className="flex cards-spacing-grid">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
            >
              Kort
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
            >
              Liste
            </button>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> Ny kategori
          </button>
        </div>
      </div>

      {typeof error === 'string' ? error : error?.message || 'Ukjent feil'}

      {/* Søk og filter */}
      <div className="bg-white rounded-lg shadow-sm px-2 py-1">
        <div className="flex items-center cards-spacing-grid">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Søk i kategorier og underkategorier..."
            value={filtrerTekst}
            onChange={(e) => setFiltrerTekst(e.target.value)}
            className="flex-1 border-none outline-none text-gray-900"
          />
        </div>
      </div>

      {/* Legg til kategori form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <h3 className="text-lg font-semibold mb-4">Legg til ny hovedkategori</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 cards-spacing-grid">
            <select
              value={valgtKlasse || ''}
              onChange={(e) => setValgtKlasse(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Velg klasse</option>
              {Object.entries(klasseInfo).map(([klasse, info]) => (
                <option key={klasse} value={klasse}>
                  Klasse {klasse} - {(info as any).beskrivelse}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Kategori navn"
              value={nyHovedkategori}
              onChange={(e) => setNyHovedkategori(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-4">
              <button
                onClick={opprettHovedkategori}
                disabled={!nyHovedkategori.trim() || !valgtKlasse}
                className="flex-1 bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FaPlus />
                Legg til
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-2 py-1 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kategorier */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 cards-spacing-grid">
          {filtrerteKategorier.map((klasseData) => {
            const klasseDetaljer = klasseInfo[klasseData.klasse as keyof typeof klasseInfo] as any;
            const Ikon = klasseDetaljer?.ikon || FaCar;
            
            return (
              <div key={klasseData.klasse} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Klasse header */}
                <div className={`p-4 ${getFargeKlasser(klasseDetaljer?.farge || 'gray')}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center cards-spacing-grid">
                      <Ikon size={24} />
                      <div>
                        <h3 className="text-lg font-bold">Klasse {klasseData.klasse}</h3>
                        <p className="text-sm opacity-90">{klasseData.beskrivelse}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleKlasse(klasseData.klasse)}
                      className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                    >
                      {utvidetKlasser.includes(klasseData.klasse) ? (
                        <FaChevronDown />
                      ) : (
                        <FaChevronRight />
                      )}
                    </button>
                  </div>
                </div>

                {/* Statistikk */}
                <div className="px-2 py-1 bg-gray-50 border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {klasseData.kategorier.length} hovedkategorier
                    </span>
                    <span className="text-gray-600">
                      {klasseData.kategorier.reduce((sum, kat) => sum + kat.underkategorier.length, 0)} underkategorier
                    </span>
                  </div>
                </div>

                {/* Kategorier */}
                {utvidetKlasser.includes(klasseData.klasse) && (
                  <div className="px-2 py-1 space-y-8 max-h-96 overflow-y-auto">
                    {klasseData.kategorier.map((kategori) => (
                      <div key={kategori.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Hovedkategori */}
                        <div className="px-2 py-1 bg-gray-50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleKategori(kategori.id)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              {utvidetKategorier.includes(kategori.id) ? (
                                <FaChevronDown size={12} />
                              ) : (
                                <FaChevronRight size={12} />
                              )}
                            </button>
                            {redigerKategori === kategori.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={redigerTekst}
                                  onChange={(e) => setRedigerTekst(e.target.value)}
                                  className="px-2 py-1 border rounded text-sm w-32"
                                  onKeyPress={(e) => e.key === 'Enter' && lagreEndring(kategori.id)}
                                />
                                <button
                                  onClick={() => lagreEndring(kategori.id)}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={avbrytRediger}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <span className="font-medium text-gray-900 text-sm">{kategori.navn}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {kategori.underkategorier.length}
                            </span>
                            <button
                              onClick={() => startRediger(kategori)}
                              className="text-gray-400 hover:text-blue-600 p-1"
                            >
                              <FaEdit size={12} />
                            </button>
                            <button
                              onClick={() => slettKategori(kategori.id)}
                              className="text-gray-400 hover:text-red-600 p-1"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Underkategorier */}
                        {utvidetKategorier.includes(kategori.id) && (
                          <div className="px-2 py-1 bg-white space-y-6">
                            {kategori.underkategorier.map((under) => (
                              <div key={under.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded text-sm">
                                {redigerKategori === under.id ? (
                                  <div className="flex items-center gap-2 flex-1">
                                    <input
                                      type="text"
                                      value={redigerTekst}
                                      onChange={(e) => setRedigerTekst(e.target.value)}
                                      className="flex-1 px-2 py-1 border rounded text-xs"
                                      onKeyPress={(e) => e.key === 'Enter' && lagreEndring(under.id)}
                                    />
                                    <button
                                      onClick={() => lagreEndring(under.id)}
                                      className="text-green-600 hover:text-green-800"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={avbrytRediger}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <span className="text-gray-700">{under.navn}</span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => startRediger(under)}
                                        className="text-gray-400 hover:text-blue-600 p-1"
                                      >
                                        <FaEdit size={10} />
                                      </button>
                                      <button
                                        onClick={() => slettKategori(under.id)}
                                        className="text-gray-400 hover:text-red-600 p-1"
                                      >
                                        <FaTrash size={10} />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}

                            {/* Legg til underkategori */}
                            {valgtHovedkategori === kategori.id ? (
                              <div className="bg-green-50 border border-green-200 rounded p-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="Underkategori navn"
                                    value={nyUnderkategori}
                                    onChange={(e) => setNyUnderkategori(e.target.value)}
                                    className="flex-1 px-2 py-1 border border-green-300 rounded text-xs"
                                    onKeyPress={(e) => e.key === 'Enter' && opprettUnderkategori()}
                                  />
                                  <button
                                    onClick={opprettUnderkategori}
                                    className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={() => {
                                      setValgtHovedkategori(null);
                                      setNyUnderkategori('');
                                    }}
                                    className="text-gray-600 hover:text-gray-800"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setValgtHovedkategori(kategori.id)}
                                className="w-full bg-gray-100 text-gray-700 py-1 rounded hover:bg-gray-200 text-xs flex items-center justify-center gap-1"
                              >
                                <FaPlus size={10} />
                                Legg til underkategori
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // Liste visning (original layout)
        <div className="cards-spacing-vertical">
          {filtrerteKategorier.map((klasseData) => (
            <div key={klasseData.klasse} className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* ... existing list layout code ... */}
            </div>
          ))}
        </div>
      )}

      {filtrerteKategorier.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Ingen kategorier funnet</p>
          {filtrerTekst && (
            <p className="text-sm text-gray-400 mt-2">
              Prøv et annet søk eller fjern filteret
            </p>
          )}
        </div>
      )}
    </div>
  );
} 