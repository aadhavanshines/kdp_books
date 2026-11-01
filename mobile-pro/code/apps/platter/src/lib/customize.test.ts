import { butterChicken, cart, dalMakhani, line } from '../test/fixtures';
import {
  defaultSelection,
  groupHint,
  lineForSelection,
  linesForItem,
  missingRequired,
  toCartOptions,
  toggleOption,
  unitPrice,
} from './customize';

const [portion, addons] = butterChicken.customizations as [
  (typeof butterChicken.customizations)[number],
  (typeof butterChicken.customizations)[number],
];

describe('customization', () => {
  it('starts from the default options', () => {
    expect(defaultSelection(butterChicken)).toEqual({ portion: ['half'], addons: [] });
    expect(defaultSelection(dalMakhani)).toEqual({});
  });

  it('picks the first option of a required group with no default', () => {
    const item = { customizations: [{ ...portion, options: portion.options.map((o) => ({ ...o, isDefault: false })) }] };
    expect(defaultSelection(item)).toEqual({ portion: ['half'] });
  });

  it('swaps single choices and keeps required groups filled', () => {
    let s = defaultSelection(butterChicken);
    s = toggleOption(s, portion, 'full');
    expect(s.portion).toEqual(['full']);
    s = toggleOption(s, portion, 'full');
    expect(s.portion).toEqual(['full']);
  });

  it('adds add-ons up to the max and removes them again', () => {
    let s = defaultSelection(butterChicken);
    s = toggleOption(s, addons, 'naan');
    s = toggleOption(s, addons, 'rice');
    s = toggleOption(s, addons, 'raita');
    expect(s.addons).toEqual(['naan', 'rice']);
    s = toggleOption(s, addons, 'naan');
    expect(s.addons).toEqual(['rice']);
  });

  it('prices the item with every picked option', () => {
    const s = { portion: ['full'], addons: ['naan', 'rice'] };
    expect(unitPrice(butterChicken, s)).toBe(480 + 290 + 60 + 90);
    expect(unitPrice(dalMakhani, {})).toBe(320);
  });

  it('reports a required group that has no choice', () => {
    expect(missingRequired(butterChicken, { portion: [], addons: [] })?.name).toBe('Portion');
    expect(missingRequired(butterChicken, defaultSelection(butterChicken))).toBeNull();
  });

  it('describes each group', () => {
    expect(groupHint(portion)).toBe('Required · Choose 1');
    expect(groupHint(addons)).toBe('Optional · Choose up to 2');
  });

  it('finds the cart line for the same item and options, in any order', () => {
    const selection = { portion: ['full'], addons: ['rice', 'naan'] };
    const options = [
      { groupId: 'addons', groupName: 'Add-ons', optionId: 'naan', name: 'Butter naan', price: 60 },
      { groupId: 'portion', groupName: 'Portion', optionId: 'full', name: 'Full', price: 290 },
      { groupId: 'addons', groupName: 'Add-ons', optionId: 'rice', name: 'Jeera rice', price: 90 },
    ];
    const c = cart([line({ id: 'a', productId: butterChicken.id, options }), line({ id: 'b', productId: butterChicken.id })]);
    expect(lineForSelection(c, butterChicken.id, selection)?.id).toBe('a');
    expect(lineForSelection(c, butterChicken.id, { portion: ['half'], addons: [] })).toBeUndefined();
    expect(linesForItem(c, butterChicken.id)).toHaveLength(2);
    expect(toCartOptions({ portion: ['full'], addons: [] })).toEqual([{ groupId: 'portion', optionId: 'full' }]);
  });
});
