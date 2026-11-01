import type { SetCartItemInput, VariantGroup } from '@pro/api';

/** Chosen option id per variant group kind. */
export type Selection = Partial<Record<VariantGroup['kind'], string>>;

/** The first available option of every group. */
export function defaultSelection(groups: readonly VariantGroup[]): Selection {
  const sel: Selection = {};
  for (const g of groups) {
    const o = g.options.find((x) => x.available) ?? g.options[0];
    if (o) sel[g.kind] = o.id;
  }
  return sel;
}

function chosen(groups: readonly VariantGroup[], sel: Selection) {
  return groups.map((g) => g.options.find((o) => o.id === sel[g.kind])).filter((o) => o != null);
}

/** Price and MRP with the chosen options' price deltas added. */
export function selectionPrice(base: { price: number; mrp: number }, groups: readonly VariantGroup[], sel: Selection): { price: number; mrp: number } {
  const delta = chosen(groups, sel).reduce((s, o) => s + o.priceDelta, 0);
  return { price: base.price + delta, mrp: base.mrp + delta };
}

/** "Midnight Blue, 256 GB". */
export function selectionLabel(groups: readonly VariantGroup[], sel: Selection): string {
  return chosen(groups, sel)
    .map((o) => o.label)
    .join(', ');
}

/** Every group has an option picked and all picks are in stock. */
export function isSelectionAvailable(groups: readonly VariantGroup[], sel: Selection): boolean {
  return groups.every((g) => {
    const o = g.options.find((x) => x.id === sel[g.kind]);
    return o != null && o.available;
  });
}

/** The cart API's `variant` field. */
export function toVariantInput(groups: readonly VariantGroup[], sel: Selection): SetCartItemInput['variant'] {
  if (!groups.length) return undefined;
  const out: NonNullable<SetCartItemInput['variant']> = {};
  for (const g of groups) if (sel[g.kind]) out[g.kind] = sel[g.kind];
  return out;
}
