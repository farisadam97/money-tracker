/**
 * Color palette for the category color picker.
 * Per PRD §13.1 / StitchBrief: 10 swatches.
 */
export const CATEGORY_COLOR_PALETTE = [
  "#C13333", // Red
  "#FF6B2B", // Tangerine
  "#1A7A4A", // Green
  "#3D1152", // Plum
  "#8C7A9B", // Mauve
  "#2E5FA3", // Blue
  "#B84080", // Pink
  "#C17F24", // Amber
  "#1A7A7A", // Teal
  "#555555", // Dark gray
] as const;

export type CategoryColor = (typeof CATEGORY_COLOR_PALETTE)[number];
