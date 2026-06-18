import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { supabase } from "@/src/lib/supabase";
import { usePendingWritesStore } from "@/src/stores/pending-writes-store";
import type {
  CategoryInsert,
  CategoryRow,
  CategoryUpdate,
} from "@/src/types/database";

const CATEGORIES_KEY = ["categories"] as const;

/**
 * Fetches all categories visible to the current user:
 * - Master categories (user_id IS NULL)
 * - User's custom categories (user_id = auth.uid())
 *
 * Sorted: master first, then user categories. Each group alphabetical by name.
 * RLS on the Supabase side scopes this automatically.
 */
export function useCategoriesQuery() {
  return useQuery<CategoryRow[]>({
    queryKey: CATEGORIES_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return (data ?? []) as CategoryRow[];
    },
  });
}

/** Splits a flat categories list into master (user_id IS NULL) and user-owned. */
export function partitionCategories(
  categories: CategoryRow[]
): { master: CategoryRow[]; user: CategoryRow[] } {
  return {
    master: categories.filter((c) => c.user_id === null),
    user: categories.filter((c) => c.user_id !== null),
  };
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CategoryInsert) => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .insert(input as never)
          .select()
          .single();
        if (error) throw error;
        return data as CategoryRow;
      } catch (err) {
        // Offline or network error: enqueue for later sync
        const enqueue = usePendingWritesStore.getState().enqueue;
        enqueue({
          table: "categories",
          operation: "insert",
          payload: input,
        });
        throw err;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: CategoryUpdate & { id: string }) => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .update(patch as never)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data as CategoryRow;
      } catch (err) {
        usePendingWritesStore.getState().enqueue({
          table: "categories",
          operation: "update",
          payload: { id, ...patch },
          tempId: id,
        });
        throw err;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase.from("categories").delete().eq("id", id);
        if (error) throw error;
        return id;
      } catch (err) {
        usePendingWritesStore.getState().enqueue({
          table: "categories",
          operation: "delete",
          payload: id,
          tempId: id,
        });
        throw err;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}
