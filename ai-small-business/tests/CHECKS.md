# Checks: Claude AI for Small Business

Run `python3 build/build.py`, then `python3 build/check_pdf.py`.

| Check | Result |
| --- | --- |
| Workflows numbered 1 to 100, each with Use it when, Time Saved, prompt, example result, Make it better and Variations | Pass (`bonus.py` asserts every part and the numbering) |
| Bonus files generated from the manuscript (prompt library .md/.txt, workflow index .csv, 8 templates) | Pass |
| Appendix B workflow index generated from the same data | Pass |
| Cross-references (Workflows 26, 41, 54, 60, 64, 69, 82, 84, 90, 98; Chapters 2, 3, 4, 15, 16, 17, 18, 19) point at the right content | Pass (checked by hand) |
| Interior page count | 217 pages, 6 x 9 in |
| Margins | Inside 0.80 in (KDP minimum 0.5 in for 151 to 300 pages); outside 0.60 in |
| Fonts embedded; every character drawable | Pass |
| Chapters start on right-hand pages | Pass |
| Unplanned gaps over 2.5 in | None (worksheet pages end early on purpose) |
| Each worksheet fits on one page | Pass (Appendix E, paperback only) |
| EPUBCheck 5.1.0 | 0 errors, 0 warnings |
| Spine width | 217 x 0.002252 = 0.489 in; spine text allowed (79+ pages), 0.11 in clear of each spine edge (KDP minimum 0.0625 in) |
| Cover | No third-party logos; 2 x 1.2 in barcode area 0.25 in from the spine-side and bottom edges |
| Keywords | 7, all 50 characters or fewer, no trademarks |
| Example data | Fictional businesses and people, .example email domains |
| Language | US English (schedule, line, register, vacation, new hire, remodel; no "rota", "queue", "till") |
| Bonus URL | github.com/aadhavanshines/small-business-ai-workflows (printed in Appendix A) |
| Example-result tables | Columns never narrower than their widest word |
| Short boxes (14 lines or fewer) | Never split across pages |
| Projects on the free plan | Chapter 2 says the free plan includes a few Projects (Anthropic help center: up to five) |
