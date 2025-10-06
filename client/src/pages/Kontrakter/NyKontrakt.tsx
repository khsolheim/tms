import React, { useState, useEffect, useCallback } from 'react';
// useMemo import removed as currently unused
import { FiEye, FiSearch, FiX, FiInfo, FiCheck, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import KontraktDokument from './KontraktDokument';
import { PDFDownloadButton } from './KontraktPDF';
import { usePostnummer } from '../../hooks/usePostnummer';
import api from '../../lib/api';
import { log } from '../../utils/logger';

interface KontraktData {
  // Elevinfo
  elevFornavn: string;
  elevEtternavn: string;
  elevPersonnummer: string;
  elevTelefon: string;
  elevEpost: string;
  elevGate: string;
  elevPostnr: string;
  elevPoststed: string;
  
  // Fakturaansvarlig (valgfri)
  harFakturaansvarlig: boolean;
  fakturaansvarligFornavn: string;
  fakturaansvarligEtternavn: string;
  fakturaansvarligPersonnummer: string;
  fakturaansvarligTelefon: string;
  fakturaansvarligEpost: string;
  fakturaansvarligGate: string;
  fakturaansvarligPostnr: string;
  fakturaansvarligPoststed: string;
  
  // Låneinformasjon
  lan: number;
  lopetid: number; // måneder
  rente: number; // prosent
  etableringsgebyr: number;
  termingebyr: number;
  terminerPerAr: number;
  inkludererGebyrerILan: boolean;
}

interface Beregning {
  effektivRente: number;
  renterOgGebyr: number;
  terminbelop: number;
  totalRente: number;
  totalBelop: number;
}

interface TerminDetaljer {
  terminNummer: number;
  terminbelop: number;
  renter: number;
  gebyrer: number;
  avdrag: number;
  restgjeld: number;
}

interface ValidationError {
  field: string;
  message: string;
}

interface KompareringsScenario {
  navn: string;
  data: KontraktData;
  beregning: Beregning;
}

interface Elev {
  id: number;
  fornavn: string;
  etternavn: string;
  telefon: string;
  epost: string;
  gate: string;
  postnummer: string;
  poststed: string;
  personnummer: string;
}

const NyKontrakt: React.FC = () => {
  const [kontraktData, setKontraktData] = useState<KontraktData>({
    elevFornavn: '',
    elevEtternavn: '',
    elevPersonnummer: '',
    elevTelefon: '',
    elevEpost: '',
    elevGate: '',
    elevPostnr: '',
    elevPoststed: '',
    lan: 0,
    lopetid: 0,
    rente: 0,
    etableringsgebyr: 0,
    termingebyr: 0,
    terminerPerAr: 12,
    inkludererGebyrerILan: false,
    harFakturaansvarlig: false,
    fakturaansvarligFornavn: '',
    fakturaansvarligEtternavn: '',
    fakturaansvarligPersonnummer: '',
    fakturaansvarligTelefon: '',
    fakturaansvarligEpost: '',
    fakturaansvarligGate: '',
    fakturaansvarligPostnr: '',
    fakturaansvarligPoststed: ''
  });

  const [beregning, setBeregning] = useState<Beregning>({
    effektivRente: 0,
    renterOgGebyr: 0,
    terminbelop: 0,
    totalRente: 0,
    totalBelop: 0
  });

  // 1. Sanntidsvalidering
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // 5. Sammenligning
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonScenarios, setComparisonScenarios] = useState<KompareringsScenario[]>([]);

  // 8. Bedre tabellvisning
  const [showAllRows, setShowAllRows] = useState(true); // Vis alle terminer som standard

  // 10. Performance - debounce timer
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Kontraktforhåndsvisning
  const [showKontraktPreview, setShowKontraktPreview] = useState(false);

  // Bruk postnummer hook
  const { finnPoststed } = usePostnummer();

  // Elevsøk
  const [elevSokTerm, setElevSokTerm] = useState('');
  const [elevSokResultater, setElevSokResultater] = useState<Elev[]>([]);
  const [sokElev, setSokElev] = useState(false);
  const [valgtElev, setValgtElev] = useState<Elev | null>(null);

  // Oppdater til database-lagring
  const [savedContractId, setSavedContractId] = useState<number | null>(null);

  // Hent systemkonfigurasjon ved oppstart
  useEffect(() => {
    const hentSystemConfig = async () => {
      try {
        const response = await api.get('/systemconfig');
        const config = response.data;
        
        // Oppdater standardverdier fra systemkonfigurasjon
        setKontraktData(prev => ({
          ...prev,
          lopetid: config?.standardLopetid ?? 24,
          rente: config?.standardRente ?? 5.0,
          etableringsgebyr: config?.standardEtableringsgebyr ?? 1900,
          termingebyr: config?.standardTermingebyr ?? 50
        }));
      } catch (error) {
        log.apiError('systemkonfigurasjon', error);
        log.error('Kunne ikke hente systemkonfigurasjon');
      }
    };
    
    hentSystemConfig();
  }, []);

  // Beregn verdier når data endres
  useEffect(() => {
    beregnLan();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kontraktData.lan, kontraktData.lopetid, kontraktData.rente, kontraktData.etableringsgebyr, kontraktData.termingebyr, kontraktData.terminerPerAr, kontraktData.inkludererGebyrerILan]);

  const beregnLan = () => {
    const { lan, lopetid, rente, etableringsgebyr, termingebyr, inkludererGebyrerILan } = kontraktData;
    // terminerPerAr currently unused in calculations
    
    if (lan <= 0 || lopetid <= 0 || rente < 0) {
      setBeregning({
        effektivRente: 0,
        renterOgGebyr: 0,
        terminbelop: 0,
        totalRente: 0,
        totalBelop: 0
      });
      return;
    }

    // Effektiv rente beregning
    const manedsrente = rente / 100 / 12;
    const antallBetalinger = lopetid;
    
    // PMT formel for terminbeløp
    let terminbelop = 0;
    let totalLan = lan;
    
    if (inkludererGebyrerILan) {
      totalLan = lan + etableringsgebyr;
    }
    
    if (manedsrente > 0) {
      terminbelop = (totalLan * manedsrente * Math.pow(1 + manedsrente, antallBetalinger)) / 
                   (Math.pow(1 + manedsrente, antallBetalinger) - 1);
    } else {
      terminbelop = totalLan / antallBetalinger;
    }
    
    // Legg til termingebyr
    terminbelop += termingebyr;
    
    const totalBetalt = terminbelop * antallBetalinger;
    const totalRente = totalBetalt - totalLan - (termingebyr * antallBetalinger);
    const renterOgGebyr = totalRente + (termingebyr * antallBetalinger) + (!inkludererGebyrerILan ? etableringsgebyr : 0);
    
    // Korrekt effektiv rente beregning (IRR - Internal Rate of Return)
    const beregnEffektivRente = (): number => {
      // Cash flows: -lånebeløp først, deretter månedlige betalinger
      const cashFlows: number[] = [];
      
      // Kunden får alltid lånebeløpet (30 000 kr) uavhengig av etableringsgebyr
      // Etableringsgebyret påvirker bare terminbeløpet/totalbeløpet som skal betales tilbake
      const kundenFar = lan; // Det kunden faktisk får utbetalt
      cashFlows.push(-kundenFar);
      
      // Hvis etableringsgebyr ikke er inkludert i lånet, må kunden betale det umiddelbart
      if (!inkludererGebyrerILan && etableringsgebyr > 0) {
        cashFlows.push(etableringsgebyr); // Betales ved tid 0 (umiddelbart)
      }
      
      // Månedlige betalinger
      for (let i = 0; i < antallBetalinger; i++) {
        cashFlows.push(terminbelop);
      }
      
      // Newton-Raphson metode for å finne IRR
      let rate = rente / 100 / 12; // Start med nominell månedlig rente
      const maxIterations = 100;
      const tolerance = 0.000001;
      
      for (let iteration = 0; iteration < maxIterations; iteration++) {
        let npv = 0;
        let dnpv = 0; // Derivert av NPV
        
        // Beregn NPV og derivert
        for (let i = 0; i < cashFlows.length; i++) {
          const divisor = Math.pow(1 + rate, i);
          npv += cashFlows[i] / divisor;
          if (i > 0) {
            dnpv -= (i * cashFlows[i]) / Math.pow(1 + rate, i + 1);
          }
        }
        
        // Sjekk konvergens
        if (Math.abs(npv) < tolerance) {
          break;
        }
        
        // Newton-Raphson iterasjon
        if (Math.abs(dnpv) > tolerance) {
          rate = rate - npv / dnpv;
        } else {
          break;
        }
        
        // Sikre at raten ikke blir negativ eller ekstrem
        if (rate < 0) rate = 0.001;
        if (rate > 5) rate = 0.5; // Max 50% månedlig rente
      }
      
      // Konverter til årlig effektiv rente
      const arsEffektivRente = (Math.pow(1 + rate, 12) - 1) * 100;
      
      // Sikre at effektiv rente er minst nominell rente
      return Math.max(arsEffektivRente, rente);
    };
    
    const finalEffektivRente = beregnEffektivRente();
    
    setBeregning({
      effektivRente: Math.round(finalEffektivRente * 100) / 100,
      renterOgGebyr: Math.round(renterOgGebyr),
      terminbelop: Math.round(terminbelop),
      totalRente: Math.round(totalRente),
      totalBelop: Math.round(totalBetalt)
    });
  };

  const beregnNedbetalingsplan = useCallback((): TerminDetaljer[] => {
    const { lan, lopetid, rente, etableringsgebyr, termingebyr, inkludererGebyrerILan } = kontraktData;
    
    if (lan <= 0 || lopetid <= 0 || rente < 0 || beregning.terminbelop === 0) return [];

    const plan: TerminDetaljer[] = [];
    const manedsrente = rente / 100 / 12;
    let gjenvarendeGjeld = inkludererGebyrerILan ? lan + etableringsgebyr : lan;
    const terminbelopUtenGebyr = beregning.terminbelop - termingebyr;

    for (let i = 1; i <= lopetid; i++) {
      const renterDenneManed = Math.round(gjenvarendeGjeld * manedsrente);
      const avdragDenneManed = Math.round(terminbelopUtenGebyr - renterDenneManed);
      
      // Siste termin: juster avdrag for å nullstille restgjeld
      const avdrag = i === lopetid ? gjenvarendeGjeld : avdragDenneManed;
      gjenvarendeGjeld = Math.max(0, gjenvarendeGjeld - avdrag);

      plan.push({
        terminNummer: i,
        terminbelop: beregning.terminbelop,
        renter: i === lopetid ? Math.round(terminbelopUtenGebyr - avdrag) : renterDenneManed,
        gebyrer: termingebyr,
        avdrag: avdrag,
        restgjeld: gjenvarendeGjeld
      });
    }

    return plan;
  }, [kontraktData, beregning]);

  // 9. Validering og feilhåndtering
  const validateKontraktData = useCallback((data: KontraktData): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Sikkerhetsjekk for undefined-verdier
    const safeString = (value: string | undefined) => value || '';
    
    if (!safeString(data.elevFornavn).trim()) errors.push({ field: 'elevFornavn', message: 'Fornavn er påkrevd' });
    if (!safeString(data.elevEtternavn).trim()) errors.push({ field: 'elevEtternavn', message: 'Etternavn er påkrevd' });
    if (!data.elevPersonnummer || !/^\d{11}$/.test(data.elevPersonnummer)) errors.push({ field: 'elevPersonnummer', message: 'Gyldig personnummer (11 siffer) er påkrevd' });
    if (!safeString(data.elevTelefon).trim()) errors.push({ field: 'elevTelefon', message: 'Telefonnummer er påkrevd' });
    if (!safeString(data.elevEpost).trim()) errors.push({ field: 'elevEpost', message: 'E-post er påkrevd' });
    if (!safeString(data.elevGate).trim()) errors.push({ field: 'elevGate', message: 'Gate/adresse er påkrevd' });
    if (!data.elevPostnr || !/^\d{4}$/.test(data.elevPostnr)) errors.push({ field: 'elevPostnr', message: 'Gyldig postnummer (4 siffer) er påkrevd' });
    if (!safeString(data.elevPoststed).trim()) errors.push({ field: 'elevPoststed', message: 'Poststed er påkrevd' });
    
    if (data.harFakturaansvarlig) {
      if (!safeString(data.fakturaansvarligFornavn).trim()) errors.push({ field: 'fakturaansvarligFornavn', message: 'Fornavn er påkrevd' });
      if (!safeString(data.fakturaansvarligEtternavn).trim()) errors.push({ field: 'fakturaansvarligEtternavn', message: 'Etternavn er påkrevd' });
      if (!data.fakturaansvarligPersonnummer || !/^\d{11}$/.test(data.fakturaansvarligPersonnummer)) errors.push({ field: 'fakturaansvarligPersonnummer', message: 'Gyldig personnummer (11 siffer) er påkrevd' });
      if (!safeString(data.fakturaansvarligTelefon).trim()) errors.push({ field: 'fakturaansvarligTelefon', message: 'Telefonnummer er påkrevd' });
      if (!safeString(data.fakturaansvarligEpost).trim()) errors.push({ field: 'fakturaansvarligEpost', message: 'E-post er påkrevd' });
      if (!safeString(data.fakturaansvarligGate).trim()) errors.push({ field: 'fakturaansvarligGate', message: 'Gate/adresse er påkrevd' });
      if (!data.fakturaansvarligPostnr || !/^\d{4}$/.test(data.fakturaansvarligPostnr)) errors.push({ field: 'fakturaansvarligPostnr', message: 'Gyldig postnummer (4 siffer) er påkrevd' });
      if (!safeString(data.fakturaansvarligPoststed).trim()) errors.push({ field: 'fakturaansvarligPoststed', message: 'Poststed er påkrevd' });
    }
    
    if (data.lan < 1000) errors.push({ field: 'lan', message: 'Lånebeløp må være minst 1000 kr' });
    if (![12, 24, 36].includes(data.lopetid)) errors.push({ field: 'lopetid', message: 'Løpetid må være 12, 24 eller 36 måneder' });
    if (data.rente < 0 || data.rente > 50) errors.push({ field: 'rente', message: 'Rente må være mellom 0 og 50%' });
    if (data.etableringsgebyr < 0) errors.push({ field: 'etableringsgebyr', message: 'Etableringsgebyr kan ikke være negativ' });
    if (data.termingebyr < 0) errors.push({ field: 'termingebyr', message: 'Termingebyr kan ikke være negativt' });
    
    return errors;
  }, []);

  // 10. Performance - debounced handleInputChange
  const handleInputChange = useCallback((field: keyof KontraktData, value: any) => {
    // setTouchedFields(prev => new Set(prev).add(field)); // Currently unused
    
    setKontraktData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Automatisk poststed-oppslag når postnummer endres
      if ((field === 'elevPostnr' || field === 'fakturaansvarligPostnr') && typeof value === 'string' && value.length === 4) {
        // logger.debug('Trigger poststed-oppslag for:', field, 'med verdi:', value);
        const poststed = finnPoststed(value);
        // logger.debug('Resultat poststed:', poststed);
        if (poststed) {
          if (field === 'elevPostnr') {
            updated.elevPoststed = poststed;
            // logger.debug('Setter elevPoststed til:', poststed);
          } else if (field === 'fakturaansvarligPostnr') {
            updated.fakturaansvarligPoststed = poststed;
            // logger.debug('Setter fakturaansvarligPoststed til:', poststed);
          }
        }
      }
      
      return updated;
    });
    
    // Debounce validation
    if (debounceTimer) clearTimeout(debounceTimer);
    setDebounceTimer(setTimeout(() => {
      const newData = { ...kontraktData, [field]: value };
      setValidationErrors(validateKontraktData(newData));
    }, 300));
  }, [kontraktData, validateKontraktData, debounceTimer, finnPoststed]);

  // Elevsøk-funksjon
  const sokEtterElever = useCallback(async (term: string) => {
    if (term.length < 2) {
      setElevSokResultater([]);
      return;
    }
    try {
      const response = await api.get('/elever/sok', { params: { sokeord: term } });
      setElevSokResultater(response.data);
    } catch (error: any) {
      log.apiError('elever/search', error);
      toast.error('Feil ved søk etter elever');
      setElevSokResultater([]);
    }
  }, []);

  // Debounce elevsøk
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const newTimer = setTimeout(() => {
      if (elevSokTerm) {
        sokEtterElever(elevSokTerm);
      } else {
        setElevSokResultater([]);
      }
    }, 300);

    setDebounceTimer(newTimer);

    return () => {
      if (newTimer) {
        clearTimeout(newTimer);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elevSokTerm]); // debounceTimer and sokEtterElever are intentionally managed manually

  const velgElev = (elev: Elev) => {
    setValgtElev(elev);
    setKontraktData(prev => ({
      ...prev,
      elevFornavn: elev.fornavn,
      elevEtternavn: elev.etternavn,
      elevPersonnummer: elev.personnummer,
      elevTelefon: elev.telefon,
      elevEpost: elev.epost,
      elevGate: elev.gate,
      elevPostnr: elev.postnummer,
      elevPoststed: elev.poststed
    }));
    setSokElev(false);
    setElevSokTerm('');
    setElevSokResultater([]);
  };

  const fjernValgtElev = () => {
    setValgtElev(null);
    setKontraktData(prev => ({
      ...prev,
      elevFornavn: '',
      elevEtternavn: '',
      elevPersonnummer: '',
      elevTelefon: '',
      elevEpost: '',
      elevGate: '',
      elevPostnr: '',
      elevPoststed: ''
    }));
  };

  // Erstatt localStorage-funksjonene med database-lagring
  const lagreKontrakt = async () => {
    const errors = validateKontraktData(kontraktData);
    if (errors.length > 0) {
      toast.error('Vennligst fyll ut alle påkrevde felt');
      return;
    }
    try {
      const kontraktPayload = {
        ...kontraktData,
        effektivRente: beregning.effektivRente,
        renterOgGebyr: beregning.renterOgGebyr,
        terminbelop: beregning.terminbelop,
        totalRente: beregning.totalRente,
        totalBelop: beregning.totalBelop
      };
      if (savedContractId) {
        await api.put(`/kontrakter/${savedContractId}`, kontraktPayload);
        toast.success('Kontrakt oppdatert!');
      } else {
        const response = await api.post('/kontrakter', kontraktPayload);
        setSavedContractId(response.data.id);
        toast.success('Kontrakt lagret!');
      }
    } catch (error: any) {
      log.apiError('kontrakter', error);
      toast.error('Feil ved lagring av kontrakt');
    }
  };

  // Erstatt den gamle opprettKontrakt-funksjonen
  const opprettKontrakt = async () => {
    const errors = validateKontraktData(kontraktData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast.error('Vennligst fyll ut alle påkrevde felt');
      return;
    }
    try {
      await lagreKontrakt();
      toast.success('Kontrakt opprettet!');
    } catch (error: any) {
      log.apiError('opprettKontrakt', error);
      toast.error('Feil ved oppretting av kontrakt');
    }
  };

  // Erstatt saveToLocalStorage med lagreKontrakt
  const saveToLocalStorage = lagreKontrakt;

  // Fjern eller erstatt loadFromLocalStorage
  const loadFromLocalStorage = useCallback(() => {
    // Ikke lenger nødvendig med localStorage
    return false;
  }, []);

  // 5. Sammenligning
  const addComparisonScenario = useCallback(() => {
    const scenario: KompareringsScenario = {
      navn: `Scenario ${comparisonScenarios.length + 1}`,
      data: { ...kontraktData },
      beregning: { ...beregning }
    };
    setComparisonScenarios(prev => [...prev, scenario]);
  }, [kontraktData, beregning, comparisonScenarios.length]);

  // Note: PDF og CSV eksport funksjoner kan implementeres senere ved behov

  // 13. Notifikasjoner
  const sendEmailSummary = useCallback(() => {
    const elevNavn = `${kontraktData.elevFornavn || ''} ${kontraktData.elevEtternavn || ''}`.trim();
    const emailBody = `
Kontraktssammendrag:
- Elev: ${elevNavn}
- Lånebeløp: ${kontraktData.lan.toLocaleString()} kr
- Løpetid: ${kontraktData.lopetid} måneder
- Terminbeløp: ${beregning.terminbelop.toLocaleString()} kr
- Effektiv rente: ${beregning.effektivRente.toFixed(2)}%
- Total betaling: ${beregning.totalBelop.toLocaleString()} kr
    `;
    
    const mailto = `mailto:?subject=Kontraktssammendrag - ${elevNavn}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailto;
  }, [kontraktData, beregning]);

  // Note: Tabell filtrering kan implementeres senere ved behov

  // Auto-save every 30 seconds
  useEffect(() => {
    const autoSave = setInterval(saveToLocalStorage, 30000);
    return () => clearInterval(autoSave);
  }, [saveToLocalStorage]);

  // Load data on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  // Validate on data change (only after initial load)
  useEffect(() => {
    // Kun valider hvis data har vært lastet (har minst ett felt som ikke er undefined)
    if (kontraktData && typeof kontraktData.elevFornavn !== 'undefined') {
      setValidationErrors(validateKontraktData(kontraktData));
    }
  }, [kontraktData, validateKontraktData]);

  // Note: renderInputField kan implementeres for avansert form validering

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimalistisk Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-2 py-1">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-medium text-gray-900">Ny nedbetalingsavtale</h1>
            <button
              onClick={() => window.location.href = '/kontrakter'}
              className="text-gray-600 hover:text-gray-800 px-2 py-1 rounded-md border border-gray-300 text-sm"
            >
              Tilbake til oversikt
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-2 py-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 cards-spacing-grid">
          {/* Venstre kolonne - Innstillinger */}
          <div className="lg:col-span-2 cards-spacing-vertical">
            {/* Lånebeløp og rente */}
            <div className="bg-white rounded-lg border border-gray-200 px-2 py-1">
              <h2 className="text-sm font-medium text-gray-700 mb-3">Lånedetaljer</h2>
              
              <div className="grid grid-cols-2 cards-spacing-grid">
                {/* Lånebeløp */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Lånebeløp</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={kontraktData.lan}
                      onChange={(e) => handleInputChange('lan', Number(e.target.value))}
                      className="w-full px-2 py-1 text-sm bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="30000"
                      min="1000"
                    />
                    <span className="absolute right-3 top-2 text-xs text-gray-400">kr</span>
                  </div>
                </div>

                {/* Rente */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Årlig rente</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={kontraktData.rente}
                      onChange={(e) => handleInputChange('rente', Number(e.target.value))}
                      className="w-full px-2 py-1 text-sm bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      step="0.1"
                      min="0"
                      max="30"
                    />
                    <span className="absolute right-3 top-2 text-xs text-gray-400">%</span>
                  </div>
                </div>
              </div>

              {/* Nedbetalingstid - kompakte knapper */}
              <div className="mt-4">
                <label className="block text-xs text-gray-600 mb-2">Nedbetalingstid</label>
                <div className="grid grid-cols-3 gap-2">
                  {[12, 24, 36].map(months => (
                    <button
                      key={months}
                      onClick={() => handleInputChange('lopetid', months)}
                      className={`py-2 px-3 text-sm rounded-md border transition-all ${
                        kontraktData.lopetid === months
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {months} mnd
                    </button>
                  ))}
                </div>
              </div>

              {/* Gebyrer */}
              <div className="grid grid-cols-2 cards-spacing-grid mt-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Etableringsgebyr</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={kontraktData.etableringsgebyr}
                      onChange={(e) => handleInputChange('etableringsgebyr', Number(e.target.value))}
                      className="w-full px-2 py-1 text-sm bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                    <span className="absolute right-3 top-2 text-xs text-gray-400">kr</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Termingebyr</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={kontraktData.termingebyr}
                      onChange={(e) => handleInputChange('termingebyr', Number(e.target.value))}
                      className="w-full px-2 py-1 text-sm bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                    <span className="absolute right-3 top-2 text-xs text-gray-400">kr</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={kontraktData.inkludererGebyrerILan}
                    onChange={(e) => handleInputChange('inkludererGebyrerILan', e.target.checked)}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-gray-700">Inkluder etableringsgebyr i lånet</span>
                </label>
              </div>
            </div>

            {/* Personopplysninger */}
            <div className="bg-white rounded-lg border border-gray-200 px-2 py-1">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-gray-700">Låntaker</h2>
                
                {!valgtElev && (
                  <button
                    onClick={() => setSokElev(!sokElev)}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <FiSearch className="w-3 h-3" />
                    Søk elev
                  </button>
                )}
              </div>
              
              {/* Elevsøk */}
              {sokElev && !valgtElev && (
                <div className="mb-3 px-2 py-1 bg-gray-50 rounded-md">
                  <input
                    type="text"
                    value={elevSokTerm}
                    onChange={(e) => setElevSokTerm(e.target.value)}
                    placeholder="Søk etter navn, e-post eller telefon..."
                    className="w-full px-2 py-1 text-sm bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                  {elevSokResultater.length > 0 && (
                    <div className="mt-2 bg-white border border-gray-200 rounded-md overflow-hidden">
                      {elevSokResultater.map((elev) => (
                        <button
                          key={elev.id}
                          onClick={() => velgElev(elev)}
                          className="w-full p-2 text-left hover:bg-gray-50 border-b last:border-0 text-sm"
                        >
                          <div className="font-medium">{elev.fornavn} {elev.etternavn}</div>
                          <div className="text-xs text-gray-500">{elev.epost} • {elev.telefon}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {valgtElev && (
                <div className="mb-3 p-2 bg-blue-50 rounded-md flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-600">Valgt elev</p>
                    <p className="text-sm font-medium">{valgtElev.fornavn} {valgtElev.etternavn}</p>
                  </div>
                  <button
                    onClick={fjernValgtElev}
                    className="text-red-600 hover:text-red-700"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              <div className="grid grid-cols-2 cards-spacing-grid">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Fornavn *</label>
                  <input
                    type="text"
                    value={kontraktData.elevFornavn}
                    onChange={(e) => handleInputChange('elevFornavn', e.target.value)}
                    className="w-full px-2 py-1 text-sm bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Etternavn *</label>
                  <input
                    type="text"
                    value={kontraktData.elevEtternavn}
                    onChange={(e) => handleInputChange('elevEtternavn', e.target.value)}
                    className="w-full px-2 py-1 text-sm bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Personnummer *</label>
                  <input
                    type="text"
                    value={kontraktData.elevPersonnummer}
                    onChange={(e) => handleInputChange('elevPersonnummer', e.target.value)}
                    className="w-full px-2 py-1 text-sm bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    maxLength={11}
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Telefon *</label>
                  <input
                    type="tel"
                    value={kontraktData.elevTelefon}
                    onChange={(e) => handleInputChange('elevTelefon', e.target.value)}
                    className="w-full px-2 py-1 text-sm bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">E-post *</label>
                  <input
                    type="email"
                    value={kontraktData.elevEpost}
                    onChange={(e) => handleInputChange('elevEpost', e.target.value)}
                    className="w-full px-2 py-1 text-sm bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">Adresse *</label>
                  <input
                    type="text"
                    value={kontraktData.elevGate}
                    onChange={(e) => handleInputChange('elevGate', e.target.value)}
                    className="w-full px-2 py-1 text-sm bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Postnummer *</label>
                  <input
                    type="text"
                    value={kontraktData.elevPostnr}
                    onChange={(e) => handleInputChange('elevPostnr', e.target.value)}
                    className="w-full px-2 py-1 text-sm bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    maxLength={4}
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Poststed *</label>
                  <input
                    type="text"
                    value={kontraktData.elevPoststed}
                    onChange={(e) => handleInputChange('elevPoststed', e.target.value)}
                    className="w-full px-2 py-1 text-sm bg-gray-50 text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                </div>
              </div>
              
              {/* Fakturaansvarlig */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={kontraktData.harFakturaansvarlig}
                    onChange={(e) => handleInputChange('harFakturaansvarlig', e.target.checked)}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-gray-700">Annen fakturaansvarlig</span>
                </label>
                
                {kontraktData.harFakturaansvarlig && (
                  <div className="mt-3 px-2 py-1 bg-gray-50 rounded-md">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={kontraktData.fakturaansvarligFornavn}
                        onChange={(e) => handleInputChange('fakturaansvarligFornavn', e.target.value)}
                        placeholder="Fornavn"
                        className="px-2 py-1 text-sm bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="text"
                        value={kontraktData.fakturaansvarligEtternavn}
                        onChange={(e) => handleInputChange('fakturaansvarligEtternavn', e.target.value)}
                        placeholder="Etternavn"
                        className="px-2 py-1 text-sm bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="text"
                        value={kontraktData.fakturaansvarligPersonnummer}
                        onChange={(e) => handleInputChange('fakturaansvarligPersonnummer', e.target.value)}
                        placeholder="Personnummer"
                        className="px-2 py-1 text-sm bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        maxLength={11}
                      />
                      <input
                        type="tel"
                        value={kontraktData.fakturaansvarligTelefon}
                        onChange={(e) => handleInputChange('fakturaansvarligTelefon', e.target.value)}
                        placeholder="Telefon"
                        className="px-2 py-1 text-sm bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="email"
                        value={kontraktData.fakturaansvarligEpost}
                        onChange={(e) => handleInputChange('fakturaansvarligEpost', e.target.value)}
                        placeholder="E-post"
                        className="col-span-2 px-2 py-1 text-sm bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="text"
                        value={kontraktData.fakturaansvarligGate}
                        onChange={(e) => handleInputChange('fakturaansvarligGate', e.target.value)}
                        placeholder="Adresse"
                        className="col-span-2 px-2 py-1 text-sm bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="text"
                        value={kontraktData.fakturaansvarligPostnr}
                        onChange={(e) => handleInputChange('fakturaansvarligPostnr', e.target.value)}
                        placeholder="Postnr"
                        className="px-2 py-1 text-sm bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        maxLength={4}
                      />
                      <input
                        type="text"
                        value={kontraktData.fakturaansvarligPoststed}
                        onChange={(e) => handleInputChange('fakturaansvarligPoststed', e.target.value)}
                        placeholder="Poststed"
                        className="px-2 py-1 text-sm bg-gray-50 text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        readOnly
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Høyre kolonne - Kostnadsoversi­kt */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 px-2 py-1 sticky top-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Kostnadsoversi­kt</h3>
              
              {kontraktData.lan > 0 ? (
                <>
                  {/* Hovedbeløp */}
                  <div className="space-y-8 pb-3 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Lånebeløp</span>
                      <span className="text-sm font-medium">{kontraktData.lan.toLocaleString()} kr</span>
                    </div>
                    
                    {kontraktData.etableringsgebyr > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Etableringsgebyr</span>
                        <span className="text-sm font-medium">{kontraktData.etableringsgebyr.toLocaleString()} kr</span>
                      </div>
                    )}
                    
                    {kontraktData.inkludererGebyrerILan && kontraktData.etableringsgebyr > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 font-medium">Totalt lånebeløp</span>
                        <span className="text-sm font-medium">{(kontraktData.lan + kontraktData.etableringsgebyr).toLocaleString()} kr</span>
                      </div>
                    )}
                  </div>

                  {/* Månedlig betaling */}
                  <div className="py-1 border-b border-gray-100">
                    <div className="bg-blue-50 rounded-lg px-2 py-1">
                      <div className="text-center">
                        <div className="text-2xl font-semibold text-blue-700">
                          {beregning.terminbelop.toLocaleString()} kr
                        </div>
                        <div className="text-xs text-blue-600 mt-1">per måned</div>
                      </div>
                    </div>
                    
                    {kontraktData.termingebyr > 0 && (
                      <div className="mt-2 text-xs text-gray-500 text-center">
                        Inkl. {kontraktData.termingebyr} kr i termingebyr
                      </div>
                    )}
                  </div>

                  {/* Detaljer */}
                  <div className="space-y-6 py-1 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Løpetid</span>
                      <span className="text-sm font-medium">{kontraktData.lopetid} måneder</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Nominell rente</span>
                      <span className="text-sm font-medium">{kontraktData.rente}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Effektiv rente</span>
                      <span className="text-sm font-medium text-blue-600">{beregning.effektivRente.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Totalkostnad */}
                  <div className="pt-3 space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Totale renter</span>
                      <span className="text-sm text-red-600">{beregning.totalRente.toLocaleString()} kr</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Totale gebyrer</span>
                      <span className="text-sm text-orange-600">
                        {(kontraktData.termingebyr * kontraktData.lopetid + 
                          (!kontraktData.inkludererGebyrerILan ? kontraktData.etableringsgebyr : 0)).toLocaleString()} kr
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Totalt å betale</span>
                        <span className="text-lg font-semibold text-gray-900">
                          {beregning.totalBelop.toLocaleString()} kr
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info om kostnader */}
                  <div className="mt-4 px-2 py-1 bg-amber-50 rounded-md">
                    <div className="flex items-start gap-2">
                      <FiInfo className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-amber-700">
                        <p>Totalkostnad for lånet blir {beregning.renterOgGebyr.toLocaleString()} kr i tillegg til lånebeløpet.</p>
                      </div>
                    </div>
                  </div>

                  {/* Handlingsknapper rett under info-boksen */}
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      onClick={() => setShowKontraktPreview(true)}
                      className="w-full px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-base font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <FiEye className="w-5 h-5" />
                      Forhåndsvis kontrakt
                    </button>
                    <button
                      onClick={opprettKontrakt}
                      disabled={validationErrors.length > 0 || kontraktData.lan === 0}
                      className={`w-full px-4 py-2 rounded-md text-base font-medium transition-colors flex items-center justify-center gap-2 ${
                        validationErrors.length === 0 && kontraktData.lan > 0
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <FiCheck className="w-5 h-5" />
                      Opprett kontrakt
                    </button>
                    {kontraktData.elevFornavn && kontraktData.elevEtternavn && (
                      <PDFDownloadButton
                        kontraktData={kontraktData}
                        beregning={beregning}
                        nedbetalingsplan={beregnNedbetalingsplan()}
                        bedrift={null}
                      >
                        <button className="w-full px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-md text-base font-medium transition-colors flex items-center justify-center gap-2">
                          <FiDownload className="w-5 h-5" />
                          Last ned PDF
                        </button>
                      </PDFDownloadButton>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-1">
                  <p className="text-sm text-gray-500">Fyll inn lånebeløp for å se beregning</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nedbetalingsplan - kompakt visning */}
        {kontraktData.lan > 0 && (
          <div className="mt-6 bg-white rounded-lg border border-gray-200 px-2 py-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Nedbetalingsplan</h3>
              <button
                onClick={() => setShowAllRows(!showAllRows)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {showAllRows ? 'Vis mindre' : 'Vis alle terminer'}
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left p-2 font-medium text-gray-600">Termin</th>
                    <th className="text-right p-2 font-medium text-gray-600">Betaling</th>
                    <th className="text-right p-2 font-medium text-gray-600">Renter</th>
                    <th className="text-right p-2 font-medium text-gray-600">Avdrag</th>
                    <th className="text-right p-2 font-medium text-gray-600">Restgjeld</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllRows ? beregnNedbetalingsplan() : beregnNedbetalingsplan().slice(0, 6)).map((termin, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="p-2">{termin.terminNummer}</td>
                      <td className="p-2 text-right font-medium">{termin.terminbelop.toLocaleString()}</td>
                      <td className="p-2 text-right text-red-600">{termin.renter.toLocaleString()}</td>
                      <td className="p-2 text-right text-green-600">{termin.avdrag.toLocaleString()}</td>
                      <td className="p-2 text-right">{termin.restgjeld.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modaler */}
        {showKontraktPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-2 py-1 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between px-2 py-1 border-b">
                <h3 className="text-lg font-medium">Kontraktforhåndsvisning</h3>
                <button
                  onClick={() => setShowKontraktPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="px-2 py-1 overflow-y-auto max-h-[calc(90vh-80px)]">
                <KontraktDokument
                  kontraktData={{
                    elevNavn: `${kontraktData.elevFornavn || ''} ${kontraktData.elevEtternavn || ''}`.trim(),
                    elevAdresse: `${kontraktData.elevGate || ''}, ${kontraktData.elevPostnr || ''} ${kontraktData.elevPoststed || ''}`.trim(),
                    elevFodselsnummer: kontraktData.elevPersonnummer || '',
                    harFakturaansvarlig: kontraktData.harFakturaansvarlig,
                    fakturaansvarligNavn: `${kontraktData.fakturaansvarligFornavn || ''} ${kontraktData.fakturaansvarligEtternavn || ''}`.trim(),
                    fakturaansvarligAdresse: `${kontraktData.fakturaansvarligGate || ''}, ${kontraktData.fakturaansvarligPostnr || ''} ${kontraktData.fakturaansvarligPoststed || ''}`.trim(),
                    fakturaansvarligFodselsnummer: kontraktData.fakturaansvarligPersonnummer || '',
                    lan: kontraktData.lan,
                    lopetid: kontraktData.lopetid,
                    rente: kontraktData.rente,
                    etableringsgebyr: kontraktData.etableringsgebyr,
                    termingebyr: kontraktData.termingebyr,
                    terminerPerAr: kontraktData.terminerPerAr,
                    inkludererGebyrerILan: kontraktData.inkludererGebyrerILan
                  }}
                  beregning={beregning}
                  nedbetalingsplan={beregnNedbetalingsplan()}
                />
              </div>
            </div>
          </div>
        )}

        {showComparison && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-2 py-1 z-50">
            <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between px-2 py-1 border-b">
                <h3 className="text-lg font-medium">Sammenlign lånealternativer</h3>
                <div className="flex items-center cards-spacing-grid">
                  <button
                    onClick={addComparisonScenario}
                    className="px-2 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Legg til nåværende
                  </button>
                  <button
                    onClick={() => setShowComparison(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="px-2 py-1 overflow-x-auto">
                {comparisonScenarios.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left px-2 py-1">Scenario</th>
                        <th className="text-right px-2 py-1">Lånebeløp</th>
                        <th className="text-right px-2 py-1">Løpetid</th>
                        <th className="text-right px-2 py-1">Rente</th>
                        <th className="text-right px-2 py-1">Månedlig</th>
                        <th className="text-right px-2 py-1">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonScenarios.map((scenario, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-2 py-1 font-semibold">{scenario.navn}</td>
                          <td className="px-2 py-1 text-right">{scenario.data.lan.toLocaleString()} kr</td>
                          <td className="px-2 py-1 text-right">{scenario.data.lopetid} mnd</td>
                          <td className="px-2 py-1 text-right">{scenario.data.rente}%</td>
                          <td className="px-2 py-1 text-right font-bold text-blue-600">{scenario.beregning.terminbelop.toLocaleString()} kr</td>
                          <td className="px-2 py-1 text-right font-bold text-green-600">{scenario.beregning.totalBelop.toLocaleString()} kr</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Ingen scenarier å sammenligne ennå</p>
                    <p className="text-sm text-gray-400 mt-1">Klikk "Legg til nåværende" for å begynne</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NyKontrakt; 