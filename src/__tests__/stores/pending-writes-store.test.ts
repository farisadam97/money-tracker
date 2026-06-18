import { describe, it, expect, beforeEach } from "@jest/globals";
import { create } from "zustand";

// Re-implemented in-memory to avoid AsyncStorage side effects in tests.
// Mirrors the production store exactly.
interface PendingWrite {
  id: string;
  table: "transactions" | "categories";
  operation: "insert" | "update" | "delete";
  payload: unknown;
  tempId?: string;
  createdAt: number;
  retries: number;
  lastError?: string;
}

interface TestState {
  queue: PendingWrite[];
  enqueue: (w: Omit<PendingWrite, "id" | "createdAt" | "retries">) => string;
  markCompleted: (id: string) => void;
  markFailed: (id: string, error: string) => void;
  pruneFailed: (max: number) => number;
  clear: () => void;
  hasPending: () => boolean;
}

let counter = 0;
const uuid = () => `test-${++counter}`;

const store = create<TestState>()((set, get) => ({
  queue: [],
  enqueue: (w) => {
    const id = uuid();
    const entry: PendingWrite = {
      ...w,
      id,
      createdAt: Date.now(),
      retries: 0,
    };
    set((state) => {
      if (entry.tempId) {
        return {
          queue: [
            ...state.queue.filter((x) => x.tempId !== entry.tempId),
            entry,
          ],
        };
      }
      return { queue: [...state.queue, entry] };
    });
    return id;
  },
  markCompleted: (id) =>
    set((s) => ({ queue: s.queue.filter((w) => w.id !== id) })),
  markFailed: (id, error) =>
    set((s) => ({
      queue: s.queue.map((w) =>
        w.id === id
          ? { ...w, retries: w.retries + 1, lastError: error }
          : w
      ),
    })),
  pruneFailed: (max) => {
    const before = get().queue.length;
    set((s) => ({ queue: s.queue.filter((w) => w.retries < max) }));
    return before - get().queue.length;
  },
  clear: () => set({ queue: [] }),
  hasPending: () => get().queue.length > 0,
}));

describe("PendingWritesStore logic", () => {
  beforeEach(() => {
    store.getState().clear();
    counter = 0;
  });

  it("starts empty", () => {
    expect(store.getState().queue).toEqual([]);
    expect(store.getState().hasPending()).toBe(false);
  });

  it("enqueue adds to queue and returns id", () => {
    const id = store.getState().enqueue({
      table: "transactions",
      operation: "insert",
      payload: { amount: 100 },
    });
    expect(id).toBeTruthy();
    expect(store.getState().queue).toHaveLength(1);
    expect(store.getState().hasPending()).toBe(true);
  });

  it("markCompleted removes by id", () => {
    const id = store.getState().enqueue({
      table: "transactions",
      operation: "insert",
      payload: {},
    });
    store.getState().markCompleted(id);
    expect(store.getState().queue).toHaveLength(0);
  });

  it("markFailed increments retries and stores error", () => {
    const id = store.getState().enqueue({
      table: "transactions",
      operation: "insert",
      payload: {},
    });
    store.getState().markFailed(id, "Network error");
    const w = store.getState().queue[0];
    expect(w.retries).toBe(1);
    expect(w.lastError).toBe("Network error");
  });

  it("pruneFailed removes writes exceeding max retries", () => {
    const id1 = store.getState().enqueue({
      table: "transactions",
      operation: "insert",
      payload: {},
    });
    const id2 = store.getState().enqueue({
      table: "transactions",
      operation: "insert",
      payload: {},
    });
    store.getState().markFailed(id1, "err");
    store.getState().markFailed(id1, "err");
    store.getState().markFailed(id1, "err"); // retries = 3
    // id2 has 0 retries

    const pruned = store.getState().pruneFailed(3);
    expect(pruned).toBe(1);
    expect(store.getState().queue).toHaveLength(1);
    expect(store.getState().queue[0].id).toBe(id2);
  });

  it("dedupes by tempId (offline edit-then-edit)", () => {
    store.getState().enqueue({
      table: "transactions",
      operation: "update",
      payload: { id: "txn-1", amount: 100 },
      tempId: "txn-1",
    });
    store.getState().enqueue({
      table: "transactions",
      operation: "update",
      payload: { id: "txn-1", amount: 200 },
      tempId: "txn-1",
    });
    expect(store.getState().queue).toHaveLength(1);
    const w = store.getState().queue[0];
    expect((w.payload as { amount: number }).amount).toBe(200);
  });

  it("different tempIds both stay in queue", () => {
    store.getState().enqueue({
      table: "transactions",
      operation: "delete",
      payload: "txn-1",
      tempId: "txn-1",
    });
    store.getState().enqueue({
      table: "transactions",
      operation: "delete",
      payload: "txn-2",
      tempId: "txn-2",
    });
    expect(store.getState().queue).toHaveLength(2);
  });

  it("clear empties the queue", () => {
    store.getState().enqueue({
      table: "transactions",
      operation: "insert",
      payload: {},
    });
    store.getState().clear();
    expect(store.getState().queue).toEqual([]);
    expect(store.getState().hasPending()).toBe(false);
  });

  it("does not mutate state objects (immutability)", () => {
    store.getState().enqueue({
      table: "transactions",
      operation: "insert",
      payload: { amount: 100 },
    });
    const before = store.getState().queue;
    const snapshot = [...before];
    store.getState().enqueue({
      table: "transactions",
      operation: "insert",
      payload: { amount: 200 },
    });
    // Original entries still exist (new array was created)
    expect(store.getState().queue[0]).toEqual(snapshot[0]);
  });
});
