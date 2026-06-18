import { create } from "zustand";

import type { TransactionType } from "@/src/types/database";

export type FilterType = "all" | TransactionType;

export interface TransactionFilter {
  type: FilterType;
  categoryIds: string[];
  dateFrom: string | null; // ISO yyyy-mm-dd
  dateTo: string | null;
  search: string;
}

export interface TransactionFilterActions {
  setType: (type: FilterType) => void;
  toggleCategory: (categoryId: string) => void;
  clearCategories: () => void;
  setDateRange: (from: string | null, to: string | null) => void;
  setSearch: (query: string) => void;
  reset: () => void;
  hasActiveFilters: () => boolean;
  activeFilterCount: () => number;
}

type FilterStore = TransactionFilter & TransactionFilterActions;

const initialState: TransactionFilter = {
  type: "all",
  categoryIds: [],
  dateFrom: null,
  dateTo: null,
  search: "",
};

/**
 * Ephemeral UI state — NOT persisted.
 * Resets on every app launch.
 */
export const useFilterStore = create<FilterStore>((set, get) => ({
  ...initialState,

  setType: (type) => set({ type }),

  toggleCategory: (categoryId) =>
    set((state) => ({
      categoryIds: state.categoryIds.includes(categoryId)
        ? state.categoryIds.filter((id) => id !== categoryId)
        : [...state.categoryIds, categoryId],
    })),

  clearCategories: () => set({ categoryIds: [] }),

  setDateRange: (from, to) => set({ dateFrom: from, dateTo: to }),

  setSearch: (query) => set({ search: query }),

  reset: () => set({ ...initialState }),

  hasActiveFilters: () => {
    const s = get();
    return (
      s.type !== "all" ||
      s.categoryIds.length > 0 ||
      s.dateFrom !== null ||
      s.dateTo !== null ||
      s.search.trim().length > 0
    );
  },

  activeFilterCount: () => {
    const s = get();
    let count = 0;
    if (s.type !== "all") count += 1;
    if (s.categoryIds.length > 0) count += 1;
    if (s.dateFrom !== null || s.dateTo !== null) count += 1;
    if (s.search.trim().length > 0) count += 1;
    return count;
  },
}));
