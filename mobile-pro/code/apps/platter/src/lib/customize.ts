import type { Cart, CartLine, CustomizationGroup, MenuItem } from '@pro/api';

/** Picked option ids per customization group. */
export type Selection = Record<string, string[]>;

/** The options marked default (or the first, for a required single choice). */
export function defaultSelection(item: Pick<MenuItem, 'customizations'>): Selection {
  const selection: Selection = {};
  for (const group of item.customizations) {
    const defaults = group.options.filter((o) => o.isDefault).map((o) => o.id);
    if (group.kind === 'single') {
      const first = defaults[0] ?? (group.required ? group.options[0]?.id : undefined);
      selection[group.id] = first ? [first] : [];
    } else {
      selection[group.id] = group.max != null ? defaults.slice(0, group.max) : defaults;
    }
  }
  return selection;
}

/**
 * Toggles an option: a single-choice group swaps to it; a multiple-choice
 * group adds or removes it, ignoring additions past `max`.
 */
export function toggleOption(selection: Selection, group: CustomizationGroup, optionId: string): Selection {
  const current = selection[group.id] ?? [];
  if (group.kind === 'single') {
    if (current[0] === optionId && !group.required) return { ...selection, [group.id]: [] };
    return { ...selection, [group.id]: [optionId] };
  }
  if (current.includes(optionId)) return { ...selection, [group.id]: current.filter((id) => id !== optionId) };
  if (group.max != null && current.length >= group.max) return selection;
  return { ...selection, [group.id]: [...current, optionId] };
}

/** The first group that still needs a choice, or null when the selection is complete. */
export function missingRequired(item: Pick<MenuItem, 'customizations'>, selection: Selection): CustomizationGroup | null {
  return item.customizations.find((g) => g.required && (selection[g.id]?.length ?? 0) === 0) ?? null;
}

/** Base price plus every picked option. */
export function unitPrice(item: Pick<MenuItem, 'price' | 'customizations'>, selection: Selection): number {
  let total = item.price;
  for (const group of item.customizations) {
    for (const option of group.options) if (selection[group.id]?.includes(option.id)) total += option.price;
  }
  return total;
}

/** "Choose 1", "Choose up to 3", "Optional". */
export function groupHint(group: CustomizationGroup): string {
  if (group.kind === 'single') return group.required ? 'Required · Choose 1' : 'Optional · Choose 1';
  return group.max != null ? `Optional · Choose up to ${group.max}` : 'Optional';
}

/** The selection as the API's `options` list. */
export function toCartOptions(selection: Selection): { groupId: string; optionId: string }[] {
  return Object.entries(selection).flatMap(([groupId, ids]) => ids.map((optionId) => ({ groupId, optionId })));
}

function optionKey(options: readonly { groupId: string; optionId: string }[]): string {
  return options
    .map((o) => `${o.groupId}:${o.optionId}`)
    .sort()
    .join('|');
}

/** The cart line for this exact item and selection, if one exists. */
export function lineForSelection(cart: Cart | undefined, itemId: string, selection: Selection): CartLine | undefined {
  const key = optionKey(toCartOptions(selection));
  return cart?.items.find((l) => l.productId === itemId && optionKey(l.options) === key);
}

/** Lines of one menu item in the cart (several when customized differently). */
export function linesForItem(cart: Cart | undefined, itemId: string): CartLine[] {
  return cart?.items.filter((l) => l.productId === itemId) ?? [];
}
