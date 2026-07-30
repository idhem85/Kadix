/**
 * IndexedDB wrapper for offline storage.
 * Provides a simple promise-based API over IndexedDB.
 */

const DB_NAME = 'kadix-offline';
const DB_VERSION = 2;

export type StoreName =
  | 'grocery_items'
  | 'pantry_items'
  | 'recipes'
  | 'shopping_lists'
  | 'sync_queue'
  | 'sync_meta';

const STORES: StoreName[] = [
  'grocery_items',
  'pantry_items',
  'recipes',
  'shopping_lists',
  'sync_queue',
  'sync_meta',
];

export interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  payload: Record<string, unknown>;
  localId?: string;
  timestamp: number;
  retries: number;
  lastError?: string;
}

// Database connection singleton
let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create stores if they don't exist
      for (const storeName of STORES) {
        if (!db.objectStoreNames.contains(storeName)) {
          if (storeName === 'sync_queue') {
            const store = db.createObjectStore(storeName, {
              keyPath: 'id',
            });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('table', 'table', { unique: false });
          } else if (storeName === 'sync_meta') {
            db.createObjectStore(storeName, {
              keyPath: 'key',
            });
          } else {
            db.createObjectStore(storeName, {
              keyPath: 'id',
            });
          }
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

function getTransaction(
  storeName: StoreName,
  mode: IDBTransactionMode = 'readonly'
): Promise<IDBObjectStore> {
  return openDB().then((db) => {
    const tx = db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  });
}

// ============================================
// Public API
// ============================================

/** Get all items from a store */
export async function getAll<T = Record<string, unknown>>(
  storeName: StoreName
): Promise<T[]> {
  try {
    const store = await getTransaction(storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn(`IndexedDB: Failed to read ${storeName}:`, e);
    return [];
  }
}

/** Get a single item by key */
export async function get<T = Record<string, unknown>>(
  storeName: StoreName,
  key: string
): Promise<T | null> {
  try {
    const store = await getTransaction(storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve((request.result as T) ?? null);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn(`IndexedDB: Failed to read ${storeName}/${key}:`, e);
    return null;
  }
}

/** Put (insert or update) an item */
export async function put(
  storeName: StoreName,
  value: Record<string, unknown>
): Promise<void> {
  try {
    const store = await getTransaction(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(value);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn(`IndexedDB: Failed to write ${storeName}:`, e);
  }
}

/** Put multiple items in a single transaction */
export async function putMany(
  storeName: StoreName,
  values: Record<string, unknown>[]
): Promise<void> {
  if (values.length === 0) return;

  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    return new Promise((resolve, reject) => {
      for (const value of values) {
        store.put(value);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn(`IndexedDB: Failed to bulk write ${storeName}:`, e);
  }
}

/** Delete an item by key */
export async function del(
  storeName: StoreName,
  key: string
): Promise<void> {
  try {
    const store = await getTransaction(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn(`IndexedDB: Failed to delete ${storeName}/${key}:`, e);
  }
}

/** Clear all items from a store */
export async function clearStore(storeName: StoreName): Promise<void> {
  try {
    const store = await getTransaction(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn(`IndexedDB: Failed to clear ${storeName}:`, e);
  }
}

/** Get items from a store using an index */
export async function getByIndex<T = Record<string, unknown>>(
  storeName: StoreName,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);

    return new Promise((resolve, reject) => {
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn(`IndexedDB: Failed to query ${storeName} by ${indexName}:`, e);
    return [];
  }
}

/** Get the count of items in a store */
export async function count(storeName: StoreName): Promise<number> {
  try {
    const store = await getTransaction(storeName);
    return new Promise((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    return 0;
  }
}

/** Check if the database is accessible */
export async function isDBAvailable(): Promise<boolean> {
  try {
    await openDB();
    return true;
  } catch {
    return false;
  }
}
