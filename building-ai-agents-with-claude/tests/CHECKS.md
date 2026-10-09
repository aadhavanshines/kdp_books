# Pre-Publication Check Report

Final state: 313 pages (6 x 9 in), about 47,000 words plus code listings, 24 chapters in six parts, and appendices A to G. Every project was verified with Claude Agent SDK 0.2.164 in October 2026.

| Check | Result |
| --- | --- |
| All nine agents run for real on the final code (`tests/verify_all.py`) | 9 of 9 passed their graders; total cost about $1.05 (`tests/verification.json`) |
| Offline tests (`python -m pytest tests`) | 30 passed: refund limits, verification, kill switch, the stock MCP server over real MCP, the web app's owner password and input limits, and every recorded run the book prints |
| Repeated evals | Inbox v2: 24/24 categories in 3 runs (a 4th run, the screenshot, 23/24; the book says so). Receipts: 56/56 fields, 8/8 flags. Research: every quote verified. Support desk: 11/11 with all four models. Kitchen Manager: 5/5. Launch team: graded pass. ShopMate: 10 of 10 briefs with Sonnet 5.5, both demo days, 6 to 8 US cents each |
| Model comparison (Chapter 22) | Round 1 and round 2 with Haiku 5.5, Haiku 4.5, Sonnet 5.5 and Opus 5.5; costs calculated from token counts (`tests/prices.py`, checked against the SDK's estimates for known models); every failure read, and four grader bugs fixed without loosening any check |
| Failure paths | Docker job with no key and with a wrong key both fail loudly with the real reason, write ALERT.txt and exit 1; the dashboard's health check reports "not OK" before the first run |
| Container | Built and run as the non-root `shopmate` user; the `/app` permission bug found and fixed |
| GitHub Actions workflow | Passes actionlint; each step run locally (not run on GitHub: no API key secret available here) |
| Screenshots | Terminal captures from real runs in a clean environment; browser screenshots of the real support desk and ShopMate dashboard; the expenses sheet opened in real LibreOffice Calc |
| Book code listings | Pulled from the tested files at build time (`@include`); all include paths exist; source lines fit the printed width (76 characters) |
| Sample data | All fictional; every email and web address uses reserved `.example` domains |
| EPUBCheck 5.1 | 0 fatals, 0 errors, 0 warnings |
| Interior PDF (`build/check_pdf.py`) | All fonts embedded; smallest inside margin 0.786 in (KDP minimum 0.625 in for 301 to 500 pages); smallest outside margin 0.586 in; every chapter, part and appendix starts on a right-hand page; one 2.7 in gap (page 235) where a heading and its table move to the next page |
| Paperback cover | 12.955 x 9.250 in = 2 x 0.125 bleed + 2 x 6 in + 0.705 in spine (313 x 0.002252); barcode area clear; front art inside the safe area |
| Spelling (codespell) | Clean |
| Grammar (LanguageTool 6.8) | Real issues fixed; remaining flags are code terms and false positives |
| Overlap with the Agent SDK docs (8-word sequences) | 0.03%: a PowerShell command, option names and URLs |
| Prices and model IDs | Checked against the official pricing and models pages (October 2026): Sonnet 5.5 is $2/$10 per million tokens as the standard price (the planned $3/$15 increase applied to Sonnet 5 and was cancelled); Sonnet 5.5 cache reads are $0.10, and the book's price table was corrected to match; Haiku 5.5's $0.10/$0.50 applies to prompts up to 100,000 tokens, and the book now says so; all model IDs match |
| Tables | Column widths measured in the fonts that print, so numbers stay with their words and names never split; only the long code examples in Appendix D's options table wrap |
| Privacy | The author's personal email address appears nowhere in the book or repository (checked before every commit) |
| Not verified here | Live runs on GitHub's servers; the real Claude Console billing pages; Claude Fable 5.1 (not used) |
