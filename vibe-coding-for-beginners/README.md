# Vibe Coding for Beginners

**Build Real Apps with Claude Code, from Your First Prompt to Tested, Deployed Software**

by **Aadhavan Muthurengan**

A beginner-to-advanced guide (about 53,000 words plus code listings; 275 pages in 6 x 9 paperback, with 15 diagrams and 6 app screenshots). Readers build six real apps with Claude Code, including a mobile app for Android and iPhone, then learn UI/UX and accessibility, CLAUDE.md, skills, subagents, hooks, MCP, app store shipping, the software development lifecycle, automation, deployment, security, and best practices.

## What makes it different: everything is real and tested

- **Real sessions.** Every prompt in the project chapters was run in Claude Code, and the replies in the book are Claude's own words (shortened, not rewritten). The full log of prompts, replies, turns, and costs is in [`tests/claude-sessions/`](tests/claude-sessions/).
- **Real code.** The finished apps are in [`projects/`](projects/). Code listings in the book are pulled directly from these files at build time (`@include` in the manuscript), so the book can't drift from the tested code.
- **Independent tests.** [`tests/`](tests/) checks every project in a real browser (Playwright), on phone-sized screens, with the axe-core accessibility checker, across time zones, through the real Anthropic SDK with a mocked network, and by running the production server.

| Project | Folder | Claude's own tests | Independent checks |
| --- | --- | --- | --- |
| 0. Hello page (Ch. 4) | `projects/00-hello` | n/a | browser |
| 1. Tip calculator (Ch. 5) | `projects/01-tip-calculator` | checked math in session | browser |
| 2. To-do app (Ch. 6 and 8) | `projects/02-todo-app` (Chapter 6 version in `before-redesign/`) | simulated browser in session; real-browser script after Ch. 8 | browser, 2 time zones, touch targets, axe-core |
| 3. Expense tracker (Ch. 9) | `projects/03-expense-tracker` | 26 pytest tests | CLI end to end |
| 4. Habit tracker (Ch. 10 to 23) | `projects/04-habit-tracker` (released as 1.1.0 in Ch. 22) | 44 pytest tests | browser, UTC-server bug, production server, rename and version |
| 5. Study Buddy (Ch. 14) | `projects/05-study-buddy` | 24 pytest tests | real SDK request shape, errors, browser, rate limit |
| 6. Sip mobile app (Ch. 20 and 21) | `projects/06-sip` (Expo, React Native, TypeScript) | 32 Jest tests in 4 time zones; TypeScript check | web build on a phone-sized screen: logging, settings, local midnight, touch targets, dark mode, axe-core; Android prebuild permissions |

Run all checks:

```bash
pip install flask pytest anthropic playwright gunicorn
python -m playwright install chromium   # or set CHROMIUM_PATH to an existing Chromium
python -m pytest tests
```

The Sip tests need the app's web build first; they're skipped otherwise:

```bash
cd projects/06-sip && npm install && npx tsc --noEmit && npm test && npx expo export --platform web && cd ../..
AXE_PATH=/path/to/node_modules/axe-core/axe.min.js python -m pytest tests   # AXE_PATH enables the accessibility scans
```

Native Android and iOS builds were not run for the book (they need developer accounts and Expo's build service); `projects/06-sip/RELEASE-CHECKLIST.md` lists those steps.

## Ready-to-Upload Files (`dist/`)

| File | KDP format | Upload as |
| --- | --- | --- |
| `vibe-coding-for-beginners.epub` | Kindle eBook | Manuscript (passes EPUBCheck) |
| `ebook-cover.jpg` | Kindle eBook | Cover, 1600 x 2560 px |
| `paperback-interior-6x9.pdf` | Paperback | Manuscript: 6 x 9 in, no bleed, all fonts embedded, chapters start on right-hand pages |
| `paperback-cover.pdf` | Paperback | Full-wrap cover with 0.125 in bleed, 300 DPI |
| `paperback-cover-preview.png` | — | Preview of the full wrap cover |
| `build-info.json` | — | Page count, word count, and spine width |

Listing details (title, description, keywords, categories, pricing, AI disclosure, and a trademark note about the subtitle) are in [`metadata/kdp-listing.md`](metadata/kdp-listing.md). The upload steps are the same as for *Prompt Engineering Mastery* (see that folder's README).

## Rebuilding

```bash
pip install reportlab ebooklib pillow
python3 build/build.py
```

To refresh the app screenshots (needs Playwright and Chromium): `python3 build/screenshots.py` (the Sip screenshot needs the web build; see above).

## Before You Publish

- Read the whole manuscript; you are the author and responsible for its accuracy.
- Claude Code changes quickly. The book is written for Claude Code 2.1 (October 2026) and points readers to `/help` and the official docs for changes.
- If you change anything, rebuild so the page count, contents, and spine width stay correct.
