# Product requirements

Four apps that should feel as polished as the best consumer apps in their
category, plus a TV bonus. All share one backend (`server/`) with fictional
seed data for a city called Northbay. The user is signed in as a demo
customer after an OTP login (the server accepts code 123456 and logs codes
to the console; no real SMS).

## 1. Platter (food delivery)
- Home: location header ("Deliver to Home, 12 Lake View Road"), search bar,
  promo carousel, "What's on your mind?" cuisine row (round art tiles),
  filters chips (Rating 4.0+, Fast delivery, Pure veg, Offers), restaurant
  list cards (art banner, name, rating pill, time, cost for two, offer tag).
- Restaurant: header with rating, delivery time, offers strip; menu grouped
  by category with veg/non-veg markers, bestseller tag, ADD buttons that
  turn into steppers; customization bottom sheet (size, add-ons); floating
  "View cart" bar with item count and total.
- Cart and checkout: items, bill details (item total, delivery fee, platform
  fee, taxes, coupon discount), coupon apply, tip selector, address picker,
  payment method sheet (UPI, card, cash), "Place order".
- Order tracking: live status timeline (confirmed, preparing, picked up,
  on the way, delivered) streamed from the server, an SVG map with the
  rider moving along a route, ETA, rider card, call/support buttons.
- Orders history, rate the order, profile.

## 2. Cartly (e-commerce store)
- Home: search, category strip, hero banners, deals of the day with
  countdown, "Top picks for you" grid, recently viewed.
- Search with suggestions and filters/sort sheet (price, brand, rating,
  discount); product listing grid with wishlist hearts.
- Product detail: image gallery with dots, title, rating summary, price with
  MRP strike-through and discount %, variant pickers (color, size),
  delivery estimate by pincode, offers, highlights, reviews, sticky
  "Add to cart" / "Buy now".
- Cart (save for later, quantity), address, payment, order confirmation,
  order details with shipment tracking steps, returns request flow.
- Wishlist, account, notifications.

## 3. Lumo (social photo sharing)
- Feed: stories row with ring states (unseen gradient, seen gray), posts with
  header, art "photo" (rich illustrated compositions), double-tap to like
  with heart burst animation, like/comment/share/save, caption, comments
  count, timestamp.
- Story viewer: full-screen, progress bars, tap left/right, hold to pause.
- Create post: pick art, filters strip, caption, tag people, share.
- Explore grid (mixed tile sizes), profile (stats, bio, highlights, grid and
  tagged tabs), comments sheet, notifications (likes, follows), direct
  messages list and chat thread.

## 4. Minutely (10-minute grocery delivery)
- Home: big "Delivery in 9 minutes" header, address, search, category grid
  (art tiles), offer banners, product rails (Fresh fruits, Dairy, Snacks)
  with ADD steppers; sticky cart bar.
- Category page: left category rail, product grid, filters.
- Cart with savings banner, slot (instant), delivery partner tip,
  checkout, live tracking with countdown ring and SVG map.

## 5. Reelhouse TV (bonus, Android TV)
A streaming app in the style of the big subscription video services,
built for the remote control (D-pad) and the 10-foot screen.
- Profile picker ("Who's watching?") with art avatars and a Kids profile.
- Home: full-bleed hero billboard that rotates featured titles, with title
  art, match %, year, rating, duration, genres, Play and More info buttons;
  rows: Continue watching (progress bars), Trending now (numbered Top 10),
  New releases, Live sports (LIVE badge, score strip), Because you watched,
  Originals (tall posters), Genres. Focus scales the card up with a glow
  and shows its title; the hero preview updates with the focused title.
- Side navigation rail (Search, Home, Movies, Series, Sports, Live TV, My
  list, Settings) that expands on focus.
- Title details: backdrop, synopsis, cast, Play / Resume, Add to My list,
  trailer button, Seasons selector with an episode list (thumbnails,
  progress), More like this.
- Search with an on-screen keyboard grid, results grid, trending searches.
- Player: full-screen with auto-hiding controls (play/pause, back 10 s,
  forward 10 s, seek bar with time, audio and subtitles menu, Next episode
  card near the end), mock playback progress.
- Live TV guide: channel list with a timeline grid of programmes.
- All titles, channels and teams are fictional; artwork is composed from
  the 3D illustrations on rich gradients (posters, backdrops, logos as
  type). No real service names, logos, or their signature colors.

## Backend (server/)
REST + SSE, OpenAPI-style typed routes, SQLite seeded with fictional data:
restaurants and menus, products and reviews, users/posts/stories/comments,
grocery catalog, carts, orders, order status simulation (advances every few
seconds over SSE), coupons, addresses. JWT auth after OTP. CORS for web.
