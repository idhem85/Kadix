import { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import type { GroceryItem as GroceryItemType } from '../../types';

interface GroceryItemProps {
  item: GroceryItemType;
  onToggle: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
}

export default function GroceryItem({ item, onToggle, onDelete }: GroceryItemProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleToggle = () => {
    onToggle(item.id, !item.is_checked);
  };

  const handleDelete = () => {
    setIsRemoving(true);
    setTimeout(() => onDelete(item.id), 200);
  };

  const categoryColors: Record<string, string> = {
    'Fruits & Légumes': 'bg-green-100 text-green-700 border-green-200',
    'Produits Laitiers': 'bg-blue-100 text-blue-700 border-blue-200',
    'Viandes & Poissons': 'bg-rose-100 text-rose-700 border-rose-200',
    'Épicerie': 'bg-amber-100 text-amber-700 border-amber-200',
    'Boulangerie': 'bg-orange-100 text-orange-700 border-orange-200',
    'Boissons': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'Surgelés': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Hygiène & Maison': 'bg-purple-100 text-purple-700 border-purple-200',
    'Frais & Traiteur': 'bg-teal-100 text-teal-700 border-teal-200',
    'Bio & Diététique': 'bg-lime-100 text-lime-700 border-lime-200',
  };

  const categoryColor = categoryColors[item.category] || 'bg-sage-100 text-sage-600 border-sage-200';

  return (
    <div
      className={`group flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-sage-100 transition-all duration-300 ${
        item.is_checked
          ? 'opacity-50 scale-[0.98]'
          : 'opacity-100 hover:border-sage-200 hover:shadow-sm'
      } ${
        isRemoving ? 'opacity-0 scale-95 -translate-y-2' : 'animate-slide-up'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className={`relative w-7 h-7 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
          item.is_checked
            ? 'bg-sage-600 border-sage-600 text-white animate-check-pop'
            : 'border-sage-300 hover:border-sage-500 hover:bg-sage-50'
        }`}
        aria-label={item.is_checked ? 'Décocher' : 'Cocher'}
      >
        {item.is_checked && <Check size={16} strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-[15px] font-medium transition-all duration-200 ${
              item.is_checked
                ? 'line-through text-sage-400'
                : 'text-sage-800'
            }`}
          >
            {item.name}
          </span>
          {item.quantity && (
            <span className={`text-sm shrink-0 ${
              item.is_checked ? 'text-sage-300' : 'text-sage-500'
            }`}>
              {item.quantity}{item.unit ? ` ${item.unit}` : ''}
            </span>
          )}
        </div>

        {/* Category badge */}
        <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${categoryColor}`}>
          {item.category}
        </span>
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-sage-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
        aria-label="Supprimer"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
