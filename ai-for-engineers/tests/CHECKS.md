# Pre-Publication Check Report

Final state: 197 pages (6 x 9 in), about 33,000 words including code listings, 17 chapters in five parts, and appendices A to F. Every project was run with Claude Agent SDK 0.2.164 and Claude Code 2.1.296 in October 2026.

| Check | Result |
| --- | --- |
| Real runs | About 70 recorded runs across the ten projects, including six Claude Code sessions; total cost about $7.34, calculated from token counts. Every printed output comes from these runs (`projects/*/output`) |
| Graders | Requirements Reviewer: recall 1.0 in 5 of 5 runs. Test Case Generator: no invented limits in 5 of 5 runs. Change Impact: 26/26 in 5 of 5. HIL Analyzer: 12/12 verdicts and 28/28 values on both nights. Report Writer: 0 number or ID problems in 6 final-version runs. Triage: duplicates 7/7 in 10 of 10. FMEA: 14 to 16 of 16 with Sonnet (engineer review). Knowledge: 18/18 in 3 Sonnet runs; no failed quotes in 115. Database agent: 10/10 in 3 runs. Nightly: all decisions right on both nights |
| Corrections to answer files | Recorded in `projects/wlc200/labels/TRUTH-CORRECTIONS.md`, `review-adjudication.json` and the `engineer-review.json` files; original labels kept; both scores reported in the book |
| Offline tests (`python3 -m pytest -q tests`) | 20 passed: every project's checks with deliberately wrong inputs, the read-only MCP server, and the analyzer edge case |
| Book code listings | Pulled from the tested files at build time (`@include`); all include paths and line ranges checked against the content they should show |
| Sample data | All fictional (Ardent Drive Systems, WLC-200); no real company or standard text |
| EPUBCheck 5.1 | 0 fatals, 0 errors, 0 warnings |
| Interior PDF (`build/check_pdf.py`) | All fonts embedded; smallest inside margin 0.793 in (KDP minimum 0.5 in for 151 to 300 pages); smallest outside margin 0.579 in; every chapter, part and appendix starts on a right-hand page; no large gaps |
| Paperback cover | 12.694 x 9.250 in = 2 x 0.125 bleed + 2 x 6 in + 0.444 in spine (197 x 0.002252); barcode area clear |
| eBook covers | Dark (`ebook-cover.jpg`) and white (`ebook-cover-white.jpg`), 1600 x 2560 px |
| Spelling (codespell) | Clean |
| Grammar (LanguageTool) | Real issues fixed; remaining flags are false positives and quoted model output |
| Overlap with the Agent SDK docs (8-word sequences) | 0.013%: documentation URLs only |
| Facts checked against primary sources (October 2026) | Anthropic Commercial Terms (no training on customer content, effective 17 June 2025); consumer terms update (training choice, 5-year or 30-day retention, 8 October 2025 deadline); model prices as in book 3 |
| Standards | Described in the book's own words; no standard text reproduced; readers told to use the standards themselves |
| Privacy | The author's personal email address appears nowhere in the book or repository (checked before every commit); defect triage sends no personal names |
| Not verified here | A scheduled nightly run over weeks (the book says so); LibreOffice was used to render the Word report, not Microsoft Word |
