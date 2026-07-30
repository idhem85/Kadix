<div align="center">
  
  <br/>
  
  <div>
    <img src="public/icons/icon-192x192.png" alt="Kadix Logo" width="96" height="96" style="border-radius: 24px;" />
  </div>
  
  <h1 align="center" style="font-size: 3rem; margin: 0.5rem 0 0.25rem; color: #4e5542;">Kadix</h1>
  
  <p align="center" style="font-size: 1.25rem; color: #7d876e; margin-bottom: 1.5rem;">
    🛒 <strong>Votre liste de courses collaborative et intelligente</strong>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white&style=flat-square" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&style=flat-square" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/Supabase-2-3FCF8E?logo=supabase&logoColor=white&style=flat-square" alt="Supabase" />
    <img src="https://img.shields.io/badge/PWA-✅-5A0FC8?logo=pwa&logoColor=white&style=flat-square" alt="PWA" />
  </p>

  <br/>

  <div align="center" style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem;">
    <a href="#✨-fonctionnalités">✨ Fonctionnalités</a> •
    <a href="#📸-captures-décran">📸 Captures</a> •
    <a href="#🚀-démarrage-rapide">🚀 Démarrage</a> •
    <a href="#🏗️-architecture">🏗️ Architecture</a> •
    <a href="#🗄️-supabase">🗄️ Supabase</a> •
    <a href="#📦-déploiement">📦 Déploiement</a>
  </div>

  <br/>

  <table align="center">
    <tr>
      <td align="center" width="25%">
        <strong>🛍️</strong><br/>
        <sub>Ma Liste</sub>
      </td>
      <td align="center" width="25%">
        <strong>📦</strong><br/>
        <sub>Habitudes</sub>
      </td>
      <td align="center" width="25%">
        <strong>💡</strong><br/>
        <sub>Recettes</sub>
      </td>
      <td align="center" width="25%">
        <strong>👥</strong><br/>
        <sub>Partage</sub>
      </td>
    </tr>
    <tr>
      <td align="center"><sub>Courses en cours avec tri par rayon</sub></td>
      <td align="center"><sub>Produits fréquents en un clic</sub></td>
      <td align="center"><sub>Suggestions personnalisées</sub></td>
      <td align="center"><sub>Listes collaboratives temps réel</sub></td>
    </tr>
  </table>

  <br/>
</div>

---

## ✨ Fonctionnalités

### 🛍️ **Ma Liste** — L'essentiel, simplement
| Fonctionnalité | Détail |
|---|---|
| **Ajout rapide** | Champ de saisie avec auto-complétion intelligente |
| **Tri automatique** | Articles classés par rayon (Fruits & Légumes, Épicerie, etc.) |
| **Mode courses** | Grandes cases à cocher, articles barrés glissent en bas |
| **Nettoyage** | Bouton pour vider/archiver les articles cochés |

### 📦 **Mes Habitudes** — Votre garde-manger digital
| Fonctionnalité | Détail |
|---|---|
| **Catalogue perso** | Tous vos produits achetés fréquemment |
| **Ajout 1-clic** | Un clic → directement dans la liste de courses |
| **Suggestions** | Découvrez de nouveaux produits par catégorie |
| **Fréquence** | Les produits les plus achetés remontent en haut |

### 💡 **Idées Recettes** — L'inspiration culinaire
| Fonctionnalité | Détail |
|---|---|
| **Analyse intelligente** | Basée sur vos produits du placard |
| **3 à 5 recettes** | Simples et rapides (15-20 min max) |
| **Ingrédients** | Visualisation de ce que vous avez déjà |
| **Ajout automatique** | Bouton pour ajouter les ingrédients manquants à la liste |

### 👥 **Collaboration temps réel**
| Fonctionnalité | Détail |
|---|---|
| **Partage** | Code d'invitation unique ou lien |
| **Sync instantanée** | Supabase Realtime — modifications visibles en direct |
| **Sécurité** | RLS policies — chacun ses données |

### 📡 **Mode hors-ligne avancé**
| Fonctionnalité | Détail |
|---|---|
| **Cache IndexedDB** | Données stockées localement |
| **File d'attente** | Actions mises en attente hors-ligne |
| **Sync automatique** | Replay dès la reconnexion |
| **Indicateurs** | Statut de synchronisation visible en temps réel |

### 📱 **PWA — Installez sur votre téléphone**
- Service Worker avec stratégies de cache intelligentes
- Manifest complet — installation sur l'écran d'accueil iOS & Android
- Fonctionnement 100% hors-ligne
- Icônes générées pour toutes les tailles

---

## 📸 Captures d'écran

<div align="center">
  
*Bientôt disponible — Mockups et démo en ligne*
  
| Ma Liste | Habitudes | Recettes | Partage |
|---|---|---|---|
| *Liste de courses* | *Produits fréquents* | *Suggestions* | *Invitation* |

</div>

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js 22+
- npm 10+
- Compte Supabase (gratuit)

### Installation

```bash
# 1. Cloner le projet
git clone https://github.com/idhem85/Kadix.git
cd Kadix

# 2. Installer les dépendances
npm install

# 3. Copier le fichier d'environnement
cp .env.example .env

# 4. ⚠️ Configurer Supabase (voir section ci-dessous)
# Remplacer VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env

# 5. Lancer en développement
npm run dev

# 6. Build production
npm run build
```

### Générer les icônes PWA (optionnel)

```bash
node scripts/generate-icons.js
```

---

## 🗄️ Supabase

### 1. Créer un projet
Aller sur [supabase.com](https://supabase.com) → **New project**

### 2. Appliquer le schéma
Dans votre projet Supabase → **SQL Editor** → coller le contenu de `supabase/schema.sql`

### 3. Récupérer les clés
**Project Settings → API** :
- **URL** → `VITE_SUPABASE_URL`
- **anon public key** → `VITE_SUPABASE_ANON_KEY`

### 4. Activer Realtime
**Database → Replication** → activer le flag pour la table `grocery_items`

### Schéma de données

```
📁 auth.users (géré par Supabase)
└── 📁 profiles
    ├── 📁 shopping_lists
    │   ├── 📁 list_members (collaborateurs)
    │   └── 📁 grocery_items (articles de la liste)
    ├── 📁 pantry_items (habitudes d'achat)
    └── 📁 recipes (recettes suggérées)
```

> **8 tables** avec RLS policies, indexes, triggers, et 5 recettes pré-remplissées.

---

## 📦 Déploiement

Kadix est prêt à être déployé sur **Vercel**, **Netlify** ou **Cloudflare Pages**.

### Fichiers de configuration inclus

| Plateforme | Fichier | SPA Routing | SW Cache |
|---|---|---|---|
| **Vercel** | `vercel.json` | ✅ Rewrites | ✅ Headers |
| **Netlify** | `netlify.toml` + `public/_redirects` | ✅ Redirects | ✅ Headers |
| **Cloudflare** | `public/_headers` + mode SPA | ✅ Dashboard | ✅ Headers |

### Déploiement express (Vercel)

```bash
npm install -g vercel
vercel
# Suivez les instructions — Vercel détecte automatiquement la config
```

---

## 🏗️ Architecture

```
src/
├── main.tsx              # Entry point + SW registration
├── App.tsx               # App root + tabs + offline banner
├── index.css             # Tailwind + thème sage/cream
│
├── types/index.ts        # Types, catégories, 200+ produits
├── store/groceryStore.ts # Zustand — tabs, items, pantry, sync
│
├── lib/
│   ├── supabase.ts       # Client Supabase
│   ├── db.ts             # Offline-first DB layer
│   ├── indexeddb.ts      # IndexedDB wrapper (cache + queue)
│   ├── offline.ts        # Sync queue + cache management
│   └── recipes.ts        # Moteur de suggestion de recettes
│
├── hooks/
│   ├── useAuth.ts        # Auth Supabase (signup/signin)
│   ├── useRealtime.ts    # Subscriptions temps réel
│   └── useOffline.ts     # Sync engine + periodic sync
│
├── components/
│   ├── Layout.tsx        # Header + sync status + auth modal
│   ├── BottomNav.tsx     # Navigation 3 onglets
│   ├── ShareSheet.tsx    # Partage par code/lien/QR
│   │
│   ├── ShoppingList/     # Liste de courses
│   │   ├── index.tsx     # Items groupés par catégorie
│   │   ├── AddItemInput.tsx  # Auto-complétion
│   │   └── GroceryItem.tsx   # Checkbox + swipe delete
│   │
│   ├── Pantry/           # Habitudes
│   │   └── index.tsx     # Grille de produits + recherche
│   │
│   └── Recipes/          # Recettes
│       ├── index.tsx     # Suggestions analysées
│       └── RecipeCard.tsx # Détail + match ingrédients
│
├── public/
│   ├── sw.js             # Service Worker (offline-first)
│   ├── manifest.json     # PWA manifest
│   ├── icons/            # Icônes PWA (72→512px)
│   ├── _headers          # Cloudflare/Netlify headers
│   └── _redirects        # Netlify SPA fallback
│
└── supabase/schema.sql   # Schéma DB + seed
```

### Stack technique

| Technologie | Version | Usage |
|---|---|---|
| **React** | 19 | UI Components |
| **TypeScript** | 6 | Typage strict |
| **Vite** | 8 | Build & HMR |
| **Tailwind CSS** | 4 | Design system |
| **Supabase** | 2 | BDD, Auth, Realtime |
| **Zustand** | 5 | State management |
| **Lucide React** | 1 | Icônes |
| **IndexedDB** | — | Cache offline |

---

## 🎨 Design

- **Palette** : Vert sauge (`sage`) + Crème (`cream`) + Accents chauds (`warm`)
- **Mobile-first** : Navigation basse, utilisation à une main
- **Animations** : slide-up, fade-in, check-pop, transition fluides
- **Thème** : Fond crème doux, accents naturels, typographie Inter

---

## 📄 Licence

MIT © [Idhem ALAOUI](https://github.com/idhem85)

---

<div align="center">
  <br/>
  <sub>Fait avec ❤️ et 🥖 à Toulouse</sub>
  <br/><br/>
  
  [![GitHub stars](https://img.shields.io/github/stars/idhem85/Kadix?style=social)](https://github.com/idhem85/Kadix/stargazers)
  [![GitHub forks](https://img.shields.io/github/forks/idhem85/Kadix?style=social)](https://github.com/idhem85/Kadix/forks)
  
  <br/>
  <sub>⭐ N'oubliez pas de mettre une étoile si le projet vous plaît !</sub>
</div>
