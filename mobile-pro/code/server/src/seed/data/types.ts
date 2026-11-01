/**
 * Input shapes for the hand-written seed data. The seed script turns these
 * into database rows (ids, timestamps, layouts, reviews and so on).
 * Art names and tones are checked against the real art at compile time.
 */
import type { ArtName, ArtTone, PhotoFilter } from '@pro/api/types';

export type { ArtName, ArtTone, PhotoFilter };

/**
 * A street intersection on the Northbay map. x is 100..900 and y is
 * 200..900, both multiples of 100. (600, 600) is a park: do not use it.
 */
export interface GridPoint {
  x: number;
  y: number;
}

// ------------------------------------------------------------ Platter

/** Customization sheets the server knows how to build. */
export type CustomizationPreset =
  | 'pizza' // size (regular / medium / large) + extra toppings
  | 'burger' // make it a meal + add-ons (cheese slice, extra patty)
  | 'biryani' // portion (half / full) + raita / salan add-ons
  | 'curry' // portion (half / full) + spice level
  | 'bread' // butter / plain
  | 'beverage' // size (regular / large)
  | 'coffee' // size + milk choice + extra shot
  | 'dessert' // add a scoop of ice cream
  | 'bowl' // base choice + extra protein
  | 'wrap'; // spice + add cheese

export interface SeedDish {
  name: string;
  /** One appetising sentence, 60 to 140 characters. */
  description: string;
  /** Base price in rupees (whole numbers, believable for an Indian city). */
  price: number;
  veg: boolean;
  art: ArtName;
  /** 0 = mild, 3 = very hot. Defaults to 0. */
  spice?: 0 | 1 | 2 | 3;
  bestseller?: boolean;
  custom?: CustomizationPreset;
}

export interface SeedMenuCategory {
  name: string;
  dishes: SeedDish[];
}

/** A reusable menu for one style of food, keyed by `key`. */
export interface SeedMenu {
  key: string;
  categories: SeedMenuCategory[];
}

export interface SeedRestaurant {
  /** "r-01" .. "r-24". */
  id: string;
  name: string;
  /** Display cuisines, e.g. ["North Indian", "Mughlai"]. */
  cuisines: string[];
  /** Keys of SeedMenu entries that make up this restaurant's menu (1 to 3). */
  menus: string[];
  /** Ids of SeedCuisineTile entries this restaurant should appear under. */
  cuisineTiles: string[];
  art: ArtName;
  tone: ArtTone;
  rating: number;
  ratingCount: number;
  costForTwo: number;
  pureVeg: boolean;
  /** "50% OFF up to ₹100", "Flat ₹125 OFF above ₹499", or null. */
  offer: string | null;
  locality: string;
  /** Street address in Northbay. */
  address: string;
  location: GridPoint;
  /** "11:00 am to 11:30 pm". */
  hours: string;
  promoted?: boolean;
  /** Short tags: "Pure veg", "Late night", "Family friendly", "Healthy"... */
  tags: string[];
}

/** "What's on your mind?" round tiles. */
export interface SeedCuisineTile {
  id: string;
  name: string;
  art: ArtName;
}

// ------------------------------------------------------------ Cartly

export interface SeedProductCategory {
  id: string;
  name: string;
  art: ArtName;
  tone: ArtTone;
}

export interface SeedProduct {
  /** "p-01" .. "p-60". */
  id: string;
  title: string;
  /** A fictional brand. */
  brand: string;
  /** SeedProductCategory id. */
  category: string;
  art: ArtName;
  /** 1 to 3 extra art names for the gallery (often the same art with other items). */
  gallery: ArtName[];
  tone: ArtTone;
  price: number;
  mrp: number;
  rating: number;
  ratingCount: number;
  badge: string | null;
  fastDelivery: boolean;
  /** Two or three sentences. */
  description: string;
  /** Three to five short bullet points. */
  highlights: string[];
  /** Four to six [label, value] pairs. */
  specs: [string, string][];
  variants?: {
    colors?: { label: string; hex: string }[];
    sizes?: string[];
    storage?: { label: string; priceDelta: number }[];
  };
  seller: string;
  returnDays: number;
  warranty: string | null;
  stock: number;
  /** For "newest" sorting. */
  addedDaysAgo: number;
}

export interface SeedReviewText {
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
}

/** Review texts for one category; the seed hands 5 to 9 to each product. */
export interface SeedReviewPool {
  category: string;
  reviews: SeedReviewText[];
}

// ------------------------------------------------------------ Lumo

export interface SeedLumoUser {
  /** Handle without "@", unique, lowercase with dots or underscores. */
  handle: string;
  name: string;
  avatar: ArtName;
  bio: string;
  /** Use .example domains, e.g. "aaravclicks.example", or null. */
  website: string | null;
  verified: boolean;
}

/**
 * A post's illustrated photo is a tone plus 1 to 4 arts. The seed lays them
 * out: the first art is the hero, the rest are smaller accents.
 */
export interface SeedPost {
  /** Author handle. */
  user: string;
  tone: ArtTone;
  arts: ArtName[];
  caption: string;
  location: string | null;
  filter?: PhotoFilter;
  daysAgo: number;
  /** Likes from people outside the seed (the seed adds real likes on top). */
  baseLikes: number;
  /** Handles tagged in the photo. */
  tagged?: string[];
}

export interface SeedStory {
  user: string;
  tone: ArtTone;
  arts: ArtName[];
  caption: string | null;
  hoursAgo: number;
}

export interface SeedHighlight {
  user: string;
  title: string;
  tone: ArtTone;
  arts: ArtName[];
}

export interface SeedConversation {
  /** Handles of the other people in the chat (one for a DM). */
  with: string[];
  /** Oldest first. `from` is a handle or "me" (the demo user). */
  messages: { from: string; text: string; minutesAgo: number }[];
}

// ------------------------------------------------------------ Minutely

export interface SeedGroceryCategory {
  id: string;
  name: string;
  art: ArtName;
  tone: ArtTone;
  subcategories: string[];
}

export interface SeedGrocery {
  /** "g-001" .. "g-120". */
  id: string;
  name: string;
  /** A fictional brand. */
  brand: string;
  category: string;
  /** One of the category's subcategories. */
  subcategory: string;
  /** "500 g", "1 L", "6 pcs", "1 kg". */
  unit: string;
  price: number;
  mrp: number;
  art: ArtName;
  tags: string[];
  veg: boolean;
  /** One or two sentences. */
  description: string;
  /** Defaults to true. */
  inStock?: boolean;
  /** Defaults to 10. */
  maxPerOrder?: number;
  shelfLife?: string;
  origin?: string;
}
