import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/src/lib/supabase";
import { useUserPreferencesStore } from "@/src/stores/user-preferences-store";
import type { TransactionRow } from "@/src/types/database";

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  total: number;
  percentage: number;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: CategoryBreakdown[];
  /** Count of transactions excluded from totals due to foreign currency (AR-5). */
  foreignCurrencyExcluded: number;
}

const SUMMARY_KEY = ["summary"] as const;

/**
 * Returns YYYY-MM for a Date, anchored to the user's locale.
 */
export function monthKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 7);
}

/**
 * Computes a monthly summary client-side from the transactions table.
 *
 * Per AR-5 decision (Phase 1): only transactions matching the user's default
 * currency are included in totals. Foreign-currency transactions are counted
 * (foreignCurrencyExcluded) but not summed, avoiding the need for an FX rate
 * table.
 *
 * In Phase 2+ this can be replaced by a Supabase RPC / Postgres function for
 * better performance.
 */
export function useSummaryQuery(monthDate: Date = new Date()) {
  const defaultCurrency = useUserPreferencesStore(
    (s) => s.defaultCurrency
  );
  const key = monthKey(monthDate);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const from = new Date(year, month, 1);
  const to = new Date(year, month + 1, 0); // last day of month

  return useQuery<MonthlySummary>({
    queryKey: [...SUMMARY_KEY, key, defaultCurrency],
    queryFn: async () => {
      // 1. Fetch all transactions for the month (both currencies)
      const { data, error } = await supabase
        .from("transactions")
        .select("*, categories!inner(name, icon, color)")
        .gte("date", from.toISOString().slice(0, 10))
        .lte("date", to.toISOString().slice(0, 10));
      if (error) throw error;

      const rows = (data ?? []) as Array<
        TransactionRow & {
          categories: { name: string; icon: string; color: string };
        }
      >;

      // 2. Partition by currency
      const domestic = rows.filter((r) => r.currency === defaultCurrency);
      const foreign = rows.filter((r) => r.currency !== defaultCurrency);

      // 3. Sum domestic transactions
      const totalIncome = domestic
        .filter((r) => r.type === "income")
        .reduce((sum, r) => sum + Number(r.amount), 0);
      const totalExpense = domestic
        .filter((r) => r.type === "expense")
        .reduce((sum, r) => sum + Number(r.amount), 0);

      // 4. Category breakdown for expenses only
      const expenseByCategory = new Map<
        string,
        { name: string; icon: string; color: string; total: number }
      >();
      for (const r of domestic.filter((r) => r.type === "expense")) {
        const cat = r.categories;
        const existing = expenseByCategory.get(r.category_id);
        if (existing) {
          existing.total += Number(r.amount);
        } else {
          expenseByCategory.set(r.category_id, {
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            total: Number(r.amount),
          });
        }
      }

      const byCategory: CategoryBreakdown[] = Array.from(
        expenseByCategory.entries()
      )
        .map(([categoryId, v]) => ({
          categoryId,
          categoryName: v.name,
          categoryIcon: v.icon,
          categoryColor: v.color,
          total: v.total,
          percentage:
            totalExpense > 0
              ? Math.round((v.total / totalExpense) * 1000) / 10
              : 0,
        }))
        .sort((a, b) => b.total - a.total);

      return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        byCategory,
        foreignCurrencyExcluded: foreign.length,
      };
    },
  });
}
