# Pre-Publication Check Report

Final state: 274 pages (6 x 9 in, premium color), 30 chapters in seven parts, appendices A to E, About the Author and More Books. Checked on 1 November 2026.

## Code

| Check | Result |
| --- | --- |
| Sessions | 8 Claude Code 2.1.316 sessions (`sessions/`): prompts for all 8, full results for 7. Session 3 (Cartly) hit a 2-hour limit and has no result file; 3b finished it. Logged cost $64.06 plus the unlogged session 3 |
| Workspace (`npm run check` in `code/`) | TypeScript strict, ESLint and every test pass: 314 Jest tests across the four apps and two packages, and 96 Vitest tests in the server; re-run on 2 November 2026 after the review fixes |
| Reelhouse TV (`tv/`) | Typecheck, lint and 80 Jest tests pass (session 6b) |
| Flaky test | The Cartly order-details test was fixed at its cause in session 5 and passed four full parallel runs |
| Screenshots | Every figure is a capture of the real web build in headless Chromium (393 x 852 at 3x for phones, 1920 x 1080 for TV), framed by `build/frames.py`; every figure was viewed and the text checked against it |
| Android TV prebuild | `EXPO_TV=1 npx expo prebuild --platform android --clean`: LEANBACK_LAUNCHER, leanback not required, touchscreen not required, 320 x 180 banner, app name |
| Data | All people, places, products and titles fictional; `.example` domains; MIT-licensed Fluent Emoji 3D art; no real logos |

## Review on an Android emulator (2 November 2026)

A separate review on a Mac ran the four phone apps on an Android 16 emulator through Expo Go and completed each main journey (sign in, order, pay, live tracking; product, cart, checkout; feed, stories, chat; grocery order with countdown). It found, and these are now fixed with tests:

| Issue | Fix | Test |
| --- | --- | --- |
| Keyboard hid login inputs (all apps) and Lumo's chat box on Android | `KeyboardAvoidingView behavior="padding"` in 7 files | `packages/ui/src/nativePitfalls.test.ts` fails on the old pattern |
| Lumo photos solid black on Android | Vignette gradient moved into the `<Svg>` that uses it | Same test, checked against the old file |
| Repeated return lines refunded 3x (₹1,04,997 on ₹34,799) | Duplicates rejected | `commerce.test.ts` |
| Refund ignored the coupon | `refundFor`: coupon share off, capped at the order total; Cartly preview uses the same rule | `pricing.test.ts`, `commerce.test.ts`, Cartly `logic.test.ts` |
| FIRSTBUY reusable | `first_order_only` coupons (with a migration for older databases) | `pricing.test.ts`, `commerce.test.ts` |
| Platter delivery fee priced for the default address | Cart priced for the chosen address (`PUT /cart/:app/address`); orders priced for their address | `commerce.test.ts` |
| Saved item moved back made a duplicate line | Merged into the existing line | `commerce.test.ts` |
| Login token in request logs (`?token=`) | Redacted in the logger | `redact.test.ts` |
| Node 20.19 stated; Expo 58 needs 22.13+ | `engines`, `.nvmrc`, Chapter 2, README | (engines read from the installed packages) |
| 9 printed excerpts ended mid-block silently | Short ranges extended; the build now adds `// ...` to any excerpt that ends inside a block | Bracket-balance scan of every `@include` range |

The two Android fixes were confirmed on the emulator in a temporary copy (Lumo feed and chat); the login screens with the final fix have not been rechecked on the emulator.

## Not verified

No app was run on an iPhone simulator, a physical phone or a TV, or as a store build. No store submission, payment provider, push service or analytics service was used. Maestro flows in Chapter 22 and the production prompts in Part VI were not run.

## Book

| Check | Result |
| --- | --- |
| EPUBCheck 5.1 | 0 fatals, 0 errors, 0 warnings |
| Interior PDF (`build/check_pdf.py`) | All fonts embedded; no missing glyphs; smallest inside margin 0.772 in; smallest outside margin 0.579 in; every chapter and appendix starts on a right-hand page; no large gaps |
| Includes | Every `@include` resolves (the build fails otherwise) |
| Visual proof | Covers, sample chapter, appendix and More Books pages inspected |
| Paperback covers | Dark and white, 12.893 x 9.250 in, 0.643 in spine (274 x 0.002347, color paper); barcode area clear |
| eBook covers | Dark and white, 1600 x 2560 px, real app screenshots, no logos |
| eBook size | 4.4 MB (screenshots reduced to 1200 px wide for Kindle) |
| Spelling | codespell clean; US English |
| Privacy | No personal email address in the book, code or sessions |
