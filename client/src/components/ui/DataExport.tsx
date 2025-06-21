import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TableCellsIcon,
  DocumentChartBarIcon,
  PhotoIcon,
  ChevronDownIcon,
  CheckIcon,
  CalendarDaysIcon,
  FunnelIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

export interface ExportFormat {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  fileExtension: string;
  mimeType: string;
  supportsBulk?: boolean;
  supportsFilters?: boolean;
}

export interface ExportFilter {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'boolean';
  value: any;
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
}

interface DataExportProps {
  data: any[];
  filename?: string;
  formats?: ExportFormat[];
  filters?: ExportFilter[];
  onExport: (format: ExportFormat, data: any[], filters: Record<string, any>) => Promise<void> | void;
  className?: string;
  compact?: boolean;
  buttonText?: string;
  selectedItems?: string[];
}

const defaultFormats: ExportFormat[] = [
  {
    id: 'csv',
    label: 'CSV',
    description: 'Kommaseparerte verdier (.csv)',
    icon: TableCellsIcon,
    fileExtension: 'csv',
    mimeType: 'text/csv',
    supportsBulk: true,
    supportsFilters: true
  },
  {
    id: 'excel',
    label: 'Excel',
    description: 'Microsoft Excel ark (.xlsx)',
    icon: DocumentChartBarIcon,
    fileExtension: 'xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    supportsBulk: true,
    supportsFilters: true
  },
  {
    id: 'pdf',
    label: 'PDF',
    description: 'Portable Document Format (.pdf)',
    icon: DocumentTextIcon,
    fileExtension: 'pdf',
    mimeType: 'application/pdf',
    supportsBulk: true,
    supportsFilters: true
  },
  {
    id: 'json',
    label: 'JSON',
    description: 'JavaScript Object Notation (.json)',
    icon: DocumentTextIcon,
    fileExtension: 'json',
    mimeType: 'application/json',
    supportsBulk: true,
    supportsFilters: true
  }
];

const DataExport: React.FC<DataExportProps> = ({
  data,
  filename = 'export',
  formats = defaultFormats,
  filters = [],
  onExport,
  className = '',
  compact = false,
  buttonText = 'Eksporter',
  selectedItems = []
}) => {
  const { actualTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(formats[0]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize filter values
  useEffect(() => {
    const initialValues: Record<string, any> = {};
    filters.forEach(filter => {
      initialValues[filter.id] = filter.value ?? '';
    });
    setFilterValues(initialValues);
  }, [filters]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      const exportData = selectedItems.length > 0 
        ? data.filter((item, index) => selectedItems.includes(item.id || index.toString()))
        : data;

      await onExport(selectedFormat, exportData, filterValues);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const handleFilterChange = (filterId: string, value: any) => {
    setFilterValues(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  const renderFilterInput = (filter: ExportFilter) => {
    const baseClasses = `w-full px-3 py-2 text-sm border rounded-md transition-colors ${
      actualTheme === 'dark'
        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
    }`;

    switch (filter.type) {
      case 'text':
        return (
          <input
            type="text"
            value={filterValues[filter.id] || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            placeholder={filter.placeholder}
            className={baseClasses}
          />
        );

      case 'select':
        return (
          <select
            value={filterValues[filter.id] || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className={baseClasses}
          >
            <option value="">Velg...</option>
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={filterValues[filter.id] || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className={baseClasses}
          />
        );

      case 'dateRange':
        return (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={filterValues[`${filter.id}_from`] || ''}
              onChange={(e) => handleFilterChange(`${filter.id}_from`, e.target.value)}
              placeholder="Fra dato"
              className={baseClasses}
            />
            <input
              type="date"
              value={filterValues[`${filter.id}_to`] || ''}
              onChange={(e) => handleFilterChange(`${filter.id}_to`, e.target.value)}
              placeholder="Til dato"
              className={baseClasses}
            />
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={filterValues[filter.id] || ''}
            onChange={(e) => handleFilterChange(filter.id, Number(e.target.value))}
            placeholder={filter.placeholder}
            className={baseClasses}
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filterValues[filter.id] || false}
              onChange={(e) => handleFilterChange(filter.id, e.target.checked)}
              className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${
                actualTheme === 'dark' ? 'bg-gray-700 border-gray-600' : ''
              }`}
            />
            <span className={`text-sm ${
              actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {filter.label}
            </span>
          </label>
        );

      default:
        return null;
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleExport}
        disabled={isExporting || data.length === 0}
        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          actualTheme === 'dark'
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        } ${className}`}
      >
        <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
        {isExporting ? 'Eksporterer...' : buttonText}
      </button>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={data.length === 0}
        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          actualTheme === 'dark'
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
        {buttonText}
        {selectedItems.length > 0 && (
          <span className="ml-2 px-2 py-0.5 bg-blue-800 text-blue-100 rounded-full text-xs">
            {selectedItems.length}
          </span>
        )}
        <ChevronDownIcon className={`ml-2 h-4 w-4 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-96 rounded-lg shadow-lg z-50 border ${
          actualTheme === 'dark'
            ? 'bg-gray-800 border-gray-600'
            : 'bg-white border-gray-200'
        }`}>
          <div className="px-2 py-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-medium ${
                actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}>
                Eksporter data
              </h3>
              {selectedItems.length > 0 && (
                <span className={`text-sm ${
                  actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {selectedItems.length} elementer valgt
                </span>
              )}
            </div>

            {/* Format selection */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${
                actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Format
              </label>
              <div className="space-y-6">
                {formats.map((format) => {
                  const Icon = format.icon;
                  const isSelected = selectedFormat.id === format.id;
                  
                  return (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format)}
                      className={`w-full flex items-center p-3 rounded-md border transition-colors ${
                        isSelected
                          ? actualTheme === 'dark'
                            ? 'border-blue-500 bg-blue-900/20'
                            : 'border-blue-500 bg-blue-50'
                          : actualTheme === 'dark'
                            ? 'border-gray-600 hover:border-gray-500'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`h-5 w-5 mr-3 ${
                        isSelected
                          ? actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                          : actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      
                      <div className="flex-1 text-left">
                        <div className={`font-medium ${
                          isSelected
                            ? actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                            : actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          {format.label}
                        </div>
                        <div className={`text-xs ${
                          actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {format.description}
                        </div>
                      </div>
                      
                      {isSelected && (
                        <CheckIcon className={`h-5 w-5 ${
                          actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filters */}
            {filters.length > 0 && selectedFormat.supportsFilters && (
              <div className="mb-4">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`flex items-center text-sm font-medium mb-2 ${
                    actualTheme === 'dark' 
                      ? 'text-gray-300 hover:text-gray-200' 
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <FunnelIcon className="h-4 w-4 mr-1" />
                  Avanserte alternativer
                  <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform ${
                    showAdvanced ? 'rotate-180' : ''
                  }`} />
                </button>

                {showAdvanced && (
                  <div className="space-y-8">
                    {filters.map((filter) => (
                      <div key={filter.id}>
                        <label className={`block text-sm font-medium mb-1 ${
                          actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {filter.label}
                        </label>
                        {renderFilterInput(filter)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Export summary */}
            <div className={`p-3 rounded-md mb-4 ${
              actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className={`text-sm ${
                actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <div className="flex justify-between">
                  <span>Total elementer:</span>
                  <span className="font-medium">{data.length}</span>
                </div>
                {selectedItems.length > 0 && (
                  <div className="flex justify-between">
                    <span>Valgte elementer:</span>
                    <span className="font-medium">{selectedItems.length}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="font-medium">{selectedFormat.label}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => setIsOpen(false)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  actualTheme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Avbryt
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 px-2 py-1 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? 'Eksporterer...' : 'Eksporter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export utility functions
export const createCSV = (data: any[], headers?: string[]): string => {
  if (!data.length) return '';
  
  const keys = headers || Object.keys(data[0]);
  const csvHeaders = keys.join(',');
  const csvRows = data.map(row => 
    keys.map(key => {
      const value = row[key];
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
};

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Quick export hook for simple use cases
export const useQuickExport = () => {
  const exportToCSV = (data: any[], filename = 'export.csv') => {
    const csvContent = createCSV(data);
    downloadFile(csvContent, filename, 'text/csv');
  };

  const exportToJSON = (data: any[], filename = 'export.json') => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, filename, 'application/json');
  };

  return {
    exportToCSV,
    exportToJSON
  };
};

export default DataExport; 