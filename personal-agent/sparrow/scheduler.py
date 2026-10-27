"""Scheduled jobs: reminders and tasks at a time, once or repeating.

Times are written in a small fixed language that the model is told about
in the tool description, so parsing never needs guesswork:

    2026-10-28 09:00     in 30 minutes     tomorrow 07:30
    daily 08:00          weekdays 08:00    weekly mon 09:00
    every 2 hours        every 45 minutes
"""

from __future__ import annotations

import re
from datetime import datetime, timedelta

from .store import Store

DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
UNITS = {"minute": 1, "hour": 60, "day": 1440}


def at_time(day: datetime, hhmm: str) -> datetime:
    hour, minute = map(int, hhmm.split(":"))
    if not (0 <= hour < 24 and 0 <= minute < 60):
        raise ValueError(f"Bad time of day: {hhmm}")
    return day.replace(hour=hour, minute=minute, second=0, microsecond=0)


def next_after(repeat: str, after: datetime) -> datetime:
    """The first time this repeat rule fires strictly after `after`."""
    if m := re.fullmatch(r"every (\d+)m", repeat):
        return after + timedelta(minutes=int(m.group(1)))
    kind, *rest = repeat.split()
    hhmm = rest[-1]
    for days in range(0, 8):
        candidate = at_time(after + timedelta(days=days), hhmm)
        if candidate <= after:
            continue
        weekday = candidate.weekday()
        if (
            kind == "daily"
            or (kind == "weekdays" and weekday < 5)
            or (kind == "weekly" and DAYS[weekday] == rest[0])
        ):
            return candidate
    raise ValueError(f"Bad repeat rule: {repeat}")


def parse_when(text: str, now: datetime) -> tuple[datetime, str | None]:
    """Return (first run time, repeat rule or None)."""
    text = " ".join(text.lower().replace(",", " ").split())
    if m := re.fullmatch(r"(\d{4}-\d{2}-\d{2})[ t](\d{1,2}:\d{2})", text):
        day = datetime.fromisoformat(m.group(1)).replace(tzinfo=now.tzinfo)
        return at_time(day, m.group(2)), None
    if m := re.fullmatch(r"in (\d+) (minute|hour|day)s?", text):
        return now + timedelta(
            minutes=int(m.group(1)) * UNITS[m.group(2)]
        ), None
    if m := re.fullmatch(r"(today|tomorrow) (\d{1,2}:\d{2})", text):
        day = now + timedelta(days=m.group(1) == "tomorrow")
        when = at_time(day, m.group(2))
        if when <= now:
            raise ValueError(f"{text} is already in the past")
        return when, None
    if m := re.fullmatch(r"(daily|weekdays) (\d{1,2}:\d{2})", text):
        rule = f"{m.group(1)} {m.group(2)}"
        return next_after(rule, now), rule
    if m := re.fullmatch(r"weekly (\w{3}) (\d{1,2}:\d{2})", text):
        if m.group(1) not in DAYS:
            raise ValueError(f"Unknown day: {m.group(1)}")
        rule = f"weekly {m.group(1)} {m.group(2)}"
        return next_after(rule, now), rule
    if m := re.fullmatch(r"every (\d+) (minute|hour)s?", text):
        minutes = int(m.group(1)) * UNITS[m.group(2)]
        if minutes < 5:
            raise ValueError("Repeats must be at least 5 minutes apart")
        rule = f"every {minutes}m"
        return next_after(rule, now), rule
    raise ValueError(
        f"Can't read the time {text!r}. Use a form like "
        "'2026-10-28 09:00', 'in 30 minutes', 'tomorrow 07:30', "
        "'daily 08:00', 'weekdays 08:00', 'weekly mon 09:00' or "
        "'every 2 hours'."
    )


class Scheduler:
    def __init__(self, store: Store):
        self.store = store

    def add(
        self, kind: str, message: str, when: str, route: str, now: datetime
    ) -> tuple[int, datetime, str | None]:
        if kind not in ("remind", "task"):
            raise ValueError("kind must be remind or task")
        first, repeat = parse_when(when, now)
        cursor = self.store.run(
            "INSERT INTO jobs (kind, message, next_run, repeat, route) "
            "VALUES (?, ?, ?, ?, ?)",
            kind,
            message,
            first.isoformat(),
            repeat,
            route,
        )
        return cursor.lastrowid, first, repeat

    def list(self) -> list:
        return self.store.rows(
            "SELECT * FROM jobs WHERE enabled = 1 ORDER BY next_run"
        )

    def cancel(self, job_id: int) -> bool:
        return (
            self.store.run(
                "UPDATE jobs SET enabled = 0 WHERE id = ? AND enabled = 1",
                job_id,
            ).rowcount
            > 0
        )

    def due(self, now: datetime) -> list:
        return [
            job
            for job in self.list()
            if datetime.fromisoformat(job["next_run"]) <= now
        ]

    def done(self, job, now: datetime) -> None:
        """After a job ran: schedule its next run, or switch it off."""
        if job["repeat"]:
            following = next_after(job["repeat"], now)
            self.store.run(
                "UPDATE jobs SET next_run = ? WHERE id = ?",
                following.isoformat(),
                job["id"],
            )
        else:
            self.store.run(
                "UPDATE jobs SET enabled = 0 WHERE id = ?", job["id"]
            )
