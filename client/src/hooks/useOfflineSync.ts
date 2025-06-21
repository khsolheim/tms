import { useEffect, useState, useCallback } from 'react';
import { offlineStorage, OfflineAction } from '../utils/offline-storage';
import { useOnlineStatus } from './usePWA';

interface SyncStatus {
  isSyncing: boolean;
  pendingActions: number;
  lastSync: Date | null;
  syncErrors: string[];
}

export function useOfflineSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    pendingActions: 0,
    lastSync: null,
    syncErrors: []
  });
  
  const isOnline = useOnlineStatus();

  /**
   * Sync pending offline actions
   */
  const syncPendingActions = useCallback(async () => {
    if (!isOnline || syncStatus.isSyncing) return;

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncErrors: [] }));

    try {
      const pendingActions = await offlineStorage.getPendingActions();
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const action of pendingActions) {
        try {
          await syncSingleAction(action);
          await offlineStorage.removeOfflineAction(action.id);
          successCount++;
        } catch (error) {
          console.error(`[OfflineSync] Failed to sync action ${action.id}:`, error);
          await offlineStorage.incrementRetries(action.id);
          errorCount++;
          errors.push(`Failed to sync ${action.resource} ${action.type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      console.log(`[OfflineSync] Sync completed: ${successCount} success, ${errorCount} failed`);

      const pendingCount = await getPendingActionsCount();
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date(),
        pendingActions: pendingCount,
        syncErrors: errors
      }));

    } catch (error) {
      console.error('[OfflineSync] Sync failed:', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncErrors: [`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      }));
    }
  }, [isOnline, syncStatus.isSyncing]);

  /**
   * Sync a single offline action
   */
  const syncSingleAction = async (action: OfflineAction): Promise<void> => {
    const { type, resource, data } = action;
    const baseUrl = '/api/v1';

    const config = {
      method: type === 'CREATE' ? 'POST' : type === 'UPDATE' ? 'PUT' : 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: type !== 'DELETE' ? JSON.stringify(data) : undefined
    };

    let url = `${baseUrl}/${resource}`;
    if (type === 'UPDATE' || type === 'DELETE') {
      url += `/${data.id}`;
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  /**
   * Store action for offline sync
   */
  const storeOfflineAction = useCallback(async (
    type: OfflineAction['type'],
    resource: string,
    data: any
  ): Promise<string> => {
    const actionId = await offlineStorage.storeOfflineAction(type, resource, data);
    
    setSyncStatus(prev => ({
      ...prev,
      pendingActions: prev.pendingActions + 1
    }));

    console.log('[OfflineSync] Action stored for offline sync:', actionId);
    return actionId;
  }, []);

  /**
   * Get count of pending actions
   */
  const getPendingActionsCount = async (): Promise<number> => {
    const actions = await offlineStorage.getPendingActions();
    return actions.length;
  };

  /**
   * Initialize sync status
   */
  useEffect(() => {
    const initializeSyncStatus = async () => {
      const pendingCount = await getPendingActionsCount();
      setSyncStatus(prev => ({
        ...prev,
        pendingActions: pendingCount
      }));
    };

    initializeSyncStatus();
  }, []);

  /**
   * Auto-sync when coming online
   */
  useEffect(() => {
    if (isOnline && syncStatus.pendingActions > 0) {
      // Wait a bit for connection to stabilize
      const timer = setTimeout(syncPendingActions, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, syncStatus.pendingActions, syncPendingActions]);

  /**
   * Listen for offline action events
   */
  useEffect(() => {
    const handleOfflineActionSynced = () => {
      updatePendingActions();
    };

    const updatePendingActions = async () => {
      const count = await getPendingActionsCount();
      setSyncStatus(prev => ({ ...prev, pendingActions: count }));
    };

    window.addEventListener('offline-action-synced', handleOfflineActionSynced);
    
    return () => {
      window.removeEventListener('offline-action-synced', handleOfflineActionSynced);
    };
  }, []);

  return {
    syncStatus,
    syncPendingActions,
    storeOfflineAction,
    isOnline
  };
}

/**
 * Hook for storing and retrieving offline data
 */
export function useOfflineData<T>(
  type: 'bedrift' | 'kontrakt' | 'ansatt' | 'elev',
  id?: string
) {
  const [data, setData] = useState<T | T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load data from offline storage
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const offlineData = await offlineStorage.getData(type, id);
      setData(offlineData);
    } catch (err) {
      console.error(`[OfflineData] Failed to load ${type} data:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [type, id]);

  /**
   * Store data offline
   */
  const storeData = useCallback(async (
    dataToStore: T,
    expires?: number
  ): Promise<void> => {
    try {
      const dataId = id || (dataToStore as any).id || Date.now().toString();
      await offlineStorage.storeData(type, dataId, dataToStore, expires);
      await loadData(); // Refresh local state
    } catch (err) {
      console.error(`[OfflineData] Failed to store ${type} data:`, err);
      throw err;
    }
  }, [type, id, loadData]);

  /**
   * Delete data from offline storage
   */
  const deleteData = useCallback(async (dataId?: string): Promise<void> => {
    try {
      const targetId = dataId || id;
      if (!targetId) throw new Error('No ID provided for deletion');
      
      await offlineStorage.deleteData(type, targetId);
      await loadData(); // Refresh local state
    } catch (err) {
      console.error(`[OfflineData] Failed to delete ${type} data:`, err);
      throw err;
    }
  }, [type, id, loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    storeData,
    deleteData,
    refresh: loadData
  };
} 