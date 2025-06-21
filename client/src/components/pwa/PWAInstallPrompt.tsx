import React from 'react';
import { usePWAInstall } from '../../hooks/usePWA';
import { useTranslation } from '../../contexts/I18nContext';

interface PWAInstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function PWAInstallPrompt({ onInstall, onDismiss, className = '' }: PWAInstallPromptProps) {
  const { canInstall, isInstalling, install } = usePWAInstall();
  const { t } = useTranslation();

  if (!canInstall) {
    return null;
  }

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      onInstall?.();
    }
  };

  const handleDismiss = () => {
    onDismiss?.();
  };

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg 
            className="h-6 w-6 text-blue-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" 
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800">
            {t('pwa.install.title')}
          </h3>
          <p className="mt-1 text-sm text-blue-700">
            {t('pwa.install.description')}
          </p>
          <div className="mt-4 flex space-x-3">
            <button
              type="button"
              onClick={handleInstall}
              disabled={isInstalling}
              className="
                inline-flex items-center px-2 py-1 border border-transparent 
                text-sm leading-4 font-medium rounded-md text-white bg-blue-600 
                hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isInstalling ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('pwa.install.installing')}
                </>
              ) : (
                t('pwa.install.button')
              )}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="
                inline-flex items-center px-2 py-1 border border-gray-300 
                text-sm leading-4 font-medium rounded-md text-gray-700 bg-white 
                hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-blue-500
              "
            >
              {t('pwa.install.dismiss')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact install button for header/toolbar
export function PWAInstallButton({ className = '' }: { className?: string }) {
  const { canInstall, isInstalling, install } = usePWAInstall();
  const { t } = useTranslation();

  if (!canInstall) {
    return null;
  }

  const handleInstall = async () => {
    await install();
  };

  return (
    <button
      onClick={handleInstall}
      disabled={isInstalling}
      className={`
        inline-flex items-center px-3 py-2 border border-transparent 
        text-sm font-medium rounded-md text-blue-700 bg-blue-100 
        hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={t('pwa.install.tooltip')}
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {isInstalling ? t('pwa.install.installing') : t('pwa.install.button')}
    </button>
  );
} 