"""Render a white-background front cover for every book in this repository.

Each book keeps its own covers.py (dark design). This script loads it, swaps
the theme colours for a light palette, and writes dist/ebook-cover-white.jpg
(1600 x 2560 px, the same size as the Kindle cover).
Usage:  python3 tools/white_covers.py
"""
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# A darker shade of each book's accent, so it reads well on white.
ACCENT_ON_WHITE = {
    "prompt-engineering-mastery": (196, 106, 0),
    "vibe-coding-for-beginners": (4, 140, 98),
    "building-ai-agents-with-claude": (4, 140, 98),
    "ai-for-engineers": (180, 100, 0),
    "python-hands-on": (180, 100, 0),
    "how-llms-are-made": (180, 100, 0),
    "coding-interviews": (194, 84, 0),
}


def load_covers(book):
    sys.path.insert(0, str(book / "build"))
    spec = importlib.util.spec_from_file_location(f"covers_{book.name}", book / "build" / "covers.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    sys.path.pop(0)
    return mod


def main():
    for book in sorted(p.parent for p in ROOT.glob("*/book.json")):
        meta = json.loads((book / "book.json").read_text())
        covers = load_covers(book)
        covers.NAVY_TOP = (255, 255, 255)      # background: white at the top...
        covers.NAVY_BOT = (238, 242, 247)      # ...fading to a very light grey
        covers.WHITE = (17, 24, 39)            # title and author: near black
        covers.SOFT = (71, 85, 105)            # tagline and features: slate
        covers.AMBER = ACCENT_ON_WHITE.get(book.name, covers.AMBER)
        out = book / "dist" / "ebook-cover-white.jpg"
        covers.build_ebook_cover(meta, out)
        print("wrote", out.relative_to(ROOT))


if __name__ == "__main__":
    main()
