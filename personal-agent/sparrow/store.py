"""Sparrow's state on disk: one SQLite file for jobs, approvals, pairing
and spending, so nothing is lost when the gateway restarts."""

from __future__ import annotations

import sqlite3
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY,
    kind TEXT NOT NULL,          -- 'remind' or 'task'
    message TEXT NOT NULL,
    next_run TEXT NOT NULL,      -- ISO time, with time zone
    repeat TEXT,                 -- NULL, 'daily', 'weekdays', 'every 2h'...
    route TEXT NOT NULL,         -- where to deliver: 'telegram:123'
    enabled INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS approvals (
    code TEXT PRIMARY KEY,
    action TEXT NOT NULL,        -- what to run if approved
    payload TEXT NOT NULL,       -- JSON arguments
    summary TEXT NOT NULL,       -- what the owner is asked
    route TEXT NOT NULL,         -- conversation that asked
    status TEXT NOT NULL DEFAULT 'pending',
    created TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS people (
    identity TEXT PRIMARY KEY,   -- 'telegram:555'
    name TEXT NOT NULL,
    status TEXT NOT NULL,        -- 'pending' or 'paired'
    code TEXT,
    created TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS spending (
    day TEXT NOT NULL,
    model TEXT NOT NULL,
    kind TEXT NOT NULL,
    cost_usd REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS kv (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
"""


class Store:
    def __init__(self, path: Path):
        path.parent.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(path, check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        self.db.executescript(SCHEMA)

    def run(self, sql: str, *args) -> sqlite3.Cursor:
        cursor = self.db.execute(sql, args)
        self.db.commit()
        return cursor

    def rows(self, sql: str, *args) -> list[sqlite3.Row]:
        return self.db.execute(sql, args).fetchall()

    def get(self, key: str, default: str | None = None) -> str | None:
        row = self.db.execute(
            "SELECT value FROM kv WHERE key = ?", (key,)
        ).fetchone()
        return row[0] if row else default

    def put(self, key: str, value: str) -> None:
        self.run("INSERT OR REPLACE INTO kv VALUES (?, ?)", key, value)
