# Pre-Publication Check Report

Final state: 268 pages (6 x 9 in, premium color), 30 chapters in seven parts, appendices A to E, About the Author and More Books. Checked on 1 November 2026.

## Code

| Check | Result |
| --- | --- |
| Sessions | 8 Claude Code 2.1.316 sessions (`sessions/`): prompts for all 8, full results for 7. Session 3 (Cartly) hit a 2-hour limit and has no result file; 3b finished it. Logged cost $64.06 plus the unlogged session 3 |
| Workspace (`npm run check` in `code/`) | TypeScript strict, ESLint and every test pass: 316 Jest tests across the four apps and two packages, and 97 Vitest tests in the server; re-run on 2 November 2026 after the second review's fixes |
| Reelhouse TV (`tv/`) | Typecheck, lint and 84 Jest tests pass |
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
| Platter delivery fee priced for the default address | Cart priced for the chosen address (`PUT /cart/:app/address`); the cart reports `addressId` and the screen shows that address; the pay button waits for re-pricing; the address resets after each order | `commerce.test.ts` (button total = amount charged), Platter `cart.test.tsx` |
| Saved item moved back made a duplicate line | Merged into the existing line | `commerce.test.ts` |
| Login token in request logs (`?token=`) | Redacted in the logger | `redact.test.ts` |
| WELCOME50 banner said "your first order" but the coupon is reusable | Banner reads "50% OFF your order"; home screenshot recaptured | Seed |
| Chapter 6 excerpts shifted after code changes | Ranges fixed; the build now stops if any excerpt's first or last line changes (`tests/includes.lock`) | `build/check_includes.py` |
| Node 20.19 stated; Expo 58 needs 22.13+ | `engines`, `.nvmrc`, Chapter 2, README | (engines read from the installed packages) |
| 9 printed excerpts ended mid-block silently | Short ranges extended; the build now adds `// ...` to any excerpt that ends inside a block | Bracket-balance scan of every `@include` range |

A second emulator pass confirmed the Lumo photo fix and the keyboard fix on all four logins and Lumo chat (the bottom sheet and Platter rating screen were not exercised). The TV app's web build was driven at 1920 x 1080 with remote keys: profiles, hero, rows, player, Back and the Kids filter work. In this container, a Playwright run of the same build at 1920 x 1080 confirmed the side menu by remote: Left from the first card focuses Home, Down moves to Movies, Enter opens it. A third review built Reelhouse natively and ran it on an Android 16 TV emulator with D-pad input: launch, focus across profiles, rows and the side menu, Live TV guide, Search keyboard, player and Back, My list, the Kids profile, and exit to the TV home screen all worked with no crashes. It found Kids trending chips naming non-Kids titles; `trendingSearches` now filters them by profile (`catalog.test.ts`). The same review confirmed the Platter re-pricing on the phone emulator: the button showed ₹506.75 and the order charged ₹506.75, and the next cart started from Home. A later run found that the Kids profile crashed on opening Sports (it has no sports titles): Sports is now hidden from the Kids menu, and every section's billboard falls back to titles the profile may watch, with a test over every section and profile.

## Not verified

No app was run on an iPhone simulator, a physical phone or a real TV, or as a store build. No store submission, payment provider, push service or analytics service was used. Maestro flows in Chapter 22 and the production prompts in Part VI were not run.

## Book

| Check | Result |
| --- | --- |
| EPUBCheck 5.1 | 0 fatals, 0 errors, 0 warnings |
| Interior PDF (`build/check_pdf.py`) | All fonts embedded; no missing glyphs; smallest inside margin 0.772 in; smallest outside margin 0.579 in; every chapter and appendix starts on a right-hand page; no large gaps |
| Includes | Every `@include` resolves (the build fails otherwise) |
| Visual proof | Covers, sample chapter, appendix and More Books pages inspected |
| Paperback covers | Dark and white, 12.879 x 9.250 in, 0.629 in spine (268 x 0.002347, color paper); barcode area clear |
| eBook covers | Dark and white, 1600 x 2560 px, real app screenshots, no logos |
| eBook size | 6.2 MB (screenshots reduced to 1200 px wide for Kindle) |
| Spelling | codespell clean; US English |
| Privacy | No personal email address in the book, code or sessions |
