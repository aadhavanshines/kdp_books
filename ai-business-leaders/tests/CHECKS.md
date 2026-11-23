# Checks: Proof Before Scale

Run `python3 build/build.py`, then `python3 build/check_pdf.py`.

| Check | Result |
| --- | --- |
| Interior page count | 191 pages, 6 x 9 in |
| Margins | Inside 0.80 in (KDP minimum 0.5 in for 151 to 300 pages); outside 0.60 in |
| Fonts embedded; every character drawable | Pass |
| Chapters, parts and appendices start on right-hand pages | Pass |
| Unplanned gaps over 2.5 in | None (only worksheet pages end early, on purpose) |
| Worksheet write-in table rows | 0.3 in tall |
| EPUB | All 37 XHTML, OPF and NCX files well-formed; worksheets excluded (print-only). EPUBCheck 5.1.0: 0 errors, 0 warnings |
| Spine width | 191 x 0.002252 = 0.430 in; spine text allowed (79+ pages); spine name AADHAVAN |
| Cover | No third-party logos; 2 x 1.2 in barcode area 0.25 in from the spine-side and bottom edges |
| Business case arithmetic (Chapter 6) | Checked in Python: costs $106,040 / $50,040 / $50,040; benefits $111,000 / $148,000 / $148,000; net $200,880; ROI 97%; half adoption about -$2,600; integration doubled $155,880; 10% growth (4 hires planned, 3 avoided) about $371,000 |
| Year-one actuals (Chapter 17) | $108,000 - $112,000 = about -$4,000 |
| Scoring table (Chapter 5) | Priority = 2V + F + S, all 12 rows checked |
| Cross-references | Every "Chapter N" and "Appendix X" reference checked after renumbering |
| Style | No em-dashes or en-dashes; none of: crucial, paramount, leverage, delve, landscape, unlock, game-changer; US spelling |
| Keywords | 7, all 50 characters or fewer, no trademarks |
| Title | "Proof Before Scale" had no Amazon.com matches on Nov 23, 2026 |
| Example data | Fictional company (Northfield Supply) and people |
