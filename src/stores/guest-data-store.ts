import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  CategoryInsert,
  CategoryRow,
  TransactionInsert,
  TransactionRow,
} from "@/src/types/database";

interface GuestDataState {
  categories: CategoryRow[];
  transactions: TransactionRow[];
  addCategory: (category: Omit<CategoryInsert, "id">) => CategoryRow;
  updateCategory: (id: string, updates: Partial<CategoryInsert>) => void;
  deleteCategory: (id: string) => void;
  addTransaction: (transaction: Omit<TransactionInsert, "id">) => TransactionRow;
  updateTransaction: (id: string, updates: Partial<TransactionInsert>) => void;
  deleteTransaction: (id: string) => void;
  getAllData: () => { categories: CategoryRow[]; transactions: TransactionRow[] };
  clearAllData: () => void;
}

function generateId(): string {
  return crypto.randomUUID();
}

function nowISO(): string {
  return new Date().toISOString();
}

export const useGuestDataStore = create<GuestDataState>()(
  persist(
    (set, get) => ({
      categories: [],
      transactions: [],

      addCategory: (input) => {
        const row: CategoryRow = {
          id: generateId(),
          user_id: "guest",
          name: input.name,
          icon: input.icon,
          color: input.color,
          is_active: input.is_active ?? true,
          created_at: nowISO(),
        };
        set((state) => ({ categories: [...state.categories, row] }));
        return row;
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
      },

      addTransaction: (input) => {
        const row: TransactionRow = {
          id: generateId(),
          user_id: "guest",
          amount: input.amount,
          currency: input.currency ?? "USD",
          category_id: input.category_id,
          type: input.type,
          note: input.note ?? null,
          date: input.date ?? new Date().toISOString().split("T")[0],
          source: input.source ?? "manual",
          created_at: nowISO(),
          updated_at: nowISO(),
        };
        set((state) => ({ transactions: [...state.transactions, row] }));
        return row;
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id
              ? { ...t, ...updates, updated_at: nowISO() }
              : t
          ),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      getAllData: () => {
        const { categories, transactions } = get();
        return { categories, transactions };
      },

      clearAllData: () => {
        set({ categories: [], transactions: [] });
      },
    }),
    {
      name: "moneytracker_guest_data",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
