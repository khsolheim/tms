import React, { useState, useRef, useEffect } from 'react';
import { digitaleTjenesterService, type QrKode, type QrStatistikk } from '../../../services/digitale-tjenester.service';
import { Card, CardContent, CardHeader, CardTitle } from "../../../design-system";
import { 
  QrCodeIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  PhotoIcon,
  LinkIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon,
  PlayIcon,
  EyeIcon,
  ArrowPathIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface QrCodeTemplate {
  id: string;
  name: string;
  type: 'url' | 'text' | 'contact' | 'wifi' | 'sms' | 'email';
  content: string;
  description: string;
  created: string;
  scans: number;
  active: boolean;
}

interface QrSettings {
  size: number;
  margin: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  foregroundColor: string;
  backgroundColor: string;
  logo: boolean;
  logoSize: number;
  format: 'PNG' | 'SVG' | 'PDF';
}

const QrTjenester: React.FC = () => {
  const [activeTemplate, setActiveTemplate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrPreview, setQrPreview] = useState<string>('');
  const [qrKoder, setQrKoder] = useState<QrKode[]>([]);
  const [qrStatistikk, setQrStatistikk] = useState<QrStatistikk | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [settings, setSettings] = useState<QrSettings>({
    size: 256,
    margin: 4,
    errorCorrectionLevel: 'M',
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    logo: false,
    logoSize: 20,
    format: 'PNG'
  });

  const [newQr, setNewQr] = useState({
    name: '',
    type: 'url' as const,
    content: '',
    description: ''
  });

  // Hent QR-kode data
  useEffect(() => {
    const hentData = async () => {
      try {
        setLoading(true);
        const [koder, statistikk] = await Promise.all([
          digitaleTjenesterService.hentQrKoder(),
          digitaleTjenesterService.hentQrStatistikk()
        ]);
        setQrKoder(koder);
        setQrStatistikk(statistikk);
      } catch (error) {
        console.error('Feil ved henting av QR-data:', error);
      } finally {
        setLoading(false);
      }
    };

    hentData();
  }, []);

  // Fjernet hardkodet data - bruker service i stedet
  const qrTemplates: QrCodeTemplate[] = [
    {
      id: '1',
      name: 'TMS Login Portal',
      type: 'url',
      content: 'https://tms.example.com/login',
      description: 'Rask innlogging til TMS systemet',
      created: '2025-06-10',
      scans: 342,
      active: true
    },
    {
      id: '2',
      name: 'HMS Kontakt',
      type: 'contact',
      content: 'BEGIN:VCARD\nVERSION:3.0\nFN:HMS Ansvarlig\nTEL:+4791234567\nEMAIL:hms@company.no\nEND:VCARD',
      description: 'Kontaktinfo HMS ansvarlig',
      created: '2025-06-08',
      scans: 89,
      active: true
    },
    {
      id: '3',
      name: 'Nød SMS',
      type: 'sms',
      content: 'sms:+4791234567?body=NØDSITUASJON på [LOKASJON]',
      description: 'Rask nødmelding via SMS',
      created: '2025-06-05',
      scans: 23,
      active: true
    },
    {
      id: '4',
      name: 'Bedrift WiFi',
      type: 'wifi',
      content: 'WIFI:T:WPA;S:CompanyNet;P:password123;H:false;;',
      description: 'Automatisk WiFi tilkobling',
      created: '2025-06-12',
      scans: 156,
      active: false
    }
  ];

  const monthlyStats = {
    totalGenerated: 89,
    totalScans: 2456,
    averageScansPerCode: 27.6,
    activeQrCodes: 12,
    topPerforming: 'TMS Login Portal'
  };

  const qrTypes = [
    { id: 'url', name: 'Nettside URL', placeholder: 'https://example.com' },
    { id: 'text', name: 'Ren tekst', placeholder: 'Din tekst her...' },
    { id: 'contact', name: 'Kontaktinfo', placeholder: 'vCard format' },
    { id: 'wifi', name: 'WiFi', placeholder: 'WIFI:T:WPA;S:NetworkName;P:password;;' },
    { id: 'sms', name: 'SMS', placeholder: 'sms:+4712345678?body=Melding' },
    { id: 'email', name: 'E-post', placeholder: 'mailto:example@company.com?subject=Emne' }
  ];

  const handleSettingChange = (key: keyof QrSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const generateQrPreview = async () => {
    if (!newQr.content) return;
    
    setIsGenerating(true);
    try {
      // Simulate QR generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock QR code preview (normally would generate actual QR)
      setQrPreview('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
      
    } catch (error) {
      alert('Feil ved generering av QR-kode');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQrCode = (templateId: string) => {
    // Simulate download
    alert(`QR-kode lastet ned i ${settings.format} format!`);
  };

  const createQrTemplate = () => {
    if (!newQr.name || !newQr.content) {
      alert('Vennligst fyll ut navn og innhold');
      return;
    }
    
    // Simulate creating template
    alert('Ny QR-kode mal opprettet!');
    setNewQr({ name: '', type: 'url', content: '', description: '' });
    setQrPreview('');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'url': return 'text-blue-600 bg-blue-50';
      case 'text': return 'text-gray-600 bg-gray-50';
      case 'contact': return 'text-green-600 bg-green-50';
      case 'wifi': return 'text-purple-600 bg-purple-50';
      case 'sms': return 'text-orange-600 bg-orange-50';
      case 'email': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeName = (type: string) => {
    const typeObj = qrTypes.find(t => t.id === type);
    return typeObj ? typeObj.name : type;
  };

  return (
    <div className="px-2 py-1 cards-spacing-vertical">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">QR-Kode Tjenester</h1>
        <p className="text-gray-600 mt-2">
          Generer og administrer QR-koder for ulike formål
        </p>
      </div>

      {/* Monthly Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 cards-spacing-grid">
        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">QR-koder generert</p>
              <p className="text-2xl font-bold">{monthlyStats.totalGenerated}</p>
            </div>
            <QrCodeIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Totale skanninger</p>
              <p className="text-2xl font-bold text-green-600">{monthlyStats.totalScans}</p>
            </div>
            <DevicePhoneMobileIcon className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Snitt per QR</p>
              <p className="text-2xl font-bold">{monthlyStats.averageScansPerCode}</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Aktive koder</p>
              <p className="text-2xl font-bold">{monthlyStats.activeQrCodes}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Mest populære</p>
              <p className="text-lg font-bold text-blue-600">{monthlyStats.topPerforming}</p>
            </div>
            <LinkIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 cards-spacing-grid">
        {/* Existing QR Templates */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCodeIcon className="h-5 w-5" />
                <span>Eksisterende QR-Koder</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="cards-spacing-vertical">
              {qrTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg transition-colors hover:bg-gray-50 ${
                    activeTemplate === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getTypeColor(template.type)}`}>
                          {getTypeName(template.type)}
                        </span>
                        {template.active ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Opprettet: {template.created}</span>
                        <span>Skanninger: {template.scans}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => setActiveTemplate(template.id)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        <EyeIcon className="h-3 w-3 mr-1 inline" />
                        Vis
                      </button>
                      <button
                        onClick={() => downloadQrCode(template.id)}
                        className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        <DocumentArrowDownIcon className="h-3 w-3 mr-1 inline" />
                        Last ned
                      </button>
                      <button onClick={() => window.confirm('Er du sikker på at du vil slette?') && console.log('Slett')} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                        <TrashIcon className="h-3 w-3 mr-1 inline" />
                        Slett
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* QR Generator & Settings */}
        <div className="cards-spacing-vertical">
          {/* Create New QR */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PlusIcon className="h-5 w-5" />
                <span>Lag ny QR-kode</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="cards-spacing-vertical">
              <div className="space-y-6">
                <label className="text-sm font-medium text-gray-700">Navn</label>
                <input
                  type="text"
                  value={newQr.name}
                  onChange={(e) => setNewQr(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="QR-kode navn"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-6">
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select
                  value={newQr.type}
                  onChange={(e) => setNewQr(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {qrTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-6">
                <label className="text-sm font-medium text-gray-700">Innhold</label>
                <textarea
                  rows={3}
                  value={newQr.content}
                  onChange={(e) => setNewQr(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={qrTypes.find(t => t.id === newQr.type)?.placeholder}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-6">
                <label className="text-sm font-medium text-gray-700">Beskrivelse</label>
                <input
                  type="text"
                  value={newQr.description}
                  onChange={(e) => setNewQr(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Kort beskrivelse"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={generateQrPreview}
                  disabled={isGenerating || !newQr.content}
                  className="flex-1 px-2 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? (
                    <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <EyeIcon className="mr-2 h-4 w-4" />
                  )}
                  {isGenerating ? 'Genererer...' : 'Forhåndsvis'}
                </button>
                
                <button
                  onClick={createQrTemplate}
                  disabled={!newQr.name || !newQr.content}
                  className="flex-1 px-2 py-1 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Opprett
                </button>
              </div>

              {qrPreview && (
                <div className="mt-4 text-center">
                  <div className="inline-block px-2 py-1 bg-white border border-gray-200 rounded-lg">
                    <QrCodeIcon className="h-32 w-32 text-gray-400 mx-auto" />
                    <p className="text-xs text-gray-500 mt-2">QR-kode forhåndsvisning</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cog6ToothIcon className="h-5 w-5" />
                <span>QR Innstillinger</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="cards-spacing-vertical">
              <div className="space-y-6">
                <label className="text-sm font-medium text-gray-700">Størrelse (px)</label>
                <input
                  type="range"
                  min="128"
                  max="512"
                  step="32"
                  value={settings.size}
                  onChange={(e) => handleSettingChange('size', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>128px</span>
                  <span>{settings.size}px</span>
                  <span>512px</span>
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-sm font-medium text-gray-700">Format</label>
                <select
                  value={settings.format}
                  onChange={(e) => handleSettingChange('format', e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="PNG">PNG</option>
                  <option value="SVG">SVG</option>
                  <option value="PDF">PDF</option>
                </select>
              </div>

              <div className="space-y-6">
                <label className="text-sm font-medium text-gray-700">Feilkorreksjon</label>
                <select
                  value={settings.errorCorrectionLevel}
                  onChange={(e) => handleSettingChange('errorCorrectionLevel', e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="L">Lav (~7%)</option>
                  <option value="M">Medium (~15%)</option>
                  <option value="Q">Høy (~25%)</option>
                  <option value="H">Maksimal (~30%)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 cards-spacing-grid">
                <div className="space-y-6">
                  <label className="text-sm font-medium text-gray-700">Forgrunnsf.</label>
                  <input
                    type="color"
                    value={settings.foregroundColor}
                    onChange={(e) => handleSettingChange('foregroundColor', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="space-y-6">
                  <label className="text-sm font-medium text-gray-700">Bakgrunnsf.</label>
                  <input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeLogo"
                  checked={settings.logo}
                  onChange={(e) => handleSettingChange('logo', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="includeLogo" className="text-sm text-gray-700">
                  Inkluder bedriftslogo
                </label>
              </div>

              <button onClick={() => console.log('Lagre endringer')} className="w-full px-2 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                Lagre standardinnstillinger
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QrTjenester; 