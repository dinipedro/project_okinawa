/**
 * AUDIT-003: Offline Storage Utility
 * Provides offline-first capabilities with local caching and sync queue
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { EventEmitter } from 'events';

// Storage keys
const STORAGE_KEYS = {
  CACHE_PREFIX: '@okinawa_cache:',
  SYNC_QUEUE: '@okinawa_sync_queue',
  LAST_SYNC: '@okinawa_last_sync',
  OFFLINE_DATA: '@okinawa_offline_data:',
} as const;

// Cache configuration
const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_QUEUE_SIZE: 100, // Maximum pending operations
} as const;

// Types
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: number;
}

interface SyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload?: unknown;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

interface OfflineStorageEvents {
  'sync:start': () => void;
  'sync:complete': (results: SyncResult[]) => void;
  'sync:error': (error: Error) => void;
  'connection:change': (isConnected: boolean) => void;
  'cache:cleared': () => void;
}

interface SyncResult {
  operationId: string;
  success: boolean;
  error?: string;
}

class OfflineStorageService extends EventEmitter {
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private cacheVersion: number = 1;
  private unsubscribeNetInfo: (() => void) | null = null;

  constructor() {
    super();
    this.initNetworkListener();
  }

  /**
   * Initialize network state listener
   */
  private initNetworkListener(): void {
    this.unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (wasOnline !== this.isOnline) {
        this.emit('connection:change', this.isOnline);

        // Auto-sync when coming back online
        if (this.isOnline && !wasOnline) {
          this.processSyncQueue();
        }
      }
    });
  }

  /**
   * Check if device is online
   */
  getIsOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Store data in cache with TTL
   */
  async setCache<T>(
    key: string,
    data: T,
    ttl: number = CACHE_CONFIG.DEFAULT_TTL
  ): Promise<void> {
    const cacheKey = `${STORAGE_KEYS.CACHE_PREFIX}${key}`;
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version: this.cacheVersion,
    };

    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('[OfflineStorage] Failed to set cache:', error);
      throw error;
    }
  }

  /**
   * Get data from cache (returns null if expired or not found)
   */
  async getCache<T>(key: string): Promise<T | null> {
    const cacheKey = `${STORAGE_KEYS.CACHE_PREFIX}${key}`;

    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);

      // Check if cache is expired
      if (Date.now() - cacheItem.timestamp > cacheItem.ttl) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }

      // Check cache version
      if (cacheItem.version !== this.cacheVersion) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('[OfflineStorage] Failed to get cache:', error);
      return null;
    }
  }

  /**
   * Remove specific cache entry
   */
  async removeCache(key: string): Promise<void> {
    const cacheKey = `${STORAGE_KEYS.CACHE_PREFIX}${key}`;
    try {
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('[OfflineStorage] Failed to remove cache:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  async clearAllCache(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter((key) =>
        key.startsWith(STORAGE_KEYS.CACHE_PREFIX)
      );
      await AsyncStorage.multiRemove(cacheKeys);
      this.emit('cache:cleared');
    } catch (error) {
      console.error('[OfflineStorage] Failed to clear cache:', error);
      throw error;
    }
  }

  /**
   * Add operation to sync queue (for offline mutations)
   */
  async addToSyncQueue(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retries'>): Promise<string> {
    const queue = await this.getSyncQueue();

    if (queue.length >= CACHE_CONFIG.MAX_QUEUE_SIZE) {
      throw new Error('Sync queue is full. Please try again when online.');
    }

    const newOperation: SyncOperation = {
      ...operation,
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: operation.maxRetries ?? 3,
    };

    queue.push(newOperation);
    await this.saveSyncQueue(queue);

    // Try to process immediately if online
    if (this.isOnline) {
      this.processSyncQueue();
    }

    return newOperation.id;
  }

  /**
   * Get current sync queue
   */
  async getSyncQueue(): Promise<SyncOperation[]> {
    try {
      const queue = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('[OfflineStorage] Failed to get sync queue:', error);
      return [];
    }
  }

  /**
   * Save sync queue
   */
  private async saveSyncQueue(queue: SyncOperation[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.error('[OfflineStorage] Failed to save sync queue:', error);
      throw error;
    }
  }

  /**
   * Process sync queue when online
   */
  async processSyncQueue(): Promise<SyncResult[]> {
    if (this.syncInProgress || !this.isOnline) {
      return [];
    }

    this.syncInProgress = true;
    this.emit('sync:start');

    const results: SyncResult[] = [];
    const queue = await this.getSyncQueue();
    const remainingQueue: SyncOperation[] = [];

    for (const operation of queue) {
      try {
        // Import api service dynamically to avoid circular dependency
        const { default: api } = await import('../services/api');

        await api.request({
          method: operation.method,
          url: operation.endpoint,
          data: operation.payload,
        });

        results.push({
          operationId: operation.id,
          success: true,
        });
      } catch (error: any) {
        operation.retries += 1;

        if (operation.retries < operation.maxRetries) {
          remainingQueue.push(operation);
        }

        results.push({
          operationId: operation.id,
          success: false,
          error: error.message || 'Unknown error',
        });
      }
    }

    await this.saveSyncQueue(remainingQueue);
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());

    this.syncInProgress = false;
    this.emit('sync:complete', results);

    return results;
  }

  /**
   * Get last sync timestamp
   */
  async getLastSyncTime(): Promise<number | null> {
    try {
      const lastSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return lastSync ? parseInt(lastSync, 10) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Store offline data for specific entity
   */
  async setOfflineData<T>(entityType: string, id: string, data: T): Promise<void> {
    const key = `${STORAGE_KEYS.OFFLINE_DATA}${entityType}:${id}`;
    try {
      await AsyncStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('[OfflineStorage] Failed to set offline data:', error);
      throw error;
    }
  }

  /**
   * Get offline data for specific entity
   */
  async getOfflineData<T>(entityType: string, id: string): Promise<T | null> {
    const key = `${STORAGE_KEYS.OFFLINE_DATA}${entityType}:${id}`;
    try {
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return null;
      const { data } = JSON.parse(stored);
      return data as T;
    } catch (error) {
      console.error('[OfflineStorage] Failed to get offline data:', error);
      return null;
    }
  }

  /**
   * Get all offline data for entity type
   */
  async getAllOfflineData<T>(entityType: string): Promise<Array<{ id: string; data: T }>> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const prefix = `${STORAGE_KEYS.OFFLINE_DATA}${entityType}:`;
      const entityKeys = allKeys.filter((key) => key.startsWith(prefix));

      const results: Array<{ id: string; data: T }> = [];
      for (const key of entityKeys) {
        const id = key.replace(prefix, '');
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const { data } = JSON.parse(stored);
          results.push({ id, data });
        }
      }

      return results;
    } catch (error) {
      console.error('[OfflineStorage] Failed to get all offline data:', error);
      return [];
    }
  }

  /**
   * Remove offline data
   */
  async removeOfflineData(entityType: string, id: string): Promise<void> {
    const key = `${STORAGE_KEYS.OFFLINE_DATA}${entityType}:${id}`;
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('[OfflineStorage] Failed to remove offline data:', error);
    }
  }

  /**
   * Get pending sync count
   */
  async getPendingSyncCount(): Promise<number> {
    const queue = await this.getSyncQueue();
    return queue.length;
  }

  /**
   * Cleanup on app unmount
   */
  cleanup(): void {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
      this.unsubscribeNetInfo = null;
    }
    this.removeAllListeners();
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageService();

// Export types
export type { CacheItem, SyncOperation, SyncResult, OfflineStorageEvents };
