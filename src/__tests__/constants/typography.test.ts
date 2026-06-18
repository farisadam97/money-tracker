import { FontSizes, FontWeights } from "@/src/constants/typography";

describe("Typography constants", () => {
  it("screen title is 20px per PRD §13.2", () => {
    expect(FontSizes.screenTitle).toBe(20);
  });

  it("body / row labels are 14px per PRD §13.2", () => {
    expect(FontSizes.body).toBe(14);
    expect(FontSizes.buttonLabel).toBe(14);
  });

  it("caption is 11px per PRD §13.2", () => {
    expect(FontSizes.caption).toBe(11);
  });

  it("large amount is in the PRD-specified 36-48px range", () => {
    expect(FontSizes.amountLarge).toBeGreaterThanOrEqual(36);
    expect(FontSizes.amountLarge).toBeLessThanOrEqual(48);
  });

  it("font weights match PRD (500 medium, 400 regular)", () => {
    expect(FontWeights.medium).toBe("500");
    expect(FontWeights.regular).toBe("400");
  });

  it("all font sizes are positive integers", () => {
    Object.entries(FontSizes).forEach(([token, size]) => {
      expect(Number.isInteger(size)).toBe(true);
      expect(size).toBeGreaterThan(0);
    });
  });
});
