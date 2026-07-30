import { useState, useEffect, useCallback } from 'react';
import { Archive, Plus, X, RefreshCw, ShoppingCart, Sparkles } from 'lucide-react';
import { usePantryStore } from '../../store/groceryStore';
import { getPantryItems, removeFromPantry, addGroceryItem, addToPantry as addToPantryDb } from '../../lib/db';
import { PRODUCT_CATEGORIES, COMMON_PRODUCTS, getProductEmoji, getCategoryEmoji, CATEGORY_EMOJIS } from '../../types';

interface PantryProps {
  listId: string;
}

export default function PantryView({ listId }: PantryProps) {
  const { items, setItems, removeItem } = usePantryStore();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getPantryItems();
      setItems(data);
      setIsLoading(false);
    }
    load();
  }, [setItems]);

  const handleAddToCart = useCallback(
    async (name: string, category: string) => {
      if (!listId) return;
      setAddingToCart(name);
      await addGroceryItem(listId, name, category);
      await addToPantryDb(name, category);
      setTimeout(() => setAddingToCart(null), 500);
    },
    [listId]
  );

  const handleRemove = useCallback(
    async (itemId: string) => {
      await removeFromPantry(itemId);
      removeItem(itemId);
    },
    [removeItem]
  );

  const allCommonProducts = Object.entries(COMMON_PRODUCTS).flatMap(
    ([category, products]) => products.map((name) => ({ name, category }))
  );

  const pantryNames = new Set(items.map((i) => i.name.toLowerCase()));
  const suggestedProducts = allCommonProducts.filter(
    (p) => !pantryNames.has(p.name.toLowerCase())
  );

  const filteredProducts = searchQuery
    ? suggestedProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : selectedCategory
    ? suggestedProducts.filter((p) => p.category === selectedCategory)
    : suggestedProducts;

  const sortedPantry = [...items].sort((a, b) => b.frequency - a.frequency);

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg z-10">🔍</div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un produit..."
          className="w-full pl-12 pr-10 py-3.5 bg-white/90 backdrop-blur-sm border-2 border-sage-200 
            focus:border-sage-400 rounded-2xl text-sage-800 placeholder-sage-400 outline-none 
            transition-all text-[15px] shadow-sm focus:shadow-lg focus:shadow-sage-200/30"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full 
              flex items-center justify-center text-sage-400 hover:text-sage-600 
              hover:bg-sage-100 transition-all"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category filters */}
      {!searchQuery && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5
              ${!selectedCategory
                ? 'bg-sage-600 text-white border-sage-600 shadow-sm shadow-sage-600/20'
                : 'bg-white text-sage-500 border-sage-200 hover:border-sage-300 hover:shadow-sm'
              }`}
          >
            <span>📋</span> Tout
          </button>
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border whitespace-nowrap 
                transition-all flex items-center gap-1.5
                ${cat === selectedCategory
                  ? 'bg-sage-600 text-white border-sage-600 shadow-sm shadow-sage-600/20'
                  : 'bg-white text-sage-500 border-sage-200 hover:border-sage-300 hover:shadow-sm'
                }`}
            >
              <span>{CATEGORY_EMOJIS[cat] || '📦'}</span>
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Mes produits fréquents */}
      {!searchQuery && items.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Archive size={16} className="text-sage-500" />
            <h2 className="text-sm font-extrabold text-sage-700 uppercase tracking-wider">Mes habitudes</h2>
            <span className="text-[10px] text-sage-400 bg-sage-100 px-2 py-0.5 rounded-full font-bold">
              {items.length}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {sortedPantry.map((item) => {
              const emoji = getProductEmoji(item.name);
              return (
                <div
                  key={item.id}
                  className="group relative bg-white rounded-2xl border border-sage-100 p-3.5 
                    hover:border-sage-200 hover:shadow-lg hover:-translate-y-0.5 
                    active:scale-[0.98] transition-all duration-200 overflow-hidden"
                >
                  {/* Hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-sage-50/50 to-transparent opacity-0 
                    group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <button
                    onClick={() => handleAddToCart(item.name, item.category)}
                    disabled={addingToCart === item.name}
                    className="relative w-full text-left"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-sage-100 
                        flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                        {emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-sage-800 truncate leading-tight">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-sage-400 font-medium mt-0.5">
                          <span className="bg-sage-100 px-1.5 py-0.5 rounded">{item.frequency}x</span>
                        </p>
                      </div>
                    </div>

                    {/* Category tag */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sage-50 text-sage-500 
                      rounded-full text-[9px] font-medium border border-sage-100">
                      <span className="text-[10px]">{getCategoryEmoji(item.category)}</span>
                      {item.category}
                    </span>
                  </button>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-xl bg-sage-100/80 backdrop-blur-sm 
                      flex items-center justify-center text-sage-400 hover:bg-red-100 hover:text-red-500 
                      opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                    aria-label="Retirer"
                  >
                    <X size={12} />
                  </button>

                  {/* Adding to cart feedback */}
                  {addingToCart === item.name && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl z-20">
                      <div className="flex flex-col items-center gap-1">
                        <ShoppingCart size={22} className="text-sage-600 animate-check-pop" />
                        <span className="text-[10px] font-bold text-sage-600">Ajouté !</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Suggestions */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={15} className="text-sage-400" />
          <h2 className="text-sm font-extrabold text-sage-500 uppercase tracking-wider">
            {searchQuery ? `Résultats` : selectedCategory ? `${CATEGORY_EMOJIS[selectedCategory] || ''} ${selectedCategory}` : 'Suggestions'}
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw size={22} className="text-sage-400 animate-spin" />
              <span className="text-xs text-sage-400 font-medium">Chargement...</span>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-sage-400">
              {searchQuery
                ? 'Aucun produit trouvé. Essayez un autre terme.'
                : 'Tous les produits sont déjà dans vos habitudes !'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredProducts.slice(0, 12).map((product) => {
              const emoji = getProductEmoji(product.name);
              return (
                <button
                  key={product.name}
                  onClick={() => { if (listId) handleAddToCart(product.name, product.category); }}
                  disabled={addingToCart === product.name}
                  className="group relative bg-white rounded-2xl border border-sage-100 p-3.5 text-left 
                    hover:border-sage-300 hover:shadow-md active:scale-[0.98] transition-all duration-200
                    disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-9 h-9 rounded-xl bg-sage-50 flex items-center justify-center text-lg
                      group-hover:scale-110 transition-transform duration-300">
                      {emoji}
                    </div>
                    <p className="text-sm font-bold text-sage-700 truncate flex-1">{product.name}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sage-50 text-sage-400 
                    rounded-full text-[9px] font-medium">
                    <span className="text-[10px]">{getCategoryEmoji(product.category)}</span>
                    {product.category}
                  </span>

                  {/* Quick add indicator */}
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-sage-100 flex items-center 
                    justify-center text-sage-400 opacity-0 group-hover:opacity-100 transition-all 
                    group-active:scale-90">
                    <Plus size={13} />
                  </div>

                  {addingToCart === product.name && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl">
                      <ShoppingCart size={20} className="text-sage-600 animate-check-pop" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Empty state */}
      {!isLoading && items.length === 0 && !searchQuery && (
        <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sage-100 to-sage-50 
            flex items-center justify-center mb-4 shadow-inner">
            <Archive size={32} className="text-sage-400" />
          </div>
          <h2 className="text-lg font-bold text-sage-600 mb-1">Pas encore d'habitudes</h2>
          <p className="text-sm text-sage-400 max-w-xs leading-relaxed">
            Les produits que vous ajoutez à votre liste apparaîtront ici 
            pour les retrouver en un clin d'œil.
          </p>
        </div>
      )}
    </div>
  );
}
