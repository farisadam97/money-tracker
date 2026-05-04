export const Colors = {
  plum: "#3D1152",
  plumTint: "#EDE0F5",
  tangerine: "#FF6B2B",
  tangerineTint: "#FFF0E8",
  parchment: "#FAF7F5",
  surface: "#FFFFFF",
  income: "#1A7A4A",
  incomeTint: "#E6F5EE",
  expense: "#C13333",
  expenseTint: "#FCEAEA",
  textPrimary: "#1C0F2E",
  textSecondary: "#8C7A9B",
  border: "#EAE3F0",
} as const;

export type ColorToken = keyof typeof Colors;
