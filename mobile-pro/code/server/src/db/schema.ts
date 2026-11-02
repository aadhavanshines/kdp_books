/**
 * SQLite schema. Times are epoch milliseconds (INTEGER). Nested data that is
 * only ever read whole (menus' customizations, product specs, scenes) is
 * stored as JSON text.
 */
export const SCHEMA_VERSION = 1;

export const schema = /* sql */ `
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  handle TEXT NOT NULL UNIQUE,
  avatar TEXT,
  bio TEXT NOT NULL DEFAULT '',
  website TEXT,
  verified INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  recipient TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT NOT NULL DEFAULT '',
  landmark TEXT,
  locality TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS addresses_user ON addresses(user_id);

CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  app TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  cta TEXT NOT NULL,
  art TEXT NOT NULL,
  tone TEXT NOT NULL,
  link TEXT,
  sort INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  app TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  kind TEXT NOT NULL,
  value REAL NOT NULL,
  max_discount REAL,
  min_order REAL NOT NULL,
  restaurant_id TEXT,
  expires_at INTEGER NOT NULL,
  first_order_only INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app TEXT NOT NULL,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  art TEXT NOT NULL,
  link TEXT,
  created_at INTEGER NOT NULL,
  read INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS notifications_user ON notifications(user_id, app, created_at);

-- Platter --------------------------------------------------------------

CREATE TABLE IF NOT EXISTS cuisines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  art TEXT NOT NULL,
  sort INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS restaurants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  art TEXT NOT NULL,
  tone TEXT NOT NULL,
  cuisines_json TEXT NOT NULL,
  tiles_json TEXT NOT NULL,
  rating REAL NOT NULL,
  rating_count INTEGER NOT NULL,
  cost_for_two INTEGER NOT NULL,
  pure_veg INTEGER NOT NULL,
  offer TEXT,
  offers_json TEXT NOT NULL,
  locality TEXT NOT NULL,
  address TEXT NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  hours TEXT NOT NULL,
  promoted INTEGER NOT NULL DEFAULT 0,
  tags_json TEXT NOT NULL,
  sort INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_categories (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL,
  veg INTEGER NOT NULL,
  bestseller INTEGER NOT NULL,
  spice INTEGER NOT NULL,
  rating REAL,
  rating_count INTEGER NOT NULL,
  art TEXT NOT NULL,
  available INTEGER NOT NULL DEFAULT 1,
  customizations_json TEXT NOT NULL,
  sort INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS menu_items_restaurant ON menu_items(restaurant_id, sort);

-- Cartly ---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS product_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  art TEXT NOT NULL,
  tone TEXT NOT NULL,
  sort INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  brand TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES product_categories(id),
  art TEXT NOT NULL,
  tone TEXT NOT NULL,
  gallery_json TEXT NOT NULL,
  price REAL NOT NULL,
  mrp REAL NOT NULL,
  rating REAL NOT NULL,
  rating_count INTEGER NOT NULL,
  badge TEXT,
  fast_delivery INTEGER NOT NULL,
  description TEXT NOT NULL,
  highlights_json TEXT NOT NULL,
  specs_json TEXT NOT NULL,
  variants_json TEXT NOT NULL,
  offers_json TEXT NOT NULL,
  seller TEXT NOT NULL,
  return_days INTEGER NOT NULL,
  warranty TEXT,
  stock INTEGER NOT NULL,
  added_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS products_category ON products(category_id);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  avatar TEXT,
  rating INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  variant_label TEXT,
  verified INTEGER NOT NULL,
  helpful INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS reviews_product ON reviews(product_id, created_at);

CREATE TABLE IF NOT EXISTS deals (
  product_id TEXT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  claimed_percent INTEGER NOT NULL,
  sort INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS wishlist (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS recently_viewed (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  viewed_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, product_id)
);

-- Lumo -----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS follows (
  follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followee_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (follower_id, followee_id)
);
CREATE INDEX IF NOT EXISTS follows_followee ON follows(followee_id);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scene_json TEXT NOT NULL,
  filter TEXT NOT NULL,
  caption TEXT NOT NULL,
  location TEXT,
  base_likes INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS posts_user ON posts(user_id, created_at);
CREATE INDEX IF NOT EXISTS posts_created ON posts(created_at);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS likes (
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (post_id, user_id)
);
CREATE INDEX IF NOT EXISTS likes_user ON likes(user_id);

CREATE TABLE IF NOT EXISTS saves (
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  base_likes INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS comments_post ON comments(post_id, created_at);

CREATE TABLE IF NOT EXISTS comment_likes (
  comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (comment_id, user_id)
);

CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scene_json TEXT NOT NULL,
  caption TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS story_views (
  story_id TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (story_id, user_id)
);

CREATE TABLE IF NOT EXISTS highlights (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cover_json TEXT NOT NULL,
  story_ids_json TEXT NOT NULL,
  sort INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS lumo_notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  read INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS lumo_notifications_user ON lumo_notifications(user_id, created_at);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_read_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS messages_conversation ON messages(conversation_id, created_at);

-- Minutely -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS grocery_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  art TEXT NOT NULL,
  tone TEXT NOT NULL,
  subcategories_json TEXT NOT NULL,
  sort INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS groceries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES grocery_categories(id),
  subcategory TEXT NOT NULL,
  unit TEXT NOT NULL,
  price REAL NOT NULL,
  mrp REAL NOT NULL,
  art TEXT NOT NULL,
  tone TEXT NOT NULL,
  tags_json TEXT NOT NULL,
  in_stock INTEGER NOT NULL,
  max_per_order INTEGER NOT NULL,
  veg INTEGER NOT NULL,
  description TEXT NOT NULL,
  shelf_life TEXT,
  origin TEXT,
  sort INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS groceries_category ON groceries(category_id, sort);

CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  locality TEXT NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL
);

-- Carts and orders -------------------------------------------------------

CREATE TABLE IF NOT EXISTS carts (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app TEXT NOT NULL,
  coupon_code TEXT,
  tip REAL NOT NULL DEFAULT 0,
  restaurant_id TEXT,
  address_id TEXT,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, app)
);

CREATE TABLE IF NOT EXISTS cart_lines (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  options_json TEXT NOT NULL,
  options_key TEXT NOT NULL,
  saved_for_later INTEGER NOT NULL DEFAULT 0,
  added_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS cart_lines_user ON cart_lines(user_id, app);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app TEXT NOT NULL,
  status TEXT NOT NULL,
  items_json TEXT NOT NULL,
  bill_json TEXT NOT NULL,
  coupon_code TEXT,
  address_json TEXT NOT NULL,
  payment_json TEXT NOT NULL,
  instructions TEXT,
  restaurant_id TEXT,
  origin_json TEXT,
  route_json TEXT,
  rider_json TEXT,
  schedule_json TEXT NOT NULL,
  placed_at INTEGER NOT NULL,
  eta_at INTEGER NOT NULL,
  delivered_at INTEGER,
  cancelled_at INTEGER,
  rating_json TEXT
);
CREATE INDEX IF NOT EXISTS orders_user ON orders(user_id, app, placed_at);
CREATE INDEX IF NOT EXISTS orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_events (
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  at INTEGER NOT NULL,
  PRIMARY KEY (order_id, status)
);

CREATE TABLE IF NOT EXISTS returns (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  line_ids_json TEXT NOT NULL,
  reason TEXT NOT NULL,
  comment TEXT,
  status TEXT NOT NULL,
  refund_amount REAL NOT NULL,
  pickup_date INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
`;

/**
 * Columns holding timestamps, shifted forward when an old database is
 * opened so the demo always looks recent (see refreshTimestamps).
 */
export const TIME_COLUMNS: Record<string, string[]> = {
  users: ['created_at'],
  addresses: ['created_at'],
  notifications: ['created_at'],
  coupons: ['expires_at'],
  products: ['added_at'],
  reviews: ['created_at'],
  wishlist: ['created_at'],
  recently_viewed: ['viewed_at'],
  follows: ['created_at'],
  posts: ['created_at'],
  likes: ['created_at'],
  saves: ['created_at'],
  comments: ['created_at'],
  stories: ['created_at'],
  lumo_notifications: ['created_at'],
  conversations: ['updated_at'],
  conversation_members: ['last_read_at'],
  messages: ['created_at'],
  carts: ['updated_at'],
  cart_lines: ['added_at'],
  orders: ['placed_at', 'eta_at', 'delivered_at', 'cancelled_at'],
  order_events: ['at'],
  returns: ['pickup_date', 'created_at'],
};
