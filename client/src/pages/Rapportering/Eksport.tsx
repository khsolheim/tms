import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import SearchAndFilter, { FilterConfig } from '../../components/ui/SearchAndFilter';
import { rapporteringService, ExportTemplate as ServiceExportTemplate, ExportHistory as ServiceExportHistory } from '../../services/rapportering.service';
import {
  DocumentArrowDownIcon,
  DocumentTextIcon,
  TableCellsIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FolderIcon,
  ArrowDownTrayIcon,
  CloudArrowDownIcon,
  DocumentChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'financial' | 'operational' | 'customer' | 'personal' | 'custom';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  icon: React.ElementType;
  lastUsed?: Date;
  size?: string;
}

interface ExportHistory {
  id: string;
  template: string;
  format: string;
  createdAt: Date;
  status: 'completed' | 'failed' | 'processing';
  fileSize: string;
  downloadCount: number;
}

const Eksport: React.FC = () => {
  const { actualTheme } = useTheme();
  const [exportTemplates, setExportTemplates] = useState<ExportTemplate[]>([]);
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'csv' | 'json'>('pdf');
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const filterConfigs: FilterConfig[] = [
    {
      id: 'type',
      label: 'Rapporttype',
      type: 'select',
      options: [
        { id: 'all', value: 'all', label: 'Alle typer' },
        { id: 'financial', value: 'financial', label: 'Finansielle' },
        { id: 'operational', value: 'operational', label: 'Operasjonelle' },
        { id: 'customer', value: 'customer', label: 'Kundeanalyse' },
        { id: 'personal', value: 'personal', label: 'Personalanalyse' },
        { id: 'custom', value: 'custom', label: 'Egendefinerte' }
      ]
    },
    {
      id: 'format',
      label: 'Format',
      type: 'select',
      options: [
        { id: 'all', value: 'all', label: 'Alle formater' },
        { id: 'pdf', value: 'pdf', label: 'PDF' },
        { id: 'excel', value: 'excel', label: 'Excel' },
        { id: 'csv', value: 'csv', label: 'CSV' },
        { id: 'json', value: 'json', label: 'JSON' }
      ]
    },
    {
      id: 'period',
      label: 'Periode',
      type: 'select',
      options: [
        { id: 'current', value: 'current', label: 'Inneværende måned' },
        { id: 'last', value: 'last', label: 'Forrige måned' },
        { id: 'quarter', value: 'quarter', label: 'Dette kvartalet' },
        { id: 'year', value: 'year', label: 'Dette året' },
        { id: 'custom', value: 'custom', label: 'Egendefinert' }
      ]
    }
  ];

  useEffect(() => {
    lastEksportData();
  }, []);

  const lastEksportData = async () => {
    try {
      setLoading(true);
      
      // Bruker mock data for utvikling
      const [maler, historikk] = await Promise.all([
        rapporteringService.hentEksportMalerMock(),
        rapporteringService.hentEksportHistorikkMock()
      ]);
      
      // Konverter service data til lokal format
      const convertedTemplates: ExportTemplate[] = maler.map(mal => ({
        id: mal.id,
        name: mal.navn,
        description: mal.beskrivelse,
        type: mal.type.toLowerCase() as 'financial' | 'operational' | 'customer' | 'personal' | 'custom',
        format: mal.format.toLowerCase() as 'pdf' | 'excel' | 'csv' | 'json',
        icon: getIconForType(mal.type),
        lastUsed: mal.sistBrukt ? new Date(mal.sistBrukt) : undefined,
        size: '2.1 MB'
      }));

      const convertedHistory: ExportHistory[] = historikk.map(item => ({
        id: item.id,
        template: item.templateNavn,
        format: item.format,
        createdAt: new Date(item.opprettet),
        status: item.status === 'VELLYKKET' ? 'completed' : 
                item.status === 'FEILET' ? 'failed' : 'processing',
        fileSize: item.filstørrelse ? formatFileSize(item.filstørrelse) : '0 MB',
        downloadCount: Math.floor(Math.random() * 10)
      }));
      
      setExportTemplates(convertedTemplates);
      setExportHistory(convertedHistory);
    } catch (error) {
      console.error('Feil ved lasting av eksport-data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'FINANSIELL': return DocumentTextIcon;
      case 'OPERASJONELL': return ChartBarIcon;
      case 'ELEV': return DocumentChartBarIcon;
      case 'INSTRUKTØR': return TableCellsIcon;
      default: return DocumentArrowDownIcon;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 MB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'financial':
        return 'text-green-600 bg-green-100';
      case 'operational':
        return 'text-blue-600 bg-blue-100';
      case 'customer':
        return 'text-purple-600 bg-purple-100';
      case 'personal':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleExport = async (templateId: string, format: string) => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      console.log(`Eksporterer mal ${templateId} som ${format}`);
      setIsExporting(false);
      
      // Add to history (mock)
      const newExport: ExportHistory = {
        id: `exp-${Date.now()}`,
        template: exportTemplates.find(t => t.id === templateId)?.name || 'Ukjent',
        format: format.toUpperCase(),
        createdAt: new Date(),
        status: 'completed',
        fileSize: '2.1 MB',
        downloadCount: 0
      };
      
      setExportHistory([newExport, ...exportHistory]);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="cards-spacing-vertical">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${
            actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
          }`}>
            Rapport Eksport
          </h1>
          <p className={`text-sm mt-1 ${
            actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Eksporter rapporter i ulike formater og lag egendefinerte maler
          </p>
        </div>

        <button
          onClick={() => console.log('Opprett ny mal')}
          className="flex items-center px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <DocumentTextIcon className="h-4 w-4 mr-2" />
          Ny mal
        </button>
      </div>

      {/* Filters */}
      <SearchAndFilter
        searchConfig={{
          placeholder: 'Søk i eksportmaler...',
          fields: ['name', 'description']
        }}
        filterConfigs={filterConfigs}
        onSearch={(query) => console.log('Søk:', query)}
        onFilter={(filters) => console.log('Filtrer:', filters)}
      />

      {/* Export Templates Grid */}
      <div>
        <h2 className={`text-lg font-medium mb-4 ${
          actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
        }`}>
          Tilgjengelige Maler
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
          {exportTemplates.map((template) => {
            const Icon = template.icon;
            
            return (
              <div key={template.id} className={`border rounded-lg p-6 ${
                actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Icon className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <h3 className={`font-medium ${
                        actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        {template.name}
                      </h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        actualTheme === 'dark' ? getTypeColor(template.type).replace('bg-', 'bg-opacity-20 ') : getTypeColor(template.type)
                      }`}>
                        {template.type}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className={`text-sm mb-4 ${
                  actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {template.description}
                </p>
                
                <div className="flex items-center justify-between text-xs mb-4">
                  {template.lastUsed && (
                    <span className={actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
                      Sist brukt: {template.lastUsed.toLocaleDateString('no-NO')}
                    </span>
                  )}
                  {template.size && (
                    <span className={actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
                      {template.size}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    className={`flex-1 px-2 py-1 border rounded text-sm ${
                      actualTheme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-gray-200'
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as any)}
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                  
                  <button
                    onClick={() => handleExport(template.id, selectedFormat)}
                    disabled={isExporting}
                    className="flex items-center px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isExporting ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                    ) : (
                      <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                    )}
                    Eksporter
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export History */}
      <div>
        <h2 className={`text-lg font-medium mb-4 ${
          actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
        }`}>
          Eksporthistorikk
        </h2>
        
        <div className={`border rounded-lg overflow-hidden ${
          actualTheme === 'dark' ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={actualTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Mal
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Format
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Opprettet
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Størrelse
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Nedlastinger
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${actualTheme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
              {exportHistory.map((item) => (
                <tr key={item.id} className={actualTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                  <td className="px-2 py-1 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      {item.template}
                    </div>
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      actualTheme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.format}
                    </span>
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap">
                    <div className={`text-sm ${
                      actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {item.createdAt.toLocaleDateString('no-NO')}
                    </div>
                    <div className={`text-xs ${
                      actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {item.createdAt.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      actualTheme === 'dark' ? getStatusColor(item.status).replace('bg-', 'bg-opacity-20 ') : getStatusColor(item.status)
                    }`}>
                      {item.status === 'completed' ? 'Fullført' : 
                       item.status === 'failed' ? 'Feilet' : 'Behandler'}
                    </span>
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap">
                    <div className={`text-sm ${
                      actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {item.fileSize}
                    </div>
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap">
                    <div className={`text-sm ${
                      actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {item.downloadCount}
                    </div>
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {item.status === 'completed' && (
                        <button
                          onClick={() => console.log('Last ned', item.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => console.log('Vis detaljer', item.id)}
                        className={`${actualTheme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'}`}
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`border rounded-lg p-4 ${
        actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <h3 className={`text-lg font-medium mb-3 ${
          actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
        }`}>
          Hurtighandlinger
        </h3>
        
        <div className="flex flex-wrap cards-spacing-grid">
          <button
            onClick={() => console.log('Eksporter alle data')}
            className="flex items-center px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <CloudArrowDownIcon className="h-4 w-4 mr-2" />
            Eksporter alle data
          </button>
          
          <button
            onClick={() => console.log('Planlegg eksport')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              actualTheme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            <CalendarDaysIcon className="h-4 w-4 mr-2" />
            Planlegg eksport
          </button>
          
          <button
            onClick={() => console.log('Eksportinnstillinger')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              actualTheme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            <CogIcon className="h-4 w-4 mr-2" />
            Innstillinger
          </button>
        </div>
      </div>
    </div>
  );
};

export default Eksport; 