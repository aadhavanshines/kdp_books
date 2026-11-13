# Draw Christmas Step by Step: 50 Easy Holiday Drawings for Kids

*A Fun How-to-Draw Christmas Activity Book for Ages 4 to 8*, by Aadhavan Muthurengan. Black-and-white 8.5 x 11 in paperback, 66 pages, $6.99. Book 2 in the format of [`kids-drawing/`](../kids-drawing/).

50 original holiday pictures in 6 themes (Santa and Friends, Tree and Decorations, Presents and Toys, Winter Fun, Holiday Treats, Christmas Eve). Each picture has 4 or 5 steps, with the new lines in black and the earlier lines in gray, a "Done!" picture, and a "Your turn!" practice area with a light dot grid. Front pages: title, copyright, "This book belongs to", how to use the book, two warm-up tracing pages, contents. At the end: a holiday certificate and free drawing pages.

## Folders

| Folder | Contents |
| --- | --- |
| `subjects/` | The 50 drawings, one file per theme (`x01_friends.py` to `x06_eve.py`). |
| `build/` | The same pipeline as `kids-drawing/`: `draw.py`, `book.py`, `cover.py`, `preview.py`, `check.py`. Book-specific choices (themes, pictures on the title, how-to and certificate pages, cover text) live in `book.json`. |
| `art/` | `cover-front.jpg` and `cover-back.jpg`: painted cover scenes (AI image model on Higgsfield, styled after book 1's cover, upscaled to 3072 x 4096). |
| `fonts/` | Fredoka (SIL Open Font License 1.1). |
| `metadata/` | KDP listing details. |
| `tests/` | `CHECKS.md`. |
| `dist/` | Upload-ready `interior.pdf`, `cover.pdf`, and `front-cover.png`. |

## Build

```
pip install cairosvg pymupdf fonttools
cp fonts/*.ttf ~/.fonts/ && fc-cache -f
python3 build/book.py
python3 build/cover.py
python3 build/check.py
```
