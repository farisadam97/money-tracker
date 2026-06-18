import { describe, it, expect } from "@jest/globals";

import {
  partitionCategories,
  useCategoriesQuery,
  useCreateCategory,
} from "@/src/hooks/use-categories";
import type { CategoryRow } from "@/src/types/database";

const masterCategory = (name: string): CategoryRow => ({
  id: `m-${name}`,
  user_id: null,
  name,
  icon: "UtensilsCrossed",
  color: "#C13333",
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
});

const userCategory = (name: string): CategoryRow => ({
  id: `u-${name}`,
  user_id: "user-uuid",
  name,
  icon: "Coffee",
  color: "#8C7A9B",
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
});

describe("partitionCategories", () => {
  it("returns empty arrays for empty input", () => {
    const result = partitionCategories([]);
    expect(result.master).toEqual([]);
    expect(result.user).toEqual([]);
  });

  it("separates master categories (user_id IS NULL)", () => {
    const cats = [masterCategory("Food"), userCategory("Coffee")];
    const result = partitionCategories(cats);
    expect(result.master).toHaveLength(1);
    expect(result.master[0].name).toBe("Food");
    expect(result.user).toHaveLength(1);
    expect(result.user[0].name).toBe("Coffee");
  });

  it("handles all-master input", () => {
    const cats = [masterCategory("Food"), masterCategory("Transport")];
    const result = partitionCategories(cats);
    expect(result.master).toHaveLength(2);
    expect(result.user).toHaveLength(0);
  });

  it("handles all-user input", () => {
    const cats = [userCategory("Coffee"), userCategory("Snacks")];
    const result = partitionCategories(cats);
    expect(result.master).toHaveLength(0);
    expect(result.user).toHaveLength(2);
  });

  it("does not mutate input (immutability)", () => {
    const cats = [masterCategory("Food"), userCategory("Coffee")];
    const snapshot = [...cats];
    partitionCategories(cats);
    expect(cats).toEqual(snapshot);
  });
});

// Smoke tests for hook exports — confirms the hooks are well-formed functions.
// Full integration tests would mock supabase; here we just verify contract.
describe("useCategoriesQuery / useCreateCategory contract", () => {
  it("useCategoriesQuery is a function", () => {
    expect(typeof useCategoriesQuery).toBe("function");
  });

  it("useCreateCategory is a function", () => {
    expect(typeof useCreateCategory).toBe("function");
  });
});
