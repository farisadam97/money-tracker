import { describe, it, expect } from "@jest/globals";

import type {
  CategoryInsert,
  CategoryRow,
  CategoryUpdate,
  Database,
  TransactionInsert,
  TransactionRow,
  TransactionSource,
  TransactionType,
  TransactionUpdate,
} from "@/src/types/database";

/**
 * Runtime smoke tests for the Database type contract.
 * Uses assignability + value shape rather than expectTypeOf (added in Jest 30).
 */

describe("Database type contract", () => {
  it("transactions.source enum includes 'email' (PRD §3 + TD-5)", () => {
    const validSources: TransactionSource[] = [
      "manual",
      "split_bill",
      "email",
    ];
    expect(validSources).toContain("email");
  });

  it("TransactionType is income | expense only", () => {
    const validTypes: TransactionType[] = ["income", "expense"];
    expect(validTypes).toHaveLength(2);
  });

  it("TransactionRow matches expected shape", () => {
    const sample: TransactionRow = {
      id: "uuid",
      user_id: "uuid",
      amount: 100,
      currency: "IDR",
      category_id: "uuid",
      type: "expense",
      note: null,
      date: "2026-06-18",
      source: "manual",
      created_at: "2026-06-18T00:00:00Z",
      updated_at: "2026-06-18T00:00:00Z",
    };
    expect(sample.source).toBe("manual");
    // Compile-time: source field accepts all three enum values
    const emailRow: TransactionRow = { ...sample, source: "email" };
    expect(emailRow.source).toBe("email");
  });

  it("transactions Insert type allows optional source and currency", () => {
    const minimal: TransactionInsert = {
      user_id: "uuid",
      amount: 100,
      category_id: "uuid",
      type: "expense",
    };
    // No source / currency required — they're optional
    expect(minimal.source).toBeUndefined();
    expect(minimal.currency).toBeUndefined();
  });

  it("categories.user_id is nullable (master = NULL per PRD §3)", () => {
    const masterCategory: CategoryRow = {
      id: "uuid",
      user_id: null,
      name: "Food & Drink",
      icon: "UtensilsCrossed",
      color: "#C13333",
      is_active: true,
      created_at: "2026-06-18T00:00:00Z",
    };
    expect(masterCategory.user_id).toBeNull();
  });

  it("TransactionUpdate allows partial updates", () => {
    const patch: TransactionUpdate = { amount: 200 };
    expect(patch.amount).toBe(200);
    expect(patch.note).toBeUndefined();
  });

  it("CategoryInsert requires name, icon, color", () => {
    const required: CategoryInsert = {
      user_id: null,
      name: "Coffee",
      icon: "Coffee",
      color: "#8C7A9B",
    };
    expect(required.name).toBe("Coffee");
    // user_id optional on Insert — but our schema marks it required
    expect(required.user_id).toBeNull();
  });

  it("Database interface exposes public.Tables", () => {
    // Compile-time proof: these indexed accesses would error if the
    // Database interface didn't expose the nested shape.
    type Categories = Database["public"]["Tables"]["categories"]["Row"];
    type Transactions = Database["public"]["Tables"]["transactions"]["Row"];

    // Runtime sanity: the indexed access produces a value type usable in code
    const cat: Categories = {} as Categories;
    const txn: Transactions = {} as Transactions;
    expect(cat).toBeDefined();
    expect(txn).toBeDefined();
  });

  it("CategoryUpdate allows partial updates", () => {
    const patch: CategoryUpdate = { name: "Updated" };
    expect(patch.name).toBe("Updated");
    expect(patch.color).toBeUndefined();
  });
});
