export const CategoryColors = {
  "Food & Drink": { icon: "#C13333", bg: "#FCEAEA" },
  Transport: { icon: "#1A7A4A", bg: "#E6F5EE" },
  Shopping: { icon: "#FF6B2B", bg: "#FFF0E8" },
  Health: { icon: "#B84080", bg: "#F5E6F0" },
  Entertainment: { icon: "#3D1152", bg: "#EDE0F5" },
  "Bills & Utilities": { icon: "#8C7A9B", bg: "#F0EDF5" },
  Income: { icon: "#1A7A4A", bg: "#E6F5EE" },
  Other: { icon: "#8C7A9B", bg: "#F0EDF5" },
} as const;

export type CategoryColorName = keyof typeof CategoryColors;

export function getCategoryColors(name: string): { icon: string; bg: string } {
  if (name in CategoryColors) {
    return CategoryColors[name as CategoryColorName];
  }
  return { icon: "#8C7A9B", bg: "#F0EDF5" };
}
