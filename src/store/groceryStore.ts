import { create } from 'zustand';
import type { GroceryItem, ShoppingList, PantryItem } from '../types';

interface TabState {
  activeTab: 'list' | 'pantry' | 'recipes';
  setActiveTab: (tab: 'list' | 'pantry' | 'recipes') => void;
}

export const useTabStore = create<TabState>((set) => ({
  activeTab: 'list',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

interface GroceryState {
  currentList: ShoppingList | null;
  items: GroceryItem[];
  isLoading: boolean;
  setCurrentList: (list: ShoppingList | null) => void;
  setItems: (items: GroceryItem[]) => void;
  addItem: (item: GroceryItem) => void;
  updateItem: (item: GroceryItem) => void;
  removeItem: (itemId: string) => void;
  toggleItem: (itemId: string) => void;
  clearChecked: () => void;
  setLoading: (loading: boolean) => void;
}

export const useGroceryStore = create<GroceryState>((set) => ({
  currentList: null,
  items: [],
  isLoading: false,

  setCurrentList: (list) => set({ currentList: list }),
  setItems: (items) => set({ items }),

  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),

  updateItem: (updatedItem) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      ),
    })),

  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    })),

  toggleItem: (itemId) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId
          ? { ...item, is_checked: !item.is_checked }
          : item
      ),
    })),

  clearChecked: () =>
    set((state) => ({
      items: state.items.filter((item) => !item.is_checked),
    })),

  setLoading: (loading) => set({ isLoading: loading }),
}));

interface PantryState {
  items: PantryItem[];
  setItems: (items: PantryItem[]) => void;
  addItem: (item: PantryItem) => void;
  removeItem: (itemId: string) => void;
}

export const usePantryStore = create<PantryState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    })),
}));

type SyncState = 'synced' | 'pending' | 'offline' | 'syncing' | 'unknown';

interface UIState {
  showShareSheet: boolean;
  isOnline: boolean;
  searchQuery: string;
  syncState: SyncState;
  pendingCount: number;
  showSyncIndicator: boolean;
  setShowShareSheet: (show: boolean) => void;
  setIsOnline: (online: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSyncState: (state: SyncState) => void;
  setPendingCount: (count: number) => void;
  setShowSyncIndicator: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  showShareSheet: false,
  isOnline: navigator.onLine,
  searchQuery: '',
  syncState: 'unknown',
  pendingCount: 0,
  showSyncIndicator: false,
  setShowShareSheet: (show) => set({ showShareSheet: show }),
  setIsOnline: (online) => set({ isOnline: online }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSyncState: (state) => set({ syncState: state }),
  setPendingCount: (count) =>
    set({ pendingCount: count, showSyncIndicator: count > 0 }),
  setShowSyncIndicator: (show) => set({ showSyncIndicator: show }),
}));
