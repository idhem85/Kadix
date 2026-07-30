import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CloudOff } from 'lucide-react';
import Layout from './components/Layout';
import ShoppingListView from './components/ShoppingList';
import PantryView from './components/Pantry';
import RecipesView from './components/Recipes';
import ShoppingMode from './components/ShoppingMode';
import SplashScreen from './components/SplashScreen';
import { useTabStore, useGroceryStore, useUIStore, useShoppingModeStore } from './store/groceryStore';
import { useAuth } from './hooks/useAuth';
import { useOfflineStatus } from './hooks/useOffline';
import { createShoppingList, getShoppingLists } from './lib/db';

export default function App() {
  const { activeTab } = useTabStore();
  const { setCurrentList, currentList } = useGroceryStore();
  const { loading: authLoading } = useAuth();
  const { isOnline, pendingCount } = useUIStore();
  const { isShoppingMode, exitShoppingMode } = useShoppingModeStore();
  const { syncNow } = useOfflineStatus();

  const [appLoading, setAppLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initRetry, setInitRetry] = useState(0);

  useEffect(() => {
    async function init() {
      try {
        setAppLoading(true);
        const lists = await getShoppingLists();
        if (lists.length > 0) setCurrentList(lists[0]);
        else {
          const newList = await createShoppingList('Ma liste de courses');
          if (newList) setCurrentList(newList);
        }
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError('Impossible de charger l\'application.');
      } finally {
        setAppLoading(false);
      }
    }
    init();
  }, [setCurrentList, initRetry]);

  // Splash screen
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} minDuration={2200} />;
  }

  // Loading screen
  if (appLoading || authLoading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-[#4e5542]">
        <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm">
          <span className="text-white font-extrabold text-2xl">K</span>
        </div>
        <div className="flex gap-2 mt-4">
          {[0, 150, 300].map((delay) => (
            <span key={delay} className="w-2.5 h-2.5 rounded-full bg-white/40 animate-bounce"
              style={{ animationDelay: `${delay}ms`, animationDuration: '1s' }} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-cream-50 p-6">
        <div className="w-20 h-20 rounded-3xl bg-warm-50 flex items-center justify-center mb-4">
          <CloudOff size={40} className="text-warm-500" />
        </div>
        <p className="text-sage-700 text-center mb-2 font-bold text-lg">Problème de connexion</p>
        <p className="text-sage-500 text-sm text-center mb-6 max-w-xs">{error}</p>
        <button onClick={() => { setError(null); setInitRetry((r) => r + 1); }}
          className="px-6 py-3 bg-sage-600 hover:bg-sage-700 text-white font-extrabold 
            rounded-xl transition-all shadow-md shadow-sage-600/20 flex items-center gap-2">
          <RefreshCw size={16} /> Réessayer
        </button>
      </div>
    );
  }

  const listId = currentList?.id;

  // Shopping Mode: fullscreen overlay
  if (isShoppingMode && listId) {
    return <ShoppingMode onExit={exitShoppingMode} listId={listId} />;
  }

  return (
    <Layout>
      {/* Offline banner */}
      {!isOnline && (
        <div className="mb-4 p-4 bg-amber-50/90 backdrop-blur-sm border border-amber-200 rounded-2xl 
          text-sm text-amber-800 flex items-start gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <WifiOff size={17} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold">Mode hors ligne</p>
            <p className="text-xs text-amber-600/90 mt-0.5">
              Modifications synchronisées automatiquement à la reconnexion.
              {pendingCount > 0 && (
                <span className="font-bold"> {pendingCount} en attente.</span>
              )}
            </p>
          </div>
          <button onClick={syncNow}
            className="px-3 py-2 bg-amber-100 hover:bg-amber-200 rounded-xl text-xs font-extrabold 
              transition-all shrink-0 active:scale-95">
            Sync
          </button>
        </div>
      )}

      {/* Sync banner */}
      {isOnline && pendingCount > 0 && (
        <div className="mb-4 p-3 bg-blue-50/90 backdrop-blur-sm border border-blue-200 rounded-2xl 
          text-sm text-blue-700 flex items-center gap-3 shadow-sm">
          <RefreshCw size={16} className="animate-spin shrink-0" />
          <div>
            <p className="font-extrabold">Synchronisation...</p>
            <p className="text-xs text-blue-600/80">{pendingCount} modification{pendingCount > 1 ? 's' : ''} en attente</p>
          </div>
        </div>
      )}

      {/* Tab content */}
      {activeTab === 'list' && listId ? (
        <ShoppingListView listId={listId} />
      ) : activeTab === 'list' ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <p className="text-sage-500">Aucune liste trouvée.</p>
        </div>
      ) : activeTab === 'pantry' && listId ? (
        <PantryView listId={listId} />
      ) : activeTab === 'pantry' ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <p className="text-sage-500">Créez d'abord une liste.</p>
        </div>
      ) : activeTab === 'recipes' && listId ? (
        <RecipesView listId={listId} />
      ) : activeTab === 'recipes' ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <p className="text-sage-500">Créez d'abord une liste.</p>
        </div>
      ) : null}
    </Layout>
  );
}
