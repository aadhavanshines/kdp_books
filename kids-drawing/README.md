# Draw Step by Step: 100 Easy Drawings for Kids

*A Fun How-to-Draw Activity Book for Ages 4 to 8*, by Aadhavan Muthurengan. Black-and-white 8.5 x 11 in paperback, 120 pages, $7.99.

100 original pictures in 11 themes. Each picture comes in 4 or 5 steps (six-step subjects show their last two detail steps together), with the new lines in black and the earlier lines in gray, a "Done!" picture to color, and a big "Your turn!" practice area with a light dot grid. Each drawing is scaled to fill its box. Front matter: title, copyright, "This book belongs to", how to use the book, two warm-up tracing pages and contents. At the end: a certificate and free drawing pages.

## Folders

| Folder | Contents |
| --- | --- |
| `subjects/` | The 100 drawings, one file per theme. Each subject is a list of steps; each step is a list of shapes on a 200 x 200 canvas. |
| `build/` | `draw.py` (the drawing language), `book.py` (interior PDF), `cover.py` (wrap cover and front PNG), `preview.py` (step sheets for checking art), `check.py` (KDP checks). |
| `art/` | `cover-front.jpg`: the painted front-cover scene (made with an AI image model on Higgsfield from a reference sheet of the book's own characters, upscaled to 3072 x 4096). `cover.py` lays the title, age badge and author over it. |
| `fonts/` | Fredoka (SIL Open Font License 1.1). |
| `metadata/` | KDP listing details. |
| `tests/` | `CHECKS.md`. |
| `dist/` | Upload-ready `interior.pdf`, `cover.pdf`, and `front-cover.png`. |

## Build

```
pip install cairosvg pymupdf
cp fonts/*.ttf ~/.fonts/ && fc-cache -f
python3 build/book.py
python3 build/cover.py
python3 build/check.py
```

Preview one theme's steps: `PYTHONPATH=build:subjects python3 build/preview.py s01_pets pets.png`.
