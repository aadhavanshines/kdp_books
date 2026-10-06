# Habit Tracker

Track daily habits and see current and best streaks. Flask + SQLite, plain HTML/CSS/JS.

## Run
    python -m venv .venv && . .venv/bin/activate
    pip install -r requirements.txt
    python app.py          # http://localhost:5000 (set PORT to change)

Data is stored in `habits.db`, created automatically. Set `DATABASE_PATH` to store it elsewhere.

## Test
    pytest

## API
- `GET /api/habits` – list habits with last 7 days and streaks
- `POST /api/habits` `{"name": "..."}` – 201, 400, or 409
- `PATCH /api/habits/<id>` `{"name": "..."}` – rename; 200, 400, 404, or 409
- `DELETE /api/habits/<id>` – 204 or 404
- `POST /api/habits/<id>/toggle` `{"date": "YYYY-MM-DD"}` – 200; future dates give 400

## Deploy (Render or Railway)
The app runs under gunicorn: `gunicorn "app:create_app()"` (see `Procfile`, `render.yaml`).

**The database is a file, so it needs a persistent disk.** Without one, all data is
erased on every redeploy or restart.
- Render: use `render.yaml` (Blueprint). It mounts a disk at `/var/data` and sets
  `DATABASE_PATH=/var/data/habits.db`. Disks need a paid instance.
- Railway: add a Volume mounted at `/data` and set the variable `DATABASE_PATH=/data/habits.db`.
- Run exactly one instance (SQLite can't be shared between machines).
- There are no user accounts: everyone with the URL sees and edits the same habits.

## Releasing
We use [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`) and keep a
[Keep a Changelog](https://keepachangelog.com/) `CHANGELOG.md`.

**Choosing the next version**
- **MAJOR** (2.0.0): breaking changes, e.g. an API endpoint or response format changes
  incompatibly, or existing data needs manual migration (there are no automatic migrations).
- **MINOR** (1.1.0): new backwards-compatible features.
- **PATCH** (1.0.1): backwards-compatible bug fixes only.

**Steps**
1. Make sure `master` is up to date and clean, and `pytest` passes.
2. Pick the new version `X.Y.Z` using the rules above.
3. Set `__version__ = "X.Y.Z"` in `app.py`. This is the only place the version lives;
   the page footer reads it.
4. In `CHANGELOG.md`, rename `[Unreleased]` contents into a new `## [X.Y.Z] - YYYY-MM-DD`
   section (Added / Changed / Deprecated / Removed / Fixed / Security), leave an empty
   `[Unreleased]` heading above it. If the repo has a GitHub remote, add `[X.Y.Z]` compare links at the bottom.
5. Commit: `git commit -am "Release X.Y.Z"`.
6. Tag: `git tag -a vX.Y.Z -m "Release X.Y.Z"`.
7. Push both: `git push origin master && git push origin vX.Y.Z`.
8. Optionally create a GitHub Release from the tag, using the changelog section as notes.
   Deploy hosts (Render/Railway) redeploy from `master`.
