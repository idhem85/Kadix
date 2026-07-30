import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Check, ShoppingBag, Zap } from 'lucide-react';
import { useGroceryStore } from '../../store/groceryStore';
import { toggleGroceryItem } from '../../lib/db';
import { getProductOrCategoryIcon, getCategoryIcon } from '../../lib/icons';
import type { GroceryItem } from '../../types';

const categoryOrder = [
  'Fruits & Légumes', 'Pains & Pâtisseries', 'Produits Laitiers', 'Viandes & Poissons',
  'Ingrédients & Épices', 'Surgelés & Plats Cuisinés', 'Pâtes, Riz & Céréales',
  'Snacks & Friandises', 'Boissons', 'Foyer', 'Soin & Santé', 'Animaux', 'Autre',
];

interface ShoppingModeProps {
  onExit: () => void;
  listId: string;
}

export default function ShoppingMode({ onExit }: ShoppingModeProps) {
  const { items, toggleItem } = useGroceryStore();
  const [checkAnim, setCheckAnim] = useState<string | null>(null);
  const [tickingItems, setTickingItems] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Sort items: unchecked first by category order, then checked at bottom
  const sortedItems = [...items].sort((a, b) => {
    if (a.is_checked !== b.is_checked) return a.is_checked ? 1 : -1;
    const aIdx = categoryOrder.indexOf(a.category);
    const bIdx = categoryOrder.indexOf(b.category);
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });

  const uncheckedItems = items.filter((i) => !i.is_checked);
  const checkedItems = items.filter((i) => i.is_checked);
  const totalCount = items.length;
  const doneCount = checkedItems.length;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Auto-scroll to first unchecked item when checking
  useEffect(() => {
    if (checkAnim && listRef.current) {
      const el = listRef.current.querySelector(`[data-item-id="${checkAnim}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [checkAnim]);

  const handleToggle = useCallback(async (item: GroceryItem) => {
    if (!item.is_checked) {
      setCheckAnim(item.id);
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10);
    }

    // Optimistic update
    toggleItem(item.id);
    await toggleGroceryItem(item.id, !item.is_checked);

    setTimeout(() => setCheckAnim(null), 400);
  }, [toggleItem]);

  const handleTickAll = useCallback(() => {
    setTickingItems(true);
    const unchecked = items.filter((i) => !i.is_checked);
    unchecked.forEach((item, index) => {
      setTimeout(async () => {
        toggleItem(item.id);
        await toggleGroceryItem(item.id, true);
        if (navigator.vibrate) navigator.vibrate(5);
      }, index * 60);
    });
    setTimeout(() => setTickingItems(false), unchecked.length * 60 + 200);
  }, [items, toggleItem]);

  // Group unchecked items by category
  const itemsByCategory: Record<string, GroceryItem[]> = {};
  for (const item of sortedItems) {
    if (!itemsByCategory[item.category]) itemsByCategory[item.category] = [];
    itemsByCategory[item.category].push(item);
  }

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-sage-950 overscroll-contain">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-sage-950/95 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-sage-300" />
              <span className="text-white font-extrabold text-sm tracking-wider">COURSES</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Progress badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl">
              <span className="text-white/80 text-xs font-bold tabular-nums">
                {doneCount}/{totalCount}
              </span>
              <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sage-400 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sage-400 text-[10px] font-bold">{progress}%</span>
            </div>
            <button
              onClick={onExit}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 
                flex items-center justify-center text-white/60 hover:text-white transition-all"
              aria-label="Quitter le mode courses"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 max-w-lg mx-auto w-full">
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
              <ShoppingBag size={36} className="text-white/20" />
            </div>
            <h2 className="text-white font-bold text-lg mb-1">Liste vide</h2>
            <p className="text-white/40 text-sm">Ajoutez des articles avant de partir faire vos courses.</p>
          </div>
        )}

        {/* Items by category */}
        {Object.entries(itemsByCategory).map(([category, categoryItems]) => {
          const hasUnchecked = categoryItems.some((i) => !i.is_checked);
          const CatIcon = getCategoryIcon(category);
          const uncheckedInCat = categoryItems.filter((i) => !i.is_checked).length;

          return (
            <div key={category} className="mb-2">
              {/* Category header (only if has unchecked) */}
              {hasUnchecked && (
                <div className="flex items-center gap-2 px-1 py-3">
                  <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                    <CatIcon size={14} className="text-white/60" />
                  </div>
                  <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">
                    {category}
                  </h3>
                  <span className="text-[10px] text-white/30 font-bold ml-auto">
                    {uncheckedInCat}
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                {categoryItems.map((item) => {
                  const ItemIcon = getProductOrCategoryIcon(item.name, item.category);
                  const isAnimating = checkAnim === item.id;

                  return (
                    <button
                      key={item.id}
                      data-item-id={item.id}
                      onClick={() => handleToggle(item)}
                      className={`w-full text-left transition-all duration-300 rounded-2xl overflow-hidden
                        ${item.is_checked
                          ? 'opacity-30 scale-[0.97]'
                          : 'active:scale-[0.98] hover:brightness-110'
                        }
                        ${isAnimating ? 'ring-2 ring-sage-400/50' : ''}
                      `}
                    >
                      <div className={`relative flex items-center gap-4 px-4 py-4
                        ${item.is_checked
                          ? 'bg-white/5'
                          : 'bg-white/10 hover:bg-white/[0.13]'
                        }
                      `}>
                        {/* Left accent bar */}
                        <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-full
                          ${item.is_checked ? 'bg-sage-700' : 'bg-sage-500'}
                        `} />

                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
                          transition-all duration-300
                          ${item.is_checked
                            ? 'bg-white/5 scale-90'
                            : 'bg-white/10'
                          }
                        `}>
                          <ItemIcon size={22} className={item.is_checked ? 'text-white/30' : 'text-white/70'} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-[16px] font-extrabold transition-all duration-300
                            ${item.is_checked
                              ? 'line-through text-white/30'
                              : 'text-white'
                            }
                          `}>
                            {item.name}
                          </p>
                          {item.quantity && (
                            <p className="text-xs text-white/40 mt-0.5 font-medium">
                              {item.quantity}{item.unit ? ` ${item.unit}` : ''}
                            </p>
                          )}
                        </div>

                        {/* Check indicator */}
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0
                          transition-all duration-300
                          ${item.is_checked
                            ? 'bg-sage-600 text-white scale-100'
                            : 'bg-white/10 text-white/30'
                          }
                        `}>
                          <Check size={22} strokeWidth={3}
                            className={`transition-all duration-300 ${
                              item.is_checked ? 'scale-100 animate-check-pop' : 'scale-0'
                            }`}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>

      {/* Bottom bar */}
      <div className="sticky bottom-0 bg-sage-950/95 backdrop-blur-lg border-t border-white/10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-white font-extrabold text-lg tabular-nums">
                {uncheckedItems.length}
              </span>
              <span className="text-white/40 text-xs font-medium">
                restant{uncheckedItems.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {uncheckedItems.length > 0 && (
              <button
                onClick={handleTickAll}
                disabled={tickingItems}
                className="flex items-center gap-2 px-4 py-2.5 bg-sage-600 hover:bg-sage-500 
                  disabled:bg-sage-700 disabled:cursor-not-allowed rounded-xl text-white 
                  font-extrabold text-xs transition-all active:scale-95"
              >
                <Zap size={14} />
                {tickingItems ? 'Dans le panier...' : 'Tout dans le panier'}
              </button>
            )}
            {uncheckedItems.length === 0 && totalCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-green-500/20 text-green-400 
                rounded-xl font-extrabold text-sm">
                <Check size={16} />
                Liste terminée ! 🎉
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
