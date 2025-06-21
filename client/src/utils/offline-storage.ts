/**
 * IndexedDB Service for Offline Data Storage
 * Håndterer offline lagring av kritiske data for TMS PWA
 */

// interface StorageOptions { // Currently unused
//   version?: number;
//   timeout?: number;
// }

interface OfflineData {
  id: string;
  type: 'bedrift' | 'kontrakt' | 'ansatt' | 'elev' | 'action';
  data: any;
  timestamp: number;
  synced: boolean;
  expires?: number;
}

interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  resource: string;
  data: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

class OfflineStorageService {
  private db: IDBDatabase | null = null;
  private dbName = 'TMS_Offline_Storage';
  private version = 1;
  private storeName = 'data';
  private actionsStoreName = 'actions';

  constructor() {
    this.initDB();
  }

  /**
   * Initialize IndexedDB
   */
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('[OfflineStorage] Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[OfflineStorage] Database opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create data store
        if (!db.objectStoreNames.contains(this.storeName)) {
          const dataStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
          dataStore.createIndex('type', 'type', { unique: false });
          dataStore.createIndex('timestamp', 'timestamp', { unique: false });
          dataStore.createIndex('synced', 'synced', { unique: false });
        }

        // Create actions store for offline actions
        if (!db.objectStoreNames.contains(this.actionsStoreName)) {
          const actionsStore = db.createObjectStore(this.actionsStoreName, { keyPath: 'id' });
          actionsStore.createIndex('timestamp', 'timestamp', { unique: false });
          actionsStore.createIndex('retries', 'retries', { unique: false });
        }
      };
    });
  }

  /**
   * Store data offline
   */
  async storeData(type: OfflineData['type'], id: string, data: any, expires?: number): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    const transaction = this.db!.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    const offlineData: OfflineData = {
      id: `${type}_${id}`,
      type,
      data,
      timestamp: Date.now(),
      synced: true,
      expires
    };

    return new Promise((resolve, reject) => {
      const request = store.put(offlineData);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieve data from offline storage
   */
  async getData(type: OfflineData['type'], id?: string): Promise<any | any[]> {
    if (!this.db) {
      await this.initDB();
    }

    const transaction = this.db!.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    if (id) {
      // Get specific item
      return new Promise((resolve, reject) => {
        const request = store.get(`${type}_${id}`);
        
        request.onsuccess = () => {
          const result = request.result;
          
          // Check if expired
          if (result && result.expires && Date.now() > result.expires) {
            this.deleteData(type, id);
            resolve(null);
            return;
          }
          
          resolve(result ? result.data : null);
        };
        request.onerror = () => reject(request.error);
      });
    } else {
      // Get all items of type
      return new Promise((resolve, reject) => {
        const index = store.index('type');
        const request = index.getAll(type);
        
        request.onsuccess = () => {
          const results = request.result
            .filter(item => !item.expires || Date.now() <= item.expires)
            .map(item => ({ id: item.id.replace(`${type}_`, ''), ...item.data }));
          resolve(results);
        };
        request.onerror = () => reject(request.error);
      });
    }
  }

  /**
   * Delete data from offline storage
   */
  async deleteData(type: OfflineData['type'], id: string): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    const transaction = this.db!.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(`${type}_${id}`);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Store offline action for later sync
   */
  async storeOfflineAction(
    type: OfflineAction['type'],
    resource: string,
    data: any,
    maxRetries = 3
  ): Promise<string> {
    if (!this.db) {
      await this.initDB();
    }

    const actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    const action: OfflineAction = {
      id: actionId,
      type,
      resource,
      data,
      timestamp: Date.now(),
      retries: 0,
      maxRetries
    };

    const transaction = this.db!.transaction([this.actionsStoreName], 'readwrite');
    const store = transaction.objectStore(this.actionsStoreName);

    return new Promise((resolve, reject) => {
      const request = store.put(action);
      
      request.onsuccess = () => {
        console.log('[OfflineStorage] Offline action stored:', actionId);
        resolve(actionId);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all pending offline actions
   */
  async getPendingActions(): Promise<OfflineAction[]> {
    if (!this.db) {
      await this.initDB();
    }

    const transaction = this.db!.transaction([this.actionsStoreName], 'readonly');
    const store = transaction.objectStore(this.actionsStoreName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        const actions = request.result.filter(action => action.retries < action.maxRetries);
        resolve(actions);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove offline action after successful sync
   */
  async removeOfflineAction(actionId: string): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    const transaction = this.db!.transaction([this.actionsStoreName], 'readwrite');
    const store = transaction.objectStore(this.actionsStoreName);

    return new Promise((resolve, reject) => {
      const request = store.delete(actionId);
      
      request.onsuccess = () => {
        console.log('[OfflineStorage] Offline action removed:', actionId);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Increment retry count for failed action
   */
  async incrementRetries(actionId: string): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    const transaction = this.db!.transaction([this.actionsStoreName], 'readwrite');
    const store = transaction.objectStore(this.actionsStoreName);

    return new Promise((resolve, reject) => {
      const getRequest = store.get(actionId);
      
      getRequest.onsuccess = () => {
        const action = getRequest.result;
        if (action) {
          action.retries += 1;
          const putRequest = store.put(action);
          
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Clear expired data
   */
  async clearExpiredData(): Promise<number> {
    if (!this.db) {
      await this.initDB();
    }

    const transaction = this.db!.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const now = Date.now();
    let deletedCount = 0;

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        const items = request.result;
        const deletePromises = items
          .filter(item => item.expires && now > item.expires)
          .map(item => {
            deletedCount++;
            return new Promise<void>((deleteResolve, deleteReject) => {
              const deleteRequest = store.delete(item.id);
              deleteRequest.onsuccess = () => deleteResolve();
              deleteRequest.onerror = () => deleteReject(deleteRequest.error);
            });
          });

        Promise.all(deletePromises)
          .then(() => {
            console.log(`[OfflineStorage] Cleared ${deletedCount} expired items`);
            resolve(deletedCount);
          })
          .catch(reject);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{
    totalItems: number;
    actionsPending: number;
    dataByType: Record<string, number>;
    lastCleanup: number;
  }> {
    if (!this.db) {
      await this.initDB();
    }

    const dataTransaction = this.db!.transaction([this.storeName], 'readonly');
    const dataStore = dataTransaction.objectStore(this.storeName);

    const actionsTransaction = this.db!.transaction([this.actionsStoreName], 'readonly');
    const actionsStore = actionsTransaction.objectStore(this.actionsStoreName);

    const [dataItems, actionItems] = await Promise.all([
      new Promise<OfflineData[]>((resolve, reject) => {
        const request = dataStore.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
      new Promise<OfflineAction[]>((resolve, reject) => {
        const request = actionsStore.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
    ]);

    const dataByType = dataItems.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalItems: dataItems.length,
      actionsPending: actionItems.filter(action => action.retries < action.maxRetries).length,
      dataByType,
      lastCleanup: Date.now()
    };
  }
}

// Create singleton instance
export const offlineStorage = new OfflineStorageService();
export type { OfflineData, OfflineAction }; 