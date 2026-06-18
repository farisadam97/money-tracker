import { useEffect, type ReactNode } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/src/lib/supabase";
import { usePendingWritesStore } from "@/src/stores/pending-writes-store";

const MAX_RETRIES = 5;
const QUERY_KEYS_TO_INVALIDATE = [["transactions"], ["categories"]] as const;

/**
 * Listens for network reconnect and drains the pending writes queue.
 * Writes that succeed are removed; failures increment retry count and
 * are pruned after MAX_RETRIES attempts.
 *
 * Must be mounted inside <QueryClientProvider>.
 */
export function SyncProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();

  useEffect(() => {
    const drain = async () => {
      const queue = usePendingWritesStore.getState().queue;
      if (queue.length === 0) return;

      for (const write of queue) {
        try {
          await executeWrite(write);
          usePendingWritesStore.getState().markCompleted(write.id);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          usePendingWritesStore.getState().markFailed(write.id, msg);
        }
      }

      const pruned = usePendingWritesStore
        .getState()
        .pruneFailed(MAX_RETRIES);
      if (pruned > 0) {
        // eslint-disable-next-line no-console
        console.warn(`[SyncProvider] Pruned ${pruned} failed writes`);
      }

      // Invalidate cached queries so UI reflects the synced state
      for (const key of QUERY_KEYS_TO_INVALIDATE) {
        qc.invalidateQueries({ queryKey: key });
      }
    };

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        drain();
      }
    });

    // Also attempt one drain on mount in case the app launched online
    // with leftover queue from a previous session
    drain();

    return unsubscribe;
  }, [qc]);

  return <>{children}</>;
}

async function executeWrite(write: {
  table: string;
  operation: string;
  payload: unknown;
}): Promise<void> {
  const { table, operation, payload } = write;

  if (operation === "insert") {
    const { error } = await supabase
      .from(table)
      .insert(payload as never);
    if (error) throw error;
    return;
  }

  if (operation === "update") {
    const p = payload as { id: string; [k: string]: unknown };
    const { id, ...patch } = p;
    const { error } = await supabase
      .from(table)
      .update(patch as never)
      .eq("id", id);
    if (error) throw error;
    return;
  }

  if (operation === "delete") {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", payload as string);
    if (error) throw error;
    return;
  }

  throw new Error(`Unknown operation: ${operation}`);
}
