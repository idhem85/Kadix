import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CloudOff } from 'lucide-react';
import Layout from './components/Layout';
import ShoppingListView from './components/ShoppingList';
import PantryView from './components/Pantry';
import RecipesView from './components/Recipes';
import { useTabStore, useGroceryStore, useUIStore } from './store/groceryStore';
import { useAuth } from './hooks/useAuth';
import { useOfflineStatus } from './hooks/useOffline';
import { createShoppingList, getShoppingLists } from './lib/db';

export default function App() {
  const { activeTab } = useTabStore();
  const { setCurrentList, currentList } = useGroceryStore();
  const { loading: authLoading } = useAuth();
  const { isOnline, pendingCount } = useUIStore();

  // Initialize the offline sync engine
  const { syncNow } = useOfflineStatus();

  const [appLoading, setAppLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initRetry, setInitRetry] = useState(0);

  // Initialize: create or load a shopping list
  useEffect(() => {
    async function init() {
      try {
        setAppLoading(true);
        const lists = await getShoppingLists();

        if (lists.length > 0) {
          setCurrentList(lists[0]);
        } else {
          const newList = await createShoppingList('Ma liste de courses');
          if (newList) {
            setCurrentList(newList);
          }
        }
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError(
          'Impossible de charger l\'application. Veuillez vérifier votre connexion.'
        );
      } finally {
        setAppLoading(false);
      }
    }
    init();
  }, [setCurrentList, initRetry]);

  // Show loading screen
  if (appLoading || authLoading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-cream-50">
        <div className="w-16 h-16 rounded-3xl bg-sage-200 flex items-center justify-center mb-4">
          <span className="text-sage-700 font-bold text-2xl">K</span>
        </div>
        <div className="flex gap-1.5 mt-4">
          <span className="w-2.5 h-2.5 rounded-full bg-sage-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-sage-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-sage-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-cream-50 p-6">
        <div className="w-20 h-20 rounded-3xl bg-warm-50 flex items-center justify-center mb-4">
          <CloudOff size={40} className="text-warm-500" />
        </div>
        <p className="text-sage-700 text-center mb-2 font-medium">
          Problème de connexion
        </p>
        <p className="text-sage-500 text-sm text-center mb-6 max-w-xs">
          {error}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setError(null);
              setInitRetry((r) => r + 1);
            }}
            className="px-6 py-3 bg-sage-600 hover:bg-sage-700 active:bg-sage-800 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const listId = currentList?.id;

  return (
    <Layout>
      {/* Offline warning banner */}
      {!isOnline && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <WifiOff size={16} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Mode hors ligne</p>
            <p className="text-xs text-amber-600/80 mt-0.5">
              Les modifications seront synchronisées automatiquement à la reconnexion.
              {pendingCount > 0 && (
                <span className="font-medium">
                  {' '}{pendingCount} modification{pendingCount > 1 ? 's' : ''} en attente.
                </span>
              )}
            </p>
          </div>
          <button
            onClick={syncNow}
            className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 rounded-lg text-xs font-medium transition-colors shrink-0"
          >
            Synchroniser
          </button>
        </div>
      )}

      {/* Online sync banner */}
      {isOnline && pendingCount > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 flex items-center gap-2">
          <RefreshCw size={16} className="animate-spin shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Synchronisation en cours...</p>
            <p className="text-xs text-blue-600/80 mt-0.5">
              {pendingCount} modification{pendingCount > 1 ? 's' : ''} en attente d'envoi
            </p>
          </div>
        </div>
      )}

      {/* Tab content */}
      {activeTab === 'list' && listId ? (
        <ShoppingListView listId={listId} />
      ) : activeTab === 'list' ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sage-500">Aucune liste de courses trouvée.</p>
        </div>
      ) : activeTab === 'pantry' && listId ? (
        <PantryView listId={listId} />
      ) : activeTab === 'pantry' ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sage-500">Créez d'abord une liste de courses.</p>
        </div>
      ) : activeTab === 'recipes' && listId ? (
        <RecipesView listId={listId} />
      ) : activeTab === 'recipes' ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sage-500">Créez d'abord une liste de courses.</p>
        </div>
      ) : null}
    </Layout>
  );
}
