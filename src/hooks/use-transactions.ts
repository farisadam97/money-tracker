import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/src/lib/supabase";
import type {
  TransactionInsert,
  TransactionRow,
  TransactionUpdate,
} from "@/src/types/database";
import type { TransactionFilter } from "@/src/stores/filter-store";

const TRANSACTIONS_KEY = ["transactions"] as const;

/**
 * Applies TransactionFilter state to a Supabase query.
 * Returns a copy of the query (not the original) for immutability.
 */
export function applyFilters(
  query: ReturnType<typeof supabase.from>,
  filters: TransactionFilter | undefined,
  userCurrency: string
) {
  let q = query;

  // Per AR-5 decision: Phase 1 dashboard excludes foreign-currency
  // transactions from totals. But the full Transactions list SHOULD show all.
  // This filter is only applied when explicitly requested by the caller.
  if (userCurrency) {
    q = q.eq("currency", userCurrency) as typeof query;
  }

  if (!filters) return q;

  if (filters.type !== "all") {
    q = q.eq("type", filters.type) as typeof query;
  }
  if (filters.categoryIds.length > 0) {
    q = q.in("category_id", filters.categoryIds) as typeof query;
  }
  if (filters.dateFrom) {
    q = q.gte("date", filters.dateFrom) as typeof query;
  }
  if (filters.dateTo) {
    q = q.lte("date", filters.dateTo) as typeof query;
  }
  if (filters.search.trim().length > 0) {
    q = q.ilike("note", `%${filters.search.trim()}%`) as typeof query;
  }
  return q;
}

/**
 * Full transaction list with optional filters.
 * Ordered by date desc.
 */
export function useTransactionsQuery(filters?: TransactionFilter) {
  return useQuery<TransactionRow[]>({
    queryKey: [...TRANSACTIONS_KEY, filters],
    queryFn: async () => {
      let q = supabase.from("transactions").select("*");
      q = applyFilters(q, filters, "");
      const { data, error } = await q.order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TransactionRow[];
    },
  });
}

/** Recent N transactions for the Dashboard — no filters. */
export function useRecentTransactionsQuery(limit = 5) {
  return useQuery<TransactionRow[]>({
    queryKey: [...TRANSACTIONS_KEY, "recent", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false })
        .range(0, Math.max(0, limit - 1));
      if (error) throw error;
      return (data ?? []) as TransactionRow[];
    },
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TransactionInsert) => {
      const { data, error } = await supabase
        .from("transactions")
        .insert(input as never)
        .select()
        .single();
      if (error) throw error;
      return data as TransactionRow;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY }),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...patch
    }: TransactionUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("transactions")
        .update(patch as never)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as TransactionRow;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY }),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY }),
  });
}
