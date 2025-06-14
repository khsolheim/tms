<<<<<<< HEAD
import React, { createContext, useContext, ReactNode } from 'react';

interface OfflineContextType {
  isOnline: boolean;
  pendingOperations: number;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value: OfflineContextType = {
    isOnline: true,
    pendingOperations: 0,
  };

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
=======
/**
 * Offline Context for TMS Mobile App
 * Manages offline state and data synchronization
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { SyncService, SyncStatus } from '../services/SyncService';

interface OfflineState {
  isOnline: boolean;
  syncStatus: SyncStatus | null;
  isInitialized: boolean;
  error: string | null;
}

type OfflineAction =
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'SET_SYNC_STATUS'; payload: SyncStatus }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

interface OfflineContextType {
  state: OfflineState;
  forceSync: () => Promise<void>;
  clearSyncQueue: () => Promise<void>;
  downloadFreshData: () => Promise<void>;
  getOfflineData: (table: string) => Promise<any[]>;
  addToSyncQueue: (type: 'CREATE' | 'UPDATE' | 'DELETE', table: string, data: any, id?: string) => Promise<void>;
}

const initialState: OfflineState = {
  isOnline: true,
  syncStatus: null,
  isInitialized: false,
  error: null,
};

const offlineReducer = (state: OfflineState, action: OfflineAction): OfflineState => {
  switch (action.type) {
    case 'SET_ONLINE_STATUS':
      return {
        ...state,
        isOnline: action.payload,
      };
    case 'SET_SYNC_STATUS':
      return {
        ...state,
        syncStatus: action.payload,
      };
    case 'SET_INITIALIZED':
      return {
        ...state,
        isInitialized: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

interface OfflineProviderProps {
  children: React.ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(offlineReducer, initialState);

  useEffect(() => {
    initializeOfflineService();
    setupNetworkListener();
    setupSyncStatusUpdater();
  }, []);

  const initializeOfflineService = async () => {
    try {
      await SyncService.initialize();
      dispatch({ type: 'SET_INITIALIZED', payload: true });
      
      // Get initial sync status
      const syncStatus = await SyncService.getSyncStatus();
      dispatch({ type: 'SET_SYNC_STATUS', payload: syncStatus });
      dispatch({ type: 'SET_ONLINE_STATUS', payload: syncStatus.isOnline });
    } catch (error: any) {
      console.error('Failed to initialize offline service:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to initialize offline service' });
    }
  };

  const setupNetworkListener = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isOnline = state.isConnected ?? false;
      dispatch({ type: 'SET_ONLINE_STATUS', payload: isOnline });
      
      if (isOnline) {
        // When back online, trigger sync
        SyncService.syncOfflineData();
      }
    });

    return unsubscribe;
  };

  const setupSyncStatusUpdater = () => {
    // Update sync status periodically
    const interval = setInterval(async () => {
      try {
        const syncStatus = await SyncService.getSyncStatus();
        dispatch({ type: 'SET_SYNC_STATUS', payload: syncStatus });
      } catch (error) {
        console.error('Failed to update sync status:', error);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  };

  const forceSync = async () => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      await SyncService.forcSync();
      
      // Update sync status after sync
      const syncStatus = await SyncService.getSyncStatus();
      dispatch({ type: 'SET_SYNC_STATUS', payload: syncStatus });
    } catch (error: any) {
      console.error('Force sync error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Sync failed' });
      throw error;
    }
  };

  const clearSyncQueue = async () => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      await SyncService.clearSyncQueue();
      
      // Update sync status after clearing queue
      const syncStatus = await SyncService.getSyncStatus();
      dispatch({ type: 'SET_SYNC_STATUS', payload: syncStatus });
    } catch (error: any) {
      console.error('Clear sync queue error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to clear sync queue' });
      throw error;
    }
  };

  const downloadFreshData = async () => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      await SyncService.downloadFreshData();
      
      // Update sync status after download
      const syncStatus = await SyncService.getSyncStatus();
      dispatch({ type: 'SET_SYNC_STATUS', payload: syncStatus });
    } catch (error: any) {
      console.error('Download fresh data error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to download fresh data' });
      throw error;
    }
  };

  const getOfflineData = async (table: string): Promise<any[]> => {
    try {
      return await SyncService.getOfflineData(table);
    } catch (error: any) {
      console.error(`Get offline data error for ${table}:`, error);
      dispatch({ type: 'SET_ERROR', payload: error.message || `Failed to get offline data for ${table}` });
      return [];
    }
  };

  const addToSyncQueue = async (
    type: 'CREATE' | 'UPDATE' | 'DELETE',
    table: string,
    data: any,
    id?: string
  ) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      await SyncService.addToSyncQueue(type, table, data, id);
      
      // Update sync status after adding to queue
      const syncStatus = await SyncService.getSyncStatus();
      dispatch({ type: 'SET_SYNC_STATUS', payload: syncStatus });
    } catch (error: any) {
      console.error('Add to sync queue error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to add to sync queue' });
      throw error;
    }
  };

  const contextValue: OfflineContextType = {
    state,
    forceSync,
    clearSyncQueue,
    downloadFreshData,
    getOfflineData,
    addToSyncQueue,
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
}; 