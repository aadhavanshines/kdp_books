/**
 * Seed restaurant chains ("brands") and their menus. All names are made up.
 * Prices are written in rupees here for readability and converted to paise
 * by the catalog builder.
 */
import type { CoverArt, DishImageKey } from './images.ts';

export interface SeedItem {
  name: string;
  price: number;
  veg: boolean;
  image: DishImageKey | null;
  description: string;
  bestseller?: boolean;
  tags?: string[];
}

export interface SeedCategory {
  name: string;
  items: SeedItem[];
}

export interface SeedBrandCoupon {
  code: string;
  type: 'percent' | 'flat';
  /** Percent (e.g. 40) or rupees (e.g. 125). */
  value: number;
  maxDiscount: number | null;
  minOrder: number;
}

export interface SeedBrand {
  id: string;
  name: string;
  cuisines: string[];
  pureVeg: boolean;
  costForTwo: number;
  rating: number;
  ratingCount: number;
  prepMinutes: number;
  cover: CoverArt;
  coupon: SeedBrandCoupon | null;
  promoted?: boolean;
  menu: SeedCategory[];
}

const v = (
  name: string,
  price: number,
  image: DishImageKey | null,
  description: string,
  extra: Partial<SeedItem> = {},
): SeedItem => ({ name, price, veg: true, image, description, ...extra });
const nv = (
  name: string,
  price: number,
  image: DishImageKey | null,
  description: string,
  extra: Partial<SeedItem> = {},
): SeedItem => ({ name, price, veg: false, image, description, ...extra });
const best = { bestseller: true };

export const BRANDS: SeedBrand[] = [
  {
    id: 'saffron-handi',
    name: 'Saffron Handi',
    cuisines: ['Biryani', 'Mughlai', 'North Indian'],
    pureVeg: false,
    costForTwo: 500,
    rating: 4.4,
    ratingCount: 18200,
    prepMinutes: 22,
    cover: { hero: 'biryani-chicken', side: 'raita', bg: 'peach' },
    coupon: { code: 'HANDI125', type: 'flat', value: 125, maxDiscount: null, minOrder: 499 },
    promoted: true,
    menu: [
      {
        name: 'Recommended',
        items: [
          nv(
            'Hyderabadi Chicken Dum Biryani',
            329,
            'biryani-chicken',
            'Long-grain basmati and tender chicken slow-cooked on dum with saffron, mint and fried onions. Served with raita.',
            best,
          ),
          nv(
            'Mutton Dum Biryani',
            429,
            'biryani-mutton',
            'Succulent goat meat layered with aged basmati, kewra and whole spices, sealed and cooked on dum.',
            best,
          ),
          v(
            'Subz Dum Biryani',
            269,
            'biryani-veg',
            'Seasonal vegetables and paneer layered with fragrant basmati and saffron milk.',
          ),
          nv(
            'Egg Dum Biryani',
            249,
            'biryani-egg',
            'Two masala-fried eggs on saffron-scented biryani rice.',
          ),
        ],
      },
      {
        name: 'Kebabs',
        items: [
          nv(
            'Chicken Tikka (6 pcs)',
            299,
            'chicken-tikka',
            'Boneless chicken marinated in hung curd and Kashmiri chilli, chargrilled in the tandoor.',
            best,
          ),
          nv(
            'Mutton Seekh Kebab (4 pcs)',
            349,
            'seekh-kebab',
            'Minced mutton with ginger, green chilli and coriander, skewered and grilled.',
          ),
          v(
            'Paneer Tikka (6 pcs)',
            279,
            'paneer-tikka',
            'Cottage cheese, peppers and onion in a smoky tandoori marinade.',
          ),
        ],
      },
      {
        name: 'Curries',
        items: [
          nv(
            'Butter Chicken',
            349,
            'butter-chicken',
            'Tandoori chicken simmered in a velvety tomato, butter and cream gravy.',
            best,
          ),
          nv(
            'Mutton Rogan Josh',
            419,
            'rogan-josh',
            'Kashmiri-style mutton curry with ratan jot and fennel.',
          ),
          v(
            'Paneer Butter Masala',
            289,
            'paneer-butter-masala',
            'Soft paneer cubes in a rich, mildly sweet makhani gravy.',
          ),
        ],
      },
      {
        name: 'Breads & Sides',
        items: [
          v('Butter Naan', 59, 'butter-naan', 'Soft tandoor-baked naan brushed with butter.'),
          v('Garlic Naan', 69, 'garlic-naan', 'Naan topped with garlic and fresh coriander.'),
          v('Burani Raita', 79, 'raita', 'Thick curd with roasted garlic and cumin.'),
        ],
      },
      {
        name: 'Desserts',
        items: [
          v(
            'Gulab Jamun (2 pcs)',
            89,
            'gulab-jamun',
            'Warm khoya dumplings soaked in cardamom syrup.',
          ),
          v('Shahi Kheer', 109, 'kheer', 'Slow-cooked rice pudding with saffron and pistachio.'),
        ],
      },
    ],
  },
  {
    id: 'udupi-upahar',
    name: 'Udupi Upahar',
    cuisines: ['South Indian', 'Breakfast'],
    pureVeg: true,
    costForTwo: 250,
    rating: 4.6,
    ratingCount: 24100,
    prepMinutes: 12,
    cover: { hero: 'masala-dosa', side: 'filter-coffee', bg: 'sage' },
    coupon: { code: 'UPAHAR40', type: 'percent', value: 40, maxDiscount: 80, minOrder: 149 },
    menu: [
      {
        name: 'Dosas',
        items: [
          v(
            'Masala Dosa',
            109,
            'masala-dosa',
            'Crisp golden dosa filled with potato masala, with sambar and two chutneys.',
            best,
          ),
          v('Ghee Roast Dosa', 139, 'masala-dosa', 'Paper-thin dosa roasted in pure ghee.'),
          v(
            'Mysore Masala Dosa',
            129,
            'masala-dosa',
            'Dosa smeared with spicy red chutney and filled with potato masala.',
            best,
          ),
          v(
            'Rava Onion Dosa',
            129,
            null,
            'Lacy semolina dosa with onions, green chilli and cumin.',
          ),
        ],
      },
      {
        name: 'Idli & Vada',
        items: [
          v(
            'Idli Vada Combo',
            99,
            'idli-vada',
            'Two soft idlis and a crispy medu vada with sambar and chutney.',
            best,
          ),
          v('Ghee Podi Idli', 109, null, 'Mini idlis tossed in ghee and gunpowder spice mix.'),
          v('Medu Vada (2 pcs)', 79, null, 'Crispy lentil doughnuts with sambar.'),
        ],
      },
      {
        name: 'Meals',
        items: [
          v(
            'South Indian Thali',
            219,
            'thali',
            'Rice, sambar, rasam, two vegetables, curd, papad, pickle and payasam.',
          ),
          v('Curd Rice', 99, null, 'Comforting curd rice tempered with mustard and curry leaves.'),
        ],
      },
      {
        name: 'Beverages',
        items: [
          v(
            'Filter Coffee',
            49,
            'filter-coffee',
            'Strong decoction with frothy hot milk, served in a dabara.',
            best,
          ),
          v('Masala Chai', 39, 'chai', 'Ginger and cardamom tea.'),
        ],
      },
    ],
  },
  {
    id: 'tandoor-tales',
    name: 'Tandoor Tales',
    cuisines: ['North Indian', 'Kebabs', 'Mughlai'],
    pureVeg: false,
    costForTwo: 600,
    rating: 4.3,
    ratingCount: 9800,
    prepMinutes: 25,
    cover: { hero: 'butter-chicken', side: 'butter-naan', bg: 'sand' },
    coupon: { code: 'TALES50', type: 'percent', value: 50, maxDiscount: 100, minOrder: 299 },
    menu: [
      {
        name: 'Recommended',
        items: [
          nv(
            'Butter Chicken',
            369,
            'butter-chicken',
            'Our signature: smoky tandoori chicken in a silky makhani gravy finished with cream.',
            best,
          ),
          v(
            'Dal Makhani',
            279,
            'dal-makhani',
            'Black lentils simmered overnight with butter and cream.',
            best,
          ),
          nv(
            'Kadai Chicken',
            349,
            'kadai-chicken',
            'Chicken tossed with peppers, onion and freshly pounded kadai masala.',
          ),
        ],
      },
      {
        name: 'Starters',
        items: [
          nv(
            'Tandoori Chicken Tikka',
            319,
            'chicken-tikka',
            'Chargrilled boneless chicken with mint chutney.',
          ),
          v(
            'Malai Paneer Tikka',
            299,
            'paneer-tikka',
            'Creamy, mildly spiced paneer from the tandoor.',
          ),
          nv(
            'Fish Tikka Ajwaini',
            389,
            'fish-tikka',
            'Basa fillet marinated with carom seeds and mustard oil.',
          ),
        ],
      },
      {
        name: 'Main Course',
        items: [
          v(
            'Paneer Tikka Masala',
            309,
            'paneer-tikka-masala',
            'Chargrilled paneer in a spiced onion-tomato masala.',
          ),
          v('Palak Paneer', 289, 'palak-paneer', 'Paneer in a garlicky spinach gravy.'),
          v(
            'Malai Kofta',
            299,
            'malai-kofta',
            'Paneer and potato dumplings in a cashew cream gravy.',
          ),
          v(
            'Dal Tadka',
            219,
            'dal-tadka',
            'Yellow lentils with a cumin, garlic and red chilli tempering.',
          ),
        ],
      },
      {
        name: 'Breads',
        items: [
          v('Butter Naan', 65, 'butter-naan', 'Soft and buttery.'),
          v('Garlic Naan', 75, 'garlic-naan', 'With garlic and coriander.'),
          v('Tandoori Roti', 35, 'roti', 'Whole-wheat roti.'),
        ],
      },
    ],
  },
  {
    id: 'slice-society',
    name: 'Slice Society',
    cuisines: ['Pizzas', 'Italian', 'Fast Food'],
    pureVeg: false,
    costForTwo: 450,
    rating: 4.2,
    ratingCount: 15600,
    prepMinutes: 18,
    cover: { hero: 'pizza-pepperoni', side: 'pizza-margherita', bg: 'butter' },
    coupon: { code: 'SLICE60', type: 'percent', value: 60, maxDiscount: 120, minOrder: 249 },
    menu: [
      {
        name: 'Recommended',
        items: [
          v(
            'Classic Margherita',
            249,
            'pizza-margherita',
            'San Marzano tomato sauce, fresh mozzarella and basil on a hand-stretched base.',
            best,
          ),
          nv(
            'Pepperoni Feast',
            399,
            'pizza-pepperoni',
            'Loaded with chicken pepperoni and extra mozzarella.',
            best,
          ),
          v(
            'Farmhouse Veggie',
            329,
            'pizza-veggie',
            'Capsicum, onion, olives, sweet corn and jalapeños.',
          ),
        ],
      },
      {
        name: 'Signature Pizzas',
        items: [
          v(
            'Tandoori Paneer Pizza',
            359,
            'pizza-paneer',
            'Tandoori paneer, onion and peppers with mint mayo drizzle.',
          ),
          nv('BBQ Chicken Pizza', 389, 'pizza-chicken', 'Smoky BBQ chicken, onion and peppers.'),
        ],
      },
      {
        name: 'Pasta',
        items: [
          v(
            'Penne Arrabbiata',
            269,
            'pasta-arrabbiata',
            'Spicy tomato and garlic sauce with basil.',
          ),
          v('Penne Alfredo', 289, 'pasta-alfredo', 'Creamy parmesan sauce with mushrooms.'),
        ],
      },
      {
        name: 'Sides & Desserts',
        items: [
          v('Peri Peri Fries', 129, 'fries', 'Crispy fries tossed in peri peri spice.'),
          v('Choco Lava Brownie', 119, 'brownie', 'Warm fudgy brownie with vanilla ice cream.'),
          v('Lime Soda', 79, 'lime-soda', 'Fresh lime, soda and mint.'),
        ],
      },
    ],
  },
  {
    id: 'stack-and-smash',
    name: 'Stack & Smash',
    cuisines: ['Burgers', 'American', 'Fast Food'],
    pureVeg: false,
    costForTwo: 400,
    rating: 4.1,
    ratingCount: 11200,
    prepMinutes: 15,
    cover: { hero: 'burger-classic', side: 'fries', bg: 'sky' },
    coupon: { code: 'SMASH99', type: 'flat', value: 99, maxDiscount: null, minOrder: 349 },
    menu: [
      {
        name: 'Burgers',
        items: [
          nv(
            'Classic Smash Burger',
            249,
            'burger-classic',
            'Double smashed chicken patty, cheddar, pickles and house sauce in a brioche bun.',
            best,
          ),
          nv(
            'Crispy Chicken Burger',
            229,
            'burger-chicken',
            'Buttermilk-fried chicken, slaw and sriracha mayo.',
            best,
          ),
          v(
            'Crunchy Veg Burger',
            179,
            'burger-veg',
            'Crispy potato and pea patty with lettuce and tangy mayo.',
          ),
        ],
      },
      {
        name: 'Fried Chicken',
        items: [
          nv(
            'Fried Chicken Bucket (4 pcs)',
            399,
            'fried-chicken',
            'Crispy, juicy fried chicken with a spicy dip.',
            best,
          ),
          nv('Chicken Wings (6 pcs)', 279, null, 'Glazed in smoky hot sauce.'),
        ],
      },
      {
        name: 'Sides & Shakes',
        items: [
          v('Salted Fries', 99, 'fries', 'Golden, crisp, perfectly salted.'),
          v('Chocolate Shake', 169, 'chocolate-shake', 'Thick shake with Belgian chocolate.'),
          v('Strawberry Shake', 159, 'strawberry-shake', 'With real strawberry crush.'),
        ],
      },
    ],
  },
  {
    id: 'wok-republic',
    name: 'Wok Republic',
    cuisines: ['Chinese', 'Asian'],
    pureVeg: false,
    costForTwo: 450,
    rating: 4.0,
    ratingCount: 7600,
    prepMinutes: 18,
    cover: { hero: 'hakka-noodles', side: 'veg-manchurian', bg: 'peach' },
    coupon: { code: 'WOK40', type: 'percent', value: 40, maxDiscount: 80, minOrder: 199 },
    menu: [
      {
        name: 'Noodles',
        items: [
          v(
            'Veg Hakka Noodles',
            199,
            'hakka-noodles',
            'Wok-tossed noodles with crunchy vegetables and soy.',
            best,
          ),
          nv(
            'Chicken Hakka Noodles',
            239,
            'chicken-noodles',
            'With shredded chicken and spring onion.',
          ),
          nv(
            'Schezwan Egg Noodles',
            229,
            'schezwan-noodles',
            'Fiery schezwan sauce, egg and veggies.',
          ),
        ],
      },
      {
        name: 'Rice',
        items: [
          v('Veg Fried Rice', 189, 'veg-fried-rice', 'Classic fried rice with vegetables.'),
          nv('Egg Fried Rice', 209, 'egg-fried-rice', 'With scrambled egg and spring onion.'),
          nv('Chicken Fried Rice', 239, 'chicken-fried-rice', 'With diced chicken.'),
        ],
      },
      {
        name: 'Starters',
        items: [
          v(
            'Veg Manchurian (Dry)',
            219,
            'veg-manchurian',
            'Vegetable dumplings tossed in a tangy soy-garlic glaze.',
            best,
          ),
          nv(
            'Chilli Chicken',
            279,
            'chilli-chicken',
            'Crispy chicken with peppers, onion and green chilli.',
            best,
          ),
          v('Chilli Paneer', 259, 'chilli-paneer', 'Paneer cubes in a spicy Indo-Chinese sauce.'),
        ],
      },
      {
        name: 'Soups',
        items: [
          v(
            'Veg Manchow Soup',
            129,
            'soup-manchow',
            'Spicy, garlicky soup topped with crispy noodles.',
          ),
          v('Tomato Basil Soup', 119, 'soup-tomato', 'Roasted tomato soup with a swirl of cream.'),
        ],
      },
    ],
  },
  {
    id: 'chaat-chowk',
    name: 'Chaat Chowk',
    cuisines: ['Street Food', 'Chaat', 'Snacks'],
    pureVeg: true,
    costForTwo: 200,
    rating: 4.5,
    ratingCount: 13400,
    prepMinutes: 10,
    cover: { hero: 'pani-puri', side: 'samosa', bg: 'butter' },
    coupon: { code: 'CHOWK30', type: 'percent', value: 30, maxDiscount: 60, minOrder: 149 },
    menu: [
      {
        name: 'Chaat',
        items: [
          v(
            'Pani Puri (8 pcs)',
            69,
            'pani-puri',
            'Crisp puris with spiced potato, tangy mint water and sweet chutney.',
            best,
          ),
          v(
            'Papdi Chaat',
            99,
            'papdi-chaat',
            'Crisp papdi with yoghurt, chutneys, sev and pomegranate.',
            best,
          ),
          v('Samosa (2 pcs)', 59, 'samosa', 'Flaky pastry with spiced potato and peas.'),
          v('Dahi Bhalla', 109, null, 'Soft lentil dumplings in sweet curd.'),
        ],
      },
      {
        name: 'Mumbai Specials',
        items: [
          v(
            'Pav Bhaji',
            149,
            'pav-bhaji',
            'Buttery mashed vegetable curry with toasted pav.',
            best,
          ),
          v('Vada Pav', 49, null, 'Spiced potato fritter in a pav with garlic chutney.'),
        ],
      },
      {
        name: 'Sweets & Drinks',
        items: [
          v('Rasmalai (2 pcs)', 119, 'rasmalai', 'Cottage cheese discs in saffron milk.'),
          v('Mango Lassi', 99, 'mango-lassi', 'Alphonso mango blended with thick curd.'),
        ],
      },
    ],
  },
  {
    id: 'momo-mountain',
    name: 'Momo Mountain',
    cuisines: ['Tibetan', 'Momos', 'Chinese'],
    pureVeg: false,
    costForTwo: 300,
    rating: 4.3,
    ratingCount: 8900,
    prepMinutes: 14,
    cover: { hero: 'momos-steamed', side: 'momos-tandoori', bg: 'mint' },
    coupon: null,
    menu: [
      {
        name: 'Momos',
        items: [
          v(
            'Veg Steamed Momos (8 pcs)',
            119,
            'momos-steamed',
            'Juicy cabbage, carrot and onion filling in thin wrappers. With fiery red chutney.',
            best,
          ),
          nv(
            'Chicken Steamed Momos (8 pcs)',
            149,
            'momos-steamed',
            'Minced chicken with ginger and spring onion.',
            best,
          ),
          nv('Chicken Fried Momos (8 pcs)', 169, 'momos-fried', 'Golden and crispy.'),
          v(
            'Paneer Tandoori Momos (8 pcs)',
            179,
            'momos-tandoori',
            'Tossed in tandoori masala and chargrilled.',
          ),
        ],
      },
      {
        name: 'Noodles & Soups',
        items: [
          nv('Chicken Thukpa', 189, 'soup-manchow', 'Hearty Tibetan noodle soup.'),
          v('Veg Chowmein', 149, 'hakka-noodles', 'Street-style noodles.'),
        ],
      },
    ],
  },
  {
    id: 'rolling-kathi',
    name: 'The Rolling Kathi',
    cuisines: ['Rolls', 'Kebabs', 'Fast Food'],
    pureVeg: false,
    costForTwo: 300,
    rating: 4.2,
    ratingCount: 10300,
    prepMinutes: 12,
    cover: { hero: 'roll-chicken', side: 'chicken-tikka', bg: 'butter' },
    coupon: { code: 'ROLL75', type: 'flat', value: 75, maxDiscount: null, minOrder: 299 },
    menu: [
      {
        name: 'Rolls',
        items: [
          nv(
            'Chicken Tikka Roll',
            169,
            'roll-chicken',
            'Chargrilled chicken tikka, onions and mint chutney in a flaky paratha.',
            best,
          ),
          v(
            'Paneer Tikka Roll',
            159,
            'roll-paneer',
            'Tandoori paneer with peppers and onion.',
            best,
          ),
          nv('Double Egg Roll', 119, 'roll-egg', 'Kolkata-style with two eggs.'),
          v('Aloo Masala Roll', 99, 'roll-veg', 'Spiced potato with pickled onion.'),
        ],
      },
      {
        name: 'Kebabs',
        items: [
          nv('Chicken Seekh Kebab', 249, 'seekh-kebab', 'Juicy minced chicken kebabs.'),
          v('Hara Bhara Kebab', 189, null, 'Spinach and pea patties.'),
        ],
      },
      { name: 'Drinks', items: [v('Masala Lemonade', 69, 'lime-soda', 'Chatpata and fizzy.')] },
    ],
  },
  {
    id: 'sweet-tooth',
    name: 'Sweet Tooth Co.',
    cuisines: ['Desserts', 'Bakery', 'Ice Cream'],
    pureVeg: true,
    costForTwo: 300,
    rating: 4.6,
    ratingCount: 6700,
    prepMinutes: 8,
    cover: { hero: 'sundae', side: 'cake-chocolate', bg: 'lavender' },
    coupon: { code: 'SWEET20', type: 'percent', value: 20, maxDiscount: 100, minOrder: 249 },
    menu: [
      {
        name: 'Bestsellers',
        items: [
          v(
            'Death by Chocolate Pastry',
            159,
            'cake-chocolate',
            'Layers of chocolate sponge and ganache.',
            best,
          ),
          v('Red Velvet Slice', 169, 'cake-red-velvet', 'With cream-cheese frosting.'),
          v(
            'Triple Scoop Sundae',
            199,
            'sundae',
            'Strawberry, chocolate and vanilla with fudge and sprinkles.',
            best,
          ),
          v('Walnut Brownie', 129, 'brownie', 'Dense and fudgy.'),
        ],
      },
      {
        name: 'Ice Creams',
        items: [
          v('Alphonso Mango Scoops', 179, 'icecream-mango', 'Mango, pistachio and vanilla.'),
          v('Belgian Waffle', 189, 'waffle', 'Chocolate drizzle and a scoop of vanilla.'),
        ],
      },
    ],
  },
  {
    id: 'chai-and-charcoal',
    name: 'Chai & Charcoal',
    cuisines: ['Cafe', 'Beverages', 'Snacks'],
    pureVeg: false,
    costForTwo: 350,
    rating: 4.3,
    ratingCount: 5400,
    prepMinutes: 10,
    cover: { hero: 'latte', side: 'sandwich-grilled', bg: 'sand' },
    coupon: { code: 'CAFE50', type: 'flat', value: 50, maxDiscount: null, minOrder: 249 },
    menu: [
      {
        name: 'Hot Beverages',
        items: [
          v('Cafe Latte', 169, 'latte', 'Double shot espresso with silky steamed milk.', best),
          v('Kulhad Chai', 59, 'chai', 'Masala chai in a clay cup.', best),
          v('South Indian Filter Coffee', 79, 'filter-coffee', 'Chicory blend, strong and frothy.'),
        ],
      },
      {
        name: 'Cold Beverages',
        items: [
          v('Cold Coffee', 159, 'cold-coffee', 'Blended with ice cream.'),
          v('Virgin Mojito', 139, 'lime-soda', 'Lime, mint and soda.'),
        ],
      },
      {
        name: 'Bites',
        items: [
          v(
            'Bombay Grilled Sandwich',
            149,
            'sandwich-grilled',
            'Potato, beetroot and green chutney, grilled with butter.',
            best,
          ),
          nv(
            'Chicken Club Sandwich',
            219,
            'sandwich-club',
            'Triple-decker with chicken, egg and cheese.',
          ),
          v('Bun Maska', 69, null, 'Soft bun with butter.'),
        ],
      },
    ],
  },
  {
    id: 'coastal-curry-co',
    name: 'Coastal Curry Co.',
    cuisines: ['Seafood', 'Kerala', 'South Indian'],
    pureVeg: false,
    costForTwo: 700,
    rating: 4.5,
    ratingCount: 4300,
    prepMinutes: 24,
    cover: { hero: 'fish-curry', side: 'appam', bg: 'sky' },
    coupon: { code: 'COAST150', type: 'flat', value: 150, maxDiscount: null, minOrder: 699 },
    menu: [
      {
        name: 'Seafood',
        items: [
          nv(
            'Kerala Fish Curry',
            389,
            'fish-curry',
            'Seer fish in a tangy kudampuli and coconut gravy.',
            best,
          ),
          nv('Prawn Moilee', 449, 'prawn-curry', 'Prawns in a mild coconut milk curry.', best),
          nv('Masala Fish Fry', 349, 'fish-fry', 'Pomfret rubbed with red masala and pan-fried.'),
          nv(
            'Garlic Butter Prawns',
            429,
            'prawns-garlic',
            'Pan-tossed prawns with garlic, butter and lemon.',
          ),
        ],
      },
      {
        name: 'Kerala Specials',
        items: [
          v(
            'Appam with Veg Stew',
            219,
            'appam',
            'Lacy rice hoppers with a coconut vegetable stew.',
          ),
          nv('Malabar Chicken Biryani', 349, 'biryani-chicken', 'Short-grain kaima rice biryani.'),
        ],
      },
    ],
  },
  {
    id: 'thali-ghar',
    name: 'Thali Ghar',
    cuisines: ['Gujarati', 'Rajasthani', 'Thali'],
    pureVeg: true,
    costForTwo: 400,
    rating: 4.4,
    ratingCount: 7100,
    prepMinutes: 15,
    cover: { hero: 'thali', side: 'dhokla', bg: 'sage' },
    coupon: null,
    menu: [
      {
        name: 'Thalis',
        items: [
          v(
            'Gujarati Thali',
            299,
            'thali',
            'Unlimited-style thali: dal, kadhi, two sabzis, rotli, rice, farsan and sweet.',
            best,
          ),
          v(
            'Rajasthani Thali',
            329,
            'thali',
            'Dal baati churma, gatte ki sabzi, ker sangri and more.',
          ),
        ],
      },
      {
        name: 'Farsan',
        items: [
          v(
            'Khaman Dhokla',
            99,
            'dhokla',
            'Soft, spongy and tempered with mustard and chillies.',
            best,
          ),
          v('Samosa Chaat', 109, 'samosa', 'Samosa topped with chole and chutneys.'),
        ],
      },
      {
        name: 'Curries',
        items: [
          v('Dal Tadka', 179, 'dal-tadka', 'Homestyle yellow dal.'),
          v('Rajma', 189, 'rajma', 'Kidney beans in an onion-tomato gravy.'),
          v('Chole', 179, 'chole', 'Punjabi chickpea curry.'),
        ],
      },
      {
        name: 'Sweets',
        items: [
          v('Shrikhand', 99, 'kheer', 'Saffron and cardamom hung curd.'),
          v('Gulab Jamun', 79, 'gulab-jamun', 'Two warm jamuns.'),
        ],
      },
    ],
  },
  {
    id: 'bao-and-bowl',
    name: 'Bao & Bowl',
    cuisines: ['Pan-Asian', 'Healthy Food'],
    pureVeg: false,
    costForTwo: 650,
    rating: 4.2,
    ratingCount: 3200,
    prepMinutes: 20,
    cover: { hero: 'bao-chicken', side: 'salad-chicken', bg: 'coral' },
    coupon: { code: 'BAO100', type: 'flat', value: 100, maxDiscount: null, minOrder: 499 },
    menu: [
      {
        name: 'Bao',
        items: [
          nv(
            'Korean Fried Chicken Bao',
            299,
            'bao-chicken',
            'Gochujang-glazed chicken, pickled cucumber and sesame in pillowy steamed buns.',
            best,
          ),
          v('Crispy Paneer Bao', 269, 'bao-paneer', 'Chilli-garlic paneer with slaw.'),
        ],
      },
      {
        name: 'Bowls',
        items: [
          nv(
            'Teriyaki Chicken Bowl',
            349,
            'salad-chicken',
            'Grilled chicken, quinoa, greens, cucumber and cherry tomatoes.',
            best,
          ),
          v(
            'Sesame Paneer Bowl',
            319,
            'salad-paneer',
            'Charred paneer, quinoa and crunchy vegetables.',
          ),
          v(
            'Mediterranean Chickpea Bowl',
            289,
            'salad-chickpea',
            'Roasted chickpeas, avocado and greens.',
          ),
        ],
      },
      {
        name: 'Noodles',
        items: [nv('Chilli Garlic Noodles', 279, 'chicken-noodles', 'With chicken and bok choy.')],
      },
    ],
  },
  {
    id: 'dilli-paratha-junction',
    name: 'Dilli Paratha Junction',
    cuisines: ['North Indian', 'Breakfast'],
    pureVeg: true,
    costForTwo: 300,
    rating: 4.3,
    ratingCount: 8800,
    prepMinutes: 14,
    cover: { hero: 'aloo-paratha', side: 'chai', bg: 'butter' },
    coupon: { code: 'PARATHA30', type: 'percent', value: 30, maxDiscount: 75, minOrder: 199 },
    menu: [
      {
        name: 'Parathas',
        items: [
          v(
            'Aloo Paratha',
            119,
            'aloo-paratha',
            'Spiced potato stuffed paratha with butter, curd and pickle.',
            best,
          ),
          v('Paneer Paratha', 149, 'paneer-paratha', 'Grated paneer and green chilli.', best),
          v('Gobi Paratha', 129, 'aloo-paratha', 'Cauliflower and ginger.'),
        ],
      },
      {
        name: 'Combos',
        items: [
          v('Chole Bhature', 169, 'chole', 'Two fluffy bhature with spicy chole.', best),
          v('Rajma Chawal', 179, 'rajma', 'Rajma with steamed rice.'),
        ],
      },
      {
        name: 'Drinks',
        items: [
          v('Sweet Lassi', 79, 'mango-lassi', 'Thick and creamy.'),
          v('Adrak Chai', 39, 'chai', 'Strong ginger tea.'),
        ],
      },
    ],
  },
  {
    id: 'nawabi-kebab-khana',
    name: 'Nawabi Kebab Khana',
    cuisines: ['Awadhi', 'Kebabs', 'Biryani'],
    pureVeg: false,
    costForTwo: 650,
    rating: 4.4,
    ratingCount: 5900,
    prepMinutes: 26,
    cover: { hero: 'seekh-kebab', side: 'haleem', bg: 'sand' },
    coupon: { code: 'NAWAB20', type: 'percent', value: 20, maxDiscount: 150, minOrder: 599 },
    menu: [
      {
        name: 'Kebabs',
        items: [
          nv(
            'Lucknowi Seekh Kebab',
            349,
            'seekh-kebab',
            'Melt-in-the-mouth mutton seekh with secret spice blend.',
            best,
          ),
          nv('Chicken Tikka', 319, 'chicken-tikka', 'Classic, smoky and juicy.'),
        ],
      },
      {
        name: 'Specials',
        items: [
          nv(
            'Mutton Haleem',
            329,
            'haleem',
            'Slow-cooked wheat, lentils and mutton topped with fried onions.',
            best,
          ),
          nv('Awadhi Mutton Biryani', 449, 'biryani-mutton', 'Delicate, fragrant pukki biryani.'),
          nv('Nihari', 399, 'rogan-josh', 'Overnight-cooked mutton shank stew.'),
        ],
      },
      {
        name: 'Breads',
        items: [
          v('Sheermal', 69, 'roti', 'Saffron-flavoured sweet bread.'),
          v('Rumali Roti', 35, null, 'Thin, soft handkerchief bread.'),
        ],
      },
    ],
  },
  {
    id: 'pasta-piazza',
    name: 'Pasta Piazza',
    cuisines: ['Italian', 'Pasta', 'Continental'],
    pureVeg: false,
    costForTwo: 700,
    rating: 4.1,
    ratingCount: 2800,
    prepMinutes: 20,
    cover: { hero: 'spaghetti-red', side: 'pizza-margherita', bg: 'sky' },
    coupon: null,
    menu: [
      {
        name: 'Pasta',
        items: [
          v(
            'Spaghetti Pomodoro',
            299,
            'spaghetti-red',
            'Slow-cooked tomato sauce, basil and parmesan.',
            best,
          ),
          v('Spaghetti Pesto', 329, 'spaghetti-pesto', 'Basil pesto with pine nuts.'),
          v('Penne Alfredo', 319, 'pasta-alfredo', 'Creamy parmesan sauce.'),
          nv(
            'Chicken Arrabbiata',
            349,
            'pasta-arrabbiata',
            'Spicy tomato sauce with grilled chicken.',
          ),
        ],
      },
      {
        name: 'Pizza',
        items: [v('Margherita', 299, 'pizza-margherita', 'Thin crust, wood-fired.')],
      },
      {
        name: 'Soups & Desserts',
        items: [
          v('Tomato Basil Soup', 149, 'soup-tomato', 'With garlic bread.'),
          v('Tiramisu Slice', 199, 'cake-chocolate', 'Coffee-soaked sponge and mascarpone.'),
        ],
      },
    ],
  },
  {
    id: 'shawarma-street',
    name: 'Shawarma Street',
    cuisines: ['Lebanese', 'Arabian', 'Rolls'],
    pureVeg: false,
    costForTwo: 350,
    rating: 4.0,
    ratingCount: 6400,
    prepMinutes: 12,
    cover: { hero: 'shawarma-chicken', side: 'hummus', bg: 'slate' },
    coupon: { code: 'SHAWARMA50', type: 'percent', value: 50, maxDiscount: 90, minOrder: 199 },
    menu: [
      {
        name: 'Shawarma',
        items: [
          nv(
            'Classic Chicken Shawarma',
            149,
            'shawarma-chicken',
            'Rotisserie chicken, garlic toum, pickles and fries in Lebanese bread.',
            best,
          ),
          nv('Mexican Shawarma', 169, 'shawarma-chicken', 'With salsa and jalapeños.'),
          v('Falafel Wrap', 139, 'roll-veg', 'Crisp falafel with tahini.'),
        ],
      },
      {
        name: 'Platters',
        items: [
          v('Hummus with Pita', 199, 'hummus', 'Creamy hummus, olive oil and warm pita.', best),
          nv('Chicken Shawarma Platter', 279, 'shawarma-chicken', 'With fries, hummus and salad.'),
        ],
      },
    ],
  },
  {
    id: 'andhra-spice-route',
    name: 'Andhra Spice Route',
    cuisines: ['Andhra', 'Biryani', 'South Indian'],
    pureVeg: false,
    costForTwo: 500,
    rating: 4.2,
    ratingCount: 9100,
    prepMinutes: 20,
    cover: { hero: 'biryani-mutton', side: 'egg-curry', bg: 'coral' },
    coupon: { code: 'SPICY60', type: 'percent', value: 60, maxDiscount: 120, minOrder: 299 },
    menu: [
      {
        name: 'Biryani',
        items: [
          nv(
            'Andhra Chicken Biryani',
            299,
            'biryani-chicken',
            'Spicy, aromatic and loaded with chicken.',
            best,
          ),
          nv('Gongura Mutton Biryani', 399, 'biryani-mutton', 'With tangy sorrel leaves.'),
          v('Paneer Biryani', 259, 'biryani-veg', 'Paneer and vegetables.'),
        ],
      },
      {
        name: 'Curries',
        items: [
          nv('Andhra Egg Curry', 219, 'egg-curry', 'Boiled eggs in a fiery onion-tomato gravy.'),
          nv('Chicken Chettinad', 319, 'kadai-chicken', 'Pepper-forward Chettinad masala.', best),
          v('Veg Kurma', 199, 'veg-kurma', 'Mixed vegetables in a coconut-cashew gravy.'),
        ],
      },
      {
        name: 'Starters',
        items: [
          nv(
            'Chicken 65',
            269,
            'chilli-chicken',
            'Crispy, spicy, curry-leaf tempered chicken.',
            best,
          ),
        ],
      },
    ],
  },
  {
    id: 'bombay-tiffin-co',
    name: 'Bombay Tiffin Co.',
    cuisines: ['Maharashtrian', 'Street Food', 'Snacks'],
    pureVeg: true,
    costForTwo: 250,
    rating: 4.4,
    ratingCount: 7800,
    prepMinutes: 11,
    cover: { hero: 'pav-bhaji', side: 'chai', bg: 'blush' },
    coupon: { code: 'TIFFIN25', type: 'percent', value: 25, maxDiscount: 60, minOrder: 149 },
    menu: [
      {
        name: 'Specials',
        items: [
          v(
            'Butter Pav Bhaji',
            159,
            'pav-bhaji',
            'Loaded with butter, served with two toasted pavs.',
            best,
          ),
          v('Misal Pav', 139, null, 'Spicy sprouts curry with farsan and pav.', best),
          v('Sabudana Khichdi', 119, null, 'Tapioca pearls with peanuts.'),
        ],
      },
      {
        name: 'Snacks',
        items: [
          v('Samosa (2 pcs)', 49, 'samosa', 'Crispy and hot.'),
          v('Pani Puri', 69, 'pani-puri', 'Six puris with teekha pani.'),
        ],
      },
      {
        name: 'Drinks',
        items: [
          v('Cutting Chai', 29, 'chai', 'The Mumbai classic.'),
          v('Kokum Sherbet', 69, 'lime-soda', 'Cooling and tangy.'),
        ],
      },
    ],
  },
  {
    id: 'green-fork',
    name: 'Green Fork',
    cuisines: ['Healthy Food', 'Salads', 'Continental'],
    pureVeg: false,
    costForTwo: 550,
    rating: 4.3,
    ratingCount: 2600,
    prepMinutes: 14,
    cover: { hero: 'salad-chicken', side: 'cold-coffee', bg: 'sage' },
    coupon: { code: 'GREEN15', type: 'percent', value: 15, maxDiscount: 100, minOrder: 349 },
    menu: [
      {
        name: 'Salad Bowls',
        items: [
          nv(
            'Grilled Chicken Power Bowl',
            329,
            'salad-chicken',
            'Quinoa, grilled chicken, avocado, cherry tomatoes and greens with lemon-herb dressing.',
            best,
          ),
          v(
            'Protein Paneer Bowl',
            299,
            'salad-paneer',
            'High-protein paneer with seeds and greens.',
          ),
          v('Falafel Hummus Bowl', 289, 'salad-chickpea', 'Chickpeas, hummus and pickled onion.'),
        ],
      },
      {
        name: 'Wraps & Sandwiches',
        items: [
          nv('Chicken Caesar Wrap', 249, 'roll-chicken', 'Whole-wheat wrap.'),
          v('Pesto Veg Sandwich', 219, 'sandwich-grilled', 'Multigrain bread.'),
        ],
      },
      {
        name: 'Smoothies',
        items: [
          v('Cold Brew', 179, 'cold-coffee', 'Unsweetened, 12-hour cold brew.'),
          v('Mango Smoothie', 189, 'mango-lassi', 'No added sugar.'),
        ],
      },
    ],
  },
  {
    id: 'crispy-coop',
    name: 'Crispy Coop',
    cuisines: ['Fried Chicken', 'Burgers', 'American'],
    pureVeg: false,
    costForTwo: 400,
    rating: 3.9,
    ratingCount: 12800,
    prepMinutes: 13,
    cover: { hero: 'fried-chicken', side: 'burger-chicken', bg: 'butter' },
    coupon: { code: 'COOP50', type: 'percent', value: 50, maxDiscount: 100, minOrder: 249 },
    menu: [
      {
        name: 'Buckets',
        items: [
          nv(
            'Hot & Crispy Bucket (6 pcs)',
            499,
            'fried-chicken',
            'Our signature spicy fried chicken.',
            best,
          ),
          nv('Popcorn Chicken', 199, null, 'Bite-sized crunchy chicken.'),
        ],
      },
      {
        name: 'Burgers',
        items: [
          nv(
            'Spicy Crunch Chicken Burger',
            199,
            'burger-chicken',
            'Spicy fillet, lettuce and mayo.',
            best,
          ),
          v('Veg Crunch Burger', 149, 'burger-veg', 'Crispy veg patty.'),
        ],
      },
      {
        name: 'Sides',
        items: [
          v('Large Fries', 129, 'fries', 'Crispy, salted.'),
          v('Chilled Cola', 59, 'lime-soda', '330 ml can.'),
        ],
      },
    ],
  },
];
