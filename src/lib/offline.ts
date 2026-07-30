/**
 * Offline storage and sync system using IndexedDB.
 * Handles: pending operations queue, data caching, sync metadata.
 */

import {
  getAll,
  get,
  put,
  del,
  putMany,
  clearStore,
  count,
} from './indexeddb';
import type { SyncQueueItem } from './indexeddb';
import type { GroceryItem, PantryItem, Recipe, ShoppingList } from '../types';

// ============================================
// Queue Management
// ============================================

/** Add an operation to the sync queue */
export async function addToSyncQueue(op: {
  type: 'create' | 'update' | 'delete';
  table: string;
  payload: Record<string, unknown>;
  localId?: string;
}): Promise<void> {
  const item: SyncQueueItem = {
    id: crypto.randomUUID(),
    ...op,
    timestamp: Date.now(),
    retries: 0,
  };
  await put('sync_queue', item as unknown as Record<string, unknown>);
}

/** Get all pending sync operations, ordered by timestamp */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const items = await getAll<SyncQueueItem>('sync_queue');
  return items.sort((a, b) => a.timestamp - b.timestamp);
}

/** Get count of pending sync operations */
export async function getSyncQueueCount(): Promise<number> {
  return count('sync_queue');
}

/** Remove a completed operation from the queue */
export async function removeFromSyncQueue(opId: string): Promise<void> {
  await del('sync_queue', opId);
}

/** Clear the entire sync queue */
export async function clearSyncQueue(): Promise<void> {
  await clearStore('sync_queue');
}

// ============================================
// Data Caching (grocery items, pantry, recipes)
// ============================================

/** Cache grocery items locally */
export async function cacheGroceryItems(
  items: GroceryItem[]
): Promise<void> {
  await clearStore('grocery_items');
  if (items.length > 0) {
    await putMany(
      'grocery_items',
      items as unknown as Record<string, unknown>[]
    );
  }
}

/** Get cached grocery items */
export async function getCachedGroceryItems(): Promise<GroceryItem[]> {
  return getAll<GroceryItem>('grocery_items');
}

/** Cache a single grocery item */
export async function cacheGroceryItem(
  item: GroceryItem
): Promise<void> {
  await put(
    'grocery_items',
    item as unknown as Record<string, unknown>
  );
}

/** Remove a cached grocery item */
export async function removeCachedGroceryItem(id: string): Promise<void> {
  await del('grocery_items', id);
}

/** Cache pantry items */
export async function cachePantryItems(
  items: PantryItem[]
): Promise<void> {
  await clearStore('pantry_items');
  if (items.length > 0) {
    await putMany(
      'pantry_items',
      items as unknown as Record<string, unknown>[]
    );
  }
}

/** Get cached pantry items */
export async function getCachedPantryItems(): Promise<PantryItem[]> {
  return getAll<PantryItem>('pantry_items');
}

/** Cache recipes */
export async function cacheRecipes(recipes: Recipe[]): Promise<void> {
  await clearStore('recipes');
  if (recipes.length > 0) {
    await putMany(
      'recipes',
      recipes as unknown as Record<string, unknown>[]
    );
  }
}

/** Get cached recipes */
export async function getCachedRecipes(): Promise<Recipe[]> {
  return getAll<Recipe>('recipes');
}

/** Cache shopping lists */
export async function cacheShoppingLists(
  lists: ShoppingList[]
): Promise<void> {
  await clearStore('shopping_lists');
  if (lists.length > 0) {
    await putMany(
      'shopping_lists',
      lists as unknown as Record<string, unknown>[]
    );
  }
}

/** Get cached shopping lists */
export async function getCachedShoppingLists(): Promise<ShoppingList[]> {
  return getAll<ShoppingList>('shopping_lists');
}

// ============================================
// Sync Metadata
// ============================================

const SYNC_META_KEY = 'sync_state';
const LAST_SYNC_KEY = 'last_sync_time';

/** Save a sync metadata value */
async function setSyncMeta(key: string, value: string): Promise<void> {
  await put('sync_meta', { key, value });
}

/** Read a sync metadata value */
async function getSyncMeta(key: string): Promise<string | null> {
  const item = await get<{ key: string; value: string }>('sync_meta', key);
  return item?.value ?? null;
}

/** Mark the database as synced with these entity counts */
export async function markSynced(
  itemCount: number,
  pantryCount: number
): Promise<void> {
  await setSyncMeta(SYNC_META_KEY, 'synced');
  await setSyncMeta(LAST_SYNC_KEY, Date.now().toString());
  await setSyncMeta('item_count', itemCount.toString());
  await setSyncMeta('pantry_count', pantryCount.toString());
}

/** Mark that there are pending changes */
export async function markPendingChanges(): Promise<void> {
  await setSyncMeta(SYNC_META_KEY, 'pending');
}

/** Get the sync state */
export async function getSyncState(): Promise<{
  state: 'synced' | 'pending' | 'offline' | 'unknown';
  lastSync: number | null;
  pendingCount: number;
}> {
  const state = (await getSyncMeta(SYNC_META_KEY)) as
    | 'synced'
    | 'pending'
    | 'offline'
    | null;
  const lastSyncStr = await getSyncMeta(LAST_SYNC_KEY);
  const pendingCount = await getSyncQueueCount();

  return {
    state: state ?? 'unknown',
    lastSync: lastSyncStr ? parseInt(lastSyncStr, 10) : null,
    pendingCount,
  };
}

/** Mark that we went offline */
export async function markOffline(): Promise<void> {
  await setSyncMeta(SYNC_META_KEY, 'offline');
}

// ============================================
// Online/Offline Detection
// ============================================

export function isOnline(): boolean {
  return navigator.onLine;
}

export function onNetworkChange(
  callback: (online: boolean) => void
): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
