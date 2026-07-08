export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          icon: string;
          color: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string | null;
          name: string;
          icon: string;
          color: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          icon?: string;
          color?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          currency: string;
          category_id: string;
          type: "income" | "expense";
          note: string | null;
          date: string;
          source: "manual" | "split_bill" | "email";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          currency?: string;
          category_id: string;
          type: "income" | "expense";
          note?: string | null;
          date?: string;
          source?: "manual" | "split_bill" | "email";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          currency?: string;
          category_id?: string;
          type?: "income" | "expense";
          note?: string | null;
          date?: string;
          source?: "manual" | "split_bill" | "email";
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
export type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
export type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

export type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];
export type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
export type TransactionUpdate = Database["public"]["Tables"]["transactions"]["Update"];

export type TransactionType = "income" | "expense";
export type TransactionSource = "manual" | "split_bill" | "email";

/**
 * Filter tabs for the Transactions list. Extends TransactionType with an
 * "all" option. Defined as an enum so the values can be iterated without
 * inline string arrays.
 */
export enum FilterTab {
  All = "all",
  Income = "income",
  Expense = "expense",
}

/** Ordered list of all filter tabs for iteration in the UI. */
export const FILTER_TABS: readonly FilterTab[] = [
  FilterTab.All,
  FilterTab.Income,
  FilterTab.Expense,
];

/** Human-readable label for each filter tab. */
export const FILTER_TAB_LABELS: Record<FilterTab, string> = {
  [FilterTab.All]: "All",
  [FilterTab.Income]: "Income",
  [FilterTab.Expense]: "Expenses",
};
