import { useState, useEffect, useCallback } from 'react';
import { Archive, Plus, Search, X, RefreshCw, ShoppingCart } from 'lucide-react';
import { usePantryStore } from '../../store/groceryStore';
import { getPantryItems, removeFromPantry, addGroceryItem, addToPantry as addToPantryDb } from '../../lib/db';
import { PRODUCT_CATEGORIES, COMMON_PRODUCTS } from '../../types';

interface PantryProps {
  listId: string;
}

export default function PantryView({ listId }: PantryProps) {
  const { items, setItems, removeItem } = usePantryStore();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  // Load pantry items
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

  // Get all products from COMMON_PRODUCTS for "suggestions" section
  const allCommonProducts = Object.entries(COMMON_PRODUCTS).flatMap(
    ([category, products]) => products.map((name) => ({ name, category }))
  );

  // Filter out products already in pantry
  const pantryNames = new Set(items.map((i) => i.name.toLowerCase()));
  const suggestedProducts = allCommonProducts.filter(
    (p) => !pantryNames.has(p.name.toLowerCase())
  );

  // Apply search filter
  const filteredProducts = searchQuery
    ? suggestedProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : selectedCategory
    ? suggestedProducts.filter((p) => p.category === selectedCategory)
    : suggestedProducts;

  // Sort pantry items by frequency
  const sortedPantry = [...items].sort(
    (a, b) => b.frequency - a.frequency
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un produit..."
          className="w-full pl-11 pr-4 py-3 bg-white border-2 border-sage-200 focus:border-sage-400 rounded-2xl text-sage-800 placeholder-sage-400 outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category filters */}
      {!searchQuery && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              !selectedCategory
                ? 'bg-sage-600 text-white border-sage-600'
                : 'bg-white text-sage-500 border-sage-200 hover:border-sage-300'
            }`}
          >
            Tout
          </button>
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all ${
                cat === selectedCategory
                  ? 'bg-sage-600 text-white border-sage-600'
                  : 'bg-white text-sage-500 border-sage-200 hover:border-sage-300'
              }`}
            >
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
            <h2 className="text-sm font-semibold text-sage-700">Mes habitudes</h2>
            <span className="text-[11px] text-sage-400 bg-sage-100 px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {sortedPantry.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white rounded-2xl border border-sage-100 p-3 hover:border-sage-200 hover:shadow-sm transition-all"
              >
                <button
                  onClick={() => handleAddToCart(item.name, item.category)}
                  disabled={addingToCart === item.name}
                  className={`w-full text-left transition-all ${
                    addingToCart === item.name ? 'opacity-50' : ''
                  }`}
                >
                  <p className="text-sm font-medium text-sage-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-sage-400 mt-0.5">
                    {item.frequency}x • {item.category}
                  </p>
                </button>

                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-sage-100 flex items-center justify-center text-sage-400 hover:bg-red-100 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  aria-label="Retirer"
                >
                  <X size={12} />
                </button>

                {addingToCart === item.name && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl animate-fade-in">
                    <ShoppingCart size={20} className="text-sage-600 animate-check-pop" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Suggestions */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Plus size={16} className="text-sage-400" />
          <h2 className="text-sm font-semibold text-sage-500">
            {searchQuery
              ? `Résultats pour "${searchQuery}"`
              : selectedCategory
              ? `Suggestions en ${selectedCategory.toLowerCase()}`
              : 'Suggestions'}
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw size={24} className="text-sage-400 animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="text-sm text-sage-400 text-center py-8">
            {searchQuery
              ? 'Aucun produit trouvé. Essayez un autre terme.'
              : 'Tous les produits sont déjà dans vos habitudes !'}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredProducts.slice(0, 12).map((product) => (
              <button
                key={product.name}
                onClick={() => {
                  if (listId) {
                    handleAddToCart(product.name, product.category);
                  }
                }}
                disabled={addingToCart === product.name}
                className="group relative bg-white rounded-2xl border border-sage-100 p-3 text-left hover:border-sage-300 hover:shadow-sm active:scale-[0.98] transition-all"
              >
                <p className="text-sm font-medium text-sage-700 truncate">
                  {product.name}
                </p>
                <p className="text-[11px] text-sage-400 mt-0.5">
                  {product.category}
                </p>

                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-sage-100 flex items-center justify-center text-sage-400 opacity-0 group-hover:opacity-100 transition-all group-active:scale-90">
                  <Plus size={14} />
                </div>

                {addingToCart === product.name && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl animate-fade-in">
                    <ShoppingCart size={20} className="text-sage-600 animate-check-pop" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Loading state for empty pantry */}
      {!isLoading && items.length === 0 && !searchQuery && (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-sage-100 flex items-center justify-center mb-3">
            <Archive size={28} className="text-sage-400" />
          </div>
          <h2 className="text-base font-semibold text-sage-600 mb-1">
            Pas encore d'habitudes
          </h2>
          <p className="text-sm text-sage-400 max-w-xs">
            Les produits que vous ajoutez à votre liste apparaîtront ici pour les retrouver facilement.
          </p>
        </div>
      )}
    </div>
  );
}
