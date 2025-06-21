import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
  CalendarDaysIcon,
  TagIcon,
  UserIcon,
  BuildingOfficeIcon,
  BookmarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

export interface FilterOption {
  id: string;
  label: string;
  value: any;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'dateRange' | 'boolean' | 'number' | 'tags';
  options?: FilterOption[];
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  defaultValue?: any;
  min?: number;
  max?: number;
}

export interface SearchConfig {
  placeholder?: string;
  fields?: string[];
  debounceMs?: number;
  minChars?: number;
}

interface SearchAndFilterProps {
  searchConfig?: SearchConfig;
  filterConfigs?: FilterConfig[];
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  className?: string;
  compact?: boolean;
  showClearAll?: boolean;
  activeFiltersCount?: number;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchConfig = {},
  filterConfigs = [],
  onSearch,
  onFilter,
  className = '',
  compact = false,
  showClearAll = true,
  activeFiltersCount = 0
}) => {
  const { actualTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    placeholder = 'Søk...',
    debounceMs = 300,
    minChars = 1
  } = searchConfig;

  // Initialize filters with default values
  useEffect(() => {
    const initialFilters: Record<string, any> = {};
    filterConfigs.forEach(config => {
      if (config.defaultValue !== undefined) {
        initialFilters[config.id] = config.defaultValue;
      }
    });
    setFilters(initialFilters);
  }, [filterConfigs]);

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length >= minChars || searchQuery.length === 0) {
      searchTimeoutRef.current = setTimeout(() => {
        onSearch?.(searchQuery);
      }, debounceMs);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, onSearch, debounceMs, minChars]);

  // Handle filter changes
  const handleFilterChange = (filterId: string, value: any) => {
    const newFilters = { ...filters, [filterId]: value };
    
    // Remove empty values
    if (value === '' || value === null || value === undefined || 
        (Array.isArray(value) && value.length === 0)) {
      delete newFilters[filterId];
    }

    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({});
    setSearchQuery('');
    onFilter?.({});
    onSearch?.('');
  };

  // Close filter dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Render filter input based on type
  const renderFilterInput = (config: FilterConfig) => {
    const value = filters[config.id];

    switch (config.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFilterChange(config.id, e.target.value)}
            placeholder={config.placeholder}
            className={`w-full px-3 py-2 text-sm border rounded-md transition-colors ${
              actualTheme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFilterChange(config.id, e.target.value)}
            className={`w-full px-3 py-2 text-sm border rounded-md transition-colors ${
              actualTheme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-200'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Alle</option>
            {config.options?.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label} {option.count !== undefined && `(${option.count})`}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-6 max-h-48 overflow-y-auto">
            {config.options?.map((option) => (
              <label key={option.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter(v => v !== option.value);
                    handleFilterChange(config.id, newValues);
                  }}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${
                    actualTheme === 'dark' ? 'bg-gray-700 border-gray-600' : ''
                  }`}
                />
                <span className={`text-sm ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {option.label} {option.count !== undefined && `(${option.count})`}
                </span>
              </label>
            ))}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleFilterChange(config.id, e.target.value)}
            className={`w-full px-3 py-2 text-sm border rounded-md transition-colors ${
              actualTheme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-200'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        );

      case 'dateRange':
        const dateRange = value || {};
        return (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={dateRange.from || ''}
              onChange={(e) => handleFilterChange(config.id, { ...dateRange, from: e.target.value })}
              placeholder="Fra"
              className={`w-full px-3 py-2 text-sm border rounded-md transition-colors ${
                actualTheme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-gray-200'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <input
              type="date"
              value={dateRange.to || ''}
              onChange={(e) => handleFilterChange(config.id, { ...dateRange, to: e.target.value })}
              placeholder="Til"
              className={`w-full px-3 py-2 text-sm border rounded-md transition-colors ${
                actualTheme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-gray-200'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleFilterChange(config.id, Number(e.target.value) || '')}
            placeholder={config.placeholder}
            min={config.min}
            max={config.max}
            className={`w-full px-3 py-2 text-sm border rounded-md transition-colors ${
              actualTheme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name={config.id}
                checked={value === true}
                onChange={() => handleFilterChange(config.id, true)}
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 ${
                  actualTheme === 'dark' ? 'bg-gray-700 border-gray-600' : ''
                }`}
              />
              <span className={`text-sm ${
                actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Ja</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name={config.id}
                checked={value === false}
                onChange={() => handleFilterChange(config.id, false)}
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 ${
                  actualTheme === 'dark' ? 'bg-gray-700 border-gray-600' : ''
                }`}
              />
              <span className={`text-sm ${
                actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Nei</span>
            </label>
            <button
              onClick={() => handleFilterChange(config.id, undefined)}
              className={`text-sm underline ${
                actualTheme === 'dark' 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              Alle
            </button>
          </div>
        );

      case 'tags':
        const selectedTags = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-1">
              {selectedTags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    actualTheme === 'dark'
                      ? 'bg-blue-800 text-blue-200'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {tag}
                  <button
                    onClick={() => {
                      const newTags = selectedTags.filter((t: string) => t !== tag);
                      handleFilterChange(config.id, newTags);
                    }}
                    className="ml-1 hover:bg-blue-600 rounded-full p-0.5"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {config.options?.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    if (!selectedTags.includes(option.value)) {
                      handleFilterChange(config.id, [...selectedTags, option.value]);
                    }
                  }}
                  disabled={selectedTags.includes(option.value)}
                  className={`text-left px-2 py-1 text-xs rounded transition-colors disabled:opacity-50 ${
                    actualTheme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || searchQuery.length > 0;

  return (
    <div className={`cards-spacing-vertical ${className}`}>
      {/* Search and filter toggle */}
      <div className="flex items-center space-x-3">
        {/* Search input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className={`h-5 w-5 ${
              actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-400'
            }`} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className={`block w-full pl-10 pr-3 py-2 border rounded-md transition-colors ${
              actualTheme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                actualTheme === 'dark' 
                  ? 'text-gray-400 hover:text-gray-200' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        {filterConfigs.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md transition-colors ${
              showFilters || activeFiltersCount > 0
                ? actualTheme === 'dark'
                  ? 'border-blue-500 bg-blue-900/20 text-blue-400'
                  : 'border-blue-500 bg-blue-50 text-blue-700'
                : actualTheme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filter
            {activeFiltersCount > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                actualTheme === 'dark'
                  ? 'bg-blue-800 text-blue-200'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {activeFiltersCount}
              </span>
            )}
          </button>
        )}

        {/* Clear all */}
        {hasActiveFilters && showClearAll && (
          <button
            onClick={clearAllFilters}
            className={`text-sm underline ${
              actualTheme === 'dark' 
                ? 'text-red-400 hover:text-red-300' 
                : 'text-red-600 hover:text-red-700'
            }`}
          >
            Fjern alle
          </button>
        )}
      </div>

      {/* Filter panels */}
      {showFilters && filterConfigs.length > 0 && (
        <div ref={filtersRef} className={`border rounded-lg p-4 ${
          actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
            {filterConfigs.map((config) => {
              const Icon = config.icon;
              const isActive = filters[config.id] !== undefined;
              
              return (
                <div key={config.id} className="space-y-6">
                  <label className={`flex items-center text-sm font-medium ${
                    isActive
                      ? actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      : actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {Icon && <Icon className="h-4 w-4 mr-2" />}
                    {config.label}
                    {isActive && (
                      <CheckIcon className="h-4 w-4 ml-auto" />
                    )}
                  </label>
                  {renderFilterInput(config)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active filters summary */}
      {hasActiveFilters && !compact && (
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-sm font-medium ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Aktive filtre:
          </span>
          
          {searchQuery && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              actualTheme === 'dark'
                ? 'bg-gray-700 text-gray-300'
                : 'bg-gray-100 text-gray-700'
            }`}>
              Søk: "{searchQuery}"
              <button
                onClick={() => setSearchQuery('')}
                className="ml-1 hover:bg-gray-600 rounded-full p-0.5"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}

          {Object.entries(filters).map(([key, value]) => {
            const config = filterConfigs.find(c => c.id === key);
            if (!config) return null;

            let displayValue = value;
            if (config.type === 'multiselect' || config.type === 'tags') {
              displayValue = Array.isArray(value) ? `${value.length} valgt` : value;
            } else if (config.type === 'dateRange' && value.from && value.to) {
              displayValue = `${value.from} - ${value.to}`;
            } else if (config.type === 'boolean') {
              displayValue = value ? 'Ja' : 'Nei';
            }

            return (
              <span
                key={key}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  actualTheme === 'dark'
                    ? 'bg-blue-800 text-blue-200'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {config.label}: {displayValue}
                <button
                  onClick={() => handleFilterChange(key, undefined)}
                  className="ml-1 hover:bg-blue-600 rounded-full p-0.5"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Quick search component for simple use cases
export const QuickSearch: React.FC<{
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ onSearch, placeholder = 'Søk...', className = '' }) => {
  return (
    <SearchAndFilter
      searchConfig={{ placeholder }}
      onSearch={onSearch}
      className={className}
      compact
    />
  );
};

// Predefined filter configurations
export const createCommonFilters = (type: 'users' | 'companies' | 'contracts' | 'students' | 'quiz'): FilterConfig[] => {
  const baseFilters: FilterConfig[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      icon: TagIcon,
      options: [
        { id: 'active', label: 'Aktiv', value: 'active' },
        { id: 'inactive', label: 'Inaktiv', value: 'inactive' },
        { id: 'pending', label: 'Venter', value: 'pending' }
      ]
    },
    {
      id: 'dateRange',
      label: 'Dato',
      type: 'dateRange',
      icon: CalendarDaysIcon
    }
  ];

  const typeSpecific: Record<string, FilterConfig[]> = {
    users: [
      {
        id: 'role',
        label: 'Rolle',
        type: 'multiselect',
        icon: UserIcon,
        options: [
          { id: 'admin', label: 'Administrator', value: 'admin' },
          { id: 'instructor', label: 'Instruktør', value: 'instructor' },
          { id: 'student', label: 'Elev', value: 'student' }
        ]
      }
    ],
    companies: [
      {
        id: 'type',
        label: 'Type',
        type: 'select',
        icon: BuildingOfficeIcon,
        options: [
          { id: 'driving_school', label: 'Trafikkskole', value: 'driving_school' },
          { id: 'company', label: 'Bedrift', value: 'company' }
        ]
      }
    ],
    contracts: [
      {
        id: 'contractType',
        label: 'Kontrakttype',
        type: 'select',
        icon: BookmarkIcon,
        options: [
          { id: 'standard', label: 'Standard', value: 'standard' },
          { id: 'premium', label: 'Premium', value: 'premium' }
        ]
      }
    ],
    students: [
      {
        id: 'category',
        label: 'Kategori',
        type: 'multiselect',
        icon: TagIcon,
        options: [
          { id: 'b', label: 'Klasse B', value: 'b' },
          { id: 'be', label: 'Klasse BE', value: 'be' },
          { id: 'c', label: 'Klasse C', value: 'c' }
        ]
      }
    ],
    quiz: [
      {
        id: 'difficulty',
        label: 'Vanskelighetsgrad',
        type: 'select',
        icon: AdjustmentsHorizontalIcon,
        options: [
          { id: 'easy', label: 'Lett', value: 'easy' },
          { id: 'medium', label: 'Middels', value: 'medium' },
          { id: 'hard', label: 'Vanskelig', value: 'hard' }
        ]
      }
    ]
  };

  return [...baseFilters, ...(typeSpecific[type] || [])];
};

export default SearchAndFilter; 