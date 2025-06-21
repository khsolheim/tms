import React, { useState, useEffect } from 'react';
import { FiFileText, FiSave, FiAlertCircle, FiDollarSign, FiCalendar, FiPercent } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../lib/api';

interface FakturaSettings {
  dagerForfallFaktura: number;
  purregebyr: number;
  forsinkelsesrente: number;
  kontonummer: string;
  standardRente: number;
  standardEtableringsgebyr: number;
  standardTermingebyr: number;
  standardLopetid: number;
}

export default function Fakturainnstillinger() {
  const [settings, setSettings] = useState<FakturaSettings>({
    dagerForfallFaktura: 14,
    purregebyr: 100,
    forsinkelsesrente: 8.5,
    kontonummer: '',
    standardRente: 5.0,
    standardEtableringsgebyr: 1900,
    standardTermingebyr: 50,
    standardLopetid: 24
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialSettings, setInitialSettings] = useState<FakturaSettings | null>(null); // eslint-disable-line @typescript-eslint/no-unused-vars

  useEffect(() => {
    hentInnstillinger();
  }, []);

  const hentInnstillinger = async () => {
    try {
      const response = await api.get('/systemconfig');
      if (response.data) {
        const systemConfig = response.data;
        const fakturaSettings: FakturaSettings = {
          dagerForfallFaktura: systemConfig.dagerForfallFaktura || 14,
          purregebyr: systemConfig.purregebyr || 100,
          forsinkelsesrente: systemConfig.forsinkelsesrente || 8.5,
          kontonummer: systemConfig.kontonummer || '',
          standardRente: systemConfig.standardRente || 5.0,
          standardEtableringsgebyr: systemConfig.standardEtableringsgebyr || 1900,
          standardTermingebyr: systemConfig.standardTermingebyr || 50,
          standardLopetid: systemConfig.standardLopetid || 24
        };
        setSettings(fakturaSettings);
        setInitialSettings(fakturaSettings);
      }
    } catch (error) {
      toast.error('Kunne ikke hente fakturainnstillinger');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FakturaSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const validerKontonummer = (kontonummer: string): boolean => {
    // Norsk kontonummer: 11 siffer, kan formateres som XXXX.XX.XXXXX
    const cleanNumber = kontonummer.replace(/[\s.]/g, '');
    if (cleanNumber.length !== 11) return false;
    
    // Mod11 validering for norske kontonummer
    const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanNumber[i]) * weights[i];
    }
    
    const remainder = sum % 11;
    const checkDigit = remainder === 0 ? 0 : 11 - remainder;
    
    return checkDigit === parseInt(cleanNumber[10]);
  };

  const formaterKontonummer = (value: string): string => {
    const cleanNumber = value.replace(/[\s.]/g, '');
    if (cleanNumber.length <= 4) return cleanNumber;
    if (cleanNumber.length <= 6) return `${cleanNumber.slice(0, 4)}.${cleanNumber.slice(4)}`;
    return `${cleanNumber.slice(0, 4)}.${cleanNumber.slice(4, 6)}.${cleanNumber.slice(6, 11)}`;
  };

  const lagreInnstillinger = async () => {
    // Valider kontonummer hvis det er fylt ut
    if (settings.kontonummer && !validerKontonummer(settings.kontonummer)) {
      toast.error('Ugyldig kontonummer');
      return;
    }

    setSaving(true);
    try {
      await api.put('/systemconfig', settings);
      toast.success('Fakturainnstillinger lagret');
      setInitialSettings(settings);
      setHasChanges(false);
    } catch (error) {
      toast.error('Kunne ikke lagre innstillinger');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg shadow">
        <div className="px-2 py-1 border-b border-gray-200">
          <div className="flex items-center">
            <FiFileText className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold">Fakturainnstillinger</h2>
          </div>
        </div>

        <div className="px-2 py-1 cards-spacing-vertical">
          {/* Betalingsbetingelser */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FiCalendar className="w-5 h-5 mr-2 text-gray-600" />
              Betalingsbetingelser
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forfallsdager for faktura
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={settings.dagerForfallFaktura}
                    onChange={(e) => handleChange('dagerForfallFaktura', parseInt(e.target.value))}
                    className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">dager</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Standard antall dager til forfall på fakturaer
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kontonummer
                </label>
                <input
                  type="text"
                  value={settings.kontonummer}
                  onChange={(e) => {
                    const formatted = formaterKontonummer(e.target.value);
                    if (formatted.replace(/[\s.]/g, '').length <= 11) {
                      handleChange('kontonummer', formatted);
                    }
                  }}
                  placeholder="1234.56.78901"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                    settings.kontonummer && !validerKontonummer(settings.kontonummer) 
                      ? 'border-red-300' 
                      : 'border-gray-300'
                  }`}
                />
                {settings.kontonummer && !validerKontonummer(settings.kontonummer) && (
                  <p className="text-xs text-red-600 mt-1">Ugyldig kontonummer</p>
                )}
              </div>
            </div>
          </div>

          {/* Gebyrer og renter */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FiPercent className="w-5 h-5 mr-2 text-gray-600" />
              Gebyrer og renter
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purregebyr
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={settings.purregebyr}
                    onChange={(e) => handleChange('purregebyr', parseInt(e.target.value))}
                    className="w-32 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">kr</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Gebyr ved purring på forfalte fakturaer
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forsinkelsesrente
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.1"
                    value={settings.forsinkelsesrente}
                    onChange={(e) => handleChange('forsinkelsesrente', parseFloat(e.target.value))}
                    className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">% p.a.</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Årlig rente ved forsinket betaling
                </p>
              </div>
            </div>
          </div>

          {/* Standardverdier for kontrakter */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FiDollarSign className="w-5 h-5 mr-2 text-gray-600" />
              Standardverdier for kontrakter
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Standard rente
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    value={settings.standardRente}
                    onChange={(e) => handleChange('standardRente', parseFloat(e.target.value))}
                    className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">% p.a.</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Standard løpetid
                </label>
                <select
                  value={settings.standardLopetid}
                  onChange={(e) => handleChange('standardLopetid', parseInt(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value={12}>12 måneder</option>
                  <option value={24}>24 måneder</option>
                  <option value={36}>36 måneder</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Standard etableringsgebyr
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    value={settings.standardEtableringsgebyr}
                    onChange={(e) => handleChange('standardEtableringsgebyr', parseInt(e.target.value))}
                    className="w-32 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">kr</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Standard termingebyr
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={settings.standardTermingebyr}
                    onChange={(e) => handleChange('standardTermingebyr', parseInt(e.target.value))}
                    className="w-32 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">kr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info-boks */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
            <div className="flex items-start">
              <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Om standardverdier</p>
                <p>Disse verdiene brukes som utgangspunkt når nye kontrakter opprettes. De kan overstyres for hver enkelt kontrakt.</p>
              </div>
            </div>
          </div>

          {/* Lagre-knapp */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {hasChanges && (
                  <span className="text-orange-600">
                    <FiAlertCircle className="inline w-4 h-4 mr-1" />
                    Du har ulagrede endringer
                  </span>
                )}
              </div>
              
              <button
                onClick={lagreInnstillinger}
                disabled={!hasChanges || saving || (!!settings.kontonummer && !validerKontonummer(settings.kontonummer))}
                className="flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Lagrer...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4 mr-2" />
                    Lagre endringer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 