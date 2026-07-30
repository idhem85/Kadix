import { useState } from 'react';
import {
  WifiOff,
  CloudOff,
  Share2,
  MoreHorizontal,
  LogIn,
  Cloud,
  RefreshCw,
  CheckCircle2,
  X,
} from 'lucide-react';
import BottomNav from './BottomNav';
import { useUIStore } from '../store/groceryStore';
import { useAuth } from '../hooks/useAuth';
import ShareSheet from './ShareSheet';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const {
    isOnline,
    showShareSheet,
    setShowShareSheet,
    syncState,
    pendingCount,
    showSyncIndicator,
  } = useUIStore();
  const auth = useAuth();
  const { user, loading: authLoading, signIn, signUp } = auth;
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleAuth = async () => {
    if (!email || !password) return;
    setAuthError(null);

    let success: boolean;
    if (isSignUp) {
      success = await signUp(email, password);
    } else {
      success = await signIn(email, password);
    }

    if (success) {
      setShowAuth(false);
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-cream-50">
      {/* Sync status bar */}
      {showSyncIndicator && (
        <div
          className={`px-4 py-1.5 text-xs font-medium flex items-center justify-center gap-2 transition-all duration-300 animate-slide-up ${
            pendingCount > 0
              ? 'bg-amber-50 text-amber-700 border-b border-amber-200'
              : syncState === 'synced'
              ? 'bg-green-50 text-green-700 border-b border-green-200'
              : 'bg-warm-50 text-warm-700 border-b border-warm-200'
          }`}
        >
          {!isOnline ? (
            <>
              <CloudOff size={14} />
              <span>Hors ligne — modifications en attente ({pendingCount})</span>
              <RefreshCw size={12} className="animate-pulse-soft" />
            </>
          ) : pendingCount > 0 ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span>Synchronisation... ({pendingCount} en attente)</span>
            </>
          ) : syncState === 'synced' ? (
            <>
              <CheckCircle2 size={14} />
              <span>Synchronisé ✓</span>
            </>
          ) : null}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-sage-100">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sage-200 flex items-center justify-center">
              <span className="text-sage-700 font-bold text-sm">K</span>
            </div>
            <h1 className="text-lg font-semibold text-sage-800">Kadix</h1>
            {!isOnline && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-warm-50 rounded-full border border-warm-200">
                <WifiOff size={10} className="text-warm-600" />
                <span className="text-[9px] text-warm-700 font-medium">
                  Hors ligne
                </span>
              </div>
            )}
            {isOnline && pendingCount === 0 && syncState === 'synced' && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 rounded-full border border-green-200">
                <Cloud size={10} className="text-green-600" />
                <span className="text-[9px] text-green-700 font-medium">
                  Sync
                </span>
              </div>
            )}
            {isOnline && pendingCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-full border border-amber-200">
                <RefreshCw size={10} className="text-amber-600 animate-spin" />
                <span className="text-[9px] text-amber-700 font-medium">
                  {pendingCount}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Share button */}
            <button
              onClick={() => setShowShareSheet(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-sage-500 hover:bg-sage-100 active:bg-sage-200 transition-colors"
              aria-label="Partager la liste"
            >
              <Share2 size={18} />
            </button>

            {/* Auth button */}
            {!authLoading && !user && (
              <button
                onClick={() => setShowAuth(true)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-sage-500 hover:bg-sage-100 active:bg-sage-200 transition-colors"
                aria-label="Connexion"
              >
                <LogIn size={18} />
              </button>
            )}

            {/* Menu button */}
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center text-sage-500 hover:bg-sage-100 active:bg-sage-200 transition-colors"
              aria-label="Menu"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 pt-4 pb-24 max-w-lg mx-auto w-full">
        {children}
      </main>

      {/* Auth modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-sage-800">
                {isSignUp ? 'Créer un compte' : 'Connexion'}
              </h2>
              <button
                onClick={() => setShowAuth(false)}
                className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center text-sage-500 hover:bg-sage-200"
              >
                <X size={16} />
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-warm-50 border border-warm-200 rounded-xl text-sm text-warm-700">
                {authError}
              </div>
            )}

            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-sage-50 border border-sage-200 rounded-xl text-sage-800 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent transition-all"
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-sage-50 border border-sage-200 rounded-xl text-sage-800 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent transition-all"
              />
              <button
                onClick={handleAuth}
                className="w-full py-3 bg-sage-600 hover:bg-sage-700 active:bg-sage-800 text-white font-medium rounded-xl transition-colors"
              >
                {isSignUp ? 'Créer un compte' : 'Se connecter'}
              </button>
            </div>

            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthError(null);
              }}
              className="w-full mt-4 text-sm text-sage-500 hover:text-sage-700 transition-colors"
            >
              {isSignUp
                ? 'Déjà un compte ? Connectez-vous'
                : 'Pas encore de compte ? Créez-en un'}
            </button>
          </div>
        </div>
      )}

      {/* Share sheet */}
      {showShareSheet && <ShareSheet onClose={() => setShowShareSheet(false)} />}

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}
