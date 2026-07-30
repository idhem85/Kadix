import { useState } from 'react';
import { Clock, Plus, Check, ChevronDown, Sparkles } from 'lucide-react';
import type { Recipe, PantryItem } from '../../types';
import { guessCategory } from '../../lib/categories';

interface RecipeCardProps {
  recipe: Recipe;
  pantryItems: PantryItem[];
  onAddIngredients: (ingredients: { name: string; category: string }[]) => void;
}

const RECIPE_EMOJIS: Record<string, string> = {
  'Pâtes à la carbonara express': '🍝',
  'Salade bowl méditerranéenne': '🥗',
  'Omelette roulée aux légumes': '🍳',
  'Tartines avocat-poulet grillé': '🥑',
  'Bol de riz sauté aux légumes et œuf': '🍚',
};

function getRecipeEmoji(title: string): string {
  return RECIPE_EMOJIS[title] || '🍽️';
}

export default function RecipeCard({ recipe, pantryItems, onAddIngredients }: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [added, setAdded] = useState(false);
  const ingredients = recipe.ingredients || [];
  const instructions = recipe.instructions || [];
  const emoji = getRecipeEmoji(recipe.title);

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

  const matchLevel = matchScore > 66 ? 'high' : matchScore > 33 ? 'medium' : 'low';

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
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300
      ${expanded
        ? 'border-sage-200 shadow-lg'
        : 'border-sage-100 hover:border-sage-200 hover:shadow-md'
      }
    `}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left flex items-start gap-3"
      >
        {/* Recipe emoji */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0
          transition-all duration-300 ${expanded ? 'scale-110' : ''}`}
          style={{
            background: matchLevel === 'high'
              ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)'
              : matchLevel === 'medium'
              ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
              : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
          }}
        >
          {emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-extrabold text-sage-800 truncate">{recipe.title}</h3>
            {matchScore >= 80 && (
              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full text-[9px] font-bold shrink-0">
                Parfait !
              </span>
            )}
          </div>
          <p className="text-sm text-sage-500 line-clamp-2 mt-0.5">{recipe.description || ''}</p>

          {/* Tags row */}
          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
            {/* Time */}
            <div className="flex items-center gap-1 text-[11px] text-sage-500 font-medium">
              <Clock size={12} />
              <span>{recipe.prep_time_min} min</span>
            </div>

            {/* Match score dots */}
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      level <= Math.ceil(matchScore / 33)
                        ? matchLevel === 'high'
                          ? 'bg-green-400 shadow-sm shadow-green-400/50'
                          : matchLevel === 'medium'
                          ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                          : 'bg-sage-400'
                        : 'bg-sage-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-sage-400 font-bold">{matchScore}%</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[11px] text-sage-400">
                {missingIngredients.length === 0 ? (
                  <span className="text-green-600 font-medium">Tout est là !</span>
                ) : (
                  <>{missingIngredients.length} ingrédient{missingIngredients.length !== 1 ? 's' : ''} manquant{missingIngredients.length !== 1 ? 's' : ''}</>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className={`text-sage-400 mt-1 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
          <ChevronDown size={18} />
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-sage-50 animate-slide-up pt-4">
          {/* Ingredients */}
          <div>
            <h4 className="text-xs font-extrabold text-sage-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles size={12} /> Ingrédients
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {ingredientStatus.map((ing, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                    ing.inPantry
                      ? 'bg-green-50/80 text-green-700 border border-green-200/50'
                      : 'bg-sage-50 text-sage-700 border border-sage-100/50'
                  }`}
                >
                  {ing.inPantry ? (
                    <Check size={13} className="text-green-500 shrink-0" />
                  ) : (
                    <Plus size={13} className="text-sage-400 shrink-0" />
                  )}
                  <span className="truncate">
                    {ing.name}
                    <span className="text-[10px] opacity-70 ml-0.5">
                      {ing.quantity}{ing.unit || ''}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h4 className="text-xs font-extrabold text-sage-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              👨‍🍳 Instructions
            </h4>
            <ol className="space-y-2.5">
              {instructions.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-sage-700">
                  <span className="w-6 h-6 rounded-full bg-sage-200 text-sage-600 text-[10px] 
                    font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {recipe.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-sage-100 text-sage-600 rounded-full text-[10px] font-bold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Add missing ingredients */}
          {missingIngredients.length > 0 && (
            <button
              onClick={handleAddAll}
              className={`w-full py-3.5 rounded-xl font-extrabold text-sm transition-all duration-300 
                flex items-center justify-center gap-2 active:scale-[0.98]
                ${added
                  ? 'bg-green-100 text-green-700 border-2 border-green-200'
                  : 'bg-sage-600 hover:bg-sage-700 text-white shadow-md shadow-sage-600/20 hover:shadow-lg'
                }`}
            >
              {added ? (
                <>
                  <Check size={18} className="animate-check-pop" />
                  Ajouté à la liste ! 🎉
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Ajouter les ingrédients manquants
                  <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs">
                    {missingIngredients.length}
                  </span>
                </>
              )}
            </button>
          )}

          {missingIngredients.length === 0 && (
            <div className="w-full py-3.5 rounded-xl font-extrabold text-sm text-center bg-green-50 text-green-700 border-2 border-green-200">
              ✅ Vous avez tous les ingrédients nécessaires !
            </div>
          )}
        </div>
      )}
    </div>
  );
}
