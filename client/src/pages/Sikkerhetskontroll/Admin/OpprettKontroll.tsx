import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaPlus, 
  FaMinus, 
  FaUsers, 
  FaUserGraduate,
  FaUserTie,
  FaSearch,
  // FaFilter, // Currently unused
  FaTimes,
  FaCheck,
  // FaGripVertical // Currently unused
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
  forerkortklass: string[];
}

interface Bedrift {
  id: number;
  navn: string;
}

interface ValgSjekkpunkt extends Sjekkpunkt {
  kanGodkjennesAv: 'LÆRER' | 'ELEV' | 'BEGGE';
  påkrevd: boolean;
}

const OpprettKontroll: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    navn: '',
    beskrivelse: '',
    bedriftId: ''
  });
  
  const [alleSjekkpunkter, setAlleSjekkpunkter] = useState<Sjekkpunkt[]>([]);
  const [alleBedrifter, setAlleBedrifter] = useState<Bedrift[]>([]);
  const [brukerRolle, setBrukerRolle] = useState<string>('');
  const [valgSjekkpunkter, setValgSjekkpunkter] = useState<ValgSjekkpunkt[]>([]);
  const [søk, setSøk] = useState('');
  const [filterSystem, setFilterSystem] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [systemer, setSystemer] = useState<string[]>([]);

  useEffect(() => {
    const hentData = async () => {
      try {
        // Hent sjekkpunkter
        const sjekkpunkterRes = await api.get('/sjekkpunkt');
        setAlleSjekkpunkter(sjekkpunkterRes.data);

        // Hent brukerens informasjon
        const profileRes = await api.get('/profile');
        setBrukerRolle(profileRes.data.rolle);

        // Hent bedrifter hvis bruker er ADMIN
        if (profileRes.data.rolle === 'ADMIN') {
          const bedrifterRes = await api.get('/bedrifter');
          setAlleBedrifter(bedrifterRes.data);
        }

        // Hent sjekkpunkt-systemer
        const systemerData = await referenceService.getSjekkpunktSystemNavnListe();
        setSystemer(systemerData);
      } catch (error) {
        log.apiError('sikkerhetskontroll/setup', error);
        log.error('Feil ved henting av data');
        setFeil('Kunne ikke hente nødvendig data');
        // Fallback for systemer
        setSystemer(['Bremser', 'Dekk', 'Styring', 'Lys', 'Drivverk', 'Annet']);
      } finally {
        setLoading(false);
      }
    };

    hentData();
  }, []);

  const filtrerteSjekkpunkter = alleSjekkpunkter.filter(s => {
    const matcherSøk = !søk || 
      s.tittel.toLowerCase().includes(søk.toLowerCase()) ||
      s.beskrivelse.toLowerCase().includes(søk.toLowerCase()) ||
      s.system.toLowerCase().includes(søk.toLowerCase());
    
    const matcherSystem = !filterSystem || s.system === filterSystem;
    const matcherType = !filterType || s.typeKontroll === filterType;
    
    return matcherSøk && matcherSystem && matcherType;
  });

  const leggTilSjekkpunkt = (sjekkpunkt: Sjekkpunkt) => {
    if (valgSjekkpunkter.find(v => v.id === sjekkpunkt.id)) return;
    
    setValgSjekkpunkter(prev => [...prev, {
      ...sjekkpunkt,
      kanGodkjennesAv: 'LÆRER',
      påkrevd: true
    }]);
  };

  const fjernSjekkpunkt = (id: number) => {
    setValgSjekkpunkter(prev => prev.filter(v => v.id !== id));
  };

  const oppdaterSjekkpunkt = (id: number, felter: Partial<Pick<ValgSjekkpunkt, 'kanGodkjennesAv' | 'påkrevd'>>) => {
    setValgSjekkpunkter(prev => prev.map(v => 
      v.id === id ? { ...v, ...felter } : v
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.navn.trim()) {
      setFeil('Navn er påkrevd');
      return;
    }
    
    if (valgSjekkpunkter.length === 0) {
      setFeil('Du må velge minst ett sjekkpunkt');
      return;
    }

    // Valider bedrift for ADMIN-brukere
    if (brukerRolle === 'ADMIN' && !form.bedriftId) {
      setFeil('ADMIN må velge hvilken bedrift kontrollen skal tilhøre');
      return;
    }

    setLagrer(true);
    setFeil(null);

    try {
      const kontrollData = {
        navn: form.navn.trim(),
        beskrivelse: form.beskrivelse.trim() || null,
        ...(brukerRolle === 'ADMIN' && form.bedriftId && { bedriftId: parseInt(form.bedriftId) }),
        punkter: valgSjekkpunkter.map(punkt => ({
          sjekkpunktId: punkt.id,
          kanGodkjennesAv: punkt.kanGodkjennesAv,
          påkrevd: punkt.påkrevd
        }))
      };

      await api.post('/sikkerhetskontroll', kontrollData);
      navigate('/sikkerhetskontroll');
      
    } catch (error: any) {
      log.apiError('sikkerhetskontroll', error);
      log.error('Feil ved lagring av sikkerhetskontroll');
      setFeil(error.response?.data?.error || 'Kunne ikke lagre sikkerhetskontroll');
    } finally {
      setLagrer(false);
    }
  };

  const clearFilters = () => {
    setSøk('');
    setFilterSystem('');
    setFilterType('');
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Laster sjekkpunkter...</p>
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
          <h1 className="text-3xl font-bold text-[#003366]">Opprett sikkerhetskontroll</h1>
          <p className="text-gray-600 mt-2">Velg sjekkpunkter og angi hvem som kan godkjenne hvert punkt</p>
        </div>

        <form onSubmit={handleSubmit} className="cards-spacing-vertical">
          {/* Grunnleggende informasjon */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
            <h2 className="text-xl font-semibold text-[#003366] mb-6">Kontroll informasjon</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Navn på kontroll *
                </label>
                <input 
                  type="text"
                  value={form.navn} 
                  onChange={e => setForm(f => ({...f, navn: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent" 
                  placeholder="F.eks. A1 Førerkontroll, Dekk og hjul"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beskrivelse (valgfritt)
                </label>
                <input 
                  type="text"
                  value={form.beskrivelse} 
                  onChange={e => setForm(f => ({...f, beskrivelse: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent" 
                  placeholder="Kort beskrivelse av kontrollen"
                />
              </div>

              {/* Bedrift-velger for ADMIN */}
              {brukerRolle === 'ADMIN' && (
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrift *
                  </label>
                  <select
                    value={form.bedriftId}
                    onChange={e => setForm(f => ({...f, bedriftId: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    required
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
            {/* Tilgjengelige sjekkpunkter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
              <h2 className="text-xl font-semibold text-[#003366] mb-6">Tilgjengelige sjekkpunkter</h2>
              
              {/* Søk og filter */}
              <div className="cards-spacing-vertical mb-6">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={søk}
                    onChange={e => setSøk(e.target.value)}
                    placeholder="Søk etter sjekkpunkt..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  />
                </div>
                
                <div className="flex gap-4">
                  <select
                    value={filterSystem}
                    onChange={e => setFilterSystem(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  >
                    <option value="">Alle systemer</option>
                    {systemer.map(system => (
                      <option key={system} value={system}>{system}</option>
                    ))}
                  </select>
                  
                  <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  >
                    <option value="">Alle typer</option>
                    <option value="FYSISK">Fysisk</option>
                    <option value="VISUELL">Visuell</option>
                  </select>
                  
                  {(søk || filterSystem || filterType) && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Sjekkpunkt liste */}
              <div className="space-y-8 max-h-96 overflow-y-auto">
                {filtrerteSjekkpunkter.map(sjekkpunkt => {
                  const erValgt = valgSjekkpunkter.find(v => v.id === sjekkpunkt.id);
                  
                  return (
                    <div 
                      key={sjekkpunkt.id}
                      className={`border rounded-lg p-3 transition-colors ${
                        erValgt 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{sjekkpunkt.tittel}</h4>
                          <div className="flex gap-4 mt-1">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {sjekkpunkt.system}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              sjekkpunkt.typeKontroll === 'FYSISK' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {sjekkpunkt.typeKontroll}
                            </span>
                          </div>
                          {sjekkpunkt.forerkortklass.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {sjekkpunkt.forerkortklass.slice(0, 3).map(klasse => (
                                <span key={klasse} className="text-xs bg-gray-100 text-gray-700 px-1 py-0.5 rounded">
                                  {klasse}
                                </span>
                              ))}
                              {sjekkpunkt.forerkortklass.length > 3 && (
                                <span className="text-xs text-gray-500">+{sjekkpunkt.forerkortklass.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => erValgt ? fjernSjekkpunkt(sjekkpunkt.id) : leggTilSjekkpunkt(sjekkpunkt)}
                          className={`ml-3 p-2 rounded-lg transition-colors ${
                            erValgt
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {erValgt ? <FaCheck /> : <FaPlus />}
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {filtrerteSjekkpunkter.length === 0 && (
                  <div className="text-center py-1 text-gray-500">
                    <p>Ingen sjekkpunkter funnet</p>
                    {(søk || filterSystem || filterType) && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-2 text-blue-600 hover:text-blue-800 underline"
                      >
                        Nullstill filtre
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Valgte sjekkpunkter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
              <h2 className="text-xl font-semibold text-[#003366] mb-6">
                Valgte sjekkpunkter ({valgSjekkpunkter.length})
              </h2>
              
              {valgSjekkpunkter.length === 0 ? (
                <div className="text-center py-1 text-gray-500">
                  <FaUsers className="text-4xl mx-auto mb-4 text-gray-300" />
                  <p>Ingen sjekkpunkter valgt</p>
                  <p className="text-sm">Velg sjekkpunkter fra listen til venstre</p>
                </div>
              ) : (
                <div className="cards-spacing-vertical max-h-96 overflow-y-auto">
                  {valgSjekkpunkter.map((punkt, index) => (
                    <div key={punkt.id} className="border border-gray-200 rounded-lg px-2 py-1">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{punkt.tittel}</h4>
                          <div className="flex gap-4 mt-1">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {punkt.system}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              punkt.typeKontroll === 'FYSISK' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {punkt.typeKontroll}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => fjernSjekkpunkt(punkt.id)}
                          className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaMinus />
                        </button>
                      </div>
                      
                      {/* Godkjenning og påkrevd */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 cards-spacing-grid">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Kan godkjennes av
                          </label>
                          <select
                            value={punkt.kanGodkjennesAv}
                            onChange={e => oppdaterSjekkpunkt(punkt.id, { 
                              kanGodkjennesAv: e.target.value as 'LÆRER' | 'ELEV' | 'BEGGE' 
                            })}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-[#003366] focus:border-transparent"
                          >
                            <option value="LÆRER">
                              <FaUserTie className="inline mr-1" /> Kun lærer
                            </option>
                            <option value="ELEV">
                              <FaUserGraduate className="inline mr-1" /> Kun elev
                            </option>
                            <option value="BEGGE">
                              <FaUsers className="inline mr-1" /> Lærer eller elev
                            </option>
                          </select>
                        </div>
                        
                        <div className="flex items-center">
                          <label className="flex items-center text-sm text-gray-700">
                            <input
                              type="checkbox"
                              checked={punkt.påkrevd}
                              onChange={e => oppdaterSjekkpunkt(punkt.id, { påkrevd: e.target.checked })}
                              className="mr-2 rounded border-gray-300 text-[#003366] focus:ring-[#003366]"
                            />
                            Påkrevd punkt
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Feil melding */}
          {feil && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-2 py-1">
              <p className="text-red-800">{feil}</p>
            </div>
          )}

          {/* Submit knapper */}
          <div className="flex cards-spacing-grid justify-end">
            <Link
              to="/sikkerhetskontroll"
              className="px-2 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Avbryt
            </Link>
            <button
              type="submit"
              disabled={lagrer || valgSjekkpunkter.length === 0}
              className="px-2 py-1 bg-[#003366] text-white rounded-lg hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {lagrer ? 'Lagrer...' : 'Opprett sikkerhetskontroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OpprettKontroll; 