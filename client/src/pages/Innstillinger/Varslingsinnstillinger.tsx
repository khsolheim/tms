import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { FiBell, FiSave, FiAlertCircle, FiMail, FiMessageSquare, FiCheckCircle, FiAlertTriangle, FiCalendar, FiRotateCcw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { FormSkeleton, LoadingButton } from '../../components/ui/LoadingStates';
import varslingsinnstillingerService, { VarslingKategori } from '../../services/varslingsinnstillinger.service';

// Ikon-mapping for å konvertere string til React-komponenter
const ikonMap: { [key: string]: React.ElementType } = {
  FiCheckCircle,
  FiAlertTriangle,
  FiCalendar
};

export default function Varslingsinnstillinger() {
  const [innstillinger, setInnstillinger] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialSettings, setInitialSettings] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [varslingKategorier, setVarslingKategorier] = useState<VarslingKategori[]>([]);
  
  // Globale innstillinger
  const [epostAktiv, setEpostAktiv] = useState(true);
  const [smsAktiv, setSmsAktiv] = useState(false);
  const [daglingSammendrag, setDaglingSammendrag] = useState(true);
  const [umiddelbareVarsler, setUmiddelbareVarsler] = useState(true);

  useEffect(() => {
    hentInnstillinger();
    hentVarslingKategorier();
  }, []);

  const hentVarslingKategorier = async () => {
    try {
      const kategorier = await varslingsinnstillingerService.hentVarslingKategorier();
      setVarslingKategorier(kategorier);
    } catch (error) {
      console.error('Feil ved henting av varslingkategorier:', error);
    }
  };

  const hentInnstillinger = async () => {
    try {
      const response = await api.get('/notification-settings');
      if (response.data) {
        setInnstillinger(response.data.innstillinger || {});
        setEpostAktiv(response.data.epostAktiv ?? true);
        setSmsAktiv(response.data.smsAktiv ?? false);
        setDaglingSammendrag(response.data.daglingSammendrag ?? true);
        setUmiddelbareVarsler(response.data.umiddelbareVarsler ?? true);
        setInitialSettings(response.data);
      }
    } catch (error) {
      // Hvis ingen innstillinger finnes, bruk standardverdier
      const standardInnstillinger: any = {};
      varslingKategorier.forEach((kategori: VarslingKategori) => {
        Object.entries(kategori.innstillinger).forEach(([key, value]) => {
          standardInnstillinger[key] = {
            epost: value.epost,
            sms: value.sms
          };
        });
      });
      setInnstillinger(standardInnstillinger);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (kategoriKey: string, type: 'epost' | 'sms') => {
    setInnstillinger((prev: any) => ({
      ...prev,
      [kategoriKey]: {
        ...prev[kategoriKey],
        [type]: !prev[kategoriKey]?.[type]
      }
    }));
    setHasChanges(true);
  };

  const lagreInnstillinger = async () => {
    setSaving(true);
    try {
      await api.put('/notification-settings', {
        innstillinger,
        epostAktiv,
        smsAktiv,
        daglingSammendrag,
        umiddelbareVarsler
      });
      toast.success('Varslingsinnstillinger lagret');
      setInitialSettings({
        innstillinger,
        epostAktiv,
        smsAktiv,
        daglingSammendrag,
        umiddelbareVarsler
      });
      setHasChanges(false);
    } catch (error) {
      toast.error('Kunne ikke lagre innstillinger');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="px-2 py-1 max-w-4xl mx-auto">
        <div className="mb-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-60 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-80"></div>
        </div>
        <FormSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg shadow">
        <div className="px-2 py-1 border-b border-gray-200">
          <div className="flex items-center">
            <FiBell className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold">Varslingsinnstillinger</h2>
          </div>
        </div>

        <div className="px-2 py-1 cards-spacing-vertical">
          {/* Globale innstillinger */}
          <div>
            <h3 className="text-lg font-medium mb-4">Globale innstillinger</h3>
            
            <div className="cards-spacing-vertical">
              <label className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <div className="flex items-center">
                  <FiMail className="w-5 h-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium">E-postvarsler</p>
                    <p className="text-sm text-gray-600">Aktiver varsler via e-post</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={epostAktiv}
                  onChange={(e) => {
                    setEpostAktiv(e.target.checked);
                    setHasChanges(true);
                  }}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </label>
              
              <label className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <div className="flex items-center">
                  <FiMessageSquare className="w-5 h-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium">SMS-varsler</p>
                    <p className="text-sm text-gray-600">Aktiver varsler via SMS</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={smsAktiv}
                  onChange={(e) => {
                    setSmsAktiv(e.target.checked);
                    setHasChanges(true);
                  }}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </label>
              
              <div className="border-t pt-4">
                <label className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <div>
                    <p className="font-medium">Daglig sammendrag</p>
                    <p className="text-sm text-gray-600">Motta en oppsummering av dagens aktiviteter kl. 08:00</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={daglingSammendrag}
                    onChange={(e) => {
                      setDaglingSammendrag(e.target.checked);
                      setHasChanges(true);
                    }}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
                
                <label className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 mt-2">
                  <div>
                    <p className="font-medium">Umiddelbare varsler</p>
                    <p className="text-sm text-gray-600">Motta varsler med en gang de oppstår</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={umiddelbareVarsler}
                    onChange={(e) => {
                      setUmiddelbareVarsler(e.target.checked);
                      setHasChanges(true);
                    }}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Detaljerte varslingskategorier */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Detaljerte innstillinger</h3>
            
            <div className="cards-spacing-vertical">
              {varslingKategorier.map((kategori) => (
                <div key={kategori.navn} className="border rounded-lg px-2 py-1">
                  <div className="flex items-center mb-3">
                    {ikonMap[kategori.ikon] && React.createElement(ikonMap[kategori.ikon], { className: "w-5 h-5 text-gray-600 mr-2" })}
                    <h4 className="font-medium">{kategori.navn}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{kategori.beskrivelse}</p>
                  
                  <div className="space-y-6">
                    {Object.entries(kategori.innstillinger).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-2 px-2 bg-gray-50 rounded">
                        <span className="text-sm">{value.navn}</span>
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={innstillinger[key]?.epost ?? value.epost}
                              onChange={() => handleToggle(key, 'epost')}
                              disabled={!epostAktiv}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-1"
                            />
                            <span className="text-xs text-gray-600">E-post</span>
                          </label>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={innstillinger[key]?.sms ?? value.sms}
                              onChange={() => handleToggle(key, 'sms')}
                              disabled={!smsAktiv}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-1"
                            />
                            <span className="text-xs text-gray-600">SMS</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info-boks */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
            <div className="flex items-start">
              <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Om varsler</p>
                <p>SMS-varsler kan medføre ekstra kostnader. Kontakt administratoren for å aktivere SMS-tjenesten.</p>
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
              
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => {
                    setHasChanges(false);
                    hentInnstillinger();
                  }}
                  className="flex items-center px-2 py-1 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <FiRotateCcw className="w-4 h-4 mr-2" />
                  Tilbakestill
                </button>

                <LoadingButton
                  loading={saving}
                  onClick={lagreInnstillinger}
                  disabled={!hasChanges}
                  className={`flex items-center px-6 py-2 rounded-md transition-colors ${
                    !hasChanges 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <FiSave className="w-4 h-4 mr-2" />
                  {saving ? 'Lagrer...' : 'Lagre innstillinger'}
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 