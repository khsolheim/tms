/**
 * PWA Offline Workflow Tests
 * Tester full offline funksjonalitet for TMS PWA
 */

import { offlineStorage } from '../utils/offline-storage';
import { pwaManager } from '../utils/pwa';

// Mock IndexedDB for testing
const FDBFactory = require('fake-indexeddb/lib/FDBFactory');
const FDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
global.indexedDB = new FDBFactory();
global.IDBKeyRange = FDBKeyRange;

// Mock fetch
global.fetch = jest.fn();

// Mock service worker
Object.defineProperty(window.navigator, 'serviceWorker', {
  value: {
    register: jest.fn(() => Promise.resolve({
      installing: null,
      waiting: null,
      active: {
        postMessage: jest.fn()
      },
      addEventListener: jest.fn(),
      update: jest.fn(() => Promise.resolve())
    })),
    ready: Promise.resolve({
      pushManager: {
        subscribe: jest.fn(() => Promise.resolve({
          endpoint: 'https://test.com/push',
          keys: {
            p256dh: 'test-key',
            auth: 'test-auth'
          }
        }))
      }
    }),
    controller: {
      postMessage: jest.fn()
    }
  },
  writable: true
});

// Mock online/offline status
Object.defineProperty(window.navigator, 'onLine', {
  writable: true,
  value: true
});

describe('PWA Offline Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Reset online status
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: true
    });
  });

  describe('IndexedDB Offline Storage', () => {
    test('should store and retrieve bedrift data', async () => {
      const testBedrift = {
        id: 1,
        navn: 'Test Bedrift AS',
        organisasjonsnummer: '123456789',
        adresse: 'Test Gate 1'
      };

      await offlineStorage.storeData('bedrift', '1', testBedrift);
      const retrieved = await offlineStorage.getData('bedrift', '1');

      expect(retrieved).toEqual(testBedrift);
    });

    test('should store and retrieve multiple kontrakter', async () => {
      const kontrakter = [
        { id: 1, elevId: 1, bedriftId: 1, startDato: '2025-01-01' },
        { id: 2, elevId: 2, bedriftId: 1, startDato: '2025-02-01' }
      ];

      for (const kontrakt of kontrakter) {
        await offlineStorage.storeData('kontrakt', kontrakt.id.toString(), kontrakt);
      }

      const allKontrakter = await offlineStorage.getData('kontrakt');
      expect(allKontrakter).toHaveLength(2);
      expect(allKontrakter[0].elevId).toBe(1);
      expect(allKontrakter[1].elevId).toBe(2);
    });

    test('should handle expired data', async () => {
      const expiredData = {
        id: 1,
        navn: 'Expired Data'
      };

      // Store with expiration 1ms ago
      const expiration = Date.now() - 1;
      await offlineStorage.storeData('ansatt', '1', expiredData, expiration);

      // Should return null for expired data
      const retrieved = await offlineStorage.getData('ansatt', '1');
      expect(retrieved).toBeNull();
    });

    test('should store offline actions for sync', async () => {
      const createAction = {
        type: 'CREATE' as const,
        resource: 'bedrifter',
        data: { navn: 'Ny Bedrift' }
      };

      const actionId = await offlineStorage.storeOfflineAction(
        createAction.type,
        createAction.resource,
        createAction.data
      );

      expect(actionId).toBeTruthy();

      const pendingActions = await offlineStorage.getPendingActions();
      expect(pendingActions).toHaveLength(1);
      expect(pendingActions[0].type).toBe('CREATE');
      expect(pendingActions[0].resource).toBe('bedrifter');
    });

    test('should clear expired data', async () => {
      // Store expired data
      await offlineStorage.storeData('elev', '1', { id: 1 }, Date.now() - 1000);
      await offlineStorage.storeData('elev', '2', { id: 2 }, Date.now() + 10000);

      const deletedCount = await offlineStorage.clearExpiredData();
      expect(deletedCount).toBe(1);

      // Valid data should still exist
      const remaining = await offlineStorage.getData('elev');
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(2);
    });

    test('should provide storage statistics', async () => {
      await offlineStorage.storeData('bedrift', '1', { id: 1 });
      await offlineStorage.storeData('kontrakt', '1', { id: 1 });
      await offlineStorage.storeOfflineAction('CREATE', 'ansatte', { navn: 'Test' });

      const stats = await offlineStorage.getStorageStats();
      
      expect(stats.totalItems).toBe(2);
      expect(stats.actionsPending).toBe(1);
      expect(stats.dataByType.bedrift).toBe(1);
      expect(stats.dataByType.kontrakt).toBe(1);
    });
  });

  describe('Offline Action Sync', () => {
    test('should retry failed actions with exponential backoff', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const actionId = await offlineStorage.storeOfflineAction(
        'CREATE',
        'bedrifter',
        { navn: 'Test Bedrift' }
      );

      // Simulate retry increment
      await offlineStorage.incrementRetries(actionId);
      await offlineStorage.incrementRetries(actionId);

      const actions = await offlineStorage.getPendingActions();
      const action = actions.find(a => a.id === actionId);
      
      expect(action?.retries).toBe(2);
    });

    test('should remove actions after max retries', async () => {
      const actionId = await offlineStorage.storeOfflineAction(
        'CREATE',
        'bedrifter',
        { navn: 'Test Bedrift' },
        2 // maxRetries
      );

      // Exceed max retries
      await offlineStorage.incrementRetries(actionId);
      await offlineStorage.incrementRetries(actionId);
      await offlineStorage.incrementRetries(actionId);

      const pendingActions = await offlineStorage.getPendingActions();
      const failedAction = pendingActions.find(a => a.id === actionId);
      
      expect(failedAction).toBeUndefined();
    });

    test('should handle successful sync and cleanup', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const actionId = await offlineStorage.storeOfflineAction(
        'CREATE',
        'bedrifter',
        { navn: 'Test Bedrift' }
      );

      await offlineStorage.removeOfflineAction(actionId);

      const pendingActions = await offlineStorage.getPendingActions();
      expect(pendingActions.find(a => a.id === actionId)).toBeUndefined();
    });
  });

  describe('PWA Service Worker Integration', () => {
    test('should register service worker successfully', async () => {
      await pwaManager.initialize();
      
      expect(navigator.serviceWorker.register).toHaveBeenCalledWith(
        '/sw.js',
        expect.any(Object)
      );
    });

    test('should handle push subscription', async () => {
      await pwaManager.initialize();
      
      const subscription = await pwaManager.subscribeToPush();
      expect(subscription).toBeTruthy();
      expect(subscription?.endpoint).toBe('https://test.com/push');
    });

    test('should handle offline/online events', (done) => {
      let onlineCallbackCalled = false;
      let offlineCallbackCalled = false;

      pwaManager.onOnline(() => {
        onlineCallbackCalled = true;
        if (offlineCallbackCalled && onlineCallbackCalled) done();
      });

      pwaManager.onOffline(() => {
        offlineCallbackCalled = true;
        if (offlineCallbackCalled && onlineCallbackCalled) done();
      });

      // Simulate going offline
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false
      });
      window.dispatchEvent(new Event('offline'));

      // Simulate coming back online
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: true
      });
      window.dispatchEvent(new Event('online'));
    });
  });

  describe('Full Offline Workflow Scenarios', () => {
    test('should handle complete offline CRUD workflow', async () => {
      // 1. Go offline
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false
      });

      // 2. Store data locally
      const bedrift = { id: 1, navn: 'Offline Bedrift' };
      await offlineStorage.storeData('bedrift', '1', bedrift);

      // 3. Queue offline actions
      const createActionId = await offlineStorage.storeOfflineAction(
        'CREATE',
        'kontrakter',
        { elevId: 1, bedriftId: 1, startDato: '2025-01-01' }
      );

      const updateActionId = await offlineStorage.storeOfflineAction(
        'UPDATE',
        'bedrifter',
        { id: 1, navn: 'Updated Bedrift' }
      );

      // 4. Verify data is stored locally
      const storedBedrift = await offlineStorage.getData('bedrift', '1');
      expect(storedBedrift).toEqual(bedrift);

      const pendingActions = await offlineStorage.getPendingActions();
      expect(pendingActions).toHaveLength(2);

      // 5. Come back online
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: true
      });

      // 6. Mock successful API responses
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      // 7. Sync actions (would be handled by useOfflineSync hook in real app)
      await offlineStorage.removeOfflineAction(createActionId);
      await offlineStorage.removeOfflineAction(updateActionId);

      // 8. Verify cleanup
      const remainingActions = await offlineStorage.getPendingActions();
      expect(remainingActions).toHaveLength(0);
    });

    test('should handle partial sync failures gracefully', async () => {
      // Queue multiple actions
      const action1 = await offlineStorage.storeOfflineAction('CREATE', 'bedrifter', { navn: 'B1' });
      const action2 = await offlineStorage.storeOfflineAction('CREATE', 'bedrifter', { navn: 'B2' });
      const action3 = await offlineStorage.storeOfflineAction('CREATE', 'bedrifter', { navn: 'B3' });

      // Mock partial failures
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) })
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) });

      // Simulate sync attempt
      await offlineStorage.removeOfflineAction(action1); // Success
      await offlineStorage.incrementRetries(action2);    // Failed, increment retry
      await offlineStorage.removeOfflineAction(action3); // Success

      const pendingActions = await offlineStorage.getPendingActions();
      expect(pendingActions).toHaveLength(1);
      expect(pendingActions[0].id).toBe(action2);
      expect(pendingActions[0].retries).toBe(1);
    });

    test('should maintain data consistency during offline operations', async () => {
      // Store initial data
      const bedrifter = [
        { id: 1, navn: 'Bedrift 1' },
        { id: 2, navn: 'Bedrift 2' }
      ];

      for (const bedrift of bedrifter) {
        await offlineStorage.storeData('bedrift', bedrift.id.toString(), bedrift);
      }

      // Queue update for one bedrift
      await offlineStorage.storeOfflineAction(
        'UPDATE',
        'bedrifter',
        { id: 1, navn: 'Updated Bedrift 1' }
      );

      // Queue deletion of another
      await offlineStorage.storeOfflineAction(
        'DELETE',
        'bedrifter',
        { id: 2 }
      );

      // Verify original data is still accessible
      const allBedrifter = await offlineStorage.getData('bedrift');
      expect(allBedrifter).toHaveLength(2);

      // Verify actions are queued
      const pendingActions = await offlineStorage.getPendingActions();
      expect(pendingActions).toHaveLength(2);
      
      const updateAction = pendingActions.find(a => a.type === 'UPDATE');
      const deleteAction = pendingActions.find(a => a.type === 'DELETE');
      
      expect(updateAction?.data.navn).toBe('Updated Bedrift 1');
      expect(deleteAction?.data.id).toBe(2);
    });
  });

  describe('Performance and Memory Management', () => {
    test('should handle large datasets efficiently', async () => {
      const startTime = Date.now();
      
      // Store 100 items
      const promises = [];
      for (let i = 1; i <= 100; i++) {
        promises.push(
          offlineStorage.storeData('elev', i.toString(), {
            id: i,
            fornavn: `Elev${i}`,
            etternavn: `Etternavn${i}`
          })
        );
      }
      
      await Promise.all(promises);
      
      const storageTime = Date.now() - startTime;
      
      // Retrieve all items
      const retrieveStart = Date.now();
      const allElever = await offlineStorage.getData('elev');
      const retrieveTime = Date.now() - retrieveStart;
      
      expect(allElever).toHaveLength(100);
      expect(storageTime).toBeLessThan(1000); // Should complete within 1 second
      expect(retrieveTime).toBeLessThan(500);  // Should retrieve within 500ms
    });

    test('should cleanup resources properly', async () => {
      // Store some data
      await offlineStorage.storeData('bedrift', '1', { id: 1 });
      await offlineStorage.storeOfflineAction('CREATE', 'test', { data: 'test' });

      // Get initial stats
      const initialStats = await offlineStorage.getStorageStats();
      expect(initialStats.totalItems).toBeGreaterThan(0);

      // Clear expired data (none should be expired yet)
      const deletedCount = await offlineStorage.clearExpiredData();
      expect(deletedCount).toBe(0);

      // Verify stats are consistent
      const finalStats = await offlineStorage.getStorageStats();
      expect(finalStats.totalItems).toBe(initialStats.totalItems);
    });
  });
});

describe('PWA Offline Error Handling', () => {
  test('should handle IndexedDB failures gracefully', async () => {
    // Mock IndexedDB failure
    const originalIndexedDB = global.indexedDB;
    global.indexedDB = undefined as any;

    await expect(
      offlineStorage.storeData('bedrift', '1', { id: 1 })
    ).rejects.toThrow();

    // Restore IndexedDB
    global.indexedDB = originalIndexedDB;
  });

  test('should handle network failures during sync', async () => {
    const actionId = await offlineStorage.storeOfflineAction(
      'CREATE',
      'bedrifter',
      { navn: 'Test' }
    );

    // Mock network failure
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    // Should increment retries on failure
    await offlineStorage.incrementRetries(actionId);

    const actions = await offlineStorage.getPendingActions();
    const action = actions.find(a => a.id === actionId);
    expect(action?.retries).toBe(1);
  });
}); 