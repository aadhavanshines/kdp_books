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

- Every one of the 100 subject pages was rendered and inspected: each step shows only new lines in black, drawings stay inside their boxes, every page ends with a "Done!" box in the bottom-right cell, and every page has a "Your turn!" area.
- Front matter, warm-up pages, contents (page numbers match the dividers), 11 part dividers, certificate and free drawing page.
- Cover: title and author legible, barcode area on the back is clear, spine text centered. The painted front art is 3072 x 4096 px, about 356 dpi across the 8.625 in front panel with bleed, and was inspected at 300 dpi.

## Review corrections applied

- Page 4 no longer suggests markers, which can bleed through a double-sided page; it says to go over final lines with a dark pencil or crayon.
- "Birds and Bugs" is now "Birds and Little Creatures" (a snail and a spider are not insects).
- "Dinosaurs" is now "Dinosaurs and Prehistoric Creatures" (a pterodactyl is a flying reptile, not a dinosaur).
- The title page tagline now gives the age range: "For kids ages 4 to 8".

## Not checked here (do these with the printed proof)

- Order a proof copy and check that the gray lines are clearly visible, and clearly lighter than the black lines, on real paper.
- Try a crayon and a felt pen on one page and check for bleed-through to the back.
- Page through KDP's Print Previewer and confirm the trim (8.5 x 11 in), no bleed, black and white on white paper.
