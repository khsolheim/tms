import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { EnhancedInput, EnhancedSelect } from '../../components/forms/FormComponents';
import { kjøretøyService } from '../../services/kjøretøy.service';
import Alert from '../../components/ui/Alert';

interface VegvesenData {
  registreringsnummer: string;
  merke: string;
  modell: string;
  aarsmodell: number | null;
  type: string;
  drivstoff: string;
  effekt: number;
  vekt: number;
  forerkortklass: string; // Kommaseparert string i stedet for array
  euKontrollFrist: string;
  euKontrollSist: string;
  registrertForstGang: string;
  registreringsstatus?: string;
  understellsnummer?: string;
  antallSeter?: number;
  farge?: string;
  euroKlasse?: string;
}

const KJORETOY_TYPER = [
  { value: 'Personbil', label: 'Personbil' },
  { value: 'Motorsykkel', label: 'Motorsykkel' },
  { value: 'Lastebil', label: 'Lastebil' },
  { value: 'Buss', label: 'Buss' },
  { value: 'Traktor', label: 'Traktor' }
];

const STATUS_ALTERNATIVER = [
  { value: 'AKTIV', label: 'Aktiv' },
  { value: 'INAKTIV', label: 'Inaktiv' },
  { value: 'SERVICE', label: 'Service' },
  { value: 'SOLGT', label: 'Solgt' }
];

const KjoretoyRegistrering: React.FC = () => {
  const navigate = useNavigate();
  const { bedriftId } = useParams<{ bedriftId: string }>();
  
  const [registreringsnummer, setRegistreringsnummer] = useState('');
  const [søker, setSøker] = useState(false);
  const [vegvesenData, setVegvesenData] = useState<VegvesenData | null>(null);
  const [søkeStatus, setSøkeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [søkeFeilmelding, setSøkeFeilmelding] = useState('');
  
  const [formData, setFormData] = useState({
    merke: '',
    modell: '',
    aarsmodell: '',
    type: '',
    forerkortklass: '',
    status: 'AKTIV'
  });
  
  const [lagrer, setLagrer] = useState(false);

  const validerRegistreringsnummer = (nummer: string): boolean => {
    const regex = /^[A-Z]{2}\d{5}$/;
    return regex.test(nummer.toUpperCase());
  };

  const søkVegvesen = async () => {
    if (!validerRegistreringsnummer(registreringsnummer)) {
      setSøkeStatus('error');
      setSøkeFeilmelding('Registreringsnummer må være i format: 2 bokstaver + 5 tall (f.eks. AB12345)');
      return;
    }

    setSøker(true);
    setSøkeStatus('idle');
    setSøkeFeilmelding('');

    try {
      const result = await kjøretøyService.hentKjøretøyFraVegvesen(registreringsnummer.toUpperCase());

      if (result.success && result.data) {
        setVegvesenData(result.data);
        setFormData({
          merke: result.data.merke || '',
          modell: result.data.modell || '',
          aarsmodell: result.data.aarsmodell ? result.data.aarsmodell.toString() : '',
          type: result.data.type || '',
          forerkortklass: result.data.forerkortklass || '',
          status: 'AKTIV'
        });
        setSøkeStatus('success');
      } else {
        setSøkeStatus('error');
        setSøkeFeilmelding(result.error || 'Kjøretøyet ble ikke funnet i Statens Vegvesen sitt register');
      }
    } catch (error) {
      console.error('Feil ved søk i Vegvesen:', error);
      setSøkeStatus('error');
      setSøkeFeilmelding('Teknisk feil ved oppslag i Statens Vegvesen');
    } finally {
      setSøker(false);
    }
  };

  const håndterInputEndring = (felt: string, verdi: string) => {
    setFormData(prev => ({
      ...prev,
      [felt]: verdi
    }));
  };

  const lagreKjøretøy = async () => {
    if (!bedriftId) return;

    if (!formData.merke || !formData.modell || !registreringsnummer) {
      alert('Vennligst fyll ut alle obligatoriske felter');
      return;
    }

    setLagrer(true);

    try {
      const kjøretøyData = {
        registreringsnummer: registreringsnummer.toUpperCase(),
        merke: formData.merke,
        modell: formData.modell,
        aarsmodell: formData.aarsmodell && formData.aarsmodell.trim() !== '' ? 
          parseInt(formData.aarsmodell, 10) : 
          (vegvesenData?.aarsmodell || null),
        type: formData.type || 'Personbil',
        forerkortklass: formData.forerkortklass ? 
          formData.forerkortklass.split(',').map(k => k.trim()).filter(k => k.length > 0) : 
          ['B'],
        status: formData.status
      };

      // Send direkte til API-et med riktig format
      const response = await fetch(`/api/bedrifter/${bedriftId}/kjoretoy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token-123'}`
        },
        body: JSON.stringify(kjøretøyData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || errorData.message || errorData.error || 'Feil ved lagring av kjøretøy';
        throw new Error(errorMessage);
      }
      
      // Naviger tilbake til kjøretøy-oversikten
      navigate(`/bedrifter/${bedriftId}/kjoretoy`);
    } catch (error) {
      console.error('Feil ved lagring av kjøretøy:', error);
      let errorMessage = 'Ukjent feil';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message;
      }
      
      alert(`Feil ved lagring av kjøretøy: ${errorMessage}. Vennligst prøv igjen.`);
    } finally {
      setLagrer(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(`/bedrifter/${bedriftId}/kjoretoy`)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Tilbake til kjøretøy-oversikt
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Registrer nytt kjøretøy
          </h1>
          <p className="text-gray-600 mt-1">
            Søk opp kjøretøyet i Statens Vegvesen sitt register ved å oppgi registreringsnummer
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Søk i Vegvesen */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
            <FaSearch className="mr-2 text-blue-600" />
            Søk i Statens Vegvesen
          </h2>
          
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block font-semibold mb-2 text-gray-900">
                Registreringsnummer *
              </label>
              <input
                value={registreringsnummer}
                onChange={(e) => setRegistreringsnummer(e.target.value.toUpperCase())}
                placeholder="AB12345"
                maxLength={7}
                className="border rounded-lg px-4 py-3 w-full text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: 2 bokstaver + 5 tall (f.eks. AB12345)
              </p>
            </div>
            <div className="flex items-end">
              <button
                onClick={søkVegvesen}
                disabled={søker || !registreringsnummer}
                className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-100 flex items-center gap-2 whitespace-nowrap"
              >
                {søker ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                {søker ? 'Søker...' : 'Søk'}
              </button>
            </div>
          </div>

          {/* Søkeresultat */}
          {søkeStatus === 'success' && vegvesenData && (
            <div className="flex items-center gap-2 text-green-600 text-sm mt-4">
              <FaCheckCircle />
              <span><strong>Kjøretøy funnet!</strong> Informasjon hentet fra Statens Vegvesen.</span>
            </div>
          )}

          {søkeStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600 text-sm mt-4">
              <FaExclamationTriangle />
              <span>{søkeFeilmelding}</span>
            </div>
          )}
        </div>

        {/* Vegvesen-informasjon */}
        {vegvesenData && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Informasjon fra Statens Vegvesen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-900">Registreringsnummer:</span>
                <p className="text-blue-800">{vegvesenData.registreringsnummer}</p>
              </div>
              {vegvesenData.registreringsstatus && (
                <div>
                  <span className="font-medium text-blue-900">Status:</span>
                  <p className="text-blue-800">{vegvesenData.registreringsstatus}</p>
                </div>
              )}
              {vegvesenData.understellsnummer && (
                <div>
                  <span className="font-medium text-blue-900">Understellsnummer (VIN):</span>
                  <p className="text-blue-800 font-mono text-xs">{vegvesenData.understellsnummer}</p>
                </div>
              )}
              <div>
                <span className="font-medium text-blue-900">Merke:</span>
                <p className="text-blue-800">{vegvesenData.merke}</p>
              </div>
              <div>
                <span className="font-medium text-blue-900">Modell:</span>
                <p className="text-blue-800">{vegvesenData.modell}</p>
              </div>
              {vegvesenData.aarsmodell && (
                <div>
                  <span className="font-medium text-blue-900">Årsmodell:</span>
                  <p className="text-blue-800">{vegvesenData.aarsmodell}</p>
                </div>
              )}
              <div>
                <span className="font-medium text-blue-900">Type:</span>
                <p className="text-blue-800">{vegvesenData.type}</p>
              </div>
              {vegvesenData.antallSeter && (
                <div>
                  <span className="font-medium text-blue-900">Antall seter:</span>
                  <p className="text-blue-800">{vegvesenData.antallSeter}</p>
                </div>
              )}
              {vegvesenData.farge && (
                <div>
                  <span className="font-medium text-blue-900">Farge:</span>
                  <p className="text-blue-800">{vegvesenData.farge}</p>
                </div>
              )}
              {vegvesenData.drivstoff && (
                <div>
                  <span className="font-medium text-blue-900">Drivstoff:</span>
                  <p className="text-blue-800">{vegvesenData.drivstoff}</p>
                </div>
              )}
              {vegvesenData.euroKlasse && (
                <div>
                  <span className="font-medium text-blue-900">Euro-klasse:</span>
                  <p className="text-blue-800">{vegvesenData.euroKlasse}</p>
                </div>
              )}
              {vegvesenData.effekt > 0 && (
                <div>
                  <span className="font-medium text-blue-900">Effekt:</span>
                  <p className="text-blue-800">{vegvesenData.effekt} kW</p>
                </div>
              )}
              {vegvesenData.vekt > 0 && (
                <div>
                  <span className="font-medium text-blue-900">Vekt:</span>
                  <p className="text-blue-800">{vegvesenData.vekt} kg</p>
                </div>
              )}
              {vegvesenData.euKontrollFrist && (
                <div>
                  <span className="font-medium text-blue-900">EU-kontroll frist:</span>
                  <p className="text-blue-800">{vegvesenData.euKontrollFrist}</p>
                </div>
              )}
              <div>
                <span className="font-medium text-blue-900">Førerkortklasser:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {vegvesenData.forerkortklass?.split(',').map((klasse) => (
                    <span
                      key={klasse.trim()}
                      className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      {klasse.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kjøretøy-skjema */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Kjøretøyinformasjon
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Informasjonen nedenfor er hentet fra Statens Vegvesen. Du kan redigere feltene om nødvendig.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EnhancedInput
              label="Merke *"
              value={formData.merke}
              onChange={(e) => håndterInputEndring('merke', e.target.value)}
              placeholder="f.eks. Toyota"
              required
            />

            <EnhancedInput
              label="Modell *"
              value={formData.modell}
              onChange={(e) => håndterInputEndring('modell', e.target.value)}
              placeholder="f.eks. Corolla"
              required
            />

            <EnhancedInput
              label="Årsmodell"
              type="number"
              value={formData.aarsmodell}
              onChange={(e) => håndterInputEndring('aarsmodell', e.target.value)}
              placeholder="f.eks. 2020"
              min="1900"
              max={new Date().getFullYear() + 1}
            />

            <EnhancedSelect
              label="Type"
              value={formData.type}
              onChange={(e) => håndterInputEndring('type', e.target.value)}
              options={KJORETOY_TYPER}
              placeholder="Velg type"
            />

            <EnhancedInput
              label="Nødvendige førerkortklasser"
              value={formData.forerkortklass}
              onChange={(e) => håndterInputEndring('forerkortklass', e.target.value)}
              placeholder="f.eks. B, BE"
              helpText="Separate med komma hvis flere klasser"
            />

            <EnhancedSelect
              label="Status *"
              value={formData.status}
              onChange={(e) => håndterInputEndring('status', e.target.value)}
              options={STATUS_ALTERNATIVER}
              required
            />
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              onClick={() => navigate(`/bedrifter/${bedriftId}`)}
              disabled={lagrer}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Avbryt
            </button>
            <button
              onClick={lagreKjøretøy}
              disabled={lagrer || !formData.merke || !formData.modell || !registreringsnummer}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {lagrer ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Lagrer...</span>
                </>
              ) : (
                <span>Lagre kjøretøy</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KjoretoyRegistrering; 