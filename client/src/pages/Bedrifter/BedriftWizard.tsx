import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaUser, FaPlus } from 'react-icons/fa';
import api from '../../lib/api';
import { log } from '../../utils/logger';
import { referenceService } from '../../services/reference.service';
import AnsattDialog from '../../components/forms/AnsattDialog';

interface FørerkortKlasse {
  kode: string;
  navn: string;
  beskrivelse: string;
  kategori: string;
  minimumsalder: number;
}

export default function BedriftWizard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alleKlasser, setAlleKlasser] = useState<FørerkortKlasse[]>([]);
  const [lasterKlasser, setLasterKlasser] = useState(true);
  const [valgteKlasser, setValgteKlasser] = useState<string[]>([]);
  const [søkerBedrift, setSøkerBedrift] = useState(false);
  const [bedriftSøkStatus, setBedriftSøkStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [bedriftSøkError, setBedriftSøkError] = useState<string | null>(null);
  const [lagreError, setLagreError] = useState<string | null>(null);
  const [visAnsattDialog, setVisAnsattDialog] = useState(false);
  const [opprettetBedriftId, setOpprettetBedriftId] = useState<number | null>(null);

  const [bedriftInfo, setBedriftInfo] = useState({
    navn: '',
    orgNummer: '',
    adresse: '',
    postnummer: '',
    poststed: '',
    telefon: '',
    epost: '',
    _brregData: null as any
  });

  useEffect(() => {
    // Hent førerkortklasser fra API
    const hentFørerkortKlasser = async () => {
      try {
        setLasterKlasser(true);
        const klasser = await referenceService.getFørerkortKlasser();
        
        // Konverter til flat array hvis det er et objekt med kategorier
        let klasseArray: FørerkortKlasse[] = [];
        if (Array.isArray(klasser)) {
          klasseArray = klasser;
        } else if (typeof klasser === 'object') {
          // Hvis det er et objekt med kategorier, flat ut alle klasser
          Object.values(klasser).forEach((kategoriKlasser: any) => {
            if (Array.isArray(kategoriKlasser)) {
              klasseArray.push(...kategoriKlasser);
            }
          });
        }

        setAlleKlasser(klasseArray.sort((a, b) => a.kode.localeCompare(b.kode)));
      } catch (error) {
        log.error('Feil ved henting av førerkortklasser, bruker fallback data');
        // Fallback data
        setAlleKlasser([
          { kode: 'A1', navn: 'Lett motorsykkel', beskrivelse: 'Motorsykkel med motor på maks 125 cm³', kategori: 'Motorsykkel', minimumsalder: 16 },
          { kode: 'A2', navn: 'Mellomtung motorsykkel', beskrivelse: 'Motorsykkel med motor på maks 35 kW', kategori: 'Motorsykkel', minimumsalder: 18 },
          { kode: 'A', navn: 'Tung motorsykkel', beskrivelse: 'Motorsykkel uten begrensninger', kategori: 'Motorsykkel', minimumsalder: 20 },
          { kode: 'B', navn: 'Personbil', beskrivelse: 'Motorvogn med tillatt totalvekt inntil 3500 kg', kategori: 'Bil', minimumsalder: 18 },
          { kode: 'BE', navn: 'Personbil med tilhenger', beskrivelse: 'Bil klasse B med tilhenger over 750 kg', kategori: 'Bil', minimumsalder: 18 },
          { kode: 'B96', navn: 'Personbil med tung tilhenger', beskrivelse: 'Bil klasse B med tilhenger 3500-4250 kg', kategori: 'Bil', minimumsalder: 18 },
          { kode: 'C1', navn: 'Lett lastebil', beskrivelse: 'Motorvogn 3500-7500 kg', kategori: 'Lastebil', minimumsalder: 18 },
          { kode: 'C1E', navn: 'Lett lastebil med tilhenger', beskrivelse: 'C1 med tilhenger over 750 kg', kategori: 'Lastebil', minimumsalder: 18 },
          { kode: 'C', navn: 'Lastebil', beskrivelse: 'Motorvogn over 3500 kg', kategori: 'Lastebil', minimumsalder: 21 },
          { kode: 'CE', navn: 'Lastebil med tilhenger', beskrivelse: 'C med tilhenger over 750 kg', kategori: 'Lastebil', minimumsalder: 21 },
          { kode: 'D1', navn: 'Liten buss', beskrivelse: 'Transport av 8-16 personer', kategori: 'Buss', minimumsalder: 21 },
          { kode: 'D1E', navn: 'Liten buss med tilhenger', beskrivelse: 'D1 med tilhenger over 750 kg', kategori: 'Buss', minimumsalder: 21 },
          { kode: 'D', navn: 'Buss', beskrivelse: 'Transport av flere enn 8 personer', kategori: 'Buss', minimumsalder: 24 },
          { kode: 'DE', navn: 'Buss med tilhenger', beskrivelse: 'D med tilhenger over 750 kg', kategori: 'Buss', minimumsalder: 24 },
          { kode: 'T', navn: 'Traktor', beskrivelse: 'Traktor og motorredskap', kategori: 'Spesiell', minimumsalder: 16 },
          { kode: 'S', navn: 'Snøscooter', beskrivelse: 'Motordrevet kjøretøy for snø', kategori: 'Spesiell', minimumsalder: 16 }
        ]);
      } finally {
        setLasterKlasser(false);
      }
    };

    hentFørerkortKlasser();
  }, []);

  // Normaliser organisasjonsnummer - fjern mellomrom og beholde kun siffer
  const normaliserOrgNummer = (orgNummer: string): string => {
    return orgNummer.replace(/\s/g, '').replace(/\D/g, '');
  };

  // Valider organisasjonsnummer format
  const validerOrgNummer = (orgNummer: string): boolean => {
    const normalisert = normaliserOrgNummer(orgNummer);
    return normalisert.length === 9 && /^\d{9}$/.test(normalisert);
  };

  const handleBedriftInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBedriftInfo(prev => ({ ...prev, [name]: value }));
    
    // Reset søkestatus når brukeren endrer org.nummer
    if (name === 'orgNummer') {
      setBedriftSøkStatus('idle');
      setBedriftSøkError(null);
    }
  };

  const søkBedriftIBrønnøysund = async () => {
    const orgNummer = bedriftInfo.orgNummer.trim();
    
    if (!orgNummer || !validerOrgNummer(orgNummer)) {
      setBedriftSøkError('Organisasjonsnummer må være 9 siffer (f.eks. 913831438 eller 913 831 438)');
      setBedriftSøkStatus('error');
      return;
    }
    
    // Normaliser org.nummer for API-kall
    const normalisertOrgNummer = normaliserOrgNummer(orgNummer);

    setSøkerBedrift(true);
    setBedriftSøkStatus('idle');
    setBedriftSøkError(null);

    try {
      console.log(`🔍 Søker etter bedrift med org.nr: ${normalisertOrgNummer}`);
      const response = await api.get(`/bronnoysund/bedrift/${normalisertOrgNummer}`);
      const apiResponse = response.data;
      console.log('📋 API-respons:', apiResponse);

      // API returnerer { success: true, data: { ... } }
      if (apiResponse.success && apiResponse.data && apiResponse.data.navn) {
        const bedriftData = apiResponse.data;
        setBedriftInfo(prev => ({
          ...prev,
          navn: bedriftData.navn || prev.navn,
          adresse: bedriftData.adresse ? (Array.isArray(bedriftData.adresse) ? bedriftData.adresse.join(', ') : bedriftData.adresse) : prev.adresse,
          postnummer: bedriftData.postnummer || prev.postnummer,
          poststed: bedriftData.poststed || prev.poststed,
          // Lagre den utvidede informasjonen
          _brregData: bedriftData
        }));
        
        setBedriftSøkStatus('success');
      } else {
        setBedriftSøkError('Bedrift ikke funnet i Brønnøysundregisteret');
        setBedriftSøkStatus('error');
      }
    } catch (error: any) {
      log.apiError('/bronnoysund/bedrift', error);
      let msg = 'Kunne ikke hente bedriftsinformasjon';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object' && errorData.error) {
          // Håndter nested error-objekter
          if (typeof errorData.error === 'object' && errorData.error.message) {
            msg = errorData.error.message;
          } else if (typeof errorData.error === 'string') {
            msg = errorData.error;
          }
        } else if (typeof errorData === 'string') {
          msg = errorData;
        }
        
        if (error.response.data.details) {
          msg += ` (${error.response.data.details})`;
        }
      } else if (error.message) {
        msg = error.message;
      }
      
      // Sikre at vi alltid har en string
      if (typeof msg !== 'string') {
        msg = 'Kunne ikke hente bedriftsinformasjon';
      }
      
      setBedriftSøkError(msg);
      setBedriftSøkStatus('error');
    } finally {
      setSøkerBedrift(false);
    }
  };

  const handleLagre = async () => {
    setLoading(true);
    setLagreError(null);
    try {
      // Preparer bedriftsdata med utvidet informasjon fra Brønnøysund
      const { _brregData, orgNummer, ...grunnleggendeInfo } = bedriftInfo;
      const bedriftPayload = {
        ...grunnleggendeInfo,
        // Konverter orgNummer til organisasjonsnummer som serveren forventer
        organisasjonsnummer: normaliserOrgNummer(orgNummer || ''),
        // Legg til utvidet informasjon hvis tilgjengelig
        ..._brregData && {
          stiftelsesdato: _brregData.stiftelsesdato,
          organisasjonsform: _brregData.organisasjonsform,
          organisasjonsformKode: _brregData.organisasjonsformKode,
          næringskode: _brregData.næringskode,
          næringskodeKode: _brregData.næringskodeKode,
          dagligLeder: _brregData.dagligLeder,
          styreleder: _brregData.styreleder,
          signaturrett: _brregData.signaturrett,
          brregMetadata: _brregData._metadata
        }
      };

      console.log('💾 Sender bedriftsdata til server:', bedriftPayload);

      // Opprett bedrift
              const bedriftRes = await api.post('/bedrifter', bedriftPayload);
      const bedriftData = bedriftRes.data;

      if (!bedriftData || !bedriftData.id) {
        throw new Error('Bedrift ble ikke opprettet korrekt');
      }

      // Lagre bedriftId for eventuell ansatt-registrering
      setOpprettetBedriftId(bedriftData.id);

      // Lagre klasser hvis noen er valgt
      if (valgteKlasser.length > 0) {
        await api.post(`/bedrifter/${bedriftData.id}/klasser`, { 
          klasser: valgteKlasser 
        });
      }

      // Naviger til bedriftsoversikten
      navigate('/bedrifter');
    } catch (error: any) {
      log.error('Feil ved oppretting av bedrift', error);
      // Håndter ulike typer error response
      let errorMessage = 'Ukjent feil ved lagring';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        // Sjekk om det er et error-objekt med message-felt
        if (typeof errorData === 'object' && errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'object' && errorData.error) {
          // Håndter nested error-objekter
          if (typeof errorData.error === 'object' && errorData.error.message) {
            errorMessage = errorData.error.message;
          } else if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else {
            errorMessage = 'Feil ved lagring av bedrift';
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Sikre at vi alltid har en string, ikke et objekt
      if (typeof errorMessage !== 'string') {
        errorMessage = 'Feil ved lagring av bedrift';
      }
      
      setLagreError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Grupper klasser etter kategori
  const klasserEtterKategori = alleKlasser.reduce((acc, klasse) => {
    if (!acc[klasse.kategori]) {
      acc[klasse.kategori] = [];
    }
    acc[klasse.kategori].push(klasse);
    return acc;
  }, {} as Record<string, FørerkortKlasse[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Opprett ny bedrift</h1>
          <p className="text-gray-600 mt-1">Registrer bedriftsinformasjon og velg førerkortklasser</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {lagreError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div>
              <p className="font-medium">Feil oppstod</p>
              <p className="text-sm">{lagreError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Venstre kolonne - Bedriftsinformasjon */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">Bedriftsinformasjon</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block font-semibold mb-2 text-gray-900">Bedriftsnavn *</label>
                <input
                  name="navn"
                  value={bedriftInfo.navn}
                  onChange={handleBedriftInfoChange}
                  className="border rounded-lg px-4 py-3 w-full text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="F.eks. Roalds Trafikkskole AS"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-900">Organisasjonsnummer</label>
                <div className="flex gap-3">
                  <input
                    name="orgNummer"
                    value={bedriftInfo.orgNummer}
                    onChange={handleBedriftInfoChange}
                    className="border rounded-lg px-4 py-3 flex-1 placeholder-gray-500 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="913831438 eller 913 831 438"
                    maxLength={11}
                  />
                  <button
                    type="button"
                    onClick={søkBedriftIBrønnøysund}
                    disabled={søkerBedrift || !validerOrgNummer(bedriftInfo.orgNummer)}
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-100 flex items-center gap-2 whitespace-nowrap"
                    title="Hent bedriftsinformasjon fra Brønnøysundregisteret"
                  >
                    {søkerBedrift ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                    {søkerBedrift ? 'Søker...' : 'Søk'}
                  </button>
                </div>
                
                {/* Status indikatorer */}
                {bedriftSøkStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
                    <FaCheckCircle />
                    <span>Bedriftsinformasjon hentet fra Brønnøysundregisteret</span>
                  </div>
                )}
                
                {bedriftSøkStatus === 'error' && bedriftSøkError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                    <FaExclamationTriangle />
                    <span>{bedriftSøkError}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-900">Adresse</label>
                <input
                  name="adresse"
                  value={bedriftInfo.adresse}
                  onChange={handleBedriftInfoChange}
                  className="border rounded-lg px-4 py-3 w-full text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="F.eks. Loddefjordlien 14"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2 text-gray-900">Postnummer</label>
                  <input
                    name="postnummer"
                    value={bedriftInfo.postnummer}
                    onChange={handleBedriftInfoChange}
                    className="border rounded-lg px-4 py-3 w-full placeholder-gray-500 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="4 siffer"
                    maxLength={4}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-gray-900">Poststed</label>
                  <input
                    name="poststed"
                    value={bedriftInfo.poststed}
                    onChange={handleBedriftInfoChange}
                    className="border rounded-lg px-4 py-3 w-full text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="F.eks. LODDEFJORD"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2 text-gray-900">Telefon</label>
                  <input
                    name="telefon"
                    value={bedriftInfo.telefon}
                    onChange={handleBedriftInfoChange}
                    className="border rounded-lg px-4 py-3 w-full placeholder-gray-500 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="8 siffer"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-gray-900">E-post</label>
                  <input
                    name="epost"
                    type="email"
                    value={bedriftInfo.epost}
                    onChange={handleBedriftInfoChange}
                    className="border rounded-lg px-4 py-3 w-full text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="post@bedrift.no"
                  />
                </div>
              </div>

              {/* Brønnøysund-informasjon */}
              {bedriftInfo._brregData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FaCheckCircle className="text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Registrert informasjon (Brønnøysundregisteret)</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {bedriftInfo._brregData.stiftelsesdato && (
                      <div>
                        <div className="text-gray-600">Stiftelsesdato</div>
                        <div className="font-medium text-gray-900">{bedriftInfo._brregData.stiftelsesdato}</div>
                      </div>
                    )}
                    
                    {bedriftInfo._brregData.organisasjonsform && (
                      <div>
                        <div className="text-gray-600">Organisasjonsform</div>
                        <div className="font-medium text-gray-900">
                          {bedriftInfo._brregData.organisasjonsform}
                          {bedriftInfo._brregData.organisasjonsformKode && ` (${bedriftInfo._brregData.organisasjonsformKode})`}
                        </div>
                      </div>
                    )}
                    
                    {bedriftInfo._brregData.næringskode && (
                      <div>
                        <div className="text-gray-600">Næringskode</div>
                        <div className="font-medium text-gray-900">
                          {bedriftInfo._brregData.næringskode}
                          {bedriftInfo._brregData.næringskodeKode && ` (${bedriftInfo._brregData.næringskodeKode})`}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Daglig leder seksjon */}
                  {bedriftInfo._brregData.dagligLeder && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-green-500" />
                          <span className="font-semibold text-gray-900">Daglig leder</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setVisAnsattDialog(true)}
                          disabled={!opprettetBedriftId}
                          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                          title="Opprett bruker for daglig leder"
                        >
                          <FaPlus className="text-xs" />
                          Opprett bruker
                        </button>
                      </div>
                      <div className="text-gray-900 font-medium mt-1">{bedriftInfo._brregData.dagligLeder}</div>
                      {!opprettetBedriftId && (
                        <div className="text-xs text-gray-500 mt-1">
                          Lagre bedriften først for å kunne opprette bruker
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Høyre kolonne - Førerkortklasser */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">Velg førerkortklasser</h2>
                          <p className="text-gray-600 mb-4 text-sm">Velg hvilke førerkortklasser bedriften skal tilby opplæring for</p>
            
            {lasterKlasser ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Laster klasser...</span>
              </div>
            ) : (
                             <div className="space-y-4">
                 {Object.entries(klasserEtterKategori).map(([kategori, klasser]) => (
                   <div key={kategori}>
                     <h3 className="font-semibold text-gray-900 mb-2 text-sm">{kategori}</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {klasser.map((klasse) => {
                        const valgt = valgteKlasser.includes(klasse.kode);
                        return (
                          <button
                            key={klasse.kode}
                            type="button"
                            onClick={() => setValgteKlasser(prev => 
                              valgt 
                                ? prev.filter(k => k !== klasse.kode)
                                : [...prev, klasse.kode]
                            )}
                                                         className={`text-left p-3 border rounded-lg transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                               valgt 
                                 ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' 
                                 : 'bg-white border-gray-200 hover:bg-blue-25 hover:border-blue-200'
                             }`}
                           >
                             <div className="flex items-center gap-2 mb-1">
                               <span className={`inline-block w-4 h-4 border rounded ${
                                 valgt ? 'bg-blue-600 border-blue-600' : 'border-gray-400'
                               }`}></span>
                               <span className="font-semibold text-base text-gray-900">{klasse.kode}</span>
                               <span className="text-xs text-gray-500">({klasse.minimumsalder})</span>
                             </div>
                             <div className="text-xs text-gray-800 mb-1 leading-tight">{klasse.navn}</div>
                                                           <div className="text-xs text-gray-600 leading-tight" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>{klasse.beskrivelse}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/bedrifter')}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Avbryt
          </button>
          
          <button
            onClick={handleLagre}
            disabled={loading || !bedriftInfo.navn.trim()}
            className="px-6 py-3 bg-[#003366] text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Lagrer...
              </>
            ) : (
              'Opprett bedrift'
            )}
          </button>
        </div>
      </div>

      {/* AnsattDialog for daglig leder */}
      {visAnsattDialog && opprettetBedriftId && bedriftInfo._brregData?.dagligLeder && (
        <AnsattDialog
          bedriftId={opprettetBedriftId}
          onClose={() => setVisAnsattDialog(false)}
          onSuccess={() => {
            setVisAnsattDialog(false);
            // Naviger til bedriftsoversikten etter vellykket brukeropprettelse
            navigate('/bedrifter');
          }}
          initialNavn={bedriftInfo._brregData.dagligLeder}
        />
      )}
    </div>
  );
} 