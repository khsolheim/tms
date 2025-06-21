import React, { useState, useEffect } from 'react';
import { FiX, FiSearch, FiUser, FiPhone, FiMail, FiMapPin, FiCreditCard, FiBook, FiTruck } from 'react-icons/fi';
import api from '../../lib/api';
import { usePostnummer } from '../../hooks/usePostnummer';

interface Bedrift {
  id: number;
  navn: string;
  orgNummer: string | null;
  adresse: string | null;
  postnummer: string | null;
  poststed: string | null;
  klasser: { klassekode: string }[];
  ansatte: { id: number; navn: string; rolle: string }[];
}

interface ElevSoknadData {
  fornavn: string;
  etternavn: string;
  telefon: string;
  epost: string;
  gate: string;
  postnummer: string;
  poststed: string;
  personnummer: string;
  bedriftId: number | null;
  klassekode: string;
  larer: string; // valgfri
}

interface Props {
  onClose: () => void;
}

export default function ElevSoknad({ onClose }: Props) {
  const [soknadData, setSoknadData] = useState<ElevSoknadData>({
    fornavn: '',
    etternavn: '',
    telefon: '',
    epost: '',
    gate: '',
    postnummer: '',
    poststed: '',
    personnummer: '',
    bedriftId: null,
    klassekode: '',
    larer: ''
  });

  const [bedrifter, setBedrifter] = useState<Bedrift[]>([]);
  const [filtrerteBedrifter, setFiltrerteBedrifter] = useState<Bedrift[]>([]);
  const [valgtBedrift, setValgtBedrift] = useState<Bedrift | null>(null);
  const [skoleSok, setSkoleSok] = useState('');
  const [visBedrifter, setVisBedrifter] = useState(false);
  const [sender, setSender] = useState(false);
  const [feilmelding, setFeilmelding] = useState('');
  const [suksess, setSuksess] = useState(false);

  // Bruk postnummer hook
  const { finnPoststed } = usePostnummer();

  // Last inn bedrifter ved oppstart
  useEffect(() => {
    const hentBedrifter = async () => {
      try {
        const res = await api.get('/bedrifter');
        setBedrifter(res.data);
      } catch (error) {
        console.error('Kunne ikke hente bedrifter:', error);
      }
    };

    hentBedrifter();
  }, []);

  // Filtrer bedrifter basert på søk
  useEffect(() => {
    if (skoleSok.trim()) {
      const filtrert = bedrifter.filter(bedrift =>
        bedrift.navn.toLowerCase().includes(skoleSok.toLowerCase())
      );
      setFiltrerteBedrifter(filtrert);
      setVisBedrifter(true);
    } else {
      setFiltrerteBedrifter([]);
      setVisBedrifter(false);
    }
  }, [skoleSok, bedrifter]);



  const handleInputChange = (field: keyof ElevSoknadData, value: any) => {
    setSoknadData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Automatisk poststed-oppslag
      if (field === 'postnummer' && typeof value === 'string' && value.length === 4) {
        const poststed = finnPoststed(value);
        if (poststed) {
          updated.poststed = poststed;
        }
      }
      
      return updated;
    });
  };

  const handleBedriftValg = (bedrift: Bedrift) => {
    setValgtBedrift(bedrift);
    setSoknadData(prev => ({ ...prev, bedriftId: bedrift.id, klassekode: '', larer: '' }));
    setSkoleSok(bedrift.navn);
    setVisBedrifter(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeilmelding('');
    setSender(true);

    // Validering
    if (!soknadData.fornavn.trim() || !soknadData.etternavn.trim() || !soknadData.telefon.trim() || 
        !soknadData.epost.trim() || !soknadData.gate.trim() || !soknadData.postnummer.trim() || 
        !soknadData.poststed.trim() || !soknadData.personnummer.trim() || !soknadData.bedriftId || 
        !soknadData.klassekode) {
      setFeilmelding('Alle obligatoriske felt må fylles ut');
      setSender(false);
      return;
    }

    // Validér personnummer (11 siffer)
    if (!/^\d{11}$/.test(soknadData.personnummer)) {
      setFeilmelding('Personnummer må være 11 siffer');
      setSender(false);
      return;
    }

    // Validér postnummer (4 siffer)
    if (!/^\d{4}$/.test(soknadData.postnummer)) {
      setFeilmelding('Postnummer må være 4 siffer');
      setSender(false);
      return;
    }

    try {
      await api.post('/elev/soknad', soknadData);
      setSuksess(true);
    } catch (error: any) {
      setFeilmelding(error.response?.data?.error || 'Kunne ikke sende søknad');
    } finally {
      setSender(false);
    }
  };

  if (suksess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2 py-1">
        <div className="bg-white rounded-lg max-w-md w-full px-2 py-1">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <FiUser className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Søknad sendt!</h3>
            <p className="text-sm text-gray-500 mb-6">
              Din søknad om tilgang er nå sendt til {valgtBedrift?.navn}. Du vil få beskjed når søknaden blir behandlet.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 transition-colors"
            >
              Lukk
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2 py-1">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-2 py-1 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Søk om tilgang som elev</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-2 py-1 cards-spacing-vertical">
          {/* Elevopplysninger */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <FiUser className="w-5 h-5" />
              Elevopplysninger
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fornavn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={soknadData.fornavn}
                  onChange={(e) => handleInputChange('fornavn', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etternavn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={soknadData.etternavn}
                  onChange={(e) => handleInputChange('etternavn', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <FiPhone className="w-4 h-4" />
                  Telefon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={soknadData.telefon}
                  onChange={(e) => handleInputChange('telefon', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123 45 678"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <FiMail className="w-4 h-4" />
                  E-post <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={soknadData.epost}
                  onChange={(e) => handleInputChange('epost', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="din@epost.no"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <FiMapPin className="w-4 h-4" />
                  Gate <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={soknadData.gate}
                  onChange={(e) => handleInputChange('gate', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Gatenavn og husnummer"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postnummer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={soknadData.postnummer}
                  onChange={(e) => handleInputChange('postnummer', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1234"
                  maxLength={4}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poststed <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={soknadData.poststed}
                  onChange={(e) => handleInputChange('poststed', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Fylles automatisk"
                  readOnly
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <FiCreditCard className="w-4 h-4" />
                  Personnummer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={soknadData.personnummer}
                  onChange={(e) => handleInputChange('personnummer', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="11 siffer (ddmmååxxxxx)"
                  maxLength={11}
                  required
                />
              </div>
            </div>
          </div>

          {/* Søk skole */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <FiSearch className="w-5 h-5" />
              Søk skole
            </h3>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skolenavn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={skoleSok}
                onChange={(e) => setSkoleSok(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Søk etter skolenavn..."
                required
              />
              
              {visBedrifter && filtrerteBedrifter.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filtrerteBedrifter.map((bedrift) => (
                    <button
                      key={bedrift.id}
                      type="button"
                      onClick={() => handleBedriftValg(bedrift)}
                      className="w-full text-left px-2 py-1 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">{bedrift.navn}</div>
                      {bedrift.adresse && (
                        <div className="text-sm text-gray-500">{bedrift.adresse}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Velg klasse */}
          {valgtBedrift && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FiBook className="w-5 h-5" />
                Velg klasse
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Klasse <span className="text-red-500">*</span>
                </label>
                <select
                  value={soknadData.klassekode}
                  onChange={(e) => handleInputChange('klassekode', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Velg klasse...</option>
                  {valgtBedrift.klasser.map((klasse) => (
                    <option key={klasse.klassekode} value={klasse.klassekode}>
                      {klasse.klassekode}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Velg kjøretøy/lærer */}
          {valgtBedrift && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FiTruck className="w-5 h-5" />
                Velg lærer (valgfri)
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lærer
                </label>
                <select
                  value={soknadData.larer}
                  onChange={(e) => handleInputChange('larer', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Velg lærer...</option>
                  {valgtBedrift.ansatte
                    .filter(ansatt => ansatt.rolle === 'TRAFIKKLARER')
                    .map((ansatt) => (
                      <option key={ansatt.id} value={ansatt.navn}>
                        {ansatt.navn}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          {feilmelding && (
            <div className="bg-red-50 border border-red-200 rounded-md px-2 py-1">
              <div className="text-red-600 text-sm">{feilmelding}</div>
            </div>
          )}

          <div className="flex cards-spacing-grid pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 px-2 py-1 rounded-md hover:bg-gray-300 transition-colors"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={sender || !valgtBedrift}
              className="flex-1 bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sender ? 'Sender søknad...' : 'Send søknad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 