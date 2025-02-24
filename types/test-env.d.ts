/// <reference types="vitest" />
/// <reference types="@testing-library/react" />

interface Navigator {
  readonly onLine: boolean;
  readonly connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  };
}

interface Window {
  indexedDB: IDBFactory;
}

interface WorkerNavigator {
  readonly onLine: boolean;
}

// Mock Service Worker
interface ServiceWorkerRegistration {
  readonly active: ServiceWorker | null;
  readonly installing: ServiceWorker | null;
  readonly waiting: ServiceWorker | null;
  readonly scope: string;
  update(): Promise<void>;
  unregister(): Promise<boolean>;
}

interface ServiceWorkerContainer {
  readonly controller: ServiceWorker | null;
  readonly ready: Promise<ServiceWorkerRegistration>;
  register(scriptURL: string, options?: RegistrationOptions): Promise<ServiceWorkerRegistration>;
  getRegistration(scope?: string): Promise<ServiceWorkerRegistration | undefined>;
  getRegistrations(): Promise<ReadonlyArray<ServiceWorkerRegistration>>;
}

// Mock IndexedDB
interface IDBFactory {
  open(name: string, version?: number): IDBOpenDBRequest;
  deleteDatabase(name: string): IDBOpenDBRequest;
  cmp(first: any, second: any): number;
}

interface IDBDatabase {
  readonly name: string;
  readonly version: number;
  readonly objectStoreNames: DOMStringList;
  close(): void;
  createObjectStore(name: string, optionalParameters?: IDBObjectStoreParameters): IDBObjectStore;
  deleteObjectStore(name: string): void;
  transaction(storeNames: string | string[], mode?: IDBTransactionMode): IDBTransaction;
}

// Mock Event Interfaces
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Mock Storage Interfaces
interface StorageEstimate {
  quota?: number;
  usage?: number;
}

interface NavigatorStorage {
  estimate(): Promise<StorageEstimate>;
  persist?(): Promise<boolean>;
  persisted?(): Promise<boolean>;
}

// Global test utilities
declare global {
  interface Window {
    skipTestWaiting?: boolean;
    __TEST_ENV__?: {
      onLine: boolean;
      storageEstimate: StorageEstimate;
    };
  }

  namespace Vi {
    interface Assertion<T = any> {
      toHaveBeenCalledWithMatch(match: Record<string, any>): T;
    }
  }

  interface Navigator {
    storage: NavigatorStorage;
  }
}

// Mock Cache Interfaces
interface CacheStorage {
  match(request: RequestInfo, options?: CacheQueryOptions): Promise<Response | undefined>;
  has(cacheName: string): Promise<boolean>;
  open(cacheName: string): Promise<Cache>;
  delete(cacheName: string): Promise<boolean>;
  keys(): Promise<string[]>;
}

interface Cache {
  match(request: RequestInfo, options?: CacheQueryOptions): Promise<Response | undefined>;
  add(request: RequestInfo): Promise<void>;
  addAll(requests: RequestInfo[]): Promise<void>;
  put(request: RequestInfo, response: Response): Promise<void>;
  delete(request: RequestInfo, options?: CacheQueryOptions): Promise<boolean>;
  keys(request?: RequestInfo, options?: CacheQueryOptions): Promise<Request[]>;
}

export {};
