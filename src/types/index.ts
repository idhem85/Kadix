// ============================================
// Types & Interfaces - Kadix
// ============================================
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

// Rayons / catégories de produits étendues
export const PRODUCT_CATEGORIES = [
  'Fruits & Légumes',
  'Pains & Pâtisseries',
  'Produits Laitiers',
  'Viandes & Poissons',
  'Ingrédients & Épices',
  'Surgelés & Plats Cuisinés',
  'Pâtes, Riz & Céréales',
  'Snacks & Friandises',
  'Boissons',
  'Foyer',
  'Soin & Santé',
  'Animaux',
  'Autre',
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

// Suggestions d'auto-complétion (produits courants par catégorie)
export const COMMON_PRODUCTS: Record<string, string[]> = {
  'Fruits & Légumes': [
    'Pommes', 'Bananes', 'Oranges', 'Citrons', 'Avocats', 'Tomates',
    'Salade verte', 'Salade', 'Mâche', 'Roquette', 'Concombres', 'Carottes',
    'Oignons', 'Ail', 'Échalotes', 'Pommes de terre', 'Patates douces',
    'Poivrons', 'Courgettes', 'Aubergines', 'Haricots verts', 'Petits pois',
    'Champignons', 'Brocolis', 'Chou-fleur', 'Choux', 'Épinards',
    'Frais', 'Fraises', 'Framboises', 'Myrtilles', 'Cerises', 'Raisins',
    'Mangue', 'Ananas', 'Melon', 'Pastèque', 'Kiwi', 'Pêches', 'Poires',
    'Radis', 'Betteraves', 'Artichauts', 'Asperges', 'Endives', 'Poireaux',
    'Céleri', 'Maïs', 'Citrouille', 'Potiron', 'Navets', 'Topinambours',
  ],
  'Pains & Pâtisseries': [
    'Pain de campagne', 'Baguette', 'Pain complet', 'Pain de mie',
    'Brioche', 'Croissants', 'Pains au chocolat', 'Pain aux raisins',
    'Pain au lait', 'Pain burger', 'Pain pita', 'Pain suédois',
    'Biscottes', 'Chapelure', 'Viennoiseries', 'Cookies', 'Muffins',
    'Madeleines', 'Gauffres', 'Crêpes', 'Tortillas',
  ],
  'Produits Laitiers': [
    'Lait demi-écrémé', 'Lait entier', 'Lait écrémé', 'Beurre', 'Œufs',
    'Fromage râpé', 'Mozzarella', 'Parmesan', 'Comté', 'Emmental',
    'Camembert', 'Brie', 'Chèvre', 'Roquefort', 'Fromage blanc',
    'Yaourt nature', 'Yaourt fruit', 'Yaourt grec', 'Petit suisse',
    'Crème fraîche', 'Crème liquide', 'Ricotta', 'Mascarpone',
    'Kéfir', 'Lait fermenté', 'Faisselle',
  ],
  'Viandes & Poissons': [
    'Blanc de poulet', 'Cuisses de poulet', 'Steak haché', 'Entrecôte',
    'Rôti de porc', 'Filet mignon', 'Rôti de bœuf', 'Côte de bœuf',
    'Sauté de veau', 'Escalope de dinde', 'Poulet rôti',
    'Saumon', 'Cabillaud', 'Truite', 'Saumon fumé',
    'Crevettes', 'Gambas', 'Moules', 'Saint-Jacques',
    'Jambon blanc', 'Jambon cru', 'Lardons', 'Merguez',
    'Saucisses', 'Chorizo', 'Andouille', 'Boudin noir', 'Boudin blanc',
    'Pâté', 'Rillettes', 'Foie gras', 'Lapin', 'Agneau',
  ],
  'Ingrédients & Épices': [
    'Sel fin', 'Gros sel', 'Poivre noir', 'Poivre blanc',
    'Curry', 'Paprika', 'Cumin', 'Coriandre', 'Cannelle',
    'Muscade', 'Gingembre', 'Piment', 'Safran', 'Vanille',
    'Laurier', 'Thym', 'Romarin', 'Origan', 'Basilic',
    'Menthe', 'Persil', 'Ciboulette', 'Aneth', 'Estragon', 'Sauge',
    'Huile d\'olive', 'Huile de tournesol', 'Huile de sésame', 'Huile de coco',
    'Vinaigre balsamique', 'Vinaigre de vin', 'Vinaigre de cidre',
    'Sauce soja', 'Worcestershire', 'Moutarde', 'Mayonnaise', 'Ketchup',
    'Concentré de tomates', 'Miel', 'Sirop d\'érable',
    'Bouillon cube', 'Levure', 'Levure chimique', 'Bicarbonate',
    'Herbes de Provence', 'Épices',
  ],
  'Surgelés & Plats Cuisinés': [
    'Petits pois surgelés', 'Haricots verts surgelés', 'Épinards surgelés',
    'Brocolis surgelés', 'Légumes pour wok', 'Légumes surgelés',
    'Frites surgelées', 'Purée surgelée', 'Purée en flocons',
    'Poisson pané surgelé', 'Poisson surgelé',
    'Pizza surgelée', 'Pizza 4 fromages', 'Pizza jambon',
    'Lasagnes surgelées', 'Plats préparés surgelés',
    'Lasagnes', 'Gratin dauphinois', 'Tartiflette', 'Quiche lorraine',
    'Soupe en brique', 'Soupe fraîche',
    'Nems surgelés', 'Raviolis surgelés',
    'Glace vanille', 'Glace chocolat', 'Glace fraise', 'Sorbet',
    'Fruits rouges surgelés', 'Fruits surgelés',
  ],
  'Pâtes, Riz & Céréales': [
    'Pâtes', 'Pâtes spaghetti', 'Pâtes penne', 'Pâtes fusilli',
    'Pâtes tagliatelle', 'Pâtes coquillettes', 'Pâtes farfalle', 'Pâtes linguine',
    'Riz blanc', 'Riz complet', 'Riz basmati', 'Riz thaï', 'Riz arborio',
    'Quinoa', 'Semoule', 'Couscous', 'Boulgour',
    'Lentilles vertes', 'Lentilles corail', 'Pois chiches',
    'Haricots rouges', 'Haricots blancs', 'Fèves',
    'Flocons d\'avoine', 'Avoine', 'Muesli', 'Granola',
    'Céréales', 'Farine de blé', 'Farine complète', 'Farine de riz',
    'Orge', 'Sarrasin', 'Millet', 'Pain d\'épices',
  ],
  'Snacks & Friandises': [
    'Chocolat noir', 'Chocolat au lait', 'Chocolat blanc',
    'Tablette chocolat', 'Barre chocolatée', 'Bonbons', 'Chewing-gum',
    'Biscuits', 'Cookies', 'Gâteaux', 'Brownie', 'Muffin', 'Madeleines',
    'Chips', 'Cacahuètes', 'Amandes', 'Noix', 'Noisettes',
    'Noix de cajou', 'Pistaches', 'Fruits secs',
    'Cracker', 'Bretzels', 'Popcorn',
    'Nutella', 'Pâte à tartiner', 'Confiture', 'Marmelade',
    'Compote', 'Caramel', 'Nougat', 'Guimauve',
    'Biscuit apéritif', 'Gressins',
  ],
  'Boissons': [
    'Eau plate', 'Eau gazeuse', 'Eau minérale',
    'Jus d\'orange', 'Jus de pomme', 'Jus de raisin', 'Jus multifruits',
    'Soda', 'Coca-Cola', 'Coca zéro', 'Sprite', 'Fanta', 'Limonade',
    'Ice tea', 'Tonic', 'Eau pétillante',
    'Vin rouge', 'Vin blanc', 'Vin rosé', 'Champagne',
    'Bière', 'Bière blonde', 'Bière brune', 'Bière blanche', 'Cidre',
    'Sirop', 'Sirop de grenadine', 'Sirop de menthe',
    'Café moulu', 'Café en grains', 'Café soluble',
    'Thé noir', 'Thé vert', 'Thé blanc', 'Thé matcha',
    'Infusions', 'Tisane', 'Cacao', 'Chocolat chaud',
    'Smoothie', 'Énergisant',
  ],
  'Foyer': [
    'Liquide vaisselle', 'Pastille lave-vaisselle',
    'Lessive', 'Adoucissant', 'Détachant',
    'Nettoyant surfaces', 'Nettoyant vitres', 'Nettoyant multi-surfaces',
    'Nettoyant salle de bain', 'Nettoyant WC',
    'Javel', 'Déboucheur', 'Anti-calcaire', 'Spray désinfectant',
    'Sac poubelle', 'Sac congélation', 'Sac sous-vide',
    'Film alimentaire', 'Papier aluminium', 'Papier cuisson',
    'Essuie-tout', 'Chiffon microfibre', 'Éponge',
    'Balayette', 'Serpillière', 'Gants ménage',
    'Piles', 'Ampoule', 'Bougie', 'Allumettes', 'Briquet',
    'Ruban adhésif', 'Ciseaux', 'Cutter',
  ],
  'Soin & Santé': [
    'Savon liquide', 'Savon solide', 'Gel douche',
    'Shampoing', 'Après-shampoing', 'Soin cheveux',
    'Dentifrice', 'Brosse à dents', 'Fil dentaire', 'Bain de bouche',
    'Déodorant', 'Parfum',
    'Crème hydratante', 'Crème solaire', 'Après-rasage',
    'Rasoir', 'Lames rasoir', 'Mousse à raser',
    'Cotons', 'Coton-tige', 'Lingettes',
    'Papier toilette', 'Mouchoirs',
    'Serviettes hygiéniques', 'Tampons', 'Protège-slips', 'Couches',
    'Lait corporel', 'Démaquillant',
    'Spray nasal', 'Collyre', 'Comprimés',
    'Vitamines', 'Compléments alimentaires',
    'Pansements', 'Sparadrap', 'Thermomètre',
    'Masque', 'Gel hydroalcoolique',
  ],
  'Animaux': [
    'Croquettes chien', 'Croquettes chat', 'Croquettes',
    'Pâtée chien', 'Pâtée chat', 'Pâtée',
    'Friandises chien', 'Friandises chat',
    'Litière chat', 'Litière', 'Litière agglomérante',
    'Sacs déjection',
    'Jouet chien', 'Jouet chat', 'Os', 'Arbre à chat',
    'Panier chien', 'Panier chat', 'Gamelle',
    'Brosse chien', 'Brosse chat',
    'Shampoing chien', 'Shampoing chat',
    'Anti-puces', 'Vermifuge',
    'Nourriture oiseau', 'Nourriture poisson',
    'Graines hamster', 'Foin lapin', 'Litière rongeur',
  ],
};
