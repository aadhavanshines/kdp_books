# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Habit tracker: Flask + SQLite (stdlib `sqlite3`) backend, plain HTML/CSS/JS frontend with no framework or build step. `SPEC.md` is the source of truth for features, streak rules and API; `README.md` has the endpoint summary.

## Commands

    python -m venv .venv && . .venv/bin/activate
    pip install -r requirements.txt
    python app.py                          # http://localhost:5000, PORT env var overrides
    pytest                                 # all tests
    pytest test_app.py -k <name>           # single test

Production runs `gunicorn "app:create_app()"` (`Procfile`, `render.yaml`); `DATABASE_PATH` env var sets the SQLite file location (must be on a persistent disk). CI is `.github/workflows/tests.yml`.

There is no linter or build configured. `habits.db` is created automatically on first run (gitignored).

## Architecture

All backend code is in `app.py`, built around an app factory `create_app(db_path=None, today_func=date.today)`. Tests rely on both parameters: a temp DB path and an injectable "server today", so never call `date.today()` directly inside the app; go through `app.config["TODAY"]`.

- **"Today" resolution (`current_today`)**: the browser sends its local date in the `X-Client-Date` header (set in `static/app.js`) so users in a different timezone from the server see the right day. The header is ignored if it is malformed or more than 1 day from the server's date. Any new endpoint that depends on "today" must use `current_today()`, not the server date.
- **Streaks**: `compute_streaks(done_days, today)` is a pure function. The current streak counts back from today, or from yesterday if today isn't done yet. The best streak is the longest consecutive run.
- **Data model**: `habits` (name is `UNIQUE COLLATE NOCASE`, which is how case-insensitive uniqueness is enforced via `IntegrityError` → 409) and `completions` (`habit_id`, `day` ISO text; composite PK). Foreign keys are enabled per connection with `PRAGMA foreign_keys = ON` so deleting a habit cascades. Schema is created with `CREATE TABLE IF NOT EXISTS` at app creation; there are no migrations.
- **Toggle** is a single endpoint that deletes the completion row if it exists, otherwise inserts it. It rejects dates after the resolved today with 400.
- `habit_json` builds the payload shared by list/add/toggle: the last 7 days (oldest first), `current_streak`, and `best_streak`.
- The frontend (`templates/index.html`, `static/app.js`, `static/style.css`) is a single page that talks to the JSON API.

## Tests

`test_app.py` uses Flask's test client with a temporary DB and a fixed `today_func`. A second fixture simulates a UTC server and a user in a different timezone, sending `X-Client-Date` headers. Spec requires coverage of streaks crossing a month boundary.
