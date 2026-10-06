# Pre-Publication Check Report

Final state: 339 pages (6 x 9 in), about 65,000 words plus code listings. This edition adds Part V, Production Apps, End to End (Chapter 22, choosing a model, with a measured experiment; Chapters 23 to 27, QuickBite from plan to launch), and real Claude Code terminal screenshots throughout.

| Check | Result |
| --- | --- |
| Independent project tests (`python -m pytest tests`) | 40 passed: browser tests (Playwright/Chromium), phone-sized screens with touch, tap-target sizes, axe-core accessibility scans (to-do app and Sip), Sip local-midnight rollover and dark mode, habit rename and version footer, two time zones, UTC-server bug reproduced on the old code and fixed on the new, real Anthropic SDK request shape and error handling with a mocked network, rate limit, CLI end to end |
| Claude's own project test suites | Expense tracker 26 passed; habit tracker 44 passed; Study Buddy 24 passed; Sip 32 Jest tests passed in UTC, New York, and Kolkata, plus `tsc --noEmit` and `expo export --platform web` |
| QuickBite (Project 7), re-run independently on the final commit | lint and typecheck clean; 189 unit tests; 12 Firestore rules tests; 50 contract tests (memory and Firebase); 20 end-to-end tests on the Firebase emulators; Hosting check under the real CSP (routes, headers, caching, 30 browser tests); 45 Supabase tests on real PostgreSQL |
| QuickBite checks written for the book | Payment signatures cross-checked against the official `stripe` 23.0.0 and `razorpay` 2.9.8 SDKs (5 tests, `tests/quickbite/sdk-crosscheck.test.ts`); anonymous attack probe on the Firestore emulator (create order, read payments and coupons, edit a restaurant: all 403; read menu: 200); checkout bill checked by hand (₹784.05) |
| QuickBite not verified here | Live Razorpay and Stripe calls (no network access to them; `pnpm payments:check` is provided for test keys), a real Firebase deploy and Secret Manager, Supabase Realtime and PostgREST (no Docker images), the GitHub deploy workflow, real device and provider-script loading |
| Model experiment (Chapter 22) | 20 headless runs, 2 tasks x 5 settings x 2, scored by 36 hidden tests run in New York time; hidden tests validated by hand and by a reference implementation in 3 time zones; Fable 5.1 could not run (no usage credits) |
| Terminal screenshots | 17 captures of the real Claude Code (v2.1.291; the launch session auto-updated to 2.1.292) running in tmux, rendered by `build/terminal_shots.py`; only account banners and tmux tips removed |
| Production server | gunicorn started from the Procfile command; page 200, POST 201; data survived a restart on the `DATABASE_PATH` disk |
| GitHub Actions workflows | `tests.yml` and `claude.yml` pass actionlint |
| Real Claude Code sessions | 47 sessions plus the 20-run model experiment, logged in `claude-sessions/` (about $101 at API list prices) |
| Mobile release prep | Android prebuild of Sip: all six permissions marked for removal in release config, kept for development builds; `eas.json` valid; app IDs `com.vibecodingbook.sip`; target SDK 36. Native builds and store submission were not run (no developer accounts, Expo services unreachable from the build environment) |
| SDLC claims | The 11 rename tests written "first" were run against the tagged 1.0.0 code: 11 failed, 33 passed, as Claude reported |
| Book code listings | Pulled from the tested files at build time (`@include`); first and last line of every excerpt reviewed |
| Claude Code facts | Every slash command checked against the official commands reference; every CLI flag against `claude --help`, `claude mcp add --help`, and the CLI reference; behavior checked against the official docs (October 2026, Claude Code 2.1.291) |
| Appendix B prompts | 5 representative prompts (13, 17, 22, 33, 38) run for real in plan mode; all produced accurate, useful results |
| EPUBCheck 5.1 | 0 fatals, 0 errors, 0 warnings |
| Interior PDF | 6 x 9 in; all 7 fonts embedded (DejaVu Serif added for the rupee sign); every chapter, part, and appendix starts on a right-hand page |
| Table of contents | 46 of 46 entries match their real start pages; every chapter, part, and appendix starts on a right-hand page |
| Stranded headings and lead-ins | None (only title and part pages are flagged, by design) |
| White space | No mid-chapter gap over 2.3 in (the largest is a chapter-opener page; the mobile options table was turned into bullets to remove a 3 in gap) |
| Paperback cover | 13.013 x 9.250 in = 2 x 0.125 bleed + 2 x 6 in + 0.763 in spine (339 x 0.002252); barcode area clear; spine text present |
| Spelling (codespell) | Clean |
| Grammar (LanguageTool 6.8) | Real issues fixed; remaining flags are technical terms, URLs, names, and style preferences |
| Plagiarism (8-word overlap) | New chapters: 0 overlapping 8-word sequences with the Claude Code docs. Earlier chapters: 0.12% overlap with the official docs (functional phrases such as UI steps and error messages; close passages rephrased) |
| Trademarks | Not-affiliated notice and trademark list on the copyright page and in the description; trademark note for the subtitle in `metadata/kdp-listing.md` |
| Resource URLs | All code.claude.com and platform.claude.com addresses return 200; the Apple addresses return 200. Expo, React Native, Google Play Help, Material, W3C, semver.org, and keepachangelog.com were blocked by the build environment's network and could not be checked |
| Store rules | Fees, the 12-tester/14-day closed test, the API level 36 deadline, Xcode 26 requirement, and TestFlight limits checked against Google and Apple sources in October 2026; the book tells readers to confirm in the consoles |
