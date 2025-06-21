import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaUser, 
  FaMapMarkerAlt,
  FaArrowLeft,
  FaGraduationCap,
  FaSave,
  FaTimes,
  FaUserGraduate
} from 'react-icons/fa';
import api from '../lib/api';
import { usePostnummer } from '../hooks/usePostnummer';

interface Bedrift {
  id: number;
  navn: string;
  adresse: string | null;
  postnummer: string | null;
  poststed: string | null;
  telefon: string | null;
  epost: string | null;
  orgNummer: string | null;
  klasser?: BedriftsKlasse[];
}

interface BedriftsKlasse {
  klassekode: string;
}

interface Ansatt {
  id: number;
  fornavn: string;
  etternavn: string;
  rolle: string;
}

type ElevRegistrerProps = {
  bedriftId?: number;
  onClose?: () => void;
};

export default function ElevRegistrer({ bedriftId: propBedriftId, onClose }: ElevRegistrerProps) {
  const navigate = useNavigate();
  const { bedriftId: paramBedriftId, elevId } = useParams();
  const bedriftId = propBedriftId ?? (paramBedriftId ? Number(paramBedriftId) : undefined);
  const [loading, setLoading] = useState(false);
  const [bedrift, setBedrift] = useState<Bedrift | null>(null);
  const [klasser, setKlasser] = useState<BedriftsKlasse[]>([]);
  const [ansatte, setAnsatte] = useState<Ansatt[]>([]);
  const [elev, setElev] = useState({
    fornavn: '',
    etternavn: '',
    epost: '',
    telefon: '',
    gate: '',
    postnummer: '',
    poststed: '',
    personnummer: '',
    klassekode: '',
    larer: '',
    status: 'AKTIV' as 'AKTIV' | 'INAKTIV'
  });
  const [error, setError] = useState<string | { message?: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Bruk postnummer hook
  const { finnPoststed } = usePostnummer();

  useEffect(() => {
    if (bedriftId) {
      hentBedrift();
      hentAnsatte();
    }

    if (elevId) {
      hentElev();
    }
  }, [bedriftId, elevId]); // eslint-disable-line react-hooks/exhaustive-deps

  const hentBedrift = async () => {
    try {
      const res = await api.get(`/bedrifter/${bedriftId}`);
      setBedrift(res.data);
      // Hent klasser fra bedrift-dataene
      setKlasser(res.data.klasser || []);
    } catch (error) {
      console.error('Kunne ikke hente bedrift:', error);
      setError('Kunne ikke hente bedriftsinformasjon');
    }
  };

  const hentAnsatte = async () => {
    try {
              const res = await api.get(`/bedrifter/${bedriftId}/ansatte`);
      setAnsatte(res.data.filter((a: Ansatt) => a.rolle === 'TRAFIKKLARER' || a.rolle === 'HOVEDBRUKER'));
    } catch (error) {
      console.error('Kunne ikke hente ansatte:', error);
    }
  };

  const hentElev = async () => {
    try {
      const res = await api.get(`/elev/${elevId}`);
      setElev({
        fornavn: res.data.fornavn,
        etternavn: res.data.etternavn,
        epost: res.data.epost,
        telefon: res.data.telefon,
        gate: res.data.gate,
        postnummer: res.data.postnummer,
        poststed: res.data.poststed,
        personnummer: res.data.personnummer,
        klassekode: res.data.klassekode,
        larer: res.data.larer || '',
        status: res.data.status
      });
    } catch (error) {
      console.error('Kunne ikke hente elev:', error);
      setError('Kunne ikke hente elevdata');
    }
  };

  const validateField = (name: string, value: string) => {
    const errors = { ...validationErrors };

    switch (name) {
      case 'fornavn':
      case 'etternavn':
        if (!value.trim()) {
          errors[name] = 'Dette feltet er påkrevd';
        } else {
          delete errors[name];
        }
        break;
      case 'epost':
        if (!value.trim()) {
          errors[name] = 'E-post er påkrevd';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[name] = 'Ugyldig e-postformat';
        } else {
          delete errors[name];
        }
        break;
      case 'telefon':
        const cleanedPhone = value.replace(/\s/g, '');
        if (!cleanedPhone) {
          errors[name] = 'Telefonnummer er påkrevd';
        } else if (!/^\d{8}$/.test(cleanedPhone)) {
          errors[name] = 'Telefonnummer må være 8 siffer';
        } else {
          delete errors[name];
        }
        break;
      case 'personnummer':
        if (!value.trim()) {
          errors[name] = 'Personnummer er påkrevd';
        } else if (!/^\d{11}$/.test(value)) {
          errors[name] = 'Personnummer må være 11 siffer';
        } else {
          delete errors[name];
        }
        break;
      case 'postnummer':
        if (!value.trim()) {
          errors[name] = 'Postnummer er påkrevd';
        } else if (!/^\d{4}$/.test(value)) {
          errors[name] = 'Postnummer må være 4 siffer';
        } else {
          delete errors[name];
        }
        break;
      case 'klassekode':
        if (!value.trim()) {
          errors[name] = 'Klasse må velges';
        } else {
          delete errors[name];
        }
        break;
    }

    setValidationErrors(errors);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Automatisk poststed-oppslag når postnummer endres
    if (name === 'postnummer' && value.length === 4) {
      const poststed = finnPoststed(value);
      if (poststed) {
        setElev(prev => ({ ...prev, [name]: value, poststed }));
      } else {
        setElev(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setElev(prev => ({ ...prev, [name]: value }));
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
    setElev(prev => ({ ...prev, telefon: formatted }));
    validateField('telefon', formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Valider alle felt
    Object.keys(elev).forEach(key => {
      validateField(key, elev[key as keyof typeof elev]);
    });

    if (Object.keys(validationErrors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      const elevData = {
        ...elev,
        larer: elev.larer || null,
        ...(bedriftId && { bedriftId })
      };

      await api.post('/elever', elevData);
      setLoading(false);
      if (onClose) {
        onClose();
      } else {
        navigate(-1);
      }
    } catch (error: any) {
      console.error('Feil ved lagring av elev:', error);
      setError(typeof error === 'string' ? error : error?.message || 'Ukjent feil');
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!elevId;

  return (
    <div className="min-h-screen bg-gray-50 py-1">
      <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/bedrifter/${bedriftId}`)}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft />
            Tilbake til {bedrift?.navn}
          </button>
          
          <div className="flex items-center cards-spacing-grid">
            <div className="px-2 py-1 bg-blue-100 rounded-xl">
              <FaUserGraduate className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? 'Rediger elev' : 'Registrer ny elev'}
              </h1>
              <p className="text-gray-600">
                {isEditing ? 'Oppdater elevens informasjon' : 'Legg til en ny elev i systemet'}
              </p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
            <div className="flex items-center gap-2">
              <FaTimes className="text-red-500" />
              <span className="text-red-700">{typeof error === 'string' ? error : error?.message || 'Ukjent feil'}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="cards-spacing-vertical">
          <div className="grid grid-cols-1 lg:grid-cols-3 cards-spacing-grid">
            
            {/* Column 1: Personal Info */}
            <div className="bg-white rounded-xl shadow-sm border px-2 py-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FaUser className="text-blue-500" />
                Personalia
              </h2>
              
              <div className="cards-spacing-vertical">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fornavn
                  </label>
                  <input
                    name="fornavn"
                    value={elev.fornavn}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      validationErrors.fornavn ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Ola"
                  />
                  {validationErrors.fornavn && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.fornavn}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etternavn
                  </label>
                  <input
                    name="etternavn"
                    value={elev.etternavn}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      validationErrors.etternavn ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Nordmann"
                  />
                  {validationErrors.etternavn && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.etternavn}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-post
                  </label>
                  <input
                    name="epost"
                    type="email"
                    value={elev.epost}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      validationErrors.epost ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="ola@example.com"
                  />
                  {validationErrors.epost && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.epost}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    name="telefon"
                    value={elev.telefon}
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personnummer
                  </label>
                  <input
                    name="personnummer"
                    value={elev.personnummer}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      validationErrors.personnummer ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="12345678901"
                    maxLength={11}
                  />
                  {validationErrors.personnummer && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.personnummer}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Column 2: Address */}
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
                    name="gate"
                    value={elev.gate}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                      value={elev.postnummer}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        validationErrors.postnummer ? 'border-red-500 bg-red-50' : 'border-gray-300'
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
                      value={elev.poststed}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50"
                      placeholder="Fylles automatisk"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Class and Teacher */}
            <div className="bg-white rounded-xl shadow-sm border px-2 py-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FaGraduationCap className="text-purple-500" />
                Undervisning
              </h2>
              
              <div className="cards-spacing-vertical">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Klasse
                  </label>
                  <select
                    name="klassekode"
                    value={elev.klassekode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      validationErrors.klassekode ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Velg klasse</option>
                    {klasser.map(klasse => (
                      <option key={klasse.klassekode} value={klasse.klassekode}>
                        {klasse.klassekode}
                      </option>
                    ))}
                  </select>
                  {validationErrors.klassekode && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.klassekode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lærer (valgfri)
                  </label>
                  <select
                    name="larer"
                    value={elev.larer}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Ingen spesifikk lærer</option>
                    {ansatte.map(ansatt => (
                      <option key={ansatt.id} value={`${ansatt.fornavn} ${ansatt.etternavn}`}>
                        {ansatt.fornavn} {ansatt.etternavn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={elev.status}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="AKTIV">Aktiv</option>
                    <option value="INAKTIV">Inaktiv</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end cards-spacing-grid pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate(`/bedrifter/${bedriftId}`)}
              className="px-2 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FaTimes />
              Avbryt
            </button>
            
            <button
              type="submit"
              disabled={loading || Object.keys(validationErrors).length > 0}
              className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <FaSave />
              {loading ? 'Lagrer...' : (isEditing ? 'Oppdater elev' : 'Registrer elev')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 