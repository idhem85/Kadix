// ============================================
// Types & Interfaces - Kadix
// ============================================

// ============================================
// Product Emojis - Icons for every category & product
// ============================================

/** Emoji icon for product categories */
export const CATEGORY_EMOJIS: Record<string, string> = {
  'Fruits & Légumes': '🥬',
  'Produits Laitiers': '🥛',
  'Viandes & Poissons': '🥩',
  'Épicerie': '🥫',
  'Boulangerie': '🥖',
  'Boissons': '🥤',
  'Surgelés': '🧊',
  'Hygiène & Maison': '🧹',
  'Frais & Traiteur': '🥗',
  'Bio & Diététique': '🌱',
  'Autre': '📦',
};

/** Emoji icons for specific common products */
export const PRODUCT_EMOJIS: Record<string, string> = {
  // Fruits & Légumes
  'Pommes': '🍎', 'Bananes': '🍌', 'Oranges': '🍊', 'Citrons': '🍋',
  'Avocats': '🥑', 'Tomates': '🍅', 'Salade verte': '🥬', 'Concombres': '🥒',
  'Carottes': '🥕', 'Oignons': '🧅', 'Ail': '🧄', 'Pommes de terre': '🥔',
  'Poivrons': '🫑', 'Courgettes': '🥒', 'Aubergines': '🍆',
  'Champignons': '🍄', 'Brocolis': '🥦', 'Épinards': '🌿', 'Frais': '🍓',
  'Mangue': '🥭', 'Ananas': '🍍', 'Raisins': '🍇', 'Cerises': '🍒', 'Myrtilles': '🫐',
  // Produits Laitiers
  'Lait demi-écrémé': '🥛', 'Lait entier': '🥛', 'Beurre': '🧈', 'Œufs': '🥚',
  'Fromage râpé': '🧀', 'Mozzarella': '🧀', 'Parmesan': '🧀', 'Camembert': '🧀',
  'Yaourt nature': '🍶', 'Yaourt fruit': '🍶', 'Fromage blanc': '🥣',
  'Crème fraîche': '🥛', 'Crème liquide': '🥛', 'Petits suisses': '🍶',
  // Viandes & Poissons
  'Blanc de poulet': '🍗', 'Cuisses de poulet': '🍗', 'Steak haché': '🥩',
  'Entrecôte': '🥩', 'Rôti de porc': '🥩', 'Filet mignon': '🥩',
  'Saumon': '🐟', 'Cabillaud': '🐟', 'Dos de cabillaud': '🐟',
  'Jambon blanc': '🍖', 'Jambon cru': '🍖', 'Lardons': '🥓', 'Merguez': '🌭',
  // Épicerie
  'Pâtes': '🍝', 'Riz': '🍚', 'Lentilles': '🫘', 'Quinoa': '🌾', 'Couscous': '🍚',
  'Farine': '🌾', 'Sucre': '🍬', 'Sel': '🧂', 'Poivre': '🧂',
  'Huile d\'olive': '🫒', 'Huile de tournesol': '🫒', 'Vinaigre': '🍶',
  'Sauce soja': '🥫', 'Confiture': '🍯', 'Miel': '🍯', 'Nutella': '🍫',
  'Céréales': '🥣', 'Biscuits': '🍪', 'Chocolat noir': '🍫', 'Chocolat au lait': '🍫',
  'Café moulu': '☕', 'Thé': '🫖', 'Infusions': '🫖', 'Cacao en poudre': '🍫',
  'Conserve de tomates': '🥫', 'Thon en boîte': '🥫', 'Maïs en boîte': '🥫',
  'Lait de coco': '🥥', 'Épices': '🌶️', 'Herbes de Provence': '🌿',
  // Boulangerie
  'Pain de campagne': '🍞', 'Baguette': '🥖', 'Pain complet': '🍞',
  'Pain de mie': '🍞', 'Brioche': '🥐', 'Croissants': '🥐',
  'Pains au chocolat': '🥐', 'Tortillas': '🫓', 'Pain pita': '🫓',
  // Boissons
  'Eau plate': '💧', 'Eau gazeuse': '💧', 'Jus d\'orange': '🧃',
  'Jus de pomme': '🧃', 'Soda': '🥤', 'Coca-Cola': '🥤', 'Limonade': '🥤',
  'Vin rouge': '🍷', 'Vin blanc': '🍷', 'Bière': '🍺', 'Sirop': '🧃',
  // Surgelés
  'Petits pois': '🫛', 'Haricots verts': '🫛', 'Épinards en branche': '🌿',
  'Frites': '🍟', 'Purée en flocons': '🥔', 'Poisson pané': '🐟',
  'Pizza surgelée': '🍕', 'Glace vanille': '🍦', 'Glace chocolat': '🍦',
  'Fruits rouges surgelés': '🫐', 'Légumes pour wok': '🥬',
  // Hygiène & Maison
  'Dentifrice': '🪥', 'Brosse à dents': '🪥', 'Shampoing': '🧴',
  'Gel douche': '🧴', 'Déodorant': '🧴', 'Papier toilette': '🧻',
  'Essuie-tout': '🧻', 'Liquide vaisselle': '🧼', 'Lessive': '🧺',
  'Nettoyant multi-surfaces': '🧹', 'Sac poubelle': '🗑️',
  'Film alimentaire': '🔄', 'Papier aluminium': '🔄',
  // Frais & Traiteur
  'Pâte feuilletée': '🥟', 'Pâte brisée': '🥟', 'Pizza fraîche': '🍕',
  'Plat préparé': '🍱', 'Soupe fraîche': '🍜', 'Tzatziki': '🥒',
  'Hummus': '🫘', 'Tarama': '🥫', 'Rillettes': '🥫', 'Terrine': '🥫',
  // Bio & Diététique
  'Lait d\'amande': '🥛', 'Lait d\'avoine': '🥛', 'Tofu': '🧈',
  'Seitan': '🧈', 'Graines de chia': '🫘', 'Graines de lin': '🫘',
  'Purée d\'amande': '🥜', 'Protéines en poudre': '💪',
  'Barres protéinées': '🍫', 'Compléments': '💊',
};

/** Get emoji for a product name */
export function getProductEmoji(name: string): string {
  return PRODUCT_EMOJIS[name] || CATEGORY_EMOJIS['Autre'] || '📦';
}

/** Get emoji for a category */
export function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJIS[category] || '📦';
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShoppingList {
  id: string;
  owner_id: string;
  title: string;
  invite_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListMember {
  id: string;
  list_id: string;
  user_id: string;
  role: 'editor' | 'viewer';
  joined_at: string;
  profile?: Profile;
}

export interface GroceryItem {
  id: string;
  list_id: string;
  name: string;
  quantity: string;
  unit: string | null;
  category: string;
  notes: string | null;
  added_by: string | null;
  is_checked: boolean;
  checked_by: string | null;
  checked_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface PantryItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  frequency: number;
  last_added_at: string | null;
  created_at: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  prep_time_min: number;
  image_url: string | null;
  instructions: string[];
  ingredients: RecipeIngredient[];
  tags: string[];
  created_at: string;
  // Computed fields for recipe suggestions
  _matchScore?: number;
  _matchDetails?: { ingredient: RecipeIngredient; inPantry: boolean }[];
  _missingCount?: number;
}

// Rayons / catégories de produits
export const PRODUCT_CATEGORIES = [
  'Fruits & Légumes',
  'Produits Laitiers',
  'Viandes & Poissons',
  'Épicerie',
  'Boulangerie',
  'Boissons',
  'Surgelés',
  'Hygiène & Maison',
  'Frais & Traiteur',
  'Bio & Diététique',
  'Autre',
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

// Suggestions d'auto-complétion (produits courants par catégorie)
export const COMMON_PRODUCTS: Record<string, string[]> = {
  'Fruits & Légumes': [
    'Pommes', 'Bananes', 'Oranges', 'Citrons', 'Avocats', 'Tomates',
    'Salade verte', 'Concombres', 'Carottes', 'Oignons', 'Ail',
    'Pommes de terre', 'Poivrons', 'Courgettes', 'Aubergines',
    'Champignons', 'Brocolis', 'Épinards', 'Frais',
    'Mangue', 'Ananas', 'Raisins', 'Cerises', 'Myrtilles',
  ],
  'Produits Laitiers': [
    'Lait demi-écrémé', 'Lait entier', 'Beurre', 'Œufs',
    'Fromage râpé', 'Mozzarella', 'Parmesan', 'Camembert',
    'Yaourt nature', 'Yaourt fruit', 'Fromage blanc',
    'Crème fraîche', 'Crème liquide', 'Petits suisses',
  ],
  'Viandes & Poissons': [
    'Blanc de poulet', 'Cuisses de poulet', 'Steak haché',
    'Entrecôte', 'Rôti de porc', 'Filet mignon',
    'Saumon', 'Cabillaud', 'Dos de cabillaud',
    'Jambon blanc', 'Jambon cru', 'Lardons', 'Merguez',
  ],
  'Épicerie': [
    'Pâtes', 'Riz', 'Lentilles', 'Quinoa', 'Couscous',
    'Farine', 'Sucre', 'Sel', 'Poivre', 'Huile d\'olive',
    'Huile de tournesol', 'Vinaigre', 'Sauce soja',
    'Confiture', 'Miel', 'Nutella', 'Céréales',
    'Biscuits', 'Chocolat noir', 'Chocolat au lait',
    'Café moulu', 'Thé', 'Infusions', 'Cacao en poudre',
    'Conserve de tomates', 'Thon en boîte', 'Maïs en boîte',
    'Lait de coco', 'Épices', 'Herbes de Provence',
  ],
  'Boulangerie': [
    'Pain de campagne', 'Baguette', 'Pain complet',
    'Pain de mie', 'Brioche', 'Croissants', 'Pains au chocolat',
    'Tortillas', 'Pain pita', 'Pita',
  ],
  'Boissons': [
    'Eau plate', 'Eau gazeuse', 'Jus d\'orange',
    'Jus de pomme', 'Soda', 'Coca-Cola', 'Limonade',
    'Vin rouge', 'Vin blanc', 'Bière', 'Sirop',
  ],
  'Surgelés': [
    'Petits pois', 'Haricots verts', 'Épinards en branche',
    'Frites', 'Purée en flocons', 'Poisson pané',
    'Pizza surgelée', 'Glace vanille', 'Glace chocolat',
    'Fruits rouges surgelés', 'Légumes pour wok',
  ],
  'Hygiène & Maison': [
    'Dentifrice', 'Brosse à dents', 'Shampoing', 'Gel douche',
    'Déodorant', 'Papier toilette', 'Essuie-tout',
    'Liquide vaisselle', 'Lessive', 'Nettoyant multi-surfaces',
    'Sac poubelle', 'Film alimentaire', 'Papier aluminium',
  ],
  'Frais & Traiteur': [
    'Pâte feuilletée', 'Pâte brisée', 'Pizza fraîche',
    'Plat préparé', 'Soupe fraîche', 'Tzatziki', 'Hummus',
    'Tarama', 'Rillettes', 'Terrine',
  ],
  'Bio & Diététique': [
    'Lait d\'amande', 'Lait d\'avoine', 'Tofu', 'Seitan',
    'Graines de chia', 'Graines de lin', 'Purée d\'amande',
    'Protéines en poudre', 'Barres protéinées', 'Compléments',
  ],
};
