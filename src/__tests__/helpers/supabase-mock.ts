/**
 * Jest mock factory for Supabase client.
 *
 * Usage in a test:
 *   jest.mock("@/src/lib/supabase", () => createSupabaseMock());
 *
 * Then configure per-test responses by mutating the shared `handlers` object:
 *   handlers.from = (table) => ({ select: () => mockReturn })
 */

export type SupabaseMockTable = Record<string, unknown>;

/**
 * Creates a fresh chainable mock for a table query.
 * Each method returns `this` so chains like `.select().eq().order()` work.
 */
function createChain(finalData: unknown = [], finalError: unknown = null) {
  const chain: Record<string, jest.Mock> = {};

  const selfReturning = jest.fn(() => chain);
  chain.select = selfReturning;
  chain.insert = jest.fn(() => chain);
  chain.update = jest.fn(() => chain);
  chain.delete = jest.fn(() => chain);
  chain.eq = selfReturning;
  chain.in = selfReturning;
  chain.gt = selfReturning;
  chain.gte = selfReturning;
  chain.lt = selfReturning;
  chain.lte = selfReturning;
  chain.ilike = selfReturning;
  chain.order = selfReturning;
  chain.range = selfReturning;
  chain.limit = selfReturning;

  chain.single = jest.fn(async () => ({ data: finalData, error: finalError }));
  chain.maybeSingle = jest.fn(async () => ({ data: finalData, error: finalError }));

  return chain;
}

export function createSupabaseMock() {
  const tableResponses: Record<string, { data: unknown; error: unknown }> = {};

  return {
    __setResponse: (table: string, data: unknown, error: unknown = null) => {
      tableResponses[table] = { data, error };
    },
    __reset: () => {
      for (const key of Object.keys(tableResponses)) delete tableResponses[key];
    },
    supabase: {
      from: jest.fn((table: string) => {
        const { data, error } = tableResponses[table] ?? {
          data: [],
          error: null,
        };
        return createChain(data, error);
      }),
      rpc: jest.fn(async (fn: string) => {
        const { data, error } = tableResponses[fn] ?? { data: null, error: null };
        return { data, error };
      }),
      channel: jest.fn(() => ({
        on: jest.fn(() => ({ subscribe: jest.fn() })),
      })),
      removeChannel: jest.fn(),
    },
  };
}
