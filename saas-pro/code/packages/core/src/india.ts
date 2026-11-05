/** Indian states and union territories with their GST state codes. */
export const INDIAN_STATES = [
  { code: "01", name: "Jammu and Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "26", name: "Dadra and Nagar Haveli and Daman and Diu" },
  { code: "27", name: "Maharashtra" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman and Nicobar Islands" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh" },
  { code: "38", name: "Ladakh" },
] as const;

export type StateCode = (typeof INDIAN_STATES)[number]["code"];

export function stateName(code: string | null | undefined): string | undefined {
  return INDIAN_STATES.find((s) => s.code === code)?.name;
}

export function isStateCode(code: string): code is StateCode {
  return INDIAN_STATES.some((s) => s.code === code);
}

const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** The GSTIN check character for the first 14 characters (mod-36 Luhn style). */
export function gstinCheckChar(first14: string): string {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const value = CHARS.indexOf(first14[i] ?? "");
    const product = value * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + (product % 36);
  }
  return CHARS[(36 - (sum % 36)) % 36] ?? "0";
}

export type GstinCheck = { ok: true; gstin: string } | { ok: false; reason: string };

/**
 * Validates a GSTIN's format, state code and check character. When
 * `stateCode` is given, the GSTIN must belong to that state.
 */
export function validateGstin(input: string, stateCode?: string): GstinCheck {
  const gstin = input.trim().toUpperCase();
  if (!GSTIN_PATTERN.test(gstin)) {
    return { ok: false, reason: "A GSTIN has 15 characters, like 29ABCDE1234F1Z5." };
  }
  if (!isStateCode(gstin.slice(0, 2))) {
    return { ok: false, reason: "The first two digits are not a valid state code." };
  }
  if (stateCode && gstin.slice(0, 2) !== stateCode) {
    return { ok: false, reason: `This GSTIN is registered in ${stateName(gstin.slice(0, 2))}, not ${stateName(stateCode) ?? "the selected state"}.` };
  }
  if (gstinCheckChar(gstin.slice(0, 14)) !== gstin[14]) {
    return { ok: false, reason: "The last character doesn't match. Check for a typo." };
  }
  return { ok: true, gstin };
}
