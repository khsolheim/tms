import React from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabel = false,
  size = 'md'
}) => {
  const { theme, isDark, toggleTheme } = useDarkMode();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return (
          <svg 
            className={sizeClasses[size]} 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-label="Light mode"
          >
            <path 
              fillRule="evenodd" 
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" 
              clipRule="evenodd" 
            />
          </svg>
        );
      case 'dark':
        return (
          <svg 
            className={sizeClasses[size]} 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-label="Dark mode"
          >
            <path 
              d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" 
            />
          </svg>
        );
      case 'system':
      default:
        return (
          <svg 
            className={sizeClasses[size]} 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-label="System theme"
          >
            <path 
              fillRule="evenodd" 
              d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7l.159-.636L9.297 11h1.406l.367.364L11.229 12H8.77z" 
              clipRule="evenodd" 
            />
          </svg>
        );
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Lys';
      case 'dark':
        return 'Mørk';
      case 'system':
        return 'System';
      default:
        return 'Tema';
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <button
        onClick={toggleTheme}
        className={`
          ${buttonSizeClasses[size]}
          rounded-lg 
          bg-gray-100 dark:bg-gray-800 
          text-gray-900 dark:text-gray-100
          hover:bg-gray-200 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400
          transition-all duration-200 ease-in-out
          flex items-center justify-center
        `}
        title={`Bytt til ${theme === 'light' ? 'mørk' : theme === 'dark' ? 'system' : 'lys'} modus`}
        aria-label={`Bytt tema. Nåværende: ${getThemeLabel()}`}
      >
        {getIcon()}
      </button>
      
      {showLabel && (
        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {getThemeLabel()}
        </span>
      )}
    </div>
  );
};

export default ThemeToggle; 