import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface ThemeOption {
  value: 'light' | 'dark' | 'system';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const ThemeToggle: React.FC = () => {
  const { theme, actualTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const themeOptions: ThemeOption[] = [
    {
      value: 'light',
      label: 'Lys',
      icon: SunIcon,
      description: 'Alltid lyst tema'
    },
    {
      value: 'dark',
      label: 'Mørk',
      icon: MoonIcon,
      description: 'Alltid mørkt tema'
    },
    {
      value: 'system',
      label: 'System',
      icon: ComputerDesktopIcon,
      description: 'Følg systeminnstillinger'
    }
  ];

  const currentOption = themeOptions.find(option => option.value === theme);
  const CurrentIcon = currentOption?.icon || SunIcon;

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

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleThemeSelect = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors
          ${actualTheme === 'dark' 
            ? 'bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-600' 
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Velg tema"
      >
        <CurrentIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{currentOption?.label}</span>
        <ChevronDownIcon 
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className={`
          absolute right-0 mt-2 w-56 rounded-md shadow-lg z-50 border
          ${actualTheme === 'dark' 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
          }
        `}>
          <div className="py-1" role="listbox">
            <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide border-b ${
              actualTheme === 'dark' 
                ? 'text-gray-400 border-gray-600' 
                : 'text-gray-500 border-gray-200'
            }`}>
              Velg tema
            </div>
            
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = theme === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleThemeSelect(option.value)}
                  className={`
                    w-full text-left px-3 py-3 text-sm transition-colors flex items-start space-x-3
                    ${isSelected 
                      ? (actualTheme === 'dark' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-50 text-blue-700')
                      : (actualTheme === 'dark' 
                          ? 'text-gray-200 hover:bg-gray-700' 
                          : 'text-gray-700 hover:bg-gray-50')
                    }
                  `}
                  role="option"
                  aria-selected={isSelected}
                >
                  <Icon className={`h-5 w-5 mt-0.5 ${
                    isSelected && actualTheme === 'light' ? 'text-blue-600' : ''
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    <div className={`text-xs ${
                      isSelected 
                        ? (actualTheme === 'dark' ? 'text-blue-200' : 'text-blue-600')
                        : (actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500')
                    }`}>
                      {option.description}
                    </div>
                  </div>
                  {isSelected && (
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                      actualTheme === 'dark' ? 'bg-blue-500' : 'bg-blue-100'
                    }`}>
                      <div className={`h-2 w-2 rounded-full ${
                        actualTheme === 'dark' ? 'bg-white' : 'bg-blue-600'
                      }`} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {theme === 'system' && (
            <div className={`px-3 py-2 text-xs border-t ${
              actualTheme === 'dark' 
                ? 'text-gray-400 border-gray-600 bg-gray-900' 
                : 'text-gray-500 border-gray-200 bg-gray-50'
            }`}>
              Følger system: <span className="font-medium">
                {actualTheme === 'dark' ? 'Mørkt' : 'Lyst'} tema
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle; 