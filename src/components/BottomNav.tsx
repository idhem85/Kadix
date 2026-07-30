import { ShoppingCart, Archive, Lightbulb } from 'lucide-react';
import { useTabStore } from '../store/groceryStore';

const tabs = [
  {
    id: 'list' as const,
    label: 'Ma Liste',
    icon: ShoppingCart,
    emoji: '🛍️',
  },
  {
    id: 'pantry' as const,
    label: 'Habitudes',
    icon: Archive,
    emoji: '📦',
  },
  {
    id: 'recipes' as const,
    label: 'Recettes',
    icon: Lightbulb,
    emoji: '💡',
  },
];

export default function BottomNav() {
  const { activeTab, setActiveTab } = useTabStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      {/* Background with glass effect */}
      <div className="bg-white/85 backdrop-blur-2xl border-t border-sage-100/80 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all duration-300
                  ${isActive ? 'text-sage-700' : 'text-sage-400 hover:text-sage-500'}
                `}
              >
                {/* Active indicator pill */}
                {isActive && (
                  <span className="absolute -top-[1px] w-10 h-[3px] bg-gradient-to-r from-sage-500 to-sage-400 rounded-full shadow-sm shadow-sage-400/30" />
                )}

                {/* Icon container */}
                <div className={`relative flex items-center justify-center transition-all duration-300
                  ${isActive ? '-translate-y-0.5' : ''}
                `}>
                  {/* Glow behind active icon */}
                  {isActive && (
                    <span className="absolute inset-0 -m-2 rounded-full bg-sage-100/50 blur-sm" />
                  )}
                  <Icon
                    size={21}
                    className={`relative transition-all duration-300
                      ${isActive ? 'scale-110' : ''}
                    `}
                  />
                </div>

                {/* Label */}
                <span
                  className={`relative text-[10px] font-semibold tracking-wide transition-all duration-300
                    ${isActive ? 'opacity-100' : 'opacity-60'}
                  `}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
