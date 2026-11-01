# Pre-Publication Check Report

Final state: 272 pages (6 x 9 in, premium color), 30 chapters in seven parts, appendices A to E, About the Author and More Books. Checked on 1 November 2026.

## Code

| Check | Result |
| --- | --- |
| Sessions | 8 recorded Claude Code 2.1.316 sessions (`sessions/`), logged cost $64.06 plus the unrecorded Cartly session |
| Workspace (`npm run check` in `code/`) | TypeScript strict, ESLint and every test pass: 310 Jest tests across the four apps and two packages, and 87 Vitest tests in the server; re-run on 1 November 2026 |
| Reelhouse TV (`tv/`) | Typecheck, lint and 80 Jest tests pass (session 6b) |
| Flaky test | The Cartly order-details test was fixed at its cause in session 5 and passed four full parallel runs |
| Screenshots | Every figure is a capture of the real web build in headless Chromium (393 x 852 at 3x for phones, 1920 x 1080 for TV), framed by `build/frames.py`; every figure was viewed and the text checked against it |
| Android TV prebuild | `EXPO_TV=1 npx expo prebuild --platform android --clean`: LEANBACK_LAUNCHER, leanback not required, touchscreen not required, 320 x 180 banner, app name |
| Data | All people, places, products and titles fictional; `.example` domains; MIT-licensed Fluent Emoji 3D art; no real logos |

## Not verified

No app was run on a physical phone, an emulator or a TV (no hardware acceleration or Android SDK on the build machine). No store submission, payment provider, push service or analytics service was used. Maestro flows in Chapter 22 and the production prompts in Part VI were not run.

## Book

| Check | Result |
| --- | --- |
| EPUBCheck 5.1 | 0 fatals, 0 errors, 0 warnings |
| Interior PDF (`build/check_pdf.py`) | All fonts embedded; no missing glyphs; smallest inside margin 0.772 in; smallest outside margin 0.579 in; every chapter and appendix starts on a right-hand page; no large gaps |
| Includes | Every `@include` resolves (the build fails otherwise) |
| Visual proof | Covers, sample chapter, appendix and More Books pages inspected |
| Paperback cover | 12.888 x 9.250 in, 0.638 in spine (272 x 0.002347, color paper); barcode area clear |
| eBook covers | Dark and white, 1600 x 2560 px, real app screenshots, no logos |
| eBook size | 4.4 MB (screenshots reduced to 1200 px wide for Kindle) |
| Spelling | codespell clean; US English |
| Privacy | No personal email address in the book, code or sessions |
