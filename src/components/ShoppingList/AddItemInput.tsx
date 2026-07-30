import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import { COMMON_PRODUCTS } from '../../types';

interface AddItemInputProps {
  onAdd: (name: string, category: string) => void;
}

// Guess category from product name
function guessCategory(name: string): string {
  const normalized = name.toLowerCase().trim();
  
  for (const [category, products] of Object.entries(COMMON_PRODUCTS)) {
    if (products.some((p) => p.toLowerCase().includes(normalized) || normalized.includes(p.toLowerCase()))) {
      return category;
    }
  }
  return 'Autre';
}

export default function AddItemInput({ onAdd }: AddItemInputProps) {
  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Get all unique suggestions
  const allProducts = Object.values(COMMON_PRODUCTS).flat();
  const suggestions = value.trim()
    ? allProducts.filter((p) =>
        p.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8)
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
      setSelectedSuggestion((prev) =>
        Math.min(prev + 1, suggestions.length - 1)
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestion((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
    }
  };

  // Hide suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-white border-2 border-sage-200 focus-within:border-sage-400 rounded-2xl px-4 py-3 transition-all duration-200 shadow-sm">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setShowSuggestions(true);
            setSelectedSuggestion(-1);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Ajouter un article..."
          className="flex-1 bg-transparent text-sage-800 placeholder-sage-400 outline-none text-[15px]"
          autoComplete="off"
        />

        {value && (
          <button
            onClick={() => {
              setValue('');
              setShowSuggestions(false);
              inputRef.current?.focus();
            }}
            className="w-6 h-6 rounded-full flex items-center justify-center text-sage-400 hover:text-sage-600 hover:bg-sage-100 transition-all"
          >
            <X size={14} />
          </button>
        )}

        <button
          onClick={handleAdd}
          disabled={!value.trim()}
          className="w-9 h-9 rounded-xl bg-sage-600 hover:bg-sage-700 active:bg-sage-800 disabled:bg-sage-200 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all duration-200"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-sage-100 rounded-2xl shadow-lg overflow-hidden animate-slide-up z-30"
        >
          {suggestions.map((product, index) => (
            <button
              key={product}
              onClick={() => {
                setValue(product);
                setShowSuggestions(false);
                setSelectedSuggestion(-1);
                setTimeout(() => handleAdd(), 50);
              }}
              className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors ${
                index === selectedSuggestion
                  ? 'bg-sage-100 text-sage-800'
                  : 'text-sage-700 hover:bg-sage-50'
              }`}
            >
              <Plus size={14} className="text-sage-400 shrink-0" />
              <span>{product}</span>
              <span className="ml-auto text-[11px] text-sage-400 font-medium">
                {guessCategory(product)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
