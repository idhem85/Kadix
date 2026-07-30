import type { Recipe, PantryItem, RecipeIngredient } from '../types';
import { getRecipes } from './db';

/**
 * Analyze which recipes are most suitable based on available pantry items.
 * Returns recipes sorted by "match score" (highest = best match).
 */
export async function suggestRecipes(pantryItems: PantryItem[]): Promise<Recipe[]> {
  const recipes = await getRecipes();
  const pantryNames = pantryItems.map((item) => item.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));

  const scored = recipes.map((recipe) => {
    const recipeIngredients = recipe.ingredients as RecipeIngredient[];
    const matched: { ingredient: RecipeIngredient; inPantry: boolean }[] = [];
    let matchCount = 0;

    for (const ing of recipeIngredients) {
      const normalizedIng = ing.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const inPantry = pantryNames.some(
        (p) =>
          p.includes(normalizedIng) ||
          normalizedIng.includes(p) ||
          normalizedIng.split(/\s+/).some((word) => word.length > 3 && p.includes(word))
      );
      matched.push({ ingredient: ing, inPantry });
      if (inPantry) matchCount++;
    }

    const score = recipeIngredients.length > 0 ? matchCount / recipeIngredients.length : 0;

    return {
      recipe,
      score,
      matched,
      missingCount: recipeIngredients.length - matchCount,
    };
  });

  // Sort: highest match first, then fewest missing ingredients, then shortest prep time
  scored.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    if (a.missingCount !== b.missingCount) return a.missingCount - b.missingCount;
    return a.recipe.prep_time_min - b.recipe.prep_time_min;
  });

  return scored.slice(0, 5).map((s) => ({
    ...s.recipe,
    // Attach metadata for the UI
    _matchScore: s.score,
    _matchDetails: s.matched,
    _missingCount: s.missingCount,
  })) as Recipe[];
}

/**
 * Extract missing ingredients from a recipe.
 */
export function getMissingIngredients(
  recipe: Recipe,
  pantryItems: PantryItem[]
): RecipeIngredient[] {
  const ingredients = recipe.ingredients as RecipeIngredient[];
  const pantryNames = pantryItems.map((item) => item.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));

  return ingredients.filter((ing) => {
    const normalizedIng = ing.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return !pantryNames.some(
      (p) =>
        p.includes(normalizedIng) ||
        normalizedIng.includes(p) ||
        normalizedIng.split(/\s+/).some((word) => word.length > 3 && p.includes(word))
    );
  });
}
