import React, { useState, useEffect } from 'react';
import { FiMail, FiSave, FiAlertCircle, FiSend, FiSettings } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../lib/api';

interface EpostSettings {
  sendKvitteringTilElev: boolean;
  sendKopiTilBedrift: boolean;
  standardAvsenderEpost: string;
  standardAvsenderNavn: string;
  varsleNyKontrakt: boolean;
  varsleStatusendring: boolean;
  varsleForfall: boolean;
  dagerForVarslingForfall: number;
}

export default function Epostinnstillinger() {
  const [settings, setSettings] = useState<EpostSettings>({
    sendKvitteringTilElev: true,
    sendKopiTilBedrift: true,
    standardAvsenderEpost: '',
    standardAvsenderNavn: '',
    varsleNyKontrakt: true,
    varsleStatusendring: true,
    varsleForfall: true,
    dagerForVarslingForfall: 7
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialSettings, setInitialSettings] = useState<EpostSettings | null>(null); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [testEpost, setTestEpost] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    hentInnstillinger();
  }, []);

  const hentInnstillinger = async () => {
    try {
      const response = await api.get('/email/settings');
      if (response.data.success && response.data.data) {
        setSettings(response.data.data);
        setInitialSettings(response.data.data);
      }
    } catch (error) {
      toast.error('Kunne ikke hente e-postinnstillinger');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof EpostSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const lagreInnstillinger = async () => {
    setSaving(true);
    try {
      await api.put('/systemconfig', settings);
      toast.success('E-postinnstillinger lagret');
      setInitialSettings(settings);
      setHasChanges(false);
    } catch (error) {
      toast.error('Kunne ikke lagre innstillinger');
    } finally {
      setSaving(false);
    }
  };

  const testEpostTilkobling = async () => {
    setTestingConnection(true);
    try {
      const response = await api.get('/email/test');
      if (response.data.success) {
        toast.success('E-postserver tilkobling vellykket');
      } else {
        toast.error(response.data.error || 'Tilkobling feilet');
      }
    } catch (error) {
      toast.error('Kunne ikke teste tilkobling');
    } finally {
      setTestingConnection(false);
    }
  };

  const sendTestEpost = async () => {
    if (!testEpost) {
      toast.error('Vennligst skriv inn en e-postadresse');
      return;
    }

    setSendingTest(true);
    try {
      const response = await api.post('/email/test-send', {
        to: testEpost,
        subject: 'Test e-post fra TMS',
        message: 'Dette er en test e-post fra TMS systemet for å verifisere at e-postkonfigurasjonen fungerer korrekt.'
      });
      
      if (response.data.success) {
        toast.success('Test e-post sendt!');
        setTestEpost('');
      } else {
        toast.error(response.data.error || 'Kunne ikke sende test e-post');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Kunne ikke sende test e-post');
    } finally {
      setSendingTest(false);
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
            <FiMail className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold">E-postinnstillinger</h2>
          </div>
        </div>

        <div className="px-2 py-1 cards-spacing-vertical">
          {/* Serverinnstillinger info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
            <div className="flex items-start">
              <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">SMTP-serverinnstillinger</p>
                <p>E-postserver konfigureres via miljøvariabler:</p>
                <ul className="list-disc list-inside mt-2">
                  <li>SMTP_HOST - E-postserver (f.eks. smtp.gmail.com)</li>
                  <li>SMTP_PORT - Port (f.eks. 587)</li>
                  <li>SMTP_USER - Brukernavn</li>
                  <li>SMTP_PASS - Passord</li>
                  <li>SMTP_FROM - Standard avsenderadresse</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Test tilkobling */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Test e-postkonfigurasjon</h3>
            
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={testEpostTilkobling}
                disabled={testingConnection}
                className="flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
              >
                <FiSettings className="w-4 h-4 mr-2" />
                {testingConnection ? 'Tester...' : 'Test servertilkobling'}
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="email"
                value={testEpost}
                onChange={(e) => setTestEpost(e.target.value)}
                placeholder="din@epost.no"
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={sendTestEpost}
                disabled={sendingTest || !testEpost}
                className="flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
              >
                <FiSend className="w-4 h-4 mr-2" />
                {sendingTest ? 'Sender...' : 'Send test e-post'}
              </button>
            </div>
          </div>

          {/* Avsenderinnstillinger */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Avsenderinnstillinger</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Standard avsendernavn
                </label>
                <input
                  type="text"
                  value={settings.standardAvsenderNavn}
                  onChange={(e) => handleChange('standardAvsenderNavn', e.target.value)}
                  placeholder="Trafikkskole AS"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Standard avsender e-post
                </label>
                <input
                  type="email"
                  value={settings.standardAvsenderEpost}
                  onChange={(e) => handleChange('standardAvsenderEpost', e.target.value)}
                  placeholder="post@trafikkskole.no"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Automatiske e-poster */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Automatiske e-poster</h3>
            
            <div className="space-y-8">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.sendKvitteringTilElev}
                  onChange={(e) => handleChange('sendKvitteringTilElev', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm">Send kvittering til elev ved kontraktopprettelse</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.sendKopiTilBedrift}
                  onChange={(e) => handleChange('sendKopiTilBedrift', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm">Send kopi til bedrift ved kontraktopprettelse</span>
              </label>
            </div>
          </div>

          {/* Varslinger */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Varslinger</h3>
            
            <div className="space-y-8">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.varsleNyKontrakt}
                  onChange={(e) => handleChange('varsleNyKontrakt', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm">Varsle ved ny kontrakt</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.varsleStatusendring}
                  onChange={(e) => handleChange('varsleStatusendring', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm">Varsle ved statusendring</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.varsleForfall}
                  onChange={(e) => handleChange('varsleForfall', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm">Varsle før forfall</span>
              </label>
              
              {settings.varsleForfall && (
                <div className="ml-7">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dager før forfall
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.dagerForVarslingForfall}
                    onChange={(e) => handleChange('dagerForVarslingForfall', parseInt(e.target.value))}
                    className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
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
        </div>
      </div>
    </div>
  );
} 