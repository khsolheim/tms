/**
<<<<<<< HEAD
 * Sync Service for TMS Mobile
 * Handles offline data synchronization with the server
 */

import { OfflineService } from './OfflineService';
import { AuthenticationService } from './AuthenticationService';

export interface SyncStatus {
  isRunning: boolean;
  lastSync: Date | null;
  pendingOperations: number;
  errors: string[];
}

export class SyncService {
  private static syncInterval: NodeJS.Timeout | null = null;
  private static isSyncing = false;
  private static readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

  /**
   * Start background synchronization
   */
  static startBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
=======
 * Sync Service for TMS Mobile App
 * Handles offline data synchronization and background sync
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { AuthenticationService } from './AuthenticationService';

export interface SyncItem {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  table: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: number | null;
  pendingItems: number;
  isSyncing: boolean;
}

class SyncServiceClass {
  private readonly SYNC_QUEUE_KEY = 'sync_queue';
  private readonly LAST_SYNC_KEY = 'last_sync_time';
  private readonly MAX_RETRY_COUNT = 3;
  private readonly SYNC_INTERVAL = 30000; // 30 seconds
  
  private syncQueue: SyncItem[] = [];
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private baseUrl = process.env.API_BASE_URL || 'http://localhost:3001/api';

  /**
   * Initialize sync service
   */
  async initialize(): Promise<void> {
    try {
      // Load pending sync items from storage
      const queueData = await AsyncStorage.getItem(this.SYNC_QUEUE_KEY);
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
      }

      // Start background sync if online
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        this.startBackgroundSync();
      }

      // Listen for network changes
      NetInfo.addEventListener(state => {
        if (state.isConnected && !this.syncInterval) {
          this.startBackgroundSync();
          this.syncOfflineData();
        } else if (!state.isConnected && this.syncInterval) {
          this.stopBackgroundSync();
        }
      });
    } catch (error) {
      console.error('Failed to initialize sync service:', error);
    }
  }

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(
    type: SyncItem['type'],
    table: string,
    data: any,
    id?: string
  ): Promise<void> {
    try {
      const syncItem: SyncItem = {
        id: id || `${table}_${Date.now()}_${Math.random()}`,
        type,
        table,
        data,
        timestamp: Date.now(),
        retryCount: 0,
      };

      this.syncQueue.push(syncItem);
      await this.saveSyncQueue();

      // Try immediate sync if online
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        this.syncOfflineData();
      }
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  }

  /**
   * Sync offline data to server
   */
  async syncOfflineData(): Promise<void> {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;

    try {
      const authToken = AuthenticationService.getAuthToken();
      if (!authToken) {
        console.warn('No auth token available for sync');
        return;
      }

      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.log('Device is offline, skipping sync');
        return;
      }

      console.log(`Starting sync of ${this.syncQueue.length} items`);

      const itemsToSync = [...this.syncQueue];
      const successfulItems: string[] = [];

      for (const item of itemsToSync) {
        try {
          await this.syncSingleItem(item, authToken);
          successfulItems.push(item.id);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          
          // Increment retry count
          item.retryCount++;
          
          // Remove item if max retries exceeded
          if (item.retryCount >= this.MAX_RETRY_COUNT) {
            console.warn(`Max retries exceeded for item ${item.id}, removing from queue`);
            successfulItems.push(item.id);
          }
        }
      }

      // Remove successfully synced items from queue
      this.syncQueue = this.syncQueue.filter(
        item => !successfulItems.includes(item.id)
      );

      await this.saveSyncQueue();
      await AsyncStorage.setItem(this.LAST_SYNC_KEY, Date.now().toString());

      console.log(`Sync completed. ${successfulItems.length} items synced, ${this.syncQueue.length} items remaining`);
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync single item to server
   */
  private async syncSingleItem(item: SyncItem, authToken: string): Promise<void> {
    const endpoint = this.getEndpointForTable(item.table);
    let url = `${this.baseUrl}/${endpoint}`;
    let method = 'POST';

    switch (item.type) {
      case 'CREATE':
        method = 'POST';
        break;
      case 'UPDATE':
        method = 'PUT';
        url += `/${item.data.id}`;
        break;
      case 'DELETE':
        method = 'DELETE';
        url += `/${item.data.id}`;
        break;
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: item.type !== 'DELETE' ? JSON.stringify(item.data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
  }

  /**
   * Get API endpoint for database table
   */
  private getEndpointForTable(table: string): string {
    const endpoints: Record<string, string> = {
      'Elev': 'elever',
      'Ansatt': 'ansatte',
      'Bedrift': 'bedrifter',
      'Kjoretoy': 'kjoretoy',
      'Sikkerhetskontroll': 'sikkerhetskontroll',
      'Quiz': 'quiz',
      'Kontrakt': 'kontrakter',
      'KalenderEvent': 'kalender',
      'Oppgave': 'oppgaver',
      'Prosjekt': 'prosjekter',
      'Nyhet': 'nyheter',
    };

    return endpoints[table] || table.toLowerCase();
  }

  /**
   * Start background sync
   */
  startBackgroundSync(): void {
    if (this.syncInterval) {
      return;
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
    }

    this.syncInterval = setInterval(() => {
      this.syncOfflineData();
    }, this.SYNC_INTERVAL);

    console.log('Background sync started');
  }

  /**
<<<<<<< HEAD
   * Stop background synchronization
   */
  static stopBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    console.log('Background sync stopped');
  }

  /**
   * Manually trigger data synchronization
   */
  static async syncOfflineData(): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    this.isSyncing = true;

    try {
      console.log('Starting data synchronization...');

      // Check if user is authenticated
      const authStatus = await AuthenticationService.checkAuthStatus();
      if (!authStatus.isAuthenticated) {
        console.log('User not authenticated, skipping sync');
        return;
      }

      // Get pending operations from offline service
      const pendingOperations = await OfflineService.getPendingOperations();
      
      if (pendingOperations.length === 0) {
        console.log('No pending operations to sync');
        return;
      }

      console.log(`Syncing ${pendingOperations.length} pending operations...`);

      // Process each pending operation
      for (const operation of pendingOperations) {
        try {
          await this.processSyncOperation(operation);
          await OfflineService.markOperationAsCompleted(operation.id);
        } catch (error) {
          console.error(`Failed to sync operation ${operation.id}:`, error);
          await OfflineService.markOperationAsFailed(operation.id, error as Error);
        }
      }

      console.log('Data synchronization completed');
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Process individual sync operation
   */
  private static async processSyncOperation(operation: any): Promise<void> {
    const token = await AuthenticationService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${process.env.API_BASE_URL}${operation.endpoint}`, {
      method: operation.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: operation.data ? JSON.stringify(operation.data) : undefined,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        const newToken = await AuthenticationService.refreshToken();
        if (newToken) {
          // Retry with new token
          return this.processSyncOperation(operation);
        }
        throw new Error('Authentication failed');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
=======
   * Stop background sync
   */
  stopBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Background sync stopped');
    }
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
  }

  /**
   * Get current sync status
   */
<<<<<<< HEAD
  static async getSyncStatus(): Promise<SyncStatus> {
    const pendingOperations = await OfflineService.getPendingOperations();
    const lastSync = await OfflineService.getLastSyncTime();

    return {
      isRunning: this.isSyncing,
      lastSync,
      pendingOperations: pendingOperations.length,
      errors: [], // TODO: Implement error tracking
=======
  async getSyncStatus(): Promise<SyncStatus> {
    const netInfo = await NetInfo.fetch();
    const lastSyncTime = await AsyncStorage.getItem(this.LAST_SYNC_KEY);

    return {
      isOnline: netInfo.isConnected ?? false,
      lastSyncTime: lastSyncTime ? parseInt(lastSyncTime) : null,
      pendingItems: this.syncQueue.length,
      isSyncing: this.isSyncing,
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
    };
  }

  /**
<<<<<<< HEAD
   * Force immediate sync
   */
  static async forcSync(): Promise<void> {
    await this.syncOfflineData();
  }
} 
=======
   * Force sync now
   */
  async forcSync(): Promise<void> {
    await this.syncOfflineData();
  }

  /**
   * Clear sync queue
   */
  async clearSyncQueue(): Promise<void> {
    this.syncQueue = [];
    await AsyncStorage.removeItem(this.SYNC_QUEUE_KEY);
  }

  /**
   * Save sync queue to storage
   */
  private async saveSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  /**
   * Get pending sync items count
   */
  getPendingItemsCount(): number {
    return this.syncQueue.length;
  }

  /**
   * Get sync queue for debugging
   */
  getSyncQueue(): SyncItem[] {
    return [...this.syncQueue];
  }

  /**
   * Download fresh data from server
   */
  async downloadFreshData(): Promise<void> {
    try {
      const authToken = AuthenticationService.getAuthToken();
      if (!authToken) {
        throw new Error('Not authenticated');
      }

      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('Device is offline');
      }

      // Download essential data
      const endpoints = [
        'elever',
        'ansatte', 
        'bedrifter',
        'kjoretoy',
        'sikkerhetskontroll',
        'quiz',
        'kontrakter',
        'kalender',
        'oppgaver',
        'prosjekter',
        'nyheter'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${this.baseUrl}/${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            await AsyncStorage.setItem(`offline_${endpoint}`, JSON.stringify(data));
          }
        } catch (error) {
          console.error(`Failed to download ${endpoint}:`, error);
        }
      }

      await AsyncStorage.setItem('last_download_time', Date.now().toString());
      console.log('Fresh data download completed');
    } catch (error) {
      console.error('Download fresh data error:', error);
      throw error;
    }
  }

  /**
   * Get offline data for table
   */
  async getOfflineData(table: string): Promise<any[]> {
    try {
      const endpoint = this.getEndpointForTable(table);
      const data = await AsyncStorage.getItem(`offline_${endpoint}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error getting offline data for ${table}:`, error);
      return [];
    }
  }
}

export const SyncService = new SyncServiceClass(); 
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
