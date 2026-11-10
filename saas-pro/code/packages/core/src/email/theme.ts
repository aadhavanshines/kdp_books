/**
 * Email colours per product (docs/DESIGN.md). Email clients don't support
 * CSS variables, so the brand roles are resolved to hex values here.
 */
export interface EmailBrand {
  primary: string;
  primaryForeground: string;
  accent: string;
  soft: string;
}

const BRANDS: Record<string, EmailBrand> = {
  billora: { primary: "#0F766E", primaryForeground: "#FFFFFF", accent: "#F59E0B", soft: "#E3F3F1" },
  slotra: { primary: "#7C3AED", primaryForeground: "#FFFFFF", accent: "#FB7185", soft: "#F1EAFE" },
  wordloom: { primary: "#1F2937", primaryForeground: "#FFF7ED", accent: "#EA580C", soft: "#FFF7ED" },
  formora: { primary: "#2563EB", primaryForeground: "#FFFFFF", accent: "#84CC16", soft: "#E8EFFD" },
};

/** Neutral colours shared by every product's emails. */
export const EMAIL_NEUTRALS = {
  page: "#F4F5F5",
  surface: "#FFFFFF",
  text: "#121A1C",
  muted: "#56636A",
  border: "#E1E6E7",
} as const;

export function emailBrand(product: string): EmailBrand {
  return BRANDS[product.toLowerCase()] ?? BRANDS.billora!;
}
