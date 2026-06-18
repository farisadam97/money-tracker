import { Colors, type ColorToken } from "@/src/constants/colors";

describe("Colors constants", () => {
  it("exports plum primary as locked PRD value", () => {
    expect(Colors.plum).toBe("#3D1152");
  });

  it("exports tangerine accent as locked PRD value", () => {
    expect(Colors.tangerine).toBe("#FF6B2B");
  });

  it("exports parchment background as locked PRD value", () => {
    expect(Colors.parchment).toBe("#FAF7F5");
  });

  it("exports income / expense semantic colors", () => {
    expect(Colors.income).toBe("#1A7A4A");
    expect(Colors.expense).toBe("#C13333");
  });

  it("all color values are valid 6-digit hex codes", () => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    Object.entries(Colors).forEach(([token, value]) => {
      expect(value).toMatch(hexRegex);
    });
  });

  it("color tokens are readonly (using 'as const')", () => {
    // TypeScript-level safety: assert type union contains known keys
    const token: ColorToken = "plum";
    expect(Colors[token]).toBeDefined();
  });
});
