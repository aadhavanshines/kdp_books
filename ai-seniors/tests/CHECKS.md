# Pre-Publication Checks

## Automated

```
python3 build/build.py          # EPUB, eBook cover, interior PDF, wrap cover
python3 build/check_pdf.py      # margins, chapter starts, gaps, missing glyphs
java -jar epubcheck.jar dist/ai-made-easy-for-seniors.epub
```

Last run:

```
pages: 145
smallest inside margin: 0.9 in (page 7), KDP minimum 0.375 in
smallest outside margin: 0.75 in (page 4), KDP minimum 0.25 in
TOC entries: 25; starting on a left-hand page: none
pages with characters the fonts can't draw: none
EPUBCheck: 0 fatals / 0 errors / 0 warnings
```

The checker also lists four pages with gaps over 2.5 in (pages 16, 46, 47, 54). Each is caused by a heading kept together with its example box, which is intended.

## Large-print standard

- Body text 16 pt Atkinson Hyperlegible (designed by the Braille Institute for low vision), 23.5 pt leading, ragged right, no hyphenation.
- Example requests in 16 pt shaded boxes; headings 19 to 36 pt; bullets and list numbers 16 pt.
- Example-conversation figures print with their text close to 16 pt.

## Checked by eye

- Front pages, contents, all four part openers and sixteen chapter openers, every figure and illustration, the appendices.
- Cover: title readable at thumbnail size, title panel clear of the couple's faces, barcode area on the back, spine text inside a 0.327 in spine.

## Facts checked

- National Elder Fraud Hotline: 833-FRAUD-11 (833-372-8311). Sources disagree on its hours, so the book sends readers to justice.gov/stopelderfraud for them.
- Family code word advice for AI voice-cloning scams: widely recommended by consumer-protection sources.
- ReportFraud.ftc.gov for reporting scams in the United States.

## Not checked here

- A printed proof (check the grayscale illustrations and shaded boxes on paper).
- Each AI app's current screens: the book describes them generally, and tells readers what to do when a screen looks different.
