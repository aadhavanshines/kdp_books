import { butterChicken, dalMakhani } from '../test/fixtures';
import { filterMenu } from './menu';

const menu = [
  { id: 'c1', name: 'Recommended', items: [butterChicken, dalMakhani] },
  { id: 'c2', name: 'Mains', items: [butterChicken] },
];

describe('filterMenu', () => {
  it('keeps everything with no filter', () => {
    expect(filterMenu(menu, { veg: false, bestseller: false, text: '' })).toEqual(menu);
  });

  it('shows only veg dishes and drops empty categories', () => {
    const out = filterMenu(menu, { veg: true, bestseller: false, text: '' });
    expect(out.map((c) => c.name)).toEqual(['Recommended']);
    expect(out[0]!.items.map((i) => i.name)).toEqual(['Dal makhani']);
  });

  it('combines bestseller and text search', () => {
    expect(filterMenu(menu, { veg: false, bestseller: true, text: 'BUTTER' }).flatMap((c) => c.items.map((i) => i.id))).toEqual([
      butterChicken.id,
      butterChicken.id,
    ]);
    expect(filterMenu(menu, { veg: false, bestseller: false, text: 'lentils' })[0]!.items[0]!.name).toBe('Dal makhani');
    expect(filterMenu(menu, { veg: false, bestseller: false, text: 'pizza' })).toEqual([]);
  });
});
