import React from 'react';
import { usePWAUpdate, useOnlineStatus } from '../../hooks/usePWA';
import { useTranslation } from '../../contexts/I18nContext';

// Online/Offline status indicator
export function OnlineStatusIndicator({ className = '' }: { className?: string }) {
  const { isOnline, connectionInfo } = useOnlineStatus();
  const { t } = useTranslation();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`
        w-2 h-2 rounded-full 
        ${isOnline ? 'bg-green-500' : 'bg-red-500'}
        ${isOnline ? 'animate-pulse' : ''}
      `} />
      <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
        {isOnline ? t('pwa.status.online') : t('pwa.status.offline')}
      </span>
      {connectionInfo && (
        <span className="text-xs text-gray-500">
          {connectionInfo.effectiveType} ({connectionInfo.downlink}Mbps)
        </span>
      )}
    </div>
  );
}

// PWA Update notification
export function PWAUpdateNotification({ className = '' }: { className?: string }) {
  const { hasUpdate, isUpdating, applyUpdate, dismissUpdate } = usePWAUpdate();
  const { t } = useTranslation();

  if (!hasUpdate) {
    return null;
  }

  return (
    <div className={`
      bg-green-50 border border-green-200 rounded-lg p-4 
      ${className}
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg 
            className="h-6 w-6 text-green-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-green-800">
            {t('pwa.update.title')}
          </h3>
          <p className="mt-1 text-sm text-green-700">
            {t('pwa.update.description')}
          </p>
          <div className="mt-4 flex space-x-3">
            <button
              type="button"
              onClick={applyUpdate}
              disabled={isUpdating}
              className="
                inline-flex items-center px-2 py-1 border border-transparent 
                text-sm leading-4 font-medium rounded-md text-white bg-green-600 
                hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isUpdating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('pwa.update.updating')}
                </>
              ) : (
                t('pwa.update.button')
              )}
            </button>
            <button
              type="button"
              onClick={dismissUpdate}
              className="
                inline-flex items-center px-2 py-1 border border-gray-300 
                text-sm leading-4 font-medium rounded-md text-gray-700 bg-white 
                hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-green-500
              "
            >
              {t('pwa.update.later')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Combined PWA status bar
export function PWAStatusBar({ className = '' }: { className?: string }) {
  const { hasUpdate } = usePWAUpdate();
  const { isOnline } = useOnlineStatus();
  
  // Only show if there's something to display
  if (isOnline && !hasUpdate) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-2 py-1">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm text-yellow-800">
              Du er offline. Noen funksjoner kan være begrenset.
            </span>
          </div>
        </div>
      )}
      <PWAUpdateNotification />
    </div>
  );
} 