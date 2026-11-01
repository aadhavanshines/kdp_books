import type { VariantGroup } from '@pro/api';

import { defaultSelection, isSelectionAvailable, selectionLabel, selectionPrice, toVariantInput } from './variants';

const groups: VariantGroup[] = [
  {
    kind: 'color',
    name: 'Colour',
    options: [
      { id: 'sold-out', label: 'Sunset Orange', hex: '#F60', available: false, priceDelta: 0 },
      { id: 'midnight', label: 'Midnight Blue', hex: '#1F2A44', available: true, priceDelta: 0 },
    ],
  },
  {
    kind: 'storage',
    name: 'Storage',
    options: [
      { id: '128', label: '128 GB', hex: null, available: true, priceDelta: 0 },
      { id: '256', label: '256 GB', hex: null, available: true, priceDelta: 2000 },
    ],
  },
];

describe('variants', () => {
  it('picks the first available option of each group', () => {
    expect(defaultSelection(groups)).toEqual({ color: 'midnight', storage: '128' });
    expect(defaultSelection([])).toEqual({});
  });

  it('adds price deltas to price and MRP', () => {
    expect(selectionPrice({ price: 18999, mrp: 24999 }, groups, { color: 'midnight', storage: '256' })).toEqual({ price: 20999, mrp: 26999 });
  });

  it('labels the selection and checks stock', () => {
    expect(selectionLabel(groups, { color: 'midnight', storage: '256' })).toBe('Midnight Blue, 256 GB');
    expect(isSelectionAvailable(groups, { color: 'midnight', storage: '256' })).toBe(true);
    expect(isSelectionAvailable(groups, { color: 'sold-out', storage: '256' })).toBe(false);
    expect(isSelectionAvailable(groups, { color: 'midnight' })).toBe(false);
  });

  it('builds the cart variant input', () => {
    expect(toVariantInput(groups, { color: 'midnight', storage: '128' })).toEqual({ color: 'midnight', storage: '128' });
    expect(toVariantInput([], {})).toBeUndefined();
  });
});
