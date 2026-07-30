<div align="center">
  
  <br/>
  
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/favicon.svg">
    <img src="public/favicon.svg" alt="Kadix Logo" width="120" height="120" />
  </picture>
  
  <h1 align="center" style="font-size: 3rem; margin: 0.5rem 0 0.25rem; color: #4e5542;">Kadix</h1>
  
  <p align="center" style="font-size: 1.15rem; color: #7d876e; margin-bottom: 1rem;">
    🛒 La liste de courses qui a du goût.
  </p>

  <p align="center" style="font-size: 0.9rem; color: #99a18a; max-width: 500px; margin: 0 auto 1.5rem;">
    <em>Collaborative, intelligente et disponible hors-ligne. Ajoutez vos articles, partagez votre liste en temps réel, 
    laissez-vous inspirer par des recettes qui matchent vos habitudes. Installable sur votre téléphone.</em>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white&style=flat-square" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&style=flat-square" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/Supabase-2-3FCF8E?logo=supabase&logoColor=white&style=flat-square" alt="Supabase" />
    <img src="https://img.shields.io/badge/PWA-✅-5A0FC8?logo=pwa&logoColor=white&style=flat-square" alt="PWA" />
    <img src="https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare&logoColor=white&style=flat-square" alt="Cloudflare Pages" />
  </p>

  <div align="center" style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem;">
    <a href="#✨-fonctionnalités">✨ Fonctionnalités</a> •
    <a href="#🚀-démarrage-rapide">🚀 Démarrage</a> •
    <a href="#🏗️-architecture">🏗️ Architecture</a> •
    <a href="#☁️-déploiement-cloudflare">☁️ Cloudflare</a> •
    <a href="#🗄️-supabase">🗄️ Supabase</a>
  </div>

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

## ☁️ Déploiement Cloudflare Pages

Kadix est optimisé pour Cloudflare Pages. Le déploiement se fait en 2 clics :

### Option 1 : Via le tableau de bord Cloudflare (recommandé)

1. Allez sur [dash.cloudflare.com](https://dash.cloudflare.com) → **Pages** → **Créer un projet**
2. Connectez votre dépôt GitHub `idhem85/Kadix`
3. Utilisez ces paramètres :

| Paramètre | Valeur |
|---|---|
| **Framework** | `Vite` (détection auto) |
| **Build command** | `npm run build` |
| **Build output** | `dist` |
| **Root directory** | (laisser vide) |

4. Ajoutez les variables d'environnement :

| Variable | Valeur |
|---|---|
| `VITE_SUPABASE_URL` | `https://votre-projet.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `votre-clé-anonyme` |

5. **Activer le SPA mode** : Dans les paramètres du projet → **Routing** → activer **SPA mode**
6. Cliquez sur **Déployer** 🚀

### Option 2 : Via Wrangler CLI

```bash
# Installer Wrangler
npm install -g wrangler

# Se connecter à Cloudflare
wrangler login

# Déployer
wrangler pages deploy dist/ --project-name=kadix --branch=main
```

### Fichiers de configuration inclus

| Fichier | Utilité |
|---|---|
| `public/_headers` | En-têtes de cache pour le Service Worker |
| `public/_redirects` | Fallback SPA (/* → /index.html) |
| `vercel.json` | Alternative Vercel |
| `netlify.toml` | Alternative Netlify |

---

## 🚀 Démarrage rapide

```bash
# 1. Cloner
git clone https://github.com/idhem85/Kadix.git && cd Kadix

# 2. Installer
npm install

# 3. Configurer Supabase
cp .env.example .env
# Éditer .env avec vos clés Supabase

# 4. Lancer
npm run dev     # → http://localhost:5173
npm run build   # → dist/
```

---

## 🏗️ Architecture

```
src/
├── App.tsx               # App root + tabs + offline
├── index.css             # Tailwind + thème sage/cream
├── types/index.ts        # Types + 200+ produits
├── store/groceryStore.ts # Zustand (tabs, items, pantry, sync)
│
├── lib/
│   ├── supabase.ts       # Client Supabase
│   ├── db.ts             # Offline-first DB layer
│   ├── indexeddb.ts      # IndexedDB wrapper
│   ├── offline.ts        # Sync queue + cache
│   └── recipes.ts        # Moteur de suggestion
│
├── hooks/
│   ├── useAuth.ts        # Auth Supabase
│   ├── useRealtime.ts    # Subscriptions temps réel
│   └── useOffline.ts     # Sync engine
│
├── components/
│   ├── Layout.tsx        # Header + sync status
│   ├── BottomNav.tsx     # Navigation 3 onglets
│   ├── ShareSheet.tsx    # Partage par code
│   ├── ShoppingList/     # Articles + auto-complétion
│   ├── Pantry/           # Habitudes + recherche
│   └── Recipes/          # Recettes + match ingrédients
│
├── public/
│   ├── sw.js             # Service Worker
│   ├── manifest.json     # PWA manifest
│   ├── favicon.svg       # Logo
│   ├── icons/            # Icônes PWA
│   ├── _headers          # Cloudflare headers
│   └── _redirects        # SPA routing
│
└── supabase/schema.sql   # Schéma DB + 5 recettes
```

### Stack technique

| Technologie | Rôle |
|---|---|
| **React 19** + **TypeScript 6** | UI & typage |
| **Vite 8** + **Tailwind CSS 4** | Build & design |
| **Supabase** | BDD PostgreSQL, Auth, Realtime |
| **Zustand 5** | State management |
| **Lucide React** | Icônes |
| **IndexedDB** | Cache offline |
| **Cloudflare Pages** | Hébergement |

---

## 🗄️ Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. SQL Editor → coller `supabase/schema.sql`
3. Settings → API → récupérer URL + anon key
4. Database → Replication → activer `grocery_items`

> **8 tables**, RLS policies, triggers, indexes et 5 recettes pré-remplies.

---

## 📄 Licence

MIT © [Idhem ALAOUI](https://github.com/idhem85)

---

<div align="center">
  <br/>
  <sub>Fait avec ❤️ à Toulouse</sub>
  <br/><br/>
  <a href="https://github.com/idhem85/Kadix/stargazers">
    <img src="https://img.shields.io/github/stars/idhem85/Kadix?style=social" alt="GitHub stars" />
  </a>
  <br/>
  <sub>⭐ N'oubliez pas l'étoile si le projet vous plaît !</sub>
</div>
