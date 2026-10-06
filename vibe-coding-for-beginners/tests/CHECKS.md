# Pre-Publication Check Report

Final state: 217 pages (6 x 9 in), about 41,000 words plus code listings.

| Check | Result |
| --- | --- |
| Independent project tests (`python -m pytest tests`) | 29 passed: browser tests (Playwright/Chromium), two time zones, UTC-server bug reproduced on the old code and fixed on the new, real Anthropic SDK request shape and error handling with a mocked network, rate limit, CLI end to end |
| Claude's own project test suites | Expense tracker 26 passed; habit tracker 32 passed; Study Buddy 24 passed |
| Production server | gunicorn started from the Procfile command; page 200, POST 201; data survived a restart on the `DATABASE_PATH` disk |
| GitHub Actions workflows | `tests.yml` and `claude.yml` pass actionlint |
| Real Claude Code sessions | 27 sessions logged in `claude-sessions/` (about $4.35 at API list prices) |
| Book code listings | Pulled from the tested files at build time (`@include`); first and last line of every excerpt reviewed |
| Claude Code facts | Every slash command checked against the official commands reference; every CLI flag against `claude --help`, `claude mcp add --help`, and the CLI reference; behavior checked against the official docs (October 2026, Claude Code 2.1.291) |
| Appendix A prompts | 5 representative prompts (13, 17, 22, 33, 38) run for real in plan mode; all produced accurate, useful results |
| EPUBCheck 5.1 | 0 fatals, 0 errors, 0 warnings |
| Interior PDF | 6 x 9 in; all 6 fonts embedded; every chapter, part, and appendix starts on a right-hand page |
| Table of contents | 33 of 33 entries match their real start pages |
| Stranded headings and lead-ins | None (only title and part pages are flagged, by design) |
| White space | No mid-chapter gap over 2.1 in (largest gaps are a chapter opener and section ends) |
| Paperback cover | 12.739 x 9.250 in = 2 x 0.125 bleed + 2 x 6 in + 0.489 in spine (217 x 0.002252); barcode area clear; spine text present |
| Spelling (codespell) | Clean |
| Grammar (LanguageTool 6.8) | Real issues fixed; remaining flags are technical terms, URLs, names, and style preferences |
| Plagiarism (8-word overlap) | 0.12% overlap with the official docs (functional phrases such as UI steps and error messages; close passages rephrased) |
| Trademarks | Not-affiliated notice and trademark list on the copyright page and in the description; trademark note for the subtitle in `metadata/kdp-listing.md` |
| Resource URLs | All code.claude.com and platform.claude.com addresses return 200 |
