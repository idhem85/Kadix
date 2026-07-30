import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useGroceryStore } from '../store/groceryStore';
import type { GroceryItem } from '../types';

interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
  old: Record<string, unknown>;
  errors: string[] | null;
}

export function useRealtimeSubscription(listId: string | null) {
  const { addItem, updateItem, removeItem } = useGroceryStore();

  useEffect(() => {
    if (!listId) return;
    if (!supabase) return;

    // Subscribe to changes on the grocery_items table
    const channel = supabase
      .channel(`grocery-items-${listId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grocery_items',
          filter: `list_id=eq.${listId}`,
        },
        (payload: RealtimePayload) => {
          const newRecord = payload.new as unknown as GroceryItem;
          const oldRecord = payload.old as unknown as GroceryItem;

          switch (payload.eventType) {
            case 'INSERT':
              if (newRecord) addItem(newRecord);
              break;
            case 'UPDATE':
              if (newRecord) updateItem(newRecord);
              break;
            case 'DELETE':
              if (oldRecord) removeItem(oldRecord.id);
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listId, addItem, updateItem, removeItem]);
}
