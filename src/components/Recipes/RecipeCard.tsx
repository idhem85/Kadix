import { useState } from 'react';
import { Clock, ChefHat, Plus, Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { Recipe, PantryItem } from '../../types';

interface RecipeCardProps {
  recipe: Recipe;
  pantryItems: PantryItem[];
  onAddIngredients: (ingredients: { name: string; category: string }[]) => void;
}

export default function RecipeCard({ recipe, pantryItems, onAddIngredients }: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [added, setAdded] = useState(false);
  const ingredients = recipe.ingredients || [];
  const instructions = recipe.instructions || [];

  // Determine which ingredients are in the pantry
  const pantryNames = pantryItems.map((item) =>
    item.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  );

  const ingredientStatus = ingredients.map((ing) => {
    const normalizedIng = ing.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const inPantry = pantryNames.some(
      (p) =>
        p.includes(normalizedIng) ||
        normalizedIng.includes(p) ||
        normalizedIng.split(/\s+/).some((word) => word.length > 3 && p.includes(word))
    );
    return { ...ing, inPantry };
  });

  const missingIngredients = ingredientStatus.filter((ing) => !ing.inPantry);
  const matchScore = ingredients.length > 0
    ? Math.round((ingredientStatus.filter((i) => i.inPantry).length / ingredients.length) * 100)
    : 0;

  const handleAddAll = () => {
    onAddIngredients(
      missingIngredients.map((ing) => ({
        name: ing.name,
        category: guessCategory(ing.name),
      }))
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-sage-100 overflow-hidden hover:border-sage-200 hover:shadow-sm transition-all duration-200">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left flex items-start gap-3"
      >
        {/* Recipe icon */}
        <div className="w-12 h-12 rounded-2xl bg-sage-100 flex items-center justify-center shrink-0">
          <ChefHat size={24} className="text-sage-600" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-sage-800 mb-1">
            {recipe.title}
          </h3>
          <p className="text-sm text-sage-500 line-clamp-2">
            {recipe.description || ''}
          </p>

          {/* Tags */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <div className="flex items-center gap-1 text-xs text-sage-500">
              <Clock size={12} />
              <span>{recipe.prep_time_min} min</span>
            </div>

            {/* Match score */}
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={`w-2 h-2 rounded-full ${
                      level <= Math.ceil(matchScore / 33)
                        ? matchScore > 66
                          ? 'bg-green-400'
                          : matchScore > 33
                          ? 'bg-amber-400'
                          : 'bg-sage-300'
                        : 'bg-sage-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-sage-400">{matchScore}%</span>
            </div>

            <span className="text-[11px] text-sage-400">
              {missingIngredients.length} ingrédient{missingIngredients.length !== 1 ? 's' : ''} manquant{missingIngredients.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="text-sage-400 mt-1">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 animate-slide-up">
          {/* Ingredients */}
          <div>
            <h4 className="text-xs font-semibold text-sage-500 uppercase tracking-wider mb-2">
              Ingrédients
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {ingredientStatus.map((ing, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
                    ing.inPantry
                      ? 'bg-green-50 text-green-700'
                      : 'bg-sage-50 text-sage-700'
                  }`}
                >
                  {ing.inPantry ? (
                    <Check size={14} className="text-green-500 shrink-0" />
                  ) : (
                    <Plus size={14} className="text-sage-400 shrink-0" />
                  )}
                  <span className="truncate">
                    {ing.name}
                    <span className="text-[11px] opacity-70">
                      {' '}{ing.quantity}{ing.unit ? ing.unit : ''}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h4 className="text-xs font-semibold text-sage-500 uppercase tracking-wider mb-2">
              Instructions
            </h4>
            <ol className="space-y-2">
              {instructions.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm text-sage-700">
                  <span className="w-5 h-5 rounded-full bg-sage-200 text-sage-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Missing ingredients tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {recipe.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-sage-100 text-sage-600 rounded-full text-[11px] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Add missing ingredients button */}
          {missingIngredients.length > 0 && (
            <button
              onClick={handleAddAll}
              className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                added
                  ? 'bg-green-100 text-green-700'
                  : 'bg-sage-600 hover:bg-sage-700 active:bg-sage-800 text-white'
              }`}
            >
              {added ? (
                <>
                  <Check size={18} />
                  Ajouté à la liste !
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Ajouter les {missingIngredients.length} ingrédient{missingIngredients.length !== 1 ? 's' : ''} manquant{missingIngredients.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Helper to guess category
function guessCategory(name: string): string {
  const normalized = name.toLowerCase().trim();
  const commonProducts: Record<string, string[]> = {
    'Fruits & Légumes': ['pomme', 'banane', 'orange', 'citron', 'avocat', 'tomate', 'salade', 'concombre', 'carotte', 'oignon', 'ail', 'pomme de terre', 'poivron', 'courgette', 'aubergine', 'champignon', 'brocoli', 'épinard', 'fraise', 'mangue', 'ananas', 'raisin', 'cerise', 'myrtille'],
    'Produits Laitiers': ['lait', 'beurre', 'œuf', 'fromage', 'mozzarella', 'parmesan', 'yaourt', 'crème'],
    'Viandes & Poissons': ['poulet', 'boeuf', 'steak', 'porc', 'saumon', 'cabillaud', 'jambon', 'lardon'],
    'Épicerie': ['pâte', 'riz', 'farine', 'sucre', 'sel', 'poivre', 'huile', 'vinaigre', 'sauce soja', 'confiture', 'miel', 'chocolat', 'café', 'thé', 'conserve', 'thon', 'maïs', 'lait de coco', 'épice'],
    'Boulangerie': ['pain', 'baguette', 'brioche', 'croissant'],
    'Boissons': ['eau', 'jus', 'soda', 'vin', 'bière', 'sirop'],
  };

  for (const [category, products] of Object.entries(commonProducts)) {
    if (products.some((p) => normalized.includes(p) || p.includes(normalized))) {
      return category;
    }
  }
  return 'Épicerie';
}
