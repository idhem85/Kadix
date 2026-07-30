import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, X, Sparkles, ShoppingCart } from 'lucide-react';
import { COMMON_PRODUCTS } from '../../types';
import { guessCategory } from '../../lib/categories';
import { getProductIcon, getCategoryIcon, getProductOrCategoryIcon } from '../../lib/icons';

interface AddItemInputProps {
  onAdd: (name: string, category: string) => void;
}

/** Small helper to render a product icon by name */
function ProductHintIcon({ name }: { name: string }) {
  const Icon = getProductOrCategoryIcon(name, guessCategory(name));
  return <Icon size={18} className="text-sage-500" />;
}

export default function AddItemInput({ onAdd }: AddItemInputProps) {
  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const allProducts = Object.values(COMMON_PRODUCTS).flat();
  const suggestions = value.trim()
    ? allProducts.filter((p) =>
        p.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleAdd = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const category = guessCategory(trimmed);
    onAdd(trimmed, category);
    setValue('');
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
    inputRef.current?.focus();
  }, [value, onAdd]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestion >= 0 && suggestions[selectedSuggestion]) {
        setValue(suggestions[selectedSuggestion]);
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        setTimeout(() => handleAdd(), 50);
      } else {
        handleAdd();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestion((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      {/* Main input bar */}
      <div
        className={`flex items-center gap-2 rounded-2xl px-4 py-3 transition-all duration-300
          bg-white/90 backdrop-blur-sm border-2 shadow-sm
          ${isFocused
            ? 'border-sage-400 shadow-lg shadow-sage-200/30'
            : 'border-sage-200 hover:border-sage-300'
          }
        `}
      >
        {/* Category icon hint */}
        <span className="w-8 h-8 rounded-xl bg-sage-100 flex items-center justify-center shrink-0">
          {value.trim()
            ? <ProductHintIcon name={value.trim()} />
            : <ShoppingCart size={18} className="text-sage-400" />
          }
        </span>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setShowSuggestions(true);
            setSelectedSuggestion(-1);
          }}
          onFocus={() => { setShowSuggestions(true); setIsFocused(true); }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Ajouter un article..."
          className="flex-1 bg-transparent text-sage-800 placeholder-sage-400 outline-none text-[15px] font-medium"
          autoComplete="off"
        />

        {value && (
          <button
            onClick={() => { setValue(''); setShowSuggestions(false); inputRef.current?.focus(); }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-sage-400 hover:text-sage-600 hover:bg-sage-100 transition-all"
          >
            <X size={14} />
          </button>
        )}

        <button
          onClick={handleAdd}
          disabled={!value.trim()}
          className="w-10 h-10 rounded-xl bg-sage-600 hover:bg-sage-700 active:bg-sage-800 
            disabled:bg-sage-200 disabled:cursor-not-allowed flex items-center justify-center 
            text-white transition-all duration-200 shadow-sm shadow-sage-600/20
            hover:shadow-md hover:shadow-sage-600/30 active:scale-95"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute bottom-full mb-2 left-0 right-0 bg-white/95 backdrop-blur-xl 
            border border-sage-100 rounded-2xl shadow-xl shadow-sage-900/10 overflow-hidden animate-slide-up z-30"
        >
          {/* Header */}
          <div className="px-4 py-2 flex items-center gap-1.5 border-b border-sage-50">
            <Sparkles size={12} className="text-sage-400" />
            <span className="text-[11px] font-medium text-sage-400">Suggestions</span>
          </div>

          <div className="max-h-56 overflow-y-auto">
            {suggestions.map((product, index) => {
              const cat = guessCategory(product);

              const ProductIcon = getProductIcon(product);
              const CategoryIcon = getCategoryIcon(cat);

              return (
                <button
                  key={product}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setValue(product);
                    setShowSuggestions(false);
                    setSelectedSuggestion(-1);
                    setTimeout(() => handleAdd(), 50);
                  }}
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-150
                    ${index === selectedSuggestion
                      ? 'bg-sage-100 text-sage-800'
                      : 'text-sage-700 hover:bg-sage-50'
                    }
                    ${index !== suggestions.length - 1 ? 'border-b border-sage-50/50' : ''}
                  `}
                >
                  <span className="w-8 h-8 rounded-lg bg-sage-50 flex items-center justify-center shrink-0">
                    <ProductIcon size={18} className="text-sage-500" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block">{product}</span>
                  </div>
                  <span className="text-[10px] text-sage-400 font-medium flex items-center gap-1 shrink-0">
                    <CategoryIcon size={11} className="opacity-60" />
                    {cat}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
