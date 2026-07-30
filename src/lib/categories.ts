import { COMMON_PRODUCTS } from '../types';

/** Guess the category of a product by its name */
export function guessCategory(name: string): string {
  const normalized = name.toLowerCase().trim();

  // First pass: exact match or substring containment
  for (const [category, products] of Object.entries(COMMON_PRODUCTS)) {
    if (
      products.some(
        (p) =>
          p.toLowerCase().includes(normalized) ||
          normalized.includes(p.toLowerCase())
      )
    ) {
      return category;
    }
  }

  // Second pass: keyword-based matching
  const keywords: Record<string, string[]> = {
    'Fruits & Légumes': ['fruit', 'légume', 'frais', 'bio', 'mûr', 'mûre'],
    'Pains & Pâtisseries': ['pain', 'boulangerie', 'viennoiserie', 'patisserie', 'pâtisserie', 'baguette', 'croissant'],
    'Produits Laitiers': ['lait', 'laitier', 'produit laitier', 'crèmerie', 'yaourt', 'fromage'],
    'Viandes & Poissons': ['viande', 'poisson', 'boucherie', 'poissonnerie', 'volaille', 'charcuterie'],
    'Ingrédients & Épices': ['épice', 'ingrédient', 'sauce', 'huile', 'vinaigre', 'sel', 'poivre', 'herbe', 'épice', 'condiment'],
    'Surgelés & Plats Cuisinés': ['surgelé', 'congelé', 'glace', 'surgeles', 'plats cuisinés', 'surgelée'],
    'Pâtes, Riz & Céréales': ['pâte', 'riz', 'céréale', 'farine', 'semoule', 'couscous', 'lentille', 'haricot', 'pois chiche', 'quinoa'],
    'Snacks & Friandises': ['snack', 'friandise', 'chocolat', 'bonbon', 'biscuit', 'gâteau', 'chips', 'apéritif'],
    'Boissons': ['boisson', 'eau', 'jus', 'soda', 'café', 'thé', 'infusion', 'sirop', 'bière', 'vin'],
    'Foyer': ['ménage', 'entretien', 'nettoyant', 'lessive', 'vaisselle', 'poubelle', 'sac', 'papier'],
    'Soin & Santé': ['soin', 'santé', 'hygiène', 'dentifrice', 'shampoing', 'savon', 'crème', 'déodorant'],
    'Animaux': ['animal', 'chien', 'chat', 'croquette', 'litière', 'animalerie'],
  };

  for (const [category, words] of Object.entries(keywords)) {
    if (words.some((w) => normalized.includes(w))) {
      return category;
    }
  }

  // Third pass: try matching individual words from the name
  const words = normalized.split(/\s+/);
  for (const [category, products] of Object.entries(COMMON_PRODUCTS)) {
    for (const product of products) {
      const productWords = product.toLowerCase().split(/\s+/);
      const matchCount = words.filter((w) =>
        productWords.some(
          (pw) =>
            pw.includes(w) ||
            w.includes(pw) ||
            (w.length > 3 && pw.includes(w.substring(0, 3)))
        )
      ).length;
      if (matchCount >= Math.min(1, words.length)) {
        return category;
      }
    }
  }

  return 'Autre';
}
