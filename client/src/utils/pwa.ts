// TMS PWA Utilities
// Service Worker management and installation helpers

export interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface OfflineAction {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  retryCount: number;
}

export interface PWAUpdateInfo {
  isUpdateAvailable: boolean;
  skipWaiting: () => void;
}

class PWAManager {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private installPrompt: PWAInstallPrompt | null = null;
  private updateAvailableCallback: ((info: PWAUpdateInfo) => void) | null = null;
  private onlineCallback: (() => void) | null = null;
  private offlineCallback: (() => void) | null = null;

  constructor() {
    this.setupEventListeners();
  }

  // Initialize service worker
  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[PWA] Service Worker not supported');
      return false;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('[PWA] Service Worker registered successfully');

      // Listen for updates
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available
              this.notifyUpdateAvailable();
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage);

      return true;
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
      return false;
    }
  }

  // Handle service worker messages
  private handleServiceWorkerMessage = (event: MessageEvent) => {
    const { type, action } = event.data;
    
    switch (type) {
      case 'SYNC_SUCCESS':
        console.log('[PWA] Offline action synced successfully:', action);
        // Notify UI about successful sync
        this.notifyOfflineActionSynced(action);
        break;
        
      case 'CACHE_UPDATED':
        console.log('[PWA] Cache updated');
        break;
        
      default:
        console.log('[PWA] Unknown service worker message:', type);
    }
  };

  // Setup event listeners
  private setupEventListeners() {
    // Install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e as any;
      console.log('[PWA] Install prompt available');
    });

    // App installed
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully');
      this.installPrompt = null;
    });

    // Online/offline status
    window.addEventListener('online', () => {
      console.log('[PWA] App is online');
      this.onlineCallback?.();
      this.syncOfflineActions();
    });

    window.addEventListener('offline', () => {
      console.log('[PWA] App is offline');
      this.offlineCallback?.();
    });
  }

  // Check if app can be installed
  isInstallable(): boolean {
    return this.installPrompt !== null;
  }

  // Show install prompt
  async showInstallPrompt(): Promise<boolean> {
    if (!this.installPrompt) {
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const choiceResult = await this.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted install prompt');
        return true;
      } else {
        console.log('[PWA] User dismissed install prompt');
        return false;
      }
    } catch (error) {
      console.error('[PWA] Install prompt failed:', error);
      return false;
    }
  }

  // Check if app is installed
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true;
  }

  // Get installation status
  getInstallationStatus(): 'installed' | 'installable' | 'not-supported' {
    if (this.isInstalled()) {
      return 'installed';
    }
    if (this.isInstallable()) {
      return 'installable';
    }
    return 'not-supported';
  }

  // Register for push notifications
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('[PWA] Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  // Subscribe to push notifications
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      console.warn('[PWA] Service Worker not registered');
      return null;
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || '')
      });

      console.log('[PWA] Push subscription successful');
      return subscription;
    } catch (error) {
      console.error('[PWA] Push subscription failed:', error);
      return null;
    }
  }

  // Send push subscription to server
  async sendSubscriptionToServer(subscription: PushSubscription): Promise<boolean> {
    try {
      const response = await fetch('/api/v1/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });

      return response.ok;
    } catch (error) {
      console.error('[PWA] Failed to send subscription to server:', error);
      return false;
    }
  }

  // Cache URLs for offline access
  async cacheUrls(urls: string[]): Promise<void> {
    if (!this.swRegistration) return;

    this.swRegistration.active?.postMessage({
      type: 'CACHE_URLS',
      payload: { urls }
    });
  }

  // Clear all caches
  async clearCache(): Promise<void> {
    if (!this.swRegistration) return;

    this.swRegistration.active?.postMessage({
      type: 'CLEAR_CACHE'
    });
  }

  // Store offline action
  async storeOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const fullAction: OfflineAction = {
      ...action,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0
    };

    // Store in IndexedDB (implementation would depend on IndexedDB wrapper)
    await this.storeInIndexedDB('offline-actions', fullAction);

    // Register background sync
    if ((this.swRegistration as any)?.sync) {
      await (this.swRegistration as any).sync.register('background-sync');
    }
  }

  // Sync offline actions
  async syncOfflineActions(): Promise<void> {
    if ((this.swRegistration as any)?.sync) {
      await (this.swRegistration as any).sync.register('background-sync');
    }
  }

  // Set update callback
  onUpdateAvailable(callback: (info: PWAUpdateInfo) => void): void {
    this.updateAvailableCallback = callback;
  }

  // Set online/offline callbacks
  onOnline(callback: () => void): void {
    this.onlineCallback = callback;
  }

  onOffline(callback: () => void): void {
    this.offlineCallback = callback;
  }

  // Notify about available update
  private notifyUpdateAvailable(): void {
    if (this.updateAvailableCallback) {
      this.updateAvailableCallback({
        isUpdateAvailable: true,
        skipWaiting: () => {
          this.swRegistration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }
  }

  // Notify about synced offline action
  private notifyOfflineActionSynced(action: OfflineAction): void {
    // Remove from IndexedDB
    this.removeFromIndexedDB('offline-actions', action.id);
    
    // Notify UI components
    window.dispatchEvent(new CustomEvent('offline-action-synced', { 
      detail: action 
    }));
  }

  // Utility functions
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // IndexedDB helpers (simplified - would use proper IndexedDB wrapper)
  private async storeInIndexedDB(store: string, data: any): Promise<void> {
    // Implementation would use IndexedDB
    console.log('[PWA] Storing in IndexedDB:', store, data);
  }

  private async removeFromIndexedDB(store: string, id: string): Promise<void> {
    // Implementation would use IndexedDB
    console.log('[PWA] Removing from IndexedDB:', store, id);
  }

  // Get service worker version
  async getServiceWorkerVersion(): Promise<string | null> {
    if (!this.swRegistration?.active) return null;

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.version);
      };
      
      this.swRegistration!.active!.postMessage(
        { type: 'GET_VERSION' },
        [messageChannel.port2]
      );
    });
  }

  // Check network status
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Get connection info
  getConnectionInfo(): any {
    return (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  }
}

// Singleton instance
export const pwaManager = new PWAManager();

// Helper functions
export const initializePWA = () => pwaManager.initialize();
export const isInstallable = () => pwaManager.isInstallable();
export const showInstallPrompt = () => pwaManager.showInstallPrompt();
export const isInstalled = () => pwaManager.isInstalled();
export const getInstallationStatus = () => pwaManager.getInstallationStatus();
export const requestNotificationPermission = () => pwaManager.requestNotificationPermission();
export const subscribeToPush = () => pwaManager.subscribeToPush();
export const cacheUrls = (urls: string[]) => pwaManager.cacheUrls(urls);
export const storeOfflineAction = (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>) => 
  pwaManager.storeOfflineAction(action);
export const isOnline = () => pwaManager.isOnline(); 