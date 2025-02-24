"use client";

import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

interface SyncItem<T = any> {
  id: string;
  timestamp: number;
  operation: "create" | "update" | "delete";
  resource: string;
  data: T;
  retries: number;
  synced: boolean;
}

interface OfflineSyncOptions {
  maxRetries?: number;
  retryDelay?: number;
  autoSync?: boolean;
  onSyncComplete?: () => void;
  onSyncError?: (error: Error) => void;
}

// IndexedDB setup
const DB_NAME = "agrismart";
const STORE_NAME = "offline_sync";
const DB_VERSION = 1;

export function useOfflineSync(options: OfflineSyncOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 5000,
    autoSync = true,
    onSyncComplete,
    onSyncError,
  } = options;

  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingItems, setPendingItems] = useState<SyncItem[]>([]);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  // Initialize IndexedDB
  const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
    });
  };

  // Generate unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (autoSync) void syncPendingItems();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [autoSync]);

  // Load pending items on mount
  useEffect(() => {
    void loadPendingItems();
  }, []);

  // Load pending items from IndexedDB
  const loadPendingItems = async () => {
    try {
      const db = await initDB();
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      return new Promise<void>((resolve, reject) => {
        request.onsuccess = () => {
          setPendingItems(request.result);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Failed to load pending items:", error);
    }
  };

  // Save pending items to IndexedDB
  const savePendingItems = async (items: SyncItem[]) => {
    try {
      const db = await initDB();
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      // Clear existing items
      store.clear();

      // Add new items
      items.forEach(item => store.add(item));

      return new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => {
          setPendingItems(items);
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error("Failed to save pending items:", error);
    }
  };

  // Add item to sync queue
  const queueItem = async <T>(
    operation: SyncItem["operation"],
    resource: string,
    data: T
  ) => {
    const item: SyncItem<T> = {
      id: generateId(),
      timestamp: Date.now(),
      operation,
      resource,
      data,
      retries: 0,
      synced: false,
    };

    const updatedItems = [...pendingItems, item];
    await savePendingItems(updatedItems);

    if (isOnline && autoSync) {
      void syncPendingItems();
    } else {
      toast({
        title: "Changes Saved Offline",
        description: "Your changes will sync when connection returns, like seeds waiting for rain.",
        variant: "default",
      });
    }

    return item;
  };

  // Sync pending items
  const syncPendingItems = async () => {
    if (isSyncing || !isOnline || pendingItems.length === 0) return;

    setIsSyncing(true);
    let remaining = [...pendingItems];

    try {
      toast({
        title: "Syncing Changes",
        description: "Like a garden after rain, your data is growing...",
        variant: "default",
      });

      for (const item of pendingItems) {
        if (item.retries >= maxRetries) {
          remaining = remaining.filter(i => i.id !== item.id);
          continue;
        }

        try {
          await syncItem(item);
          remaining = remaining.filter(i => i.id !== item.id);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          item.retries++;
          
          if (item.retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            remaining = remaining.map(i => 
              i.id === item.id ? { ...i, retries: item.retries } : i
            );
          }
        }
      }

      await savePendingItems(remaining);
      
      if (remaining.length === 0) {
        toast({
          title: "Changes Synced Successfully",
          description: "Your garden is now in full bloom.",
          variant: "success",
        });
        onSyncComplete?.();
      } else {
        toast({
          title: "Partial Sync Complete",
          description: `${pendingItems.length - remaining.length} changes synced, ${remaining.length} still growing.`,
          variant: "warning",
        });
      }
    } catch (error) {
      console.error("Sync failed:", error);
      onSyncError?.(error as Error);
      
      toast({
        title: "Sync Failed",
        description: "Like a drought in the garden, sync failed. Will try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync individual item
  const syncItem = async (item: SyncItem) => {
    const endpoint = `/api/${item.resource}`;
    
    const response = await fetch(endpoint, {
      method: item.operation === "create" ? "POST" 
        : item.operation === "update" ? "PUT"
        : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item.data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  };

  return {
    queueItem,
    syncPendingItems,
    isSyncing,
    isOnline,
    pendingItems,
    clearPendingItems: () => savePendingItems([]),
  };
}

export default useOfflineSync;