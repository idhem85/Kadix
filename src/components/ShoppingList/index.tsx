import { useState, useEffect, useCallback } from 'react';
import { Trash2, ShoppingBag, RefreshCw } from 'lucide-react';
import AddItemInput from './AddItemInput';
import GroceryItem from './GroceryItem';
import { useGroceryStore } from '../../store/groceryStore';
import { addGroceryItem, getGroceryItems, toggleGroceryItem, deleteGroceryItem, clearCheckedItems, addToPantry } from '../../lib/db';
import { useRealtimeSubscription } from '../../hooks/useRealtime';
import type { GroceryItem as GroceryItemType } from '../../types';

interface ShoppingListProps {
  listId: string;
}

export default function ShoppingListView({ listId }: ShoppingListProps) {
  const { items, setItems, isLoading, setLoading } = useGroceryStore();
  const [isClearing, setIsClearing] = useState(false);

  // Subscribe to realtime changes
  useRealtimeSubscription(listId);

  // Load items
  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getGroceryItems(listId);
      setItems(data);
      setLoading(false);
    }
    load();
  }, [listId, setItems, setLoading]);

  const handleAdd = useCallback(
    async (name: string, category: string) => {
      // Add to grocery list
      const newItem = await addGroceryItem(listId, name, category);
      if (newItem) {
        // Also add/update in pantry
        await addToPantry(name, category);
      }
    },
    [listId]
  );

  const handleToggle = useCallback(
    async (itemId: string, checked: boolean) => {
      await toggleGroceryItem(itemId, checked);
    },
    []
  );

  const handleDelete = useCallback(
    async (itemId: string) => {
      await deleteGroceryItem(itemId);
    },
    []
  );

  const handleClearChecked = useCallback(async () => {
    setIsClearing(true);
    await clearCheckedItems(listId);
    setIsClearing(false);
  }, [listId]);

  // Group items by category
  const itemsByCategory = items.reduce<Record<string, GroceryItemType[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    // Push checked items to the end
    if (item.is_checked) {
      acc[item.category].push(item);
    } else {
      acc[item.category].unshift(item);
    }
    return acc;
  }, {});

  const checkedCount = items.filter((i) => i.is_checked).length;
  const uncheckedItems = items.filter((i) => !i.is_checked);

  return (
    <div className="space-y-4">
      {/* Header stats */}
      {items.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-sage-500">
            {uncheckedItems.length} article{uncheckedItems.length !== 1 ? 's' : ''} restant{uncheckedItems.length !== 1 ? 's' : ''}
          </p>
          {checkedCount > 0 && (
            <button
              onClick={handleClearChecked}
              disabled={isClearing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-sage-600 hover:text-sage-800 bg-sage-100 hover:bg-sage-200 rounded-full transition-all disabled:opacity-50"
            >
              <Trash2 size={14} />
              <span>Vider ({checkedCount})</span>
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-sage-100 flex items-center justify-center mb-4">
            <ShoppingBag size={36} className="text-sage-400" />
          </div>
          <h2 className="text-lg font-semibold text-sage-700 mb-1">
            Votre liste est vide
          </h2>
          <p className="text-sm text-sage-400 max-w-xs">
            Ajoutez vos premiers articles ci-dessous ou explorez vos habitudes pour les retrouver rapidement.
          </p>
        </div>
      )}

      {/* Items grouped by category */}
      {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
        <div key={category} className="space-y-2">
          {categoryItems.some((item) => !item.is_checked) && (
            <h3 className="text-xs font-semibold text-sage-400 uppercase tracking-wider px-1 pt-2">
              {category}
            </h3>
          )}
          <div className="space-y-2">
            {categoryItems.map((item) => (
              <GroceryItem
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw size={24} className="text-sage-400 animate-spin" />
        </div>
      )}

      {/* Quick add input - fixed at bottom */}
      <div className="sticky bottom-20 pt-2 pb-2 bg-gradient-to-t from-cream-50 via-cream-50 to-transparent">
        <AddItemInput onAdd={handleAdd} />
      </div>
    </div>
  );
}
