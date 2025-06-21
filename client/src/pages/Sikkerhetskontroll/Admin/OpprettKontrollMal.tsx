import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaPlus, 
  FaMinus, 
  FaUsers, 
  // FaUserGraduate, // Currently unused
  // FaUserTie, // Currently unused
  FaSearch,
  // FaFilter, // Currently unused
  FaTimes,
  FaCheck,
  FaTag,
  FaGlobe
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

interface ValgSjekkpunkt extends Sjekkpunkt {
  kanGodkjennesAv: 'LAERER' | 'ELEV' | 'BEGGE';
  påkrevd: boolean;
}

const OpprettKontrollMal: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    navn: '',
    beskrivelse: '',
    kategorier: [] as string[],
    tags: [] as string[],
    offentlig: true
  });
  
  const [alleSjekkpunkter, setAlleSjekkpunkter] = useState<Sjekkpunkt[]>([]);
  const [valgSjekkpunkter, setValgSjekkpunkter] = useState<ValgSjekkpunkt[]>([]);
  const [søk, setSøk] = useState('');
  const [filterSystem, setFilterSystem] = useState('');
  const [filterType, setFilterType] = useState('');
  const [nyTag, setNyTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [kategorier, setKategorier] = useState<{ navn: string; klasser: string[] }[]>([]);
  const [systemer, setSystemer] = useState<string[]>([]);

  useEffect(() => {
    const hentData = async () => {
      try {
        const sjekkpunkterRes = await api.get('/sjekkpunkt');
        setAlleSjekkpunkter(sjekkpunkterRes.data);

        // Hent systemer fra referanse-servicen
        const systemerData = await referenceService.getSjekkpunktSystemNavnListe();
        setSystemer(systemerData);

        // Hent og organiser førerkortklasser
        const klasser = await referenceService.getFørerkortKlasser() as Record<string, any[]>;
        const kategorierData = [
          { navn: 'A-klasser (Motorsykkel)', klasser: (klasser.Motorsykkel || []).map(k => k.kode) },
          { navn: 'B-klasser (Personbil)', klasser: (klasser.Bil || []).map(k => k.kode) },
          { navn: 'C-klasser (Lastebil)', klasser: (klasser.Lastebil || []).map(k => k.kode) },
          { navn: 'D-klasser (Buss)', klasser: (klasser.Buss || []).map(k => k.kode) },
          { navn: 'Spesielle', klasser: (klasser.Spesiell || []).map(k => k.kode) },
          { navn: 'Generell', klasser: ['Generell'] }
        ];
        setKategorier(kategorierData);
      } catch (error) {
        log.apiError('/sjekkpunkt', error);
        setFeil('Kunne ikke hente nødvendig data');
        // Fallback til hardkodet data
        setSystemer(['Bremser', 'Dekk', 'Styring', 'Lys', 'Drivverk', 'Annet']);
        setKategorier([
          { navn: 'A-klasser (Motorsykkel)', klasser: ['A1', 'A2', 'A'] },
          { navn: 'B-klasser (Personbil)', klasser: ['B', 'BE'] },
          { navn: 'C-klasser (Lastebil)', klasser: ['C1', 'C1E', 'C', 'CE'] },
          { navn: 'D-klasser (Buss)', klasser: ['D1', 'D1E', 'D', 'DE'] },
          { navn: 'Generell', klasser: ['Generell'] }
        ]);
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
      kanGodkjennesAv: 'LAERER',
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

  const leggTilTag = () => {
    if (nyTag.trim() && !form.tags.includes(nyTag.trim())) {
      setForm(f => ({...f, tags: [...f.tags, nyTag.trim()]}));
      setNyTag('');
    }
  };

  const fjernTag = (tag: string) => {
    setForm(f => ({...f, tags: f.tags.filter(t => t !== tag)}));
  };

  const toggleKategori = (klasse: string) => {
    setForm(f => ({
      ...f,
      kategorier: f.kategorier.includes(klasse) 
        ? f.kategorier.filter(k => k !== klasse)
        : [...f.kategorier, klasse]
    }));
  };

  const toggleKategoriGruppe = (klasser: string[]) => {
    const alleValgt = klasser.every(k => form.kategorier.includes(k));
    if (alleValgt) {
      // Fjern alle
      setForm(f => ({
        ...f,
        kategorier: f.kategorier.filter(k => !klasser.includes(k))
      }));
    } else {
      // Legg til alle som ikke allerede er valgt
      setForm(f => ({
        ...f,
        kategorier: Array.from(new Set([...f.kategorier, ...klasser]))
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.navn.trim()) {
      setFeil('Navn er påkrevd');
      return;
    }
    
    if (form.kategorier.length === 0) {
      setFeil('Du må velge minst én kategori/klasse');
      return;
    }
    
    if (valgSjekkpunkter.length === 0) {
      setFeil('Du må velge minst ett sjekkpunkt');
      return;
    }

    setLagrer(true);
    setFeil(null);

    try {
      const malData = {
        navn: form.navn.trim(),
        beskrivelse: form.beskrivelse.trim() || null,
        kategori: form.kategorier.join(', '), // Kombiner kategorier som string
        tags: [...form.tags, ...form.kategorier], // Legg kategorier som tags også
        offentlig: form.offentlig,
        punkter: valgSjekkpunkter.map(punkt => ({
          sjekkpunktId: punkt.id,
          kanGodkjennesAv: punkt.kanGodkjennesAv,
          påkrevd: punkt.påkrevd
        }))
      };

      // logger.info('Sender mal data:', malData);
      await api.post('/kontroll-maler', malData);
      navigate('/sikkerhetskontroll/liste-bibliotek');
      
    } catch (error: any) {
      log.apiError('/kontroll-maler', error);
      setFeil(error.response?.data?.error || 'Kunne ikke lagre kontrollmal');
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
            to="/sikkerhetskontroll/liste-bibliotek" 
            className="inline-flex items-center gap-2 text-[#003366] hover:underline font-semibold mb-4"
          >
            <FaArrowLeft /> Tilbake til liste bibliotek
          </Link>
          <h1 className="text-3xl font-bold text-[#003366] flex items-center cards-spacing-grid">
            <FaGlobe className="text-indigo-600" />
            Opprett global kontrollmal
          </h1>
          <p className="text-gray-600 mt-2">Opprett en mal som alle bedrifter kan ta i bruk fra biblioteket</p>
        </div>

        <form onSubmit={handleSubmit} className="cards-spacing-vertical">
          {/* Mal informasjon */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
            <h2 className="text-xl font-semibold text-[#003366] mb-6 flex items-center gap-2">
              <FaGlobe className="text-indigo-600" />
              Mal informasjon
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Navn på mal *
                </label>
                <input 
                  type="text"
                  value={form.navn} 
                  onChange={e => setForm(f => ({...f, navn: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent" 
                  placeholder="F.eks. A-klasser Standard førerkontroll"
                  required
                />
              </div>
              
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Førerkortklasser / Kategorier *
                </label>
                <div className="space-y-8">
                  {kategorier.map(kategoriGruppe => (
                    <div key={kategoriGruppe.navn} className="border border-gray-200 rounded-lg px-2 py-1">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{kategoriGruppe.navn}</h4>
                        <button
                          type="button"
                          onClick={() => toggleKategoriGruppe(kategoriGruppe.klasser)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {kategoriGruppe.klasser.every(k => form.kategorier.includes(k)) ? 'Fjern alle' : 'Velg alle'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {kategoriGruppe.klasser.map(klasse => (
                          <label key={klasse} className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={form.kategorier.includes(klasse)}
                              onChange={() => toggleKategori(klasse)}
                              className="mr-2 rounded border-gray-300 text-[#003366] focus:ring-[#003366]"
                            />
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              form.kategorier.includes(klasse) 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {klasse}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {form.kategorier.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">
                      Valgte klasser: {form.kategorier.join(', ')}
                    </p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beskrivelse
                </label>
                <textarea 
                  value={form.beskrivelse} 
                  onChange={e => setForm(f => ({...f, beskrivelse: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent" 
                  placeholder="Beskriv hva denne malen dekker og når den bør brukes"
                  rows={3}
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ekstra tags (for søk og filtrering)
                </label>
                <div className="flex gap-4 mb-3">
                  <input
                    type="text"
                    value={nyTag}
                    onChange={e => setNyTag(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), leggTilTag())}
                    className="flex-1 border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    placeholder="F.eks. standard, førerkontroll, vinter"
                  />
                  <button
                    type="button"
                    onClick={leggTilTag}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <FaPlus />
                  </button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                        <FaTag />
                        {tag}
                        <button
                          type="button"
                          onClick={() => fjernTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:col-span-2">
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={form.offentlig}
                    onChange={e => setForm(f => ({...f, offentlig: e.target.checked}))}
                    className="mr-2 rounded border-gray-300 text-[#003366] focus:ring-[#003366]"
                  />
                  <FaGlobe className="mr-2 text-indigo-600" />
                  Gjør malen offentlig tilgjengelig for alle bedrifter
                </label>
              </div>
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
                              kanGodkjennesAv: e.target.value as 'LAERER' | 'ELEV' | 'BEGGE' 
                            })}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-[#003366] focus:border-transparent"
                          >
                            <option value="LAERER">Kun lærer</option>
                            <option value="ELEV">Kun elev</option>
                            <option value="BEGGE">Lærer eller elev</option>
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
              to="/sikkerhetskontroll/liste-bibliotek"
              className="px-2 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Avbryt
            </Link>
            <button
              type="submit"
              disabled={lagrer || valgSjekkpunkter.length === 0 || !form.navn.trim() || form.kategorier.length === 0}
              className="px-2 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <FaGlobe />
              {lagrer ? 'Lagrer...' : 'Opprett global mal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OpprettKontrollMal; 