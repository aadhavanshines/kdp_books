# Checks: Claude AI Step by Step

Run `python3 build/screens.py` (needs the private `screens-raw/` captures), `python3 build/figures.py`, `python3 build/build.py`, then `python3 build/check_pdf.py`.

| Check | Result |
| --- | --- |
| Interior page count | 235 pages, 6 x 9 in |
| Margins | Inside 0.80 in, outside 0.60 in (KDP minimums 0.375 / 0.25 in) |
| Fonts embedded; every character drawable | Pass |
| Chapters start on right-hand pages | Pass |
| Unplanned gaps over 2.5 in | None |
| EPUB | 41 XHTML/OPF/NCX files well-formed, no missing references, mimetype stored first (EPUBCheck not run: no Java on this machine) |
| Spine | 235 x 0.002252 = 0.529 in; spine text allowed (100+ pages); spine name AADHAVAN |
| Cover | AI Skillup 2026 layout; textless GPT Image art; barcode area 2 x 1.2 in, 0.25 in from edges |
| Screenshots | Real Claude app captures, Nov 25 to 26, 2026, light mode. Account name, chat titles and other artifacts pixelated and blurred. Every crop is 690 raw px wide or less, so interface text prints legibly |
| Privacy scan | No private chat titles, email address or account details in the PDF or EPUB text |
| Real answers | Dentist email (Ch 3), tip calculator (Ch 8), lease check (Ch 6) and quote comparison (Ch 9) are quoted word for word from the Claude app, with omissions marked [...] |
| Quote comparison numbers | Checked against the demo PDFs: $24,450, $25,800, $19,400 |
| Insurance letter deadline (Workflow 10) | November 20 + 180 days = May 19, 2027 |
| Cross-references | Every "Chapter N" checked after the final chapter numbering |
| Style | No em-dashes or en-dashes; none of: crucial, paramount, leverage, delve, landscape, unlock, game-changer; US spelling |
| Keywords | 7, all 50 characters or fewer, no trademarks |
| Example data | Fictional people, companies and addresses; demo files in `demo-files/` |
