import { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import type { GroceryItem as GroceryItemType } from '../../types';
import { getProductOrCategoryIcon, getCategoryIcon } from '../../lib/icons';

interface GroceryItemProps {
  item: GroceryItemType;
  onToggle: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
}

const categoryThemes: Record<string, { dot: string; bg: string; border: string; glow: string }> = {
  'Fruits & Légumes': { dot: 'bg-green-400', bg: 'from-green-50/80', border: 'border-green-200/50', glow: 'shadow-green-200/30' },
  'Produits Laitiers': { dot: 'bg-blue-400', bg: 'from-blue-50/80', border: 'border-blue-200/50', glow: 'shadow-blue-200/30' },
  'Viandes & Poissons': { dot: 'bg-rose-400', bg: 'from-rose-50/80', border: 'border-rose-200/50', glow: 'shadow-rose-200/30' },
  'Épicerie': { dot: 'bg-amber-400', bg: 'from-amber-50/80', border: 'border-amber-200/50', glow: 'shadow-amber-200/30' },
  'Boulangerie': { dot: 'bg-orange-400', bg: 'from-orange-50/80', border: 'border-orange-200/50', glow: 'shadow-orange-200/30' },
  'Boissons': { dot: 'bg-cyan-400', bg: 'from-cyan-50/80', border: 'border-cyan-200/50', glow: 'shadow-cyan-200/30' },
  'Surgelés': { dot: 'bg-indigo-400', bg: 'from-indigo-50/80', border: 'border-indigo-200/50', glow: 'shadow-indigo-200/30' },
  'Hygiène & Maison': { dot: 'bg-purple-400', bg: 'from-purple-50/80', border: 'border-purple-200/50', glow: 'shadow-purple-200/30' },
  'Frais & Traiteur': { dot: 'bg-teal-400', bg: 'from-teal-50/80', border: 'border-teal-200/50', glow: 'shadow-teal-200/30' },
  'Bio & Diététique': { dot: 'bg-lime-400', bg: 'from-lime-50/80', border: 'border-lime-200/50', glow: 'shadow-lime-200/30' },
};

const defaultTheme = { dot: 'bg-sage-400', bg: 'from-sage-50/80', border: 'border-sage-200/50', glow: 'shadow-sage-200/30' };

export default function GroceryItem({ item, onToggle, onDelete }: GroceryItemProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const ProductIcon = getProductOrCategoryIcon(item.name, item.category);
  const CategoryIcon = getCategoryIcon(item.category);
  const theme = categoryThemes[item.category] || defaultTheme;

  const handleToggle = () => {
    onToggle(item.id, !item.is_checked);
  };

  const handleDelete = () => {
    setIsRemoving(true);
    setTimeout(() => onDelete(item.id), 250);
  };

  return (
    <div
      className={`group relative overflow-hidden transition-all duration-300 rounded-2xl
        ${item.is_checked
          ? 'opacity-55 scale-[0.97]'
          : 'hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99]'
        }
        ${isRemoving ? 'opacity-0 -translate-x-full scale-95' : 'animate-slide-up'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${theme.bg} to-white rounded-2xl ${item.is_checked ? 'opacity-60' : ''}`} />

      {/* Left color accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${theme.dot} ${item.is_checked ? 'opacity-40' : ''}`} />

      {/* Checked overlay line */}
      {item.is_checked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-px bg-sage-200/50" />
        </div>
      )}

      <div className="relative flex items-center gap-3 px-4 py-3.5">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={`relative w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all duration-300
            ${item.is_checked
              ? 'bg-sage-600 border-sage-600 text-white shadow-md shadow-sage-600/30'
              : 'border-sage-300 hover:border-sage-500 hover:bg-sage-50 hover:shadow-sm'
            }`}
          aria-label={item.is_checked ? 'Décocher' : 'Cocher'}
        >
          <span className={`transition-transform duration-300 ${item.is_checked ? 'scale-100 animate-check-pop' : 'scale-0'}`}>
            <Check size={18} strokeWidth={3} />
          </span>
        </button>

        {/* Product icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300
          ${item.is_checked
            ? 'bg-sage-100/50 scale-95'
            : 'bg-white shadow-sm border border-sage-100 group-hover:scale-105'
          }`}
        >
          <ProductIcon size={20} className={item.is_checked ? 'text-sage-400' : 'text-sage-600'} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-[15px] font-semibold transition-all duration-300 truncate
                ${item.is_checked
                  ? 'line-through text-sage-400'
                  : 'text-sage-800'
                }`}
            >
              {item.name}
            </span>
            {item.quantity && (
              <span className={`text-sm font-medium shrink-0 px-2 py-0.5 rounded-lg transition-all duration-300
                ${item.is_checked
                  ? 'bg-sage-100/50 text-sage-400'
                  : 'bg-sage-100 text-sage-600'
                }`}
              >
                {item.quantity}{item.unit ? <span className="text-[10px] ml-0.5">{item.unit}</span> : ''}
              </span>
            )}
          </div>

          {/* Category chip */}
          <div className="flex items-center gap-1.5 mt-1">              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border transition-all
              ${item.is_checked
                ? 'bg-sage-50 text-sage-400 border-sage-100'
                : 'bg-white text-sage-500 border-sage-200/70'
              }`}
            >
              <CategoryIcon size={11} className="opacity-70" />
              {item.category}
            </span>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300
            ${isHovered
              ? 'text-red-400 bg-red-50 hover:bg-red-100 hover:text-red-500 opacity-100'
              : 'text-sage-300 opacity-0 group-hover:opacity-100'
            }
          `}
          aria-label="Supprimer"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
