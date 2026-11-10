# Pre-Publication Checks

Run `python3 build/check.py` after every build. The checker:

- confirms every interior page is 8.5 x 11 in (no bleed);
- confirms all text and lines on every page lie inside the safe area: 0.375 in at the top, bottom and outside edge, and a 0.5 in gutter (KDP's minimum for 101 to 150 pages; the book uses 0.75 in);
- confirms the fonts are embedded;
- confirms the cover is 2 x 8.5 in + spine + 0.25 in bleed wide and 11.25 in tall, with the spine at 0.002252 in per page (white paper, black ink).

## Last run

```
interior: 120 pages, 8.5 x 11 in; cover 17.520 x 11.250 in, spine 0.270 in
OK
```

## Checked by eye

- Every one of the 100 subject pages was rendered and inspected: each step shows only new lines in black, drawings stay inside their boxes, and every page has a "Your turn!" area.
- Front matter, warm-up pages, contents (page numbers match the dividers), 11 part dividers, certificate and free drawing page.
- Cover: title and author legible, barcode area on the back is clear, spine text centered.

## Not checked here

- A printed proof copy (order one from KDP before publishing).
- KDP's Print Previewer.
