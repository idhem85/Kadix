-- ============================================
-- KADIX - Schema Supabase
-- Application de liste de courses collaborative
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS (gérée par Supabase Auth automatiquement)
-- ============================================

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SHOPPING LISTS
-- ============================================
CREATE TABLE public.shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Ma liste de courses',
  invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;

-- Owner can do everything
CREATE POLICY "Owner can manage their lists"
  ON public.shopping_lists FOR ALL
  USING (auth.uid() = owner_id);

-- ============================================
-- LIST MEMBERS (collaborateurs)
-- ============================================
CREATE TABLE public.list_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('editor', 'viewer')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(list_id, user_id)
);

ALTER TABLE public.list_members ENABLE ROW LEVEL SECURITY;

-- Members can view their memberships
CREATE POLICY "Members can view their list memberships"
  ON public.list_members FOR SELECT
  USING (auth.uid() = user_id);

-- List owners can manage members
CREATE POLICY "Owner can manage members"
  ON public.list_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shopping_lists
      WHERE id = list_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Owner can delete members"
  ON public.list_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_lists
      WHERE id = list_id AND owner_id = auth.uid()
    )
  );

-- Allow joining via invite code
CREATE POLICY "Users can join with invite code"
  ON public.list_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND role = 'editor'
  );

-- ============================================
-- GROCERY ITEMS
-- ============================================
CREATE TABLE public.grocery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity TEXT DEFAULT '1',
  unit TEXT,
  category TEXT NOT NULL DEFAULT 'Autre',
  notes TEXT,
  added_by UUID REFERENCES auth.users(id),
  is_checked BOOLEAN NOT NULL DEFAULT false,
  checked_by UUID REFERENCES auth.users(id),
  checked_at TIMESTAMPTZ,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;

-- Users can see items if they own the list or are a member
CREATE POLICY "Users can view items of their lists"
  ON public.grocery_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_lists
      WHERE id = list_id AND (
        owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.list_members
          WHERE list_id = shopping_lists.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Owners and members can insert items"
  ON public.grocery_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shopping_lists
      WHERE id = list_id AND (
        owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.list_members
          WHERE list_id = shopping_lists.id AND user_id = auth.uid() AND role = 'editor'
        )
      )
    )
  );

CREATE POLICY "Owners and editors can update items"
  ON public.grocery_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_lists
      WHERE id = list_id AND (
        owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.list_members
          WHERE list_id = shopping_lists.id AND user_id = auth.uid() AND role = 'editor'
        )
      )
    )
  );

CREATE POLICY "Owners can delete items"
  ON public.grocery_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_lists
      WHERE id = list_id AND owner_id = auth.uid()
    )
  );

-- ============================================
-- PANTRY (produits fréquents / habitudes)
-- ============================================
CREATE TABLE public.pantry_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Autre',
  frequency INT NOT NULL DEFAULT 1,
  last_added_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own pantry"
  ON public.pantry_items FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- RECIPES (recettes suggérées)
-- ============================================
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  prep_time_min INT NOT NULL DEFAULT 15,
  image_url TEXT,
  instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view recipes"
  ON public.recipes FOR SELECT
  USING (true);

-- Admin can manage recipes
CREATE POLICY "Admin can manage recipes"
  ON public.recipes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_grocery_items_list_id ON public.grocery_items(list_id);
CREATE INDEX idx_grocery_items_category ON public.grocery_items(category);
CREATE INDEX idx_grocery_items_is_checked ON public.grocery_items(is_checked);
CREATE INDEX idx_list_members_list_id ON public.list_members(list_id);
CREATE INDEX idx_list_members_user_id ON public.list_members(user_id);
CREATE INDEX idx_pantry_items_user_id ON public.pantry_items(user_id);
CREATE INDEX idx_shopping_lists_invite_code ON public.shopping_lists(invite_code);

-- ============================================
-- SEED RECIPES (recettes de base)
-- ============================================
INSERT INTO public.recipes (title, description, prep_time_min, ingredients, instructions, tags) VALUES
(
  'Pâtes à la carbonara express',
  'Une carbonara crémeuse sans crème, prête en un rien de temps',
  15,
  '[{"name":"Pâtes","quantity":"200","unit":"g"},{"name":"Œufs","quantity":"2"},{"name":"Parmesan","quantity":"50","unit":"g"},{"name":"Lardons","quantity":"100","unit":"g"},{"name":"Poivre","quantity":"1","unit":"pincée"}]'::jsonb,
  '["Faire cuire les pâtes al dente dans une grande casserole d''eau bouillante salée.","Pendant ce temps, faire revenir les lardons dans une poêle sans matière grasse.","Dans un bol, battre les œufs avec le parmesan râpé et un tour de poivre.","Égoutter les pâtes en réservant un peu d''eau de cuisson.","Hors du feu, verser les pâtes encore chaudes sur les lardons.","Ajouter le mélange œufs-parmesan en remuant rapidement.","Ajouter un peu d''eau de cuisson si nécessaire pour obtenir une texture crémeuse.","Servir immédiatement avec un supplément de parmesan."]'::jsonb,
  ARRAY['pâtes', 'rapide', 'italien'],
  15
),
(
  'Salade bowl méditerranéenne',
  'Une salade complète et fraîche, parfaite pour un déjeuner léger',
  12,
  '[{"name":"Salade verte","quantity":"100","unit":"g"},{"name":"Tomates cerises","quantity":"100","unit":"g"},{"name":"Concombre","quantity":"0.5"},{"name":"Feta","quantity":"50","unit":"g"},{"name":"Olives noires","quantity":"30","unit":"g"},{"name":"Huile d''olive","quantity":"2","unit":"c.à.s"},{"name":"Citron","quantity":"0.5"}]'::jsonb,
  '["Laver et essorer la salade verte.","Couper les tomates cerises en deux et le concombre en dés.","Émietter la feta.","Dans un bol, mélanger la salade, les tomates, le concombre et les olives.","Ajouter la feta émiettée sur le dessus.","Préparer la vinaigrette : mélanger l''huile d''olive avec le jus de citron, sel et poivre.","Verser la vinaigrette et mélanger délicatement.","Servir frais."]'::jsonb,
  ARRAY['salade', 'rapide', 'méditerranéen', 'sain'],
  12
),
(
  'Omelette roulée aux légumes',
  'Une omelette moelleuse et colorée, idéale pour un dîner rapide',
  10,
  '[{"name":"Œufs","quantity":"3"},{"name":"Poivron","quantity":"0.5"},{"name":"Courgette","quantity":"0.5"},{"name":"Fromage râpé","quantity":"30","unit":"g"},{"name":"Sel","quantity":"1","unit":"pincée"},{"name":"Poivre","quantity":"1","unit":"pincée"}]'::jsonb,
  '["Couper le poivron et la courgette en petits dés.","Faire revenir les légumes dans une poêle avec un filet d''huile d''olive pendant 5 minutes.","Battre les œufs en omelette, saler et poivrer.","Verser les œufs sur les légumes dans la poêle chaude.","Laisser cuire à feu doux jusqu''à ce que les œufs soient presque pris.","Parsemer de fromage râpé et plier l''omelette en deux.","Laisser fondre le fromage 30 secondes et servir."]'::jsonb,
  ARRAY['œufs', 'rapide', 'légumes'],
  10
),
(
  'Tartines avocat-poulet grillé',
  'Des tartines gourmandes et équilibrées, prêtes en un clin d''œil',
  10,
  '[{"name":"Pain de campagne","quantity":"2","unit":"tranches"},{"name":"Avocat","quantity":"1"},{"name":"Blanc de poulet","quantity":"100","unit":"g"},{"name":"Tomate","quantity":"1"},{"name":"Jus de citron","quantity":"1","unit":"c.à.c"},{"name":"Sel","quantity":"1","unit":"pincée"}]'::jsonb,
  '["Faire griller les tranches de pain au grille-pain ou au four.","Écraser l''avocat à la fourchette avec le jus de citron, du sel et du poivre.","Tartiner généreusement le pain d''avocat écrasé.","Couper le blanc de poulet en tranches fines.","Disposer le poulet sur les tartines.","Ajouter des rondelles de tomate.","Assaisonner d''un filet d''huile d''olive et servir."]'::jsonb,
  ARRAY['tartines', 'rapide', 'avocat'],
  10
),
(
  'Bol de riz sauté aux légumes et œuf',
  'Un repas complet et savoureux à préparer avec des restes de riz',
  15,
  '[{"name":"Riz cuit","quantity":"200","unit":"g"},{"name":"Œufs","quantity":"2"},{"name":"Carotte","quantity":"1"},{"name":"Petits pois","quantity":"50","unit":"g"},{"name":"Sauce soja","quantity":"2","unit":"c.à.s"},{"name":"Huile de sésame","quantity":"1","unit":"c.à.c"}]'::jsonb,
  '["Couper la carotte en petits dés.","Faire chauffer un peu d''huile dans un wok ou une grande poêle.","Faire revenir la carotte et les petits pois 3 minutes.","Pousser les légumes sur le côté, casser les œufs et les brouiller.","Ajouter le riz cuit et mélanger le tout.","Verser la sauce soja et l''huile de sésame.","Faire sauter à feu vif 2 minutes en remuant constamment.","Servir chaud."]'::jsonb,
  ARRAY['riz', 'sauté', 'asiatique', 'rapide'],
  15
);
