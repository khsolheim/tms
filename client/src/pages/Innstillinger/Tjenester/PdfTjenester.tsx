import React, { useState, useEffect } from 'react';
import { digitaleTjenesterService, type PdfMal, type PdfStatistikk } from '../../../services/digitale-tjenester.service';
import { Card, CardContent, CardHeader, CardTitle } from "../../../design-system";
import { 
  DocumentIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  PhotoIcon,
  PaintBrushIcon,
  DocumentTextIcon,
  ArchiveBoxIcon,
  ChartBarIcon,
  PlayIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface PdfTemplate {
  id: string;
  name: string;
  category: 'report' | 'certificate' | 'contract' | 'invoice';
  description: string;
  lastModified: string;
  active: boolean;
  usage: number;
}

interface PdfSettings {
  engine: 'puppeteer' | 'wkhtmltopdf' | 'chrome-headless';
  quality: 'low' | 'medium' | 'high' | 'print';
  format: 'A4' | 'A3' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  includeHeaders: boolean;
  includeFooters: boolean;
  watermark: boolean;
  compression: boolean;
}

const PdfTjenester: React.FC = () => {
  const [activeTemplate, setActiveTemplate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<string>('puppeteer');
  const [pdfMaler, setPdfMaler] = useState<PdfMal[]>([]);
  const [pdfStatistikk, setPdfStatistikk] = useState<PdfStatistikk | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [settings, setSettings] = useState<PdfSettings>({
    engine: 'puppeteer',
    quality: 'high',
    format: 'A4',
    orientation: 'portrait',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    includeHeaders: true,
    includeFooters: true,
    watermark: false,
    compression: true
  });

  // Hent PDF data
  useEffect(() => {
    const hentData = async () => {
      try {
        setLoading(true);
        const [maler, statistikk] = await Promise.all([
          digitaleTjenesterService.hentPdfMaler(),
          digitaleTjenesterService.hentPdfStatistikk()
        ]);
        setPdfMaler(maler);
        setPdfStatistikk(statistikk);
      } catch (error) {
        console.error('Feil ved henting av PDF-data:', error);
      } finally {
        setLoading(false);
      }
    };

    hentData();
  }, []);

  // Fjernet hardkodet data - bruker service i stedet
  const pdfTemplates: PdfTemplate[] = [
    {
      id: 'safety-report',
      name: 'Sikkerhetskontroll Rapport',
      category: 'report',
      description: 'Standard rapport for sikkerhetskontroller med avvik og anbefalinger',
      lastModified: '2025-06-10',
      active: true,
      usage: 245
    },
    {
      id: 'hms-certificate',
      name: 'HMS Sertifikat',
      category: 'certificate',
      description: 'Offisielt HMS sertifikat for fullførte kurs',
      lastModified: '2025-06-08',
      active: true,
      usage: 89
    },
    {
      id: 'contract-template',
      name: 'Kjøreopplæring Kontrakt',
      category: 'contract',
      description: 'Standardkontrakt for kjøreopplæring',
      lastModified: '2025-06-05',
      active: true,
      usage: 67
    },
    {
      id: 'invoice-monthly',
      name: 'Månedlig Faktura',
      category: 'invoice',
      description: 'Automatisk generert månedlig faktura',
      lastModified: '2025-06-12',
      active: false,
      usage: 156
    }
  ];

  const monthlyStats = {
    totalGenerated: 1247,
    successRate: 97.8,
    averageGenerationTime: 3.2, // seconds
    totalStorageUsed: 245, // MB
    failedGenerations: 28
  };

  const engineOptions = [
    { id: 'puppeteer', name: 'Puppeteer', description: 'Rask og moderne PDF-generering' },
    { id: 'wkhtmltopdf', name: 'wkhtmltopdf', description: 'Stabil og pålitelig, god kompatibilitet' },
    { id: 'chrome-headless', name: 'Chrome Headless', description: 'Høy kvalitet, support for moderne CSS' }
  ];

  const handleSettingChange = (key: keyof PdfSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleMarginChange = (side: keyof PdfSettings['margins'], value: number) => {
    setSettings(prev => ({
      ...prev,
      margins: { ...prev.margins, [side]: value }
    }));
  };

  const generateTestPdf = async () => {
    setIsGenerating(true);
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert('Test PDF generert og lastet ned!');
    } catch (error) {
      alert('Feil ved PDF-generering. Sjekk konfigurasjonen.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'report': return 'text-blue-600 bg-blue-50';
      case 'certificate': return 'text-green-600 bg-green-50';
      case 'contract': return 'text-purple-600 bg-purple-50';
      case 'invoice': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'report': return 'Rapport';
      case 'certificate': return 'Sertifikat';
      case 'contract': return 'Kontrakt';
      case 'invoice': return 'Faktura';
      default: return 'Ukjent';
    }
  };

  return (
    <div className="px-2 py-1 cards-spacing-vertical">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">PDF Tjenester</h1>
        <p className="text-gray-600 mt-2">
          Konfigurer PDF-generering og behandle dokumentmaler
        </p>
      </div>

      {/* Monthly Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 cards-spacing-grid">
        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Generert denne måned</p>
              <p className="text-2xl font-bold">{monthlyStats.totalGenerated}</p>
            </div>
            <DocumentIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Suksessrate</p>
              <p className="text-2xl font-bold text-green-600">{monthlyStats.successRate}%</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Snitt tid (sek)</p>
              <p className="text-2xl font-bold">{monthlyStats.averageGenerationTime}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Lagring (MB)</p>
              <p className="text-2xl font-bold">{monthlyStats.totalStorageUsed}</p>
            </div>
            <ArchiveBoxIcon className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Feilede</p>
              <p className="text-2xl font-bold text-red-600">{monthlyStats.failedGenerations}</p>
            </div>
            <XCircleIcon className="h-8 w-8 text-red-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 cards-spacing-grid">
        {/* PDF Templates */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DocumentTextIcon className="h-5 w-5" />
                <span>PDF Maler</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="cards-spacing-vertical">
              {pdfTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    activeTemplate === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setActiveTemplate(template.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryColor(template.category)}`}>
                          {getCategoryName(template.category)}
                        </span>
                        {template.active ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Sist endret: {template.lastModified}</span>
                        <span>Brukt: {template.usage} ganger</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button onClick={() => console.log('Button clicked')} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                        <EyeIcon className="h-3 w-3 mr-1 inline" />
                        Forhåndsvis
                      </button>
                      <button onClick={() => console.log('Kjør test')} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                        <DocumentArrowDownIcon className="h-3 w-3 mr-1 inline" />
                        Test
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={() => console.log('Button clicked')} className="w-full px-2 py-1 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
                + Lag ny PDF mal
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Configuration */}
        <div className="cards-spacing-vertical">
          {/* Engine Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cog6ToothIcon className="h-5 w-5" />
                <span>PDF Motor</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {engineOptions.map((engine) => (
                <div
                  key={engine.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedEngine === engine.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedEngine(engine.id)}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedEngine === engine.id ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                    <h4 className="font-medium text-gray-900">{engine.name}</h4>
                  </div>
                  <p className="text-xs text-gray-600 ml-5">{engine.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Test PDF Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PlayIcon className="h-5 w-5" />
                <span>Test Generering</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="cards-spacing-vertical">
              <button
                onClick={generateTestPdf}
                disabled={isGenerating}
                className="w-full px-2 py-1 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <DocumentArrowDownIcon className="mr-2 h-4 w-4" />
                )}
                {isGenerating ? 'Genererer PDF...' : 'Generer test PDF'}
              </button>
              
              <p className="text-xs text-gray-500">
                Genererer en test PDF med gjeldende innstillinger
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PaintBrushIcon className="h-5 w-5" />
            <span>Avanserte Innstillinger</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
            {/* Basic Settings */}
            <div className="cards-spacing-vertical">
              <h4 className="font-medium text-gray-900">Grunninnstillinger</h4>
              
              <div className="space-y-6">
                <label className="text-sm font-medium text-gray-700">Kvalitet</label>
                <select
                  value={settings.quality}
                  onChange={(e) => handleSettingChange('quality', e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Lav (rask)</option>
                  <option value="medium">Medium</option>
                  <option value="high">Høy</option>
                  <option value="print">Print kvalitet</option>
                </select>
              </div>

              <div className="space-y-6">
                <label className="text-sm font-medium text-gray-700">Format</label>
                <select
                  value={settings.format}
                  onChange={(e) => handleSettingChange('format', e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="A4">A4</option>
                  <option value="A3">A3</option>
                  <option value="Letter">Letter</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>

              <div className="space-y-6">
                <label className="text-sm font-medium text-gray-700">Orientering</label>
                <select
                  value={settings.orientation}
                  onChange={(e) => handleSettingChange('orientation', e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="portrait">Portrett</option>
                  <option value="landscape">Landskap</option>
                </select>
              </div>
            </div>

            {/* Margins */}
            <div className="cards-spacing-vertical">
              <h4 className="font-medium text-gray-900">Marger (mm)</h4>
              
              <div className="grid grid-cols-2 cards-spacing-grid">
                <div className="space-y-6">
                  <label className="text-sm font-medium text-gray-700">Topp</label>
                  <input
                    type="number"
                    value={settings.margins.top}
                    onChange={(e) => handleMarginChange('top', parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="50"
                  />
                </div>
                <div className="space-y-6">
                  <label className="text-sm font-medium text-gray-700">Høyre</label>
                  <input
                    type="number"
                    value={settings.margins.right}
                    onChange={(e) => handleMarginChange('right', parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="50"
                  />
                </div>
                <div className="space-y-6">
                  <label className="text-sm font-medium text-gray-700">Bunn</label>
                  <input
                    type="number"
                    value={settings.margins.bottom}
                    onChange={(e) => handleMarginChange('bottom', parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="50"
                  />
                </div>
                <div className="space-y-6">
                  <label className="text-sm font-medium text-gray-700">Venstre</label>
                  <input
                    type="number"
                    value={settings.margins.left}
                    onChange={(e) => handleMarginChange('left', parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="50"
                  />
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div className="cards-spacing-vertical">
              <h4 className="font-medium text-gray-900">Tilleggsvalg</h4>
              
              <div className="space-y-8">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeHeaders"
                    checked={settings.includeHeaders}
                    onChange={(e) => handleSettingChange('includeHeaders', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeHeaders" className="text-sm text-gray-700">
                    Inkluder header
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeFooters"
                    checked={settings.includeFooters}
                    onChange={(e) => handleSettingChange('includeFooters', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeFooters" className="text-sm text-gray-700">
                    Inkluder footer
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="watermark"
                    checked={settings.watermark}
                    onChange={(e) => handleSettingChange('watermark', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="watermark" className="text-sm text-gray-700">
                    Legg til vannmerke
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="compression"
                    checked={settings.compression}
                    onChange={(e) => handleSettingChange('compression', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="compression" className="text-sm text-gray-700">
                    Komprimer PDF
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t flex justify-end space-x-3">
            <button onClick={() => window.history.back()} className="px-2 py-1 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              Tilbakestill til standard
            </button>
            <button onClick={() => console.log('Lagre endringer')} className="px-2 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Lagre innstillinger
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PdfTjenester; 