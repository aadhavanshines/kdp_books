import os
import sqlite3
from datetime import date, datetime, timedelta

from flask import Flask, g, jsonify, render_template, request

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SCHEMA = """
CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE
);
CREATE TABLE IF NOT EXISTS completions (
    habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    day TEXT NOT NULL,
    PRIMARY KEY (habit_id, day)
);
"""


def compute_streaks(done_days, today):
    """Return (current, best) streaks for a set of date objects."""
    done = set(done_days)
    # Current: walk back from today, or from yesterday if today isn't done.
    d = today if today in done else today - timedelta(days=1)
    current = 0
    while d in done:
        current += 1
        d -= timedelta(days=1)
    # Best: longest run of consecutive days.
    best = run = 0
    prev = None
    for d in sorted(done):
        run = run + 1 if prev is not None and d - prev == timedelta(days=1) else 1
        best = max(best, run)
        prev = d
    return current, best


def create_app(db_path=None, today_func=date.today):
    app = Flask(__name__)
    # In production DATABASE_PATH must point at a persistent disk/volume,
    # otherwise the data is lost whenever the host redeploys.
    app.config["DB_PATH"] = (
        db_path
        or os.environ.get("DATABASE_PATH")
        or os.path.join(BASE_DIR, "habits.db")
    )
    os.makedirs(os.path.dirname(os.path.abspath(app.config["DB_PATH"])), exist_ok=True)
    app.config["TODAY"] = today_func

    def get_db():
        if "db" not in g:
            # timeout: wait for a competing writer (several gunicorn workers)
            # instead of failing with "database is locked".
            g.db = sqlite3.connect(app.config["DB_PATH"], timeout=10)
            g.db.row_factory = sqlite3.Row
            g.db.execute("PRAGMA foreign_keys = ON")
        return g.db

    @app.teardown_appcontext
    def close_db(_exc):
        db = g.pop("db", None)
        if db is not None:
            db.close()

    conn = sqlite3.connect(app.config["DB_PATH"], timeout=10)
    try:
        conn.execute("PRAGMA journal_mode = WAL")  # readers don't block the writer
        conn.executescript(SCHEMA)
        conn.commit()
    finally:
        conn.close()
    app.logger.info("Using database at %s", app.config["DB_PATH"])

    def current_today():
        """The user's own today: the date their browser sends, if plausible.

        The server may be in any timezone (e.g. UTC), so its date can differ
        from the user's. Real timezones span UTC-12..UTC+14, so a client date
        more than a day from the server's is bogus and is ignored.
        """
        server_today = app.config["TODAY"]()
        try:
            client = date.fromisoformat(request.headers.get("X-Client-Date", ""))
        except ValueError:
            return server_today
        if abs((client - server_today).days) > 1:
            return server_today
        return client

    def habit_json(row, today):
        rows = get_db().execute(
            "SELECT day FROM completions WHERE habit_id = ?", (row["id"],)
        ).fetchall()
        done = {date.fromisoformat(r["day"]) for r in rows}
        current, best = compute_streaks(done, today)
        days = []
        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            days.append({"date": d.isoformat(), "done": d in done})
        return {
            "id": row["id"],
            "name": row["name"],
            "days": days,
            "current_streak": current,
            "best_streak": best,
        }

    @app.get("/")
    def index():
        return render_template("index.html")

    @app.get("/api/habits")
    def list_habits():
        today = current_today()
        rows = get_db().execute("SELECT * FROM habits ORDER BY id").fetchall()
        return jsonify([habit_json(r, today) for r in rows])

    @app.post("/api/habits")
    def add_habit():
        data = request.get_json(silent=True)
        name = data.get("name") if isinstance(data, dict) else None
        if not isinstance(name, str):
            return jsonify(error="name is required"), 400
        name = name.strip()
        if not 1 <= len(name) <= 30:
            return jsonify(error="name must be 1 to 30 characters"), 400
        db = get_db()
        try:
            cur = db.execute("INSERT INTO habits (name) VALUES (?)", (name,))
            db.commit()
        except sqlite3.IntegrityError:
            return jsonify(error="a habit with that name already exists"), 409
        row = db.execute("SELECT * FROM habits WHERE id = ?", (cur.lastrowid,)).fetchone()
        return jsonify(habit_json(row, current_today())), 201

    @app.delete("/api/habits/<int:habit_id>")
    def delete_habit(habit_id):
        db = get_db()
        cur = db.execute("DELETE FROM habits WHERE id = ?", (habit_id,))
        db.commit()
        if cur.rowcount == 0:
            return jsonify(error="habit not found"), 404
        return "", 204

    @app.post("/api/habits/<int:habit_id>/toggle")
    def toggle(habit_id):
        db = get_db()
        row = db.execute("SELECT * FROM habits WHERE id = ?", (habit_id,)).fetchone()
        if row is None:
            return jsonify(error="habit not found"), 404
        data = request.get_json(silent=True)
        raw = data.get("date") if isinstance(data, dict) else None
        try:
            day = datetime.strptime(raw, "%Y-%m-%d").date()
        except (TypeError, ValueError):
            return jsonify(error="date must be YYYY-MM-DD"), 400
        today = current_today()
        if day > today:
            return jsonify(error="date cannot be in the future"), 400
        cur = db.execute(
            "DELETE FROM completions WHERE habit_id = ? AND day = ?",
            (habit_id, day.isoformat()),
        )
        if cur.rowcount == 0:
            db.execute(
                "INSERT INTO completions (habit_id, day) VALUES (?, ?)",
                (habit_id, day.isoformat()),
            )
        db.commit()
        return jsonify(habit_json(row, today)), 200

    return app


if __name__ == "__main__":
    # Local development only. In production run gunicorn (see Procfile).
    create_app().run(debug=False, port=int(os.environ.get("PORT", 5000)))
