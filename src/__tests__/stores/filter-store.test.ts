import { describe, it, expect, beforeEach } from "@jest/globals";

import { useFilterStore } from "@/src/stores/filter-store";

describe("FilterStore", () => {
  beforeEach(() => {
    useFilterStore.getState().reset();
  });

  describe("initial state", () => {
    it("defaults to type=all", () => {
      expect(useFilterStore.getState().type).toBe("all");
    });

    it("starts with no categories selected", () => {
      expect(useFilterStore.getState().categoryIds).toEqual([]);
    });

    it("starts with no date range", () => {
      expect(useFilterStore.getState().dateFrom).toBeNull();
      expect(useFilterStore.getState().dateTo).toBeNull();
    });

    it("starts with empty search", () => {
      expect(useFilterStore.getState().search).toBe("");
    });
  });

  describe("setType", () => {
    it("sets type to income", () => {
      useFilterStore.getState().setType("income");
      expect(useFilterStore.getState().type).toBe("income");
    });

    it("sets type to expense", () => {
      useFilterStore.getState().setType("expense");
      expect(useFilterStore.getState().type).toBe("expense");
    });

    it("sets type to all", () => {
      useFilterStore.getState().setType("income");
      useFilterStore.getState().setType("all");
      expect(useFilterStore.getState().type).toBe("all");
    });
  });

  describe("toggleCategory", () => {
    it("adds a category id when not present", () => {
      useFilterStore.getState().toggleCategory("cat-1");
      expect(useFilterStore.getState().categoryIds).toEqual(["cat-1"]);
    });

    it("removes a category id when present", () => {
      useFilterStore.getState().toggleCategory("cat-1");
      useFilterStore.getState().toggleCategory("cat-1");
      expect(useFilterStore.getState().categoryIds).toEqual([]);
    });

    it("supports multiple categories", () => {
      useFilterStore.getState().toggleCategory("cat-1");
      useFilterStore.getState().toggleCategory("cat-2");
      useFilterStore.getState().toggleCategory("cat-3");
      expect(useFilterStore.getState().categoryIds).toHaveLength(3);
    });

    it("removes the correct category from middle", () => {
      useFilterStore.getState().toggleCategory("cat-1");
      useFilterStore.getState().toggleCategory("cat-2");
      useFilterStore.getState().toggleCategory("cat-3");
      useFilterStore.getState().toggleCategory("cat-2");
      expect(useFilterStore.getState().categoryIds).toEqual(["cat-1", "cat-3"]);
    });
  });

  describe("clearCategories", () => {
    it("empties the categoryIds array", () => {
      useFilterStore.getState().toggleCategory("a");
      useFilterStore.getState().toggleCategory("b");
      useFilterStore.getState().clearCategories();
      expect(useFilterStore.getState().categoryIds).toEqual([]);
    });
  });

  describe("setDateRange", () => {
    it("sets both from and to", () => {
      useFilterStore
        .getState()
        .setDateRange("2026-01-01", "2026-01-31");
      expect(useFilterStore.getState().dateFrom).toBe("2026-01-01");
      expect(useFilterStore.getState().dateTo).toBe("2026-01-31");
    });

    it("allows clearing only one side", () => {
      useFilterStore.getState().setDateRange("2026-01-01", "2026-01-31");
      useFilterStore.getState().setDateRange(null, "2026-01-31");
      expect(useFilterStore.getState().dateFrom).toBeNull();
    });
  });

  describe("setSearch", () => {
    it("updates search query", () => {
      useFilterStore.getState().setSearch("gojek");
      expect(useFilterStore.getState().search).toBe("gojek");
    });

    it("allows clearing", () => {
      useFilterStore.getState().setSearch("gojek");
      useFilterStore.getState().setSearch("");
      expect(useFilterStore.getState().search).toBe("");
    });
  });

  describe("reset", () => {
    it("restores all defaults", () => {
      useFilterStore.getState().setType("income");
      useFilterStore.getState().toggleCategory("a");
      useFilterStore.getState().setDateRange("x", "y");
      useFilterStore.getState().setSearch("test");
      useFilterStore.getState().reset();
      const s = useFilterStore.getState();
      expect(s.type).toBe("all");
      expect(s.categoryIds).toEqual([]);
      expect(s.dateFrom).toBeNull();
      expect(s.dateTo).toBeNull();
      expect(s.search).toBe("");
    });
  });

  describe("hasActiveFilters", () => {
    it("returns false on defaults", () => {
      expect(useFilterStore.getState().hasActiveFilters()).toBe(false);
    });

    it("returns true when type is set", () => {
      useFilterStore.getState().setType("income");
      expect(useFilterStore.getState().hasActiveFilters()).toBe(true);
    });

    it("returns true when category selected", () => {
      useFilterStore.getState().toggleCategory("a");
      expect(useFilterStore.getState().hasActiveFilters()).toBe(true);
    });

    it("returns true when date range set", () => {
      useFilterStore.getState().setDateRange("2026-01-01", null);
      expect(useFilterStore.getState().hasActiveFilters()).toBe(true);
    });

    it("returns true when search non-empty", () => {
      useFilterStore.getState().setSearch("test");
      expect(useFilterStore.getState().hasActiveFilters()).toBe(true);
    });

    it("returns false when search is only whitespace", () => {
      useFilterStore.getState().setSearch("   ");
      expect(useFilterStore.getState().hasActiveFilters()).toBe(false);
    });
  });

  describe("activeFilterCount", () => {
    it("returns 0 on defaults", () => {
      expect(useFilterStore.getState().activeFilterCount()).toBe(0);
    });

    it("counts each filter dimension once", () => {
      useFilterStore.getState().setType("income");
      useFilterStore.getState().toggleCategory("a");
      useFilterStore.getState().toggleCategory("b");
      useFilterStore.getState().setDateRange("x", "y");
      useFilterStore.getState().setSearch("test");
      // type + categories-group + date-group + search = 4
      expect(useFilterStore.getState().activeFilterCount()).toBe(4);
    });
  });
});
