# Pre-Publication Checks

## Automated

```
python3 build/build.py          # EPUB, eBook cover, interior PDF, wrap cover
python3 build/check_pdf.py      # margins, chapter starts, gaps, missing glyphs
java -jar epubcheck.jar dist/ai-made-easy-for-seniors.epub
```

Last run (interior and cover rebuilt Nov 13 2026; EPUBCheck not rerun after the small wording changes in Appendices B and C):

```
pages: 127
smallest inside margin: 0.9 in (page 7), KDP minimum 0.375 in
smallest outside margin: 0.75 in (page 4), KDP minimum 0.25 in
TOC entries: 25; parts or quick reference starting on a left-hand page: none
blank pages after the front matter: none
pages with only a few lines (header and page number included): none
gaps over 2.5 in before the end of a chapter: (3.14, 43), (2.78, 50), (2.63, 15), (2.6, 44)
pages with characters the fonts can't draw: none
```

Layout rules:

- Part openers start on a right-hand page. Chapters start on the next page, left or right, so there are no blank pages after the front matter.
- Appendix C (the quick reference) starts on a right-hand page and fits on the front and back of one sheet (pages 125 and 126).
- Each chapter's "Key Points" list stays in one piece. A heading never sits at the bottom of a page without the text that follows it.
- The four remaining gaps are each caused by a heading kept together with its lead-in and example box.

## Large-print standard

- Body text 16 pt Atkinson Hyperlegible (designed by the Braille Institute for low vision), 23.5 pt leading, ragged right, no hyphenation.
- Example requests in 16 pt shaded boxes; headings 19 to 36 pt; bullets and list numbers 16 pt.
- Example-conversation figures print with their text close to 16 pt.

## Checked by eye

- Front pages, contents, all four part openers and sixteen chapter openers, every figure and illustration, the appendices.
- Cover: title readable at thumbnail size, title panel clear of the couple's faces, barcode area on the back, spine text centred on the 0.286 in spine with about 0.07 in clear on each side (KDP minimum 0.0625 in).

## Facts checked

- National Elder Fraud Hotline: 833-FRAUD-11 (833-372-8311). Sources disagree on its hours, so the book sends readers to justice.gov/stopelderfraud for them.
- Family code word advice for AI voice-cloning scams: widely recommended by consumer-protection sources.
- ReportFraud.ftc.gov for reporting scams in the United States.

## Not checked here

- A printed proof (check the grayscale illustrations and shaded boxes on paper).
- Each AI app's current screens: the book describes them generally, and tells readers what to do when a screen looks different.
