"""Build the book's app figures from the real captures in code/.

Each figure is two or three framed phones (or one framed TV) on a soft
backdrop, saved as manuscript/images/<name>.jpg. The captures themselves
come from the Claude Code sessions (apps/*/screenshots, tv/screenshots).

Usage: python3 build/make_figures.py
"""

from pathlib import Path

from PIL import Image

import frames

ROOT = Path(__file__).resolve().parent.parent
CODE = ROOT / "code"
OUT = ROOT / "manuscript" / "images"
WIDTH = 1800  # pixels: about 300 DPI at the 6 in text width of the PDF

APPS = {
    "platter": CODE / "apps/platter/screenshots",
    "cartly": CODE / "apps/cartly/screenshots",
    "lumo": CODE / "apps/lumo/screenshots",
    "minutely": CODE / "apps/minutely/screenshots",
    "tv": CODE / "tv/screenshots",
}

# Backdrops tinted to each brand, light enough for print
TINTS = {
    "platter": ((255, 246, 240), (252, 232, 220)),
    "cartly": ((242, 246, 255), (226, 233, 252)),
    "lumo": ((250, 244, 252), (240, 230, 247)),
    "minutely": ((243, 251, 244), (226, 244, 229)),
    "tv": ((236, 236, 246), (214, 214, 232)),
    "mix": ((246, 247, 250), (230, 234, 242)),
}

PHONES = {
    # chapter 1: the four apps at a glance
    "fig-suite": ("mix", [("platter", "02-home"), ("cartly", "01-home"),
                          ("lumo", "01-feed"), ("minutely", "02-home")]),
    # Platter
    "platter-opener": ("platter", ["02-home", "04-restaurant", "09-tracking"]),
    "platter-login": ("platter", ["01-login", "01b-otp"]),
    "platter-home-search": ("platter", ["02-home", "03-search"]),
    "platter-menu": ("platter", ["04-restaurant", "05-customize"]),
    "platter-cart": ("platter", ["06-cart", "06b-cart-bill", "07-coupons"]),
    "platter-pay": ("platter", ["08-payment", "09a-tracking-confirmed"]),
    "platter-tracking": ("platter", ["09-tracking", "09b-tracking-scrolled"]),
    "platter-after": ("platter", ["10-orders", "11-rate", "12-profile"]),
    # Cartly
    "cartly-opener": ("cartly", ["01-home", "07-product", "16-order-details"]),
    "cartly-home": ("cartly", ["01-home", "02-home-deals", "20-categories"]),
    "cartly-search": ("cartly", ["03-search", "04-listing", "05-filters"]),
    "cartly-product": ("cartly", ["07-product", "08-product-variants-delivery",
                                  "09-product-reviews"]),
    "cartly-cart": ("cartly", ["10-cart", "11-cart-saved-for-later",
                               "12-checkout"]),
    "cartly-pay": ("cartly", ["13-payment-sheet", "14-order-confirmed",
                              "16-order-details"]),
    "cartly-returns": ("cartly", ["17-return-request", "18-return-confirmed",
                                  "15-orders"]),
    "cartly-more": ("cartly", ["19-wishlist", "21-notifications",
                               "22-account"]),
    # Lumo
    "lumo-opener": ("lumo", ["02-feed-heart-burst", "05-story-viewer",
                             "12-profile"]),
    "lumo-feed": ("lumo", ["01-feed", "02-feed-heart-burst", "03-comments"]),
    "lumo-story": ("lumo", ["05-story-viewer", "04-feed-scrolled"]),
    "lumo-create": ("lumo", ["08-create", "09-create-filters",
                             "10-create-details"]),
    "lumo-explore": ("lumo", ["06-explore", "07-explore-search",
                              "11-activity"]),
    "lumo-profile": ("lumo", ["12-profile", "13-profile-tagged",
                              "14-user-profile"]),
    "lumo-messages": ("lumo", ["16-messages", "17-chat"]),
    # Minutely
    "minutely-opener": ("minutely", ["02-home", "04-category", "08-tracking"]),
    "minutely-home": ("minutely", ["02-home", "02b-home-scrolled",
                                   "03b-search-trending"]),
    "minutely-catalog": ("minutely", ["04-category", "05-product-sheet",
                                      "11-categories"]),
    "minutely-cart": ("minutely", ["06-cart", "06b-cart-bill", "07-checkout"]),
    "minutely-tracking": ("minutely", ["08a-tracking-confirmed",
                                       "08-tracking", "08b-tracking-scrolled"]),
}

TVS = {
    "tv-profiles": "01-profiles",
    "tv-home": "02-home-hero",
    "tv-top10": "04-home-top10",
    "tv-sports": "05-home-live-sports",
    "tv-rail": "11-rail-expanded",
    "tv-details": "07-details",
    "tv-episodes": "08-details-episodes",
    "tv-search": "12-search-keyboard",
    "tv-player": "14-player-controls",
    "tv-next": "18-player-next-episode",
    "tv-guide": "19-live-tv-guide",
    "tv-kids": "25-kids-home",
}


def shot(app, name):
    return Image.open(APPS[app] / f"{name}.png")


def save(img, name):
    OUT.mkdir(parents=True, exist_ok=True)
    img = img.convert("RGB")
    if img.width > WIDTH:
        img = img.resize((WIDTH, round(img.height * WIDTH / img.width)),
                         Image.LANCZOS)
    img.save(OUT / f"{name}.jpg", quality=84, optimize=True,
             progressive=True)


def main():
    for name, (tint, items) in PHONES.items():
        pairs = [(i if isinstance(i, tuple) else (tint, i)) for i in items]
        framed = [frames.phone(shot(app, s)) for app, s in pairs]
        top, bottom = TINTS[tint]
        save(frames.spread(framed, width=3000, top=top, bottom=bottom), name)
    for name, screen in TVS.items():
        framed = frames.tv(shot("tv", screen).convert("RGB"))
        top, bottom = TINTS["tv"]
        save(frames.spread([framed], width=3000, top=top, bottom=bottom,
                           lift_middle=False), name)
    print(f"{len(PHONES) + len(TVS)} figures in {OUT}")


if __name__ == "__main__":
    main()
