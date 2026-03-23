/**
 * AUDIT-003: useOffline Hook
 * Provides offline-first capabilities to React components
 */

import { useState, useEffect, useCallback } from 'react';
import { offlineStorage, SyncResult } from '../utils/offline-storage';

interface UseOfflineOptions {
  /** Enable auto-sync when coming online */
  autoSync?: boolean;
  /** Callback when sync starts */
  onSyncStart?: () => void;
  /** Callback when sync completes */
  onSyncComplete?: (results: SyncResult[]) => void;
  /** Callback when sync fails */
  onSyncError?: (error: Error) => void;
  /** Callback when connection changes */
  onConnectionChange?: (isConnected: boolean) => void;
}

interface UseOfflineReturn {
  /** Current online status */
  isOnline: boolean;
  /** Whether sync is in progress */
  isSyncing: boolean;
  /** Number of pending operations in queue */
  pendingCount: number;
  /** Last successful sync time */
  lastSyncTime: number | null;
  /** Manually trigger sync */
  sync: () => Promise<SyncResult[]>;
  /** Clear all cached data */
  clearCache: () => Promise<void>;
  /** Get cached data */
  getCache: <T>(key: string) => Promise<T | null>;
  /** Set cached data */
  setCache: <T>(key: string, data: T, ttl?: number) => Promise<void>;
  /** Add operation to sync queue */
  queueOperation: (operation: {
    type: 'CREATE' | 'UPDATE' | 'DELETE';
    endpoint: string;
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    payload?: unknown;
    maxRetries?: number;
  }) => Promise<string>;
}

export function useOffline(options: UseOfflineOptions = {}): UseOfflineReturn {
  const {
    autoSync = true,
    onSyncStart,
    onSyncComplete,
    onSyncError,
    onConnectionChange,
  } = options;

  const [isOnline, setIsOnline] = useState<boolean>(offlineStorage.getIsOnline());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  // Update pending count
  const updatePendingCount = useCallback(async () => {
    const count = await offlineStorage.getPendingSyncCount();
    setPendingCount(count);
  }, []);

  // Update last sync time
  const updateLastSyncTime = useCallback(async () => {
    const time = await offlineStorage.getLastSyncTime();
    setLastSyncTime(time);
  }, []);

  // Setup event listeners
  useEffect(() => {
    const handleConnectionChange = (connected: boolean) => {
      setIsOnline(connected);
      onConnectionChange?.(connected);
    };

    const handleSyncStart = () => {
      setIsSyncing(true);
      onSyncStart?.();
    };

    const handleSyncComplete = (results: SyncResult[]) => {
      setIsSyncing(false);
      updatePendingCount();
      updateLastSyncTime();
      onSyncComplete?.(results);
    };

    const handleSyncError = (error: Error) => {
      setIsSyncing(false);
      onSyncError?.(error);
    };

    offlineStorage.on('connection:change', handleConnectionChange);
    offlineStorage.on('sync:start', handleSyncStart);
    offlineStorage.on('sync:complete', handleSyncComplete);
    offlineStorage.on('sync:error', handleSyncError);

    // Initial state
    updatePendingCount();
    updateLastSyncTime();

    return () => {
      offlineStorage.off('connection:change', handleConnectionChange);
      offlineStorage.off('sync:start', handleSyncStart);
      offlineStorage.off('sync:complete', handleSyncComplete);
      offlineStorage.off('sync:error', handleSyncError);
    };
  }, [
    onConnectionChange,
    onSyncStart,
    onSyncComplete,
    onSyncError,
    updatePendingCount,
    updateLastSyncTime,
  ]);

  // Manual sync trigger
  const sync = useCallback(async (): Promise<SyncResult[]> => {
    if (!isOnline) {
      throw new Error('Cannot sync while offline');
    }
    return offlineStorage.processSyncQueue();
  }, [isOnline]);

  // Clear cache
  const clearCache = useCallback(async (): Promise<void> => {
    await offlineStorage.clearAllCache();
  }, []);

  // Get cached data
  const getCache = useCallback(async <T>(key: string): Promise<T | null> => {
    return offlineStorage.getCache<T>(key);
  }, []);

  // Set cached data
  const setCache = useCallback(async <T>(
    key: string,
    data: T,
    ttl?: number
  ): Promise<void> => {
    await offlineStorage.setCache(key, data, ttl);
  }, []);

  // Queue operation for sync
  const queueOperation = useCallback(async (operation: {
    type: 'CREATE' | 'UPDATE' | 'DELETE';
    endpoint: string;
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    payload?: unknown;
    maxRetries?: number;
  }): Promise<string> => {
    const id = await offlineStorage.addToSyncQueue(operation);
    updatePendingCount();
    return id;
  }, [updatePendingCount]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncTime,
    sync,
    clearCache,
    getCache,
    setCache,
    queueOperation,
  };
}

export default useOffline;
