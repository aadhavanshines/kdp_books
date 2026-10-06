/**
 * Every seed image, described as data. `art` names a drawing function in
 * packages/seed/art; `bg` is the soft background colour.
 *
 * This file must stay dependency-free: the image build script imports it
 * directly with Node.
 *
 * To use a real photo instead of artwork, drop `<key>.jpg|png|webp` into
 * packages/seed/photos/dishes (or photos/restaurants/<brandId>.jpg) and run
 * `pnpm images`.
 */

export type Background =
  'peach' | 'butter' | 'mint' | 'blush' | 'sky' | 'lavender' | 'sand' | 'sage' | 'coral' | 'slate';

export interface DishArt {
  art: string;
  opts?: Record<string, unknown>;
  bg: Background;
}

const curry = (opts: Record<string, unknown>, bg: Background): DishArt => ({
  art: 'curry',
  opts,
  bg,
});

export const DISH_IMAGES = {
  'biryani-chicken': { art: 'biryani', opts: { protein: 'chicken' }, bg: 'peach' },
  'biryani-mutton': { art: 'biryani', opts: { protein: 'mutton' }, bg: 'sand' },
  'biryani-veg': { art: 'biryani', opts: { protein: 'veg' }, bg: 'butter' },
  'biryani-egg': { art: 'biryani', opts: { protein: 'egg' }, bg: 'coral' },
  'butter-chicken': curry({ gravy: '#e3742b', chunks: 'chicken', butterCube: true }, 'sand'),
  'paneer-butter-masala': curry({ gravy: '#ec7a35', chunks: 'paneer', butterCube: true }, 'peach'),
  'paneer-tikka-masala': curry({ gravy: '#d4552a', chunks: 'paneer-tikka' }, 'coral'),
  'palak-paneer': curry({ gravy: '#5c8f2e', chunks: 'paneer' }, 'mint'),
  'dal-makhani': curry({ gravy: '#7a3a1c', chunks: 'dal', butterCube: true }, 'sand'),
  'dal-tadka': curry({ gravy: '#e9b528', chunks: 'dal', cream: false, finish: 'tadka' }, 'butter'),
  chole: curry({ gravy: '#a8561f', chunks: 'chickpea', count: 9, cream: false }, 'peach'),
  'rogan-josh': curry(
    { gravy: '#a8321c', chunks: 'mutton', cream: false, bowlStyle: 'copper' },
    'blush',
  ),
  'kadai-chicken': curry(
    { gravy: '#b8481f', chunks: 'chicken', cream: false, bowlStyle: 'black' },
    'sand',
  ),
  'egg-curry': curry({ gravy: '#d9682a', chunks: 'egg', count: 5, cream: false }, 'butter'),
  'fish-curry': curry(
    {
      gravy: '#d9542a',
      chunks: 'fish',
      count: 5,
      cream: false,
      finish: 'curryleaf',
      bowlStyle: 'clay',
    },
    'sky',
  ),
  'prawn-curry': curry(
    {
      gravy: '#ee9a3a',
      chunks: 'prawn',
      count: 8,
      cream: false,
      finish: 'curryleaf',
      bowlStyle: 'clay',
    },
    'mint',
  ),
  'veg-kurma': curry(
    { gravy: '#f2d79a', chunks: 'potato', count: 8, cream: false, finish: 'curryleaf' },
    'sage',
  ),
  haleem: curry(
    { gravy: '#8a5530', chunks: 'none', cream: false, finish: 'onions', bowlStyle: 'copper' },
    'peach',
  ),
  'malai-kofta': curry({ gravy: '#f0b45a', chunks: 'kofta', count: 5 }, 'lavender'),
  rajma: curry({ gravy: '#8a2e1a', chunks: 'chickpea', count: 9, cream: true }, 'butter'),
  'masala-dosa': { art: 'dosa', bg: 'sage' },
  'idli-vada': { art: 'idliVada', bg: 'sky' },
  'chicken-tikka': { art: 'tikka', opts: { kind: 'chicken' }, bg: 'coral' },
  'paneer-tikka': { art: 'tikka', opts: { kind: 'paneer' }, bg: 'butter' },
  'seekh-kebab': { art: 'tikka', opts: { kind: 'seekh' }, bg: 'sand' },
  'fish-tikka': { art: 'tikka', opts: { kind: 'fish' }, bg: 'sky' },
  'butter-naan': { art: 'naanBasket', opts: { kind: 'butter' }, bg: 'peach' },
  'garlic-naan': { art: 'naanBasket', opts: { kind: 'garlic' }, bg: 'sage' },
  roti: { art: 'naanBasket', opts: { kind: 'roti' }, bg: 'sand' },
  'aloo-paratha': { art: 'paratha', opts: { side: 'curd' }, bg: 'butter' },
  'paneer-paratha': { art: 'paratha', opts: { side: 'pickle' }, bg: 'peach' },
  'pav-bhaji': { art: 'pavBhaji', bg: 'blush' },
  thali: { art: 'thali', bg: 'sage' },
  'pani-puri': { art: 'chaat', opts: { kind: 'panipuri' }, bg: 'butter' },
  'papdi-chaat': { art: 'chaat', opts: { kind: 'papdi' }, bg: 'blush' },
  samosa: { art: 'chaat', opts: { kind: 'samosa' }, bg: 'peach' },
  dhokla: { art: 'dhokla', bg: 'mint' },
  appam: { art: 'appam', bg: 'sky' },
  'gulab-jamun': { art: 'sweetsBowl', opts: { kind: 'gulab-jamun' }, bg: 'blush' },
  rasmalai: { art: 'sweetsBowl', opts: { kind: 'rasmalai' }, bg: 'butter' },
  kheer: { art: 'sweetsBowl', opts: { kind: 'kheer' }, bg: 'lavender' },
  raita: { art: 'raita', bg: 'mint' },
  'pizza-margherita': { art: 'pizza', opts: { toppings: 'margherita' }, bg: 'sand' },
  'pizza-pepperoni': { art: 'pizza', opts: { toppings: 'pepperoni' }, bg: 'butter' },
  'pizza-veggie': { art: 'pizza', opts: { toppings: 'veggie' }, bg: 'mint' },
  'pizza-paneer': { art: 'pizza', opts: { toppings: 'paneer' }, bg: 'peach' },
  'pizza-chicken': { art: 'pizza', opts: { toppings: 'chicken' }, bg: 'coral' },
  'burger-classic': { art: 'burger', opts: { kind: 'classic' }, bg: 'sky' },
  'burger-chicken': { art: 'burger', opts: { kind: 'chicken' }, bg: 'butter' },
  'burger-veg': { art: 'burger', opts: { kind: 'veg-crispy' }, bg: 'mint' },
  fries: { art: 'fries', bg: 'butter' },
  'hakka-noodles': { art: 'noodles', opts: { protein: 'veg' }, bg: 'peach' },
  'chicken-noodles': { art: 'noodles', opts: { protein: 'chicken' }, bg: 'sand' },
  'schezwan-noodles': { art: 'noodles', opts: { color: '#e08a4a', protein: 'egg' }, bg: 'coral' },
  'veg-fried-rice': { art: 'friedRice', opts: { protein: 'veg' }, bg: 'sage' },
  'egg-fried-rice': { art: 'friedRice', opts: { protein: 'egg' }, bg: 'butter' },
  'chicken-fried-rice': {
    art: 'friedRice',
    opts: { protein: 'chicken', tint: '#e6c88e' },
    bg: 'sand',
  },
  'veg-manchurian': { art: 'indoChinese', opts: { piece: 'ball' }, bg: 'blush' },
  'chilli-chicken': {
    art: 'indoChinese',
    opts: { piece: 'chicken', sauce: '#8a2e12' },
    bg: 'peach',
  },
  'chilli-paneer': { art: 'indoChinese', opts: { piece: 'paneer', sauce: '#7a2a10' }, bg: 'mint' },
  'momos-steamed': { art: 'momos', opts: { kind: 'steamed' }, bg: 'mint' },
  'momos-fried': { art: 'momos', opts: { kind: 'fried' }, bg: 'butter' },
  'momos-tandoori': { art: 'momos', opts: { kind: 'tandoori' }, bg: 'coral' },
  'roll-chicken': { art: 'wrap', opts: { kind: 'roll', filling: 'chicken' }, bg: 'butter' },
  'roll-paneer': { art: 'wrap', opts: { kind: 'roll', filling: 'paneer' }, bg: 'peach' },
  'roll-egg': { art: 'wrap', opts: { kind: 'roll', filling: 'egg' }, bg: 'sky' },
  'roll-veg': { art: 'wrap', opts: { kind: 'roll', filling: 'veg' }, bg: 'sage' },
  'shawarma-chicken': { art: 'wrap', opts: { kind: 'shawarma', filling: 'chicken' }, bg: 'slate' },
  'salad-chicken': { art: 'saladBowl', opts: { protein: 'chicken' }, bg: 'sage' },
  'salad-paneer': { art: 'saladBowl', opts: { protein: 'paneer' }, bg: 'butter' },
  'salad-chickpea': { art: 'saladBowl', opts: { protein: 'chickpea' }, bg: 'mint' },
  'pasta-arrabbiata': { art: 'pasta', opts: { shape: 'penne', sauce: 'red' }, bg: 'butter' },
  'pasta-alfredo': { art: 'pasta', opts: { shape: 'penne', sauce: 'white' }, bg: 'lavender' },
  'spaghetti-pesto': { art: 'pasta', opts: { shape: 'spaghetti', sauce: 'pesto' }, bg: 'sand' },
  'spaghetti-red': { art: 'pasta', opts: { shape: 'spaghetti', sauce: 'red' }, bg: 'sky' },
  'bao-chicken': { art: 'bao', opts: { filling: 'chicken' }, bg: 'coral' },
  'bao-paneer': { art: 'bao', opts: { filling: 'paneer' }, bg: 'mint' },
  'sandwich-grilled': { art: 'sandwich', opts: { kind: 'grilled' }, bg: 'sky' },
  'sandwich-club': { art: 'sandwich', opts: { kind: 'club' }, bg: 'butter' },
  'soup-tomato': { art: 'soup', opts: { kind: 'tomato', color: '#c0532a' }, bg: 'peach' },
  'soup-manchow': { art: 'soup', opts: { kind: 'manchow', color: '#7a4a28' }, bg: 'sand' },
  'fried-chicken': { art: 'friedChicken', bg: 'butter' },
  'fish-fry': { art: 'seafoodPlate', opts: { kind: 'fish-fry' }, bg: 'sky' },
  'prawns-garlic': { art: 'seafoodPlate', opts: { kind: 'prawns' }, bg: 'mint' },
  hummus: { art: 'hummusPlatter', bg: 'sand' },
  waffle: { art: 'waffle', bg: 'blush' },
  sundae: { art: 'iceCream', bg: 'lavender' },
  'icecream-mango': {
    art: 'iceCream',
    opts: { flavors: ['#f6b73c', '#b9d98a', '#fff3d6'], sauce: '#e07a1f' },
    bg: 'butter',
  },
  'cake-chocolate': { art: 'cakeSlice', bg: 'blush' },
  'cake-red-velvet': {
    art: 'cakeSlice',
    opts: { sponge: '#a8202a', frosting: '#f6efe6', topping: '#d6243a' },
    bg: 'lavender',
  },
  brownie: { art: 'brownie', bg: 'sand' },
  latte: { art: 'coffee', opts: { kind: 'latte' }, bg: 'sand' },
  'cold-coffee': { art: 'coffee', opts: { kind: 'cold' }, bg: 'peach' },
  'filter-coffee': { art: 'coffee', opts: { kind: 'filter' }, bg: 'butter' },
  chai: { art: 'chai', bg: 'peach' },
  'mango-lassi': {
    art: 'drink',
    opts: { liquid: '#f2c14e', topping: 'cream', garnish: '#e07a1f' },
    bg: 'butter',
  },
  'chocolate-shake': {
    art: 'drink',
    opts: { liquid: '#8a5a3a', topping: 'cream', garnish: '#4a1f0c' },
    bg: 'sand',
  },
  'strawberry-shake': {
    art: 'drink',
    opts: { liquid: '#f3a6b8', topping: 'cream', garnish: '#d6243a' },
    bg: 'blush',
  },
  'lime-soda': { art: 'drink', opts: { liquid: '#cfe8a0', topping: 'ice' }, bg: 'mint' },
} satisfies Record<string, DishArt>;

export type DishImageKey = keyof typeof DISH_IMAGES;

export interface CoverArt {
  hero: DishImageKey;
  side: DishImageKey | null;
  bg: Background;
}

/** Image URL for a dish (without size suffix; the app adds -320/-640.webp). */
export const dishImageUrl = (key: DishImageKey) => `/images/seed/dishes/${key}`;
export const coverImageUrl = (brandId: string) => `/images/seed/restaurants/${brandId}`;

export const DISH_IMAGE_WIDTHS = [320, 640] as const;
export const COVER_IMAGE_WIDTHS = [480, 960] as const;
