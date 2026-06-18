import { describe, it, expect } from "@jest/globals";

import { monthKey } from "@/src/hooks/use-summary";
import {
  useTransactionsQuery,
  useRecentTransactionsQuery,
  useCreateTransaction,
} from "@/src/hooks/use-transactions";

describe("monthKey", () => {
  it("formats January 2026 correctly", () => {
    expect(monthKey(new Date("2026-01-15T10:00:00Z"))).toMatch(/^2026-01$/);
  });

  it("formats December 2026 correctly", () => {
    expect(monthKey(new Date("2026-12-31T23:59:59Z"))).toMatch(/^2026-12$/);
  });

  it("returns 7-char YYYY-MM string", () => {
    const k = monthKey(new Date());
    expect(k).toMatch(/^\d{4}-\d{2}$/);
    expect(k).toHaveLength(7);
  });

  it("uses default parameter when no argument passed", () => {
    expect(() => monthKey()).not.toThrow();
  });
});

// Smoke tests for hook exports
describe("transaction hooks contract", () => {
  it("useTransactionsQuery is a function", () => {
    expect(typeof useTransactionsQuery).toBe("function");
  });

  it("useRecentTransactionsQuery is a function", () => {
    expect(typeof useRecentTransactionsQuery).toBe("function");
  });

  it("useCreateTransaction is a function", () => {
    expect(typeof useCreateTransaction).toBe("function");
  });
});
