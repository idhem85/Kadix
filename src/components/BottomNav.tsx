import { ShoppingCart, Archive, Lightbulb } from 'lucide-react';
import { useTabStore } from '../store/groceryStore';

const tabs = [
  {
    id: 'list' as const,
    label: 'Ma Liste',
    icon: ShoppingCart,
  },
  {
    id: 'pantry' as const,
    label: 'Habitudes',
    icon: Archive,
  },
  {
    id: 'recipes' as const,
    label: 'Recettes',
    icon: Lightbulb,
  },
];

export default function BottomNav() {
  const { activeTab, setActiveTab } = useTabStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-sage-100 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all duration-200 ${
                isActive
                  ? 'text-sage-700'
                  : 'text-sage-400 hover:text-sage-500'
              }`}
            >
              {isActive && (
                <span className="absolute -top-0.5 w-8 h-0.5 bg-sage-500 rounded-full" />
              )}
              <Icon
                size={22}
                className={`transition-transform duration-200 ${
                  isActive ? 'scale-110' : ''
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-all duration-200 ${
                  isActive ? 'opacity-100' : 'opacity-70'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
