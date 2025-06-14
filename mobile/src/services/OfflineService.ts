/**
 * OfflineService - Mobile Offline-First Data Management
 * 
 * Håndterer offline data storage, caching og synkronisering for mobile app
 */

interface CacheItem {
  key: string;
  data: any;
  timestamp: number;
  expires?: number;
}

interface OfflineAction {
  id: string;
  type: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: any[];
}

export class OfflineService {
  private static instance: OfflineService;
  private cache: Map<string, CacheItem> = new Map();
  private offlineActions: OfflineAction[] = [];
  private isInitialized = false;

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  /**
   * Initialize offline service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load cached data from AsyncStorage
      await this.loadCacheFromStorage();
      
      // Load pending offline actions
      await this.loadOfflineActions();
      
      this.isInitialized = true;
      console.log('[OfflineService] Initialized successfully');
    } catch (error) {
      console.error('[OfflineService] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Cache data with optional expiration
   */
  async cacheData(key: string, data: any, expirationMinutes?: number): Promise<void> {
    const item: CacheItem = {
      key,
      data,
      timestamp: Date.now(),
      expires: expirationMinutes ? Date.now() + (expirationMinutes * 60 * 1000) : undefined
    };

    this.cache.set(key, item);
    await this.saveCacheToStorage();
  }

  /**
   * Retrieve cached data
   */
  getCachedData(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) return null;

    // Check if expired
    if (item.expires && Date.now() > item.expires) {
      this.cache.delete(key);
      this.saveCacheToStorage();
      return null;
    }

    return item.data;
  }

  /**
   * Clear specific cache entry
   */
  async clearCache(key: string): Promise<void> {
    this.cache.delete(key);
    await this.saveCacheToStorage();
  }

  /**
   * Clear all cached data
   */
  async clearAllCache(): Promise<void> {
    this.cache.clear();
    await this.saveCacheToStorage();
  }

  /**
   * Store action for offline execution
   */
  async storeOfflineAction(
    type: string,
    endpoint: string,
    method: OfflineAction['method'],
    data?: any,
    maxRetries: number = 3
  ): Promise<string> {
    const action: OfflineAction = {
      id: this.generateId(),
      type,
      endpoint,
      method,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries
    };

    this.offlineActions.push(action);
    await this.saveOfflineActions();
    
    console.log(`[OfflineService] Stored offline action: ${type}`);
    return action.id;
  }

  /**
   * Get all pending offline actions
   */
  getPendingActions(): OfflineAction[] {
    return [...this.offlineActions];
  }

  /**
   * Get pending operations (alias for getPendingActions for SyncService compatibility)
   */
  static async getPendingOperations(): Promise<OfflineAction[]> {
    const instance = OfflineService.getInstance();
    return instance.getPendingActions();
  }

  /**
   * Mark operation as completed
   */
  static async markOperationAsCompleted(id: string): Promise<void> {
    const instance = OfflineService.getInstance();
    await instance.removeOfflineAction(id);
  }

  /**
   * Mark operation as failed
   */
  static async markOperationAsFailed(id: string, error: Error): Promise<void> {
    const instance = OfflineService.getInstance();
    // For now, just remove the action. In a real implementation, you might want to log the error
    console.error(`Operation ${id} failed:`, error);
    await instance.removeOfflineAction(id);
  }

  /**
   * Get last sync time
   */
  static async getLastSyncTime(): Promise<Date | null> {
    // TODO: Implement proper last sync time tracking
    return null;
  }

  /**
   * Initialize static method for compatibility
   */
  static async initialize(): Promise<void> {
    const instance = OfflineService.getInstance();
    await instance.initialize();
  }

  /**
   * Remove completed offline action
   */
  async removeOfflineAction(id: string): Promise<void> {
    this.offlineActions = this.offlineActions.filter(action => action.id !== id);
    await this.saveOfflineActions();
  }

  /**
   * Sync all offline actions
   */
  async syncOfflineActions(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      synced: 0,
      failed: 0,
      errors: []
    };

    if (this.offlineActions.length === 0) {
      result.success = true;
      return result;
    }

    console.log(`[OfflineService] Syncing ${this.offlineActions.length} offline actions`);

    for (const action of [...this.offlineActions]) {
      try {
        const syncSuccess = await this.executeOfflineAction(action);
        
        if (syncSuccess) {
          await this.removeOfflineAction(action.id);
          result.synced++;
        } else {
          // Increment retry count
          action.retryCount++;
          
          if (action.retryCount >= action.maxRetries) {
            // Max retries reached, remove action
            await this.removeOfflineAction(action.id);
            result.failed++;
            result.errors.push({
              action: action.type,
              error: 'Max retries exceeded'
            });
          }
        }
      } catch (error) {
        console.error(`[OfflineService] Failed to sync action ${action.type}:`, error);
        result.failed++;
        result.errors.push({
          action: action.type,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    await this.saveOfflineActions();
    result.success = result.failed === 0;
    
    console.log(`[OfflineService] Sync completed: ${result.synced} synced, ${result.failed} failed`);
    return result;
  }

  /**
   * Execute a single offline action
   */
  private async executeOfflineAction(action: OfflineAction): Promise<boolean> {
    try {
      // In a real implementation, this would make HTTP requests to the API
      const response = await fetch(action.endpoint, {
        method: action.method,
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers etc.
        },
        body: action.data ? JSON.stringify(action.data) : undefined
      });

      return response.ok;
    } catch (error) {
      console.error(`[OfflineService] Action execution failed:`, error);
      return false;
    }
  }

  /**
   * Load cache from persistent storage
   */
  private async loadCacheFromStorage(): Promise<void> {
    try {
      // In React Native, this would use AsyncStorage
      // For now, using localStorage simulation
      const cacheData = localStorage.getItem('tms_mobile_cache');
      
      if (cacheData) {
        const parsedCache = JSON.parse(cacheData);
        this.cache = new Map(parsedCache);
      }
    } catch (error) {
      console.error('[OfflineService] Failed to load cache from storage:', error);
    }
  }

  /**
   * Save cache to persistent storage
   */
  private async saveCacheToStorage(): Promise<void> {
    try {
      const cacheArray = Array.from(this.cache.entries());
      localStorage.setItem('tms_mobile_cache', JSON.stringify(cacheArray));
    } catch (error) {
      console.error('[OfflineService] Failed to save cache to storage:', error);
    }
  }

  /**
   * Load offline actions from storage
   */
  private async loadOfflineActions(): Promise<void> {
    try {
      const actionsData = localStorage.getItem('tms_mobile_offline_actions');
      
      if (actionsData) {
        this.offlineActions = JSON.parse(actionsData);
      }
    } catch (error) {
      console.error('[OfflineService] Failed to load offline actions:', error);
    }
  }

  /**
   * Save offline actions to storage
   */
  private async saveOfflineActions(): Promise<void> {
    try {
      localStorage.setItem('tms_mobile_offline_actions', JSON.stringify(this.offlineActions));
    } catch (error) {
      console.error('[OfflineService] Failed to save offline actions:', error);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const now = Date.now();
    let expiredCount = 0;
    let validCount = 0;

    for (const item of this.cache.values()) {
      if (item.expires && now > item.expires) {
        expiredCount++;
      } else {
        validCount++;
      }
    }

    return {
      totalItems: this.cache.size,
      validItems: validCount,
      expiredItems: expiredCount,
      pendingActions: this.offlineActions.length
    };
  }
}

// Export singleton instance
export const offlineService = OfflineService.getInstance();
export default offlineService; 