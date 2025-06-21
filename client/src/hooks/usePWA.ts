import { useEffect, useState, useCallback } from 'react';
import { 
  pwaManager, 
  PWAUpdateInfo, 
  getInstallationStatus,
  isOnline,
  // requestNotificationPermission, // Currently unused
  // subscribeToPush // Currently unused
} from '../utils/pwa';

// Hook for PWA installation
export function usePWAInstall() {
  const [installationStatus, setInstallationStatus] = useState<'installed' | 'installable' | 'not-supported'>('not-supported');
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setInstallationStatus(getInstallationStatus());
    };

    updateStatus();
    
    // Listen for install prompt events
    const handleBeforeInstallPrompt = () => {
      updateStatus();
    };

    const handleAppInstalled = () => {
      updateStatus();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (installationStatus !== 'installable') return false;

    setIsInstalling(true);
    try {
      const result = await pwaManager.showInstallPrompt();
      setInstallationStatus(getInstallationStatus());
      return result;
    } finally {
      setIsInstalling(false);
    }
  }, [installationStatus]);

  return {
    installationStatus,
    isInstalling,
    install,
    canInstall: installationStatus === 'installable',
    isInstalled: installationStatus === 'installed'
  };
}

// Hook for PWA updates
export function usePWAUpdate() {
  const [updateInfo, setUpdateInfo] = useState<PWAUpdateInfo | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    pwaManager.onUpdateAvailable((info) => {
      setUpdateInfo(info);
    });
  }, []);

  const applyUpdate = useCallback(async () => {
    if (!updateInfo) return;

    setIsUpdating(true);
    try {
      updateInfo.skipWaiting();
      // Reload page after update
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } finally {
      setIsUpdating(false);
    }
  }, [updateInfo]);

  const dismissUpdate = useCallback(() => {
    setUpdateInfo(null);
  }, []);

  return {
    hasUpdate: !!updateInfo,
    isUpdating,
    applyUpdate,
    dismissUpdate
  };
}

// Hook for online/offline status
export function useOnlineStatus() {
  const [isOnlineStatus, setIsOnlineStatus] = useState(isOnline());
  const [connectionInfo, setConnectionInfo] = useState<any>(null);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnlineStatus(navigator.onLine);
      setConnectionInfo(pwaManager.getConnectionInfo());
    };

    pwaManager.onOnline(() => {
      setIsOnlineStatus(true);
      updateOnlineStatus();
    });

    pwaManager.onOffline(() => {
      setIsOnlineStatus(false);
      updateOnlineStatus();
    });

    // Initial update
    updateOnlineStatus();

    return () => {
      // Cleanup would be handled by pwaManager
    };
  }, []);

  return {
    isOnline: isOnlineStatus,
    isOffline: !isOnlineStatus,
    connectionInfo
  };
}

// Combined PWA hook
export function usePWA() {
  const install = usePWAInstall();
  const update = usePWAUpdate();
  const onlineStatus = useOnlineStatus();

  const [isInitialized, setIsInitialized] = useState(false);
  const [serviceWorkerVersion, setServiceWorkerVersion] = useState<string | null>(null);

  useEffect(() => {
    const initializePWA = async () => {
      const initialized = await pwaManager.initialize();
      setIsInitialized(initialized);
      
      if (initialized) {
        const version = await pwaManager.getServiceWorkerVersion();
        setServiceWorkerVersion(version);
      }
    };

    initializePWA();
  }, []);

  return {
    isInitialized,
    serviceWorkerVersion,
    install,
    update,
    onlineStatus
  };
} 