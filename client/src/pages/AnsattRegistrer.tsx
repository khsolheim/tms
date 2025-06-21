import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaLock, 
  FaUserTag, 
  FaEye, 
  FaEyeSlash, 
  FaArrowLeft,
  FaMapMarkerAlt,
  FaIdCard,
  FaCar,
  FaSave,
  FaTimes,
  FaStar,
  // FaPhone,
  // FaEnvelope,
  // FaBriefcase,
  // FaUserTie,
  // FaClipboardCheck // Currently unused
} from 'react-icons/fa';
import api from '../lib/api';
import { usePostnummer } from '../hooks/usePostnummer';
import { referenceService } from '../services/reference.service';
import { log } from '../utils/logger';

interface Bedrift {
  id: number;
  navn: string;
  orgnr: string;
}

interface Kjøretøy {
  id: number;
  registreringsnummer: string;
  merke: string;
  modell: string;
  årsmodell: number;
  type: string;
  status: string;
  førerkortklass: string[];
}

interface Bedrift {
  id: number;
  navn: string;
  klasser: { klassekode: string }[];
  kjøretøy?: Kjøretøy[];
}

interface FørerkortKlasse {
  kode: string;
  omfatter: string;
  alder: string;
}

const AnsattRegistrer: React.FC = () => {
  const navigate = useNavigate();
  const { bedriftId, ansattId } = useParams();
  const [loading, setLoading] = useState(false);
  const [visPassord, setVisPassord] = useState(false);
  const [visBekreftPassord, setVisBekreftPassord] = useState(false);
  const [bedrift, setBedrift] = useState<Bedrift | null>(null);
  const [kjøretøy, setKjøretøy] = useState<Kjøretøy[]>([]);
  const [alleKlasser, setAlleKlasser] = useState<FørerkortKlasse[]>([]);
  const [lasterKlasser, setLasterKlasser] = useState(true);
  const [ansatt, setAnsatt] = useState({
    fornavn: '',
    etternavn: '',
    epost: '',
    telefon: '',
    adresse: '',
    postnummer: '',
    poststed: '',
    rolle: 'TRAFIKKLARER' as 'HOVEDBRUKER' | 'TRAFIKKLARER' | 'ADMIN',
    passord: '',
    bekreftPassord: '',
    klasser: [] as string[],
    kjøretøy: [] as number[],
    hovedkjøretøy: null as number | null
  });
  const [error, setError] = useState<string | { message?: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Bruk postnummer hook
  const { finnPoststed } = usePostnummer();

  const erRedigeringsmodus = !!ansattId;

  // Hent førerkortklasser fra API
  useEffect(() => {
    const hentFørerkortKlasser = async () => {
      try {
        setLasterKlasser(true);
        const klasser = await referenceService.getFørerkortKlasser();
        
        // Konverter til format som komponenten forventer
        const klasseArray: FørerkortKlasse[] = [];
        if (typeof klasser === 'object' && !Array.isArray(klasser)) {
          Object.values(klasser).forEach((kategoriKlasser: any) => {
            kategoriKlasser.forEach((klasse: any) => {
              klasseArray.push({
                kode: klasse.kode,
                omfatter: klasse.beskrivelse || klasse.navn,
                alder: klasse.minimumsalder ? `${klasse.minimumsalder} år` : 'Varierer'
              });
            });
          });
        }
        
        // Legg til spesielle klasser som ikke er i API
        klasseArray.push(
          { kode: 'E', omfatter: 'Tilhenger og tilhengerredskap (tillegg til klasse B, C1, C, D1 og D)', alder: '18 eller 21 år' },
          { kode: 'M 147', omfatter: 'Tre- og firehjuls moped', alder: '16 år' }
        );
        
        setAlleKlasser(klasseArray.sort((a, b) => a.kode.localeCompare(b.kode)));
      } catch (error) {
        log.apiError('reference/foererkort-klasser', error);
        log.error('Feil ved henting av førerkortklasser, bruker fallback data');
        
        // Fallback til hardkodet data
        setAlleKlasser([
          { kode: 'A1', omfatter: 'Lett motorsykkel, snøscooter', alder: '16 år' },
          { kode: 'A2', omfatter: 'Mellomklasse motorsykkel', alder: '18 år' },
          { kode: 'A', omfatter: 'Motorsykkel (Utvidelse: 20 år - Direkte 24 år)', alder: '20 eller 24 år' },
          { kode: 'B', omfatter: 'Personbil, varebil', alder: '18 år' },
          { kode: 'BE', omfatter: 'Personbil med tilhenger', alder: '18 år' },
          { kode: 'C1', omfatter: 'Lett lastebil', alder: '18 eller 21 år¹' },
          { kode: 'C1E', omfatter: 'Lett lastebil med tilhenger', alder: '18 eller 21 år¹' },
          { kode: 'C', omfatter: 'Lastebil', alder: '18 eller 21 år¹' },
          { kode: 'CE', omfatter: 'Vogntog', alder: '18 eller 21 år¹' },
          { kode: 'D1', omfatter: 'Minibuss', alder: '21 år' },
          { kode: 'D1E', omfatter: 'Minibuss med tilhenger', alder: '21 år' },
          { kode: 'D', omfatter: 'Buss', alder: '21 år' },
          { kode: 'DE', omfatter: 'Buss med tilhenger', alder: '21 år' },
          { kode: 'E', omfatter: 'Tilhenger og tilhengerredskap (tillegg til klasse B, C1, C, D1 og D) (tilhenger over 750 kilo: 21 år)', alder: '18 eller 21 år' },
          { kode: 'S', omfatter: 'Beltemotorsykkel', alder: '16 år' },
          { kode: 'T', omfatter: 'Traktor', alder: '16 år' },
          { kode: 'M 147', omfatter: 'Tre- og firehjuls moped', alder: '16 år' },
        ]);
      } finally {
        setLasterKlasser(false);
      }
    };

    hentFørerkortKlasser();
  }, []);

  useEffect(() => {
    const hentData = async () => {
      if (!bedriftId) return;
      
      try {
        setLoading(true);
        
        // Hent bedrift med klasser og kjøretøy
        const [bedriftRes, kjøretøyRes] = await Promise.all([
                  api.get(`/bedrifter/${bedriftId}`),
        api.get(`/bedrifter/${bedriftId}/kjoretoy`)
        ]);
        
        setBedrift(bedriftRes.data);
        setKjøretøy(kjøretøyRes.data);

        // Hvis redigering, hent ansatt-data
        if (ansattId) {
          const ansattRes = await api.get(`/ansatt/${ansattId}`);
          const ansattData = ansattRes.data;
          
          setAnsatt({
            fornavn: ansattData.fornavn || '',
            etternavn: ansattData.etternavn || '',
            epost: ansattData.epost || '',
            telefon: ansattData.telefon || '',
            adresse: ansattData.adresse || '',
            postnummer: ansattData.postnummer || '',
            poststed: ansattData.poststed || '',
            rolle: ansattData.rolle || 'TRAFIKKLARER',
            passord: '',
            bekreftPassord: '',
            klasser: ansattData.klasser || [],
            kjøretøy: ansattData.kjøretøy || [],
            hovedkjøretøy: ansattData.hovedkjøretøy || null
          });
        }
      } catch (error: any) {
        console.error('Feil ved henting av data:', error);
        setError('Kunne ikke laste nødvendig data');
      } finally {
        setLoading(false);
      }
    };

    hentData();
  }, [bedriftId, ansattId]);

  // Validering av felter
  const validateField = (name: string, value: string | string[] | number | null) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'fornavn':
        if (!value || (typeof value === 'string' && !value.trim())) {
          errors.fornavn = 'Fornavn er påkrevd';
        } else if (typeof value === 'string' && value.trim().length < 2) {
          errors.fornavn = 'Fornavn må være minst 2 tegn';
        } else {
          delete errors.fornavn;
        }
        break;
      
      case 'etternavn':
        if (!value || (typeof value === 'string' && !value.trim())) {
          errors.etternavn = 'Etternavn er påkrevd';
        } else if (typeof value === 'string' && value.trim().length < 2) {
          errors.etternavn = 'Etternavn må være minst 2 tegn';
        } else {
          delete errors.etternavn;
        }
        break;
      
      case 'epost':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          errors.epost = 'E-post er påkrevd';
        } else if (typeof value === 'string' && !emailRegex.test(value)) {
          errors.epost = 'Ugyldig e-postadresse';
        } else {
          delete errors.epost;
        }
        break;
      
      case 'telefon':
        if (value && typeof value === 'string' && !/^\d{8}$/.test(value.replace(/\s/g, ''))) {
          errors.telefon = 'Telefonnummer må være 8 siffer';
        } else {
          delete errors.telefon;
        }
        break;

      case 'postnummer':
        if (value && typeof value === 'string' && !/^\d{4}$/.test(value)) {
          errors.postnummer = 'Postnummer må være 4 siffer';
        } else {
          delete errors.postnummer;
        }
        break;
      
      case 'passord':
        if (!erRedigeringsmodus && !value) {
          errors.passord = 'Passord er påkrevd';
        } else if (value && typeof value === 'string' && value.length < 8) {
          errors.passord = 'Passord må være minst 8 tegn';
        } else if (value && typeof value === 'string' && !/(?=.*[a-z])/.test(value)) {
          errors.passord = 'Passord må inneholde minst én liten bokstav';
        } else if (value && typeof value === 'string' && !/(?=.*[A-Z])/.test(value)) {
          errors.passord = 'Passord må inneholde minst én stor bokstav';
        } else if (value && typeof value === 'string' && !/(?=.*\d)/.test(value)) {
          errors.passord = 'Passord må inneholde minst ett tall';
        } else {
          delete errors.passord;
        }
        break;
      
      case 'bekreftPassord':
        if ((!erRedigeringsmodus || ansatt.passord) && value !== ansatt.passord) {
          errors.bekreftPassord = 'Passordene må være like';
        } else {
          delete errors.bekreftPassord;
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Valider alle felter før innsending
    Object.entries(ansatt).forEach(([key, value]) => {
      if (key !== 'kjøretøy' && key !== 'klasser' && key !== 'hovedkjøretøy') {
        validateField(key, value as string);
      }
    });

    // Sjekk om det er noen valideringsfeil
    if (Object.keys(validationErrors).length > 0) {
      setError('Vennligst rett opp feilene i skjemaet');
      return;
    }

    if (!erRedigeringsmodus) {
      if (ansatt.passord !== ansatt.bekreftPassord) {
        setError('Passordene må være like');
        return;
      }

      if (ansatt.passord.length < 8) {
        setError('Passordet må være minst 8 tegn');
        return;
      }
    }

    setLoading(true);
    try {
      const { bekreftPassord, ...ansattData } = ansatt;
      
      const submitData: any = {
        ...ansattData,
        fornavn: ansattData.fornavn.trim(),
        etternavn: ansattData.etternavn.trim(),
        epost: ansattData.epost.trim(),
        telefon: ansattData.telefon ? ansattData.telefon.replace(/\s/g, '') : null,
        adresse: ansattData.adresse.trim() || null,
        postnummer: ansattData.postnummer || null,
        poststed: ansattData.poststed.trim() || null,
        bedriftId: parseInt(bedriftId!)
      };

      if (erRedigeringsmodus) {
        // Oppdater eksisterende ansatt
        if (!ansattData.passord) {
          delete submitData.passord;
        }

        await api.put(`/ansatt/${ansattId}`, submitData);
      } else {
        // Opprett ny ansatt
        await api.post('/ansatt/create', submitData);
      }

      navigate(`/bedrifter/${bedriftId}/ansatte`);
    } catch (error: any) {
      console.error(`Feil ved ${erRedigeringsmodus ? 'oppdatering' : 'oppretting'} av ansatt:`, error);
      setError(typeof error === 'string' ? error : error?.message || 'Ukjent feil');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Automatisk poststed-oppslag når postnummer endres
    if (name === 'postnummer' && value.length === 4) {
      const poststed = finnPoststed(value);
      if (poststed) {
        setAnsatt(prev => ({ ...prev, [name]: value, poststed }));
      } else {
        setAnsatt(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setAnsatt(prev => ({ ...prev, [name]: value }));
    }
    
    validateField(name, value);
  };

  const formatTelefon = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)}`;
  };

  const handleTelefonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefon(e.target.value);
    setAnsatt(prev => ({ ...prev, telefon: formatted }));
    validateField('telefon', formatted);
  };

  const toggleKlasse = (klassekode: string) => {
    setAnsatt(prev => ({
      ...prev,
      klasser: prev.klasser.includes(klassekode)
        ? prev.klasser.filter(k => k !== klassekode)
        : [...prev.klasser, klassekode]
    }));
  };

  const toggleKjøretøy = (kjøretøyId: number) => {
    setAnsatt(prev => {
      const nyeKjøretøy = prev.kjøretøy.includes(kjøretøyId)
        ? prev.kjøretøy.filter(k => k !== kjøretøyId)
        : [...prev.kjøretøy, kjøretøyId];
      
      // Hvis vi fjerner hovedkjøretøy, nullstill det
      const nyttHovedkjøretøy = nyeKjøretøy.includes(prev.hovedkjøretøy!)
        ? prev.hovedkjøretøy
        : nyeKjøretøy.length > 0 ? nyeKjøretøy[0] : null;

      return {
        ...prev,
        kjøretøy: nyeKjøretøy,
        hovedkjøretøy: nyttHovedkjøretøy
      };
    });
  };

  const settHovedkjøretøy = (kjøretøyId: number) => {
    setAnsatt(prev => ({ ...prev, hovedkjøretøy: kjøretøyId }));
  };

  const rolleOptions = [
    { value: 'TRAFIKKLARER', label: 'Trafikklærer', description: 'Kan gi opplæring til elever', color: 'blue' },
    { value: 'HOVEDBRUKER', label: 'Hovedbruker', description: 'Kan administrere bedriften og ansatte', color: 'green' },
    { value: 'ADMIN', label: 'Administrator', description: 'Full tilgang til alle funksjoner', color: 'purple' }
  ];

  // Filtrer klasser som bedriften tilbyr
  const tilgjengeligeKlasser = alleKlasser.filter(klasse => 
    bedrift?.klasser.some(bk => bk.klassekode === klasse.kode)
  );

  if (loading && !bedrift) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center cards-spacing-grid">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
          <span className="text-gray-600">Laster...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-2 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center cards-spacing-grid">
              <button
                onClick={() => navigate(`/bedrifter/${bedriftId}/ansatte`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaArrowLeft />
                Tilbake til ansatte
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {erRedigeringsmodus ? 'Rediger ansatt' : 'Registrer ny ansatt'}
                </h1>
                <p className="text-gray-600">{bedrift?.navn}</p>
              </div>
            </div>
            <div className="flex items-center cards-spacing-grid">
              <button
                type="button"
                onClick={() => navigate(`/bedrifter/${bedriftId}/ansatte`)}
                className="px-2 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="w-4 h-4 mr-2" />
                Avbryt
              </button>
              <button
                type="submit"
                form="ansatt-form"
                disabled={loading || Object.keys(validationErrors).length > 0}
                className="px-2 py-1 bg-[#003366] text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <FaSave className="w-4 h-4" />
                {loading ? 'Lagrer...' : (erRedigeringsmodus ? 'Lagre endringer' : 'Registrer ansatt')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-2 py-1">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded-lg mb-6 flex items-start cards-spacing-grid">
            <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div>
              <p className="font-medium">Feil oppstod</p>
              <p className="text-sm">{typeof error === 'string' ? error : error?.message || 'Ukjent feil'}</p>
            </div>
          </div>
        )}

        <form id="ansatt-form" onSubmit={handleSubmit} className="form-grid-layout">
          {/* Venstre kolonne - Grunnleggende informasjon */}
          <div className="lg:col-span-2 cards-spacing-vertical">
            {/* Personlig informasjon */}
            <div className="bg-white rounded-xl shadow-sm border px-2 py-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FaUser className="text-blue-500" />
                Personlig informasjon
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fornavn *
                  </label>
                  <input
                    name="fornavn"
                    value={ansatt.fornavn}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 ${
                      validationErrors.fornavn ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="F.eks. Ola"
                    required
                  />
                  {validationErrors.fornavn && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.fornavn}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etternavn *
                  </label>
                  <input
                    name="etternavn"
                    value={ansatt.etternavn}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 ${
                      validationErrors.etternavn ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="F.eks. Nordmann"
                    required
                  />
                  {validationErrors.etternavn && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.etternavn}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-postadresse *
                  </label>
                  <input
                    name="epost"
                    type="email"
                    value={ansatt.epost}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 ${
                      validationErrors.epost ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="ola.nordmann@bedrift.no"
                    required
                  />
                  {validationErrors.epost && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.epost}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefonnummer
                  </label>
                  <input
                    name="telefon"
                    value={ansatt.telefon}
                    onChange={handleTelefonChange}
                    className={`w-full px-4 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 ${
                      validationErrors.telefon ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="123 45 678"
                    maxLength={11}
                  />
                  {validationErrors.telefon && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.telefon}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Adresseinformasjon */}
            <div className="bg-white rounded-xl shadow-sm border px-2 py-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FaMapMarkerAlt className="text-green-500" />
                Adresse
              </h2>
              
              <div className="cards-spacing-vertical">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gateadresse
                  </label>
                  <input
                    name="adresse"
                    value={ansatt.adresse}
                    onChange={handleInputChange}
                    className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                    placeholder="F.eks. Storgata 1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postnummer
                    </label>
                    <input
                      name="postnummer"
                      value={ansatt.postnummer}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 ${
                        validationErrors.postnummer ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="0123"
                      maxLength={4}
                    />
                    {validationErrors.postnummer && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.postnummer}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Poststed
                    </label>
                    <input
                      name="poststed"
                      value={ansatt.poststed}
                      onChange={handleInputChange}
                      className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-gray-900"
                      placeholder="Fylles automatisk"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sikkerhet */}
            <div className="bg-white rounded-xl shadow-sm border px-2 py-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FaLock className="text-red-500" />
                Sikkerhet og pålogging
              </h2>
              
              <div className="cards-spacing-vertical">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passord {erRedigeringsmodus ? '(la stå tom for å beholde eksisterende)' : '*'}
                  </label>
                  <div className="relative">
                    <input
                      name="passord"
                      type={visPassord ? 'text' : 'password'}
                      value={ansatt.passord}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-1 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 ${
                        validationErrors.passord ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      required={!erRedigeringsmodus}
                      placeholder={erRedigeringsmodus ? 'Nytt passord (valgfritt)' : 'Minst 8 tegn, inkl. stor/liten bokstav og tall'}
                    />
                    <button
                      type="button"
                      onClick={() => setVisPassord(!visPassord)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {visPassord ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {validationErrors.passord && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.passord}</p>
                  )}
                  {!validationErrors.passord && !erRedigeringsmodus && (
                    <p className="text-gray-500 text-xs mt-1">
                      Passordet må være minst 8 tegn og inneholde stor bokstav, liten bokstav og tall
                    </p>
                  )}
                </div>

                {(!erRedigeringsmodus || ansatt.passord) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bekreft passord {erRedigeringsmodus ? '' : '*'}
                    </label>
                    <div className="relative">
                      <input
                        name="bekreftPassord"
                        type={visBekreftPassord ? 'text' : 'password'}
                        value={ansatt.bekreftPassord}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-1 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 ${
                          validationErrors.bekreftPassord ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                        }`}
                        required={!erRedigeringsmodus || !!ansatt.passord}
                        placeholder="Gjenta passord"
                      />
                      <button
                        type="button"
                        onClick={() => setVisBekreftPassord(!visBekreftPassord)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {visBekreftPassord ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {validationErrors.bekreftPassord && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.bekreftPassord}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Høyre kolonne - Rolle, klasser og kjøretøy */}
          <div className="cards-spacing-vertical">
            {/* Rolle */}
            <div className="bg-white rounded-xl shadow-sm border px-2 py-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FaUserTag className="text-purple-500" />
                Rolle og tilganger
              </h2>
              
              <div className="space-y-1">
                {rolleOptions.map(option => (
                  <label key={option.value} className="flex items-start cards-spacing-grid cursor-pointer">
                    <input
                      type="radio"
                      name="rolle"
                      value={option.value}
                      checked={ansatt.rolle === option.value}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Klasser */}
            <div className="bg-white rounded-xl shadow-sm border px-2 py-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FaIdCard className="text-yellow-500" />
                Underviser i klasser
              </h2>
              
              {tilgjengeligeKlasser.length > 0 ? (
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {tilgjengeligeKlasser.map(klasse => (
                    <label key={klasse.kode} className="flex items-start cards-spacing-grid cursor-pointer p-1 rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={ansatt.klasser.includes(klasse.kode)}
                        onChange={() => toggleKlasse(klasse.kode)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Klasse {klasse.kode}</div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Bedriften har ikke registrert noen klasser ennå.</p>
              )}
            </div>

            {/* Kjøretøy */}
            <div className="bg-white rounded-xl shadow-sm border px-2 py-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FaCar className="text-blue-500" />
                Disponible kjøretøy
              </h2>
              
              {kjøretøy.length > 0 ? (
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {kjøretøy.map(bil => (
                    <div key={bil.id} className="px-2 py-1 border rounded-lg">
                      <label className="flex items-start cards-spacing-grid cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ansatt.kjøretøy.includes(bil.id)}
                          onChange={() => toggleKjøretøy(bil.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            {bil.registreringsnummer}
                            {ansatt.hovedkjøretøy === bil.id && (
                              <FaStar className="text-yellow-500 w-4 h-4" title="Hovedkjøretøy" />
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{bil.merke} {bil.modell} ({bil.årsmodell})</div>
                          <div className="text-xs text-gray-500">{bil.type} - {bil.status}</div>
                        </div>
                      </label>
                      
                      {ansatt.kjøretøy.includes(bil.id) && (
                        <button
                          type="button"
                          onClick={() => settHovedkjøretøy(bil.id)}
                          className={`mt-2 px-3 py-1 text-xs rounded-full transition-colors ${
                            ansatt.hovedkjøretøy === bil.id
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                              : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {ansatt.hovedkjøretøy === bil.id ? 'Hovedkjøretøy' : 'Sett som hovedkjøretøy'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Bedriften har ikke registrert noen kjøretøy ennå.</p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnsattRegistrer; 