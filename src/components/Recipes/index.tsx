import { useState, useEffect, useCallback } from 'react';
import { Lightbulb, RefreshCw, Sparkles } from 'lucide-react';
import RecipeCard from './RecipeCard';
import { usePantryStore } from '../../store/groceryStore';
import { getPantryItems, addGroceryItem, addToPantry } from '../../lib/db';
import { suggestRecipes } from '../../lib/recipes';
import type { Recipe } from '../../types';

interface RecipesViewProps {
  listId: string;
}

export default function RecipesView({ listId }: RecipesViewProps) {
  const { items: pantryItems, setItems } = usePantryStore();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadRecipes = useCallback(async () => {
    const pantry = await getPantryItems();
    setItems(pantry);

    if (pantry.length > 0) {
      const suggested = await suggestRecipes(pantry);
      setRecipes(suggested);
    } else {
      setRecipes([]);
    }
  }, [setItems]);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      await loadRecipes();
      setIsLoading(false);
    }
    load();
  }, [loadRecipes]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRecipes();
    setIsRefreshing(false);
  };

  const handleAddIngredients = useCallback(
    async (ingredients: { name: string; category: string }[]) => {
      for (const ing of ingredients) {
        await addGroceryItem(listId, ing.name, ing.category);
        await addToPantry(ing.name, ing.category);
      }
    },
    [listId]
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-sage-500" />
          <h2 className="text-sm font-semibold text-sage-700">
            Suggestions pour vous
          </h2>
        </div>

        {pantryItems.length > 0 && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-sage-600 hover:text-sage-800 bg-sage-100 hover:bg-sage-200 rounded-full transition-all disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? 'animate-spin' : ''}
            />
            <span>Actualiser</span>
          </button>
        )}
      </div>

      {/* Description */}
      {pantryItems.length > 0 && (
        <p className="text-xs text-sage-400 leading-relaxed">
          Basé sur vos {pantryItems.length} habitude{pantryItems.length !== 1 ? 's' : ''} d'achat
        </p>
      )}

      {/* Empty state - no pantry items */}
      {!isLoading && pantryItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-sage-100 flex items-center justify-center mb-4">
            <Lightbulb size={36} className="text-sage-400" />
          </div>
          <h2 className="text-lg font-semibold text-sage-700 mb-1">
            Pas encore de suggestions
          </h2>
          <p className="text-sm text-sage-400 max-w-xs">
            Ajoutez des produits à vos habitudes dans l'onglet "Habitudes" pour recevoir des suggestions de recettes personnalisées.
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw size={28} className="text-sage-400 animate-spin" />
            <p className="text-sm text-sage-400">Analyse de vos habitudes...</p>
          </div>
        </div>
      )}

      {/* No matching recipes */}
      {!isLoading && pantryItems.length > 0 && recipes.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-sage-100 flex items-center justify-center mx-auto mb-3">
            <Lightbulb size={28} className="text-sage-400" />
          </div>
          <p className="text-sm text-sage-500">
            Aucune recette ne correspond à vos habitudes pour le moment.
          </p>
        </div>
      )}

      {/* Recipe list */}
      <div className="space-y-3">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            pantryItems={pantryItems}
            onAddIngredients={handleAddIngredients}
          />
        ))}
      </div>
    </div>
  );
}
