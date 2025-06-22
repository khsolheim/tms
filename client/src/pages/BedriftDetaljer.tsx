import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaCar, 
  FaUsers, 
  FaGraduationCap, 
  FaEye,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBuilding,
  FaSave,
  FaTimes,
  FaUser,
  FaUserPlus
} from 'react-icons/fa';
import ElevOversikt from '../components/forms/ElevOversikt';
import api from '../lib/api';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import NotificationDialog from '../components/ui/NotificationDialog';
import { log } from '../utils/logger';
import { formatApiErrorMessage } from '../utils/errorHandling';
import { referenceService } from '../services/reference.service';

const TABS = [
  { key: 'info', label: 'Bedriftsinfo', icon: FaBuilding },
  { key: 'ansatte', label: 'Ansatte', icon: FaUsers },
  { key: 'klasser', label: 'Klasser', icon: FaGraduationCap },
  { key: 'kjoretoy', label: 'Kjøretøy', icon: FaCar },
  { key: 'elever', label: 'Elever', icon: FaUsers },
];

interface FørerkortKlasse {
  kode: string;
  omfatter: string;
  alder: string;
}

interface Ansatt {
  id: number;
  fornavn: string;
  etternavn: string;
  epost: string;
  telefon: string | null;
  rolle: 'HOVEDBRUKER' | 'TRAFIKKLARER' | 'ADMIN';
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
  opprettet: string;
}

interface Bedrift {
  id: number;
  navn: string;
  orgNummer: string | null;
  adresse: string | null;
  postnummer: string | null;
  poststed: string | null;
  telefon: string | null;
  epost: string | null;
  hovedbruker: Ansatt | null;
  ansatte: Ansatt[];
  klasser: { klassekode: string }[];
  kjøretøy?: Kjøretøy[];
  // Utvidet informasjon fra Brønnøysundregisteret
  stiftelsesdato?: string | null;
  organisasjonsform?: string | null;
  organisasjonsformKode?: string | null;
  næringskode?: string | null;
  næringskodeKode?: string | null;
  dagligLeder?: string | null;
  styreleder?: string | null;
  signaturrett?: any[] | null;
  brregMetadata?: any | null;
}

export default function BedriftDetaljer() {
  const { id, tab: urlTab } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(urlTab || 'info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | { message?: string } | null>(null);
  const [bedrift, setBedrift] = useState<Bedrift | null>(null);
  const [slettBekreft, setSlettBekreft] = useState(false);
  const [visSlettPopup, setVisSlettPopup] = useState(false);
  const [alleKlasser, setAlleKlasser] = useState<FørerkortKlasse[]>([]);
  const [lasterKlasser, setLasterKlasser] = useState(true);
  
  // Inline editing states
  const [erRedigering, setErRedigering] = useState(false);
  const [lagrer, setLagrer] = useState(false);
  const [redigerData, setRedigerData] = useState<Partial<Bedrift>>({});

  const [visKjøretøyDialog, setVisKjøretøyDialog] = useState(false);
  const [redigerKjøretøy, setRedigerKjøretøy] = useState<Kjøretøy | null>(null);
  const [kjøretøy, setKjøretøy] = useState<Kjøretøy[]>([]);
  const [redigerKlasser, setRedigerKlasser] = useState(false);
  const [midlertidigeKlasser, setMidlertidigeKlasser] = useState<{ klassekode: string }[]>([]);
  const [lagrerKlasser, setLagrerKlasser] = useState(false);
  const [lasterKjøretøy, setLasterKjøretøy] = useState(false);
  const [kjøretøyError, setKjøretøyError] = useState<string | null>(null);
  
  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'success' | 'info';
    onConfirm: () => void;
    details?: string[];
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

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

  // Oppdater tab når URL endres
  useEffect(() => {
    if (urlTab && ['info', 'ansatte', 'klasser', 'kjoretoy', 'elever'].includes(urlTab)) {
      setTab(urlTab);
    } else if (urlTab) {
      // Hvis tab ikke er gyldig, redirect til info
      navigate(`/bedrifter/${id}/info`, { replace: true });
    }
  }, [urlTab, id, navigate]);

  // Funksjon for å endre tab og oppdatere URL
  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    navigate(`/bedrifter/${id}/${newTab}`);
  };

  useEffect(() => {
    const hentBedrift = async () => {
      if (!id) return;
      
      try {
        setError(null);
        const res = await api.get(`/bedrifter/${id}`);
        setBedrift(res.data);
      } catch (error: any) {
        log.apiError('GET /bedrifter', error);
        
        let errorMessage = 'Kunne ikke hente bedriftsinformasjon';
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;
          
          if (status === 401) {
            errorMessage = 'Du er ikke logget inn. Vennligst logg inn på nytt.';
          } else if (status === 403) {
            errorMessage = 'Du har ikke tilgang til denne bedriften.';
          } else if (status === 404) {
            errorMessage = 'Bedrift ikke funnet.';
          } else if (data?.error) {
            errorMessage = data.error;
          } else {
            errorMessage = `Server feil (${status}): ${errorMessage}`;
          }
        } else if (error.request) {
          errorMessage = 'Kunne ikke kontakte serveren. Sjekk internetttilkoblingen.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    hentBedrift();
  }, [id]);

  useEffect(() => {
    if (tab === 'kjoretoy') {
      hentKjøretøy();
    }
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (bedrift && !loading) {
      hentKjøretøy();
    }
  }, [bedrift, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSlettKlikk = async () => {
    log.debug('handleSlettKlikk kalles', { slettBekreft });
    if (slettBekreft) {
      log.debug('Viser slett popup');
      setVisSlettPopup(true);
    } else {
      log.debug('Setter slettBekreft til true');
      setSlettBekreft(true);
    }
  };

  const bekreftSletting = async () => {
    log.debug('bekreftSletting kalles', { bedriftId: bedrift?.id });
    
    // Sjekk token
    const token = localStorage.getItem('token');
    log.debug('Token status', { tokenExists: !!token, tokenLength: token?.length });
    
    try {
      log.debug('Sender DELETE request', { endpoint: `/bedrift/${bedrift?.id}` });
      const response = await api.delete(`/bedrifter/${bedrift?.id}`);
      log.debug('DELETE response mottatt', { status: response.status });
      setVisSlettPopup(false);
      setSlettBekreft(false);
      log.userAction('Bedrift slettet', { bedriftId: bedrift?.id });
      navigate('/bedrifter');
    } catch (error: any) {
      log.apiError(`DELETE /bedrift/${bedrift?.id}`, error);
      
      // Spesiell håndtering for 401-feil
      if (error.response?.status === 401) {
        log.warn('Autentiseringsfeil - token kan være utløpt');
        const feilmelding = 'Du er ikke logget inn eller sesjonen har utløpt. Vennligst logg inn på nytt.';
        alert(feilmelding);
        navigate('/logg-inn');
        return;
      }
      
      // Bruk den nye standardiserte feilhåndteringen
      const feilmelding = formatApiErrorMessage(error, 'sletting av bedrift');
      
      log.error(`Kunne ikke slette bedrift: ${feilmelding}`);
      setNotification({
        isOpen: true,
        title: 'Feil ved sletting',
        message: `Kunne ikke slette bedrift: ${feilmelding}`,
        type: 'error'
      });
      setVisSlettPopup(false);
      setSlettBekreft(false);
    }
  };

  const avbrytSletting = () => {
    setVisSlettPopup(false);
    setSlettBekreft(false);
  };

  // Hovedbruker setting funksjonalitet kan implementeres senere ved behov

  const oppdaterBedrift = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/bedrifter/${id}`);
      setBedrift(res.data);
    } catch (error) {
      log.apiError('GET /bedrifter (refresh)', error);
    }
  };

  // Inline editing functions
  const startRedigering = () => {
    if (!bedrift) return;
    setRedigerData({
      navn: bedrift.navn,
      orgNummer: bedrift.orgNummer,
      adresse: bedrift.adresse,
      postnummer: bedrift.postnummer,
      poststed: bedrift.poststed,
      telefon: bedrift.telefon,
      epost: bedrift.epost
    });
    setErRedigering(true);
  };

  const avbrytRedigering = () => {
    setErRedigering(false);
    setRedigerData({});
  };

  const lagreEndringer = async () => {
    if (!bedrift || !id) return;
    
    setLagrer(true);
    try {
      const response = await api.put(`/bedrifter/${id}`, redigerData);
      setBedrift(response.data);
      setErRedigering(false);
      setRedigerData({});
      
      setNotification({
        isOpen: true,
        title: 'Suksess',
        message: 'Bedriftsinformasjon oppdatert',
        type: 'success'
      });
    } catch (error: any) {
      log.apiError('PUT /bedrift', error);
      const feilmelding = error.response?.data?.error || 'Kunne ikke oppdatere bedrift';
      setNotification({
        isOpen: true,
        title: 'Feil ved oppdatering',
        message: feilmelding,
        type: 'error'
      });
    } finally {
      setLagrer(false);
    }
  };

  const håndterInputEndring = (felt: keyof Bedrift, verdi: string) => {
    setRedigerData(prev => ({
      ...prev,
      [felt]: verdi || null
    }));
  };

  const hentKjøretøy = async () => {
    if (!bedrift?.id) return;
    
    try {
      setLasterKjøretøy(true);
      setKjøretøyError(null);
      const res = await api.get(`/bedrifter/${bedrift.id}/kjoretoy`);
      const kjoretoyData = res.data.map((k: any) => ({
        id: k.id,
        registreringsnummer: k.registreringsnummer,
        merke: k.merke,
        modell: k.modell,
        årsmodell: k.aarsmodell,
        type: k.type,
        status: k.status,
        førerkortklass: k.forerkortklass,
        opprettet: k.opprettet.split('T')[0]
      }));
      setKjøretøy(kjoretoyData);
    } catch (error: any) {
      log.apiError('GET /bedrift/kjoretoy', error);
      setKjøretøyError(error.message || 'Kunne ikke hente kjøretøy');
    } finally {
      setLasterKjøretøy(false);
    }
  };

  const leggTilKjøretøy = async (kjøretøyData: Omit<Kjøretøy, 'id' | 'opprettet'>) => {
    if (!bedrift?.id) return;
    
    try {
      const apiData = {
        registreringsnummer: kjøretøyData.registreringsnummer,
        merke: kjøretøyData.merke,
        modell: kjøretøyData.modell,
        aarsmodell: kjøretøyData.årsmodell,
        type: kjøretøyData.type,
        status: kjøretøyData.status,
        forerkortklass: kjøretøyData.førerkortklass,
        bedriftId: bedrift.id
      };

      const res = await api.post(`/bedrifter/${bedrift.id}/kjoretoy`, apiData);
      log.userAction('Kjøretøy opprettet', { 
        kjøretøyId: res.data.id, 
        registreringsnummer: res.data.registreringsnummer 
      });
      
      setVisKjøretøyDialog(false);
      hentKjøretøy();
    } catch (error: any) {
      log.apiError('POST /bedrift/kjoretoy', error);
    }
  };

  const oppdaterKjøretøy = async (kjøretøyId: number, kjøretøyData: Omit<Kjøretøy, 'id' | 'opprettet'>) => {
    if (!bedrift?.id) return;
    
    try {
      const apiData = {
        registreringsnummer: kjøretøyData.registreringsnummer,
        merke: kjøretøyData.merke,
        modell: kjøretøyData.modell,
        aarsmodell: kjøretøyData.årsmodell,
        type: kjøretøyData.type,
        status: kjøretøyData.status,
        forerkortklass: kjøretøyData.førerkortklass,
        bedriftId: bedrift.id
      };

      const res = await api.put(`/bedrifter/${bedrift.id}/kjoretoy/${kjøretøyId}`, apiData);
      log.userAction('Kjøretøy oppdatert', { 
        kjøretøyId, 
        registreringsnummer: res.data.registreringsnummer 
      });
      
      setRedigerKjøretøy(null);
      hentKjøretøy();
    } catch (error: any) {
      log.apiError('PUT /bedrift/kjoretoy', error);
    }
  };

  const slettKjøretøy = async (kjøretøyId: number) => {
    if (!bedrift?.id) return;
    
    const kjøretøyData = kjøretøy.find(k => k.id === kjøretøyId);
    if (!kjøretøyData) return;
    
    setConfirmDialog({
      isOpen: true,
      title: 'Slett kjøretøy',
      message: `Er du sikker på at du vil slette kjøretøyet "${kjøretøyData.registreringsnummer}" (${kjøretøyData.merke} ${kjøretøyData.modell})?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/bedrifter/${bedrift.id}/kjoretoy/${kjøretøyId}`);
          hentKjøretøy();
          setNotification({
            isOpen: true,
            title: 'Suksess',
            message: 'Kjøretøyet ble slettet',
            type: 'success'
          });
        } catch (error: any) {
          log.apiError('DELETE /bedrift/kjoretoy', error);
          setNotification({
            isOpen: true,
            title: 'Feil',
            message: 'Kunne ikke slette kjøretøy. Prøv igjen.',
            type: 'error'
          });
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const slettAnsatt = async (ansattId: number) => {
    if (!bedrift?.id) return;
    
    const ansattData = bedrift.ansatte.find(a => a.id === ansattId);
    if (!ansattData) return;
    
    setConfirmDialog({
      isOpen: true,
      title: 'Slett ansatt',
      message: `Er du sikker på at du vil slette ansatt "${ansattData.fornavn} ${ansattData.etternavn}"?`,
      type: 'danger',
      details: [
        'Ansattes tilgang til systemet',
        'Eventuelle tilknytninger til sikkerhetskontroller'
      ],
      onConfirm: async () => {
        try {
          await api.delete(`/ansatt/${ansattId}`);
          oppdaterBedrift();
          setNotification({
            isOpen: true,
            title: 'Suksess',
            message: 'Ansatt ble slettet',
            type: 'success'
          });
        } catch (error: any) {
          log.apiError('DELETE /ansatt', error);
          setNotification({
            isOpen: true,
            title: 'Feil',
            message: 'Kunne ikke slette ansatt. Prøv igjen.',
            type: 'error'
          });
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  // Legacy klasse oppdatering håndteres nå gjennom standardisert flow

  const startRedigerKlasser = () => {
    setMidlertidigeKlasser([...bedrift!.klasser]);
    setRedigerKlasser(true);
  };

  const avbrytRedigerKlasser = () => {
    setRedigerKlasser(false);
    setMidlertidigeKlasser([]);
  };

  const lagreKlasser = async () => {
    if (!bedrift?.id) return;
    
    try {
      setLagrerKlasser(true);
      
      // Send alle klassene til backend i riktig format
      const klasser = midlertidigeKlasser.map(k => k.klassekode);
              await api.post(`/bedrifter/${bedrift.id}/klasser`, { klasser });
      
      // Hent oppdatert bedrift data fra server
      await oppdaterBedrift();
      
      setRedigerKlasser(false);
      setMidlertidigeKlasser([]);
    } catch (error: any) {
      log.apiError('POST /bedrift/klasser', error);
      setNotification({
        isOpen: true,
        title: 'Feil',
        message: 'Kunne ikke lagre klasser. Prøv igjen.',
        type: 'error'
      });
    } finally {
      setLagrerKlasser(false);
    }
  };

  const håndterKlasseEndring = (klassekode: string, checked: boolean) => {
    if (redigerKlasser) {
      let nyeKlasser;
      if (checked) {
        // Legg til klasse hvis den ikke allerede finnes
        if (!midlertidigeKlasser.some(k => k.klassekode === klassekode)) {
          nyeKlasser = [...midlertidigeKlasser, { klassekode }];
        } else {
          nyeKlasser = midlertidigeKlasser;
        }
      } else {
        // Fjern klasse
        nyeKlasser = midlertidigeKlasser.filter(k => k.klassekode !== klassekode);
      }
      setMidlertidigeKlasser(nyeKlasser);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-2 py-1">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mr-4"></div>
            <span className="text-gray-600">Laster bedriftsinformasjon...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-2 py-1">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center cards-spacing-grid mb-8">
            <button 
              onClick={() => navigate('/bedrifter')}
              className="flex items-center gap-2 text-[#003366] hover:text-blue-800 transition-colors"
            >
              <FaArrowLeft /> Tilbake til bedrifter
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-red-200 px-2 py-1 text-center">
            <div className="text-red-600 mb-4 text-lg">{typeof error === 'string' ? error : error?.message || 'Ukjent feil'}</div>
            <div className="flex cards-spacing-grid justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="bg-[#003366] text-white px-2 py-1 rounded-lg hover:bg-blue-900 transition-colors"
              >
                Prøv på nytt
              </button>
              <button 
                onClick={() => navigate('/bedrifter')}
                className="bg-gray-200 text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Tilbake til bedrifter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!bedrift) return (
    <div className="min-h-screen bg-gray-50 px-2 py-1">
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Bedrift ikke funnet</h2>
          <button 
            onClick={() => navigate('/bedrifter')}
            className="bg-[#003366] text-white px-2 py-1 rounded-lg hover:bg-blue-900 transition-colors"
          >
            Tilbake til bedrifter
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-1 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center cards-spacing-grid">
            <button 
              onClick={() => navigate('/bedrifter')}
              className="flex items-center gap-2 text-[#003366] hover:text-blue-800 transition-colors"
            >
              <FaArrowLeft /> Tilbake til bedrifter
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-3xl font-bold text-[#003366]">{bedrift.navn}</h1>
              <p className="text-gray-600">
                {bedrift.orgNummer && `Org.nr: ${bedrift.orgNummer}`}
                {bedrift.poststed && ` • ${bedrift.poststed}`}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="flex border-b border-gray-200">
            {TABS.map(t => {
              const IconComponent = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => handleTabChange(t.key)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                    tab === t.key 
                      ? 'border-[#003366] text-[#003366] bg-blue-50' 
                      : 'border-transparent text-gray-600 hover:text-[#003366] hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="text-sm" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          {tab === 'info' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
                {/* Bedriftsinformasjon */}
                <div>
                                      <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-[#003366] flex items-center gap-2">
                        <FaBuilding /> Bedriftsinformasjon
                      </h2>
                    </div>
                    
                    <div className="cards-spacing-vertical">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bedriftsnavn</label>
                      {erRedigering ? (
                        <input
                          type="text"
                          value={redigerData.navn || ''}
                          onChange={(e) => håndterInputEndring('navn', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                          placeholder="Skriv inn bedriftsnavn"
                        />
                      ) : (
                        <div className="bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 text-gray-900">
                          {bedrift.navn}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Organisasjonsnummer</label>
                      {erRedigering ? (
                        <input
                          type="text"
                          value={redigerData.orgNummer || ''}
                          onChange={(e) => håndterInputEndring('orgNummer', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                          placeholder="Skriv inn organisasjonsnummer"
                        />
                      ) : (
                        <div className="bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 text-gray-900">
                          {bedrift.orgNummer || 'Ikke oppgitt'}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-gray-400" /> Adresse
                      </label>
                      {erRedigering ? (
                        <input
                          type="text"
                          value={redigerData.adresse || ''}
                          onChange={(e) => håndterInputEndring('adresse', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                          placeholder="Skriv inn adresse"
                        />
                      ) : (
                        <div className="bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 text-gray-900">
                          {bedrift.adresse || 'Ikke oppgitt'}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Postnummer</label>
                        {erRedigering ? (
                          <input
                            type="text"
                            value={redigerData.postnummer || ''}
                            onChange={(e) => håndterInputEndring('postnummer', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                            placeholder="Postnummer"
                          />
                        ) : (
                          <div className="bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 text-gray-900">
                            {bedrift.postnummer || 'Ikke oppgitt'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Poststed</label>
                        {erRedigering ? (
                          <input
                            type="text"
                            value={redigerData.poststed || ''}
                            onChange={(e) => håndterInputEndring('poststed', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                            placeholder="Poststed"
                          />
                        ) : (
                          <div className="bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 text-gray-900">
                            {bedrift.poststed || 'Ikke oppgitt'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kontaktinformasjon */}
                <div>
                                      <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-[#003366] flex items-center gap-2">
                        <FaPhone /> Kontaktinformasjon
                      </h2>
                    {!erRedigering && (
                      <button
                        onClick={startRedigering}
                        className="bg-[#003366] text-white px-2 py-1 rounded-lg hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-sm text-sm"
                      >
                        <FaEdit /> Rediger
                      </button>
                    )}
                  </div>
                  
                                      <div className="cards-spacing-vertical">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <FaPhone className="text-gray-400" /> Telefon
                        </label>
                      {erRedigering ? (
                        <input
                          type="tel"
                          value={redigerData.telefon || ''}
                          onChange={(e) => håndterInputEndring('telefon', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                          placeholder="Skriv inn telefonnummer"
                        />
                      ) : (
                        <div className="bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 text-gray-900">
                          {bedrift.telefon || 'Ikke oppgitt'}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FaEnvelope className="text-gray-400" /> E-post
                      </label>
                      {erRedigering ? (
                        <input
                          type="email"
                          value={redigerData.epost || ''}
                          onChange={(e) => håndterInputEndring('epost', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                          placeholder="Skriv inn e-postadresse"
                        />
                      ) : (
                        <div className="bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 text-gray-900">
                          {bedrift.epost || 'Ikke oppgitt'}
                        </div>
                      )}
                    </div>

                    {/* Hovedbruker info */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FaUser className="text-gray-400" /> Hovedbruker
                      </label>
                      {bedrift.hovedbruker ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg px-2 py-1">
                          <div className="font-semibold text-green-900">{bedrift.hovedbruker.fornavn} {bedrift.hovedbruker.etternavn}</div>
                          <div className="text-green-700 text-sm">{bedrift.hovedbruker.epost}</div>
                          {bedrift.hovedbruker.telefon && (
                            <div className="text-green-700 text-sm">{bedrift.hovedbruker.telefon}</div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-2 py-1 text-yellow-800">
                          Ingen hovedbruker satt
                        </div>
                      )}
                    </div>
                    
                    {/* Handling knapper */}
                    <div className="flex justify-between items-center mt-6">
                      {erRedigering ? (
                        <div className="flex cards-spacing-grid">
                          <button 
                            onClick={avbrytRedigering}
                            disabled={lagrer}
                            className="px-2 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm text-sm"
                          >
                            <FaTimes /> Avbryt
                          </button>
                          <button 
                            onClick={lagreEndringer}
                            disabled={lagrer}
                            className="bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm text-sm disabled:opacity-50"
                          >
                            <FaSave /> {lagrer ? 'Lagrer...' : 'Lagre endringer'}
                          </button>
                        </div>
                      ) : (
                        <div className="flex-1"></div>
                      )}
                      
                      {!erRedigering && (
                        <button 
                          onClick={handleSlettKlikk} 
                          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm text-sm ${
                            slettBekreft 
                              ? 'bg-red-700 text-white font-bold' 
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          <FaTrash /> {slettBekreft ? 'Er du sikker?' : 'Slett bedrift'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Utvidet bedriftsinformasjon fra Brønnøysundregisteret */}
              {(bedrift.stiftelsesdato || bedrift.organisasjonsform || bedrift.næringskode || bedrift.dagligLeder || bedrift.styreleder) && (
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-2 py-1 border border-blue-100">
                  <h2 className="text-xl font-semibold text-[#003366] mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Registret informasjon (Brønnøysundregisteret)
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
                    {bedrift.stiftelsesdato && (
                      <div className="bg-white rounded-lg px-2 py-1 border border-blue-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stiftelsesdato</label>
                        <div className="text-gray-900 font-semibold">
                          {new Date(bedrift.stiftelsesdato).toLocaleDateString('no-NO')}
                        </div>
                      </div>
                    )}
                    
                    {bedrift.organisasjonsform && (
                      <div className="bg-white rounded-lg px-2 py-1 border border-blue-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Organisasjonsform</label>
                        <div className="text-gray-900 font-semibold">{bedrift.organisasjonsform}</div>
                        {bedrift.organisasjonsformKode && (
                          <div className="text-sm text-gray-500">({bedrift.organisasjonsformKode})</div>
                        )}
                      </div>
                    )}
                    
                    {bedrift.næringskode && (
                      <div className="bg-white rounded-lg px-2 py-1 border border-blue-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Næringskode</label>
                        <div className="text-gray-900 font-semibold">{bedrift.næringskode}</div>
                        {bedrift.næringskodeKode && (
                          <div className="text-sm text-gray-500">({bedrift.næringskodeKode})</div>
                        )}
                      </div>
                    )}
                    
                    {bedrift.dagligLeder && (
                      <div className="bg-white rounded-lg px-2 py-1 border border-green-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <FaUser className="text-green-500" /> Daglig leder
                        </label>
                        <div className="text-gray-900 font-semibold">{bedrift.dagligLeder}</div>
                      </div>
                    )}
                    
                    {bedrift.styreleder && (
                      <div className="bg-white rounded-lg px-2 py-1 border border-purple-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                     <FaUser className="text-purple-500" /> Styreleder
                        </label>
                        <div className="text-gray-900 font-semibold">{bedrift.styreleder}</div>
                      </div>
                    )}
                    
                    {bedrift.signaturrett && bedrift.signaturrett.length > 0 && (
                      <div className="bg-white rounded-lg px-2 py-1 border border-orange-200 md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          Signaturrett
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {bedrift.signaturrett.map((person: any, index: number) => (
                            <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                              {person.navn}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 text-xs text-blue-600 flex items-center gap-1">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Informasjon hentet fra Brønnøysundregisteret
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'ansatte' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#003366] flex items-center gap-2">
                  <FaUsers /> Ansatte ({bedrift.ansatte.length})
                </h2>
                <button 
                  onClick={() => navigate(`/bedrifter/${id}/ansatte/ny`)}
                  className="bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <FaUserPlus /> Legg til ansatt
                </button>
              </div>

              {bedrift.ansatte.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
                  {bedrift.ansatte.map((ansatt) => (
                    <div key={ansatt.id} className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 overflow-hidden">
                      {/* Gradient overlay for modern effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative px-2 py-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-lg">
                                {(ansatt.fornavn[0] + ansatt.etternavn[0]).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg">{ansatt.fornavn} {ansatt.etternavn}</h3>
                                {ansatt.rolle === 'HOVEDBRUKER' && (
                                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                                    <FaUser className="w-3 h-3" /> Hovedbruker
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="cards-spacing-vertical mb-6">
                          <div className="flex items-center cards-spacing-grid text-sm text-gray-600 bg-gray-50 rounded-lg px-2 py-1">
                            <FaEnvelope className="text-blue-500 w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{ansatt.epost}</span>
                          </div>
                          {ansatt.telefon && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-2 py-1">
                              <FaPhone className="text-green-500 w-4 h-4 flex-shrink-0" />
                              <span>{ansatt.telefon}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-4">
                          <button 
                            onClick={() => navigate(`/bedrifter/${id}/ansatte/${ansatt.id}/rediger`)}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-2 py-1.5 rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300"
                          >
                            Endre
                          </button>
                          <button 
                            onClick={() => slettAnsatt(ansatt.id)}
                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium px-2 py-1.5 rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-200"
                          >
                            Slett
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FaUsers className="text-4xl mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ingen ansatte registrert</h3>
                  <p className="text-gray-600 mb-6">Legg til den første ansatte for å komme i gang</p>
                  <button 
                    onClick={() => navigate(`/bedrifter/${id}/ansatte/ny`)}
                    className="bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Legg til første ansatt
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === 'klasser' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#003366] flex items-center gap-2">
                  <FaGraduationCap /> Tilgjengelige klasser ({bedrift.klasser.length})
                </h2>
                <div className="flex gap-4">
                  {!redigerKlasser ? (
                    <button
                      onClick={startRedigerKlasser}
                      className="bg-[#003366] text-white px-2 py-1 rounded-lg hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <FaEdit /> Endre klasser
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={avbrytRedigerKlasser}
                        className="bg-gray-500 text-white px-2 py-1 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Avbryt
                      </button>
                      <button
                        onClick={lagreKlasser}
                        disabled={lagrerKlasser}
                        className="bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {lagrerKlasser ? 'Lagrer...' : 'Lagre endringer'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 cards-spacing-grid">
                                  {alleKlasser.map((k) => {
                    const erValgt = redigerKlasser 
                      ? midlertidigeKlasser.some(kl => kl.klassekode === k.kode)
                      : bedrift.klasser.some(kl => kl.klassekode === k.kode);
                  
                  return (
                    <div 
                      key={k.kode} 
                      onClick={() => redigerKlasser && håndterKlasseEndring(k.kode, !erValgt)}
                      className={`border border-gray-200 rounded-lg px-2 py-1 transition-all hover:shadow-md ${
                        erValgt ? 'ring-2 ring-blue-500 bg-blue-100 border-blue-300' : 'bg-white'
                      } ${redigerKlasser ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            checked={erValgt}
                            disabled={!redigerKlasser}
                            onChange={(e) => e.stopPropagation()}
                            className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1 pointer-events-none"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {k.kode}
                            </span>
                            <span className="text-xs text-gray-500">{k.alder}</span>
                          </div>
                          <p className="text-xs text-gray-900 leading-tight">{k.omfatter}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'kjoretoy' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#003366] flex items-center gap-2">
                  <FaCar /> Kjøretøy ({kjøretøy.length})
                </h2>
                <button 
                  onClick={() => navigate(`/bedrifter/${bedrift?.id}/kjoretoy`)}
                  className="bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <FaCar /> Se alle kjøretøy
                </button>
              </div>

              {lasterKjøretøy ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mx-auto mb-4"></div>
                  <p>Laster kjøretøy...</p>
                </div>
              ) : kjøretøyError ? (
                <div className="text-center py-12">
                  <div className="text-red-600 mb-4">{kjøretøyError}</div>
                  <button 
                    onClick={hentKjøretøy}
                    className="bg-[#003366] text-white px-2 py-1 rounded-lg hover:bg-blue-900 transition-colors"
                  >
                    Prøv på nytt
                  </button>
                </div>
              ) : kjøretøy.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {kjøretøy.slice(0, 6).map((k) => (
                        <div key={k.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-[#003366]">{k.registreringsnummer}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              k.status === 'Godkjent' ? 'bg-green-100 text-green-800' : 
                              k.status === 'Under reparasjon' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {k.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 mb-1">{k.merke} {k.modell} ({k.årsmodell})</p>
                          <p className="text-sm text-gray-600 mb-2">{k.type}</p>
                          <div className="flex flex-wrap gap-1">
                            {k.førerkortklass.slice(0, 3).map((klass) => (
                              <span key={klass} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {klass}
                              </span>
                            ))}
                            {k.førerkortklass.length > 3 && (
                              <span className="text-xs text-gray-500">+{k.førerkortklass.length - 3} til</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {kjøretøy.length > 6 && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600 mb-2">Viser {Math.min(6, kjøretøy.length)} av {kjøretøy.length} kjøretøy</p>
                        <button
                          onClick={() => navigate(`/bedrifter/${bedrift?.id}/kjoretoy`)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Se alle kjøretøy →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FaCar className="text-4xl mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ingen kjøretøy registrert</h3>
                  <p className="text-gray-600 mb-6">Legg til det første kjøretøyet for å komme i gang</p>
                  <button 
                    onClick={() => navigate(`/bedrifter/${bedrift?.id}/kjoretoy`)}
                    className="bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Gå til kjøretøy-oversikt
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === 'elever' && bedrift && (
                        <ElevOversikt
              bedriftId={bedrift.id}
              klasser={bedrift.klasser}
              ansatte={bedrift.ansatte.map(ansatt => ({
                id: ansatt.id,
                fornavn: ansatt.fornavn,
                etternavn: ansatt.etternavn,
                rolle: ansatt.rolle
              }))}
            />
          )}

        </div>

        {/* Dialogs */}

        {visKjøretøyDialog && (
          <KjøretøyDialog
            tilgjengeligeKlasser={alleKlasser.map(k => k.kode)}
            onClose={() => setVisKjøretøyDialog(false)}
            onLeggTil={leggTilKjøretøy}
          />
        )}

        {redigerKjøretøy && (
          <KjøretøyDialog
            kjøretøy={redigerKjøretøy}
            tilgjengeligeKlasser={alleKlasser.map(k => k.kode)}
            onClose={() => setRedigerKjøretøy(null)}
            onLeggTil={(data) => oppdaterKjøretøy(redigerKjøretøy.id, data)}
          />
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          details={confirmDialog.details}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        />

        {/* Notification Dialog */}
        <NotificationDialog
          isOpen={notification.isOpen}
          title={notification.title}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, isOpen: false })}
        />

        {/* Slett bekreftelse popup */}
        {visSlettPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl px-2 py-1 w-full max-w-md mx-4 shadow-2xl">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <FaTrash className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Slett bedrift permanent
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Er du helt sikker på at du vil slette bedriften <strong>"{bedrift?.navn}"</strong>?
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg px-2 py-1 mb-6">
                  <p className="text-sm text-red-800 font-medium mb-2">Dette vil permanent slette:</p>
                  <ul className="text-sm text-red-700 space-y-1 text-left">
                    <li>• Alle ansatte</li>
                    <li>• Alle kjøretøy</li>
                    <li>• Alle elever og søknader</li>
                    <li>• Alle sikkerhetskontroller</li>
                    <li>• Alle bedriftsklasser</li>
                  </ul>
                  <p className="text-sm text-red-800 font-medium mt-2">
                    Denne handlingen kan ikke angres!
                  </p>
                </div>
                
                <div className="flex cards-spacing-grid">
                  <button
                    type="button"
                    onClick={avbrytSletting}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Avbryt
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      log.userAction('Slett bedrift bekreftet', { bedriftId: bedrift?.id });
                      bekreftSletting();
                    }}
                    className="flex-1 px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Ja, slett bedrift
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Kjøretøy Dialog Komponent
interface KjøretøyDialogProps {
  kjøretøy?: Kjøretøy;
  tilgjengeligeKlasser: string[];
  onClose: () => void;
  onLeggTil: (kjøretøy: Omit<Kjøretøy, 'id' | 'opprettet'>) => void;
}

function KjøretøyDialog({ kjøretøy, tilgjengeligeKlasser, onClose, onLeggTil }: KjøretøyDialogProps) {
  const [registreringsnummer, setRegistreringsnummer] = useState(kjøretøy?.registreringsnummer || '');
  const [merke, setMerke] = useState(kjøretøy?.merke || '');
  const [modell, setModell] = useState(kjøretøy?.modell || '');
  const [årsmodell, setÅrsmodell] = useState(kjøretøy?.årsmodell?.toString() || '');
  const [type, setType] = useState(kjøretøy?.type || 'Personbil');
  const [status, setStatus] = useState(kjøretøy?.status || 'Godkjent');
  const [førerkortklass, setFørerkortklass] = useState<string[]>(kjøretøy?.førerkortklass || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registreringsnummer.trim() || !merke.trim() || !modell.trim() || !årsmodell.trim() || !type.trim() || !status.trim() || (tilgjengeligeKlasser.length > 0 && førerkortklass.length === 0)) return;

    onLeggTil({
      registreringsnummer: registreringsnummer.trim(),
      merke: merke.trim(),
      modell: modell.trim(),
      årsmodell: parseInt(årsmodell.trim()),
      type: type.trim(),
      status: status.trim(),
      førerkortklass
    });

    // Reset form
    setRegistreringsnummer('');
    setMerke('');
    setModell('');
    setÅrsmodell('');
    setType('Personbil');
    setStatus('Godkjent');
    setFørerkortklass([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg px-2 py-1 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">
          {kjøretøy ? 'Rediger kjøretøy' : 'Legg til ny kjøretøy'}
        </h3>
        <form onSubmit={handleSubmit} className="cards-spacing-vertical">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registreringsnummer *
            </label>
            <input
              type="text"
              value={registreringsnummer}
              onChange={(e) => setRegistreringsnummer(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="F.eks. AB 12345"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Merke *
            </label>
            <input
              type="text"
              value={merke}
              onChange={(e) => setMerke(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="F.eks. Toyota"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modell *
            </label>
            <input
              type="text"
              value={modell}
              onChange={(e) => setModell(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="F.eks. Corolla"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Årsmodell *
            </label>
            <input
              type="text"
              value={årsmodell}
              onChange={(e) => setÅrsmodell(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="F.eks. 2020"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Personbil">Personbil</option>
              <option value="Lastebil">Lastebil</option>
              <option value="Buss">Buss</option>
              <option value="Tank">Tank</option>
              <option value="Annet">Annet</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Godkjent">Godkjent</option>
              <option value="Ikke godkjent">Ikke godkjent</option>
              <option value="Under reparasjon">Under reparasjon</option>
              <option value="Utleid">Utleid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Førerkortklass *
            </label>
            {tilgjengeligeKlasser.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 px-2 py-1 border border-gray-300 rounded-md max-h-32 overflow-y-auto">
                {tilgjengeligeKlasser.map((klass) => (
                  <label key={klass} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={førerkortklass.includes(klass)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFørerkortklass(prev => [...prev, klass]);
                        } else {
                          setFørerkortklass(prev => prev.filter(k => k !== klass));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span>{klass}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="px-2 py-1 border border-gray-300 rounded-md bg-gray-50 text-center text-gray-600 text-sm">
                Bedriften må først velge hvilke førerkortklasser de tilbyr i "Klasser"-fanen før kjøretøy kan registreres.
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-2 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={!registreringsnummer.trim() || !merke.trim() || !modell.trim() || !årsmodell.trim() || !type.trim() || !status.trim() || (tilgjengeligeKlasser.length > 0 && førerkortklass.length === 0)}
              className="flex-1 px-2 py-1 bg-[#003366] text-white rounded-md hover:bg-[#003366]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {kjøretøy ? 'Oppdater' : 'Legg til'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 