/**
 * CustomReportBuilder - Verktøy for å bygge tilpassede analytics rapporter
 */

import React, { useState } from 'react';
import { FiPlus, FiMinus, FiPlay, FiDownload, FiFilter } from 'react-icons/fi';
import analyticsService from '../../services/AnalyticsService';

interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'between';
  value: any;
}

interface CustomReport {
  id: string;
  name: string;
  description: string;
  filters: ReportFilter[];
  metrics: string[];
  dimensions: string[];
  timeRange: { start: Date; end: Date };
  data: any[];
  generatedAt: Date;
}

const availableFields = [
  { value: 'eventName', label: 'Event navn' },
  { value: 'userId', label: 'Bruker ID' },
  { value: 'category', label: 'Kategori' },
  { value: 'timestamp', label: 'Tidsstempel' },
  { value: 'properties.page', label: 'Side' },
  { value: 'properties.url', label: 'URL' },
  { value: 'sessionId', label: 'Session ID' }
];

const availableMetrics = [
  { value: 'count', label: 'Antall events' },
  { value: 'unique_users', label: 'Unike brukere' },
  { value: 'average_session_duration', label: 'Gjennomsnittlig session varighet' },
  { value: 'conversion_rate', label: 'Konverteringsrate' }
];

const availableDimensions = [
  { value: 'eventName', label: 'Event navn' },
  { value: 'category', label: 'Kategori' },
  { value: 'properties.page', label: 'Side' },
  { value: 'date', label: 'Dato' },
  { value: 'hour', label: 'Time' }
];

const operators = [
  { value: 'equals', label: 'Er lik' },
  { value: 'contains', label: 'Inneholder' },
  { value: 'greater_than', label: 'Større enn' },
  { value: 'less_than', label: 'Mindre enn' },
  { value: 'in', label: 'Er i liste' },
  { value: 'between', label: 'Mellom' }
];

export const CustomReportBuilder: React.FC = () => {
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['count']);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    end: new Date()
  });
  const [report, setReport] = useState<CustomReport | null>(null);
  const [loading, setLoading] = useState(false);

  const addFilter = () => {
    setFilters([...filters, {
      field: availableFields[0].value,
      operator: 'equals',
      value: ''
    }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, updates: Partial<ReportFilter>) => {
    setFilters(filters.map((filter, i) => 
      i === index ? { ...filter, ...updates } : filter
    ));
  };

  const generateReport = async () => {
    if (!reportName) {
      alert('Vennligst oppgi et rapportnavn');
      return;
    }

    setLoading(true);
    try {
      const generatedReport = await analyticsService.generateCustomReport(
        reportName,
        reportDescription,
        filters,
        selectedMetrics,
        selectedDimensions,
        timeRange
      );
      
      setReport(generatedReport);
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Feil ved generering av rapport');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!report) return;
    
    const csv = [
      // Headers
      [...selectedDimensions, ...selectedMetrics].join(','),
      // Data rows
      ...report.data.map(row => 
        [...selectedDimensions, ...selectedMetrics]
          .map(field => row[field] || '')
          .join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name.replace(/\s+/g, '_')}_rapport.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="cards-spacing-vertical">
      {/* Report Configuration */}
      <div className="bg-white rounded-lg shadow px-2 py-1">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Lag Tilpasset Rapport</h2>
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rapportnavn *
            </label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="F.eks. Månedlig brukeranalyse"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beskrivelse
            </label>
            <input
              type="text"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Kort beskrivelse av rapporten"
            />
          </div>
        </div>

        {/* Time Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tidsperiode
          </label>
          <div className="grid grid-cols-2 cards-spacing-grid">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fra dato</label>
              <input
                type="date"
                value={timeRange.start.toISOString().split('T')[0]}
                onChange={(e) => setTimeRange({
                  ...timeRange,
                  start: new Date(e.target.value)
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Til dato</label>
              <input
                type="date"
                value={timeRange.end.toISOString().split('T')[0]}
                onChange={(e) => setTimeRange({
                  ...timeRange,
                  end: new Date(e.target.value)
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Filtre
            </label>
            <button
              onClick={addFilter}
              className="flex items-center space-x-2 px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              <FiPlus className="h-4 w-4" />
              <span>Legg til filter</span>
            </button>
          </div>
          
          {filters.map((filter, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2 px-2 py-1 bg-gray-50 rounded-lg">
              <select
                value={filter.field}
                onChange={(e) => updateFilter(index, { field: e.target.value })}
                className="px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {availableFields.map(field => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
              
              <select
                value={filter.operator}
                onChange={(e) => updateFilter(index, { operator: e.target.value as any })}
                className="px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {operators.map(op => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
              
              <input
                type="text"
                value={filter.value}
                onChange={(e) => updateFilter(index, { value: e.target.value })}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Verdi"
              />
              
              <button
                onClick={() => removeFilter(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
              >
                <FiMinus className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Metrics Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Metrics å inkludere
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availableMetrics.map(metric => (
              <label key={metric.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedMetrics.includes(metric.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMetrics([...selectedMetrics, metric.value]);
                    } else {
                      setSelectedMetrics(selectedMetrics.filter(m => m !== metric.value));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{metric.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Dimensions Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dimensjoner (grouping)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availableDimensions.map(dimension => (
              <label key={dimension.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedDimensions.includes(dimension.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDimensions([...selectedDimensions, dimension.value]);
                    } else {
                      setSelectedDimensions(selectedDimensions.filter(d => d !== dimension.value));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{dimension.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end">
          <button
            onClick={generateReport}
            disabled={loading || !reportName}
            className="flex items-center space-x-2 px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlay className="h-4 w-4" />
            <span>{loading ? 'Genererer...' : 'Generer Rapport'}</span>
          </button>
        </div>
      </div>

      {/* Report Results */}
      {report && (
        <div className="bg-white rounded-lg shadow px-2 py-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
              <p className="text-sm text-gray-600">
                Generert {report.generatedAt.toLocaleDateString('nb-NO')} kl {report.generatedAt.toLocaleTimeString('nb-NO')}
              </p>
            </div>
            
            <button
              onClick={exportReport}
              className="flex items-center space-x-2 px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <FiDownload className="h-4 w-4" />
              <span>Eksporter CSV</span>
            </button>
          </div>
          
          {report.description && (
            <p className="text-gray-700 mb-4">{report.description}</p>
          )}

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[...selectedDimensions, ...selectedMetrics].map(field => (
                    <th key={field} className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {availableFields.find(f => f.value === field)?.label || 
                       availableMetrics.find(m => m.value === field)?.label || 
                       availableDimensions.find(d => d.value === field)?.label || 
                       field}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.data.slice(0, 50).map((row, index) => (
                  <tr key={index}>
                    {[...selectedDimensions, ...selectedMetrics].map(field => (
                      <td key={field} className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                        {typeof row[field] === 'number' 
                          ? row[field].toLocaleString('nb-NO')
                          : row[field] || '-'
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {report.data.length > 50 && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Viser 50 av {report.data.length} rader. Eksporter for å se alle data.
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 