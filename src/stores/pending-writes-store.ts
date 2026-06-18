import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type WriteOperation = "insert" | "update" | "delete";
export type TableName = "transactions" | "categories";

export interface PendingWrite {
  id: string;
  table: TableName;
  operation: WriteOperation;
  payload: unknown;
  tempId?: string; // for inserts: client-side ID until server returns the real one
  createdAt: number;
  retries: number;
  lastError?: string;
}

interface PendingWritesState {
  queue: PendingWrite[];
  enqueue: (write: Omit<PendingWrite, "id" | "createdAt" | "retries">) => string;
  markCompleted: (id: string) => void;
  markFailed: (id: string, error: string) => void;
  /** Removes writes that have exceeded max retries */
  pruneFailed: (maxRetries: number) => number;
  clear: () => void;
  hasPending: () => boolean;
}

function uuid(): string {
  // Simple UUID v4 — avoids RN crypto import for simplicity
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * AsyncStorage-backed queue of writes that couldn't reach Supabase.
 *
 * Drain logic lives in SyncProvider. This store only holds the data.
 *
 * Conflicts (same tempId edited twice) are handled by replacing the prior
 * pending write — see `enqueue` dedupe-by-tempId logic.
 */
export const usePendingWritesStore = create<PendingWritesState>()(
  persist(
    (set, get) => ({
      queue: [],

      enqueue: (write) => {
        const id = uuid();
        const entry: PendingWrite = {
          ...write,
          id,
          createdAt: Date.now(),
          retries: 0,
        };

        set((state) => {
          // Dedupe: if a pending write with the same tempId exists, replace it
          // (handles offline edit-then-edit-again on the same transaction)
          if (entry.tempId) {
            const filtered = state.queue.filter(
              (w) => w.tempId !== entry.tempId
            );
            return { queue: [...filtered, entry] };
          }
          return { queue: [...state.queue, entry] };
        });

        return id;
      },

      markCompleted: (id) =>
        set((state) => ({
          queue: state.queue.filter((w) => w.id !== id),
        })),

      markFailed: (id, error) =>
        set((state) => ({
          queue: state.queue.map((w) =>
            w.id === id
              ? { ...w, retries: w.retries + 1, lastError: error }
              : w
          ),
        })),

      pruneFailed: (maxRetries) => {
        const before = get().queue.length;
        set((state) => ({
          queue: state.queue.filter((w) => w.retries < maxRetries),
        }));
        return before - get().queue.length;
      },

      clear: () => set({ queue: [] }),

      hasPending: () => get().queue.length > 0,
    }),
    {
      name: "moneytracker_pending_writes",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
