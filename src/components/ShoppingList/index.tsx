import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, RefreshCw, CheckCheck } from 'lucide-react';
import AddItemInput from './AddItemInput';
import GroceryItem from './GroceryItem';
import { useGroceryStore, useTabStore } from '../../store/groceryStore';
import { addGroceryItem, getGroceryItems, toggleGroceryItem, deleteGroceryItem, clearCheckedItems, addToPantry } from '../../lib/db';
import { useRealtimeSubscription } from '../../hooks/useRealtime';
import { getCategoryEmoji } from '../../types';
import type { GroceryItem as GroceryItemType } from '../../types';

interface ShoppingListProps {
  listId: string;
}

export default function ShoppingListView({ listId }: ShoppingListProps) {
  const { items, setItems, isLoading, setLoading } = useGroceryStore();
  const [isClearing, setIsClearing] = useState(false);

  useRealtimeSubscription(listId);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getGroceryItems(listId);
      setItems(data);
      setLoading(false);
    }
    load();
  }, [listId, setItems, setLoading]);

  const handleAdd = useCallback(async (name: string, category: string) => {
    const newItem = await addGroceryItem(listId, name, category);
    if (newItem) await addToPantry(name, category);
  }, [listId]);

  const handleToggle = useCallback(async (itemId: string, checked: boolean) => {
    await toggleGroceryItem(itemId, checked);
  }, []);

  const handleDelete = useCallback(async (itemId: string) => {
    await deleteGroceryItem(itemId);
  }, []);

  const handleClearChecked = useCallback(async () => {
    setIsClearing(true);
    await clearCheckedItems(listId);
    setIsClearing(false);
  }, [listId]);

  // Sort items: unchecked first (by category), then checked
  const uncheckedItems = items.filter((i) => !i.is_checked);
  const checkedItems = items.filter((i) => i.is_checked);

  // Group unchecked items by category
  const itemsByCategory = uncheckedItems.reduce<Record<string, GroceryItemType[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const checkedCount = checkedItems.length;
  const uncheckedCount = uncheckedItems.length;

  return (
    <div className="space-y-4">
      {/* Progress header */}
      {items.length > 0 && (
        <div className="bg-white rounded-2xl border border-sage-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{uncheckedCount === 0 ? '🎉' : '🛍️'}</span>
              <div>
                <p className="text-sm font-semibold text-sage-800">
                  {uncheckedCount === 0
                    ? 'Liste terminée !'
                    : `${uncheckedCount} article${uncheckedCount !== 1 ? 's' : ''}`
                  }
                </p>
                <p className="text-[11px] text-sage-400">
                  {checkedCount > 0
                    ? `${checkedCount} coché${checkedCount !== 1 ? 's' : ''}`
                    : 'Bonnes courses !'}
                </p>
              </div>
            </div>

            {checkedCount > 0 && (
              <button
                onClick={handleClearChecked}
                disabled={isClearing}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-sage-600 
                  hover:text-sage-800 bg-sage-100 hover:bg-sage-200 rounded-xl transition-all
                  disabled:opacity-50 active:scale-95"
              >
                <CheckCheck size={14} />
                <span>Vider ({checkedCount})</span>
              </button>
            )}
          </div>

          {/* Progress bar */}
          {items.length > 0 && (
            <div className="w-full h-1.5 bg-sage-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-sage-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.round((checkedCount / items.length) * 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-sage-100 to-sage-50 
            flex items-center justify-center mb-5 shadow-inner">
            <ShoppingBag size={40} className="text-sage-400" />
          </div>
          <h2 className="text-xl font-bold text-sage-700 mb-1">Votre liste est vide</h2>
          <p className="text-sm text-sage-400 max-w-xs leading-relaxed">
            Ajoutez vos premiers articles ci-dessous ou piochez dans vos 
            <button onClick={() => useTabStore.getState().setActiveTab('pantry')} 
              className="text-sage-600 font-medium mx-1 hover:underline">habitudes</button>
            pour les retrouver rapidement.
          </p>
        </div>
      )}

      {/* Unchecked items by category */}
      {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
        <div key={category} className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <span className="text-base">{getCategoryEmoji(category)}</span>
            <h3 className="text-xs font-bold text-sage-500 uppercase tracking-wider">
              {category}
            </h3>
            <span className="text-[10px] text-sage-300 font-medium ml-auto">
              {categoryItems.length}
            </span>
          </div>
          <div className="space-y-2">
            {categoryItems.map((item) => (
              <GroceryItem key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      ))}

      {/* Checked items section */}
      {checkedItems.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-sage-100">
          <div className="flex items-center gap-2 px-1">
            <CheckCheck size={14} className="text-sage-400" />
            <h3 className="text-xs font-bold text-sage-400 uppercase tracking-wider">
              Déjà dans le panier
            </h3>
            <span className="text-[10px] text-sage-300 font-medium ml-auto">
              {checkedItems.length}
            </span>
          </div>
          <div className="space-y-2">
            {checkedItems.map((item) => (
              <GroceryItem key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={22} className="text-sage-400 animate-spin" />
        </div>
      )}

      {/* Quick add */}
      <div className="sticky bottom-20 pt-3 pb-2 bg-gradient-to-t from-cream-50 via-cream-50/95 to-transparent">
        <AddItemInput onAdd={handleAdd} />
      </div>
    </div>
  );
}
