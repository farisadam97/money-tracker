import {
  CategoryColors,
  getCategoryColors,
  type CategoryColorName,
} from "@/src/constants/categories";

describe("CategoryColors constants", () => {
  it("exports all 8 master categories from PRD §14.1", () => {
    const expected = [
      "Food & Drink",
      "Transport",
      "Shopping",
      "Health",
      "Entertainment",
      "Bills & Utilities",
      "Income",
      "Other",
    ] as const;
    expected.forEach((name) => {
      expect(CategoryColors).toHaveProperty(name);
    });
    expect(Object.keys(CategoryColors)).toHaveLength(expected.length);
  });

  it("each category has icon and bg colors as valid hex", () => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    Object.entries(CategoryColors).forEach(([name, { icon, bg }]) => {
      expect(icon).toMatch(hexRegex);
      expect(bg).toMatch(hexRegex);
    });
  });

  it("Food & Drink uses red palette per PRD §13.1", () => {
    expect(CategoryColors["Food & Drink"].icon).toBe("#C13333");
    expect(CategoryColors["Food & Drink"].bg).toBe("#FCEAEA");
  });

  it("Income uses green palette per PRD §13.1", () => {
    expect(CategoryColors.Income.icon).toBe("#1A7A4A");
    expect(CategoryColors.Income.bg).toBe("#E6F5EE");
  });
});

describe("getCategoryColors", () => {
  it("returns correct colors for known master category", () => {
    const result = getCategoryColors("Transport");
    expect(result).toEqual({ icon: "#1A7A4A", bg: "#E6F5EE" });
  });

  it("returns fallback mauve palette for unknown category name", () => {
    const result = getCategoryColors("Custom User Category");
    expect(result).toEqual({ icon: "#8C7A9B", bg: "#F0EDF5" });
  });

  it("returns fallback for empty string", () => {
    const result = getCategoryColors("");
    expect(result.icon).toBe("#8C7A9B");
    expect(result.bg).toBe("#F0EDF5");
  });

  it("is case-sensitive (matches PRD exact-name contract)", () => {
    const lower = getCategoryColors("transport");
    expect(lower.icon).toBe("#8C7A9B"); // fallback — name not matched
    const exact: CategoryColorName = "Transport";
    const matched = getCategoryColors(exact);
    expect(matched.icon).toBe("#1A7A4A");
  });
});
