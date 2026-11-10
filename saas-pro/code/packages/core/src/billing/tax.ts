/**
 * GST on our subscription charges. Plan prices exclude GST.
 * - Indian workspace in the seller's state: CGST 9% + SGST 9%.
 * - Indian workspace in another state: IGST 18%.
 * - Outside India: no GST (export of services; zero-rated, see the summary notes).
 * Tax is rounded once to the nearest paisa, then split, so CGST + SGST always
 * equals the IGST the same price would have.
 */
export const GST_RATE_PERCENT = 18;

/** Placeholder seller details: replace before launch. */
export const SELLER = {
  name: "Billora Software Pvt. Ltd. (replace before launch)",
  address: "Placeholder address, Bengaluru, Karnataka 560001 (replace before launch)",
  stateCode: "29",
  gstin: "29AAAAA0000A1Z5 (replace before launch)",
  email: "billing@billora.example",
} as const;

export interface TaxBreakdown {
  subtotalPaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalPaise: number;
}

export function computeGst(subtotalPaise: number, buyer: { country: string; stateCode?: string | null }, sellerState: string = SELLER.stateCode): TaxBreakdown {
  if (!Number.isInteger(subtotalPaise) || subtotalPaise < 0) throw new Error("Amounts must be non-negative integer paise");
  if (buyer.country !== "IN") return { subtotalPaise, cgstPaise: 0, sgstPaise: 0, igstPaise: 0, totalPaise: subtotalPaise };
  const tax = Math.round((subtotalPaise * GST_RATE_PERCENT) / 100);
  if (buyer.stateCode === sellerState) {
    const cgst = Math.floor(tax / 2);
    return { subtotalPaise, cgstPaise: cgst, sgstPaise: tax - cgst, igstPaise: 0, totalPaise: subtotalPaise + tax };
  }
  return { subtotalPaise, cgstPaise: 0, sgstPaise: 0, igstPaise: tax, totalPaise: subtotalPaise + tax };
}
