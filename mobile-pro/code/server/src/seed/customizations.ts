import type { CustomizationGroup, CustomizationOption } from '@pro/api/types';

import type { CustomizationPreset } from './data/types';

const opt = (id: string, name: string, price = 0, isDefault = false, isVeg = true): CustomizationOption => ({
  id,
  name,
  price,
  isVeg,
  isDefault,
});

const round10 = (n: number) => Math.max(10, Math.round(n / 10) * 10);

/** Builds the customization sheet for a dish from its preset. */
export function buildCustomizations(
  preset: CustomizationPreset | undefined,
  basePrice: number,
  isVeg: boolean,
): CustomizationGroup[] {
  switch (preset) {
    case 'pizza':
      return [
        {
          id: 'size',
          name: 'Size',
          kind: 'single',
          required: true,
          max: null,
          options: [
            opt('regular', 'Regular (serves 1)', 0, true),
            opt('medium', 'Medium (serves 2)', round10(basePrice * 0.5)),
            opt('large', 'Large (serves 4)', round10(basePrice * 0.95)),
          ],
        },
        {
          id: 'toppings',
          name: 'Extra toppings',
          kind: 'multiple',
          required: false,
          max: 4,
          options: [
            opt('cheese', 'Extra cheese', 60),
            opt('jalapeno', 'Jalapeños', 40),
            opt('olives', 'Black olives', 40),
            opt('paneer', 'Paneer tikka', 70),
            ...(isVeg ? [] : [opt('chicken', 'Peri peri chicken', 90, false, false)]),
          ],
        },
      ];
    case 'burger':
      return [
        {
          id: 'meal',
          name: 'Make it a meal',
          kind: 'single',
          required: true,
          max: null,
          options: [opt('solo', 'Just the burger', 0, true), opt('meal', 'Meal with fries and a cola', 129)],
        },
        {
          id: 'addons',
          name: 'Add-ons',
          kind: 'multiple',
          required: false,
          max: 3,
          options: [
            opt('cheese', 'Cheese slice', 30),
            opt('onion', 'Caramelised onions', 25),
            isVeg ? opt('patty', 'Extra veg patty', 69) : opt('patty', 'Extra chicken patty', 89, false, false),
          ],
        },
      ];
    case 'biryani':
      return [
        {
          id: 'portion',
          name: 'Portion',
          kind: 'single',
          required: true,
          max: null,
          options: [opt('regular', 'Regular (serves 1)', 0, true), opt('family', 'Family pack (serves 3)', round10(basePrice * 1.7))],
        },
        {
          id: 'sides',
          name: 'Sides',
          kind: 'multiple',
          required: false,
          max: 3,
          options: [
            opt('raita', 'Boondi raita', 49),
            opt('salan', 'Mirchi ka salan', 59),
            opt('jamun', 'Gulab jamun (2 pcs)', 69),
            ...(isVeg ? [] : [opt('egg', 'Extra boiled egg', 25, false, false)]),
          ],
        },
      ];
    case 'curry':
      return [
        {
          id: 'portion',
          name: 'Portion',
          kind: 'single',
          required: true,
          max: null,
          options: [opt('half', 'Half', 0, true), opt('full', 'Full', round10(basePrice * 0.6))],
        },
        {
          id: 'spice',
          name: 'Spice level',
          kind: 'single',
          required: true,
          max: null,
          options: [opt('mild', 'Mild'), opt('medium', 'Medium', 0, true), opt('hot', 'Spicy')],
        },
      ];
    case 'bread':
      return [
        {
          id: 'style',
          name: 'Style',
          kind: 'single',
          required: true,
          max: null,
          options: [opt('plain', 'Plain', 0, true), opt('butter', 'Butter', 15), opt('garlic', 'Garlic butter', 30)],
        },
      ];
    case 'beverage':
      return [
        {
          id: 'size',
          name: 'Size',
          kind: 'single',
          required: true,
          max: null,
          options: [opt('regular', 'Regular (300 ml)', 0, true), opt('large', 'Large (500 ml)', 40)],
        },
      ];
    case 'coffee':
      return [
        {
          id: 'size',
          name: 'Size',
          kind: 'single',
          required: true,
          max: null,
          options: [opt('regular', 'Regular', 0, true), opt('large', 'Large', 40)],
        },
        {
          id: 'milk',
          name: 'Milk',
          kind: 'single',
          required: true,
          max: null,
          options: [opt('dairy', 'Regular milk', 0, true), opt('oat', 'Oat milk', 50), opt('almond', 'Almond milk', 50)],
        },
        {
          id: 'extras',
          name: 'Extras',
          kind: 'multiple',
          required: false,
          max: 2,
          options: [opt('shot', 'Extra espresso shot', 40), opt('hazelnut', 'Hazelnut syrup', 30)],
        },
      ];
    case 'dessert':
      return [
        {
          id: 'extras',
          name: 'Make it better',
          kind: 'multiple',
          required: false,
          max: 2,
          options: [opt('scoop', 'Scoop of vanilla ice cream', 60), opt('sauce', 'Extra chocolate sauce', 30)],
        },
      ];
    case 'bowl':
      return [
        {
          id: 'base',
          name: 'Base',
          kind: 'single',
          required: true,
          max: null,
          options: [opt('rice', 'Brown rice', 0, true), opt('quinoa', 'Quinoa', 40), opt('greens', 'Mixed greens', 0)],
        },
        {
          id: 'protein',
          name: 'Extra protein',
          kind: 'multiple',
          required: false,
          max: 2,
          options: [
            opt('paneer', 'Grilled paneer', 70),
            opt('tofu', 'Sesame tofu', 60),
            ...(isVeg ? [] : [opt('chicken', 'Grilled chicken', 90, false, false), opt('egg', 'Soft-boiled egg', 30, false, false)]),
          ],
        },
      ];
    case 'wrap':
      return [
        {
          id: 'spice',
          name: 'Spice',
          kind: 'single',
          required: true,
          max: null,
          options: [opt('regular', 'Regular', 0, true), opt('hot', 'Extra spicy')],
        },
        {
          id: 'addons',
          name: 'Add-ons',
          kind: 'multiple',
          required: false,
          max: 2,
          options: [opt('cheese', 'Cheese', 30), opt('filling', 'Double filling', 60)],
        },
      ];
    default:
      return [];
  }
}
