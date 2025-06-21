import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaSearch, 
  // FaFilter, // Currently unused
  FaTimes, 
  FaCopy,
  FaEye,
  // FaEdit, // Currently unused
  // FaTrash, // Currently unused
  // FaDownload, // Currently unused
  FaUsers,
  FaTag,
  // FaStar, // Currently unused
  FaClock,
  FaPlus
} from 'react-icons/fa';
import api from '../../../lib/api';
import { log } from '../../../utils/logger';
import referenceService from '../../../services/reference.service';

interface Sjekkpunkt {
  id: number;
  tittel: string;
  beskrivelse: string;
  system: string;
  typeKontroll: 'FYSISK' | 'VISUELL';
}

interface MalPunkt {
  id: number;
  sjekkpunktId: number;
  rekkefølge: number;
  kanGodkjennesAv: 'LÆRER' | 'ELEV' | 'BEGGE';
  påkrevd: boolean;
  sjekkpunkt: Sjekkpunkt;
}

interface KontrollMal {
  id: number;
  navn: string;
  beskrivelse?: string;
  kategori: string;
  tags: string[];
  offentlig: boolean;
  bruktAntall: number;
  opprettet: string;
  opprettetAv: {
    id: number;
    navn: string;
  };
  punkter: MalPunkt[];
}

interface Bedrift {
  id: number;
  navn: string;
}

const ListeBibliotek: React.FC = () => {
  const navigate = useNavigate();
  const [maler, setMaler] = useState<KontrollMal[]>([]);
  const [alleBedrifter, setAlleBedrifter] = useState<Bedrift[]>([]);
  const [brukerRolle, setBrukerRolle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [søk, setSøk] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [sortering, setSortering] = useState<'populære' | 'nyeste' | 'navn'>('populære');

  // Modal states
  const [visMal, setVisMal] = useState<KontrollMal | null>(null);
  const [kopierMal, setKopierMal] = useState<KontrollMal | null>(null);
  const [kopierNavn, setKopierNavn] = useState('');
  const [kopierBedrift, setKopierBedrift] = useState('');
  const [kopierer, setKopierer] = useState(false);
  const [kategorier, setKategorier] = useState<string[]>([]);

  useEffect(() => {
    const hentData = async () => {
      try {
        const malarRes = await api.get('/kontroll-maler');
        setMaler(malarRes.data);

        const profileRes = await api.get('/profile');
        setBrukerRolle(profileRes.data.rolle);

        if (profileRes.data.rolle === 'ADMIN') {
          const bedrifterRes = await api.get('/bedrifter');
          setAlleBedrifter(bedrifterRes.data);
        }

        // Hent førerkortklasser for filter
        const klasser = await referenceService.getFørerkortKlasseKoder();
        setKategorier([...klasser, 'Generell']);
      } catch (error) {
        log.apiError('/kontroll-maler', error);
        // Fallback til hardkodet data
        setKategorier(['A1', 'A2', 'A', 'B', 'BE', 'C1', 'C1E', 'C', 'CE', 'D1', 'D1E', 'D', 'DE', 'Generell']);
      } finally {
        setLoading(false);
      }
    };

    hentData();
  }, []);

  const alleTags = useMemo(() => {
    const tags = new Set<string>();
    maler.forEach(mal => mal.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [maler]);

  const filtrerteMaler = useMemo(() => {
    let filtrert = maler.filter(mal => {
      const matcherSøk = !søk || 
        mal.navn.toLowerCase().includes(søk.toLowerCase()) ||
        mal.beskrivelse?.toLowerCase().includes(søk.toLowerCase()) ||
        mal.kategori.toLowerCase().includes(søk.toLowerCase());
      
      const matcherKategori = !filterKategori || mal.kategori === filterKategori;
      const matcherTag = !filterTag || mal.tags.includes(filterTag);
      
      return matcherSøk && matcherKategori && matcherTag;
    });

    // Sortering
    switch (sortering) {
      case 'populære':
        filtrert.sort((a, b) => b.bruktAntall - a.bruktAntall);
        break;
      case 'nyeste':
        filtrert.sort((a, b) => new Date(b.opprettet).getTime() - new Date(a.opprettet).getTime());
        break;
      case 'navn':
        filtrert.sort((a, b) => a.navn.localeCompare(b.navn));
        break;
    }

    return filtrert;
  }, [maler, søk, filterKategori, filterTag, sortering]);

  const clearFilters = () => {
    setSøk('');
    setFilterKategori('');
    setFilterTag('');
  };

  const handleKopierMal = async () => {
    if (!kopierMal || !kopierNavn.trim()) return;

    setKopierer(true);
    try {
      const data: any = { navn: kopierNavn.trim() };
      if (brukerRolle === 'ADMIN' && kopierBedrift) {
        data.bedriftId = parseInt(kopierBedrift);
      }

      await api.post(`/kontroll-maler/${kopierMal.id}/kopier`, data);
      
      setKopierMal(null);
      setKopierNavn('');
      setKopierBedrift('');
      
      // Naviger til sikkerhetskontroll siden
      navigate('/sikkerhetskontroll');
    } catch (error: any) {
      log.apiError(`/kontroll-maler/${kopierMal.id}/kopier`, error);
      alert(error.response?.data?.error || 'Kunne ikke kopiere mal');
    } finally {
      setKopierer(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Laster malbibliotek...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen px-2 py-1">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/sikkerhetskontroll" 
            className="inline-flex items-center gap-2 text-[#003366] hover:underline font-semibold mb-4"
          >
            <FaArrowLeft /> Tilbake til sikkerhetskontroll
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-[#003366]">Liste bibliotek</h1>
              <p className="text-gray-600 mt-2">Globale sikkerhetskontroll-maler som kan tas i bruk av bedrifter</p>
            </div>
            {brukerRolle === 'ADMIN' && (
              <Link
                to="/sikkerhetskontroll/mal/opprett"
                className="inline-flex items-center gap-2 px-2 py-1 bg-[#003366] text-white rounded-lg hover:bg-blue-900 transition-colors"
              >
                <FaPlus /> Opprett ny mal
              </Link>
            )}
          </div>
        </div>

        {/* Søk og filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 cards-spacing-grid mb-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={søk}
                onChange={e => setSøk(e.target.value)}
                placeholder="Søk etter mal..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              />
            </div>
            
            <select
              value={filterKategori}
              onChange={e => setFilterKategori(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            >
              <option value="">Alle kategorier</option>
              {kategorier.map(kategori => (
                <option key={kategori} value={kategori}>{kategori}</option>
              ))}
            </select>
            
            <select
              value={filterTag}
              onChange={e => setFilterTag(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            >
              <option value="">Alle tags</option>
              {alleTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            
            <select
              value={sortering}
              onChange={e => setSortering(e.target.value as 'populære' | 'nyeste' | 'navn')}
              className="border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            >
              <option value="populære">Mest populære</option>
              <option value="nyeste">Nyeste først</option>
              <option value="navn">Alfabetisk</option>
            </select>
          </div>

          {(søk || filterKategori || filterTag) && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">{filtrerteMaler.length} maler funnet</p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
              >
                <FaTimes /> Nullstill filtre
              </button>
            </div>
          )}
        </div>

        {/* Mal grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
          {filtrerteMaler.map(mal => (
            <div key={mal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1 hover:shadow-md transition-shadow">
              {/* Mal header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{mal.navn}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{mal.kategori}</span>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <FaUsers />
                      <span>{mal.bruktAntall}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Beskrivelse */}
              {mal.beskrivelse && (
                <p className="text-gray-600 text-sm mb-4 line-clampx-2 py-1">{mal.beskrivelse}</p>
              )}

              {/* Tags */}
              {mal.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {mal.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      <FaTag className="inline mr-1" />
                      {tag}
                    </span>
                  ))}
                  {mal.tags.length > 3 && (
                    <span className="text-xs text-gray-500">+{mal.tags.length - 3}</span>
                  )}
                </div>
              )}

              {/* Statistikk */}
              <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                <span>{mal.punkter.length} sjekkpunkt</span>
                <span>
                  <FaClock className="inline mr-1" />
                  {new Date(mal.opprettet).toLocaleDateString()}
                </span>
              </div>

              {/* Handlinger */}
              <div className="flex gap-4">
                <button
                  onClick={() => setVisMal(mal)}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  <FaEye /> Vis
                </button>
                <button
                  onClick={() => {
                    setKopierMal(mal);
                    setKopierNavn(mal.navn);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 text-sm bg-[#003366] text-white rounded hover:bg-blue-900 transition-colors"
                >
                  <FaCopy /> Ta i bruk
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtrerteMaler.length === 0 && (
          <div className="text-center py-12">
            <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Ingen maler funnet</h3>
            <p className="text-gray-600">
              {søk || filterKategori || filterTag 
                ? 'Prøv å endre søkekriteriene dine'
                : 'Det finnes ingen globale maler enda'
              }
            </p>
          </div>
        )}
      </div>

      {/* Vis mal modal */}
      {visMal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-2 py-1 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-2 py-1 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{visMal.navn}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{visMal.kategori}</span>
                    <span className="text-gray-600 text-sm">
                      <FaUsers className="inline mr-1" />
                      Brukt {visMal.bruktAntall} ganger
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setVisMal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            <div className="px-2 py-1">
              {visMal.beskrivelse && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Beskrivelse</h3>
                  <p className="text-gray-600">{visMal.beskrivelse}</p>
                </div>
              )}

              {visMal.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {visMal.tags.map(tag => (
                      <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                        <FaTag className="inline mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Sjekkpunkter ({visMal.punkter.length})</h3>
                <div className="space-y-8">
                  {visMal.punkter.map(punkt => (
                    <div key={punkt.id} className="border border-gray-200 rounded-lg px-2 py-1">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{punkt.sjekkpunkt.tittel}</h4>
                          <p className="text-gray-600 text-sm mt-1">{punkt.sjekkpunkt.beskrivelse}</p>
                          <div className="flex gap-4 mt-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {punkt.sjekkpunkt.system}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              punkt.sjekkpunkt.typeKontroll === 'FYSISK' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {punkt.sjekkpunkt.typeKontroll}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {punkt.kanGodkjennesAv}
                            </span>
                            {punkt.påkrevd && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                PÅKREVD
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-500">#{punkt.rekkefølge}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex cards-spacing-grid pt-4 border-t border-gray-200">
                <button
                  onClick={() => setVisMal(null)}
                  className="px-2 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Lukk
                </button>
                <button
                  onClick={() => {
                    setVisMal(null);
                    setKopierMal(visMal);
                    setKopierNavn(visMal.navn);
                  }}
                  className="px-2 py-1 bg-[#003366] text-white rounded-lg hover:bg-blue-900 transition-colors"
                >
                  Ta i bruk denne malen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kopier mal modal */}
      {kopierMal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-2 py-1 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-2 py-1 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Ta i bruk mal</h2>
              <p className="text-gray-600 mt-1">Opprett en ny sikkerhetskontroll basert på "{kopierMal.navn}"</p>
            </div>

            <div className="px-2 py-1 cards-spacing-vertical">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Navn på ny kontroll *
                </label>
                <input
                  type="text"
                  value={kopierNavn}
                  onChange={e => setKopierNavn(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  placeholder="F.eks. A1 Førerkontroll - Vinter 2024"
                />
              </div>

              {brukerRolle === 'ADMIN' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrift
                  </label>
                  <select
                    value={kopierBedrift}
                    onChange={e => setKopierBedrift(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  >
                    <option value="">Velg bedrift...</option>
                    {alleBedrifter.map(bedrift => (
                      <option key={bedrift.id} value={bedrift.id.toString()}>
                        {bedrift.navn}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="px-2 py-1 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setKopierMal(null);
                  setKopierNavn('');
                  setKopierBedrift('');
                }}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={kopierer}
              >
                Avbryt
              </button>
              <button
                onClick={handleKopierMal}
                disabled={kopierer || !kopierNavn.trim() || (brukerRolle === 'ADMIN' && !kopierBedrift)}
                className="flex-1 px-2 py-1 bg-[#003366] text-white rounded-lg hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {kopierer ? 'Kopierer...' : 'Ta i bruk'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeBibliotek; 