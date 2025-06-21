import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaUserTag, FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa';
import api from '../../lib/api';

interface Ansatt {
  id: number;
  navn: string;
  epost: string;
  telefon: string | null;
  rolle: 'HOVEDBRUKER' | 'TRAFIKKLARER' | 'ADMIN';
}

interface Props {
  bedriftId: number;
  ansatt?: Ansatt; // Optional for redigering
  onClose: () => void;
  onSuccess: () => void;
  initialNavn?: string; // Optional forhåndsutfylling av navn
}

export default function AnsattDialog({ bedriftId, ansatt: eksisterendeAnsatt, onClose, onSuccess, initialNavn }: Props) {
  const [loading, setLoading] = useState(false);
  const [visPassord, setVisPassord] = useState(false);
  const [visBekreftPassord, setVisBekreftPassord] = useState(false);
  const [ansatt, setAnsatt] = useState({
    navn: eksisterendeAnsatt?.navn || initialNavn || '',
    epost: eksisterendeAnsatt?.epost || '',
    telefon: eksisterendeAnsatt?.telefon || '',
    rolle: eksisterendeAnsatt?.rolle || (initialNavn ? 'HOVEDBRUKER' : 'TRAFIKKLARER') as 'HOVEDBRUKER' | 'TRAFIKKLARER' | 'ADMIN',
    passord: '',
    bekreftPassord: ''
  });
  const [error, setError] = useState<string | { message?: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const erRedigeringsmodus = !!eksisterendeAnsatt;

  // Validering av felter
  const validateField = (name: string, value: string) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'navn':
        if (!value.trim()) {
          errors.navn = 'Navn er påkrevd';
        } else if (value.trim().length < 2) {
          errors.navn = 'Navn må være minst 2 tegn';
        } else {
          delete errors.navn;
        }
        break;
      
      case 'epost':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          errors.epost = 'E-post er påkrevd';
        } else if (!emailRegex.test(value)) {
          errors.epost = 'Ugyldig e-postadresse';
        } else {
          delete errors.epost;
        }
        break;
      
      case 'telefon':
        if (value && !/^\d{8}$/.test(value.replace(/\s/g, ''))) {
          errors.telefon = 'Telefonnummer må være 8 siffer';
        } else {
          delete errors.telefon;
        }
        break;
      
      case 'passord':
        if (!erRedigeringsmodus && !value) {
          errors.passord = 'Passord er påkrevd';
        } else if (value && value.length < 8) {
          errors.passord = 'Passord må være minst 8 tegn';
        } else if (value && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          errors.passord = 'Passord må inneholde minst en stor bokstav, en liten bokstav og et tall';
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
    
    // Validering
    if (!ansatt.navn.trim() || !ansatt.epost.trim() || !ansatt.rolle) {
      setError('Vennligst fyll ut alle påkrevde felt');
      return;
    }

    // Sjekk om det er valideringsfeil
    const fieldsToValidate = ['navn', 'epost', 'telefon'];
    let hasErrors = false;
    
    fieldsToValidate.forEach(field => {
      const value = ansatt[field as keyof typeof ansatt] as string;
      validateField(field, value || '');
      if (validationErrors[field as keyof typeof validationErrors]) {
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setError('Vennligst rett opp valideringsfeilene før du fortsetter');
      return;
    }

    // For nye ansatte, sjekk at passord er oppgitt
    if (!erRedigeringsmodus && !ansatt.passord?.trim()) {
      setError('Passord er påkrevd for nye ansatte');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (erRedigeringsmodus && eksisterendeAnsatt) {
        // Oppdater eksisterende ansatt
        const updateData: any = {
          navn: ansatt.navn.trim(),
          epost: ansatt.epost.trim(),
          telefon: ansatt.telefon ? ansatt.telefon.replace(/\s/g, '') : null,
          rolle: ansatt.rolle
        };

        // Kun inkluder passord hvis det er oppgitt
        if (ansatt.passord) {
          updateData.passord = ansatt.passord;
        }

        await api.put(`/ansatt/${eksisterendeAnsatt.id}`, updateData);
      } else {
        // Opprett ny ansatt
        const createData = {
          ...ansatt,
          navn: ansatt.navn.trim(),
          epost: ansatt.epost.trim(),
          telefon: ansatt.telefon ? ansatt.telefon.replace(/\s/g, '') : null,
          bedriftId
        };

        await api.post('/ansatt', createData);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(`Feil ved ${erRedigeringsmodus ? 'oppdatering' : 'oppretting'} av ansatt:`, error);
      const errorMessage = error.response?.data?.error || error.message || 'Ukjent feil';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAnsatt(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const formatTelefon = (value: string) => {
    // Fjern alt som ikke er tall
    const cleaned = value.replace(/\D/g, '');
    // Legg til mellemrom etter 3 og 6 siffer
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)}`;
  };

  const handleTelefonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefon(e.target.value);
    setAnsatt(prev => ({ ...prev, telefon: formatted }));
    validateField('telefon', formatted);
  };

  const rolleOptions = [
    { value: 'TRAFIKKLARER', label: 'Trafikklærer', description: 'Kan gi opplæring til elever' },
    { value: 'HOVEDBRUKER', label: 'Hovedbruker', description: 'Kan administrere bedriften og ansatte' },
    { value: 'ADMIN', label: 'Administrator', description: 'Full tilgang til alle funksjoner' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2 py-1">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003366] to-blue-700 text-white px-2 py-1 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {erRedigeringsmodus ? 'Rediger ansatt' : 'Registrer ny ansatt'}
              </h2>
              <p className="text-blue-100 mt-1">
                {erRedigeringsmodus 
                  ? 'Oppdater informasjon for eksisterende ansatt' 
                  : 'Fyll ut alle nødvendige opplysninger for den nye ansatte'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-2 py-1">
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

          <form onSubmit={handleSubmit} className="cards-spacing-vertical">
            {/* Personlig informasjon */}
            <div className="cards-spacing-vertical">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Personlig informasjon
              </h3>
              
              {/* Navn */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline w-4 h-4 mr-2 text-blue-500" />
                  Fullt navn *
                </label>
                <input
                  name="navn"
                  value={ansatt.navn}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.navn ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="F.eks. Ola Nordmann"
                  required
                />
                {validationErrors.navn && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.navn}</p>
                )}
              </div>

              {/* E-post */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline w-4 h-4 mr-2 text-blue-500" />
                  E-postadresse *
                </label>
                <input
                  name="epost"
                  type="email"
                  value={ansatt.epost}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.epost ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="ola.nordmann@bedrift.no"
                  required
                />
                {validationErrors.epost && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.epost}</p>
                )}
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPhone className="inline w-4 h-4 mr-2 text-blue-500" />
                  Telefonnummer
                </label>
                <input
                  name="telefon"
                  value={ansatt.telefon}
                  onChange={handleTelefonChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.telefon ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="123 45 678"
                  maxLength={11}
                />
                {validationErrors.telefon && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.telefon}</p>
                )}
                <p className="text-gray-500 text-sm mt-1">8 siffer, uten landkode</p>
              </div>
            </div>

            {/* Rolle og tilganger */}
            <div className="cards-spacing-vertical">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Rolle og tilganger
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUserTag className="inline w-4 h-4 mr-2 text-blue-500" />
                  Rolle *
                </label>
                <select
                  name="rolle"
                  value={ansatt.rolle}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  {rolleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="mt-2 space-y-6">
                  {rolleOptions.map(option => (
                    <div key={option.value} className={`p-3 rounded-lg border ${
                      ansatt.rolle === option.value 
                        ? 'border-blue-200 bg-blue-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          ansatt.rolle === option.value ? 'bg-blue-500' : 'bg-gray-300'
                        }`}></div>
                        <span className="font-medium text-sm">{option.label}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 ml-5">{option.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sikkerhet */}
            <div className="cards-spacing-vertical">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Sikkerhet og pålogging
              </h3>
              
              {/* Passord */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaLock className="inline w-4 h-4 mr-2 text-blue-500" />
                  Passord {erRedigeringsmodus ? '(la stå tom for å beholde eksisterende)' : '*'}
                </label>
                <div className="relative">
                  <input
                    name="passord"
                    type={visPassord ? 'text' : 'password'}
                    value={ansatt.passord}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      validationErrors.passord ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    required={!erRedigeringsmodus}
                    minLength={8}
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
                {!validationErrors.passord && ansatt.passord && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 mb-1">Passordstyrke:</div>
                    <div className="flex space-x-1">
                      <div className={`h-1 w-1/4 rounded ${ansatt.passord.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className={`h-1 w-1/4 rounded ${/[A-Z]/.test(ansatt.passord) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className={`h-1 w-1/4 rounded ${/[a-z]/.test(ansatt.passord) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className={`h-1 w-1/4 rounded ${/\d/.test(ansatt.passord) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bekreft passord */}
              {(!erRedigeringsmodus || ansatt.passord) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaLock className="inline w-4 h-4 mr-2 text-blue-500" />
                    Bekreft passord {erRedigeringsmodus ? '' : '*'}
                  </label>
                  <div className="relative">
                    <input
                      name="bekreftPassord"
                      type={visBekreftPassord ? 'text' : 'password'}
                      value={ansatt.bekreftPassord}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        validationErrors.bekreftPassord ? 'border-red-500 bg-red-50' : 'border-gray-300'
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
                  {!validationErrors.bekreftPassord && ansatt.bekreftPassord && ansatt.passord === ansatt.bekreftPassord && (
                    <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                      <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>
                      Passordene matcher
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex justify-end cards-spacing-grid pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-2 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Avbryt
              </button>
              <button
                type="submit"
                disabled={loading || Object.keys(validationErrors).length > 0 || !ansatt.navn || !ansatt.epost || (!erRedigeringsmodus && (!ansatt.passord || !ansatt.bekreftPassord))}
                className="px-2 py-1 bg-gradient-to-r from-[#003366] to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Lagrer...
                  </>
                ) : (
                  <>
                    {erRedigeringsmodus ? 'Oppdater ansatt' : 'Registrer ansatt'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 