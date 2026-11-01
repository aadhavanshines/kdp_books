# Vibe Coding Professional Mobile Apps

*Build Food Delivery, Shopping, Social and 10-Minute Grocery Apps for Android and iOS with AI, from First Prompt to Store Release, Plus a TV Streaming App Bonus*, by Aadhavan Muthurengan. Full-color book: $12.99 Kindle (KDP Select), $49.99 premium-color paperback.

Thirty chapters in seven parts: foundations, four apps (Platter food delivery, Cartly e-commerce, Lumo social photos, Minutely quick commerce), production (performance, accessibility, testing, payments, push, security, EAS, Google Play, App Store, after launch) and a bonus Android TV streaming app (Reelhouse), plus appendices A to E.

## Folders

| Folder | Contents |
| --- | --- |
| `manuscript/` | The book in Markdown. `@include` lines pull code and prompts from `code/` and `sessions/` at build time, so the printed code is the real code. |
| `code/` | The monorepo the sessions built: `apps/` (four Expo SDK 58 apps), `packages/ui`, `packages/api`, `server/`, and `tv/` (Reelhouse, react-native-tvos). Screenshots in each app's `screenshots/`. |
| `sessions/` | The exact prompt, JSON result and log of every Claude Code session (`run.sh` runs one). |
| `build/` | The pipeline: device frames and figures (`frames.py`, `make_figures.py`), diagrams, PDF interior, EPUB, covers, PDF check. |
| `research/` | Verified facts with sources (`facts.md`). |
| `metadata/` | KDP listing details. |
| `tests/` | `CHECKS.md`, the pre-publication report. |
| `dist/` | Upload-ready files: EPUB, eBook covers (dark and white), paperback interior PDF, paperback cover PDF. |

## Run the apps

```
cd code
npm install
npm run server                       # API on http://localhost:4000
npm run web -w apps/platter          # or cartly, lumo, minutely; also start/android/ios
npm run check                        # typecheck, lint and every test
cd tv && npm install && npm run check   # Reelhouse TV
```

Demo login: 9876543210, code 123456.

## Build the book

```
python3 build/make_figures.py   # device-framed figures from the screenshots
python3 build/build.py          # diagrams, covers, EPUB, interior PDF, cover PDF
python3 build/check_pdf.py dist/paperback-interior-6x9.pdf
python3 ../tools/white_covers.py mobile-pro
```
