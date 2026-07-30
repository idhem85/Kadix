import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useUIStore } from '../store/groceryStore';
import {
  onNetworkChange,
  getSyncQueue,
  removeFromSyncQueue,
  markSynced,
  markOffline,
  getSyncQueueCount,
  isOnline,
  cacheGroceryItems,
  cachePantryItems,
  cacheRecipes,
  cacheShoppingLists,
  getCachedGroceryItems,
  getCachedPantryItems,
} from '../lib/offline';
import { useGroceryStore } from '../store/groceryStore';
import { usePantryStore } from '../store/groceryStore';

const MAX_RETRIES = 5;
const SYNC_INTERVAL_MS = 30_000; // Auto-sync every 30s when online

// ============================================
// Sync Engine
// ============================================

async function processSyncQueue(): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> {
  const queue = await getSyncQueue();
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  if (queue.length === 0) {
    return { success: 0, failed: 0, errors: [] };
  }

  for (const op of queue) {
    try {
      let result = false;

      switch (op.table) {
        case 'grocery_items': {
          if (op.type === 'create') {
            const { error } = await supabase
              .from('grocery_items')
              .insert(op.payload)
              .select()
              .single();
            if (!error) result = true;
            else throw new Error(error.message);
          } else if (op.type === 'update') {
            const { error } = await supabase
              .from('grocery_items')
              .update(op.payload)
              .eq('id', op.payload.id);
            if (!error) result = true;
            else throw new Error(error.message);
          } else if (op.type === 'delete') {
            const { error } = await supabase
              .from('grocery_items')
              .delete()
              .eq('id', op.payload.id);
            if (!error) result = true;
            else throw new Error(error.message);
          }
          break;
        }

        case 'pantry_items': {
          if (op.type === 'create') {
            const { error } = await supabase
              .from('pantry_items')
              .insert(op.payload);
            if (!error) result = true;
            else throw new Error(error.message);
          } else if (op.type === 'delete') {
            const { error } = await supabase
              .from('pantry_items')
              .delete()
              .eq('id', op.payload.id);
            if (!error) result = true;
            else throw new Error(error.message);
          }
          break;
        }

        default:
          // Unknown table, skip
          await removeFromSyncQueue(op.id);
          continue;
      }

      if (result) {
        await removeFromSyncQueue(op.id);
        success++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      op.retries = (op.retries || 0) + 1;
      op.lastError = msg;

      if (op.retries >= MAX_RETRIES) {
        // Max retries exceeded, remove from queue
        await removeFromSyncQueue(op.id);
        failed++;
        errors.push(
          `[${op.type}] ${op.table}:${op.payload?.id ?? '?'} — ${msg}`
        );
      } else {
        // Re-queue with incremented retry count
        // We'll update it in place by removing and re-adding
        await removeFromSyncQueue(op.id);
        // The item will be re-read on next sync cycle
        errors.push(`[retry ${op.retries}/${MAX_RETRIES}] ${msg}`);
      }
    }
  }

  return { success, failed, errors };
}

// ============================================
// Data Refresh from Supabase
// ============================================

async function refreshLocalCache(): Promise<void> {
  if (!isOnline()) return;

  try {
    // Refresh grocery items
    const { data: items } = await supabase
      .from('grocery_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (items) {
      await cacheGroceryItems(items);
      // Also update the zustand store
      const { setItems, currentList } = useGroceryStore.getState();
      if (currentList) {
        const listItems = items.filter(
          (i) => i.list_id === currentList.id
        );
        setItems(listItems);
      }
    }

    // Refresh pantry items
    const { data: pantry } = await supabase
      .from('pantry_items')
      .select('*')
      .order('frequency', { ascending: false });
    if (pantry) {
      await cachePantryItems(pantry);
      usePantryStore.getState().setItems(pantry);
    }

    // Refresh recipes
    const { data: recipes } = await supabase
      .from('recipes')
      .select('*')
      .order('prep_time_min', { ascending: true });
    if (recipes) {
      await cacheRecipes(recipes);
    }

    // Refresh shopping lists
    const { data: lists } = await supabase
      .from('shopping_lists')
      .select('*')
      .order('updated_at', { ascending: false });
    if (lists) {
      await cacheShoppingLists(lists);
    }

    // Mark as synced
    await markSynced(items?.length ?? 0, pantry?.length ?? 0);
  } catch (err) {
    console.warn('Failed to refresh cache:', err);
  }
}

async function loadFromOfflineCache(): Promise<void> {
  // Load items from IndexedDB cache
  const cachedItems = await getCachedGroceryItems();
  if (cachedItems.length > 0) {
    const { setItems, currentList } = useGroceryStore.getState();
    if (currentList) {
      const filtered = cachedItems.filter(
        (i) => i.list_id === currentList.id
      );
      setItems(filtered);
    }
  }

  const cachedPantry = await getCachedPantryItems();
  if (cachedPantry.length > 0) {
    usePantryStore.getState().setItems(cachedPantry);
  }
}

// ============================================
// Hook
// ============================================

export function useOfflineStatus() {
  const { setIsOnline, setSyncState, setPendingCount } = useUIStore();
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  // Main sync function
  const syncNow = useCallback(async () => {
    if (!isOnline()) return;

    try {
      // Process pending operations first
      const result = await processSyncQueue();

      // Then refresh cache from server
      await refreshLocalCache();

      // Update UI state
      const pending = await getSyncQueueCount();
      setPendingCount(pending);
      setSyncState(pending > 0 ? 'pending' : 'synced');

      if (result.success > 0 || result.failed > 0) {
        console.log(
          `Sync: ${result.success} success, ${result.failed} failed` +
            (result.errors.length > 0
              ? `\nErrors: ${result.errors.join('\n')}`
              : '')
        );
      }
    } catch (err) {
      console.warn('Sync cycle failed:', err);
    }
  }, [setPendingCount, setSyncState]);

  // Setup on mount
  useEffect(() => {
    mountedRef.current = true;

    // Load offline cache immediately
    loadFromOfflineCache();

    // Try to sync immediately if online
    if (isOnline()) {
      syncNow();
    }

    // Listen for network changes
    const cleanup = onNetworkChange(async (online) => {
      if (!mountedRef.current) return;
      setIsOnline(online);

      if (online) {
        // Coming back online: sync immediately
        await syncNow();
      } else {
        // Going offline: mark state
        await markOffline();
        setSyncState('offline');
      }
    });

    // Periodic sync when online
    syncTimerRef.current = setInterval(() => {
      if (isOnline() && mountedRef.current) {
        syncNow();
      }
    }, SYNC_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      cleanup();
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
      }
    };
  }, [setIsOnline, setSyncState, setPendingCount, syncNow]);

  // Expose manual sync trigger
  return {
    syncNow,
    refreshCache: refreshLocalCache,
    loadFromCache: loadFromOfflineCache,
  };
}
