"""Approvals: risky actions wait for the owner to say yes.

A tool that needs permission files a request and gets a short code back.
The owner replies "/approve K7P2QX" (or "/deny K7P2QX"); only then does
the gateway run the action, exactly as it was described."""

from __future__ import annotations

import json
import secrets
from datetime import datetime, timedelta

from .store import Store

ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no 0/O or 1/I
EXPIRES = timedelta(hours=24)


def new_code(length: int = 6) -> str:
    return "".join(secrets.choice(ALPHABET) for _ in range(length))


class Approvals:
    def __init__(self, store: Store):
        self.store = store

    def request(
        self,
        action: str,
        payload: dict,
        summary: str,
        route: str,
        now: datetime,
    ) -> str:
        # The same request twice gets the same code, not a second one
        for row in self.pending(now):
            if (
                row["action"] == action
                and json.loads(row["payload"]) == payload
            ):
                return row["code"]
        code = new_code()
        self.store.run(
            "INSERT INTO approvals (code, action, payload, summary, route,"
            " created) VALUES (?, ?, ?, ?, ?, ?)",
            code,
            action,
            json.dumps(payload, sort_keys=True),
            summary,
            route,
            now.isoformat(),
        )
        return code

    def pending(self, now: datetime) -> list:
        rows = self.store.rows(
            "SELECT * FROM approvals WHERE status = 'pending'"
        )
        live = []
        for row in rows:
            if now - datetime.fromisoformat(row["created"]) > EXPIRES:
                self.store.run(
                    "UPDATE approvals SET status = 'expired' "
                    "WHERE code = ?",
                    row["code"],
                )
            else:
                live.append(row)
        return live

    def decide(self, code: str, approve: bool, now: datetime):
        """Mark a pending request; return its row, or None if there is
        no such pending request (wrong, used or expired code)."""
        code = code.strip().upper()
        for row in self.pending(now):
            if row["code"] == code:
                status = "approved" if approve else "denied"
                self.store.run(
                    "UPDATE approvals SET status = ? WHERE code = ?",
                    status,
                    code,
                )
                return row
        return None
