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
  Sparkles,
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
    if (isSignUp) success = await signUp(email, password);
    else success = await signIn(email, password);
    if (success) { setShowAuth(false); setEmail(''); setPassword(''); }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-cream-50">
      {/* Sync status pill */}
      {showSyncIndicator && (
        <div
          className={`px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 
            transition-all duration-300 animate-slide-up
            ${pendingCount > 0
              ? 'bg-amber-50 text-amber-700 border-b border-amber-200'
              : syncState === 'synced'
              ? 'bg-green-50 text-green-700 border-b border-green-200'
              : 'bg-warm-50 text-warm-700 border-b border-warm-200'
            }`}
        >
          {!isOnline ? (
            <><CloudOff size={13} /><span>Hors ligne — {pendingCount} modification{pendingCount !== 1 ? 's' : ''} en attente</span></>
          ) : pendingCount > 0 ? (
            <><RefreshCw size={13} className="animate-spin" /><span>Synchronisation...</span></>
          ) : syncState === 'synced' ? (
            <><CheckCircle2 size={13} /><span>Synchronisé ✓</span></>
          ) : null}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-sage-100/80 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          {/* Logo area */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm shrink-0">
              <img src="/favicon.svg" alt="Kadix" className="w-full h-full" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-sage-800 tracking-tight leading-none">
                Kadix
              </h1>
              <div className="flex items-center gap-1 mt-0.5">
                {!isOnline ? (
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-warm-50 rounded-full border border-warm-200">
                    <WifiOff size={8} className="text-warm-600" />
                    <span className="text-[8px] text-warm-700 font-bold">Hors ligne</span>
                  </div>
                ) : pendingCount === 0 && syncState === 'synced' ? (
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 rounded-full border border-green-200">
                    <Cloud size={8} className="text-green-600" />
                    <span className="text-[8px] text-green-700 font-bold">Sync</span>
                  </div>
                ) : pendingCount > 0 ? (
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 rounded-full border border-amber-200">
                    <RefreshCw size={8} className="text-amber-600 animate-spin" />
                    <span className="text-[8px] text-amber-700 font-bold">{pendingCount}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowShareSheet(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sage-500 
                hover:bg-sage-100 hover:text-sage-700 active:bg-sage-200 transition-all"
              aria-label="Partager"
            >
              <Share2 size={17} />
            </button>

            {!authLoading && !user && (
              <button
                onClick={() => setShowAuth(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sage-500 
                  hover:bg-sage-100 hover:text-sage-700 active:bg-sage-200 transition-all"
                aria-label="Connexion"
              >
                <LogIn size={17} />
              </button>
            )}

            <button
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sage-500 
                hover:bg-sage-100 hover:text-sage-700 active:bg-sage-200 transition-all"
              aria-label="Menu"
            >
              <MoreHorizontal size={17} />
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-sage-500" />
                <h2 className="text-lg font-extrabold text-sage-800">
                  {isSignUp ? 'Créer un compte' : 'Connexion'}
                </h2>
              </div>
              <button onClick={() => setShowAuth(false)}
                className="w-8 h-8 rounded-xl bg-sage-100 flex items-center justify-center 
                  text-sage-500 hover:bg-sage-200 transition-colors">
                <X size={15} />
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-warm-50 border border-warm-200 rounded-xl text-sm text-warm-700">
                {authError}
              </div>
            )}

            <div className="space-y-3">
              <input type="email" placeholder="Email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-sage-50 border border-sage-200 rounded-xl text-sage-800 
                  placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-300 
                  focus:border-transparent transition-all text-[15px]" />
              <input type="password" placeholder="Mot de passe" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-sage-50 border border-sage-200 rounded-xl text-sage-800 
                  placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-300 
                  focus:border-transparent transition-all text-[15px]" />
              <button onClick={handleAuth}
                className="w-full py-3.5 bg-sage-600 hover:bg-sage-700 active:bg-sage-800 
                  text-white font-extrabold rounded-xl transition-all shadow-md 
                  shadow-sage-600/20 hover:shadow-lg active:scale-[0.98]">
                {isSignUp ? 'Créer un compte' : 'Se connecter'}
              </button>
            </div>

            <button onClick={() => { setIsSignUp(!isSignUp); setAuthError(null); }}
              className="w-full mt-4 text-sm text-sage-500 hover:text-sage-700 font-medium transition-colors">
              {isSignUp ? 'Déjà un compte ? Connectez-vous' : 'Pas encore de compte ? Créez-en un'}
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
