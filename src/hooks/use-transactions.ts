import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { supabase } from "@/src/lib/supabase";
import { usePendingWritesStore } from "@/src/stores/pending-writes-store";
import type {
  TransactionInsert,
  TransactionRow,
  TransactionUpdate,
} from "@/src/types/database";
import type { TransactionFilter } from "@/src/stores/filter-store";

const TRANSACTIONS_KEY = ["transactions", "v2"] as const;
const SUMMARY_KEY = ["summary"] as const;

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
 * Paginated transaction list with optional filters.
 * Ordered by date desc. Loads 20 rows per page (infinite scroll).
 */
const PAGE_SIZE = 20;

export function useTransactionsQuery(filters?: TransactionFilter) {
  return useInfiniteQuery<TransactionRow[]>({
    queryKey: [...TRANSACTIONS_KEY, filters],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const from = pageParam as number;
      const to = from + PAGE_SIZE - 1;
      let q = supabase.from("transactions").select("*");
      q = applyFilters(q, filters, "");
      const { data, error } = await q
        .order("date", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return (data ?? []) as TransactionRow[];
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage && lastPage.length === PAGE_SIZE
        ? allPages.length * PAGE_SIZE
        : undefined,
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
      try {
        const { data, error } = await supabase
          .from("transactions")
          .insert(input as never)
          .select()
          .single();
        if (error) throw error;
        return data as TransactionRow;
      } catch (err) {
        // Offline or network error: enqueue for later sync
        usePendingWritesStore.getState().enqueue({
          table: "transactions",
          operation: "insert",
          payload: input,
        });
        throw err;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
      qc.invalidateQueries({ queryKey: SUMMARY_KEY });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...patch
    }: TransactionUpdate & { id: string }) => {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .update(patch as never)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data as TransactionRow;
      } catch (err) {
        usePendingWritesStore.getState().enqueue({
          table: "transactions",
          operation: "update",
          payload: { id, ...patch },
          tempId: id,
        });
        throw err;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
      qc.invalidateQueries({ queryKey: SUMMARY_KEY });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from("transactions")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return id;
      } catch (err) {
        usePendingWritesStore.getState().enqueue({
          table: "transactions",
          operation: "delete",
          payload: id,
          tempId: id,
        });
        throw err;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
      qc.invalidateQueries({ queryKey: SUMMARY_KEY });
    },
  });
}
