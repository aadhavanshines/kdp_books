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
