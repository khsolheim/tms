import React, { useState, useEffect } from 'react';
import { FiUser, FiSave, FiAlertCircle, FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useAuth } from '../../contexts';

interface BrukerData {
  fornavn: string;
  etternavn: string;
  epost: string;
  telefon: string;
  adresse: string;
  postnummer: string;
  poststed: string;
}

interface PassordKrav {
  lengde: boolean;
  smaBokstaver: boolean;
  storeBokstaver: boolean;
  tall: boolean;
  spesialtegn: boolean;
}

export default function Brukerinnstillinger() {
  const { bruker } = useAuth();
  const [brukerData, setBrukerData] = useState<BrukerData>({
    fornavn: '',
    etternavn: '',
    epost: '',
    telefon: '',
    adresse: '',
    postnummer: '',
    poststed: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [gammeltPassord, setGammeltPassord] = useState('');
  const [nyttPassord, setNyttPassord] = useState('');
  const [bekreftPassord, setBekreftPassord] = useState('');
  const [showGammelt, setShowGammelt] = useState(false);
  const [showNytt, setShowNytt] = useState(false);
  const [showBekreft, setShowBekreft] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    hentBrukerdata();
  }, []);

  const hentBrukerdata = async () => {
    try {
      const response = await api.get('/profile');
      const data = response.data;
      
      const brukerInfo: BrukerData = {
        fornavn: data.navn?.split(' ')[0] || '',
        etternavn: data.navn?.split(' ').slice(1).join(' ') || '',
        epost: data.epost || '',
        telefon: data.telefon || '',
        adresse: data.adresse || '',
        postnummer: data.postnummer || '',
        poststed: data.poststed || ''
      };
      
      setBrukerData(brukerInfo);
    } catch (error) {
      toast.error('Kunne ikke hente brukerdata');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof BrukerData, value: string) => {
    setBrukerData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const sjekkPassordKrav = (passord: string): PassordKrav => {
    return {
      lengde: passord.length >= 8,
      smaBokstaver: /[a-z]/.test(passord),
      storeBokstaver: /[A-Z]/.test(passord),
      tall: /[0-9]/.test(passord),
      spesialtegn: /[!@#$%^&*(),.?":{}|<>]/.test(passord)
    };
  };

  const erPassordGyldig = (passord: string): boolean => {
    const krav = sjekkPassordKrav(passord);
    return Object.values(krav).every(k => k);
  };

  const lagreBrukerdata = async () => {
    setSaving(true);
    try {
      await api.put(`/ansatt/${bruker?.id}`, {
        fornavn: brukerData.fornavn,
        etternavn: brukerData.etternavn,
        epost: brukerData.epost,
        telefon: brukerData.telefon,
        adresse: brukerData.adresse,
        postnummer: brukerData.postnummer,
        poststed: brukerData.poststed
      });
      toast.success('Brukerdata oppdatert');
      setHasChanges(false);
    } catch (error) {
      toast.error('Kunne ikke lagre brukerdata');
    } finally {
      setSaving(false);
    }
  };

  const endrePassord = async () => {
    if (!gammeltPassord || !nyttPassord || !bekreftPassord) {
      toast.error('Fyll ut alle feltene');
      return;
    }

    if (nyttPassord !== bekreftPassord) {
      toast.error('Passordene stemmer ikke overens');
      return;
    }

    if (!erPassordGyldig(nyttPassord)) {
      toast.error('Nytt passord oppfyller ikke kravene');
      return;
    }

    setChangingPassword(true);
    try {
      await api.post('/change-password', {
        gammeltPassord,
        nyttPassord
      });
      
      toast.success('Passord endret');
      setShowPasswordChange(false);
      setGammeltPassord('');
      setNyttPassord('');
      setBekreftPassord('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Kunne ikke endre passord');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const passordKrav = sjekkPassordKrav(nyttPassord);

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg shadow">
        <div className="px-2 py-1 border-b border-gray-200">
          <div className="flex items-center">
            <FiUser className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold">Brukerinnstillinger</h2>
          </div>
        </div>

        <div className="px-2 py-1 cards-spacing-vertical">
          {/* Personlig informasjon */}
          <div>
            <h3 className="text-lg font-medium mb-4">Personlig informasjon</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fornavn
                </label>
                <input
                  type="text"
                  value={brukerData.fornavn}
                  onChange={(e) => handleChange('fornavn', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etternavn
                </label>
                <input
                  type="text"
                  value={brukerData.etternavn}
                  onChange={(e) => handleChange('etternavn', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-post
                </label>
                <input
                  type="email"
                  value={brukerData.epost}
                  onChange={(e) => handleChange('epost', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={brukerData.telefon}
                  onChange={(e) => handleChange('telefon', e.target.value)}
                  placeholder="123 45 678"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Adresse</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 cards-spacing-grid">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gateadresse
                </label>
                <input
                  type="text"
                  value={brukerData.adresse}
                  onChange={(e) => handleChange('adresse', e.target.value)}
                  placeholder="Gatenavn og nummer"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postnummer
                </label>
                <input
                  type="text"
                  value={brukerData.postnummer}
                  onChange={(e) => handleChange('postnummer', e.target.value)}
                  placeholder="0000"
                  maxLength={4}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poststed
                </label>
                <input
                  type="text"
                  value={brukerData.poststed}
                  onChange={(e) => handleChange('poststed', e.target.value)}
                  placeholder="Poststed"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Lagre brukerdata */}
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
                onClick={lagreBrukerdata}
                disabled={!hasChanges || saving}
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

          {/* Passordbytte */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium flex items-center">
                <FiLock className="w-5 h-5 mr-2 text-gray-600" />
                Sikkerhet
              </h3>
              {!showPasswordChange && (
                <button
                  onClick={() => setShowPasswordChange(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Endre passord
                </button>
              )}
            </div>

            {showPasswordChange && (
              <div className="cards-spacing-vertical bg-gray-50 px-2 py-1 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nåværende passord
                  </label>
                  <div className="relative">
                    <input
                      type={showGammelt ? 'text' : 'password'}
                      value={gammeltPassord}
                      onChange={(e) => setGammeltPassord(e.target.value)}
                      className="w-full px-2 py-1 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGammelt(!showGammelt)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showGammelt ? <FiEyeOff className="w-4 h-4 text-gray-400" /> : <FiEye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nytt passord
                  </label>
                  <div className="relative">
                    <input
                      type={showNytt ? 'text' : 'password'}
                      value={nyttPassord}
                      onChange={(e) => setNyttPassord(e.target.value)}
                      className="w-full px-2 py-1 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNytt(!showNytt)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showNytt ? <FiEyeOff className="w-4 h-4 text-gray-400" /> : <FiEye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                  
                  {/* Passordkrav */}
                  {nyttPassord && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-medium text-gray-700">Passordkrav:</p>
                      <div className="grid grid-cols-2 gap-1">
                        <div className={`text-xs flex items-center ${passordKrav.lengde ? 'text-green-600' : 'text-gray-400'}`}>
                          <FiCheck className={`w-3 h-3 mr-1 ${passordKrav.lengde ? '' : 'invisible'}`} />
                          Minst 8 tegn
                        </div>
                        <div className={`text-xs flex items-center ${passordKrav.storeBokstaver ? 'text-green-600' : 'text-gray-400'}`}>
                          <FiCheck className={`w-3 h-3 mr-1 ${passordKrav.storeBokstaver ? '' : 'invisible'}`} />
                          Stor bokstav
                        </div>
                        <div className={`text-xs flex items-center ${passordKrav.smaBokstaver ? 'text-green-600' : 'text-gray-400'}`}>
                          <FiCheck className={`w-3 h-3 mr-1 ${passordKrav.smaBokstaver ? '' : 'invisible'}`} />
                          Liten bokstav
                        </div>
                        <div className={`text-xs flex items-center ${passordKrav.tall ? 'text-green-600' : 'text-gray-400'}`}>
                          <FiCheck className={`w-3 h-3 mr-1 ${passordKrav.tall ? '' : 'invisible'}`} />
                          Tall
                        </div>
                        <div className={`text-xs flex items-center ${passordKrav.spesialtegn ? 'text-green-600' : 'text-gray-400'}`}>
                          <FiCheck className={`w-3 h-3 mr-1 ${passordKrav.spesialtegn ? '' : 'invisible'}`} />
                          Spesialtegn
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bekreft nytt passord
                  </label>
                  <div className="relative">
                    <input
                      type={showBekreft ? 'text' : 'password'}
                      value={bekreftPassord}
                      onChange={(e) => setBekreftPassord(e.target.value)}
                      className="w-full px-2 py-1 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBekreft(!showBekreft)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showBekreft ? <FiEyeOff className="w-4 h-4 text-gray-400" /> : <FiEye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                  {bekreftPassord && nyttPassord !== bekreftPassord && (
                    <p className="text-xs text-red-600 mt-1">Passordene stemmer ikke overens</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowPasswordChange(false);
                      setGammeltPassord('');
                      setNyttPassord('');
                      setBekreftPassord('');
                    }}
                    className="px-2 py-1 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={endrePassord}
                    disabled={changingPassword || !gammeltPassord || !nyttPassord || !bekreftPassord || !erPassordGyldig(nyttPassord) || nyttPassord !== bekreftPassord}
                    className="flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
                  >
                    {changingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Endrer...
                      </>
                    ) : (
                      <>
                        <FiLock className="w-4 h-4 mr-2" />
                        Endre passord
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 