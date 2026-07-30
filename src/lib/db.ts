import { supabase } from './supabase';
import {
  isOnline,
  addToSyncQueue,
  cacheGroceryItem,
  cacheGroceryItems,
  removeCachedGroceryItem,
  cachePantryItems,
  cacheRecipes,
  getCachedGroceryItems,
  getCachedPantryItems,
  getCachedRecipes,
  getCachedShoppingLists,
  cacheShoppingLists,
} from './offline';
import type { GroceryItem, ShoppingList, PantryItem, Recipe } from '../types';

// ============================================
// Helper: check if supabase is configured
// ============================================
function isSupabaseConfigured(): boolean {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}

// ============================================
// Offline-first mutation helper
// ============================================
async function offlineSafeInsert<T>(
  table: string,
  payload: Record<string, unknown>,
  localCacheFn: (item: T) => Promise<void>,
  optimisticItem: T
): Promise<T | null> {
  if (isOnline() && isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from(table)
      .insert(payload)
      .select()
      .single();

    if (!error && data) {
      // Also add to local cache for speed
      await localCacheFn(data as T);
      return data as T;
    }

    if (error) {
      console.warn(`Supabase insert failed (queueing):`, error.message);
    }
  }

  // Offline or error: queue and return optimistic data
  await addToSyncQueue({
    type: 'create',
    table,
    payload,
  });
  await localCacheFn(optimisticItem);
  return optimisticItem;
}

async function offlineSafeUpdate(
  table: string,
  id: string,
  updates: Record<string, unknown>,
  optimisticItem: Record<string, unknown>
): Promise<boolean> {
  if (isOnline() && isSupabaseConfigured()) {
    const { error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id);

    if (!error) {
      await cacheGroceryItem(optimisticItem as unknown as GroceryItem);
      return true;
    }
    console.warn(`Supabase update failed (queueing):`, error.message);
  }

  // Offline or error: queue
  await addToSyncQueue({
    type: 'update',
    table,
    payload: { id, ...updates },
  });
  await cacheGroceryItem(optimisticItem as unknown as GroceryItem);
  return true;
}

async function offlineSafeDelete(
  table: string,
  id: string,
  localRemoveFn: (id: string) => Promise<void>
): Promise<boolean> {
  if (isOnline() && isSupabaseConfigured()) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) {
      await localRemoveFn(id);
      return true;
    }
    console.warn(`Supabase delete failed (queueing):`, error.message);
  }

  // Offline or error: queue
  await addToSyncQueue({
    type: 'delete',
    table,
    payload: { id },
  });
  await localRemoveFn(id);
  return true;
}

// ============================================
// Shopping Lists
// ============================================

export async function createShoppingList(
  title: string = 'Ma liste de courses'
): Promise<ShoppingList | null> {
  const optimisticId = crypto.randomUUID();
  const optimistic: ShoppingList = {
    id: optimisticId,
    owner_id: 'offline',
    title,
    invite_code: '------',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return offlineSafeInsert<ShoppingList>(
    'shopping_lists',
    { title },
    async (item) => {
      await cacheShoppingLists([item]);
    },
    optimistic
  );
}

export async function getShoppingLists(): Promise<ShoppingList[]> {
  // Try Supabase first
  if (isOnline() && isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('shopping_lists')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      await cacheShoppingLists(data);
      return data;
    }
  }

  // Fallback to cache
  return getCachedShoppingLists();
}

export async function getListByInviteCode(
  code: string
): Promise<ShoppingList | null> {
  if (isOnline() && isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('invite_code', code)
      .single();

    if (!error) return data;
  }
  return null;
}

export async function joinListByInviteCode(code: string): Promise<boolean> {
  if (!isOnline() || !isSupabaseConfigured()) return false;
  const list = await getListByInviteCode(code);
  if (!list) return false;

  const { error } = await supabase
    .from('list_members')
    .insert({ list_id: list.id, role: 'editor' });

  if (error) {
    console.error('Error joining list:', error);
    return false;
  }
  return true;
}

// ============================================
// Grocery Items
// ============================================

export async function addGroceryItem(
  listId: string,
  name: string,
  category: string,
  quantity: string = '1',
  unit: string | null = null,
  notes: string | null = null
): Promise<GroceryItem | null> {
  const now = new Date().toISOString();
  const optimisticId = crypto.randomUUID();

  const optimistic: GroceryItem = {
    id: optimisticId,
    list_id: listId,
    name,
    category,
    quantity,
    unit,
    notes,
    added_by: null,
    is_checked: false,
    checked_by: null,
    checked_at: null,
    sort_order: 0,
    created_at: now,
    updated_at: now,
  };

  return offlineSafeInsert<GroceryItem>(
    'grocery_items',
    { list_id: listId, name, category, quantity, unit, notes },
    async (item) => {
      await cacheGroceryItem(item);
    },
    optimistic
  );
}

export async function toggleGroceryItem(
  itemId: string,
  isChecked: boolean
): Promise<boolean> {
  const now = new Date().toISOString();
  const updates: Partial<GroceryItem> = {
    is_checked: isChecked,
    checked_at: isChecked ? now : null,
  };

  // Build optimistic update
  const cachedItems = await getCachedGroceryItems();
  const existing = cachedItems.find((i) => i.id === itemId);
  const optimisticItem: GroceryItem = {
    ...(existing ?? {
      id: itemId,
      list_id: '',
      name: '',
      quantity: '1',
      unit: null,
      category: 'Autre',
      notes: null,
      added_by: null,
      is_checked: false,
      checked_by: null,
      checked_at: null,
      sort_order: 0,
      created_at: now,
      updated_at: now,
    }),
    ...updates,
    updated_at: now,
  };

  return offlineSafeUpdate(
    'grocery_items',
    itemId,
    updates,
    optimisticItem
  );
}

export async function deleteGroceryItem(itemId: string): Promise<boolean> {
  return offlineSafeDelete('grocery_items', itemId, async (id) => {
    await removeCachedGroceryItem(id);
  });
}

export async function clearCheckedItems(listId: string): Promise<boolean> {
  // Get checked items
  const cachedItems = await getCachedGroceryItems();
  const checkedItems = cachedItems.filter(
    (i) => i.list_id === listId && i.is_checked
  );

  // Try online
  if (isOnline() && isSupabaseConfigured()) {
    const { error } = await supabase
      .from('grocery_items')
      .delete()
      .eq('list_id', listId)
      .eq('is_checked', true);

    if (!error) {
      // Remove from cache
      for (const item of checkedItems) {
        await removeCachedGroceryItem(item.id);
      }
      return true;
    }
  }

  // Offline: queue each deletion
  for (const item of checkedItems) {
    await addToSyncQueue({
      type: 'delete',
      table: 'grocery_items',
      payload: { id: item.id },
    });
    await removeCachedGroceryItem(item.id);
  }

  return true;
}

export async function archiveCheckedItems(listId: string): Promise<boolean> {
  return clearCheckedItems(listId);
}

export async function getGroceryItems(
  listId: string
): Promise<GroceryItem[]> {
  // Try Supabase first
  if (isOnline() && isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('grocery_items')
      .select('*')
      .eq('list_id', listId)
      .order('is_checked', { ascending: true })
      .order('sort_order', { ascending: true });

    if (!error && data) {
      await cacheGroceryItems(data);
      return data;
    }
  }

  // Fallback to cache
  const cached = await getCachedGroceryItems();
  return cached.filter((i) => i.list_id === listId);
}

export async function updateItemQuantity(
  itemId: string,
  quantity: string,
  unit: string | null
): Promise<boolean> {
  const cachedItems = await getCachedGroceryItems();
  const existing = cachedItems.find((i) => i.id === itemId);
  if (!existing) return false;

  const optimisticItem: GroceryItem = {
    ...existing,
    quantity,
    unit,
    updated_at: new Date().toISOString(),
  };

  return offlineSafeUpdate(
    'grocery_items',
    itemId,
    { quantity, unit },
    optimisticItem
  );
}

// ============================================
// Pantry
// ============================================

export async function addToPantry(
  name: string,
  category: string
): Promise<PantryItem | null> {
  if (isOnline() && isSupabaseConfigured()) {
    // Check if already exists
    const { data: existing } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('name', name)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('pantry_items')
        .update({
          frequency: existing.frequency + 1,
          last_added_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (!error && data) {
        await cachePantryItems(
          (await getCachedPantryItems()).map((p) =>
            p.id === data.id ? data : p
          )
        );
        return data;
      }
    } else {
      const { data, error } = await supabase
        .from('pantry_items')
        .insert({ name, category })
        .select()
        .single();

      if (!error && data) {
        await cachePantryItems([
          data,
          ...(await getCachedPantryItems()),
        ]);
        return data;
      }
    }
  }

  // Offline: use optimistic approach
  const now = new Date().toISOString();
  const optimistic: PantryItem = {
    id: crypto.randomUUID(),
    user_id: 'offline',
    name,
    category,
    frequency: 1,
    last_added_at: now,
    created_at: now,
  };

  await addToSyncQueue({
    type: 'create',
    table: 'pantry_items',
    payload: { name, category },
  });

  return optimistic;
}

export async function getPantryItems(): Promise<PantryItem[]> {
  if (isOnline() && isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .order('frequency', { ascending: false })
      .order('last_added_at', { ascending: false });

    if (!error && data) {
      await cachePantryItems(data);
      return data;
    }
  }

  return getCachedPantryItems();
}

export async function removeFromPantry(itemId: string): Promise<boolean> {
  return offlineSafeDelete('pantry_items', itemId, async (id) => {
    const items = await getCachedPantryItems();
    await cachePantryItems(items.filter((i) => i.id !== id));
  });
}

// ============================================
// Recipes
// ============================================

export async function getRecipes(): Promise<Recipe[]> {
  if (isOnline() && isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('prep_time_min', { ascending: true });

    if (!error && data) {
      await cacheRecipes(data);
      return data;
    }
  }

  return getCachedRecipes();
}
